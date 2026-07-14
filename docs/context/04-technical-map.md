# 04 — Mapeamento Técnico Detalhado

**Projeto:** `everwin-landing-page`  
**Data:** 2026-03-19

---

## 1. Stack Tecnológica

### 1.1 Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.2.0 | UI framework |
| Vite | 6.3.5 | Build tool + dev server |
| TypeScript | (via @types/react 18.2.0) | Tipagem |
| React Router | 6.30.3 | Roteamento |
| Tailwind CSS | 3.4.16 | Estilização |
| Framer Motion | 12.24.7 | Animações |
| i18next | 25.8.0 | Internacionalização |
| Lucide React | 0.453.0 | Ícones |
| Zod | 4.3.6 | Validação de schema (types) |
| Radix UI | (vários) | Componentes base |
| Class Variance Authority | 0.7.0 | Variantes de componentes |

### 1.2 Backend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | (ambiente) | Runtime |
| Express | 5.2.1 | HTTP server |
| better-sqlite3 | 12.6.2 | SQLite ORM |
| bcryptjs | 3.0.3 | Hash de senhas |
| jsonwebtoken | 9.0.3 | JWT |
| cors | 2.8.6 | CORS |
| helmet | 8.1.0 | Security headers |
| morgan | 1.10.1 | HTTP logging |
| zod | 4.3.6 | Validação de input |

### 1.3 Dev Tools
| Tecnologia | Uso |
|------------|-----|
| esbuild | Bundler interno |
| concurrently | Dev parallel execution |
| @vitejs/plugin-react | Vite React plugin |

---

## 2. Padrões Arquiteturais

### 2.1 Frontend
| Padrão | Implementação |
|--------|----------------|
| **React Context** | `PropSystemContext` para estado global |
| **Custom Hooks** | `usePropSystem()` wrapper do context |
| **Component Composition** | Props children + render props |
| **Guards pattern** | `RequireAuth`, `RequireRole` |
| **API Client pattern** | `api.ts` com fetch + retry + refresh |
| **Types-driven development** | Todos os tipos em `types.ts` |

### 2.2 Backend
| Padrão | Implementação |
|--------|----------------|
| **Router centralizado** | Todo em `server/index.js` |
| **Middleware chain** | auth, validation, handlers |
| **Mapper pattern** | `mapUserRow`, `mapPlanRow`, `mapAccountRow` |
| **Seed pattern** | Dados iniciais via `initDatabase()` |
| **Audit trail** | Função `audit()` centralizada |

---

## 3. ORM/DB Layer

**Tecnologia:** `better-sqlite3` (driver SQLite nativo)  
**Pattern:** Queries SQL manuais com prepared statements  
**Mappers:** Funções `map*Row` para converter do DB para domain objects

**Exemplo de query:**
```javascript
db.prepare("SELECT * FROM accounts WHERE user_id = ?").all(userId)
```

**Não usa ORM** — queries diretas com string interpolation (seguro contra SQL injection via prepared statements).

---

## 4. Filas e Workers

| Item | Status | Observação |
|------|--------|------------|
| Message Queue | **NÃO EXISTE** | Nenhum RabbitMQ, Redis, Bull, etc. |
| Background Workers | **NÃO EXISTE** | Tudo é HTTP request-response |
| Scheduled Jobs | **NÃO EXISTE** | Sem cron, sem node-cron |
| Webhooks | **NÃO EXISTE** | Nenhum mecanismo de callback |
| Batch Processing | **MANUAL** | "Reavaliar Regras" é acionado manualmente |

**Gap:** O cooldown automático e avaliação de timeout DEPENDEM de alguém clicar em "Reavaliar Regras" — não há job rodando.

---

## 5. Cache

| Item | Status | Observação |
|------|--------|------------|
| HTTP Cache | **NÃO CONFIGURADO** | Sem Cache-Control |
| Application Cache | **localStorage** | Fallback legado |
| DB Cache | **SQLite WAL** | Melhor que rollbacks, mas não é cache de aplicação |
| JWT Cache | **NENHUM** | Token verificado a cada request |

---

## 6. Autenticação e Autorização

### 6.1 Autenticação
| Aspecto | Implementação |
|---------|----------------|
| Método | JWT (access + refresh tokens) |
| Access Token TTL | 15m (padrão) |
| Refresh Token TTL | 7d |
| Refresh Rotation | Sim — token antigo revogado |
| Senhas | bcrypt com salt rounds = 12 |
| Brute Force | Sem proteção |
| MFA | Não existe |

### 6.2 Autorização
| Aspecto | Implementação |
|---------|----------------|
| RBAC | admin / client |
| Route Guards | RequireAuth + RequireRole |
| API Middleware | requireAuth + requireRole |
| Data Isolation | Admin vê tudo, client vê só suas contas |

---

## 7. Schemas e Validações

### 7.1 Zod Schemas (Backend)
| Schema | Valida |
|--------|--------|
| `loginSchema` | email + password |
| `createUserSchema` | name + email + password |
| `userStatusSchema` | status (active/blocked) |
| `createAccountSchema` | userId, planId, accountId, platformLogin, platformPassword, startDate |
| `updateAccountSchema` | balance, todayPnl, daysTraded, phase, notes, status |
| `statusSchema` | AccountStatus enum |

### 7.2 TypeScript Types (Frontend)
| Type | Propósito |
|------|----------|
| `PropUser` | Usuário do sistema |
| `PlanTemplate` | Template de plano |
| `PropAccount` | Conta de avaliação |
| `DailyPerformancePoint` | Ponto de performance diário |
| `RiskSnapshot` | Snapshot de risco |
| `AccountAnalytics` | Analytics derivados |
| `AuditLog` | Log de auditoria |

---

## 8. Scripts

### 8.1 Scripts de Build/Deploy
| Script | O que faz |
|--------|-----------|
| `npm run dev` | `concurrently dev:client dev:server` |
| `npm run dev:client` | `vite` |
| `npm run dev:server` | `node server/index.js` |
| `npm run build` | `vite build` (gera `dist/`) |
| `npm run start:server` | `node server/index.js` |

### 8.2 Scripts Ausentes
- Sem scripts de lint (`eslint`, `prettier`)
- Sem scripts de teste
- Sem scripts de deploy
- Sem scripts de migrations
- Sem scripts de seed (via CLI)

---

## 9. Configuração de Ambiente

### 9.1 Variáveis Reconhecidas
| Variável | Default | Uso |
|----------|---------|-----|
| `NODE_ENV` | (undefined) | Detecta produção |
| `PROP_API_PORT` | 8787 | Porta do servidor |
| `PROP_CORS_ORIGIN` | `http://localhost:5173` | Origem CORS |
| `JWT_ACCESS_SECRET` | `dev-everwin-access-secret-change-me` | Assinatura JWT |
| `JWT_REFRESH_SECRET` | `dev-everwin-refresh-secret-change-me` | Refresh JWT |
| `PROP_DATA_SECRET` | `dev-everwin-data-secret-change-me` | Criptografia AES |
| `JWT_ACCESS_TTL` | `15m` | TTL access token |
| `JWT_REFRESH_TTL` | `7d` | TTL refresh token |

### 9.2 Variáveis Frontend
| Variável | Default | Uso |
|----------|---------|-----|
| `VITE_PROP_API_URL` | `http://localhost:8787/api` | Base URL da API |

---

## 10. Dívida Técnica Identificada

| Dívida | Severity | Evidência |
|--------|----------|-----------|
| Engine duplicada (TS + JS) | **ALTA** | `src/modules/prop-system/rules.ts` + `server/rules.js` |
| Zero testes | **ALTA** | Nenhum arquivo de teste |
| Sem linting | **MÉDIA** | package.json não tem eslint |
| Storage legado (localStorage) | **MÉDIA** | `storage.ts` ainda presente |
| Sem API docs | **MÉDIA** | Sem OpenAPI/Swagger |
| Secrets com defaults em código | **MÉDIA** | `config.js` tem defaults de dev |
| Sem rate limiting | **MÉDIA** | API sem proteção |
| Sem backup do DB | **ALTA** | SQLite em arquivo local |
| Sem CI/CD | **MÉDIA** | Sem pipelines |

---

## 11. Complexidade e Duplicação

| Área | Complexidade | Observação |
|------|-------------|------------|
| Rules Engine | **DUPLICADA** | Mesma lógica em TS e JS |
| Type definitions | **CENTRALIZADA** | Boa — types.ts bem organizado |
| API Client | **SIMPLES** | Fetch + retry + refresh |
| Context state | **SIMPLES** | PropSystemContext bem definido |
| Database layer | **SIMPLES** | Queries diretas, sem ORM overhead |

---

## 12. Pontos de Risco

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Divergência de regras TS × JS | **ALTA** | **ALTO** | Extrair para lib compartilhada |
| Credenciais vazadas no DB | **MÉDIA** | **CRÍTICO** | AES-256-GCM existe, mas sem vault |
| Acesso não autorizado (brute force) | **ALTA** | **ALTO** | Nenhuma proteção atual |
| Perda de dados (sem backup) | **MÉDIA** | **CRÍTICO** | Sem backup automático |
| Regressão sem testes | **CERTA** | **ALTO** | Zero cobertura |

---

## 13. Consistências e Inconsistências

### Consistente
- Tipos TypeScript bem alinhados com domínio
- Zod schemas cobrem inputs principais
- Nomenclatura coerente (camelCase no JS, camelCase nos types)

### Inconsistente
- `storage.ts` (localStorage) tem seed data diferente do `server/db.js` (seed do SQLite)
- Rotas de checkout: `/prop/landing/checkout` vs `/prop/checkout` (redirect)
- API URL usa `VITE_PROP_API_URL` no frontend, mas servidor fixa porta em `PROP_API_PORT`
