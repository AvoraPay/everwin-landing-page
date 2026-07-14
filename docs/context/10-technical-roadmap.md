# 10 — Roadmap Técnico de Evolução

**Projeto:** `everwin-landing-page`  
**Data:** 2026-03-19

---

## Fase 0 — Fundação (Semana 1-2)

### 0.1 Infraestrutura de Desenvolvimento

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Adicionar ESLint + Prettier | — | P0 | Configurar `.eslintrc` + `.prettierrc` |
| Adicionar Jest/Vitest | — | P0 | Setup de testes com React Testing Library |
| Adicionar GitHub Actions | — | P0 | Pipeline: lint → test → build |
| Configurar Dependabot | — | P1 | Renovação automática de dependências |

### 0.2 Extração da Engine de Regras

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Criar `packages/rules/` | — | P0 | Extrair lógica de `rules.ts` + `rules.js` para lib compartilhada |
| Migrar backend para usar `packages/rules` | packages/rules | P0 | Remover `server/rules.js`, usar import |
| Migrar frontend para usar `packages/rules` | packages/rules | P0 | Remover `src/modules/prop-system/rules.ts`, usar import |
| Adicionar testes unitários da engine | packages/rules | P0 | Testar: DLL, drawdown, timeout, phase progression, cooldown |
| Adicionar testes de integração da API | — | P1 | Testar endpoints com Jest |

**Resultado:** Engine única, versionada, testada. Zero duplicação.

---

## Fase 1 — Backend Core (Semana 3-5)

### 1.1 API e Persistência

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Sistema de migrations | — | P0 | Setup Prisma ou Drizzle Kit com migrations |
| Adicionar `candidates` table | migrations | P0 | Tabela de candidaturas |
| Adicionar `term_acceptances` table | migrations | P0 | Aceite de termos versionado |
| Criar `POST /api/candidates` | candidates table | P0 | Endpoint de candidatura |
| Conectar checkout ao backend | POST /api/candidates | P0 | Integração frontend com backend |
| CRUD de planos via admin | migrations | P1 | Endpoints + UI de gestão de planos |
| Adicionar DELETE accounts | — | P1 | Soft delete ou hard delete |
| Rate limiting | — | P0 | `express-rate-limit` nos endpoints sensíveis |

### 1.2 Segurança

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Adicionar audit de FAILED_LOGIN | — | P0 | Log de tentativas falhas |
| Adicionar audit de LOGOUT | — | P1 | Log de logout |
| Adicionar audit de TOKEN_REFRESH | — | P2 | Log de refresh token |
| MFA consideration | — | P2 | Avaliar necessidade, não implementar agora |

### 1.3 Refatoração do Server

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Dividir `server/index.js` | — | P1 | Extrair: `routes/auth.js`, `routes/accounts.js`, `routes/users.js`, `routes/admin.js` |
| Dividir `server/db.js` | — | P1 | Extrair: `seeds/`, `mappers/` |
| Adicionar global error handler | — | P1 | Middleware de erro centralizado |

**Resultado:** Backend modular, com migrations, candidatos funcionais, checkout conectado.

---

## Fase 2 — Workers e Automação (Semana 6-7)

### 2.1 Cron Jobs

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Setup `node-cron` | — | P0 | Configuração base |
| Job: EOD (fechamento diário) | node-cron | P0 | Aplicar PnL do dia, verificar DLL |
| Job: Timeout checker | node-cron | P0 | Marcar contas expiradas |
| Job: Cooldown expiration | node-cron | P0 | Liberar contas do cooldown |
| Job: Backup do DB | node-cron | P0 | Script de backup + schedule |
| Tabela: `job_executions` | migrations | P0 | Status de execução dos jobs |

### 2.2 Integração com Corretora (Preparação)

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Definir contrato de API | — | P0 | Documentar endpoints necessários da corretora |
| Setup: `services/broker.js` | — | P0 | Abstração da integração |
| Worker: Sync de PnL | broker abstraction | P1 | Buscar PnL diário da corretora |
| Worker: Sync de posições | broker abstraction | P2 | Buscar posições abertas |

**Resultado:** Sistema semi-autônomo. Cooldowns, timeouts e EOD rodam automaticamente.

---

## Fase 3 — Observabilidade e Monitoramento (Semana 8-9)

### 3.1 Logging

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Setup Pino/Winston | — | P0 | Logging JSON estruturado |
| Structured audit logs | logging | P0 | JSON payload nos audit logs |
| Request ID tracing | logging | P1 | Adicionar X-Request-ID em todas requests |

### 3.2 Monitoramento

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Error boundaries React | — | P0 | Adicionar em todas as páginas |
| Loading states | — | P0 | Skeletons/spinners nas tables |
| Health check expandido | — | P1 | `/api/health` com status do DB e jobs |
| Métricas simples | — | P2 | Prometheus metrics (opcional) |

### 3.3 Dashboard Operacional

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Dashboard de jobs | job_executions | P0 | UI mostrando último status de cada job |
| Alertas básicos | — | P1 | Email para falhas de jobs |

**Resultado:** Sistema observável. Logs estruturados, jobs monitorados, erros capturados.

---

## Fase 4 — Portal Client Completo (Semana 10-12)

### 4.1 Expansão do Portal Client

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Timeline de conta | candidates table | P0 | Exibir eventos: created, failed, passed, etc. |
| Analytics expostos | — | P0 | `buildAccountAnalytics` disponível para client |
| Solicitação de reset | reset_requests table | P1 | Client solicita reset de conta |
| Solicitação de payout | payout_requests table | P1 | Client solicita payout |
| Centro de documentos | term_acceptances | P1 | Client vê termos aceitos |
| Notificações in-app | notifications table | P1 | Sino de notificações |

### 4.2 CRM de Payout

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Tabela: `payout_requests` | migrations | P1 | Solicitação de saque |
| Tabela: `payout_transactions` | migrations | P1 | Transações realizadas |
| UI: Admin approve/reject payout | payout_requests | P1 | Workflow de aprovação |
| UI: Cliente vê histórico | payout_transactions | P1 | Extrato de payouts |

**Resultado:** Portal cliente completo. Pode solicitar reset, payout, ver timeline.

---

## Fase 5 — Portal Admin Profissional (Semana 13-15)

### 5.1 Gestão Operacional

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Filtros nas tables admin | — | P0 | Filtro por status, plano, data |
| Busca nas tables admin | — | P0 | Busca por accountId, email |
| Paginação | — | P0 | Paginação de todas as lists |
| UI: fila de revisão | candidates | P1 | Admin revisa candidaturas |
| Dashboard: Taxa de aprovação | — | P1 | KPI: aprovação vs reprovação |
| Dashboard: Receita | — | P1 | KPI: receita por plano |

### 5.2 Workflow de Approval

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Status transitions validation | — | P1 | Impedir transições inválidas |
| Approval workflow | candidates | P2 | Multi-step approval |

**Resultado:** Admin opera com eficiência. Filtros, busca, paginação, dashboard de KPIs.

---

## Fase 6 — Integração Corretora + Expansão (Semana 16+)

| Task | Dependency | Priority | Ação |
|------|-----------|----------|------|
| Sync automático de PnL | broker integration | P0 | Job que puxa dados da corretora |
| Sync de posições | broker integration | P1 | Job que puxa posições |
| Vault para credenciais | — | P1 | AWS Secrets Manager ou similar |
| Multi-tenant | — | P3 | Avaliar necessidade |
| KYC completo | — | P3 | Upload e validação de documentos |
| BI/Data warehouse | — | P3 | Para análise avançada |

---

## Quick Wins (Primeira Semana)

1. **ESLint + Prettier** — 1 hora, impacto imediato na qualidade
2. **Extração da engine de regras** — 2 horas, elimina duplicação crítica
3. **Rate limiting** — 30 minutos, proteção imediata
4. **Audit de FAILED_LOGIN** — 30 minutos, visibilidade de segurança

---

## Refactors Obrigatórios (Antes de Qualquer Feature Nova)

| Refactor | Por que | Prioridade |
|----------|---------|------------|
| Extrair engine de regras | Divergência garantida se continuar duplicada | P0 |
| Dividir `server/index.js` | 538 linhas é impalatável | P1 |
| Adicionar testes | Sem testes, qualquer mudança é arriscada | P0 |
| Sistema de migrations | Sem migrations, schema changes são arriscadas | P0 |

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|-------------|---------|-----------|
| Divergência de regras TS × JS | **CERTA** sem ação | ALTO | Extrair para lib compartilhada |
| Regressão sem testes | **CERTA** | ALTO | Adicionar testes antes de expandir |
| Perda de dados (sem backup) | **MÉDIA** | CRÍTICO | Implementar backup imediatamente |
| Credenciais expostas | **MÉDIA** | CRÍTICO | Migrar para vault, usar env vars |
| Timeout de reavaliação com muitas contas | **ALTA** em escala | MÉDIO | Cron jobs, não reavaliação manual |

---

## Ordem de Evolução Recomendada

```
Semana 1-2: Foundation
├── ESLint + Prettier
├── Extract rules engine
└── Setup tests

Semana 3-5: Backend Core
├── Migrations
├── Candidates + checkout integration
├── Rate limiting
└── Refactor server (routes split)

Semana 6-7: Automation
├── Cron jobs (EOD, timeout, cooldown, backup)
└── Audit logs expandidos

Semana 8-9: Observability
├── Structured logging
├── Error boundaries
└── Loading states

Semana 10-12: Client Portal
├── Timeline
├── Analytics expostos
├── Reset/payout requests
└── Notifications

Semana 13+: Admin Professional + Integration
├── Filters + pagination
├── CRM de payout
├── Dashboard KPIs
└── Broker integration
```

---

## Resumo

| Fase | Semanas | Foco | Entregável |
|------|---------|------|------------|
| 0 — Fundação | 1-2 | DX + Quality | Tests, linting, CI, rules extracted |
| 1 — Backend Core | 3-5 | API + Persistence | Migrations, candidates, CRUD |
| 2 — Automation | 6-7 | Workers + Jobs | Cron jobs, backup |
| 3 — Observability | 8-9 | Monitoring | Logging, error boundaries |
| 4 — Client Portal | 10-12 | Client UX | Timeline, requests, notifications |
| 5 — Admin Pro | 13-15 | Admin UX | Filters, KPIs, workflow |
| 6 — Integration | 16+ | Scale | Broker sync, vault |
