# 02 — Arquitetura Atual

**Projeto:** `everwin-landing-page`  
**Data:** 2026-03-19

---

## 1. Visão Arquitetural Geral

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              React 18 + Vite SPA                      │    │
│  │  ┌─────────────┐  ┌────────────────────────────┐   │    │
│  │  │   Landing   │  │   Prop Portal System       │   │    │
│  │  │   Pages     │  │   (Auth + Dashboard)       │   │    │
│  │  │  /prop/land │  │  /prop/admin/*             │   │    │
│  │  │  /legal/*   │  │  /prop/client/*            │   │    │
│  │  └─────────────┘  └────────────────────────────┘   │    │
│  │                                                      │    │
│  │  ┌────────────────────────────────────────────┐    │    │
│  │  │  PropSystemContext (React Context)          │    │    │
│  │  │  - state: users, plans, accounts, logs     │    │    │
│  │  │  - API client com JWT + refresh token       │    │    │
│  │  │  - Fallback: localStorage (LEGADO)          │    │    │
│  │  └────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP REST (JSON)
                      │ Bearer Token (JWT)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVER (Node.js)                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Express 5 + Helmet + CORS               │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │    │
│  │  │  Auth    │  │  CRUD    │  │  Rules Engine    │  │    │
│  │  │  Routes  │  │  Routes  │  │  (evaluate)      │  │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Middleware: requireAuth, requireRole         │   │    │
│  │  │  Security: bcrypt, AES-256-GCM, JWT          │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         SQLite (better-sqlite3)                     │    │
│  │  Tables: users, plans, accounts, performance_points │    │
│  │          audit_logs, refresh_tokens                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Entrypoints

### 2.1 Frontend
| Entrypoint | Arquivo | Inicializa |
|------------|---------|------------|
| Dev frontend | `npm run dev:client` → `vite` | `src/main.tsx` → `src/App.tsx` → `src/Routes.tsx` |
| Build frontend | `npm run build` → `vite build` | Gera `dist/` |

### 2.2 Backend
| Entrypoint | Arquivo | Inicializa |
|------------|---------|------------|
| Dev backend | `npm run dev:server` → `node server/index.js` | `server/index.js` → `bootstrap()` → `initDatabase()` |
| Prod backend | `npm run start:server` → `node server/index.js` | Mesmo entrypoint |

### 2.3 Dev completo
| Comando | Inicializa |
|---------|------------|
| `npm run dev` | Executa `concurrently` com `dev:client` + `dev:server` |

---

## 3. Fluxo Principal de Execução

### 3.1 Fluxo de Autenticação

```
1. Usuário acessa /prop/login
2. Preenche email + senha
3. Frontend: loginApi() → POST /api/auth/login
4. Backend: verifica email + bcrypt → gera JWT access + refresh
5. Backend: salva refresh_token hash no DB
6. Frontend: recebe tokens → salva em localStorage
7. Frontend: PropSystemProvider.bootstrapping = false
8. Usuário redirecionado para dashboard (admin ou client)
```

**Refresh Token Flow:**
```
1. Request falha com 401
2. Frontend: refreshTokens() → POST /api/auth/refresh
3. Backend: verifica refresh_token → gera novo access + refresh
4. Backend: revoga refresh_token antigo
5. Frontend: retry do request original
```

### 3.2 Fluxo de Criação de Conta (Admin)

```
1. Admin acessa /prop/admin/accounts
2. Clica "Nova Conta"
3. Preenche: userId, planId, accountId, platformLogin, platformPassword, startDate
4. Frontend: createAccountApi() → POST /api/accounts
5. Backend: valida Zod → verifica user, plan, accountId único
6. Backend: encryptSecret(password) → AES-256-GCM
7. Backend: cria account + primeiro performance_point
8. Backend: audit() → LOG
9. Frontend: atualiza contexto → exibe nova conta
```

### 3.3 Fluxo de Avaliação de Regras

```
1. Admin acessa /prop/admin/dashboard
2. Clica "Reavaliar Regras"
3. Frontend: runRulesEvaluationApi() → POST /api/rules/evaluate
4. Backend: para cada account:
   a. find plan
   b. evaluateAccount(account, plan, now)
   c. saveAccount(evaluated)
   d. upsertPerformancePoint()
5. Backend: audit() → RUN_RULES_EVALUATION
6. Frontend: refreshAll() → exibe estados atualizados
```

---

## 4. Fronteiras entre Módulos

### 4.1 Frontend ↔ Backend
- **Protocolo:** HTTP REST (JSON)
- **Autenticação:** Bearer JWT
- **Validação:** Zod no backend, TypeScript types no frontend
- **Ponto de integração:** `src/modules/prop-system/api.ts` ↔ `server/index.js`

### 4.2 Landing Page ↔ Portal Prop
- **Sem integração direta** — são módulos completamente separados
- Landing (`/prop/landing`) é puramente visual/marketing
- Portal (`/prop/*`) é a aplicação operacional
- Ligação: CTA da landing leva ao checkout ou login do portal

### 4.3 Frontend ↔ localStorage (Fallback)
- **Código:** `src/modules/prop-system/storage.ts`
- **Status:** LEGADO — ativo apenas quando API indisponível
- **Dados:** seed de users, plans, accounts com performance series fake

---

## 5. Camadas do Sistema

### 5.1 Camada de Apresentação (Frontend)
```
Routes.tsx
├── App.tsx (layout raiz)
├── Home.tsx
├── PropPage.tsx + PropCheckout.tsx (landing)
├── Legal Pages (/legal/*)
└── PropSystemProvider
    ├── PropPortalEntry
    ├── PropLoginPage
    ├── PropPortalLayout (sidebar + header)
    │   ├── AdminDashboardPage
    │   ├── AdminUsersPage
    │   ├── AdminAccountsPage
    │   ├── ClientDashboardPage
    │   └── ClientAccountsPage
    └── PropNotFoundPage
```

### 5.2 Camada de Negócio (Frontend)
```
rules.ts
├── buildRiskSnapshot()
├── evaluateAccount()
├── buildAccountAnalytics() → everwinEdgeScore
├── buildPortfolioEquitySeries()
├── appendPerformancePoint()
└── UI helpers: currencyBRL, getStatusVariant, statusToLabel
```

### 5.3 Camada de API (Backend)
```
server/index.js
├── /api/health
├── /api/auth/login, refresh, logout, me
├── /api/plans
├── /api/users (CRUD + status)
├── /api/accounts (CRUD + status)
├── /api/rules/evaluate
├── /api/audit-logs
└── /api/analytics/account/:id
```

### 5.4 Camada de Dados (Backend)
```
server/db.js
├── Schema creation (CREATE TABLE IF NOT EXISTS)
├── Seeds (users, plans, accounts)
├── Mappers (mapUserRow, mapPlanRow, mapAccountRow)
└── Queries (getPlans, getAccounts, getPerformanceSeries)
```

### 5.5 Camada de Segurança (Backend)
```
server/security.js
├── hashPassword / verifyPassword (bcrypt)
├── signAccessToken / verifyAccessToken (JWT)
├── signRefreshToken / verifyRefreshToken (JWT)
├── sha256 (token hash)
└── encryptSecret / decryptSecret (AES-256-GCM)
```

---

## 6. Componentes Críticos

| Componente | Arquivo | Criticidade | Risco |
|------------|---------|-------------|-------|
| PropSystemProvider | `context.tsx` | CRÍTICA | Falha aqui quebra toda a app |
| API Client | `api.ts` | CRÍTICA | Sem ele, sem comunicação com backend |
| Rules Engine | `rules.ts` + `rules.js` | CRÍTICA | Divergência = inconsistência de estado |
| Express Router | `server/index.js` | CRÍTICA | Todas as rotas concentradas aqui |
| SQLite Init | `server/db.js` | CRÍTICA | Sem DB, sem backend |
| Auth Middleware | `middleware/auth.js` | CRÍTICA | Segurança do sistema |

---

## 7. Componentes Acoplados

1. **Rules Engine duplicada** — existe em `src/rules.ts` E `server/rules.js`
   - Risco: mudanças em um lado não se refletem no outro
   - Divergência pode causar inconsistência entre frontend e backend

2. **Types compartilhados** — `src/modules/prop-system/types.ts` é usado por:
   - Frontend (client)
   - Backend (server/) — lido manualmente, não importado
   - API client (`api.ts`)

3. **Storage localStorage** — `storage.ts` ainda existe como fallback
   - Acoplado com `context.tsx` (não usado ativamente)

---

## 8. Áreas Frágeis

| Área | Fragilidade | Mitigação Atual |
|------|-------------|-----------------|
| Engine duplicada | Frontend e backend podem divergir | Nenhuma — risco real |
| SQLite em arquivo | Arquivo local, sem backup automático | Nenhuma |
| Secrets no .env example | Fallbacks de dev em código | Verificado apenas em prod |
| Sem testes | Zero cobertura de regressão | Nenhuma |
| Sem rate limiting | API exposta a brute force | Nenhuma |
| Sem CORS configurável dinâmica | CORS fixo por env var | Apenas 1 origem |

---

## 9. Áreas Bem Definidas

| Área | Pontos Fortes |
|------|---------------|
| **Separação de Concerns** | Context, API, Rules, Types bem separados |
| **Validação Zod** | Backend valida todo input com schemas |
| **RBAC** | Guards de rota + middleware de role |
| **Audit Trail** | Toda ação crítica logada em `audit_logs` |
| **Credential Encryption** | AES-256-GCM para senhas de plataforma |
| **TypeScript Types** | Domínio bem tipado em `types.ts` |
| **React Context** | Estado centralizado e previsível |

---

## 10. Fluxograma Textual — Ciclo de Vida de uma Conta

```
[ADMIN CRIA CONTA]
    │
    ▼
pending_payment → awaiting_account_creation
    │
    ▼
active (fase 1)
    │
    ├──► DLL atingido ──► paused
    │                       │
    │                       ├──► DLL liberado ──► active
    │                       │
    │                       └──► 7 dias cooldown ──► awaiting_account_creation
    │
    ├──► Target + Days OK ──► fase 2
    │                           │
    │                           └──► Target + Days OK ──► passed ──► approved_for_funded
    │
    ├──► Hard Drawdown ──► failed_drawdown ──► 7 dias cooldown ──► awaiting_account_creation
    │
    └──► Timeout ──► failed_timeout ──► 7 dias cooldown ──► awaiting_account_creation
```
