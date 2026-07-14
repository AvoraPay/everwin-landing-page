# 07 — Logs, Observabilidade e Estado Real

**Projeto:** `everwin-landing-page`  
**Data:** 2026-03-19

---

## 1. Como o Sistema Lida com Logs

### 1.1 Backend — Logs Técnicos

| Recurso | Implementação | Status |
|---------|--------------|--------|
| HTTP Request Log | `morgan("dev")` | **FUNCIONAL** — log no console |
| Error Log | `console.error(err)` em middleware de erro | **FUNCIONAL** — apenas no catch |
| Security Events | `audit()` para login, logout, ações críticas | **FUNCIONAL** |

**Exemplo de morgan output:**
```
POST /api/auth/login 200 145ms
GET /api/accounts 200 23ms
```

**Problema:** Logs vão para stdout do processo — sem persistência, sem centralização.

### 1.2 Frontend — Logs Técnicos

| Recurso | Implementação | Status |
|---------|--------------|--------|
| Console logs | Nenhum — código sem console.log | **AUSENTE** |
| Error boundaries | Nenhum | **AUSENTE** |
| Request tracking | Fetch API nativo | **BÁSICO** |
| Performance monitoring | Nenhum | **AUSENTE** |

### 1.3 Backend — Logs Funcionais (Auditoria)

**Tabela:** `audit_logs`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | TEXT | UUID |
| `actor_user_id` | TEXT | Quem fez |
| `action` | TEXT | O que fez |
| `entity_type` | TEXT | user / account / system |
| `entity_id` | TEXT | ID da entidade |
| `payload` | TEXT | JSON com detalhes |
| `created_at` | TEXT | Timestamp ISO |

**Ações registradas:**
| Action | Quando |
|--------|--------|
| `LOGIN` | Login bem-sucedido |
| `CREATE_CLIENT_USER` | Admin cria usuário |
| `UPDATE_USER_STATUS` | Admin bloqueia/reativa |
| `CREATE_ACCOUNT` | Admin cria conta |
| `UPDATE_ACCOUNT` | Admin atualiza conta |
| `SET_ACCOUNT_STATUS` | Admin muda status |
| `RUN_RULES_EVALUATION` | Reavaliação de regras |

**Ausências importantes:**
| Action | Por que não existe? |
|--------|--------------------|
| `LOGOUT` | Não há audit de logout |
| `TOKEN_REFRESH` | Não há audit de refresh |
| `FAILED_LOGIN` | Não há audit de falha |
| `ACCOUNT_AUTO_STATUS_CHANGE` | Status changes só por admin manual |

---

## 2. Separação de Logs

| Tipo | Exists? | Onde |
|------|---------|------|
| Log técnico (HTTP) | **SIM** | stdout (morgan) |
| Log de auditoria | **SIM** | `audit_logs` table |
| Log de negócio | **NÃO** | — |
| Log de erro | **PARCIAL** | console.error apenas |
| Log de performance | **NÃO** | — |
| Log de segurança | **PARCIAL** | audit para login, mas não para falha |

---

## 3. Noção de Estado

### 3.1 Estados de Conta (10 estados)

```
pending_payment
awaiting_account_creation
active
paused
passed
failed_drawdown
failed_timeout
cooldown
approved_for_funded
rejected
```

### 3.2 Estados são Mutáveis Manualmente

**Fato:** O admin pode mudar qualquer conta para qualquer status via `PATCH /api/accounts/:id/status`.

**Problema:** Não há controle de transições válidas. Admin pode mover `active` → `approved_for_funded` sem critério.

### 3.3 Como Saber o Estado Real?

| Pergunta | Como responder hoje |
|----------|---------------------|
| Quais contas estão em operação? | `SELECT * FROM accounts WHERE status = 'active'` |
| Quais contas estão em risco? | `AdminDashboardPage` com `buildRiskSnapshot()` |
| Quais contas precisam de atenção? | `AdminDashboardPage` lista "contas com risco crítico" |
| Quais contas falharam? | `SELECT * FROM accounts WHERE status IN ('failed_drawdown', 'failed_timeout')` |
| Quais contas estão prontas para payout? | `SELECT * FROM accounts WHERE status = 'passed'` |
| Quais contas estão em cooldown? | `SELECT * FROM accounts WHERE status = 'cooldown'` |

**Conclusão:** Estado existe e é consultável, mas:
1. Não há dashboard de "próximos passos" — admin precisa inferir
2. Não há workflow de payout
3. Não há notificação para mudança de estado

---

## 4. O que Existe vs O que Falta

### 4.1 Existe
| Recurso | Descrição |
|---------|-----------|
| Audit trail | `audit_logs` com ações principais |
| Status tracking | `accounts.status` |
| Risk snapshot | `buildRiskSnapshot()` calcula flags |
| Admin dashboard | Mostra contas em risco e rankings |
| Morgan HTTP logging | Logs de request no console |

### 4.2 Falta
| Recurso | Impacto |
|---------|---------|
| Log de erro estruturado | Sem visibilidade de falhas |
| Error boundaries no React | Falhas em componente = tela branca |
| Métricas de negócio | Taxa de aprovação, receita, churn |
| Alertas | Sem notificação para eventos críticos |
| Notificações ao cliente | Sem comunicação de mudanças de status |
| Dashboard de operações | "O que fazer agora?" não é respondido |
| Logs centralizados | stdout vai para /dev/null em prod |
| Tracing | Sem request IDs, sem trace de erros |

---

## 5. Lacunas de Observabilidade

| Lacuna | Risco | Prioridade |
|--------|-------|------------|
| Sem métricas de negócio (KPI dashboard) | Admin não tem visão de receita, aprovação | ALTA |
| Sem alertas para contas em risco | Pode perder conta que vai falhar | ALTA |
| Sem notificação para clientes | Cliente não sabe que falhou/passou | MÉDIA |
| Sem tracing de erros | Debug é difícil em produção | MÉDIA |
| Sem log de segurança (falhas de login) | Não detecta brute force | ALTA |
| Sem observabilidade de jobs | Não sabe se cron jobs rodaram | MÉDIA |
| Sem dashboard de auditoria filtrado | Logs existem mas sem UX de consulta | BAIXA |

---

## 6. Resumo

| Aspecto | Status |
|---------|--------|
| Audit trail | **FUNCIONAL** — mas incompleto |
| HTTP logging | **BÁSICO** — morgan + console |
| Error logging | **PARCIAL** — apenas console.error |
| Business intelligence | **AUSENTE** |
| Alerts | **AUSENTE** |
| Notifications | **AUSENTE** |
| Tracing | **AUSENTE** |
| Metrics | **AUSENTE** |
| Error boundaries | **AUSENTE** |

**Recomendação:** Implementar estrutura de logging estruturado (JSON no stdout), audit completo (incluindo falhas), dashboard de operações, e alertas para eventos críticos.
