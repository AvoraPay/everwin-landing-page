# EVERWIN PROP — Documento de Introspecção Completa

> Gerado em 2026-04-08. Fonte de verdade para visão de produto, fluxos, regras, limitações, segurança e roadmap de refinamento.

---

## 1. O QUE É A EVERWIN PROP

A Everwin Prop é uma plataforma de avaliação de traders (prop trading) que permite a candidatos comprarem uma avaliação em 2 fases. Se aprovados, recebem uma conta financiada com capital real da Everwin.

**Modelo de negócio:**
- Candidato paga taxa de avaliação (R$497–R$1.497 / $199–$999)
- Recebe conta demo com saldo simulado (R$25k–R$150k / $12.5k–$75k)
- Deve atingir metas de lucro respeitando regras de risco
- Fase 1 → Fase 2 → Conta financiada (90/10 profit split)

**Stack técnico:**
- Frontend: React + Vite + TypeScript + Tailwind + i18next (PT/EN/ES)
- Backend: Node.js/Express + PostgreSQL (Supabase)
- Pagamentos: Stripe + Novus Pagamentos
- Emails: Resend
- Trading Platform: api.everwin.trade (API própria)

---

## 2. PLANOS COMERCIAIS

### BRL (Português/Brasil)
| Plano | Saldo | Taxa | Popular |
|-------|-------|------|---------|
| Starter | R$ 25.000 | R$ 497 | Não |
| Medium | R$ 50.000 | R$ 874 | Sim |
| Advanced | R$ 100.000 | R$ 1.397 | Não |
| Ultra | R$ 150.000 | R$ 1.497 | Não |

### USD (English/Español)
| Plano | Saldo | Taxa | Popular |
|-------|-------|------|---------|
| Starter | $12,500 | $199 | Não |
| Medium | $25,000 | $349 | Sim |
| Advanced | $50,000 | $549 | Não |
| Ultra | $75,000 | $999 | Não |

### Regras de todos os planos
- Meta Fase 1: 10% de lucro
- Meta Fase 2: 15% de lucro (confirmação)
- Max Drawdown: 5% do saldo inicial
- Loss Diário: 3% do saldo inicial
- Dias mínimos: 5 dias operados
- Duração por fase: 30 dias
- Profit Split (funded): 90% trader / 10% Everwin

---

## 3. FLUXO COMPLETO DO USUÁRIO

### 3.1 Descoberta → Candidatura
```
Landing /prop
  → Hero (proposta de valor, stats)
  → How it Works (3 passos visuais)
  → Plans (4 cards com regras)
  → Rules (8 regras com ícones)
  → FAQ (6 perguntas)
  → CTA final
  → Clica "Começar" no plano desejado
  → Redireciona para /prop/checkout?plan=plan_X
```

### 3.2 Checkout (Candidatura)
```
/prop/checkout — Formulário em 3 etapas:

ETAPA 1: Dados pessoais
  - Nome, Sobrenome
  - Email, Telefone
  - País (5 opções), Documento (CPF/DNI/Passport)
  - Cidade, Ocupação
  - Validação: CPF com checksum mod-11, email regex, telefone ≥8

ETAPA 2: Perfil operacional
  - Experiência (4 níveis)
  - Sessão preferida (abertura/mid/fechamento/múltiplas)
  - Risco diário tolerado (4 faixas)
  - Motivação (texto ≥ 20 chars)
  - Consistência (texto ≥ 20 chars)

ETAPA 3: Aceite legal
  - ☐ Aceito as regras operacionais
  - ☐ Ciência de ausência de garantia
  - ☐ Isenção de responsabilidade
  - Link para política completa /legal/prop-trading-terms
```

### 3.3 Fila de Espera (WAITLIST — fluxo atual)
```
Candidato submete formulário
  → Backend cria application (status: "submitted")
  → Backend cria payment (status: "pending", sem checkout_url)
  → Email enviado: "Sua candidatura está em análise"
  → Redireciona para /prop/submission?id={submissionCode}
  → Candidato vê card amarelo "Candidatura em análise"
  → SEM link de pagamento ainda

Admin decide liberar:
  → Abre /prop/admin/submissions → filtra "Fila de espera"
  → Inspeciona candidatura → cola checkout URL do Novus/Stripe
  → Clica "Liberar link de pagamento"
  → Status muda para "payment_pending"
  → Email enviado ao candidato com link de pagamento
  → Candidato agora vê botão "Pagar agora" na página de status
```

### 3.4 Pagamento → Ativação
```
Candidato paga via Novus/Stripe
  → Webhook atualiza payment status → "approved"
  → Auto-provisioning:
    1. Cria usuário no portal (client role, senha temporária)
    2. Cria conta de avaliação (accountId auto-gerado)
    3. Provisiona conta na plataforma de trading (api.everwin.trade)
    4. Envia email com credenciais do portal + plataforma
  → Candidato agora pode:
    - Acompanhar status em /prop/submission
    - Logar no portal /prop/login
    - Acessar dashboard /prop/client/dashboard
```

### 3.5 Avaliação (Trading)
```
Trader opera na plataforma de trading
  → Admin atualiza métricas manualmente (saldo, P&L, dias)
  → Rules engine avalia:
    - DLL breached? → status = paused (até reset no dia seguinte)
    - Hard drawdown? → status = failed_drawdown + cooldown 7 dias
    - Timeout (30 dias)? → status = failed_timeout + cooldown 7 dias
    - Meta atingida + dias mínimos? → avança fase ou status = passed
  → Cliente vê tudo no dashboard em tempo real
```

### 3.6 Resultado
```
APROVADO (passed):
  → Admin muda status para approved_for_funded
  → Trader recebe conta financiada (processo manual)

REPROVADO:
  → Cooldown de 7 dias automático
  → Pode refazer candidatura após cooldown
```

---

## 4. ESTRUTURA DE ROTAS

### Públicas
| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/prop` | PropPage | Landing page marketing |
| `/prop/checkout` | PropCheckout | Formulário de candidatura |
| `/prop/submission` | PropSubmissionStatusPage | Tracking público (por código) |
| `/prop/thank-you` | PropThankYouPage | Pós-pagamento |
| `/prop/login` | PropLoginPage | Login do portal |
| `/prop/reset-password` | PropResetPasswordPage | Reset via OTP |
| `/legal/prop-trading-terms` | LegalPage | Política completa |

### Admin (requer auth + role=admin)
| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/prop/admin/dashboard` | AdminDashboardPage | KPIs, risco, alertas |
| `/prop/admin/submissions` | AdminSubmissionsPage | Fila de candidaturas |
| `/prop/admin/users` | AdminUsersPage | Gestão de usuários |
| `/prop/admin/accounts` | AdminAccountsPage | Gestão de contas |
| `/prop/admin/analytics` | AdminAnalyticsPage | Gráficos e trends |
| `/prop/admin/settings` | AdminSettingsPage | Configuração sistema |

### Cliente (requer auth + role=client)
| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/prop/client/dashboard` | ClientDashboardPage | Overview, alertas, KPIs |
| `/prop/client/accounts` | ClientAccountsPage | Detalhes das contas |
| `/prop/client/profile` | ClientProfilePage | Perfil e preferências |

---

## 5. MODELO DE DADOS

### Tabelas principais
```
users           → id, role (admin/client), email, password_hash, status
plans           → id, name, accountSize, fee, targets, limits, duration
applications    → id, submissionCode, planId, dados pessoais, status, paymentStatus
payments        → id, applicationId, provider, status, checkoutUrl, amount
accounts        → id, userId, planId, accountId, credentials, phase, status, métricas
performance_points → id, accountId, date, pnl, balance, breached
audit_logs      → id, actorUserId, action, entityType, entityId, payload
trade_events    → id, platformUserId, eventType, payload, flagged
```

### Status de Application
```
submitted → payment_pending → payment_approved → under_review → access_ready → account_ready
                 ↓                                                    ↓
          payment_overdue                                        rejected
                 ↓
              cancelled
```

### Status de Account
```
pending_payment → awaiting_account_creation → active ⇌ paused
                                                ↓
                                    passed → approved_for_funded
                                    failed_drawdown → cooldown → awaiting_account_creation
                                    failed_timeout → cooldown → awaiting_account_creation
```

---

## 6. LIMITAÇÕES ATUAIS E IMPEDITIVOS

### 🔴 CRÍTICOS (impedem produção)

**L1. Sync manual de métricas**
- Admin precisa manualmente atualizar saldo, P&L e dias operados
- Não há integração em tempo real com a plataforma de trading
- Impacto: Atraso na detecção de breaches, experiência degradada do cliente
- Necessário: Integração com webhooks da plataforma de trading para sync automático

**L2. Segurança de credenciais**
- Senha da plataforma de trading visível ao clicar toggle no portal
- Sem re-autenticação para revelar credenciais sensíveis
- Submission code (sem auth) dá acesso a dados completos incluindo login
- Impacto: Risco de exposição de credenciais

**L3. Sem rate limiting**
- Endpoint de login sem proteção contra brute force
- Endpoint de submission sem proteção contra spam
- OTP sem limite de tentativas
- Impacto: Vulnerabilidade a ataques automatizados

**L4. Regras hardcoded no frontend**
- Landing page exibe regras dos planos via i18n keys fixos
- Se backend mudar regras (ex: 8% drawdown), frontend continua mostrando 5%
- Checkout não valida regras contra templates reais
- Impacto: Informação inconsistente ao candidato

**L5. Senha mínima de login = 1 caractere**
- Schema de login aceita password com 1 char (Zod `.min(1)`)
- Inconsistente com OTP reset que exige 8+ chars
- Impacto: Contas com senhas fracas

### 🟡 IMPORTANTES (degradam experiência)

**L6. Admin 100% manual**
- Cada candidatura requer 3-5 cliques manuais do admin
- Sem bulk actions (aprovar 10 de uma vez)
- Sem auto-provision após pagamento (desabilitado no modo waitlist)
- Impacto: Gargalo operacional, escala limitada

**L7. Sem verificação de email**
- Link de pagamento enviado para email não verificado
- Candidato pode errar email e perder acesso
- Impacto: Suporte manual, risco de perda de candidatura

**L8. Sem 2FA/MFA**
- Badge "OTP" no login é cosmético, não implementado
- Sem TOTP, SMS ou email como segundo fator
- Impacto: Risco de acesso não autorizado ao portal

**L9. Página de status sem auto-refresh**
- Candidato precisa recarregar página manualmente
- Não há polling ou WebSocket para atualizações em tempo real
- Impacto: UX degradada, sensação de que "nada está acontecendo"

**L10. Tokens JWT em localStorage**
- Vulnerável a XSS (qualquer script malicioso pode roubar tokens)
- Melhor prática: HttpOnly cookies com SameSite
- Impacto: Risco de session hijacking

### 🟢 MENORES (melhorias desejáveis)

**L11.** Sem CSRF protection nos POSTs públicos
**L12.** Sem API versioning (/api/ ao invés de /api/v1/)
**L13.** Sem export de dados (CSV/PDF do histórico)
**L14.** Sem paginação na tabela de performance (30+ rows)
**L15.** Sem soft delete / GDPR compliance (dados persistem forever)
**L16.** Timezone do daily loss limit não especificado
**L17.** Sem audit de logout
**L18.** Webhook event detection baseada em shape do payload (frágil)

---

## 7. ANÁLISE DE SEGURANÇA

### O que está BEM
- Senhas hasheadas com bcrypt (12 rounds)
- Credenciais da plataforma criptografadas com AES-256-GCM
- Queries parametrizadas (sem SQL injection)
- RBAC (admin vs client) em todas as rotas
- Helmet.js para headers de segurança
- JWT com refresh token rotation
- Stripe webhook com verificação de assinatura
- Audit logging de ações críticas

### O que precisa MELHORAR
| Vulnerabilidade | Severidade | Solução |
|----------------|------------|---------|
| Sem rate limiting (login, submit, OTP) | CRÍTICA | Express-rate-limit ou Redis-based |
| localStorage para JWT | ALTA | HttpOnly cookies com SameSite=Strict |
| Submission code = acesso total sem auth | ALTA | Expirar código após pagamento, exigir auth depois |
| Min password 1 char no login | ALTA | Mudar para min 8 |
| Credenciais visíveis com toggle simples | ALTA | Re-auth para revelar, timer de expiração |
| Sem 2FA | MÉDIA | TOTP ou email OTP como segundo fator |
| Sem verificação de email | MÉDIA | Confirmar email antes de enviar payment link |
| Sem CSRF tokens | MÉDIA | csurf middleware nos POSTs |
| Default admin password no código | MÉDIA | Variável de ambiente ou forçar reset no primeiro login |
| Webhook secret comparado com !== | BAIXA | crypto.timingSafeEqual() |
| Sem GDPR (export/delete) | BAIXA | Endpoint de export + data retention policy |

---

## 8. ANÁLISE DE UI/UX

### Landing Page (9/10)
**Pontos fortes:** Animações elegantes, hierarquia visual clara, i18n completo, cards de planos informativos.
**Melhorias:** Regras exibidas devem vir do backend (não hardcoded). FAQ poderia mencionar cooldown e cenários de falha.

### Checkout (7/10)
**Pontos fortes:** Validação robusta de CPF, documento adapta por país, 3 etapas claras.
**Melhorias:**
- Step indicators poderiam ter mais destaque visual
- Campos de texto longo (motivação/consistência) com 20 chars mínimos são fáceis de burlar
- Falta resumo do plano escolhido com regras antes de submeter
- Falta indicador de progresso/loading durante submit

### Página de Status (6/10)
**Pontos fortes:** Timeline visual, código de rastreamento, informações completas.
**Melhorias:**
- Sem auto-refresh (candidato não sabe quando atualizar)
- Estado "submitted" (waitlist) não explica prazo estimado
- Falta barra de progresso visual do fluxo completo
- Seção de contas vinculadas aparece vazia por muito tempo (confuso)

### Portal de Login (8/10)
**Pontos fortes:** Visual clean, dark theme consistente, toggle de senha.
**Melhorias:**
- Badge "OTP" engana (não implementado)
- Sem indicador de caps lock
- Sem "lembrar-me" (trade-off segurança vs UX aceitável)

### Dashboard do Cliente (7/10)
**Pontos fortes:** KPIs claros, alertas dinâmicos, gráfico de equity, Edge Score visual.
**Melhorias:**
- Muita informação em uma tela só — considerar tabs ou seções colapsáveis
- TradeRoom card expõe senha com toggle simples
- Alertas não são actionable (dizem o que aconteceu mas não o que fazer)
- Sem notificações push/email quando algo muda

### Contas do Cliente (7/10)
**Pontos fortes:** Detalhamento completo por conta, barras de progresso por regra, histórico de P&L.
**Melhorias:**
- Tabela de performance sem paginação
- Sem export (CSV/PDF para declaração de impostos)
- Credenciais da plataforma visíveis com toggle simples
- Sem explicação do que acontece ao atingir cada threshold

### Dashboard do Admin (8/10)
**Pontos fortes:** KPIs operacionais, contas críticas destacadas, donut de distribuição.
**Melhorias:**
- Sem refresh automático (manual "Re-evaluate rules")
- Sem alertas proativos (notificação quando conta está próxima de breach)
- Sem trend analysis (evolução dos edge scores ao longo do tempo)

### Submissions do Admin (6/10)
**Pontos fortes:** Pipeline completo, busca, filtros, modal de inspeção detalhada.
**Melhorias:**
- Modal de inspeção é DENSO — difícil escanear rapidamente
- Sem bulk actions (aprovar/rejeitar múltiplos)
- Link de pagamento precisa ser colado manualmente (propenso a erro)
- Sem indicador visual de tempo na fila (há quanto tempo está esperando)
- Sem priorização automática (quem deveria ser atendido primeiro)

---

## 9. ROADMAP DE REFINAMENTO

### FASE 0 — Security Hardening (Semana 1-2)
> Pré-requisito absoluto para produção.

- [ ] **Rate limiting**: express-rate-limit em `/api/auth/login` (5/min), `/api/public/submissions` (3/min), `/api/public/password/*` (3/min)
- [ ] **Min password = 8**: Alterar schema de login para `.min(8)`
- [ ] **Submission code expiration**: Após status = `access_ready`, exigir auth para acessar detalhes. Código público só mostra status genérico
- [ ] **Re-auth para credenciais**: Exigir senha do portal para revelar platform password no client dashboard
- [ ] **CSRF tokens**: Middleware csurf nos endpoints POST públicos
- [ ] **Webhook timing-safe compare**: `crypto.timingSafeEqual()` para comparação de secrets
- [ ] **Remover default admin password do código**: Usar env var ou forçar configuração no primeiro boot
- [ ] **Audit de logout**: Registrar logout no audit_logs

### FASE 1 — UX Essencial (Semana 2-4)
> Tornar o fluxo claro e profissional.

- [ ] **Auto-refresh na página de status**: Polling a cada 30s, ou WebSocket
- [ ] **Barra de progresso no status page**: Visualizar "submitted → payment → review → access → account" como steps visuais com check marks
- [ ] **Tempo estimado na waitlist**: Mostrar "sua candidatura será analisada em até 24h" ou timestamp de submissão + tempo médio
- [ ] **Email de verificação**: Antes de liberar payment link, enviar OTP de confirmação de email
- [ ] **Resumo do plano no checkout**: Antes do submit final, mostrar card com plano + regras + valor que será cobrado
- [ ] **Loading states melhorados**: Skeleton loaders em todos os dashboards, não só spinners genéricos
- [ ] **Remover badge "OTP" do login** até implementar 2FA de verdade
- [ ] **Alertas actionable no client dashboard**: "Seu drawdown está em 78% — considere reduzir exposição" ao invés de só "drawdown em 78%"
- [ ] **Modal de inspeção do admin em tabs**: Separar "Perfil do Candidato", "Pagamento", "Ações", "Plataforma" em tabs dentro do modal

### FASE 2 — Automação Operacional (Semana 4-6)
> Reduzir trabalho manual do admin de 5 cliques para 1.

- [ ] **Auto-provision após pagamento**: Quando webhook confirma pagamento, auto-criar portal user + account + platform user (desabilitar waitlist como opção configurável)
- [ ] **Bulk actions no admin**: Checkbox em múltiplas submissions → "Aprovar selecionados", "Liberar pagamento"
- [ ] **Geração automática de checkout URL**: Ao liberar pagamento, criar Stripe checkout session automaticamente ao invés de colar link manualmente
- [ ] **Notificações admin**: Email/push quando nova submission chega, quando pagamento confirmado, quando conta está em risco crítico
- [ ] **Queue priority**: Ordenar submissions por tempo de espera, com badge de urgência
- [ ] **Templates de admin notes**: Dropdown com motivos pré-definidos para rejeição ("Documentação incompleta", "Perfil inconsistente", etc.)

### FASE 3 — Sync & Rules Engine (Semana 6-10)
> Integrar com plataforma de trading para dados em tempo real.

- [ ] **Webhook receiver da plataforma de trading**: Receber trade events em tempo real (já parcialmente implementado)
- [ ] **Auto-sync de saldo/P&L**: Quando trade event chega, atualizar account.balance e account.todayPnl automaticamente
- [ ] **Rules engine automática**: Executar `evaluateAccount()` após cada sync, não apenas manual
- [ ] **Daily EOD job**: Ao final do dia (timezone configurável), resetar todayPnl, criar performance point, verificar timeout
- [ ] **Regras dinâmicas no frontend**: Landing page e checkout buscam regras do backend (GET /api/public/plans com regras), não hardcoded
- [ ] **Timezone handling**: Campo de timezone no perfil do cliente, daily loss limit calculado no timezone local
- [ ] **Cooldown UX**: Quando conta entra em cooldown, mostrar countdown "Pode refazer em X dias" com data exata

### FASE 4 — Portal Profissional (Semana 10-14)
> Elevar a experiência do cliente e admin ao nível de prop firms profissionais.

#### Cliente
- [ ] **Paginação + export**: Tabela de performance com paginação, botão "Exportar CSV" e "Exportar PDF"
- [ ] **Notificações in-app**: Bell icon no portal com notificações de mudança de status, breach, fase alcançada
- [ ] **Trading journal**: Seção para o trader anotar raciocínio por operação (optional)
- [ ] **Solicitação de payout**: Formulário para trader solicitar saque quando approved_for_funded
- [ ] **Histórico de candidaturas**: Ver todas as submissions anteriores (não só a ativa)
- [ ] **Password self-service**: Trocar senha do portal sem OTP, com validação da senha atual

#### Admin
- [ ] **Dashboard com trends**: Gráficos de evolução (pass rate, failure rate, receita por plano, tempo médio de avaliação)
- [ ] **Alertas proativos**: Push/email quando conta está a <2% de breach, quando candidato está há >48h sem resposta
- [ ] **User timeline**: Ver toda a jornada de um usuário (submissions → payments → accounts → events) em uma timeline unificada
- [ ] **Role management UI**: Promover client para admin ou criar admin diretamente no painel
- [ ] **Data retention**: Purge automático de dados antigos (submissions canceladas > 90 dias, audit logs > 1 ano)

### FASE 5 — 2FA & Compliance (Semana 14-18)
> Segurança enterprise e conformidade regulatória.

- [ ] **2FA TOTP**: Implementar autenticação de dois fatores com Google Authenticator / Authy
- [ ] **HttpOnly cookies**: Migrar JWT de localStorage para cookies seguros
- [ ] **Session management**: Listar sessões ativas, forçar logout remoto
- [ ] **GDPR endpoints**: GET /api/me/export (download de dados pessoais), DELETE /api/me (solicitar exclusão)
- [ ] **Consent tracking**: Log de aceite de termos por versão + timestamp
- [ ] **IP blocking**: Rate limit por IP + blacklist de IPs suspeitos
- [ ] **Penetration test**: Contratar pentest externo antes de scale

### FASE 6 — Scale & Performance (Semana 18+)
> Preparar para volume.

- [ ] **API versioning**: Prefixo /api/v1/
- [ ] **CDN para frontend**: Deploy no Vercel com edge caching
- [ ] **Backend em VPS dedicado**: Sair do Render para Contabo/Hetzner com PM2
- [ ] **Database connection pooling**: PgBouncer entre app e Supabase
- [ ] **Caching**: Redis para planos, settings, e listas de accounts
- [ ] **Monitoring**: Sentry para erros, Grafana para métricas, uptime monitoring
- [ ] **Load testing**: Simular 100 submissions simultâneas, 50 login attempts/sec
- [ ] **Code splitting**: Lazy load das rotas do portal (bundle > 1MB atualmente)

---

## 10. SCORECARD ATUAL

| Dimensão | Nota | Observação |
|----------|------|------------|
| Landing Page Design | 9/10 | Animações elegantes, messaging claro |
| Checkout Flow | 7/10 | Validação robusta, falta resumo final |
| Portal UX (Cliente) | 7/10 | Dashboards informativos, mas densos |
| Portal UX (Admin) | 6/10 | Funcional mas manual e denso |
| Status/Tracking Page | 6/10 | Sem auto-refresh, waitlist confusa |
| Backend Architecture | 7/10 | REST sólido, bom middleware |
| Rules Engine | 7/10 | Lógica correta, falta auto-trigger |
| Segurança | 5/10 | Basics ok, falta rate limit + 2FA |
| Data Model | 8/10 | Completo, bem tipado |
| i18n | 8/10 | PT/EN/ES, poucos strings hardcoded |
| Documentação | 3/10 | Sem API docs, sem guia de contribuição |
| Testes | 0/10 | Zero testes automatizados |

**Score geral: 6.1/10** — Funcional para beta fechado, precisa das fases 0-2 para produção real.

---

## 11. DECISÕES ARQUITETURAIS REGISTRADAS

1. **Waitlist mode ativo**: Checkout NÃO redireciona para pagamento. Admin controla quando liberar link. Razão: controle de qualidade sobre candidatos antes de aceitar pagamento.

2. **Auto-provisioning desabilitado no modo waitlist**: Quando admin libera pagamento e candidato paga, o sistema auto-provisiona (portal user + account + platform). Mas no momento do submit, nada automático acontece.

3. **Novus como fallback de Stripe**: Links de pagamento do Novus são estáticos. Stripe é preferido quando configurado.

4. **AES-256-GCM para credenciais**: Senhas da plataforma de trading criptografadas at rest. Chave derivada do PROP_DATA_SECRET via scrypt.

5. **Edge Score proprietário**: Métrica composta (progress 35% + risk discipline 35% + consistency 30% - penalties). Não é padrão de mercado, é internal scoring.

6. **Pooler first**: Conexão com Supabase prioriza pooler URL (IPv4) sobre conexão direta (pode falhar após pause do projeto).

---

## 12. CREDENCIAIS DE ACESSO (DEV)

| Papel | Email | Senha |
|-------|-------|-------|
| Admin | admin@everwin.trade | Admin@2026 |
| Client | client@everwin.trade | (hash no banco, resetar se necessário) |
| Client Demo | cliente.demo@everwin.trade | (hash no banco) |

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8787
- Landing Prop: http://localhost:5173/prop
- Login Portal: http://localhost:5173/prop/login
- Admin Dashboard: http://localhost:5173/prop/admin/dashboard
- Admin Submissions: http://localhost:5173/prop/admin/submissions

---

*Documento vivo. Atualizar conforme mudanças forem implementadas.*
