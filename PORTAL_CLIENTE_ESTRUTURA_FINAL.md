# PORTAL DO CLIENTE — ESTRUTURA FINAL COMPLETA

> Documento de referência para implementação. Não implementar sem confirmar com o usuário.
> Baseado na análise completa do módulo `src/modules/prop-system/`.

---

## DIAGNÓSTICO: PROBLEMAS ATUAIS

### 1. Sidebar — Só 2 itens, sem hierarquia
```
ATUAL:        PROBLEMA:
──────────    ─────────────────────────────────────────────────────
Dashboard     → Redundante com AccountsPage, não diz nada
Minhas Contas → Despejado, mistura informações de naturezas diferentes
```

### 2. ClientAccountsPage — Informações soltas
- Não mostra credenciais de acesso (login/senha da corretora)
- Não tem link para o TradeRoom
- Metas não têm barras de progresso visuais
- Não tem histórico de dias (tabela)
- Regras do plano ficam em `StatPill` sem contexto
- O card final repete o mesmo título de `SectionHeader`

### 3. ClientDashboardPage — Layout genérico
- Não diz "bom dia, você tem X contas, sua principal está [status]"
- `mainAccount` = conta mais recentemente atualizada (não necessariamente a mais relevante)
- Insights são textos fixos, não refletem dados reais do usuário
- KPIs não têm estado vazio tratado de forma clara

### 4. Tipos faltando (PropAccount)
```typescript
platformName?: string;        // "MetaTrader 5" / "cTrader" / "xStation"
tradeRoomUrl?: string;        // Link direto para a plataforma
brokerName?: string;          // "Equiti" / "Eightcap" etc.
```

### 5. Sem página de perfil do cliente
- Não há `/prop/client/profile`
- Dados do `PropUser` (name, email, status) ficam só no sidebar

---

## ESTRUTURA FINAL

### ROTAS DO CLIENTE (atualizado)

```
/prop/client/dashboard    → ClientDashboardPage   ← boas vindas + overview
/prop/client/accounts     → ClientAccountsPage    ← detalhes das contas
/prop/client/profile      → ClientProfilePage     ← [NOVO] perfil + segurança
```

### SIDEBAR (atualizado)

```
┌─────────────────────────────────┐
│  [Everwin Logo]                 │
│  PROP TRADING CENTER            │
│  Painel do Operador             │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │  João da Silva      [ativo]│  │
│  │  joao@email.com           │  │
│  │  ─────────────────────    │  │
│  │  Operador    |    Ativo   │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  NAVEGAÇÃO                      │
│  → Início         (dashboard)   │
│  → Minhas Contas  (accounts)    │
│  → Meu Perfil     (profile)     │ ← [NOVO]
├─────────────────────────────────┤
│  [Sair]                         │
│  [Ver Landing Page]             │
└─────────────────────────────────┘
```

---

## PÁGINA 1: DASHBOARD (redesign)

**Rota:** `/prop/client/dashboard`

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Bom dia, João!                                                  │
│  Você tem 2 contas no programa — 1 ativa, 1 aprovada.           │
│  Última atualização: 26/03/2026 às 14:32                        │
└─────────────────────────────────────────────────────────────────┘

[ CONTAS ATIVAS: 1 ] [ APROVADAS: 1 ] [ FALHADAS: 0 ] [ SALDO TOTAL: R$ 56.800 ]

─── CONTA PRINCIPAL ────────────────────────────────────────────────
┌─────────────────────────────────┬──────────────────────────────┐
│  EVW-50002 — BRL 50K Fase 1    │        [Gráfico Equity]      │
│  ██████████░░░░  64% meta       │                              │
│  Saldo: R$ 53.200               │                              │
│  P&L Hoje: +R$ 420              │      [Edge Score: 72]        │
│  Dias: 8/5 ✓  Prazo: 22 dias   │                              │
│  [Ver detalhes →]               │                              │
└─────────────────────────────────┴──────────────────────────────┘

─── TODAS AS CONTAS ────────────────────────────────────────────────
  [EVW-50002]  BRL 50K  Fase 1  ● Ativa     R$ 53.200  +2.1%  [Ver →]
  [EVW-25003]  BRL 25K  Fase 2  ✓ Aprovada  R$ 29.100  +6.4%  [Ver →]

─── ALERTAS DO DIA ─────────────────────────────────────────────────
  ⚠ EVW-50002: Loss diário disponível: R$ 1.080 / R$ 1.500 (72%)
  ✓ Você operou em 8 dias — meta mínima (5 dias) já atingida!
```

### Componentes Necessários

| Componente | Descrição |
|------------|-----------|
| `WelcomeBanner` | Greeting dinâmico + contagem de contas + última sync |
| `KpiCard` (existente) | 4 KPIs de resumo |
| `MainAccountCard` | Card da conta mais relevante com progress bar + link |
| `AccountQuickRow` | Linha de conta com status, saldo, P&L, botão de detalhe |
| `DayAlertBanner` | Alertas dinâmicos baseados nos dados reais do dia |
| `InteractiveLineChart` (existente) | Curva da conta principal |
| `EdgeScoreDial` (existente) | Score da conta principal |

### Lógica de "conta principal"
```typescript
// Ordem de prioridade:
// 1. Conta ativa com maior progress score
// 2. Conta em cooldown (mais recente)
// 3. Conta passada mais recente
// 4. Qualquer conta ordenada por updatedAt desc
const mainAccount = accountViews
  .filter(v => v.account.status === 'active')
  .sort((a, b) => b.analytics.progressScore - a.analytics.progressScore)[0]
  ?? accountViews.sort((a, b) => b.account.updatedAt.localeCompare(a.account.updatedAt))[0];
```

### Alertas Dinâmicos (DayAlertBanner)
```typescript
type AlertItem = {
  type: 'warning' | 'success' | 'danger' | 'info';
  accountId: string;
  message: string;
};

// Regras de geração de alertas:
// - remainingDailyLossBeforePause < 20% dailyLossLimit → ⚠ "Loss diário crítico"
// - isDailyLimitBreached → 🔴 "Conta pausada por DLL"
// - isPhaseTargetMet && daysTraded >= minTradingDays → ✓ "Meta atingida, aguardando avaliação"
// - remainingDrawdownBeforeBreach < 30% → ⚠ "Drawdown próximo do limite"
// - daysTraded >= minTradingDays → ✓ "Dias mínimos atingidos"
// - endDate - now < 5 dias → ⚠ "Prazo expira em X dias"
```

---

## PÁGINA 2: MINHAS CONTAS (redesign)

**Rota:** `/prop/client/accounts`

### Layout Geral

```
[SectionHeader] — Minhas Contas / Detalhes das suas avaliações

[Tabs de seleção de conta]
  [EVW-50002 ●]  [EVW-25003 ✓]  [+ nova conta]

════ SEÇÃO 1: CREDENCIAIS DE ACESSO ══════════════════════════════

┌──────────────────────────────────────────────────────────────────┐
│  ACESSO À PLATAFORMA                                             │
├──────────────────────────────────────────────────────────────────┤
│  Plataforma    MetaTrader 5                                      │
│  Corretora     Equiti                                            │
│  Login         EVW50002.teste         [Copiar]                  │
│  Senha         ••••••••••••           [Mostrar] [Copiar]        │
│  TradeRoom     https://traderoom...   [Abrir →]                  │
└──────────────────────────────────────────────────────────────────┘

════ SEÇÃO 2: MÉTRICAS EM TEMPO REAL ═════════════════════════════

[ SALDO ]        [ P&L HOJE ]     [ P&L TOTAL ]    [ DIAS ]
 R$ 53.200        +R$ 420          +R$ 3.200         8/5 ✓
 (inicial:        (+0.79%)         (+6.4%)           Fase 1
  R$ 50.000)

════ SEÇÃO 3: METAS E REGRAS DO PLANO ════════════════════════════

 REGRAS BRL 50K — FASE 1 DE 2
┌──────────────────────────────────────────────────────────────────┐
│  Meta de Lucro F1    10% = R$ 5.000                             │
│  ████████████████░░░░░░░░░░░░░░  64%  (R$ 3.200 de R$ 5.000)   │
│                                                                  │
│  Drawdown Máximo     5% = R$ 2.500                              │
│  ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░  14%  (R$ 350 usados)          │
│                                                                  │
│  Loss Diário         3% = R$ 1.500                              │
│  ████████░░░░░░░░░░░░░░░░░░░░░░  28%  (R$ 420 usados hoje)     │
│                                                                  │
│  Dias Mínimos        5 dias                    8/5  ✓ Atingido  │
│                                                                  │
│  Prazo da Fase       30 dias   início: 01/03   fim: 30/03       │
│  ████████████████████████████░░  93%  22 dias restantes         │
└──────────────────────────────────────────────────────────────────┘

 STATUS DA CONTA
┌──────────────────────────────────────────────────────────────────┐
│  Status Atual    ● Ativa                                         │
│  Fase Atual      Fase 1 de 2                                     │
│  Início          01/03/2026                                      │
│  Encerramento    30/03/2026                                      │
│  Plano           BRL 50K / R$ 874                                │
│  Edge Score      72 / 100                                        │
└──────────────────────────────────────────────────────────────────┘

════ SEÇÃO 4: ANÁLISE DE PERFORMANCE ═════════════════════════════

┌─────────────────────────────────────┬────────────────────────────┐
│  [Gráfico Equity]                   │  [EdgeScoreDial]           │
│  — linha de meta (10%)              │  Pontuação Geral: 72       │
│  — linha de drawdown máx (5%)       │                            │
│  Filtros: 7d | 30d | tudo           │  Progresso:     64 / 100  │
│                                     │  Consistência:  78 / 100  │
│                                     │  Disciplina:    85 / 100  │
└─────────────────────────────────────┴────────────────────────────┘

════ SEÇÃO 5: HISTÓRICO DE DIAS ══════════════════════════════════

┌──────┬───────────┬──────────────┬────────────────────────────────┐
│ Data │   P&L     │    Saldo     │   Observação                   │
├──────┼───────────┼──────────────┼────────────────────────────────┤
│ 26/03│ +R$ 420   │ R$ 53.200   │ Dia 8 ✓                       │
│ 25/03│ +R$ 800   │ R$ 52.780   │ Dia 7 ✓                       │
│ 24/03│ -R$ 120   │ R$ 51.980   │ Dia 6                          │
│ 23/03│ +R$ 280   │ R$ 52.100   │ Dia 5 ✓ (meta mínima!)       │
│ 22/03│  R$  0    │ R$ 51.820   │ Sem operações                  │
│ 21/03│ -R$ 420   │ R$ 51.820   │ Dia 4  ⚠ DLL (R$ 420/R$ 1.5k)│
│  ... │    ...    │    ...      │    ...                         │
└──────┴───────────┴──────────────┴────────────────────────────────┘

════ SEÇÃO 6: AVISO LEGAL ════════════════════════════════════════
  [Texto legal do plano — já existente]
```

### Componentes Necessários

| Componente | Novo | Descrição |
|------------|------|-----------|
| `AccountSelectorTabs` | Novo | Tabs de seleção (substituir Button group) |
| `AccountCredentialsCard` | Novo | Login, senha com toggle, traderoom |
| `AccountMetricsStrip` | Novo | 4 métricas rápidas com ícones e helpers |
| `PlanRulesCard` | Novo | Regras do plano com progress bars |
| `AccountStatusCard` | Novo | Status, fase, datas, plano, edge score |
| `InteractiveLineChart` | Existente | Com linhas de referência adicionadas |
| `EdgeScoreDial` | Existente | + breakdown dos 3 sub-scores |
| `PerformanceHistoryTable` | Novo | Tabela de dias com P&L e flags |

---

## PÁGINA 3: MEU PERFIL (nova)

**Rota:** `/prop/client/profile`

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  MEU PERFIL                                                      │
│  Gerencie seus dados de acesso ao portal                        │
└─────────────────────────────────────────────────────────────────┘

 DADOS PESSOAIS
┌──────────────────────────────────────────────────────────────────┐
│  Nome         João da Silva                    [Não editável]    │
│  Email Portal joao@email.com                   [Não editável]    │
│  Email Origin joao.origem@email.com            [Não editável]    │
│  Status       ● Ativo                                            │
│  Membro desde 01/01/2026                                         │
└──────────────────────────────────────────────────────────────────┘

 SEGURANÇA (futuro — depende de backend)
┌──────────────────────────────────────────────────────────────────┐
│  Senha Portal  ••••••••••              [Alterar senha]           │
│  Última sessão 26/03/2026 às 14:32                               │
└──────────────────────────────────────────────────────────────────┘

 PREFERÊNCIAS
┌──────────────────────────────────────────────────────────────────┐
│  Idioma        [Português ▼] [English] [Español]                 │
└──────────────────────────────────────────────────────────────────┘

 MINHAS AVALIAÇÕES — RESUMO
┌──────────────────────────────────────────────────────────────────┐
│  Total de contas:   2                                            │
│  Contas ativas:     1                                            │
│  Contas aprovadas:  1                                            │
│  Contas falhadas:   0                                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## ALTERAÇÕES NOS TIPOS (types.ts)

### PropAccount — adicionar 3 campos opcionais

```typescript
export interface PropAccount {
  // ... campos existentes ...

  // NOVO — dados da plataforma
  platformName?: string;      // ex: "MetaTrader 5" | "cTrader" | "xStation"
  tradeRoomUrl?: string;      // ex: "https://traderoom.evwin.trade/EVW50002"
  brokerName?: string;        // ex: "Equiti" | "Eightcap"
}
```

### CreateAccountInput — adicionar mesmos campos

```typescript
export interface CreateAccountInput {
  // ... existentes ...
  platformName?: string;
  tradeRoomUrl?: string;
  brokerName?: string;
}
```

---

## ALTERAÇÕES NAS ROTAS (Routes.tsx)

```typescript
// Adicionar dentro do bloco RequireRole client:
{ path: "profile", element: <ClientProfilePage /> }

// Sidebar links (PropPortalLayout.tsx):
[
  { to: "/prop/client/dashboard",  label: t("nav_client_dashboard")  },
  { to: "/prop/client/accounts",   label: t("nav_client_accounts")   },
  { to: "/prop/client/profile",    label: t("nav_client_profile")    }, // NOVO
]
```

---

## NOVOS COMPONENTES — ESPECIFICAÇÃO

### 1. AccountCredentialsCard

```typescript
interface AccountCredentialsCardProps {
  platformLogin: string;
  platformPassword: string;
  platformName?: string;
  brokerName?: string;
  tradeRoomUrl?: string;
}
```

**Comportamento:**
- Senha oculta por padrão (toggle mostrar/ocultar)
- Botão "Copiar" em cada campo (feedback visual de 2s)
- Link TradeRoom abre em nova aba (`target="_blank"`)
- Se tradeRoomUrl não existir: mostrar badge "A ser configurado"

---

### 2. PlanRulesCard

```typescript
interface PlanRulesCardProps {
  account: PropAccount;
  plan: PlanTemplate;
  analytics: AccountAnalytics;
}
```

**Cada regra deve exibir:**
- Nome da regra
- Valor absoluto (calculado do plano)
- Progresso atual (barra horizontal)
- Percentual atual

**Barras de progresso:**

| Regra | Valor Base | Progresso | Cor |
|-------|-----------|-----------|-----|
| Meta F1 | `plan.profitTargetPhase1Pct * account.initialBalance / 100` | `analytics.progressScore` | Emerald |
| Drawdown Máx | `plan.maxDrawdownPct * account.initialBalance / 100` | `(maxAllowedLoss - remainingDD) / maxAllowedLoss * 100` | Amber (vai piorando) |
| Loss Diário | `plan.dailyLossLimitPct * account.initialBalance / 100` | `(dailyLossLimit - remainingDLL) / dailyLossLimit * 100` | Amber |
| Dias Mínimos | `plan.minTradingDays` | `account.daysTraded / plan.minTradingDays * 100` | Emerald |
| Prazo da Fase | `plan.durationDays` | dias decorridos / durationDays * 100 | Slate |

**Cor do progresso (drawdown/loss):**
- < 50% → emerald (seguro)
- 50–75% → amber (atenção)
- > 75% → red (crítico)

---

### 3. PerformanceHistoryTable

```typescript
interface PerformanceHistoryTableProps {
  series: DailyPerformancePoint[];
  initialBalance: number;
  dailyLossLimit: number;
  language?: string;
}
```

**Colunas:**
- Data
- P&L (colorido: verde positivo, vermelho negativo)
- Saldo
- Flag: dia operado (✓), DLL atingida (⚠), sem operação (—)

**Ordenação:** mais recente primeiro

---

### 4. AccountMetricsStrip

```typescript
interface AccountMetricsStripProps {
  account: PropAccount;
  analytics: AccountAnalytics;
  plan: PlanTemplate;
  language?: string;
}
```

**4 cards em grid:**
1. Saldo atual + saldo inicial
2. P&L Hoje + variação %
3. P&L Total + variação %
4. Dias Operados / Dias Mínimos + fase

---

### 5. WelcomeBanner (Dashboard)

```typescript
interface WelcomeBannerProps {
  userName: string;
  accountCount: number;
  activeCount: number;
  passedCount: number;
  failedCount: number;
  lastSync?: string;
}
```

**Texto dinâmico:**
- 0 contas: "Você não tem contas ativas. Aguarde a configuração."
- 1 conta ativa: "Você tem 1 conta ativa no programa."
- N contas: "Você tem N contas — X ativas, Y aprovadas."

---

### 6. DayAlertBanner (Dashboard)

```typescript
interface AlertItem {
  type: 'warning' | 'success' | 'danger' | 'info';
  accountId: string;
  message: string;
}
```

**Regras de alerta (em ordem de prioridade):**

```typescript
function buildAlerts(views: AccountView[]): AlertItem[] {
  const alerts: AlertItem[] = [];

  for (const { account, plan, analytics } of views) {
    const { snapshot } = analytics;

    // CRÍTICO: DLL atingida
    if (snapshot.isDailyLimitBreached) {
      alerts.push({ type: 'danger', accountId: account.accountId,
        message: 'Limite de perda diário atingido — conta pausada hoje.' });
    }

    // CRÍTICO: drawdown próximo
    const ddPct = (snapshot.maxAllowedLoss - snapshot.remainingDrawdownBeforeBreach) / snapshot.maxAllowedLoss;
    if (ddPct > 0.75 && !snapshot.isHardBreach) {
      alerts.push({ type: 'danger', accountId: account.accountId,
        message: `Drawdown em ${(ddPct * 100).toFixed(0)}% do limite. Tome cuidado!` });
    }

    // ATENÇÃO: loss diário > 60%
    const dllPct = (snapshot.dailyLossLimit - snapshot.remainingDailyLossBeforePause) / snapshot.dailyLossLimit;
    if (dllPct > 0.6 && !snapshot.isDailyLimitBreached) {
      alerts.push({ type: 'warning', accountId: account.accountId,
        message: `Loss diário em ${(dllPct * 100).toFixed(0)}% — disponível: R$ ${snapshot.remainingDailyLossBeforePause.toFixed(0)}` });
    }

    // ATENÇÃO: prazo expirando em 5 dias
    const daysLeft = Math.ceil((new Date(account.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 5 && daysLeft > 0 && account.status === 'active') {
      alerts.push({ type: 'warning', accountId: account.accountId,
        message: `Prazo da fase expira em ${daysLeft} dia(s).` });
    }

    // SUCESSO: dias mínimos atingidos
    if (account.daysTraded >= plan.minTradingDays) {
      alerts.push({ type: 'success', accountId: account.accountId,
        message: `${account.daysTraded} dias operados — meta mínima (${plan.minTradingDays}) atingida!` });
    }

    // SUCESSO: meta de lucro atingida
    if (snapshot.isPhaseTargetMet) {
      alerts.push({ type: 'success', accountId: account.accountId,
        message: `Meta da Fase ${account.phase} atingida! Aguardando avaliação.` });
    }
  }

  return alerts;
}
```

---

## ALTERAÇÕES NO AdminAccountsPage

O formulário de criar conta precisa dos novos campos:
- `platformName` (input text)
- `tradeRoomUrl` (input url)
- `brokerName` (input text)

O modal de Inspect precisa mostrar:
- `platformName`, `brokerName`, `tradeRoomUrl` como campos editáveis

---

## CHAVES i18n — ADIÇÕES

```typescript
// propSupplemental.ts — adicionar nas 3 linguagens:

// Sidebar
"prop_portal.layout.nav_client_profile": "Meu Perfil" | "My Profile" | "Mi Perfil"

// Credentials card
"prop_portal.client_accounts.credentials_title": "Acesso à Plataforma"
"prop_portal.client_accounts.platform_login": "Login"
"prop_portal.client_accounts.platform_password": "Senha"
"prop_portal.client_accounts.platform_name": "Plataforma"
"prop_portal.client_accounts.broker_name": "Corretora"
"prop_portal.client_accounts.trade_room_link": "Link TradeRoom"
"prop_portal.client_accounts.copy": "Copiar"
"prop_portal.client_accounts.copied": "Copiado!"
"prop_portal.client_accounts.show_password": "Mostrar"
"prop_portal.client_accounts.hide_password": "Ocultar"
"prop_portal.client_accounts.open_trade_room": "Abrir TradeRoom"
"prop_portal.client_accounts.pending_config": "A configurar"

// Rules card
"prop_portal.client_accounts.rules_title": "Regras e Metas"
"prop_portal.client_accounts.rule_profit_target": "Meta de Lucro"
"prop_portal.client_accounts.rule_max_drawdown": "Drawdown Máximo"
"prop_portal.client_accounts.rule_daily_loss": "Loss Diário"
"prop_portal.client_accounts.rule_min_days": "Dias Mínimos"
"prop_portal.client_accounts.rule_deadline": "Prazo da Fase"
"prop_portal.client_accounts.rule_achieved": "Atingido ✓"
"prop_portal.client_accounts.rule_days_left": "{{n}} dias restantes"

// Metrics strip
"prop_portal.client_accounts.metric_balance": "Saldo Atual"
"prop_portal.client_accounts.metric_pnl_today": "P&L Hoje"
"prop_portal.client_accounts.metric_pnl_total": "P&L Total"
"prop_portal.client_accounts.metric_trading_days": "Dias Operados"

// History table
"prop_portal.client_accounts.history_title": "Histórico de Dias"
"prop_portal.client_accounts.history_date": "Data"
"prop_portal.client_accounts.history_pnl": "P&L"
"prop_portal.client_accounts.history_balance": "Saldo"
"prop_portal.client_accounts.history_note": "Observação"

// Welcome banner
"prop_portal.client_dashboard.welcome": "Bom dia, {{name}}!"
"prop_portal.client_dashboard.account_summary_active": "Você tem {{n}} conta(s) ativa(s) no programa."
"prop_portal.client_dashboard.no_accounts_message": "Aguardando configuração da sua conta."

// Profile page
"prop_portal.client_profile.title": "Meu Perfil"
"prop_portal.client_profile.description": "Gerencie seus dados de acesso"
"prop_portal.client_profile.section_personal": "Dados Pessoais"
"prop_portal.client_profile.name": "Nome"
"prop_portal.client_profile.email": "Email do Portal"
"prop_portal.client_profile.primary_email": "Email Principal"
"prop_portal.client_profile.member_since": "Membro desde"
"prop_portal.client_profile.section_security": "Segurança"
"prop_portal.client_profile.section_preferences": "Preferências"
"prop_portal.client_profile.section_summary": "Minhas Avaliações"
"prop_portal.client_profile.language": "Idioma"
```

---

## MAPA DE IMPLEMENTAÇÃO — ORDEM DE EXECUÇÃO

### Etapa 1 — Tipos e Backend (sem UI)
1. `types.ts` → adicionar `platformName`, `tradeRoomUrl`, `brokerName`
2. `AdminAccountsPage` → adicionar campos no form + inspect modal

### Etapa 2 — Componentes Novos
3. `AccountCredentialsCard.tsx`
4. `AccountMetricsStrip.tsx`
5. `PlanRulesCard.tsx`
6. `PerformanceHistoryTable.tsx`
7. `WelcomeBanner.tsx`
8. `DayAlertBanner.tsx`
9. `MainAccountCard.tsx`

### Etapa 3 — Páginas
10. `ClientAccountsPage.tsx` → reescrever com os novos componentes
11. `ClientDashboardPage.tsx` → reescrever com WelcomeBanner + alertas + MainAccountCard
12. `ClientProfilePage.tsx` → criar do zero

### Etapa 4 — Navegação e i18n
13. `PropPortalLayout.tsx` → adicionar item "Meu Perfil" no sidebar
14. `Routes.tsx` → adicionar rota `/prop/client/profile`
15. `propSupplemental.ts` → adicionar todas as novas chaves (pt/en/es)

---

## REGRAS DE DESIGN

- Arredondamento: `rounded-[20px]` nos cards principais, `rounded-[14px]` nos campos internos
- Fonte: `font-bricolage_grotesque` em tudo
- Cores de progresso:
  - 0–49%: `bg-emerald-500` (bom)
  - 50–74%: `bg-amber-400` (atenção)
  - 75–100%: `bg-red-500` (crítico)
- Cor de "boa métrica" (menos é melhor, ex: drawdown): invertida
- Sombra padrão: `shadow-[0_24px_48px_-40px_rgba(15,23,42,0.18)]`
- Border: `border-slate-200/90`
- Background card: `bg-white/90`

---

## RESUMO EXECUTIVO

| Área | Mudança | Impacto |
|------|---------|---------|
| Sidebar | +1 link (Meu Perfil) | Baixo |
| ClientDashboardPage | Reescrever com WelcomeBanner + alertas | Médio |
| ClientAccountsPage | Reescrever com 6 seções | Alto |
| ClientProfilePage | Criar do zero | Médio |
| types.ts | +3 campos opcionais | Baixo |
| AdminAccountsPage | +3 campos no form/modal | Baixo |
| propSupplemental.ts | ~30 novas chaves (×3 idiomas) | Médio |
| Routes.tsx | +1 rota | Baixo |

**Total de arquivos afetados: ~10**
**Novos componentes: 8**
**Novas páginas: 1**
