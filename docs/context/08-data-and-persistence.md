# 08 — Persistência e Modelo de Dados

**Projeto:** `everwin-landing-page`  
**Data:** 2026-03-19

---

## 1. Bancos e Armazenamento

### 1.1 SQLite (Único Banco)

| Aspecto | Valor |
|---------|-------|
| **Driver** | `better-sqlite3` |
| **Path** | `server/data/prop-system.db` |
| **Mode** | WAL (Write-Ahead Logging) — `PRAGMA journal_mode = WAL` |
| **Foreign Keys** | Habilitadas — `PRAGMA foreign_keys = ON` |
| **Backup** | **NÃO EXISTE** |
| **Replica** | **NÃO EXISTE** |

### 1.2 localStorage (Frontend — Legacy)

| Aspecto | Valor |
|---------|-------|
| **Key** | `everwin-prop-system-v1` |
| **Session Key** | `everwin-prop-session-v1` |
| **Status** | **LEGADO** — não é mais usado ativamente |
| **Fallback para** | API server |

---

## 2. Schema do Banco

### 2.1 Tabela: `users`

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin','client')),
  status TEXT NOT NULL CHECK (status IN ('active','blocked')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);
```

**Índices:** `idx_users_email`

**Entidade:** Usuário do sistema (admin ou cliente)

### 2.2 Tabela: `plans`

```sql
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_size INTEGER NOT NULL,
  fee INTEGER NOT NULL,
  profit_target_phase1_pct REAL NOT NULL,
  profit_target_phase2_pct REAL NOT NULL,
  max_drawdown_pct REAL NOT NULL,
  daily_loss_limit_pct REAL NOT NULL,
  min_trading_days INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**Índices:** Nenhum

**Entidade:** Template de plano de avaliação

**Dados seed:**
| ID | Name | Account Size | Fee (BRL) |
|----|------|--------------|-----------|
| plan_brl_25k | BRL 25K | 25.000 | 497 |
| plan_brl_50k | BRL 50K | 50.000 | 874 |
| plan_brl_100k | BRL 100K | 100.000 | 1.397 |
| plan_brl_150k | BRL 150K | 150.000 | 1.497 |

### 2.3 Tabela: `accounts`

```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  account_id TEXT NOT NULL UNIQUE,
  platform_login TEXT NOT NULL,
  platform_password_enc TEXT NOT NULL,
  phase INTEGER NOT NULL CHECK (phase IN (1,2)),
  status TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  cooldown_until TEXT,
  initial_balance REAL NOT NULL,
  balance REAL NOT NULL,
  today_pnl REAL NOT NULL,
  days_traded INTEGER NOT NULL,
  max_drawdown_hit_pct REAL NOT NULL,
  notes TEXT,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

**Índices:** `idx_accounts_user_id`, `idx_accounts_status`

**Entidade:** Conta de avaliação de um trader

### 2.4 Tabela: `performance_points`

```sql
CREATE TABLE performance_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  date TEXT NOT NULL UNIQUE(account_id, date),
  pnl REAL NOT NULL,
  balance REAL NOT NULL,
  phase INTEGER NOT NULL,
  breached_daily_limit INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
```

**Índices:** `idx_pp_account_date`

**Entidade:** Série temporal de PnL diário por conta

### 2.5 Tabela: `audit_logs`

```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload TEXT,
  created_at TEXT NOT NULL
);
```

**Índices:** `idx_audit_created_at`

**Entidade:** Trilha de auditoria

### 2.6 Tabela: `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT,
  user_agent TEXT,
  ip TEXT
);
```

**Índices:** `idx_refresh_user`

**Entidade:** Refresh tokens para auth

---

## 3. Relações entre Entidades

```
users (1) ─────< accounts (N)
plans (1) ─────< accounts (N)
accounts (1) ──< performance_points (N)
users (1) ─────< audit_logs (N)
users (1) ─────< refresh_tokens (N)
```

---

## 4. Entidades que Já Existem

| Entidade | Tabela | Completa? |
|----------|--------|----------|
| Usuário | `users` | **SIM** — com roles e status |
| Plano | `plans` | **SIM** — com 4 seed plans |
| Conta de Avaliação | `accounts` | **SIM** — com todos os campos necessários |
| Performance | `performance_points` | **SIM** — série temporal |
| Auditoria | `audit_logs` | **SIM** — log de ações |
| Auth | `refresh_tokens` | **SIM** — com revogação |

---

## 5. Entidades Faltando para Arquitetura Completa

### 5.1 Para Planning + Aprovação + Execução

| Entidade | Tabela necessária | Prioridade |
|----------|------------------|------------|
| Candidatura | `candidates` | **ALTA** — checkout não cria nada |
| Aceite de Termos | `term_acceptances` | **ALTA** — termos versionados |
| Solicitação de Reset | `reset_requests` | **MÉDIA** — mencionado mas não existe |
| Solicitação de Payout | `payout_requests` | **MÉDIA** — mencionado mas não existe |
| Solicitação de Revisão | `review_requests` | **BAIXA** |
| Conta Fundada | `funded_accounts` | **MÉDIA** — depois de approved_for_funded |
| Transação de Payout | `payout_transactions` | **MÉDIA** |
| Notificação | `notifications` | **MÉDIA** |
| Job Status | `job_executions` | **MÉDIA** — para cron jobs |

### 5.2 Para Multi-Tenant

| Entidade | Status |
|----------|--------|
| `accounts` já tem `user_id` | Parcialmente multi-tenant |
| Sem `organization_id` | Não é multi-tenant real |

### 5.3 Para Compliance/Legal

| Entidade | Status |
|----------|--------|
| Versionamento de Termos | **NÃO EXISTE** |
| KYC Documents | **NÃO EXISTE** |
| IP Log | **Parcial** — `refresh_tokens.ip` existe |
| Session History | **NÃO EXISTE** |

---

## 6. Estruturas Reaproveitáveis

| Estrutura | Por que reaproveitar |
|-----------|---------------------|
| `audit_logs` pattern | Bom modelo para qualquer log de ação |
| `performance_points` series | Funciona para qualquer métrica temporal |
| `plans` como template | Bom pattern para configuração de produtos |
| `refresh_tokens` com revogação | Modelo de auth sólido |

---

## 7. Inconsistências entre Schema e Implementação

### 7.1 Campo `status` sem CHECK constraint

**Schema:** `status TEXT NOT NULL` — sem constraint  
**Runtime:** `mapAccountRow` converte status desconhecido para `pending_payment`

**Problema:** DB aceita qualquer valor em `status`, mas o código assume enum.

### 7.2 `max_drawdown_hit_pct` inicializado como 0

**Schema:** `REAL NOT NULL`  
**Runtime:** `evaluateAccount` incrementa para `maxDrawdownHitPct`

**Problema:** Se admin criar conta com balance < initial_balance, o campo não reflete isso.

### 7.3 Credentials em texto plano no seed

**Seed:** `platformPassword: "Demo@123"`  
**Schema:** `platform_password_enc TEXT NOT NULL`  
**Implementação:** Seed usa `encryptSecret()` corretamente

**Conclusão:** Seed está correto.

---

## 8. Migrações

| Aspecto | Status |
|---------|--------|
| Sistema de migração | **NÃO EXISTE** |
| Versionamento de schema | **NÃO EXISTE** |
| Migrations folder | **NÃO EXISTE** |
| Migrate script | **NÃO EXISTE** |

**Risco:** Qualquer mudança de schema precisa ser feita manualmente via `CREATE TABLE IF NOT EXISTS`.

---

## 9. Resumo

| Aspecto | Estado |
|---------|--------|
| Banco | SQLite com WAL |
| Tables | 6 tables bem estruturadas |
| Relations | FK com ON DELETE CASCADE |
| Indices | Criados nas colunas certas |
| Seeds | Automáticos na inicialização |
| Backups | **AUSENTE** |
| Migrations | **AUSENTE** |
| Entidades faltando | Candidaturas, termos versionados, payouts, notificações |
| Multi-tenant | **NÃO** — apenas por user_id |
