# Roadmap Detalhado — Everwin Prop Mini System

Projeto: `everwin-landing-page`
Escopo: evolução do mini sistema interno de Prop Trading com dois painéis (`admin` e `client`)
Status base: MVP funcional local implementado em `/prop`

## 1. Estado Atual (já implementado)

### 1.1 Aplicação e rotas
- Portal de sistema em ` /prop ` com auth local e sessão persistida.
- Rotas de admin:
  - `/prop/admin/dashboard`
  - `/prop/admin/users`
  - `/prop/admin/accounts`
- Rotas de client:
  - `/prop/client/dashboard`
  - `/prop/client/accounts`
- Landing de marketing preservada em:
  - `/prop/landing`
  - `/prop/landing/checkout`

### 1.2 Segurança e acesso (MVP local)
- Controle por papel: `admin` e `client`.
- Guardas de rota por autenticação + role.
- Seed inicial:
  - Admin: `admin@everwin.trade` / `admin@123`.
  - Cliente de demonstração para testes.

### 1.3 Domínio de regras aplicado
- Estados suportados:
  - `pending_payment`, `awaiting_account_creation`, `active`, `paused`, `passed`, `failed_drawdown`, `failed_timeout`, `cooldown`, `approved_for_funded`, `rejected`.
- Engine de regras:
  - Daily Loss Limit (soft breach -> pause).
  - Max Drawdown (hard breach -> fail drawdown).
  - Timeout de fase (fail timeout).
  - Progressão de fase 1 -> fase 2 -> passed.
  - Cooldown de 7 dias para falhas.

### 1.4 Gestão manual (Admin)
- Cadastro de cliente.
- Bloqueio/reativação de cliente.
- Criação manual de conta de avaliação com:
  - `accountId` obrigatório
  - `platformLogin`
  - `platformPassword`
  - plano, data de início e notas.
- Edição operacional de conta:
  - saldo
  - pnl diário
  - dias operados
  - fase
  - status
- Monitor de risco e auditoria de eventos.

### 1.5 Planos comerciais aplicados
- BRL:
  - 25k / 497
  - 50k / 874
  - 100k / 1397
  - 150k / 1497

## 2. Fase 1 — Hardening de Frontend (1 a 2 semanas)
Objetivo: elevar robustez do MVP antes de backend real.

### 2.1 Qualidade de engenharia
- Adicionar linting e formatting (`eslint`, `prettier`) com CI.
- Testes unitários da engine de regras (DLL, drawdown, timeout, progressão).
- Testes de fluxo de auth e guards.
- Cobertura mínima recomendada: 70%+ para módulo prop-system.

### 2.2 UX funcional
- Adicionar filtros, busca e paginação nas tabelas de admin.
- Histórico por conta com linha do tempo de alterações.
- Feedback de validação em todos os formulários.
- Confirm dialogs para ações críticas (rejeitar, aprovar, bloquear).

### 2.3 Segurança local transitória
- Remover exibição explícita de senha em formulários/listas.
- Criptografia local transitória (apenas mitigação; não substitui backend seguro).
- Timeout de sessão no frontend (auto logout por inatividade).

Entregável de fase:
- Módulo frontend estável, testado e pronto para acoplar API.

## 3. Fase 2 — Backend Core e Persistência Real (2 a 4 semanas)
Objetivo: sair de `localStorage` e operar com dados confiáveis.

### 3.1 Arquitetura proposta
- API dedicada (Node/NestJS ou similar).
- Banco relacional (PostgreSQL).
- ORM (Prisma/Drizzle).
- Auth JWT + refresh token.
- RBAC por role e permissões granulares.

### 3.2 Modelagem de dados
Tabelas mínimas:
- `users`
- `roles` / `permissions`
- `prop_plans`
- `prop_accounts`
- `prop_account_credentials` (segregada e criptografada)
- `prop_account_metrics_daily`
- `prop_account_events`
- `audit_logs`
- `sessions`

### 3.3 Regras no backend
- Engine idempotente executada server-side.
- Job scheduler para fechamento diário (EOD) e timeout.
- Travas transacionais para evitar condições de corrida.

Entregável de fase:
- Frontend consumindo API real, sem dependência de storage local.

## 4. Fase 3 — Operação Admin Profissional (2 a 3 semanas)
Objetivo: transformar admin em console operacional de verdade.

### 4.1 Módulos admin
- Fila de onboarding: contas pendentes para criação/liberação.
- Workbench de risco: alertas por severidade (P1/P2/P3).
- Gestão de payout com critérios de elegibilidade.
- Gestão de cooldown/reset com políticas configuráveis.

### 4.2 Observabilidade
- Painel com KPIs de negócio e risco:
  - taxa de aprovação
  - taxa de falha por drawdown
  - contas em risco crítico
  - receita por plano
- Logs estruturados + tracing.
- Alertas para incidentes operacionais.

Entregável de fase:
- Admin apto para operação contínua e escala inicial.

## 5. Fase 4 — Client Area Completa (2 a 3 semanas)
Objetivo: experiência do candidato/trader com clareza e autoatendimento.

### 5.1 Funcionalidades client
- Timeline de conta (eventos, violações, progressão de fase).
- Indicadores de risco em tempo real (ou near real-time).
- Solicitações:
  - reset
  - revisão
  - payout
- Centro de documentos e aceite de termos versionados.

### 5.2 Comunicação
- Notificações por e-mail e in-app para mudanças de status.
- Templates de comunicação por evento (pass/fail/paused/cooldown).

Entregável de fase:
- Área do cliente reduzindo suporte manual e aumentando transparência.

## 6. Fase 5 — Integração com Corretora (quando decidido)
Objetivo: reduzir operação manual e automatizar ciclo de conta.

### 6.1 Integração inicial
- Sincronização de:
  - saldo
  - ordens
  - posições
  - pnl diário
- Conciliação automática vs. dados internos.

### 6.2 Segurança e governança
- Vault para segredos/API keys.
- Criptografia de credenciais em repouso e em trânsito.
- Rotação de chaves e trilha de auditoria completa.

Entregável de fase:
- Operação híbrida/automatizada com menor intervenção manual.

## 7. Fase 6 — Compliance e Legal Ops (contínuo)
Objetivo: suportar expansão com risco jurídico controlado.

- Versionamento de termos por data e aceite explícito por usuário.
- Política de retenção de logs e evidências.
- Módulo de incident response (bloqueio preventivo, revisão, decisão).
- Registro de justificativas em ações sensíveis do admin.

## 8. Backlog técnico priorizado

### Prioridade P0
- API + DB + auth robusta.
- Migração do storage local para servidor.
- Testes da engine de regras.

### Prioridade P1
- Filtros/relatórios no admin.
- Versionamento de termos e aceite.
- Notificações transacionais.

### Prioridade P2
- Integração corretora.
- Observabilidade avançada (SLO/SLA).
- Data warehouse para BI.

## 9. Critérios de pronto para “produção real”

Checklist mínimo:
1. Credenciais não armazenadas em texto puro.
2. Auth com refresh token e revogação.
3. Auditoria imutável para ações críticas.
4. Regras calculadas no backend com jobs confiáveis.
5. Backup e plano de recuperação.
6. Monitoramento e alertas ativos.
7. Testes automatizados + CI/CD.
8. Termos/políticas versionados com histórico de aceite.

## 10. Sugestão de cronograma executivo (macro)
- Semana 1-2: Fase 1 (hardening frontend).
- Semana 3-6: Fase 2 (backend core).
- Semana 7-9: Fase 3 (admin operacional).
- Semana 10-12: Fase 4 (client area completa).
- Semana 13+: Fase 5 e 6 conforme prioridade de negócio.

## 11. Riscos principais e mitigação

1. Risco: regras divergirem entre frontend e backend.
- Mitigação: engine única no backend + frontend apenas leitura.

2. Risco: vazamento de credenciais.
- Mitigação: vault, criptografia forte, controles de acesso e logs.

3. Risco: decisões manuais sem rastreabilidade.
- Mitigação: auditoria obrigatória com motivo e ator.

4. Risco: gargalo operacional no onboarding.
- Mitigação: fila de tarefas + automações progressivas.

## 12. Próximo passo recomendado imediato
- Aprovar stack do backend e iniciar Fase 2.
- Enquanto isso, manter este MVP como console operacional temporário para validação de fluxo com time interno.
