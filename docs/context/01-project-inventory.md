# 01 — Inventário Estrutural do Projeto

**Projeto:** `everwin-landing-page`  
**Data:** 2026-03-19  
**Fato observado** vs **Inferência** vs **Hipótese** vs **Gap** vs **Recomendação**

---

## 1. Visão Geral do Repositório

O repositório é um **monorepo híbrido** com dois módulos principais coexistindo no mesmo repositório:

1. **Landing Page de Marketing** (`src/pages/`, `src/sections/`, `src/components/`)
2. **Sistema de Portal Prop Trading** (`src/modules/prop-system/`, `server/`)

**Fato observado:** Não existe separação formal de workspaces (npm/yarn/pnpm). Tudo convive no mesmo `package.json`.

---

## 2. Diretórios Principais

### `/` — Raiz
| Item | Propósito | Status | Acoplamento | Relevância |
|------|-----------|--------|-------------|------------|
| `src/` | Frontend React completo | ATIVO | ALTO | CENTRAL |
| `server/` | Backend Node/Express com SQLite | ATIVO | ALTO | CENTRAL |
| `public/` | Assets estáticos (logos, imagens) | ATIVO | BAIXO | PERIFÉRICO |
| `dist/` | Build de produção | ATIVO | BAIXO | PERIFÉRICO |
| `docs/` | Este documento | ATIVO | NENHUM | CONTEXTUAL |
| `node_modules/` | Dependências | ATIVO | NENHUM | INFRA |

---

## 3. Frontend — `src/`

### 3.1 Entry Point e Configuração
| Arquivo | Propósito | Status | Observação |
|---------|-----------|--------|------------|
| `main.tsx` | Bootstrap React | ATIVO | Padrão Vite |
| `App.tsx` | Layout raiz com AppLayout | ATIVO | Wrapper de layout |
| `Routes.tsx` | Definição de rotas (React Router v6) | ATIVO | CRÍTICO — Define toda navegação |
| `i18n.ts` | Configuração i18next | ATIVO | pt-BR, en-US, es |
| `index.css` | Estilos globais + animações Tailwind | ATIVO | Contém animações do hero Prop |

### 3.2 Páginas de Landing (`src/pages/`)
| Arquivo | Rota | Status | Observação |
|---------|------|--------|------------|
| `Home.tsx` | `/` | ATIVO | Homepage principal |
| `PropPage.tsx` | `/prop/landing` | ATIVO | Landing de marketing do Prop |
| `PropCheckout.tsx` | `/prop/landing/checkout` | ATIVO | Formulário de candidatura |
| `company-*.tsx` | `/company/*` | ATIVO | Páginas institucionais |
| `affiliate/index.tsx` | `/affiliate` | ATIVO | Programa de afiliados |

### 3.3 Páginas Legais (`src/pages/legal/`)
| Arquivo | Rota | Status |
|---------|------|--------|
| `terms.tsx` | `/legal/terms` | ATIVO |
| `privacy.tsx` | `/legal/privacy` | ATIVO |
| `prop-trading-terms.tsx` | `/legal/prop-trading-terms` | ATIVO (criado na operação) |
| `payment-policy.tsx` | `/legal/payment-policy` | ATIVO |
| `withdrawal-policy.tsx` | `/legal/withdrawal-policy` | ATIVO |
| `risk-disclosure.tsx` | `/legal/risk-disclosure` | ATIVO |
| `aml.tsx` | `/legal/aml` | ATIVO |
| `cookies.tsx` | `/legal/cookies` | ATIVO |
| `margin-trading.tsx` | `/legal/margin-trading` | ATIVO |
| `order-execution.tsx` | `/legal/order-execution` | ATIVO |
| `general-fees.tsx` | `/legal/general-fees` | ATIVO |
| `demo-accounts.tsx` | `/legal/demo-accounts` | ATIVO |

### 3.4 Seções de Landing (`src/sections/`)
| Diretório | Propósito | Status |
|-----------|-----------|--------|
| `Hero/` | Hero principal com animações | ATIVO |
| `StepsSection/` | Seção de passos | ATIVO |
| `TestimonialsSection/` | Depoimentos | ATIVO |
| `DepositWithdrawalSection/` | Depósito/saque | ATIVO |
| `PropSection/` | Seções específicas do Prop | ATIVO |

**Sub-diretório `PropSection/`:**
| Arquivo | Propósito |
|---------|-----------|
| `PropHero.tsx` | Hero do Prop com animação de trading |
| `PropHowItWorks.tsx` | Como funciona |
| `PropPlans.tsx` | Planos comerciais |
| `PropRules.tsx` | Regras do programa |
| `PropFAQ.tsx` | FAQ |
| `PropCTA.tsx` | Chamada para ação |

### 3.5 Componentes UI (`src/components/ui/`)
**Fato observado:** Usam padrão **Radix UI primitives** + **Tailwind** + **clsx/cva**.

### 3.6 Módulo Prop System (`src/modules/prop-system/`) — **ÁREA CENTRAL**

#### API Layer
| Arquivo | Propósito | Status |
|---------|-----------|--------|
| `api.ts` | Cliente REST para backend (fetch + JWT) | ATIVO |

#### Context & State
| Arquivo | Propósito | Status |
|---------|-----------|--------|
| `context.tsx` | PropSystemProvider (estado global React) | ATIVO |
| `storage.ts` | localStorage fallback (seed + persistência) | ATIVO (LEGADO) |

#### Types & Rules
| Arquivo | Propósito | Status |
|---------|-----------|--------|
| `types.ts` | TypeScript types (PropUser, PropAccount, etc.) | ATIVO |
| `rules.ts` | Engine de regras + analytics (frontend) | ATIVO |

#### Pages
| Arquivo | Rota | Perfil | Status |
|---------|------|--------|--------|
| `PropPortalEntry.tsx` | `/prop/` | Ambos | ATIVO |
| `PropLoginPage.tsx` | `/prop/login` | Ambos | ATIVO |
| `pages/admin/AdminDashboardPage.tsx` | `/prop/admin/dashboard` | Admin | ATIVO |
| `pages/admin/AdminUsersPage.tsx` | `/prop/admin/users` | Admin | ATIVO |
| `pages/admin/AdminAccountsPage.tsx` | `/prop/admin/accounts` | Admin | ATIVO |
| `pages/client/ClientDashboardPage.tsx` | `/prop/client/dashboard` | Client | ATIVO |
| `pages/client/ClientAccountsPage.tsx` | `/prop/client/accounts` | Client | ATIVO |
| `pages/components/` | Componentes reutilizáveis de UI | - | ATIVO |

#### Layout
| Arquivo | Propósito |
|---------|-----------|
| `layout/PropPortalLayout.tsx` | Layout autenticado com sidebar |

#### Guards
| Arquivo | Propósito |
|---------|-----------|
| `guards.tsx` | RequireAuth, RequireRole |

---

## 4. Backend — `server/`

### 4.1 Core
| Arquivo | Propósito | Status |
|---------|-----------|--------|
| `index.js` | Express app + todas as rotas da API | ATIVO — CRÍTICO |
| `db.js` | SQLite setup, schema, migrations, seeds, mappers | ATIVO — CRÍTICO |
| `config.js` | Configuração de ambiente | ATIVO |
| `utils.js` | Helpers (nowISO, uid, safeJsonParse) | ATIVO |

### 4.2 Segurança
| Arquivo | Propósito |
|---------|-----------|
| `security.js` | bcrypt, JWT, AES-256-GCM, SHA-256 |

### 4.3 Middleware
| Arquivo | Propósito |
|---------|-----------|
| `middleware/auth.js` | requireAuth, requireRole |

### 4.4 Rules Engine
| Arquivo | Propósito |
|---------|-----------|
| `rules.js` | Replicação server-side da engine de regras |

### 4.5 Data
| Arquivo | Propósito |
|---------|-----------|
| `data/prop-system.db` | SQLite database |
| `data/prop-system.db-wal` | WAL log |
| `data/prop-system.db-shm` | SHM file |

---

## 5. Configuração

| Arquivo | Propósito |
|---------|-----------|
| `package.json` | Dependências + scripts |
| `vite.config.ts` | Vite build config |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | TypeScript configs |
| `tailwind.config.js` | Configuração Tailwind |
| `tailwind.css` | Estilos globais Tailwind |
| `.env.example` | Exemplo de variáveis de ambiente |
| `.gitignore` | Ignorados |

---

## 6. Documentação Existente

| Arquivo | Conteúdo |
|---------|----------|
| `DOC.md` | Contexto da operação de Prop Trading (landing page) |
| `ROADMAP_PROP_SYSTEM.md` | Roadmap de evolução do sistema Prop (preexistente) |

---

## 7. Análise de Estrutura

### 7.1 Observações de Acoplamento

**ACOPLAMENTO ALTO:**
- Frontend e Backend compartilham types em `src/modules/prop-system/types.ts`
- A engine de regras existe em DUAS versões: `src/modules/prop-system/rules.ts` E `server/rules.js` — **DÍVIDA CRÍTICA**
- API do frontend (`api.ts`) aponta para `VITE_PROP_API_URL` com fallback `http://localhost:8787/api`

**ACOPLAMENTO BAIXO:**
- Landing page (`/prop/landing`) é completamente separada do portal (`/prop/*`)
- Seções de landing (`src/sections/PropSection/`) são independentes do sistema

### 7.2 Áreas Legado vs Ativo

| Área | Status | Observação |
|------|--------|------------|
| `storage.ts` | **LEGADO** | localStorage com seed — usado apenas quando API indisponível |
| Landing page antiga | LEGADO | `/prop-old` redireciona para `/prop/landing` |
| Checkout antigo | LEGADO | `/prop/checkout` redireciona para `/prop/landing/checkout` |

### 7.3 Reaproveitável

- **Engine de regras** (`rules.ts` + `server/rules.js`) — pode ser extraída como lib compartilhada
- **Types** (`types.ts`) — excelente separação de domínio
- **UI components** (`src/components/ui/`) — bem estruturados
- **i18n** — pronto para expansão

### 7.4 Gaps de Estrutura

1. **Sem testes** — zero arquivos de teste encontrados
2. **Sem ESLint/Prettier** configurado — sem linting
3. **Sem CI/CD** — não há pipelines configurados
4. **Sem documentação de API** (OpenAPI/Swagger)
5. **Engine duplicada** — frontend e backend têm cópias das regras

---

## 8. Resumo do Inventário

- **Total de diretórios principais:** 7 (`src/`, `server/`, `public/`, `dist/`, `docs/`, `node_modules/`, `.git/`)
- **Total de arquivos TypeScript/TSX:** ~80+
- **Total de arquivos JS no server:** 7
- **Total de páginas legais:** 13
- **Total de seções de landing:** 5+
- **Módulo central:** `src/modules/prop-system/`

**Áreas centrais:** Frontend React + Backend Express  
**Áreas periféricas:** Landing pages, assets, docs  
**Áreas legado:** localStorage storage, rotas antigas redirecionadas
