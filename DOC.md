# DOC — Contexto Completo da Operação (Prop Trading / Landing Page Everwin)

Data de consolidação: 26/02/2026
Projeto: `everwin-landing-page`
Caminho: `/Users/junioraraujo/Desktop/2026 erverwin lp/everwin-landing-page`

## 1) Objetivo geral da operação
Esta operação teve como foco principal:

1. Ajustar e estabilizar a experiência da página de Prop (`/prop`) sem despadronizar o visual do site.
2. Reestruturar conteúdo de regras e condições do programa de prop trading com maior robustez jurídica e operacional.
3. Criar uma página legal específica para o programa de Prop Trading, separada dos Termos gerais.
4. Ajustar planos e pricing para PT-BR e EN conforme orientações comerciais recebidas durante a execução.

## 2) Diretrizes do usuário ao longo da operação
Resumo das instruções recebidas (consolidadas):

1. Manter padrão visual e tipográfico coerente com a homepage (hierarquia de textos, botões, sombras, cores, estilo).
2. Reduzir excesso de dark theme e evitar visual “colorido demais”.
3. Preservar/retornar comportamento do bloco “How it works” com destaque em verde, sem exageros visuais.
4. Hero da Prop com animação leve relacionada a trading (sem poluição visual).
5. Formulário da Prop não deveria parecer checkout; deveria parecer processo de candidatura/entrevista.
6. Incluir termos de aceite e isenção de responsabilidade no fluxo de candidatura.
7. Criar página legal completa com políticas de Prop Trading, inspirada na estrutura de mercado (incluindo especificidades de regras).
8. Ajustar planos e valores mais de uma vez, chegando ao pricing final definido abaixo.

## 3) Resultado visual e funcional consolidado

### 3.1 Página `/prop`
- Estrutura por seções implementada/mantida:
  - Hero
  - How it Works
  - Plans
  - Rules
  - FAQ
  - CTA
- Animação de fundo no hero de Prop foi mantida em abordagem leve (grid/ticker/chart/candles), evitando carga visual excessiva.
- Padronização visual voltou para linguagem clara (não escura pesada), em linha com o padrão solicitado no fluxo.

Arquivos relevantes:
- `src/pages/PropPage.tsx`
- `src/sections/PropSection/PropHero.tsx`
- `src/sections/PropSection/PropHowItWorks.tsx`
- `src/sections/PropSection/PropPlans.tsx`
- `src/sections/PropSection/PropRules.tsx`
- `src/sections/PropSection/PropFAQ.tsx`
- `src/sections/PropSection/PropCTA.tsx`
- `src/index.css` (animações e classes auxiliares do hero)

### 3.2 Página `/prop/checkout`
- Fluxo adaptado para candidatura/entrevista (3 etapas):
  1. Dados pessoais
  2. Perfil operacional
  3. Termos e responsabilidade
- Inclusão de checkboxes de aceite explícito:
  - aceite de regras operacionais
  - ciência de ausência de garantia
  - isenção de responsabilidade da empresa
- Inclusão de link para política completa de Prop Trading.

Arquivo relevante:
- `src/pages/PropCheckout.tsx`

## 4) Página legal específica criada
Foi criada uma página legal dedicada ao programa, separada dos termos gerais:

- Nova rota: `/legal/prop-trading-terms`
- Arquivo:
  - `src/pages/legal/prop-trading-terms.tsx`

### 4.1 Conteúdo da política (escopo implementado)
A política cobre, em estrutura formal:

1. Definições essenciais
2. Natureza do programa
3. Elegibilidade e KYC/compliance
4. Planos, valores e parâmetros comerciais
5. Estrutura de avaliação e estados da conta
6. Limites de risco obrigatórios (DLL, drawdown, hard breach)
7. Regras de execução/conduta
8. Regra de consistência e boa-fé
9. Política de payout
10. Reprovação, reset e cooldown
11. Limites administrativos e prevenção de abuso
12. Isenção de responsabilidade e ausência de garantia
13. Atualizações de política
14. Hierarquia normativa
15. Contato

### 4.2 Integração da página legal no produto
- Rotas:
  - `src/Routes.tsx`
- Sidebar legal:
  - `src/pages/legal/legalNav.tsx`
- Footer legal/policies:
  - `src/sections/Footer/components/FooterContent.tsx`
- Chaves de i18n adicionadas para navegação:
  - `src/locales/pt.json`
  - `src/locales/en.json`
  - `src/locales/es.json`

## 5) Pricing e planos — evolução até o estado final
Houve múltiplas rodadas de ajuste comercial. O estado FINAL definido pelo usuário ficou:

### 5.1 PT-BR (BRL) — FINAL
Planos:
- R$ 25.000 → R$ 497
- R$ 50.000 → R$ 874
- R$ 100.000 → R$ 1.397
- R$ 150.000 → R$ 1.497

### 5.2 EN/ES (USD) — FINAL
Diretriz recebida: “em inglês, diminuir o saldo pela metade”.
Saldos finais em USD:
- $12,500
- $25,000
- $50,000
- $75,000

Preços USD mantidos conforme configuração já existente:
- $199, $349, $549, $999

### 5.3 Arquivo fonte dos planos
- `src/data/propPlans.ts`

## 6) i18n e textos atualizados
Os textos de hero/plans (estatísticas e cards) e referências de valores foram sincronizados com os números atuais para evitar divergência entre:

1. Cards de planos
2. Hero (capital máximo)
3. Política legal

Arquivos principais de locale:
- `src/locales/pt.json`
- `src/locales/en.json`
- `src/locales/es.json`

## 7) Regras e referências de mercado usadas como base conceitual
A reformulação da política específica buscou alinhamento de estrutura com padrões de prop firms modernas (ex.: políticas de consistência, limites de risco, conduta, payout e abuso operacional), evitando cópia literal e preservando linguagem própria do produto.

Pilares incorporados:
- distinção entre violação diária e violação crítica
- enforcement de drawdown e consistência
- restrições de conduta (hedge indevido, exploração de sistema etc.)
- revisão manual e ausência de garantia de aprovação/payout

## 8) Arquivos tocados na operação (visão consolidada)
Principais arquivos alterados/criados no escopo da operação:

1. `src/pages/PropPage.tsx`
2. `src/pages/PropCheckout.tsx`
3. `src/sections/PropSection/PropHero.tsx`
4. `src/sections/PropSection/PropHowItWorks.tsx`
5. `src/sections/PropSection/PropPlans.tsx`
6. `src/sections/PropSection/PropRules.tsx`
7. `src/sections/PropSection/PropFAQ.tsx`
8. `src/sections/PropSection/PropCTA.tsx`
9. `src/index.css`
10. `src/data/propPlans.ts`
11. `src/pages/legal/prop-trading-terms.tsx` (novo)
12. `src/Routes.tsx`
13. `src/pages/legal/legalNav.tsx`
14. `src/sections/Footer/components/FooterContent.tsx`
15. `src/locales/pt.json`
16. `src/locales/en.json`
17. `src/locales/es.json`

## 9) Build e validação técnica
Build executado com sucesso em múltiplas iterações:
- Comando: `npm run build`
- Resultado: sucesso na geração de `dist`

Warnings conhecidos (não bloqueantes) permaneceram:
- Warning de minificação CSS relacionado a `--tw-translate-y: ${distance}px;` (pré-existente no fluxo)
- Warning de chunk > 500kb no bundle (informativo de performance)

## 10) Estado final esperado pelo negócio

1. Página Prop com identidade visual alinhada ao padrão do site, sem “dark exagerado”.
2. Formulário de candidatura com caráter de entrevista e aceite legal explícito.
3. Página legal específica de Prop Trading publicada e navegável.
4. Planos e valores finais aplicados conforme decisão comercial mais recente.

## 11) Observações operacionais

1. O repositório não apresentou `README.md` na raiz no momento desta consolidação; este `DOC.md` foi criado na raiz do projeto conforme solicitado.
2. Existe diretório `dist/` versionado com artefatos alterados por builds locais durante a operação.
3. A branch atual observada durante a execução foi `main`.

## 12) Snapshot comercial final (resumo executivo)

### PT-BR
- 25.000 / 497
- 50.000 / 874
- 100.000 / 1.397
- 150.000 / 1.497

### EN/ES
- 12,500 / 199
- 25,000 / 349
- 50,000 / 549
- 75,000 / 999

---
Documento gerado para centralizar o contexto integral da operação de Prop Trading no frontend e nas políticas legais associadas.
