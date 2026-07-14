# 05 — Estudo da Codebase

**Projeto:** `everwin-landing-page`  
**Data:** 2026-03-19

---

## 1. O Que Entendemos com Segurança

### 1.1 Arquitetura de Estado
- `PropSystemContext` (`context.tsx`) é a **única fonte de verdade** para o estado do frontend
- Carregamento: `useEffect` no mount → `fetchMeApi()` → `loadStateForUser()`
- Refresh: função `refreshAll()` chamada após cada mutação
- Erro: contexto limpa estado ecai para não autenticado

### 1.2 Fluxo de Dados API
```
Request → api.ts request() → Bearer token → fetch()
    ├──► 401 + retry → refreshTokens() → retry
    └──► Response → T (typed)
```

### 1.3 Engine de Regras
- **3 funções principais:**
  1. `buildRiskSnapshot()` — calcula métricas de risco atuais
  2. `evaluateAccount()` — determina próximo estado da conta
  3. `buildAccountAnalytics()` — deriva métricas derivadas (Edge Score)

### 1.4 Modelo de Dados
- 6 tabelas bem definidas com FKs e índices
- Seed automático na inicialização do DB
- Mappers com conversão snake_case → camelCase

### 1.5 Auth Flow
- Login → access token (15m) + refresh token (7d)
- Refresh rotation: token antigo revogado
- Access token verificado no middleware via JWT

---

## 2. O Que Ainda Está Ambíguo

### 2.1 Propósito do Checkout
O formulário em `/prop/landing/checkout` (3-etapas) é um fluxo de **candidatura visual** ou deveria **criar um usuário no sistema**?

**Evidência:**
- `PropCheckout.tsx` tem campos e validação
- Nenhum endpoint POST para criar candidato
- `createClientUserApi` existe mas só é usado pelo admin
- DOC.md menciona "candidatura/entrevista" como conceito

**Conclusão ambígua:** O checkout parece ser um **form draft** que não foi conectado ao backend.

### 2.2 Razão da Engine Duplicada
Não há justificativa clara no código para وجود `rules.ts` (frontend) E `rules.js` (backend).

**Hipótese:** 
1. Desenvolvimento começou no frontend (MVP com localStorage)
2. Backend foi adicionado depois, copiando a lógica
3. Nunca foi refatorado para shared lib

### 2.3 Escopo do Client Dashboard
O portal do cliente parece completo para **visualização**, mas há ações que ele não pode fazer (reset, payout, revisão) — essas ações existem como conceito mas sem implementação.

---

## 3. O Que Precisa de Validação Manual

| Item | Pergunta | Como Validar |
|------|----------|--------------|
| Cooldown automático | O cooldown realmente expira quando o timer chega? Ou só quando "Reavaliar Regras"? | Testar com conta em cooldown |
| Criptografia de credenciais | Credenciais descriptografadas corretamente no frontend? | Verificar `decryptSecret()` + exibição no ClientAccounts |
| Performance do SQLite | Com 1000+ contas, o SQLite aguentaria? | Load test |
| JWT em múltiplas abas | Se token é revogado, abas abertas ficam consistentes? | Testar em múltiplas abas |

---

## 4. O Que Deve Ser Preservado

| Área | Por que Preservar |
|------|-------------------|
| `src/modules/prop-system/types.ts` | Domínio bem tipado, centralizado |
| `src/modules/prop-system/rules.ts` | Lógica de negócio correta |
| `server/db.js` (schema) | Modelo de dados bem estruturado |
| `server/security.js` | Implementação sólida de crypto |
| `src/modules/prop-system/api.ts` | API client bem feito com retry |
| `context.tsx` | Padrão React Context correto |
| UI components em `src/components/ui/` | Componentes reutilizáveis |
| Audit trail | Boa prática de governança |

---

## 5. O Que Pode Ser Refatorado

| Área | Refatoração Recomendada |
|------|------------------------|
| `rules.ts` + `rules.js` | Extrair para `packages/rules/` ou usar apenas backend |
| `storage.ts` | Remover — não é mais usado |
| `server/index.js` (538 linhas) | Dividir em `routes/auth.js`, `routes/accounts.js`, `routes/admin.js` |
| Rotas de checkout | Decidir: conectar ao backend ou remover |
| Mappers em `db.js` | Mover para `mappers/` dedicado |
| Seed data | Mover para `seeds/` dedicado |
| Sem testes | Adicionar Jest/Vitest |

---

## 6. Módulos Centrais

### 6.1 Core do Frontend
```
PropSystemContext (254 linhas)
├── useEffect (boot)
├── login/logout
├── CRUD operations
├── runRulesEvaluation
└── State management
```

### 6.2 Core do Backend
```
server/index.js (538 linhas)
├── Auth routes (login, refresh, logout, me)
├── User CRUD
├── Account CRUD + status
├── Rules evaluation
├── Analytics
└── Audit logs
```

### 6.3 Engine de Regras
```
buildRiskSnapshot() — 27 linhas
├── profitPct
├── maxAllowedLoss
├── dailyLossLimit
├── remainingDrawdownBeforeBreach
├── remainingDailyLossBeforePause
└── Flags: isDailyLimitBreached, isHardBreach, isTimeout, isPhaseTargetMet

evaluateAccount() — 58 linhas
├── Terminal status check
├── Cooldown expiration
├── Hard breach → failed_drawdown
├── Timeout → failed_timeout
├── DLL → paused/active
└── Target met → phase progression or passed
```

---

## 7. Hotspots de Manutenção

| Arquivo | Linhas | Hotspot | Razão |
|---------|--------|---------|-------|
| `server/index.js` | 538 | **ALTO** | Muitas responsabilidades |
| `context.tsx` | 254 | **MÉDIO** | Estado grande mas bem organizado |
| `db.js` | 354 | **MÉDIO** | Schema + seeds + mappers juntos |
| `rules.ts` | 224 | **MÉDIO** | Lógica complexa |
| `rules.js` | 158 | **MÉDIO** | Duplicado de rules.ts |

---

## 8. Código Morto Aparente

| Arquivo/ Código | Evidência |
|------------------|-----------|
| `storage.ts` | Código completo de seed + localStorage — nunca importado em `context.tsx` |
| `makeId()` export em `storage.ts` | Exportado mas nunca usado fora |
| `fetchAuditLogsApi()` em `api.ts` | Definido, exportado, usado em `context.tsx` linha 68 |
| Rotas legadas `/prop-old`, `/prop/checkout` | Apenas redirect, mas código ainda existe |
| `toNumber()` e `safeJsonParse()` em `utils.js` | Nunca usados no código |

---

## 9. Integrações Sensíveis

| Integração | Risco | Observação |
|------------|-------|------------|
| JWT verification | **ALTO** | Se secret vazar, todos os tokens podem ser forjados |
| bcrypt | **BAIXO** | 12 salt rounds é seguro |
| AES-256-GCM para credenciais | **MÉDIO** | Seguro mas dependent de secret em env |
| CORS | **BAIXO** | Whitelist configurável por env |
| SQLite file access | **ALTO** | Arquivo local sem proteção |

---

## 10. Responsabilidades Mal Distribuídas

| Situação | Problema |
|----------|----------|
| `server/index.js` com 538 linhas | Monólito — rotas, lógica e DB tudo junto |
| `db.js` com 354 linhas | Schema + seeds + mappers + getDb juntos |
| Engine em dois lugares | Manutenção duplicada garantida |
| Checkout sem backend | Promessa de feature sem entrega |

---

## 11. Conclusão do Estudo

**O que é sólido:**
- Domínio de negócio bem definido em tipos
- Engine de regras matematicamente correta
- Auth com JWT bem implementado
- Criptografia de credenciais
- Auditoria
- RBAC

**O que é frágil:**
- Engine duplicada
- Sem testes
- Sem CI
- Server como monólito
- Checkout desconectado
- SQLite sem backup

**Recomendação:** Priorizar extração da engine de regras para lib compartilhada antes de qualquer expansão de features.
