# 06 — Workers, Jobs e Automação

**Projeto:** `everwin-landing-page`  
**Data:** 2026-03-19

---

## 1. Estado Atual: NÃO EXISTEM WORKERS

**Fato observado:** O sistema não possui nenhum mecanismo de processamento assíncrono, filas ou jobs agendados.

---

## 2. O Que Existe Semelhante a Workers

### 2.1 Reavaliação Manual de Regras

| Aspecto | Descrição |
|---------|-----------|
| **Disparo** | Clique manual no botão "Reavaliar Regras" |
| **Endpoint** | `POST /api/rules/evaluate` |
| **Execução** | Síncrona — itera sobre todas as contas |
| **O que executa** | `evaluateAccount()` para cada conta |
| **Persistência** | `saveAccount()` + `upsertPerformancePoint()` |
| **Log** | `audit()` → `RUN_RULES_EVALUATION` |
| **Falha** | Retorna erro HTTP 500, nada fica pendente |
| **Observação** | Nenhum job, nenhuma fila — tudo na mesma request |

**Problema:** Se houverem 1000 contas, a request vai demorar e pode timeout.

### 2.2 Avaliação no Update de Conta

| Aspecto | Descrição |
|---------|-----------|
| **Disparo** | `PATCH /api/accounts/:id` |
| **Execução** | Síncrona após update |
| **O que executa** | `evaluateAccount()` para a conta atualizada |
| **Persistência** | `saveAccount()` + `upsertPerformancePoint()` |
| **Log** | `audit()` → `UPDATE_ACCOUNT` |

### 2.3 Refresh de Token

| Aspecto | Descrição |
|---------|-----------|
| **Disparo** | HTTP 401 do frontend |
| **Execução** | Request HTTP síncrona |
| **O que executa** | Gera novos tokens, revoga antigo |
| **Persistência** | `refresh_tokens` table |
| **Log** | Não há audit para refresh |

---

## 3. O Que Precisa Existir (Gaps)

### 3.1 Cron Job: Fechamento Diário (EOD)

| Item | Descrição |
|------|-----------|
| **Trigger** | Todo dia às 23:59 (ou horário configurável) |
| **Ação** | Para cada conta `active` ou `paused`: aplicar PnL do dia, verificar DLL, verificar timeout |
| **Persistência** | `performance_points`, `audit_logs` |
| **Falha** | Retry com backoff, alertas |
| **Estado** | Registrado em tabela de job status |

**Status atual:** NÃO EXISTE — o admin precisa clicar manualmente.

### 3.2 Cron Job: Timeout Checker

| Item | Descrição |
|------|-----------|
| **Trigger** | A cada hora (ou a cada 15 min) |
| **Ação** | Para contas `active`/`paused` cujo `end_date < now`, marcar como `failed_timeout` |
| **Persistência** | `accounts` status, `audit_logs` |
| **Falha** | Retry, alertas |
| **Estado** | Registrado |

**Status atual:** NÃO EXISTE — timeout só é detectado se "Reavaliar Regras" for clicado.

### 3.3 Cron Job: Cooldown Expiration

| Item | Descrição |
|------|-----------|
| **Trigger** | A cada 15 minutos |
| **Ação** | Para contas em `cooldown` cujo `cooldown_until <= now`, mover para `awaiting_account_creation` |
| **Persistência** | `accounts` status |
| **Falha** | Retry, alertas |

**Status atual:** PARCIAL — funciona quando "Reavaliação" é clicada, mas não é automático.

### 3.4 Cron Job: Notificações

| Item | Descrição |
|------|-----------|
| **Trigger** | Event-driven + scheduled |
| **Ações** | Email/push para: account failed, account passed, payout ready, cooldown expired |
| **Persistência** | Tabela de notifications |
| **Estado** | Sent/failed/pending |

**Status atual:** NÃO EXISTE.

### 3.5 Cron Job: Backup do DB

| Item | Descrição |
|------|-----------|
| **Trigger** | Diário |
| **Ação** | Copiar `prop-system.db` para storage remoto |
| **Persistência** | External storage (S3, Dropbox, etc.) |

**Status atual:** NÃO EXISTE.

---

## 4. Processamento por Evento

| Evento | Handler | O que acontece |
|--------|---------|----------------|
| Login | `server/index.js` linha 119 | Cria audit log, atualiza `last_login_at` |
| Create User | `server/index.js` linha 222 | Cria usuário, audit log |
| Create Account | `server/index.js` linha 295 | Cria conta, performance point, audit |
| Update Account | `server/index.js` linha 403 | Atualiza, reavalia, audit |
| Set Status | `server/index.js` linha 464 | Atualiza status, audit |
| Logout | `server/index.js` linha 195 | Revoga refresh token |

**Observação:** Todos os handlers são síncronos e dentro da request HTTP.

---

## 5. Retries e Error Handling

| Aspecto | Status |
|---------|--------|
| Retry automático | **NÃO EXISTE** |
| Dead letter queue | **NÃO EXISTE** |
| Circuit breaker | **NÃO EXISTE** |
| Exponential backoff | **NÃO EXISTE** |
| Error boundary (frontend) | **NÃO EXISTE** |

---

## 6. Pipeline de Dados

### 6.1 Pipeline de Performance

```
[Dados de trading] → [Admin input manual] → [PATCH /api/accounts/:id]
                                                      │
                                                      ▼
                                              [buildRiskSnapshot]
                                                      │
                                                      ▼
                                              [evaluateAccount]
                                                      │
                                                      ▼
                                         [saveAccount + performance_point]
                                                      │
                                                      ▼
                                         [Frontend polling ou refresh]
```

**Problema:** Tudo depende de input manual e polling.

---

## 7. Recomendações

### 7.1 Mínimo Necessário (P0)
1. **Node-cron** ou similar para jobs agendados
2. Job de EOD (fechamento diário)
3. Job de timeout checker
4. Job de cooldown expiration

### 7.2 Recomendado (P1)
5. Biblioteca de filas (Bull/BullMQ ou similar)
6. Retry com backoff
7. Dead letter queue para falhas
8. Tabela de job status para monitoramento

### 7.3 Ideal (P2)
9. Workers escaláveis (separados do servidor HTTP)
10. Message queue dedicado (RabbitMQ/Redis)
11. Observabilidade (logs estruturados + métricas)
12. Alertas para falhas de job

---

## 8. Resumo

| Componente | Existe? | Type |
|------------|---------|------|
| Background workers | **NÃO** | — |
| Scheduled jobs (cron) | **NÃO** | — |
| Message queue | **NÃO** | — |
| Retry mechanism | **NÃO** | — |
| Dead letter queue | **NÃO** | — |
| Job monitoring | **NÃO** | — |
| Event-driven handlers | **PARCIAL** | HTTP request handlers síncronos |
| Reavaliação manual | **SIM** | `POST /api/rules/evaluate` (síncrono) |

**Conclusão:** O sistema é completamente dependiente de processamento síncrono via HTTP. Qualquer automação real precisa ser adicionada.
