# 00 — Contexto Mestre do Projeto

**Projeto:** `everwin-landing-page`  
**Data:** 2026-03-19  
**Versão:** 1.0

---

## Resumo Executivo

O **Everwin Prop System** é uma plataforma de **Prop Trading** (Proprietary Trading) que consiste em duas partes principais:

1. **Landing Page de Marketing** (`/prop/landing`) — páginas de captura e informação
2. **Portal de Gestão** (`/prop/admin/*`, `/prop/client/*`) — sistema operacional completo

O sistema permite a empresas de prop trading gerenciar contas de avaliação de traders, monitorar risco, avaliar performance e processar payouts.

**Stack atual:**
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express 5 + SQLite (better-sqlite3)
- **Auth:** JWT (access + refresh) + bcrypt + AES-256-GCM
- **Domínio:** Engine de regras proprietária para avaliação de traders

---

## Arquitetura Atual

```
┌─────────────────────┐     HTTP/REST      ┌─────────────────────┐
│  React SPA (Vite)   │ ◄───────────────► │  Express API         │
│                     │   Bearer JWT      │  (porta 8787)        │
│  - Landing Page     │                   │  - Auth              │
│  - Portal Admin     │                   │  - Accounts CRUD     │
│  - Portal Client    │                   │  - Rules Engine      │
│  - Legal Pages      │                   │  - Analytics         │
└─────────────────────┘                   └──────────┬──────────┘
                                                        │
                                               ┌────────▼────────┐
                                               │  SQLite DB      │
                                               │  - users        │
                                               │  - accounts     │
                                               │  - plans        │
                                               │  - audit_logs   │
                                               │  - perf_points  │
                                               └─────────────────┘
```

### Entry Points
| Entrypoint | Comando | Porta |
|------------|---------|-------|
| Dev Frontend | `npm run dev:client` → `vite` | 5173 |
| Dev Backend | `npm run dev:server` → `node server/index.js` | 8787 |
| Dev Completo | `npm run dev` | Ambos |
| Build | `npm run build` | Gera `dist/` |

---

## Módulos Principais

### 1. Landing Page (`src/pages/`, `src/sections/`)
- Homepage, páginas company, affiliates
- Página Prop (`/prop/landing`) com hero, planos, regras, FAQ
- Checkout (`/prop/landing/checkout`) — **form visual, não conectado**
- 13 páginas legais em `/legal/*`

### 2. Portal Admin (`/prop/admin/*`)
- **Dashboard:** KPIs, equity chart, risk alerts, rankings, audit
- **Users:** CRUD de usuários clientes
- **Accounts:** CRUD completo de contas de avaliação

### 3. Portal Client (`/prop/client/*`)
- **Dashboard:** Suas contas, métricas, performance
- **Accounts:** Lista de contas com credenciais

### 4. Engine de Regras (`rules.ts` + `rules.js`)
- **buildRiskSnapshot:** Calcula métricas de risco
- **evaluateAccount:** Determina próximo estado
- **buildAccountAnalytics:** Deriva Everwin Edge Score

### 5. Backend API (`server/index.js`)
- `/api/auth/*` — login, logout, refresh, me
- `/api/users/*` — CRUD
- `/api/accounts/*` — CRUD + status
- `/api/plans` — lista de planos
- `/api/rules/evaluate` — reavaliação manual
- `/api/audit-logs` — trilha de auditoria
- `/api/analytics/account/:id` — analytics por conta

---

## Fluxos Principais

### Fluxo de Avaliação de Conta
```
admin cria conta → status: awaiting_account_creation
    │
admin ativa → status: active (fase 1)
    │
    ├──► DLL atingido ──► paused ──► DLL liberado ──► active
    │
    ├──► Target + dias OK ──► fase 2 ──► Target + dias OK ──► passed
    │
    ├──► Hard Drawdown ──► failed_drawdown ──► cooldown (7 dias)
    │
    └──► Timeout ──► failed_timeout ──► cooldown (7 dias)
```

### Fluxo de Auth
```
login → access token (15m) + refresh token (7d)
    │
    ├──► access expira ──► refresh automático
    │
    └──► logout ──► refresh token revogado
```

---

## Workers e Automação

| Recurso | Status | Observação |
|---------|--------|------------|
| Cron Jobs | **NÃO EXISTE** | Tudo manual |
| Background Workers | **NÃO EXISTE** | Síncrono via HTTP |
| Message Queue | **NÃO EXISTE** | — |
| Auto-evaluation | **MANUAL** | Admin clica "Reavaliar Regras" |

---

## Persistência

### Tabelas Existentes (6)
1. `users` — admin e clientes
2. `plans` — templates de planos (4 seed plans BRL)
3. `accounts` — contas de avaliação
4. `performance_points` — série temporal de PnL
5. `audit_logs` — trilha de auditoria
6. `refresh_tokens` — tokens de auth

### Tabelas Faltando
- `candidates` — candidaturas (checkout não salva)
- `term_acceptances` — aceite de termos versionados
- `payout_requests` — solicitações de saque
- `payout_transactions` — transações de payout
- `notifications` — notificações
- `job_executions` — status de jobs

### Backup
**NÃO EXISTE** — arquivo SQLite local sem backup automático.

---

## Observabilidade

| Aspecto | Status |
|---------|--------|
| Audit trail | ✅ Funcional — mas incompleto |
| HTTP logging | ✅ Morgan no stdout |
| Error logging | ⚠️ Parcial — console.error |
| Error boundaries React | ❌ Ausente |
| Métricas de negócio | ❌ Ausente |
| Alertas | ❌ Ausente |
| Notificações | ❌ Ausente |

---

## O Que Funciona Hoje

| Área | Status | Notas |
|------|--------|-------|
| Landing page | **COMPLETO** | Todas as páginas, i18n, animações |
| Auth JWT | **FUNCIONAL** | Access + refresh com rotation |
| Admin dashboard | **FUNCIONAL** | KPIs, risk, analytics |
| Admin CRUD accounts | **FUNCIONAL** | Create, read, update, status |
| Admin CRUD users | **FUNCIONAL** | Create, block/unblock |
| Client portal (view) | **FUNCIONAL** | Vê suas contas e métricas |
| Engine de regras | **FUNCIONAL** | DLL, drawdown, timeout, phase |
| Everwin Edge Score | **FUNCIONAL** | Métrica proprietária |
| Auditoria | **FUNCIONAL** | Logs de ações principais |
| Credenciais criptografadas | **FUNCIONAL** | AES-256-GCM |

---

## O Que Falta (Gaps Principais)

### P0 — Crítico
1. **Checkout não conecta ao backend** — formulário visual sem persistência
2. **Zero testes** — sem cobertura de regressão
3. **Sem CI/CD** — sem pipelines
4. **Sem linting** — sem ESLint/Prettier
5. **Sem rate limiting** — API exposta
6. **Sem cron jobs** — tudo manual
7. **Sem backup do DB** — risco de perda de dados
8. **Engine duplicada** — TS e JS sincronizados manualmente
9. **Sem migrations** — mudanças de schema arriscadas

### P1 — Muito Importante
1. Sistema de candidaturas conectado
2. Notificações (email/in-app)
3. Audit completo (falhas de login, logout)
4. Error boundaries + loading states
5. Filtros e busca nas tables admin
6. Portal client com timeline e ações (reset, payout)
7. CRUD de planos via admin

### P2 — Importante
1. Dashboard de operações
2. CRM de payout
3. Alertas operacionais
4. Workflow de approval
5. Documentação OpenAPI
6. Log estruturado

---

## Riscos Críticos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|-------------|---------|-----------|
| Divergência de regras TS × JS | **CERTA** sem ação | ALTO | Extrair para lib compartilhada |
| Perda de dados | **MÉDIA** (sem backup) | CRÍTICO | Implementar backup |
| Regressão sem testes | **CERTA** | ALTO | Adicionar Jest/Vitest |
| Credenciais expostas | **MÉDIA** | CRÍTICO | Migrar para vault |
| Acessos não autorizados | **ALTA** (sem rate limit) | ALTO | Adicionar rate limiting |

---

## Reaproveitável

| Área | Por que |
|------|---------|
| Engine de regras | Lógica correta, só precisa extrair |
| Types (`types.ts`) | Domínio bem tipado e centralizado |
| API client (`api.ts`) | Padrão fetch + JWT bem implementado |
| PropSystemContext | Estado bem gerenciado |
| Audit trail | Modelo de governança sólido |
| Criptografia | bcrypt + AES-256-GCM adequados |
| RBAC | Guards funcionais |

---

## Próximos Passos Recomendados

### Imediato (Esta semana)
1. Adicionar ESLint + Prettier
2. Extrair engine de regras para `packages/rules`
3. Adicionar rate limiting
4. Adicionar audit de FAILED_LOGIN

### Curto prazo (Semanas 2-5)
5. Setup de testes (Jest/Vitest)
6. Sistema de migrations (Prisma/Drizzle)
7. Conectar checkout ao backend (candidates)
8. Refatorar server em módulos
9. Cron jobs: EOD, timeout, cooldown, backup

### Médio prazo (Semanas 6-12)
10. Observabilidade: logging estruturado, error boundaries
11. Portal client completo: timeline, reset, payout
12. Admin profissional: filtros, paginação, KPIs

### Longo prazo (Semana 13+)
13. Integração com corretora
14. KYC
15. BI/Data warehouse

---

## Arquivos de Documentação Gerados

| Arquivo | Conteúdo |
|---------|----------|
| `docs/context/01-project-inventory.md` | Inventário estrutural completo |
| `docs/context/02-current-architecture.md` | Arquitetura atual com fluxogramas |
| `docs/context/03-functional-map.md` | Features, fluxos, gaps funcionais |
| `docs/context/04-technical-map.md` | Stack, padrões, dívida técnica |
| `docs/context/05-codebase-study.md` | Estudo profundo da codebase |
| `docs/context/06-workers-and-automation.md` | Workers, jobs, automações |
| `docs/context/07-observability-and-logs.md` | Logs e monitoramento |
| `docs/context/08-data-and-persistence.md` | Modelo de dados |
| `docs/context/09-gap-analysis.md` | Current vs Target vs Gap por área |
| `docs/context/10-technical-roadmap.md` | Roadmap fases e prioridades |
| `docs/context/00-project-context-master.md` | **Este documento — ponto de entrada** |

---

## Contato / Dúvidas

Este documento é o ponto de entrada para entender o projeto.  
Para detalhes específicos, consulte os arquivos numerados correspondentes.
