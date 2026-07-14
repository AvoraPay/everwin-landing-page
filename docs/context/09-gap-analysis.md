# 09 — Gap Analysis

**Projeto:** `everwin-landing-page`  
**Data:** 2026-03-19

---

## 1. Entrada de Demanda

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Formulário de candidatura | `/prop/landing/checkout` existe mas **não salva dados** | Candidatar cria `candidate` no DB | Checkout é visual apenas | Conectar checkout ao backend com nova tabela `candidates` | P0 |
| Validação KYC | **NÃO EXISTE** | Coletar docs, validar identidade | Sem coleta | Criar flow de KYC com upload de documentos | P1 |
| Elegibilidade | Apenas email/senha | Verificar elegibilidade (idade, região) | Sem validação | Adicionar regras de elegibilidade | P1 |

---

## 2. Interpretação / Planning

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Plano selecionado | Checkout mostra planos mas não persiste escolha | Plano registrado com candidatura | Sem persistência | Integrar seleção ao flow de candidatura | P0 |
| Briefing de plano | Apenas valores (BRL/USD) | Parâmetros completos (regras, durações) | Já existe em `plans` | Expor no checkout | P1 |

---

## 3. Study Mode

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Análise de risco | Admin vê dashboard de risco | Trader vê sua análise de risco | **PARCIAL** — client vê métricas | Expor `buildAccountAnalytics()` no portal client | P1 |
| Educação | Não existe | Biblioteca de regras, vídeos, quizzes | Sem conteúdo | Criar módulo de educação | P3 |

---

## 4. Modelagem de Plano

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Plano | Tabela `plans` existe com seed data | CRUD completo de planos | **PARCIAL** — seed, sem UI de gestão | Criar Admin UI para gestão de planos | P1 |
| Parâmetros configuráveis | MaxDD, DLL, target, durações em seed | Editável por admin | Seed fixo | CRUD de planos via admin | P1 |

---

## 5. Approval Workflow

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Aprovação manual | Admin muda status manualmente | Workflow com etapas e aprovações | Sem workflow — mudança direta | Criar workflow de approval com etapas | P2 |
| Revisão de conta | Não existe | Admin pode revisar contas pendentes | Sem feature | Criar fila de revisão | P2 |
| Critérios de aprovação | Baseado em engine de regras | Critérios configuráveis por plano | Regras já existem | Adicionar configurabilidade | P2 |

---

## 6. Task Derivation

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Tarefas de trader | Não existe | Checklist de objetivos | Sem feature | Criar sistema de tarefas/objetivos | P3 |
| Milestones | Não existe | Marcos intermediários | Sem feature | Adicionar milestones ao progresso | P3 |

---

## 7. Execution Graph

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Integração corretora | **NÃO EXISTE** | Sync automático de PnL | Sem integração | Definir API de integração com corretora | P0 |
| Atualização de métricas | **MANUAL** via admin | Automático via API | Gap grande | Job de sync com corretora | P0 |
| Posições e ordens | Admin não vê | Admin vê posições abertas | Sem feature | Endpoint para posições | P2 |

---

## 8. Workers

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Cron jobs | **NÃO EXISTE** | EOD, timeout, cooldown auto | Tudo manual | Adicionar `node-cron` + jobs | P0 |
| Reavaliação | Botão manual | Automática por schedule | Manual apenas | Job `POST /api/rules/evaluate` | P0 |
| Sync com corretora | **NÃO EXISTE** | Job que puxa dados | Sem integração | Worker de sync | P0 |

---

## 9. Logs

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Audit trail | `audit_logs` existe | Extendido para todas ações | **PARCIAL** — falta LOGOUT, FAILED_LOGIN | Adicionar ações faltantes | P1 |
| Log de segurança | Sem logs de falha de login | Log de todas tentativas | Falta | Adicionar `FAILED_LOGIN` audit | P1 |
| Log estruturado | stdout + morgan | JSON logs no stdout | Apenas morgan | Implementar pino/winston | P2 |

---

## 10. Observabilidade

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Dashboard operacional | Admin tem KPIs básicos | Dashboard completo com SLOs | **PARCIAL** | Expandir KPIs de negócio | P1 |
| Alertas | **NÃO EXISTE** | Alertas para risco, falha, payout | Sem alertas | Implementar sistema de alertas | P1 |
| Métricas de sistema | **NÃO EXISTE** | CPU, memory, DB queries | Sem monitoramento | Adicionar APM (Prometheus, etc.) | P2 |
| Tracing | **NÃO EXISTE** | Request IDs, distributed tracing | Sem tracing | Adicionar OpenTelemetry | P3 |

---

## 11. Dashboard de Estado Real

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Visão admin | KPIs, risk, equity, rankings | Dashboard completo com filtragem | **PARCIAL** | Adicionar filtros, busca, paginação | P1 |
| Visão client | Métricas e performance | Portal com timeline de conta | **PARCIAL** | Adicionar timeline de eventos | P1 |
| Próximos passos | Não existe | "O que fazer agora" | Sem feature | Dashboard de tarefas pendentes | P2 |

---

## 12. Persistência

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Tabelas existentes | 6 tabelas | Completar modelo | **PARCIAL** | Adicionar: candidates, term_acceptances, notifications, job_executions | P0 |
| Backup | **NÃO EXISTE** | Backup automático diário | Sem backup | Script de backup + schedule | P0 |
| Migrations | **NÃO EXISTE** | Sistema de migrations | Sem versionamento | Adicionar sistema de migrations (prisma migrate, drizzle-kit) | P1 |
| Multi-tenant | Apenas por user_id | Multi-tenant real | Sem organization | Avaliar necessidade, adicionar se requerido | P3 |

---

## 13. APIs

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| CRUD Accounts | `GET/POST/PATCH /api/accounts` | CRUD completo | **PARCIAL** — falta DELETE | Adicionar DELETE endpoint | P1 |
| API Documentation | **NÃO EXISTE** | OpenAPI/Swagger | Sem docs | Gerar OpenAPI spec | P2 |
| Rate Limiting | **NÃO EXISTE** | Rate limit por IP/user | Sem proteção | Adicionar express-rate-limit | P0 |
| CORS | Configurado por env var | Config dinâmico | Estático | Avaliar necessidade | P3 |

---

## 14. UI

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Checkout | Visual mas não funcional | Funcional com backend | Gap grande | Integrar com candidates | P0 |
| Client portal | Básico — visualização | Portal completo com ações | **PARCIAL** | Adicionar: timeline, solicitações | P1 |
| Filtros/pesquisa | Não existe nas tabelas admin | Filtros em todas as listas | Sem filtros | Adicionar filtros em tables | P1 |
| Error boundaries | **NÃO EXISTE** | Error boundaries em todo lugar | Sem proteção | Adicionar React error boundaries | P1 |
| Loading states | **NÃO EXISTE** | Skeletons/spinners | Sem UX de loading | Adicionar estados de loading | P1 |
| Responsive mobile | **NÃO TESTADO** | Fully responsive | Incerteza | Testar e ajustar | P2 |

---

## 15. Governança

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| RBAC | admin/client | Roles granulares | Apenas 2 roles | Avaliar necessidade de mais roles | P3 |
| Permissões | Por role apenas | Permissões por ação | Sem granularidade | Adicionar sistema de permissões | P3 |
| Auditoria | `audit_logs` existe | Trilha completa e imutável | **PARCIAL** | Adicionar ações faltantes, immutabilidade | P1 |

---

## 16. Manutenção

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Testes | **ZERO** | Cobertura > 70% | Sem testes | Adicionar Jest/Vitest + testes | P0 |
| CI/CD | **NÃO EXISTE** | Pipeline de build + test + deploy | Sem pipeline | Adicionar GitHub Actions ou similar | P0 |
| Linting | **NÃO EXISTE** | ESLint + Prettier | Sem lint | Configurar ESLint + Prettier | P0 |
| Dependências | `package-lock.json` | Renovação periódica | Sem processo | Adicionar dependabot ou renovate | P2 |

---

## 17. Análise de Projetos Existentes

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Portfólio de contas | Admin vê todas | View analítica de portfólio | **PARCIAL** | Expandir analytics de portfólio | P2 |
| BI / Data warehouse | **NÃO EXISTE** | Dados para análise | Sem BI | Avaliar necessidade de BI | P3 |

---

## 18. Replanejamento / Versionamento

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Histórico de contas | `performance_points` | Timeline completa com eventos | **PARCIAL** | Adicionar eventos ao longo do tempo | P2 |
| Versionamento de status | Não existe | Histórico de cada mudança de status | Sem versionamento | Adicionar `account_status_history` | P2 |

---

## 19. Critérios de Aceite

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Definição de feito | Baseado em status | Checklist com critérios | Engine existe mas não tem UI de critérios | UI para critérios por plano | P2 |
| Validação automática | Engine roda no update | engine + validação de critérios | **PARCIAL** | Já existe via `evaluateAccount` | P1 |

---

## 20. Auditabilidade

| Aspecto | Current State | Target State | Gap | Action Needed | Priority |
|---------|--------------|--------------|-----|---------------|----------|
| Trilha completa | `audit_logs` com ações principais | Todas as ações incluindo queries | **PARCIAL** | Adicionar ações: LOGOUT, FAILED_LOGIN, TOKEN_REFRESH | P1 |
| Imutabilidade | Registros não têm constraint de imutabilidade | Tabela `audit_logs` append-only | Sem constraint | Adicionar trigger ou constraint | P2 |
| Relatórios de auditoria | Admin vê logs crus | UI de auditoria com filtros | Sem UI | Criar UI de auditoria com filtros | P2 |

---

## Resumo dos Gaps por Prioridade

### P0 — Crítico
1. Checkout não conecta ao backend (candidaturas não existem)
2. Sem testes
3. Sem CI/CD
4. Sem linting
5. Sem rate limiting
6. Sem cron jobs (Tudo manual)
7. Sem backup do DB
8. Sem workers/sync com corretora
9. Adicionar entidades faltantes: candidates, term_acceptances

### P1 — Muito Importante
1. CRM mínimo para gestão de payout
2. Sistema de notificações (email/in-app)
3. Expandir audit trail
4. Error boundaries no frontend
5. Loading states
6. Filtros e busca nas tabelas admin
7. Expor analytics no portal client
8. Adicionar logs de falha de login
9. CRUD de planos via admin
10. Sistema de migrations

### P2 — Importante
1. Portal client com timeline e ações
2. Workflow de approval
3. Alertas operacionais
4. Documentação OpenAPI
5. Log estruturado
6. Dashboard de operações
7. Portfólio analytics
8. Histórico de status de conta

### P3 — Evolução Futura
1. KYC completo
2. Multi-tenant
3. Módulos de educação
4. Sistema de permissões granulares
5. BI/Data warehouse
6. Distributed tracing
