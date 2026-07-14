# Estrutura Final do Portal do Cliente

## 1. Sidebar (Navegação)

### Itens Atuais:
- Dashboard
- Minhas Contas

### Itens Propostos:
- **Início** (dashboard resumido)
- **Minhas Contas** (listagem + detalhes)
- **Progresso** (métricas gerais do cliente)
- **Minha Conta** (perfil do usuário)

---

## 2. Página de Accounts - Estrutura Nova

### 2.1 Header da Conta
```
┌─────────────────────────────────────────────────────────────┐
│  CONTA: EVW-ACCT-50002          [Status Badge]    [Fase 1] │
│  Plano: BRL 50K                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Seção: Credenciais de Acesso
| Campo | Valor | Ação |
|-------|-------|------|
| Login | `teste.login@broker.local` | Copiar |
| Senha | `••••••••••` | Mostrar |
| Plataforma | MetaTrader 5 | - |
| Link TradeRoom | `https://traderoom.evwin.trade/...` | Abrir |

### 2.3 Seção: Métricas em Tempo Real
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   SALDO      │   P&L HOJE   │  P&L TOTAL   │  DIAS ATIVOS │
│  R$ 50.000   │    R$ 280    │   +R$ 1.250  │     8/5      │
│  inicial:    │              │              │              │
│  R$ 50.000   │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 2.4 Seção: Regras e Metas (Parametrizadas por Plano)
```
┌─────────────────────────────────────────────────────────────┐
│                    REGRAS DO PLANO BRL 50K                  │
├─────────────────────────────────────────────────────────────┤
│  Meta Fase 1:        10%  (R$ 5.000)          [██████░░░] 64%│
│  Meta Fase 2:        15%  (R$ 7.500)                        │
│  Drawdown Máximo:     5%  (R$ 2.500)          [██░░░░░░░] 20%│
│  Loss Diário:         3%  (R$ 1.500)          [░░░░░░░░░░]  0%│
│  Dias Mínimos:        5                         [████████░] 80%│
│  Prazo Total:        30 dias                  [██████████] 26%│
└─────────────────────────────────────────────────────────────┘
```

### 2.5 Seção: Gráfico de Equity
- Curva de saldo ao longo do tempo
- Linha de meta (10%)
- Linha de drawdown máx (5%)
- Zoom por período (7d, 30d, 90d, Tudo)

### 2.6 Seção: Histórico de Performance
| Data | P&L | Saldo | Observação |
|------|-----|-------|------------|
| 26/03 | +R$ 280 | R$ 50.280 | Dia 1 |
| 25/03 | +R$ 120 | R$ 50.000 | - |
| ... | ... | ... | ... |

---

## 3. Dashboard - Estrutura Nova

### 3.1 Overview (Primeiro acesso após login)
```
┌─────────────────────────────────────────────────────────────┐
│  BEM-VINDO, Usuario Teste!                                   │
│  Você tem 1 conta ativa no programa.                         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Cards de Resumo
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   CONTAS     │   ATIVAS     │   APROVADAS  │   FALHADAS   │
│     1        │      1       │      0       │      0       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 3.3 Lista de Contas (Quick View)
```
┌─────────────────────────────────────────────────────────────┐
│  [EVW-ACCT-50002]  BRL 50K  Fase 1  Ativa    Saldo: R$ 50.280│
│  ─────────────────────────────────────────────────────────  │
│  [EVW-ACCT-50003]  BRL 25K  Fase 2  Passou   Saldo: R$ 57.500│
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Progresso Geral
```
Everwin Edge Score: 72/100
- Disciplina de Risco: 85
- Consistência: 78
- Progresso: 64
```

---

## 4. Tipos de Dados Necessários

### 4.1 Account (já existe)
```typescript
interface PropAccount {
  id: string;
  userId: string;
  planId: string;
  accountId: string;
  platformLogin: string;
  platformPassword: string; // preciso adicionar para exibir
  phase: 1 | 2;
  status: AccountStatus;
  startDate: string;
  endDate: string;
  initialBalance: number;
  balance: number;
  todayPnl: number;
  daysTraded: number;
  // ... existentes
}
```

### 4.2 Novos Campos Needed
```typescript
// Adicionar ao account
platformName?: string;        // "MetaTrader 5"
tradeRoomUrl?: string;        // Link para plataforma
brokerName?: string;          // Nome do broker
```

---

## 5. Fluxo de Dados

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Landing    │────▶│  Login      │────▶│  Dashboard  │
│  Page       │     │  Page       │     │  (Overview)│
└─────────────┘     └─────────────┘     └─────────────┘
                                                │
                    ┌─────────────┐             │
                    │  Accounts   │◀────────────┘
                    │  Page       │
                    └─────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Credenciais│  │ Métricas  │  │ Regras   │
    │ de Acesso │  │ em Tempo  │  │ do Plano │
    └──────────┘  │ Real      │  └──────────┘
                  └──────────┘
```

---

## 6. Regras Parametrizadas por Plano (do banco)

| Plano | Size | Meta F1 | Meta F2 | Max DD | Daily Loss | Min Dias | Prazo |
|-------|------|---------|---------|--------|------------|----------|-------|
| BRL 25K | 25.000 | 10% | 15% | 5% | 3% | 5 | 30 |
| BRL 50K | 50.000 | 10% | 15% | 5% | 3% | 5 | 30 |
| BRL 100K | 100.000 | 10% | 15% | 5% | 3% | 5 | 30 |
| BRL 150K | 150.000 | 10% | 15% | 5% | 3% | 5 | 30 |
| USD 12.5K | 12.500 | 10% | 15% | 5% | 3% | 5 | 30 |
| USD 25K | 25.000 | 10% | 15% | 5% | 3% | 5 | 30 |
| USD 50K | 50.000 | 10% | 15% | 5% | 3% | 5 | 30 |

---

## 7. Página de Perfil do Usuário

### Campos:
- Nome completo
- Email principal
- Email do portal
- Data de cadastro
- Senha (alterar)
- Preferências de idioma

---

## 8. Resumo: O que precisa ser implementado

### Backend (server/):
1. Adicionar campo `tradeRoomUrl` na tabela accounts
2. Adicionar campo `platformName` na tabela accounts
3. Adicionar endpoint para buscar todos os dados da conta (incluindocredenciais)

### Frontend (src/):
1. **Nova estrutura do ClientAccountsPage:**
   - Credenciais de acesso (login/senha/link trade)
   - Métricas em tempo real
   - Regras do plano parametrizadas
   - Gráfico de equity
   - Histórico de performance

2. **Nova estrutura do Dashboard:**
   - Overview resumido
   - Lista de contas
   - Everwin Edge Score geral

3. **Sidebar atualizado:**
   - Adicionar item "Minha Conta"
   - Corrigir navegação

4. **Componentes novos:**
   - AccountCredentialsCard
   - AccountMetricsCard
   - PlanRulesCard
   - AccountHistoryTable
