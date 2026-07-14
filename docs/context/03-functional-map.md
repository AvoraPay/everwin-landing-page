# 03 — Mapeamento Funcional

**Projeto:** `everwin-landing-page`  
**Data:** 2026-03-19

---

## 1. Features Existentes

### 1.1 Landing Page de Marketing

| Feature | Status | Descrição |
|---------|--------|-----------|
| Homepage com hero | **FUNCIONAL** | Seções Hero, Steps, Testimonials, Features |
| Página Prop (`/prop/landing`) | **FUNCIONAL** | Hero, How it Works, Plans, Rules, FAQ, CTA |
| Checkout Prop (`/prop/landing/checkout`) | **FUNCIONAL** | Formulário 3-etapas com aceite legal |
| Políticas legais (13 páginas) | **FUNCIONAL** | `/legal/*` — termos, privacidade, AML, etc. |
| i18n (pt/en/es) | **FUNCIONAL** | i18next com locale files |
| Animações | **FUNCIONAL** | Framer Motion + CSS animations |

### 1.2 Portal Prop — Admin

| Feature | Status | Descrição |
|---------|--------|-----------|
| Login | **FUNCIONAL** | Email + senha + JWT |
| Dashboard Admin | **FUNCIONAL** | KPIs, equity chart, risk alerts, rankings, audit |
| Gestão de Usuários | **FUNCIONAL** | Lista, criar, bloquear/reativar |
| Gestão de Contas | **FUNCIONAL** | Lista, criar, editar, mudar status |
| Engine de Regras (manual) | **FUNCIONAL** | Botão "Reavaliar Regras" |
| Auditoria | **FUNCIONAL** | Logs de todas as ações |
| Analytics por Conta | **FUNCIONAL** | Everwin Edge Score, win rate, volatilidade |

### 1.3 Portal Prop — Client

| Feature | Status | Descrição |
|---------|--------|-----------|
| Login | **FUNCIONAL** | Compartilhado com admin |
| Dashboard Client | **FUNCIONAL** | Suas contas, métricas, performance |
| Lista de Contas | **FUNCIONAL** | Suas contas de avaliação |
| Visualização de Credenciais | **FUNCIONAL** | Ver login/senha da plataforma |

---

## 2. Features Parcialmente Implementadas

| Feature | Status | Lacuna |
|---------|--------|--------|
| Reset de senha | **PARCIAL** | Não existe endpoint/page |
| Recuperação de conta (trader) | **PARCIAL** | Pode solicitar via admin, mas não existe workflow |
| Payout request | **PARCIAL** | Mencionado no roadmap, não implementado |
| Notificações | **PARCIAL** | Apenas audit logs, sem email/push |
| Cooldown automático | **PARCIAL** | Só funciona quando "Reavaliar Regras" é clicado |
| Multi-idioma no portal | **PARCIAL** | Landing tem i18n, portal não |

---

## 3. Features Inexistentes (Gaps)

| Feature | Gap |
|---------|-----|
| Integração com corretora | Não existe |
| Sync automático de P&L | Manual via admin |
| Workers em background | Não há |
| Cron jobs | Não há |
| Dashboard de payout | Não existe |
| Fila de onboarding | Manual |
| Versionamento de termos | Não há |
| KYC/KYB | Não há |
| MFA | Não há |
| Rate limiting | Não há |
| API documentation | Não há |
| Webhooks | Não há |
| Backup automático do DB | Não há |

---

## 4. Fluxos de Usuário

### 4.1 Fluxo de Candidato/Traders

```
[Landing /prop/landing]
    │
    ├──► Ver planos e regras
    │
    ├──► Clicar "Inscreva-se" → /prop/landing/checkout
    │       ├──► Etapa 1: Dados pessoais
    │       ├──► Etapa 2: Perfil operacional
    │       └──► Etapa 3: Termos e aceite
    │
    └──► Clicar "Entrar" → /prop/login
            ├──► Redirect para Admin (se admin)
            └──► Redirect para Client Dashboard (se trader)
```

**Fato observado:** O checkout NÃO cria conta no sistema — é apenas um formulário visual com aceite.

### 4.2 Fluxo Admin

```
[Login como Admin]
    │
    ├──► AdminDashboard
    │       ├──► Ver KPIs, risk alerts, rankings, audit
    │       └──► "Reavaliar Regras" (trigger manual)
    │
    ├──► AdminUsers (/prop/admin/users)
    │       ├──► Listar usuários
    │       ├──► Criar usuário cliente
    │       └──► Bloquear/reativar
    │
    └──► AdminAccounts (/prop/admin/accounts)
            ├──► Listar todas as contas
            ├──► Criar conta de avaliação
            ├──► Editar: balance, pnl, days, phase, notes
            └──► Mudar status
```

### 4.3 Fluxo Client

```
[Login como Client]
    │
    ├──► ClientDashboard
    │       └──► Ver suas contas, métricas, performance
    │
    └──► ClientAccounts
            ├──► Listar suas contas
            ├──► Ver credenciais da plataforma
            └──► Ver analytics por conta
```

---

## 5. Desalinhamento UI × Backend

### 5.1 Checkout vs Sistema

| UI Promete | Backend Entrega |
|------------|----------------|
| Formulário de inscrição 3-etapas | Não salva dados — apenas visual |
| Aceite de termos | Não registra aceite versionado |
| Redirecionamento pós-inscrição | Não existe — redireciona para home |

**Hipótese:** O checkout foi criado como formulário de candidatura mas nunca foi conectado ao backend. Precisa de integração ou deve ser removido da expectativa.

### 5.2 Roadmap vs Implementação

| Roadmap Menciona | Implementado? |
|------------------|---------------|
| Fila de onboarding | **NÃO** |
| Workbench de risco | **PARCIAL** — existe no dashboard mas sem alertas ativos |
| Gestão de payout | **NÃO** |
| Versionamento de termos | **NÃO** |
| Vault para segredos | **PARCIAL** — criptografia existe mas não é vault |
| Integração corretora | **NÃO** |

---

## 6. Áreas com Stubs/Placeholders

| Área | Evidência |
|------|-----------|
| `storage.ts` | Seed data com `localStorage` — não usado em produção mas existe |
| `/prop-old`, `/prop/checkout` | Redirecionam para novo caminho — rotas legadas |
| `fetchAuditLogsApi` exportada | Usada em `context.tsx` admin load, mas não existe endpoint de consumo direto |

---

## 7. Funções Críticas do Produto

1. **Avaliação de contas** — engine de regras que determina pass/fail/cooldown
2. **Gestão de risco** — DLL, drawdown, timeout
3. **Edge Score** — métrica proprietária de avaliação de traders
4. **Auditoria** — trilha de todas as ações administrativas
5. **Persistência de credenciais** — credenciais de plataforma criptografadas
6. **RBAC** — separação admin/client

---

## 8. Resumo Funcional

| Categoria | Estado |
|-----------|--------|
| Landing Page | **COMPLETA** — todas as páginas, i18n, animações |
| Portal Admin | **FUNCIONAL** — CRUD completo, engine, analytics, audit |
| Portal Client | **BÁSICO** — visualização de contas e métricas |
| Checkout/Inscrição | **VISUAL APENAS** — não integrado ao sistema |
| Automação | **AUSENTE** — tudo manual |
| Integrações | **AUSENTES** — sem corretora, sem email, sem webhooks |
| Compliance | **PARCIAL** — políticas existem, versionamento não |
