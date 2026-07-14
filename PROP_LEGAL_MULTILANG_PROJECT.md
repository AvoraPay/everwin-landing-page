# PROJETO: REVISÃO JURÍDICA PROP + 100% MULTILÍNGUE

## STATUS: PLANEJAMENTO

---

## ESCOPO DO PROJETO

### ✅ JÁ COMPLETADO
- [x] Novas Políticas Prop robustas criadas em 3 idiomas (PT/EN/ES)
- [x] Análise completa da arquitetura legal
- [x] Arquitetura i18n mapeada

### ⏳ PENDENTE - FASE 1: Integração de Políticas (PRIORIDADE CRÍTICA)

#### 1.1 Atualizar legalContent.ts
- [ ] Integrar nova Payout Policy (PT/EN/ES) com regras de múltiplos IPs
- [ ] Integrar nova Account Access Policy (PT/EN/ES)
- [ ] Integrar nova Trading Restrictions Policy (PT/EN/ES)
- [ ] Revisar e atualizar outras 3 políticas Prop existentes
- [ ] Garantir UPDATED_AT dates corretas

**Complexidade:** 🔴 ALTA - 3 versões linguísticas por política, múltiplas seções estruturadas

#### 1.2 Atualizar Navegação Legal
- [ ] Adicionar novos slugs em `legalNav.tsx`
- [ ] Adicionar i18n keys para novos títulos
- [ ] Atualizar breadcrumbs/sidebar

### ⏳ PENDENTE - FASE 2: Tradução de Chaves i18n

#### 2.1 Traduzir Rótulos de Navegação
- [ ] `legal_section.sidebar.prop_account_access` (PT/EN/ES)
- [ ] `legal_section.sidebar.prop_trading_restrictions` (PT/EN/ES)
- [ ] Outros rótulos novos

**Arquivos a atualizar:**
- `src/locales/pt.json`
- `src/locales/en.json`
- `src/locales/es.json`

### ⏳ PENDENTE - FASE 3: Auditoria 100% Multilíngue

#### 3.1 Layout & Navigation
- [ ] Navbar - verificar todos os textos em PT/EN/ES
- [ ] Footer - verificar consistência
- [ ] Breadcrumbs/links - validar em 3 idiomas
- [ ] Bot da central - suporta 3 idiomas?

#### 3.2 Prop System Portal
- [ ] Login page - PT/EN/ES correto?
- [ ] Admin dashboard labels - 3 idiomas?
- [ ] Client dashboard - 3 idiomas?
- [ ] Error messages - localizadas?
- [ ] Form labels - consistentes?

#### 3.3 Landing Pages
- [ ] Home - 3 idiomas completos?
- [ ] Prop Landing (/prop) - 3 idiomas?
- [ ] Checkout Form - campos em 3 idiomas?
- [ ] Hero sections, CTA buttons - i18n correto?

#### 3.4 Locale Files Structure
- [ ] Verificar se en.json tem TODAS as chaves
- [ ] Verificar se pt.json tem TODAS as chaves
- [ ] Verificar se es.json tem TODAS as chaves
- [ ] Documentar chaves faltantes

### ⏳ PENDENTE - FASE 4: Testes de i18n

#### 4.1 Testes Funcionais
- [ ] Trocar idioma em navegador - todas páginas renderizam correto?
- [ ] Recarregar página - idioma persiste (localStorage)?
- [ ] Verificar fallback (ex: chave não encontrada em ES → usa EN)
- [ ] Links legais - routing correto em todos idiomas?

#### 4.2 Testes de Conteúdo
- [ ] Nenhum texto hardcoded (em inglês quando deveria ser multilíngue)
- [ ] Datas localizadas (26 de março vs March 26 vs 26 de marzo)
- [ ] Moedas/formatos numéricos respeitam locale
- [ ] Direção de texto (RTL se houver árabe no futuro)

---

## IMPLEMENTAÇÃO RECOMENDADA

### Ordem de Prioridade:
1. **CRÍTICO** → Integrar políticas Prop robustas (Fase 1.1)
2. **ALTO** → i18n keys para políticas (Fase 2)
3. **ALTO** → Auditoria completa de multilíngue (Fase 3)
4. **MÉDIO** → Testes de validação (Fase 4)

### Esforço Estimado:
- Fase 1: 2-3 horas (copiar/colar estruturas, adaptar)
- Fase 2: 1-2 horas (adicionar chaves em 3 JSON)
- Fase 3: 3-4 horas (auditoria manual)
- Fase 4: 1-2 horas (testes)

**Total: ~8-12 horas** de trabalho cuidadoso

---

## CHECKLIST FINAL (100% MULTILÍNGUE)

Quando concluído, validar:

- [ ] Nenhuma página com texto em inglês quando user está em PT/ES
- [ ] Todas as datas formatadas conforme locale
- [ ] Todos os botões/links traduzidos
- [ ] Formulários labels em correto idioma
- [ ] Mensagens de erro localizadas
- [ ] Políticas Prop acessíveis em 3 idiomas
- [ ] Navegação legal completa em 3 idiomas
- [ ] Admin dashboard em português (quando aplicável)
- [ ] Client dashboard em português (quando aplicável)
- [ ] Language selector (navbar) funciona perfeitamente
- [ ] Geolocalização detecta corretamente (BR → PT, ES → ES, etc)
- [ ] Fallback EN funciona para chaves não localizadas

---

## NOTAS IMPORTANTES

1. **Arquivo de Políticas:** `/docs/PROP_POLICIES_2026_COMPREHENSIVE.ts` contém estrutura completa

2. **Architecture:**
   - `legalContent.ts` → Políticas estruturadas (PT/EN/ES functions)
   - `locales/pt.json`, `en.json`, `es.json` → i18n keys
   - `propSupplemental.ts` → Customizações adicionais Prop

3. **i18n Setup:**
   - 3 idiomas suportados: `en`, `pt`, `es`
   - Auto-detecção por geolocalização
   - Manual override via localStorage `everwin.language.manual`

4. **Legal Pages Route:**
   - `/legal/{slug}` → `LegalStructuredPage` component
   - Renderiza via `getLegalPolicyContent(language, slug)`

---

## PRÓXIMOS PASSOS (DO USUÁRIO)

1. Confirmar começar pela **Fase 1** (integrar políticas robustas)
2. Ou começar pela **Fase 3** (auditoria completa de multilíngue)
3. Ou fazer **tudo** em sequência

Qual você prefere começar?
