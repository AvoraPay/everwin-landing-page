import { formatPropCurrency, getPropPlans } from "../../data/propPlans";
import type { AppLanguage } from "../../lib/language";

export type LegalInlineItem = string | { label: string; text: string };

export type LegalTable = {
  columns: string[];
  rows: string[][];
};

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: LegalInlineItem[];
  ordered?: boolean;
  table?: LegalTable;
  note?: string;
};

export type LegalPolicyPageContent = {
  title: string;
  updated: string;
  lead: string;
  intro?: string[];
  sections: LegalSection[];
};

export type LegalPageSlug =
  | "privacy"
  | "terms"
  | "cookies"
  | "payment-policy"
  | "withdrawal-policy"
  | "general-fees"
  | "risk-disclosure"
  | "order-execution"
  | "margin-trading"
  | "aml"
  | "demo-accounts"
  | "prop-evaluation-policy"
  | "prop-plans-fees"
  | "prop-account-access"
  | "prop-account-access-policy"
  | "prop-payout-policy"
  | "prop-purchase-reset-policy"
  | "prop-trading-restrictions"
  | "account-closure";

const SUPPORT_EMAIL = "support@everwin.trade";

const UPDATED_AT: Record<AppLanguage, string> = {
  pt: "23 de março de 2026",
  en: "March 23, 2026",
  es: "23 de marzo de 2026",
};

function buildPlanTables(language: AppLanguage) {
  const brlPlans = getPropPlans("pt");
  const usdPlans = getPropPlans("en");

  if (language === "pt") {
    return {
      brl: {
        columns: ["Plano", "Saldo de Avaliação", "Taxa", "Destaque"],
        rows: brlPlans.map((plan, index) => [
          `Plano ${index + 1}`,
          formatPropCurrency(plan.size, "pt"),
          formatPropCurrency(plan.price, "pt"),
          plan.popular ? "Mais escolhido" : "-",
        ]),
      },
      usd: {
        columns: ["Plan", "Evaluation Balance", "Fee", "Highlight"],
        rows: usdPlans.map((plan, index) => [
          `Plan ${index + 1}`,
          formatPropCurrency(plan.size, "en"),
          formatPropCurrency(plan.price, "en"),
          plan.popular ? "Most selected" : "-",
        ]),
      },
      rules: {
        columns: ["Parâmetro operacional", "Padrão atual", "Observação"],
        rows: [
          ["Meta da Fase 1", "10%", "Calculada sobre o saldo inicial contratado."],
          ["Meta da Fase 2", "15%", "Calculada sobre o saldo inicial contratado."],
          ["Max Drawdown", "5%", "Violação crítica pode encerrar a etapa."],
          ["Daily Loss Limit", "3%", "Pode gerar pausa intradiária da conta."],
          ["Dias mínimos de trading", "5 dias", "Necessários para elegibilidade de aprovação."],
          ["Prazo por fase", "30 dias", "Pode ser alterado prospectivamente pela política comercial vigente."],
        ],
      },
    };
  }

  if (language === "es") {
    return {
      brl: {
        columns: ["Plan", "Saldo de evaluación", "Tarifa", "Destacado"],
        rows: brlPlans.map((plan, index) => [
          `Plan ${index + 1}`,
          formatPropCurrency(plan.size, "pt"),
          formatPropCurrency(plan.price, "pt"),
          plan.popular ? "Más elegido" : "-",
        ]),
      },
      usd: {
        columns: ["Plan", "Saldo de evaluación", "Tarifa", "Destacado"],
        rows: usdPlans.map((plan, index) => [
          `Plan ${index + 1}`,
          formatPropCurrency(plan.size, "en"),
          formatPropCurrency(plan.price, "en"),
          plan.popular ? "Más elegido" : "-",
        ]),
      },
      rules: {
        columns: ["Parámetro operativo", "Estándar actual", "Observación"],
        rows: [
          ["Objetivo de la Fase 1", "10%", "Calculado sobre el saldo inicial contratado."],
          ["Objetivo de la Fase 2", "15%", "Calculado sobre el saldo inicial contratado."],
          ["Max Drawdown", "5%", "Una infracción crítica puede terminar la etapa."],
          ["Daily Loss Limit", "3%", "Puede pausar la cuenta durante la sesión."],
          ["Días mínimos de trading", "5 días", "Obligatorios para la elegibilidad de aprobación."],
          ["Duración por fase", "30 días", "Puede cambiar de forma prospectiva según la política comercial vigente."],
        ],
      },
    };
  }

  return {
    brl: {
      columns: ["Plan", "Evaluation Balance", "Fee", "Highlight"],
      rows: brlPlans.map((plan, index) => [
        `Plan ${index + 1}`,
        formatPropCurrency(plan.size, "pt"),
        formatPropCurrency(plan.price, "pt"),
        plan.popular ? "Most selected" : "-",
      ]),
    },
    usd: {
      columns: ["Plan", "Evaluation Balance", "Fee", "Highlight"],
      rows: usdPlans.map((plan, index) => [
        `Plan ${index + 1}`,
        formatPropCurrency(plan.size, "en"),
        formatPropCurrency(plan.price, "en"),
        plan.popular ? "Most selected" : "-",
      ]),
    },
    rules: {
      columns: ["Operational parameter", "Current standard", "Observation"],
      rows: [
        ["Phase 1 target", "10%", "Calculated on the starting balance of the purchased plan."],
        ["Phase 2 target", "15%", "Calculated on the starting balance of the purchased plan."],
        ["Max Drawdown", "5%", "A critical breach may terminate the stage."],
        ["Daily Loss Limit", "3%", "May pause the account for the remainder of the session."],
        ["Minimum trading days", "5 days", "Required before phase approval can be granted."],
        ["Duration per phase", "30 days", "May be updated prospectively by the then-current commercial policy."],
      ],
    },
  };
}

const PROP_SPECIFIC_SLUGS = new Set<LegalPageSlug>([
  "prop-evaluation-policy",
  "prop-plans-fees",
  "prop-account-access",
  "prop-account-access-policy",
  "prop-payout-policy",
  "prop-purchase-reset-policy",
  "prop-trading-restrictions",
]);

function getStandardSections(language: AppLanguage) {
  if (language === "pt") {
    return {
      updates: {
        title: "Atualizações desta política",
        paragraphs: [
          "A Everwin poderá revisar, complementar, consolidar ou atualizar esta política sempre que houver necessidade operacional, comercial, técnica, regulatória, contratual ou de integridade do ecossistema. A versão vigente publicada nos canais oficiais será a referência aplicável ao tema correspondente.",
        ],
      } satisfies LegalSection,
      hierarchy: {
        title: "Hierarquia normativa",
        paragraphs: [
          "Esta política deve ser lida em conjunto com os Termos e Condições gerais da Everwin, a Política de Privacidade e, quando aplicável, os Termos de Uso do Prop Trading. Em temas específicos do programa Prop, prevalecerá a política específica mais diretamente relacionada ao assunto tratado.",
        ],
      } satisfies LegalSection,
      contact: {
        title: "Contato",
        paragraphs: [
          `Para esclarecimentos, validações documentais, solicitações operacionais ou dúvidas sobre esta política, entre em contato pelo e-mail ${SUPPORT_EMAIL}.`,
        ],
      } satisfies LegalSection,
      updateKeywords: ["Atualizações", "Alterações"],
      hierarchyKeywords: ["Hierarquia"],
    };
  }

  if (language === "es") {
    return {
      updates: {
        title: "Actualizaciones de esta política",
        paragraphs: [
          "Everwin podrá revisar, complementar, consolidar o actualizar esta política cuando exista necesidad operativa, comercial, técnica, regulatoria, contractual o de integridad del ecosistema. La versión vigente publicada en los canales oficiales será la referencia aplicable al tema correspondiente.",
        ],
      } satisfies LegalSection,
      hierarchy: {
        title: "Jerarquía normativa",
        paragraphs: [
          "Esta política debe leerse junto con los Términos y Condiciones generales de Everwin, la Política de Privacidad y, cuando corresponda, los Términos de Prop Trading. En materias específicas del programa Prop, prevalecerá la política específica más directamente relacionada con el asunto tratado.",
        ],
      } satisfies LegalSection,
      contact: {
        title: "Contacto",
        paragraphs: [
          `Para aclaraciones, validaciones documentales, solicitudes operativas o dudas sobre esta política, contacte a ${SUPPORT_EMAIL}.`,
        ],
      } satisfies LegalSection,
      updateKeywords: ["Actualizaciones", "Cambios"],
      hierarchyKeywords: ["Jerarqu"],
    };
  }

  return {
    updates: {
      title: "Policy Updates",
      paragraphs: [
        "Everwin may revise, supplement, consolidate, or update this policy whenever operational, commercial, technical, regulatory, contractual, or ecosystem-integrity needs so require. The active version published through official channels will be the controlling reference for the relevant subject matter.",
      ],
    } satisfies LegalSection,
    hierarchy: {
      title: "Normative Hierarchy",
      paragraphs: [
        "This policy should be read together with the general Everwin Terms & Conditions, the Privacy Policy, and, where applicable, the Prop Trading Terms. For matters specifically tied to the Prop program, the most directly applicable Prop-specific policy will prevail.",
      ],
    } satisfies LegalSection,
    contact: {
      title: "Contact",
      paragraphs: [
        `For clarifications, document validation, operational requests, or questions about this policy, please contact ${SUPPORT_EMAIL}.`,
      ],
    } satisfies LegalSection,
    updateKeywords: ["Updates", "Changes"],
    hierarchyKeywords: ["Hierarchy"],
  };
}

function hasSectionWithKeyword(page: LegalPolicyPageContent, keywords: string[]) {
  return page.sections.some((section) =>
    keywords.some((keyword) => section.title.toLowerCase().includes(keyword.toLowerCase())),
  );
}

function pageMentionsSupportEmail(page: LegalPolicyPageContent) {
  return JSON.stringify(page).includes(SUPPORT_EMAIL);
}

function enrichPages(language: AppLanguage, pages: Record<LegalPageSlug, LegalPolicyPageContent>) {
  const standard = getStandardSections(language);

  return Object.fromEntries(
    Object.entries(pages).map(([slug, page]) => {
      const nextSections = [...page.sections];

      if (PROP_SPECIFIC_SLUGS.has(slug as LegalPageSlug) && !hasSectionWithKeyword(page, standard.hierarchyKeywords)) {
        nextSections.push(standard.hierarchy);
      }

      if (!hasSectionWithKeyword(page, standard.updateKeywords)) {
        nextSections.push(standard.updates);
      }

      if (!pageMentionsSupportEmail(page)) {
        nextSections.push(standard.contact);
      }

      return [slug, { ...page, sections: nextSections }];
    }),
  ) as Record<LegalPageSlug, LegalPolicyPageContent>;
}

function getPortuguesePages(): Record<LegalPageSlug, LegalPolicyPageContent> {
  const tables = buildPlanTables("pt");

  return {
    privacy: {
      title: "Política de Privacidade",
      updated: UPDATED_AT.pt,
      lead: "Como a Everwin coleta, utiliza, compartilha, armazena e protege dados pessoais no site, na corretora e nas jornadas do programa Prop.",
      intro: [
        'Esta Política de Privacidade descreve o tratamento de dados realizado pela Everwin ("Everwin", "nós") em seus sites, formulários, landing pages, canais de suporte, áreas de cliente e fluxos operacionais vinculados aos seus produtos e programas.',
      ],
      sections: [
        {
          title: "1. Escopo de aplicação",
          items: [
            "Esta política se aplica a visitantes, leads, clientes, candidatos a programas, afiliados e usuários que interagem com propriedades digitais da Everwin.",
            "Fluxos conduzidos por terceiros integrados, como processadores de pagamento, provedores de analytics, CRM, mensageria e verificação, podem estar sujeitos a políticas adicionais desses fornecedores.",
          ],
        },
        {
          title: "2. Dados que podemos coletar",
          items: [
            { label: "Identificação", text: "nome, e-mail, telefone, país, idioma, dados cadastrais e dados informados em formulários." },
            { label: "Operacionais", text: "produto contratado, plano selecionado, status da submissão, histórico de suporte, dados de login e uso do portal." },
            { label: "Financeiros e transacionais", text: "método de pagamento, status de cobrança, moeda, valor, identificadores do pedido e eventos antifraude." },
            { label: "Técnicos", text: "IP, tipo de dispositivo, navegador, sistema operacional, logs, identificadores de sessão, idioma e localização aproximada por país." },
            { label: "Compliance", text: "documentos, provas de identidade, residência, titularidade e outras informações necessárias para KYC, AML, prevenção a fraude ou payout." },
          ],
        },
        {
          title: "3. Fontes de coleta",
          items: [
            "Diretamente de você, quando preenche formulários, cria cadastro, compra planos, envia documentos, acessa o portal ou entra em contato com o suporte.",
            "Automaticamente, por meio de cookies, logs, pixels, SDKs, analytics e ferramentas técnicas de segurança e performance.",
            "De parceiros operacionais e prestadores de serviço que auxiliam na cobrança, verificação, CRM, antifraude, hospedagem, atendimento e infraestrutura.",
          ],
        },
        {
          title: "4. Finalidades de tratamento",
          items: [
            "Operar o site, processar compras, criar acessos, provisionar contas, prestar suporte e executar fluxos do programa Prop e demais produtos.",
            "Manter segurança, prevenir fraude, abuso, chargeback, múltiplas contas indevidas, manipulação operacional e uso não autorizado.",
            "Cumprir obrigações legais, regulatórias, tributárias, de auditoria, de investigação ou de cooperação com autoridades competentes.",
            "Personalizar idioma, moeda, conteúdo e experiência com base em preferências explícitas, navegador, geolocalização por país e interações anteriores.",
            "Realizar comunicações operacionais, comerciais ou de retenção, respeitando a legislação aplicável e mecanismos de opt-out quando exigidos.",
          ],
        },
        {
          title: "5. Bases legais e legitimidade",
          paragraphs: [
            "Quando aplicável, o tratamento poderá ocorrer com base na execução de contrato, cumprimento de obrigação legal, exercício regular de direitos, legítimo interesse em segurança e operação do ecossistema, bem como consentimento em situações específicas.",
          ],
        },
        {
          title: "6. Compartilhamento de dados",
          items: [
            "Podemos compartilhar dados com operadores e prestadores de serviço envolvidos na hospedagem, cobrança, CRM, mensageria, analytics, verificação, antifraude e atendimento.",
            "Também poderemos compartilhar dados quando necessário para proteger direitos, investigar suspeitas, responder a ordens legais, prevenir fraude ou viabilizar auditorias internas e externas.",
            "A Everwin não comercializa dados pessoais como atividade principal; qualquer compartilhamento deve estar conectado à operação legítima da plataforma e de seus produtos.",
          ],
        },
        {
          title: "7. Retenção, segurança e direitos do titular",
          items: [
            "Os dados são mantidos pelo período necessário para fins operacionais, legais, tributários, contratuais, de auditoria, de defesa e de prevenção a abuso.",
            "Adotamos medidas administrativas, técnicas e organizacionais razoáveis para reduzir risco de acesso não autorizado, perda, vazamento, alteração ou uso indevido.",
            "Conforme a legislação aplicável, o titular poderá solicitar acesso, correção, atualização, anonimização, portabilidade, exclusão, revisão ou revogação de consentimento quando cabível.",
          ],
          note: `Solicitações relacionadas à privacidade podem ser encaminhadas para ${SUPPORT_EMAIL}. Em algumas hipóteses, a Everwin poderá solicitar confirmação adicional de identidade antes de atender a requisição.`,
        },
      ],
    },
    terms: {
      title: "Termos e Condições",
      updated: UPDATED_AT.pt,
      lead: "Termos gerais que regem o acesso ao site, às páginas comerciais, aos portais de cliente e às experiências digitais operadas pela Everwin.",
      intro: [
        "Ao acessar ou utilizar qualquer ambiente operado pela Everwin, o usuário declara ter lido, compreendido e aceitado estes Termos, bem como as políticas específicas aplicáveis a cada produto ou serviço.",
      ],
      sections: [
        {
          title: "1. Elegibilidade e uso permitido",
          items: [
            "O usuário deve ter capacidade legal para contratar e utilizar os serviços em sua jurisdição.",
            "A Everwin poderá restringir acesso por motivo legal, operacional, comercial, de risco, de compliance ou de integridade do ecossistema.",
            "É proibido utilizar a plataforma para fraude, abuso, engenharia reversa, automação indevida, scraping não autorizado, manipulação de métricas ou conduta ilícita.",
          ],
        },
        {
          title: "2. Cadastro, credenciais e integridade da conta",
          items: [
            "As informações fornecidas devem ser verdadeiras, atualizadas e passíveis de verificação.",
            "O usuário é responsável por preservar e controlar suas credenciais, dispositivos e métodos de autenticação.",
            "A Everwin poderá suspender ou encerrar acessos quando houver indícios de uso compartilhado, identidade falsa, conta de terceiro, fraude, abuso promocional ou violação contratual.",
          ],
        },
        {
          title: "3. Natureza informacional e ausência de aconselhamento",
          items: [
            "Conteúdos, páginas, vídeos, artigos, materiais educacionais e comunicações institucionais possuem caráter informativo, educacional ou comercial.",
            "Nada no site constitui recomendação individual de investimento, promessa de retorno, aconselhamento financeiro, jurídico, contábil ou tributário.",
          ],
        },
        {
          title: "4. Produtos específicos e políticas complementares",
          items: [
            "Produtos como corretagem, materiais educacionais, afiliados, avaliações Prop, contas simuladas e portais internos podem possuir políticas próprias adicionais.",
            "Em caso de conflito entre estes Termos gerais e uma política específica de produto, prevalecerá a política específica para o tema correspondente.",
          ],
        },
        {
          title: "5. Propriedade intelectual e uso de conteúdo",
          items: [
            "Layout, textos, identidade visual, marcas, scripts, materiais, dashboards, fluxos, software e demais ativos da Everwin ou de seus licenciadores são protegidos por direitos aplicáveis.",
            "É vedado copiar, revender, espelhar, distribuir, modificar ou criar derivativos sem autorização expressa por escrito.",
          ],
        },
        {
          title: "6. Disponibilidade, alterações e responsabilidade",
          items: [
            "Os ambientes podem ser alterados, pausados, limitados ou descontinuados a qualquer tempo por razões técnicas, legais, comerciais ou operacionais.",
            "Na máxima extensão permitida por lei, a Everwin não garante disponibilidade ininterrupta, ausência de erros, compatibilidade universal ou resultados específicos.",
            "O uso contínuo após atualizações de políticas, fluxos, preços ou funcionalidades representa aceitação da versão vigente.",
          ],
          note: `Dúvidas gerais podem ser encaminhadas para ${SUPPORT_EMAIL}.`,
        },
      ],
    },
    cookies: {
      title: "Política de Cookies",
      updated: UPDATED_AT.pt,
      lead: "Como utilizamos cookies, pixels, local storage e tecnologias similares para operação, personalização, segurança e medição.",
      intro: [
        "Cookies e tecnologias similares ajudam a manter funcionalidades essenciais do site, registrar preferências, medir performance, entender comportamento de navegação e proteger a operação contra abuso.",
      ],
      sections: [
        {
          title: "1. Categorias de tecnologia utilizadas",
          items: [
            { label: "Essenciais", text: "necessárias para login, navegação, idioma, segurança, persistência de sessão e funcionamento do site." },
            { label: "Preferência", text: "lembram idioma, escolhas do usuário, estado de formulários e configurações relevantes." },
            { label: "Medição e analytics", text: "ajudam a entender páginas acessadas, performance de campanhas, eventos, funis e estabilidade técnica." },
            { label: "Segurança", text: "apoiam verificação de tráfego, mitigação de abuso, antifraude, limitação de tentativas e análise de risco." },
          ],
        },
        {
          title: "2. Finalidades",
          items: [
            "Manter o site funcional e lembrar preferências, incluindo idioma definido manualmente ou detectado automaticamente.",
            "Apoiar melhorias de UX, performance, estabilidade e identificação de gargalos nas páginas comerciais e portais.",
            "Mensurar campanhas, formulários, submissões e origens de tráfego, quando esse tratamento for compatível com a base legal aplicável.",
          ],
        },
        {
          title: "3. Controle pelo usuário",
          items: [
            "O usuário pode gerenciar cookies no navegador ou por ferramentas específicas disponibilizadas pela Everwin quando existirem.",
            "A desativação de cookies essenciais ou de armazenamento local pode comprometer login, preferências, formulários e outras funcionalidades críticas.",
          ],
        },
        {
          title: "4. Tecnologias de terceiros",
          items: [
            "Ferramentas integradas de analytics, CRM, chat, mídia, performance, antifraude ou mensageria podem definir seus próprios identificadores técnicos.",
            "Sempre que possível, a Everwin busca reduzir coleta excessiva e utilizar provedores alinhados à finalidade operacional do site.",
          ],
        },
        {
          title: "5. Atualizações e contato",
          paragraphs: [
            `Esta política pode ser atualizada sempre que houver ajuste relevante em ferramentas, finalidades ou exigências legais. Para dúvidas, entre em contato com ${SUPPORT_EMAIL}.`,
          ],
        },
      ],
    },
    "payment-policy": {
      title: "Política de Pagamento",
      updated: UPDATED_AT.pt,
      lead: "Regras gerais para cobranças, compras de planos, aprovação de pedidos, verificação e prevenção a fraude nos produtos da Everwin.",
      intro: [
        "Esta política se aplica aos pagamentos realizados em fluxos oficiais da Everwin, inclusive páginas de produto, checkout do programa Prop, planos, materiais e demais ofertas disponibilizadas pela marca.",
      ],
      sections: [
        {
          title: "1. Canais e meios autorizados",
          items: [
            "Somente métodos apresentados no checkout oficial, em páginas operadas pela Everwin ou em integrações oficiais devem ser considerados válidos.",
            "Disponibilidade de moeda, parcelamento, método e adquirente pode variar por país, idioma, produto, análise de risco e disponibilidade técnica.",
          ],
        },
        {
          title: "2. Aprovação de pedidos",
          items: [
            "Pedidos passam por autenticação, validação de dados, retorno do processador e mecanismos de segurança antes da aprovação final.",
            "A confirmação de cobrança não implica necessariamente provisionamento imediato do produto; etapas internas de verificação, conciliação ou revisão manual podem ser exigidas.",
            "A Everwin poderá cancelar, segurar ou recusar pedidos com inconsistência cadastral, duplicidade, risco de fraude, chargeback anterior, testes indevidos ou uso incompatível com as políticas vigentes.",
          ],
        },
        {
          title: "3. Pagamentos do programa Prop",
          items: [
            "A compra de avaliação Prop refere-se à contratação de uma etapa de validação operacional, e não à aquisição de instrumento financeiro, investimento coletivo ou promessa de resultado.",
            "A liberação de credenciais do portal e da conta vinculada depende de pagamento aprovado, revisão interna e aderência às regras comerciais e operacionais do programa.",
          ],
        },
        {
          title: "4. Taxas, impostos e conversão",
          items: [
            "Os valores exibidos no checkout refletem a oferta vigente no momento da compra, podendo existir custos adicionais de conversão, IOF, spread cambial, parcelamento ou tarifas do meio de pagamento.",
            "Tributos, retenções ou encargos eventualmente aplicáveis ao usuário ou à operação poderão ser tratados conforme a legislação, o método utilizado e a estrutura comercial vigente.",
          ],
        },
        {
          title: "5. Disputas, chargebacks e abuso",
          items: [
            "Pedidos sob contestação, chargeback ou suspeita de fraude podem ter acesso suspenso, benefícios revistos e serviços bloqueados até conclusão da apuração.",
            "A Everwin poderá reter provisionamento, revogar acessos ou negar recontratação quando houver histórico de fraude, chargeback abusivo ou tentativa de contornar os controles da plataforma.",
          ],
        },
        {
          title: "6. Contato",
          paragraphs: [
            `Questões relacionadas a pagamento, conciliação ou cobrança podem ser enviadas para ${SUPPORT_EMAIL}.`,
          ],
        },
      ],
    },
    "withdrawal-policy": {
      title: "Política de Saque",
      updated: UPDATED_AT.pt,
      lead: "Condições gerais para solicitações de saque, devolução de valores, titularidade e verificações complementares.",
      intro: [
        "Esta política descreve regras gerais para saques ou devoluções processadas pela Everwin quando aplicáveis ao produto ou estrutura comercial contratada.",
      ],
      sections: [
        {
          title: "1. Elegibilidade e escopo",
          items: [
            "Nem todo produto da Everwin gera saldo sacável. Taxas de avaliação, mensalidades, materiais ou compras de acesso podem não ser passíveis de saque, exceto quando houver previsão expressa na política comercial aplicável.",
            "Programas Prop, contas simuladas ou estruturas de payout possuem elegibilidade própria e devem observar as políticas específicas do programa vigente.",
          ],
        },
        {
          title: "2. Verificação e titularidade",
          items: [
            "A Everwin poderá exigir KYC, comprovação de titularidade, histórico operacional, validação documental, revisão antifraude e confirmação do método de recebimento.",
            "Saque para terceiros, contas sem titularidade compatível, documentos divergentes ou estruturas suspeitas poderá ser recusado.",
          ],
        },
        {
          title: "3. Prazos de processamento",
          items: [
            "O prazo depende do método escolhido, da fila operacional, do calendário bancário, de revisões internas e do provedor externo responsável pela liquidação.",
            "A Everwin não controla integralmente atrasos causados por bancos, gateways, redes, validadores, feriados ou exigências extraordinárias de compliance.",
          ],
        },
        {
          title: "4. Retenções, recusas e ajustes",
          items: [
            "Solicitações poderão ser retidas, recusadas, ajustadas ou escaladas para revisão quando houver erro material, divergência cadastral, chargeback, suspeita de abuso, infração contratual, investigação em curso ou obrigação legal.",
            "A Everwin poderá compensar valores devidos, estornar liberações indevidas ou aplicar medidas administrativas quando houver pagamento realizado por engano ou com base em informação incorreta.",
          ],
        },
        {
          title: "5. Custos e tributos",
          items: [
            "Taxas bancárias, custos de remessa, spread cambial, retenções, impostos ou despesas do método de pagamento podem ser deduzidos ou cobrados conforme aplicável.",
          ],
        },
        {
          title: "6. Canal de suporte",
          paragraphs: [
            `Para dúvidas operacionais sobre saques e elegibilidade, utilize ${SUPPORT_EMAIL}.`,
          ],
        },
      ],
    },
    "general-fees": {
      title: "Taxas Gerais",
      updated: UPDATED_AT.pt,
      lead: "Visão consolidada das categorias de taxas, tarifas de terceiros e custos operacionais que podem existir nos produtos Everwin.",
      intro: [
        "Os produtos da Everwin podem envolver preços de aquisição, mensalidades, tarifas de terceiros, custos operacionais e encargos relacionados a moeda, meio de pagamento, compliance ou suporte extraordinário.",
      ],
      sections: [
        {
          title: "1. Taxas de produto",
          items: [
            "Planos, avaliações, resets, ativações, upgrades, materiais e ofertas especiais podem ter preço próprio definido em landing page, checkout, proposta comercial ou política específica.",
            "Os valores vigentes na data da contratação prevalecem para aquela compra, salvo obrigação legal diversa.",
          ],
        },
        {
          title: "2. Custos de terceiros",
          items: [
            "Gateways, adquirentes, bancos, processadores e métodos alternativos podem cobrar encargos externos, inclusive spread cambial, parcelamento, remessa ou conversão.",
          ],
        },
        {
          title: "3. Custos administrativos e de exceção",
          items: [
            "Sempre que permitido por lei e previamente aplicável ao fluxo, a Everwin poderá adotar custos administrativos relacionados a fraude, investigação, recuperação, chargeback, reprocessamento ou tratamento excepcional.",
            "Custos decorrentes de erro do próprio usuário, envio de documentação incorreta, conta não elegível ou múltiplas tentativas indevidas podem demandar revisão operacional adicional.",
          ],
        },
        {
          title: "4. Programa Prop",
          items: [
            "As taxas do programa Prop estão detalhadas na política específica de planos e taxas, podendo variar por idioma, moeda, campanha, oferta comercial e atualização prospectiva.",
          ],
        },
        {
          title: "5. Transparência",
          paragraphs: [
            "A Everwin busca apresentar valores, moeda e regras aplicáveis durante o fluxo relevante. Na ausência de menção expressa, o usuário deve considerar que tarifas de terceiros e custos cambiais podem existir.",
          ],
        },
      ],
    },
    "risk-disclosure": {
      title: "Divulgação de Risco",
      updated: UPDATED_AT.pt,
      lead: "Avisos importantes sobre riscos de mercado, tecnologia, execução, alavancagem e programas de avaliação.",
      intro: [
        "Operações em mercados financeiros, ambientes simulados, produtos alavancados e programas de avaliação envolvem riscos relevantes. Nem toda pessoa possui perfil adequado para esse tipo de atividade.",
      ],
      sections: [
        {
          title: "1. Risco de perda e volatilidade",
          items: [
            "Mercados podem oscilar rapidamente por notícia, liquidez, eventos macroeconômicos, falhas técnicas, gaps e comportamento de outros participantes.",
            "Desempenho passado, em ambiente real ou simulado, não garante resultado futuro.",
          ],
        },
        {
          title: "2. Risco tecnológico e operacional",
          items: [
            "Latência, indisponibilidade, falhas de conectividade, diferença de horário, lentidão, bugs, indisponibilidade de integrações, interrupções de terceiros e incidentes operacionais podem impactar a experiência.",
            "A Everwin não garante disponibilidade contínua, nem ausência de falhas, atrasos ou diferenças entre ambientes.",
          ],
        },
        {
          title: "3. Risco em ambientes simulados e de avaliação",
          items: [
            "Contas demo, avaliações e ambientes simulados podem ter condições distintas do mercado real em preço, execução, liquidez, slippage, profundidade e disponibilidade.",
            "A aprovação em programas de avaliação depende de aderência a regras internas, critérios de risco, revisão operacional e compliance.",
          ],
        },
        {
          title: "4. Risco de alavancagem e margem",
          items: [
            "Produtos com efeito de alavancagem ou margem ampliam ganhos e perdas, podendo acelerar falhas, liquidações ou violações de limite.",
          ],
        },
        {
          title: "5. Ausência de promessa ou aconselhamento",
          items: [
            "A Everwin não promete rentabilidade, continuidade em programas, conta financiada, payouts, aprovação automática ou adequação do produto ao seu perfil.",
            "Nada no site deve ser interpretado como recomendação individualizada de investimento, tributária, jurídica ou contábil.",
          ],
        },
      ],
    },
    "order-execution": {
      title: "Política de Execução de Ordens",
      updated: UPDATED_AT.pt,
      lead: "Princípios gerais sobre formação de preço, latência, rejeição, logs operacionais e diferenças entre execução indicativa e efetiva.",
      intro: [
        "Esta política descreve princípios gerais aplicáveis à forma como ordens, solicitações ou eventos operacionais podem ser processados em ambientes suportados pela Everwin ou por provedores integrados.",
      ],
      sections: [
        {
          title: "1. Princípios de execução",
          items: [
            "A Everwin busca consistência operacional e proteção de integridade do ambiente, sem garantir execução perfeita em todo cenário.",
            "Preço, liquidez, volatilidade, fila, tipo de ordem, disponibilidade técnica e regras do produto podem afetar o resultado final.",
          ],
        },
        {
          title: "2. Preço indicativo e slippage",
          items: [
            "Cotações, gráficos e painéis podem ser indicativos e não representar, necessariamente, o preço executado.",
            "Slippage, gaps e diferenças de latência podem fazer com que a execução ocorra em valor distinto do esperado pelo usuário.",
          ],
        },
        {
          title: "3. Ambientes simulados e Prop",
          items: [
            "Em avaliações, contas simuladas ou infraestrutura Prop, a lógica operacional pode incluir regras internas de validação, limites de risco, pausas e reconciliação de eventos.",
            "A reprodução de mercado real não é garantida e pode haver diferenças em relação a ambiente de corretagem, dados ou infraestrutura externa.",
          ],
        },
        {
          title: "4. Rejeição, cancelamento e correção",
          items: [
            "Ordens ou eventos poderão ser rejeitados, cancelados, revistos ou corrigidos em caso de erro material, falha técnica, risco operacional, abuso, inconsistência de dados, força maior ou exigência legal.",
          ],
        },
        {
          title: "5. Logs, auditoria e investigação",
          items: [
            "A Everwin poderá manter registros técnicos, trilhas de auditoria e histórico de eventos para segurança, compliance, conciliação, prevenção a abuso e resolução de disputas.",
          ],
        },
      ],
    },
    "margin-trading": {
      title: "Negociação de Margem",
      updated: UPDATED_AT.pt,
      lead: "Informações essenciais sobre produtos com margem, alavancagem, risco de liquidação e adequação do usuário.",
      intro: [
        "Negociar com margem ou utilizar produtos alavancados pode amplificar substancialmente resultados positivos e negativos. Esse tipo de exposição não é adequado para todos os perfis.",
      ],
      sections: [
        {
          title: "1. Efeito da alavancagem",
          items: [
            "Movimentos relativamente pequenos podem gerar impacto proporcionalmente elevado sobre saldo, patrimônio ou limites operacionais.",
          ],
        },
        {
          title: "2. Risco de liquidação e chamadas de margem",
          items: [
            "Quando o nível de margem exigido não é atendido, posições podem ser reduzidas, encerradas ou liquidadas automaticamente.",
            "Eventos abruptos de mercado podem tornar a reação humana insuficiente para evitar perdas adicionais.",
          ],
        },
        {
          title: "3. Gaps, volatilidade e indisponibilidade",
          items: [
            "Gaps de abertura, eventos macro, baixa liquidez e falhas técnicas podem agravar exposição, execução e capacidade de ajuste.",
          ],
        },
        {
          title: "4. Adequação e responsabilidade do usuário",
          items: [
            "Cabe ao usuário avaliar se compreende o produto, os limites de margem, a mecânica de perda potencial e os riscos do mercado envolvido.",
          ],
        },
        {
          title: "5. Ausência de garantia",
          paragraphs: [
            "A Everwin não garante disponibilidade contínua de produtos com margem, condições constantes de liquidação nem adequação universal desse tipo de instrumento.",
          ],
        },
      ],
    },
    aml: {
      title: "Política AML & KYC",
      updated: UPDATED_AT.pt,
      lead: "Diretrizes para identificação de clientes, verificação documental, prevenção à lavagem de dinheiro, sanções e fraude.",
      intro: [
        "A Everwin mantém controles de identificação, verificação e monitoramento voltados à integridade do ecossistema, à prevenção de fraude e ao atendimento de exigências legais aplicáveis.",
      ],
      sections: [
        {
          title: "1. Verificação de identidade",
          items: [
            "Podemos solicitar documentos, selfies, comprovantes, dados complementares, informações de empresa ou outros elementos necessários para validar identidade e titularidade.",
            "A ausência de documentação suficiente pode impedir compra, provisionamento, saque, payout, recuperação de acesso ou continuidade operacional.",
          ],
        },
        {
          title: "2. Origem de fundos e análise de risco",
          items: [
            "Em situações de maior sensibilidade, a Everwin poderá solicitar informações sobre origem de recursos, finalidade da operação, vínculo com terceiros ou histórico transacional.",
          ],
        },
        {
          title: "3. Monitoramento contínuo",
          items: [
            "Contas, pagamentos, padrões operacionais, logins, solicitações de payout, múltiplos cadastros, comportamento em campanhas e eventos de risco podem ser monitorados continuamente.",
          ],
        },
        {
          title: "4. Restrições e jurisdições",
          items: [
            "A Everwin pode restringir ou encerrar relacionamento com base em listas de sanções, risco elevado, incompatibilidade regulatória, país, residência, documentação insuficiente ou uso suspeito.",
          ],
        },
        {
          title: "5. Cooperação e retenção de registros",
          items: [
            "A Everwin poderá cooperar com solicitações legais legítimas e manter registros pelo período necessário para compliance, auditoria, investigação e defesa de direitos.",
          ],
          note: "A adoção de controles AML/KYC não implica aceitação automática de qualquer usuário, pagamento ou pedido de payout.",
        },
      ],
    },
    "demo-accounts": {
      title: "Contas Demo",
      updated: UPDATED_AT.pt,
      lead: "Informações sobre ambientes de demonstração, testes, simulação e suas limitações em relação a operações reais.",
      intro: [
        "Ambientes demo, de avaliação e de simulação existem para fins educacionais, operacionais, de validação ou treinamento. Eles não reproduzem integralmente condições de mercado real.",
      ],
      sections: [
        {
          title: "1. Diferença para ambiente real",
          items: [
            "Preço, slippage, liquidez, profundidade, custo, execução, velocidade, limites e condições de mercado podem divergir de forma relevante.",
          ],
        },
        {
          title: "2. Resets, limites e disponibilidade",
          items: [
            "A Everwin poderá limitar acesso, reiniciar saldos, redefinir contas, suspender recursos ou descontinuar ambientes demo a qualquer tempo.",
          ],
        },
        {
          title: "3. Uso permitido",
          items: [
            "Ambientes demo não devem ser usados para fraude, exploração de falhas, engenharia reversa, extração de dados, abuso de infraestrutura ou contorno de políticas comerciais.",
          ],
        },
        {
          title: "4. Ausência de equivalência",
          items: [
            "Resultados obtidos em conta demo ou avaliação não garantem o mesmo desempenho em conta real, conta financiada, ambiente externo ou operação futura.",
          ],
        },
        {
          title: "5. Atualizações",
          paragraphs: [
            "Parâmetros de contas demo e simuladas podem mudar sem aviso prévio para refletir necessidades técnicas, comerciais, de risco ou de integridade do programa.",
          ],
        },
      ],
    },
    "prop-evaluation-policy": {
      title: "Política de Avaliação Prop",
      updated: UPDATED_AT.pt,
      lead: "Regras operacionais da jornada de avaliação, critérios de aprovação, limites de risco, revisão interna e desclassificação no programa Prop da Everwin.",
      intro: [
        "Esta política complementa os Termos de Uso do Prop Trading e detalha como a avaliação é estruturada, monitorada e validada dentro do ecossistema Everwin.",
      ],
      sections: [
        {
          title: "1. Natureza da avaliação",
          items: [
            "A avaliação é uma etapa de validação de performance, disciplina operacional, aderência a regras e integridade de comportamento.",
            "A conclusão de fases não constitui promessa automática de conta financiada, payout futuro ou permanência contínua no programa.",
          ],
        },
        {
          title: "2. Requisitos operacionais vigentes",
          table: tables.rules,
          note: "Os parâmetros acima refletem o padrão operacional atualmente exibido e podem ser ajustados prospectivamente pela política comercial e de risco vigente.",
        },
        {
          title: "3. Elegibilidade e documentação",
          items: [
            "A Everwin poderá exigir validação cadastral, KYC, documentos complementares e confirmação de titularidade antes, durante ou após a avaliação.",
            "Inconsistência documental, múltiplos cadastros irregulares, uso de terceiros ou fraude podem levar à desclassificação imediata.",
          ],
        },
        {
          title: "4. Conduta, consistência e integridade",
          items: [
            "A avaliação exige comportamento consistente, compatível com as regras de risco e com expectativa razoável de repetibilidade operacional.",
            "Estratégias consideradas abusivas, exploração de falhas, hedging proibido, copy trading de terceiros, manipulação de latência ou conduta artificial podem invalidar a etapa.",
          ],
        },
        {
          title: "5. Prazo, expiração e falhas",
          items: [
            "Cada fase possui prazo operacional, dias mínimos de trading e critérios próprios de validação.",
            "Violação de drawdown, extrapolação de prazo, descumprimento de política ou quebra de integridade podem resultar em falha, cooldown, recusa ou encerramento.",
          ],
        },
        {
          title: "6. Revisão de aprovação",
          items: [
            "A conclusão aparente de metas é submetida a revisão interna antes da aprovação final.",
            "A Everwin pode solicitar documentos, revisar histórico, investigar padrões e negar avanço quando houver risco operacional, inconsistência ou descumprimento contratual.",
          ],
        },
        {
          title: "7. Alterações prospectivas",
          paragraphs: [
            "Regras, métricas, exigências, limites e estrutura comercial do programa podem ser atualizados prospectivamente para novos pedidos, novos ciclos, resets ou etapas futuras.",
          ],
        },
      ],
    },
    "prop-plans-fees": {
      title: "Planos Prop e Taxas",
      updated: UPDATED_AT.pt,
      lead: "Tabela consolidada dos planos exibidos atualmente, moedas praticadas, parâmetros operacionais padrão e observações comerciais do programa Prop.",
      intro: [
        "Os planos e taxas podem variar por idioma, campanha, moeda, página comercial e atualização prospectiva. O checkout vigente no momento da compra prevalece para aquele pedido.",
      ],
      sections: [
        {
          title: "1. Planos em português (BRL)",
          table: tables.brl,
        },
        {
          title: "2. Planos internacionais (USD)",
          table: tables.usd,
        },
        {
          title: "3. Regras padrão atualmente vinculadas à avaliação",
          table: tables.rules,
        },
        {
          title: "4. Conversão, tributos e taxas externas",
          items: [
            "Parcelamento, spread cambial, IOF, taxa bancária, adquirente ou custo do método de pagamento podem impactar o valor efetivamente debitado do usuário.",
          ],
        },
        {
          title: "5. Promoções e atualização comercial",
          items: [
            "Campanhas promocionais, cupons, ativações especiais, pacotes e descontos podem ter janela limitada e regras próprias.",
            "A Everwin pode alterar valores, planos, benefícios e nomenclaturas prospectivamente sem obrigação de retroatividade.",
          ],
        },
      ],
    },
    "prop-account-access": {
      title: "Política de Acesso e Credenciais Prop",
      updated: UPDATED_AT.pt,
      lead: "Como são criados, vinculados, protegidos e recuperados os acessos ao portal Everwin e às contas relacionadas ao programa Prop.",
      intro: [
        "A jornada Prop pode envolver credenciais do portal Everwin, autenticação por e-mail ou OTP, e credenciais operacionais separadas para a conta de avaliação ou conta vinculada.",
      ],
      sections: [
        {
          title: "1. Estrutura de credenciais",
          items: [
            "O comprador poderá receber ou ativar um usuário do portal Everwin para acompanhar status, contas e comunicações do programa.",
            "Credenciais operacionais da conta de avaliação podem ser distintas das credenciais do portal e serão vinculadas ao titular elegível.",
          ],
        },
        {
          title: "2. Provisionamento de acesso",
          items: [
            "A criação do acesso depende de pagamento aprovado, verificação interna, eventual conciliação manual e disponibilidade operacional.",
            "A Everwin poderá revisar identidade antes de liberar, redefinir ou transferir credenciais.",
          ],
        },
        {
          title: "3. Responsabilidade do usuário",
          items: [
            "O titular deve manter sigilo de senha, e-mail, OTP, códigos, dispositivos e qualquer método de autenticação.",
            "Compartilhamento indevido, cessão a terceiros, uso por outra pessoa ou negligência de segurança pode resultar em bloqueio ou perda de elegibilidade.",
          ],
        },
        {
          title: "4. Recuperação, redefinição e bloqueio",
          items: [
            "A Everwin pode exigir validação adicional para reset de senha, desbloqueio de conta, alteração de e-mail ou recuperação de acesso.",
            "Tentativas excessivas, padrão suspeito, inconsistência cadastral ou uso indevido podem gerar bloqueio temporário ou revisão manual.",
          ],
        },
        {
          title: "5. Vínculo entre usuário e contas Prop",
          items: [
            "Uma ou mais contas Prop podem ser associadas ao mesmo usuário elegível, observando regras comerciais, limite operacional e titularidade.",
            "A compra é pessoal e vinculada aos dados reais do comprador, salvo autorização expressa e revisão formal da Everwin.",
          ],
        },
      ],
    },
    "prop-payout-policy": {
      title: "Política de Payout e Retirada - Programa Prop",
      updated: UPDATED_AT.pt,
      lead: "Requisitos de elegibilidade, revisão operacional, validação de titularidade e condições de retenção/negação aplicáveis a solicitações de payout no programa Prop.",
      intro: [
        "Payouts no programa Prop estão sujeitos a rigorosa verificação operacional, compliance, titularidade, conformidade integral com políticas Everwin e aderência a padrões internacionais de AML/KYC. Nenhum payout será processado sem aprovação explícita da equipe de compliance mediante revisão completa da conta.",
      ],
      sections: [
        {
          title: "1. ELEGIBILIDADE OPERACIONAL E COMPLIANCE",
          items: [
            "Somente fases, estruturas e contas expressamente autorizadas pela política comercial vigente poderão solicitar payout.",
            "Lucro aparente, meta atingida ou saldo positivo NÃO conferem automaticamente direito a payout.",
            "A conta deve estar em conformidade integral com todas as regras operacionais (drawdown, daily loss limit, dias de trading mínimo) por todo o período de vigência.",
            "Contas que violaram qualquer regra de risco, mesmo que posteriormente recuperadas, podem ter payout suspenso ou negado.",
          ],
        },
        {
          title: "2. VALIDAÇÃO DE SEGURANÇA E ACESSO ACCOUNT",
          items: [
            "MÚLTIPLOS IPS E LOCALIZAÇÕES GEOGRÁFICAS: Acessos simultâneos ou sequenciais a partir de múltiplos endereços IP, especialmente em diferentes países/fusos horários em janelas curtas de tempo, resultarão em DESQUALIFICAÇÃO IMEDIATA do programa.",
            "A detecção de acesso multi-IP não autenticado mediante fator 2FA robusto gerará automática suspensão de payout e possível perda total de saldo sem direito a reembolso.",
            "VPN, Proxy ou techniques de mascaramento de IP são expressamente proibidos. Sua detecção constituirá violação grave de integridade.",
            "Compartilhamento de credenciais de conta, mesmo dentro de entidade familiar ou corporativa, é proibido e resulta em exclusão imediata.",
          ],
        },
        {
          title: "3. DETECÇÃO AUTOMATIZADA E PROIBIÇÃO DE BOTS",
          items: [
            "A plataforma implementa monitoramento contínuo de padrões de comportamento, velocidade de execução e algoritmos de trading.",
            "Bots, scripts automatizados, APIs não autorizadas e estratégias mecanizadas são EXPRESSAMENTE PROIBIDOS.",
            "A detecção de bot resultará em DESQUALIFICAÇÃO IMEDIATA, congelamento de conta e retenção de saldo sem reembolso.",
            "Atividade suspeita inclui: ordens executadas com frequência inumana, padrões matemáticos perfeitos, ausência de erros comerciais normais, execução simultânea em múltiplos timeframes.",
            "Usuários são responsáveis por garantir que nenhum terceiro, software ou mecanismo autônomo acesse ou controle sua conta.",
          ],
        },
        {
          title: "4. REVISÃO OPERACIONAL APROFUNDADA",
          items: [
            "Antes de qualquer aprovação, Everwin executará análise forense de: consistência de trading, coerência de retornos, padrões comportamentais, histórico de risco e compliance com regras operacionais.",
            "Resultados concentrados, estatisticamente implausíveis ou incompatíveis com a política comercial padrão serão escalados para auditoria especializada.",
            "Contas com ganhos anormais, drawdowns zero, taxa de acerto anormalmente elevada ou outros indicadores de irregularidade podem ter payout indefinidamente retido.",
            "A Everwin se reserva o direito de exigir documentação adicional, verificação de terceiros ou auditoria independente como condição para aprovação de payout.",
          ],
        },
        {
          title: "5. VALIDAÇÃO DE TITULARIDADE E DOCUMENTAÇÃO",
          items: [
            "O recebimento de payout deve corresponder exatamente aos dados de identificação verificados durante KYC.",
            "Qualquer divergência entre nome de titular de account, documento de identidade e conta bancária resultará em NEGAÇÃO DE PAYOUT.",
            "Proof of Funds, source of income verification e beneficial ownership documentation podem ser exigidos, especialmente para valores elevados.",
            "Contas com múltiplas tentativas de payout para diferentes beneficiários ou métodos serão sinalizadas para investigação de fraude.",
          ],
        },
        {
          title: "6. CAUSAS DE RETENÇÃO E NEGAÇÃO PERMANENTE DE PAYOUT",
          paragraphs: [
            "Everwin poderá reter ou negar payout permanentemente em caso de:",
          ],
          items: [
            "Fraude, falsificação de identidade, falsificação de documentos ou qualquer atividade enganosa.",
            "Violação de política: múltiplos IPs, VPN/Proxy, bots, compartilhamento de conta, trading não autorizado.",
            "Chargeback, disputa bancária, transação reversa ou qualquer transação contestada.",
            "Atividade suspeita de lavagem de dinheiro, structuring, ou outros padrões consistentes com AML red flags.",
            "Conexão com indivíduos ou entidades em listas de sanção (OFAC, UN, EU, etc.).",
            "Violação das Leis Aplicáveis: uso de materiais proibidos, trading de instrumentos não permitidos, ou violação de regulações locais.",
            "Falta de resposta a solicitações de verificação, documentação ou comunicação oficial.",
            "Múltiplas contas sob mesmo usuário, documento ou enderço IP será investigada por fraude de programa.",
            "Any pattern of abuse, manipulação de sistema, ou tentativa de explorar falhas da plataforma.",
          ],
        },
        {
          title: "7. MÉTODOS DE PAGAMENTO, MOEDAS E LIMITES",
          items: [
            "Payout será disponibilizado somente para método de pagamento idêntico ao de depósito original (ex: cartão → cartão, conta bancária → conta bancária).",
            "Payouts em cripto/blockchain estão sujeitos a disponibilidade e a legislação local do país do usuário.",
            "Limites mínimos e máximos por transação, ciclo e conta serão estabelecidos conforme política vigente.",
            "Payout será processado somente em moeda original de conta ou em moeda local conforme taxa de câmbio de mercado estabelecida pelo banco correspondente.",
          ],
        },
        {
          title: "8. CUSTOS, TAXAS E IMPOSTOS",
          items: [
            "Usuário é responsável por qualquer tributação aplicável em sua jurisdição (IR, imposto de ganhos, etc.).",
            "Everwin poderá descontar: taxas administrativas de processamento, custos de remessa internacional, spreads cambiais, taxas bancárias de beneficiário, e outros custos operacionais.",
            "Payout relativo a bonus, promocional ou crédito pode estar sujeito a diferentes regras de tributo e retenção.",
            "Em caso de payout para jurisdição com impostos de saída, verificação de compliance fiscal será obrigatória antes de processamento.",
          ],
        },
        {
          title: "9. PRAZOS DE PROCESSAMENTO E COMUNICAÇÃO",
          items: [
            "Payout aprovado será processado em até 5-10 dias úteis, podendo variar conforme banco destinatário.",
            "Everwin NÃO é responsável por atrasos de bancos intermediários, sistemas de clearing, ou problemas de câmbio.",
            "Comunicação oficial será feita através de email registrado em cuenta. Usuário é responsável por verificar spam/lixo eletrônico.",
            "Payout pode ser revertido se informações de beneficiário estiverem incorretas. Usuário arcará com qualquer taxa de reversão.",
          ],
        },
        {
          title: "10. APELAÇÃO E DISPUTA",
          items: [
            "Negação de payout é decisão final após análise de compliance. Apelações devem ser feitas por escrito explicando o argumento específico.",
            "Evidência de conformidade operacional completa pode ser considerada para reconsideração.",
            "Qualquer disputa sobre programa Prop é regida por arbitragem conforme Termos Gerais de Serviço da Everwin.",
            "Limite de tempo para apelação: 30 dias após notificação de negação.",
          ],
        },
        {
          title: "11. INTEGRAÇÃO COM OUTRAS POLÍTICAS",
          paragraphs: [
            "Esta Política de Payout é complementar a: (a) Política de Avaliação Prop; (b) Política de Planos e Taxas Prop; (c) Termos de Prop Trading; (d) Política de Acesso à Conta Prop; (e) Política de Saque Geral. Em caso de conflito específico ao programa Prop, esta política prevalece.",
          ],
        },
      ],
    },

    "prop-account-access-policy": {
      title: "Política de Acesso, Credenciais e Integridade de Conta Prop",
      updated: UPDATED_AT.pt,
      lead: "Requisitos obrigatórios para acesso seguro de conta, uso de credenciais, verificação de identidade e manutenção da integridade operacional.",
      intro: [
        "Acesso e operação segura de conta Prop é responsabilidade exclusiva do usuário titular. Esta política estabelece padrões internacionais de segurança, autenticação e verificação de identidade para proteger tanto o usuário quanto a integridade da plataforma.",
      ],
      sections: [
        {
          title: "1. AUTENTICAÇÃO E CREDENCIAIS",
          items: [
            "Usuário é único responsável por qualquer atividade realizada sob suas credenciais.",
            "Senhas devem ter mínimo 12 caracteres incluindo letras maiúsculas, minúsculas, números e símbolos especiais.",
            "Dois fatores de autenticação (2FA) via aplicativo autenticador (Google Authenticator, Authy) são OBRIGATÓRIOS para contas Prop.",
            "SMS 2FA é considerado insuficiente. Whatsapp, email, ou métodos débeis NÃO são aceitos como segundo fator.",
            "Chaves de recuperação (backup codes) devem ser armazenadas em local seguro OFFLINE e NUNCA compartilhadas.",
          ],
        },
        {
          title: "2. PROIBIÇÃO EXPRESSA DE MÚLTIPLOS ACESSOS",
          items: [
            "UMA ÚNICA SESSÃO ATIVA por conta é permitida. Login simultâneo em diferente IP será detectado e resultará em logout forçado.",
            "Acesso sequencial a partir de múltiplos IPs (mesmo que autenticado com 2FA correto) será flagged para verificação de fraude.",
            "Acesso a partir de país diferente do cadastro em intervalo menor de 4 horas resultará em congelamento de account.",
            "Viagens do usuário devem ser notificadas proativamente via dashboard. Everwin poderá solicitar verificação adicional.",
            "VPN, Proxy, onion networks, Dark Web, ou técnicas de ocultação de IP constituem violação grave.",
          ],
        },
        {
          title: "3. DETECÇÃO BIOMÉTRICA E COMPORTAMENTAL",
          items: [
            "Sistema analisa padrões de uso: locais habituais, horários, velocidade de digitação, tipo de dispositivo.",
            "Mudanças anormais acionam alertas e possível autenticação adicional.",
            "Dispositivos novos devem ser verificados por email/SMS antes de acesso pleno a account.",
            "Logout automático após 30 minutos inatividade em ambiente de conta ativa.",
          ],
        },
        {
          title: "4. PROIBIÇÃO DE COMPARTILHAMENTO E CONTROLE REMOTO",
          items: [
            "Compartilhamento de credenciais de login com qualquer pessoa (familiar, sócio, gestor) é PROIBIDO.",
            "Uso de software de controle remoto (TeamViewer, AnyDesk, Chrome Remote Desktop) para acessar conta é PROIBIDO e detectável.",
            "Poder de procuração, gestão por terceiro ou delegação deve ser formalizada através de estrutura legal separada, nunca via compartilhamento de credenciais.",
            "Contas compartilhadas serão imediatamente encerradas e saldo retido sem reembolso.",
          ],
        },
        {
          title: "5. VERIFICAÇÃO DE IDENTIDADE CONTÍNUA (KYC)",
          items: [
            "Verificação inicial via documento de identidade válido (RG, CNH, Passaporte) é obrigatória.",
            "Revalidação de identidade pode ser exigida periodicamente, especialmente para payouts grandes.",
            "Qualquer discrepância entre dados cadastrais e identidade verificada resultará em suspensão de account.",
            "Usuário deve manter documento de identidade válido. Expiração resultará em impossibilidade de fazer payout até revalidação.",
          ],
        },
        {
          title: "6. RESPONSABILIDADE POR ACESSO NÃO AUTORIZADO",
          items: [
            "Everwin NÃO é responsável por perdas decorrentes de: (a) Credenciais comprometidas; (b) Falta de 2FA; (c) Software de spyware/keylogger no dispositivo do usuário.",
            "Usuário é responsável por manter seu dispositivo seguro, com antivírus atualizado e sistema operacional patchado.",
            "Notificação de acesso suspeito deve ser feita IMEDIATAMENTE a support@everwin.trade.",
            "Everwin poderá, a seu exclusivo critério, ajustar saldo em caso de fraude interna comprovada, mas NÃO é obrigada a ressarcimento.",
          ],
        },
      ],
    },

    "prop-trading-restrictions": {
      title: "Política de Restrições Operacionais e Proibições de Trading Prop",
      updated: UPDATED_AT.pt,
      lead: "Instrumentos, estratégias, comportamentos e técnicas proibidas no programa Prop para proteger integridade operacional e conformidade regulatória.",
      intro: [
        "Para manter integridade operacional e conformidade com regulações internacionais, certas atividades de trading, instrumentos e estratégias são expressamente proibidas em contas Prop.",
      ],
      sections: [
        {
          title: "1. PROIBIÇÃO DE BOTS, APIS E AUTOMAÇÃO",
          items: [
            "Bots de trading, scripts automatizados, EA (Expert Advisors), e qualquer forma de execução mecanizada são PROIBIDOS.",
            "Integração com APIs não autorizadas, webhooks, ou sinais automatizados é PROIBIDA.",
            "Uso de ferramentas que executem ordens sem intervenção humana real resultará em desqualificação imediata.",
            "Detecção de padrões de execução inumanos (centenas de ordens por minuto, execução em múltiplos pares simultaneamente, etc.) acionará investigação e possível encerramento.",
          ],
        },
        {
          title: "2. ATIVIDADES PROIBIDAS DE ALTA FREQUÊNCIA",
          items: [
            "Scalping extremo (dezenas de trades por hora em pares diferentes) pode ser sinalizado como bot activity.",
            "Colocação de ordens meramente para manipular spreads, gerar latência ou outras técnicas de market-making predatório.",
            "Layering, spoofing, pump-and-dump, ou qualquer forma de fraude/manipulação de mercado.",
          ],
        },
        {
          title: "3. INSTRUMENTOS ESPECÍFICOS PROIBIDOS",
          items: [
            "Índices (S&P 500, DAX, etc.) podem estar restritos conforme versão do programa.",
            "Criptomoedas voláteis ou de baixa liquidez podem estar fora do escopo.",
            "Commodities alavancadas ou micro-contratos podem estar proibidos.",
            "Instrumentos delisted, vencidos, ou sob suspensão regulatória não podem ser tradados.",
          ],
        },
        {
          title: "4. RESTRIÇÕES DE ALAVANCAGEM E EXPOSIÇÃO",
          items: [
            "Limite máximo de alavancagem conforme política: tipicamente 1:100 ou menos.",
            "Exposed position overnight pode estar sujeita a margens adicionadas.",
            "Posições deixadas abertas durante feriados/fins de semana podem ser automáticamente fechadas.",
            "Exposure em single instruments/pares é limitada para garantir diversificação.",
          ],
        },
      ],
    },

    "prop-purchase-reset-policy": {
      title: "Compras, Reset e Cancelamento Prop",
      updated: UPDATED_AT.pt,
      lead: "Regras comerciais para aquisição de avaliações, pedidos duplicados, resets, reativações, cancelamento e recontratação no programa Prop.",
      intro: [
        "Esta política organiza a lógica comercial aplicável à compra de avaliações Prop e aos mecanismos de continuidade do programa, sempre observada a versão vigente da oferta no momento do pedido.",
      ],
      sections: [
        {
          title: "1. Compras e pedidos duplicados",
          items: [
            "Pedidos duplicados, tentativas múltiplas, cobranças replicadas ou compras com sinais de erro poderão ser pausados para revisão antes da entrega.",
            "A Everwin poderá unificar, cancelar ou ajustar pedidos redundantes quando necessário para preservar integridade operacional e financeira.",
          ],
        },
        {
          title: "2. Provisionamento após compra",
          items: [
            "A ativação da avaliação e das credenciais não é instantânea em todos os casos; ela depende de aprovação de pagamento, eventual revisão antifraude e processo interno de provisionamento.",
          ],
        },
        {
          title: "3. Cancelamento e reembolso",
          items: [
            "Pedidos ainda não provisionados, bloqueados por erro operacional relevante ou submetidos com falha material poderão ser analisados para cancelamento conforme a legislação aplicável e a política comercial vigente.",
            "Após provisionamento, uso, envio de credenciais, início efetivo da avaliação ou entrega de benefício operacional, a elegibilidade a cancelamento ou reembolso poderá ser limitada, reduzida ou inexistente, salvo obrigação legal diversa.",
          ],
        },
        {
          title: "4. Reset, recompra e nova tentativa",
          items: [
            "Reset, recompra, reativação e nova contratação dependem da oferta vigente, das regras comerciais aplicáveis, do histórico do usuário e da elegibilidade operacional.",
            "A Everwin não é obrigada a oferecer reset em todo caso, especialmente diante de fraude, reincidência abusiva, chargeback, violação grave ou uso incompatível com o programa.",
          ],
        },
        {
          title: "5. Cooldown e limites administrativos",
          items: [
            "Poderão existir limites de frequência para compras, resets, contas ativas, recompra por período, reativações e quantidade de contas por pessoa, domicílio ou estrutura relacionada.",
          ],
        },
        {
          title: "6. Política comercial vigente",
          paragraphs: [
            "Promoções, descontos, bônus, condições especiais, regras de reset e janelas de recompra são definidas pela política comercial vigente no momento da solicitação correspondente.",
          ],
        },
      ],
    },

    "account-closure": {
      title: "Política de Encerramento de Conta",
      updated: UPDATED_AT.pt,
      lead: "Motivos, processo, consequências e direito de apelação para encerramento definitivo de contas na Everwin.",
      intro: [
        "Esta política estabelece as regras e procedimentos aplicáveis ao encerramento de contas na Everwin, sejam eles por iniciativa da plataforma ou do cliente, incluindo motivos, processo, consequências e direito de apelação.",
      ],
      sections: [
        {
          title: "1. Direito de Encerramento",
          paragraphs: [
            "A Everwin reserva-se o direito de encerrar contas definitivamente, a seu exclusivo critério, quando identificar violações dos Termos de Uso, políticas aplicáveis ou comportamentos incompatíveis com a integridade do ecossistema.",
          ],
          items: [
            "O encerramento pode ocorrer sem aviso prévio em casos de violação grave.",
            "A decisão de encerramento é soberana e não está sujeita a contestação além do período de apelação de 30 dias.",
            "A Everwin não será responsável por quaisquer perdas decorrentes de encerramento legítimo de conta.",
          ],
        },
        {
          title: "2. Motivos para Encerramento Definitivo",
          items: [
            { label: "Violação da Regra 10x", text: "Tentativa ou efetivação de saque que ultrapasse o limite de 10x sobre o valor depositado no mês civil." },
            { label: "Fraude Comprovada", text: "Uso de identidade falsa, documentos falsificados, ou qualquer atividade enganosa." },
            { label: "Compartilhamento de Conta", text: "Credenciais compartilhadas com terceiros, mesmo familiares ou sócios." },
            { label: "Uso de Bots/APIs", text: "Utilização de automação, scripts, bots ou qualquer forma de execução mecanizada não autorizada." },
            { label: "Múltiplas Contas", text: "Criação de contas duplicadas pelo mesmo titular ou grupo de pessoas." },
            { label: "VPN/Proxy", text: "Uso de técnicas de mascaramento de IP ou acesso de localização não autorizada." },
            { label: "Violação Operacional", text: "Descumprimento de drawdown, daily loss limit, dias mínimos ou outros parâmetros do programa." },
            { label: "Atividade Suspeita", text: "Padrões inconsistentes com trading legítimo ou comportamento anômalo detectado pelo sistema." },
            { label: "Chargeback Abusivo", text: "Disputas bancárias injustificadas ou recorrentes." },
            { label: "Não Colaboração", text: "Recusa em fornecer documentação ou responder a solicitações de compliance." },
            { label: "Ordem Judicial", text: "Determinação de autoridade competente para encerramento." },
          ],
        },
        {
          title: "3. Regra 10x - Limite de Saque",
          paragraphs: [
            "Os clientes da Everwin NÃO podem realizar saques que ultrapassem o limite de 10x (dez vezes) o valor depositado na corretora no mês civil em curso.",
          ],
          items: [
            "O cálculo é: Limite Mensal = Total de Depósitos no Mês × 10",
            "A violação desta regra resulta em bloqueio imediato da conta para investigação.",
            "Em caso de confirmação de violação, a conta será encerrada definitivamente.",
            "Não existem exceções à regra 10x, exceto determinação judicial ou erro comprovado da Everwin.",
          ],
          note: "Exemplo: Se o cliente depositou $1.000 no mês, seu limite de saque é $10.000. Saques acima deste valor serão bloqueados.",
        },
        {
          title: "4. Processo de Encerramento",
          ordered: true,
          items: [
            "Detecção de irregularidade pelo sistema de monitoramento da Everwin.",
            "Bloqueio temporário da conta para investigação e análise forense.",
            "Análise completa de padrões de trading, transações e conformidade.",
            "Notificação ao Cliente via e-mail com descrição detalhada do motivo.",
            "Período de apelação de 30 (trinta) dias para contestação.",
            "Análise da apelação pela equipe de compliance da Everwin.",
            "Decisão final comunicada ao Cliente por e-mail.",
            "Encerramento definitivo e retenção de valores conforme política.",
          ],
        },
        {
          title: "5. Consequências do Encerramento",
          items: [
            "Perda de acesso a todos os serviços e funcionalidades da Plataforma.",
            "Impossibilidade de utilizar a Plataforma ou participar do Programa Prop.",
            "Perda de elegibilidade para participação em programas futuros.",
            "Impossibilidade de novo cadastro com os mesmos dados (em caso de encerramento por violação).",
            "Retenção de valores conforme política vigente e Termos de Uso.",
            "Perda de benefícios, progresso ou conquistas obtidas na Plataforma.",
            "Rescisão de todas as relações contratuais com a Everwin.",
          ],
        },
        {
          title: "6. Direito de Apelação",
          items: [
            "O Cliente poderá apresentar apelação no prazo de 30 (trinta) dias após notificação.",
            "A apelação deverá ser enviada por escrito para compliance@everwin.trade.",
            "Deverá conter argumentação específica e documentação de apoio que comprove a conformidade.",
            "A Everwin analisará a apelação dentro de prazo razoável (até 15 dias úteis).",
            "A decisão será comunicada por e-mail e será definitiva e irrecorrível internamente.",
          ],
        },
        {
          title: "7. Encerramento por Iniciativa do Cliente",
          items: [
            "O Cliente poderá solicitar o encerramento de sua conta a qualquer momento.",
            "A solicitação deverá ser realizada via dashboard ou e-mail para support@everwin.trade.",
            "Antes do encerramento, o Cliente deverá realizar saque de eventuais saldos disponíveis.",
            "O Cliente deverá verificar se atende aos requisitos de elegibilidade para saque.",
            "O encerramento será processado dentro de prazo razoável após confirmação.",
          ],
        },
        {
          title: "8. Referências do Mercado",
          paragraphs: [
            "As práticas de encerramento de conta da Everwin estão em conformidade com padrões do mercado internacional de trading e plataformas financeiras.",
          ],
          items: [
            "Binomo: Reserva-se o direito de encerrar contas sem aviso prévio em caso de violação de políticas.",
            "IQ Option: Exerce discricionariedade para definir regras de encerramento conforme seus termos.",
            "Dukascopy: Pode encerrar contas imediatamente sem aviso prévio, conforme seus Termos de Uso.",
            "Everwin: Adota práticas semelhantes, com foco na proteção do ecossistema e compliance regulatório.",
          ],
          note: "A Everwin opera sob licença de Curaçao (#365/JAZ) e está em conformidade com regulamentações internacionais de AML/KYC.",
        },
        {
          title: "9. Contato",
          paragraphs: [
            `Para esclarecimentos sobre esta política, entre em contato com ${SUPPORT_EMAIL}. Para questoes de compliance e encerramento, utilize compliance@everwin.trade.`,
          ],
        },
      ],
    },
  };
}

function getEnglishPages(): Record<LegalPageSlug, LegalPolicyPageContent> {
  const tables = buildPlanTables("en");

  return {
    privacy: {
      title: "Privacy Policy",
      updated: UPDATED_AT.en,
      lead: "How Everwin collects, uses, shares, stores, and protects personal data across the website, brokerage flows, and Prop program journeys.",
      intro: [
        'This Privacy Policy explains how Everwin ("Everwin", "we") processes personal data across its websites, forms, landing pages, support channels, client portals, and operational flows connected to its products and programs.',
      ],
      sections: [
        {
          title: "1. Scope",
          items: [
            "This policy applies to visitors, leads, clients, applicants, affiliates, and users who interact with Everwin digital properties.",
            "Third-party providers integrated into our flows, including payment processors, analytics tools, CRM platforms, messaging services, and verification vendors, may be subject to their own policies as well.",
          ],
        },
        {
          title: "2. Data we may collect",
          items: [
            { label: "Identity", text: "name, email, phone number, country, language, registration data, and information submitted through forms." },
            { label: "Operational data", text: "selected product, purchased plan, submission status, support history, login data, and portal usage." },
            { label: "Financial and transactional", text: "payment method, charge status, currency, amount, order identifiers, and antifraud events." },
            { label: "Technical", text: "IP address, device type, browser, operating system, logs, session identifiers, language, and approximate country-level location." },
            { label: "Compliance", text: "documents, identity evidence, proof of residence, beneficial ownership, and any information required for KYC, AML, fraud prevention, or payout review." },
          ],
        },
        {
          title: "3. Sources of collection",
          items: [
            "Directly from you when you fill forms, create an account, buy plans, send documents, access the portal, or contact support.",
            "Automatically through cookies, logs, pixels, SDKs, analytics, and technical performance or security tools.",
            "From operating partners and service providers that support billing, verification, CRM, antifraud, hosting, support, and infrastructure.",
          ],
        },
        {
          title: "4. Purposes of processing",
          items: [
            "To operate the site, process purchases, create access, provision accounts, provide support, and run Prop or other product flows.",
            "To maintain security and prevent fraud, abuse, chargebacks, duplicate-account misuse, operational manipulation, or unauthorized use.",
            "To comply with legal, regulatory, tax, audit, investigation, or law-enforcement requests.",
            "To personalize language, currency, content, and experience based on explicit user choices, browser settings, country-level geolocation, and prior interactions.",
            "To send operational, commercial, or retention communications where permitted by law and subject to applicable opt-out rights.",
          ],
        },
        {
          title: "5. Legal bases",
          paragraphs: [
            "Where applicable, processing may rely on contract performance, legal obligations, legitimate interests in operating and securing the ecosystem, the exercise of legal rights, and consent in specific cases.",
          ],
        },
        {
          title: "6. Sharing",
          items: [
            "We may share data with processors and vendors involved in hosting, billing, CRM, messaging, analytics, verification, antifraud, and support.",
            "We may also disclose information when reasonably necessary to protect rights, investigate suspicious conduct, respond to valid legal requests, prevent fraud, or support internal and external audits.",
            "Everwin does not treat the sale of personal data as a core business activity; any sharing must be connected to the legitimate operation of the platform and its products.",
          ],
        },
        {
          title: "7. Retention, security, and rights",
          items: [
            "Data may be retained for as long as needed for operational, legal, tax, contractual, audit, defense, and abuse-prevention purposes.",
            "We apply reasonable administrative, technical, and organizational measures to reduce the risk of unauthorized access, leakage, loss, alteration, or misuse.",
            "Depending on applicable law, data subjects may have rights to access, correct, update, port, delete, restrict, object, or withdraw consent where relevant.",
          ],
          note: `Privacy requests may be sent to ${SUPPORT_EMAIL}. Everwin may request additional identity confirmation before processing a request.`,
        },
      ],
    },
    terms: {
      title: "Terms & Conditions",
      updated: UPDATED_AT.en,
      lead: "General terms governing access to the website, commercial pages, client portals, and digital experiences operated by Everwin.",
      intro: [
        "By accessing or using any Everwin-operated environment, the user confirms that they have read, understood, and accepted these Terms, together with any product-specific policies that may apply.",
      ],
      sections: [
        {
          title: "1. Eligibility and permitted use",
          items: [
            "You must have legal capacity to contract and use the services in your jurisdiction.",
            "Everwin may restrict access for legal, operational, commercial, risk, compliance, or ecosystem-integrity reasons.",
            "Fraud, abuse, reverse engineering, unauthorized automation, scraping, metric manipulation, and unlawful conduct are prohibited.",
          ],
        },
        {
          title: "2. Registration, credentials, and account integrity",
          items: [
            "Information provided by the user must be truthful, current, and verifiable.",
            "Users are responsible for protecting their credentials, devices, email access, and authentication methods.",
            "Everwin may suspend or terminate access when there are signs of shared use, false identity, third-party control, fraud, promotional abuse, or contractual breach.",
          ],
        },
        {
          title: "3. Informational nature and no advice",
          items: [
            "Website content, commercial pages, videos, articles, educational materials, and institutional communications are informational, educational, or commercial in nature.",
            "Nothing on the site constitutes personalized investment, financial, tax, legal, or accounting advice.",
          ],
        },
        {
          title: "4. Product-specific rules",
          items: [
            "Products such as brokerage services, educational materials, affiliate programs, Prop evaluations, simulated accounts, and internal portals may be subject to additional policies.",
            "If there is a conflict between these general Terms and a product-specific policy, the product-specific policy will control for that specific matter.",
          ],
        },
        {
          title: "5. Intellectual property",
          items: [
            "Design, layout, visual identity, trademarks, scripts, dashboards, workflows, software, and materials owned or licensed by Everwin are protected by applicable rights.",
            "You may not copy, resell, mirror, distribute, modify, or create derivative works without express written permission.",
          ],
        },
        {
          title: "6. Availability, changes, and liability",
          items: [
            "Everwin environments may be modified, paused, limited, or discontinued at any time for technical, legal, commercial, or operational reasons.",
            "To the fullest extent permitted by law, Everwin does not guarantee uninterrupted availability, universal compatibility, or any specific outcome.",
            "Continued use after policy, feature, pricing, or workflow updates means acceptance of the then-current version.",
          ],
          note: `General questions may be directed to ${SUPPORT_EMAIL}.`,
        },
      ],
    },
    cookies: {
      title: "Cookies Policy",
      updated: UPDATED_AT.en,
      lead: "How we use cookies, pixels, local storage, and similar technologies for operation, personalization, security, and measurement.",
      intro: [
        "Cookies and similar technologies help keep the website functional, remember preferences, measure performance, understand navigation patterns, and protect the operation against abuse.",
      ],
      sections: [
        {
          title: "1. Categories of technology",
          items: [
            { label: "Essential", text: "required for login, navigation, language preference, session persistence, and security controls." },
            { label: "Preference", text: "remember language, user choices, and relevant interface settings." },
            { label: "Measurement and analytics", text: "help us understand page usage, campaign performance, form events, funnels, and technical stability." },
            { label: "Security", text: "support traffic validation, abuse mitigation, antifraud review, rate limiting, and risk analysis." },
          ],
        },
        {
          title: "2. Purposes",
          items: [
            "To keep the site operational and retain preferences, including language selected manually or determined automatically.",
            "To improve UX, performance, stability, and bottleneck detection across commercial pages and portals.",
            "To measure campaigns, forms, submissions, and traffic sources where that processing is compatible with the relevant legal basis.",
          ],
        },
        {
          title: "3. User controls",
          items: [
            "Users may manage cookies through browser settings or dedicated tools made available by Everwin where applicable.",
            "Disabling essential cookies or local storage may affect login, preferences, form persistence, and other critical functionality.",
          ],
        },
        {
          title: "4. Third-party technologies",
          items: [
            "Integrated analytics, CRM, chat, media, performance, antifraud, or messaging tools may place their own technical identifiers.",
            "Whenever possible, Everwin seeks to minimize excessive collection and rely on providers aligned with the platform's operational needs.",
          ],
        },
        {
          title: "5. Updates and contact",
          paragraphs: [
            `This policy may be updated whenever there is a relevant change in tools, purposes, or legal requirements. Questions may be sent to ${SUPPORT_EMAIL}.`,
          ],
        },
      ],
    },
    "payment-policy": {
      title: "Payment Policy",
      updated: UPDATED_AT.en,
      lead: "General rules for charges, plan purchases, order approval, verification, and fraud prevention across Everwin products.",
      intro: [
        "This policy applies to payments made through official Everwin flows, including product pages, Prop checkout, plans, educational materials, and other commercial offers made available by the brand.",
      ],
      sections: [
        {
          title: "1. Authorized channels and methods",
          items: [
            "Only methods shown in the official checkout, on pages operated by Everwin, or through official integrations should be considered valid.",
            "Currency, installments, acquirer, and payment-method availability may vary by country, language, product, risk review, and technical availability.",
          ],
        },
        {
          title: "2. Order approval",
          items: [
            "Orders may pass through authentication, data validation, processor response, and security checks before final approval.",
            "A successful charge does not always mean immediate product provisioning; internal review, reconciliation, or manual verification may still apply.",
            "Everwin may cancel, hold, or refuse orders affected by registration inconsistencies, duplicates, fraud signals, prior chargebacks, unauthorized testing, or incompatible policy use.",
          ],
        },
        {
          title: "3. Prop program payments",
          items: [
            "A Prop evaluation purchase refers to a performance-assessment stage and not to the acquisition of a security, collective investment, or guaranteed return product.",
            "Release of portal credentials and linked accounts depends on approved payment, internal review, and compliance with the applicable commercial and operational rules.",
          ],
        },
        {
          title: "4. Fees, taxes, and conversion",
          items: [
            "Displayed prices reflect the active offer at the time of checkout, but additional conversion, spread, bank, tax, installment, or payment-provider costs may apply.",
            "Taxes or withholding obligations may be handled according to the applicable law, payment method, and commercial structure in place.",
          ],
        },
        {
          title: "5. Disputes, chargebacks, and abuse",
          items: [
            "Orders under dispute, chargeback, or fraud suspicion may have access suspended, benefits reviewed, and services blocked while the matter is investigated.",
            "Everwin may revoke access or deny re-contracting when there is a history of fraud, abusive chargebacks, or attempts to circumvent platform controls.",
          ],
        },
        {
          title: "6. Contact",
          paragraphs: [
            `Questions related to billing, reconciliation, or charges may be directed to ${SUPPORT_EMAIL}.`,
          ],
        },
      ],
    },
    "withdrawal-policy": {
      title: "Withdrawal Policy",
      updated: UPDATED_AT.en,
      lead: "General conditions for withdrawal requests, returns of funds, ownership validation, and additional review.",
      intro: [
        "This policy describes the general rules that may apply to withdrawals or returns of funds processed by Everwin where the relevant product or commercial structure allows them.",
      ],
      sections: [
        {
          title: "1. Eligibility and scope",
          items: [
            "Not every Everwin product creates withdrawable balance. Evaluation fees, memberships, access purchases, or educational products may not be withdrawable unless the applicable commercial policy expressly says otherwise.",
            "Prop programs, simulated accounts, and payout structures have their own eligibility rules and must also comply with the specific policy governing the active program version.",
          ],
        },
        {
          title: "2. Verification and ownership",
          items: [
            "Everwin may require KYC, proof of ownership, operational history, supporting documents, antifraud review, and confirmation of the receiving method.",
            "Withdrawals to third parties, accounts with mismatched ownership, inconsistent documentation, or suspicious structures may be rejected.",
          ],
        },
        {
          title: "3. Processing times",
          items: [
            "Timing depends on the selected method, internal queue, banking calendar, review level, and the external provider responsible for settlement.",
            "Everwin does not fully control delays caused by banks, gateways, settlement networks, validators, holidays, or exceptional compliance requirements.",
          ],
        },
        {
          title: "4. Holds, refusals, and adjustments",
          items: [
            "Requests may be held, refused, adjusted, or escalated for review in the event of material error, registration mismatch, chargeback, suspected abuse, contractual breach, ongoing investigation, or legal obligation.",
            "Everwin may offset amounts owed, reverse mistaken releases, or adopt administrative measures when a payment was made in error or based on incorrect information.",
          ],
        },
        {
          title: "5. Costs and taxes",
          items: [
            "Bank charges, remittance fees, exchange spreads, withholding, taxes, or payment-method expenses may be deducted or transferred as applicable.",
          ],
        },
        {
          title: "6. Support channel",
          paragraphs: [
            `For operational questions about withdrawals and eligibility, please use ${SUPPORT_EMAIL}.`,
          ],
        },
      ],
    },
    "general-fees": {
      title: "General Fees",
      updated: UPDATED_AT.en,
      lead: "Consolidated view of fee categories, third-party charges, and operating costs that may apply across Everwin products.",
      intro: [
        "Everwin products may involve purchase prices, subscriptions, third-party fees, operating costs, and charges connected to currency, payment method, compliance, or exceptional support handling.",
      ],
      sections: [
        {
          title: "1. Product fees",
          items: [
            "Plans, evaluations, resets, activations, upgrades, educational products, and special offers may each have their own price displayed in the landing page, checkout, proposal, or specific policy.",
            "The price in force on the date of contracting applies to that purchase, unless law requires otherwise.",
          ],
        },
        {
          title: "2. Third-party costs",
          items: [
            "Gateways, acquirers, banks, processors, and alternative methods may impose external charges, including spreads, installment costs, remittance, and conversion fees.",
          ],
        },
        {
          title: "3. Administrative and exceptional handling",
          items: [
            "Where legally permitted and operationally applicable, Everwin may impose administrative handling in matters involving fraud, investigation, recovery, chargeback, reprocessing, or exceptional treatment.",
            "Costs arising from user error, incorrect documentation, ineligible accounts, or repeated improper attempts may require additional operational review.",
          ],
        },
        {
          title: "4. Prop program",
          items: [
            "Prop fees are detailed in the dedicated Plans & Fees policy and may vary by language, currency, campaign, offer, and prospective update.",
          ],
        },
        {
          title: "5. Transparency",
          paragraphs: [
            "Everwin seeks to present relevant pricing, currency, and rule details during the applicable flow. If a fee is not expressly shown, users should still consider that third-party and FX costs may exist.",
          ],
        },
      ],
    },
    "risk-disclosure": {
      title: "Risk Disclosure",
      updated: UPDATED_AT.en,
      lead: "Important warnings about market risk, technology risk, execution risk, leverage, and evaluation programs.",
      intro: [
        "Trading activity, simulated environments, leveraged products, and performance-evaluation programs all involve meaningful risk. They are not suitable for every individual or business profile.",
      ],
      sections: [
        {
          title: "1. Loss and volatility risk",
          items: [
            "Markets can move quickly because of news, liquidity changes, macroeconomic events, technical failures, gaps, and the behavior of other participants.",
            "Past performance, whether simulated or real, does not guarantee future results.",
          ],
        },
        {
          title: "2. Technology and operational risk",
          items: [
            "Latency, downtime, connectivity issues, timezone differences, bugs, third-party interruptions, and operating incidents may affect the user experience.",
            "Everwin does not guarantee uninterrupted availability or the absence of failures, delays, or discrepancies between environments.",
          ],
        },
        {
          title: "3. Simulated and evaluation environment risk",
          items: [
            "Demo, evaluation, and simulated accounts may differ materially from live-market conditions in pricing, execution, liquidity, slippage, depth, and availability.",
            "Passing an evaluation still depends on internal rules, risk criteria, operational review, and compliance checks.",
          ],
        },
        {
          title: "4. Margin and leverage risk",
          items: [
            "Leverage and margin structures amplify gains and losses and may accelerate breach, liquidation, or account failure.",
          ],
        },
        {
          title: "5. No promise and no advice",
          items: [
            "Everwin does not promise profitability, ongoing program participation, a funded account, payout, automatic approval, or suitability of any product for your profile.",
            "Nothing on the website should be interpreted as personalized investment, tax, legal, or accounting advice.",
          ],
        },
      ],
    },
    "order-execution": {
      title: "Order Execution Policy",
      updated: UPDATED_AT.en,
      lead: "General principles on pricing, latency, rejection, operational logging, and differences between indicative and effective execution.",
      intro: [
        "This policy describes the general principles that may apply to order processing or operational events within environments supported by Everwin or integrated providers.",
      ],
      sections: [
        {
          title: "1. Execution principles",
          items: [
            "Everwin seeks operational consistency and ecosystem integrity, but cannot guarantee perfect execution under every scenario.",
            "Price, liquidity, volatility, queue, order type, technical conditions, and product rules may all affect the final outcome.",
          ],
        },
        {
          title: "2. Indicative pricing and slippage",
          items: [
            "Quotes, charts, and dashboards may be indicative only and may not necessarily match the final executed price.",
            "Slippage, gaps, and latency differences may cause execution at a value different from what the user expected.",
          ],
        },
        {
          title: "3. Simulated and Prop environments",
          items: [
            "In evaluation, simulated, or Prop infrastructure, internal logic may include validation rules, risk thresholds, pauses, and event reconciliation.",
            "Exact replication of the live market is not guaranteed and may differ from brokerage, feed, or third-party conditions.",
          ],
        },
        {
          title: "4. Rejection, cancellation, and correction",
          items: [
            "Orders or events may be rejected, canceled, reviewed, or corrected in the event of material error, technical failure, operational risk, abuse, data inconsistency, force majeure, or legal requirement.",
          ],
        },
        {
          title: "5. Logging and audit",
          items: [
            "Everwin may retain technical records, audit trails, and event histories for security, compliance, reconciliation, abuse prevention, and dispute handling.",
          ],
        },
      ],
    },
    "margin-trading": {
      title: "Margin Trading",
      updated: UPDATED_AT.en,
      lead: "Core information about leveraged products, liquidation risk, margin calls, and user suitability.",
      intro: [
        "Trading on margin or using leveraged products can materially amplify both gains and losses. Such exposure is not appropriate for every user profile.",
      ],
      sections: [
        {
          title: "1. Leverage effect",
          items: [
            "Relatively small market moves can generate disproportionately large effects on balance, equity, or operational thresholds.",
          ],
        },
        {
          title: "2. Liquidation and margin calls",
          items: [
            "When required margin levels are not met, positions may be reduced, closed, or liquidated automatically.",
            "Abrupt market events may leave insufficient time for the user to respond manually.",
          ],
        },
        {
          title: "3. Gaps, volatility, and outages",
          items: [
            "Opening gaps, macro events, low liquidity, and technical failures can intensify exposure, execution risk, and the difficulty of adjusting positions.",
          ],
        },
        {
          title: "4. Suitability and user responsibility",
          items: [
            "It is the user's responsibility to determine whether they understand the product, margin mechanics, potential loss profile, and market-specific risks.",
          ],
        },
        {
          title: "5. No guarantee",
          paragraphs: [
            "Everwin does not guarantee ongoing availability of margin-based products, stable liquidation conditions, or suitability of leveraged exposure for all users.",
          ],
        },
      ],
    },
    aml: {
      title: "AML & KYC Policy",
      updated: UPDATED_AT.en,
      lead: "Guidelines for customer identification, document verification, anti-money laundering controls, sanctions review, and fraud prevention.",
      intro: [
        "Everwin maintains identification, verification, and monitoring controls aimed at protecting ecosystem integrity, reducing fraud, and meeting applicable compliance expectations.",
      ],
      sections: [
        {
          title: "1. Identity verification",
          items: [
            "We may request documents, selfies, proofs, supplemental registration information, business data, or other materials needed to validate identity and ownership.",
            "Insufficient documentation may prevent purchase, provisioning, withdrawal, payout, access recovery, or continued participation.",
          ],
        },
        {
          title: "2. Source of funds and risk review",
          items: [
            "In sensitive situations, Everwin may request information about source of funds, purpose of the transaction, links to third parties, or transactional history.",
          ],
        },
        {
          title: "3. Ongoing monitoring",
          items: [
            "Accounts, payments, operational patterns, logins, payout requests, duplicate registrations, campaign behavior, and risk events may be monitored on an ongoing basis.",
          ],
        },
        {
          title: "4. Restrictions and jurisdictions",
          items: [
            "Everwin may restrict or terminate a relationship based on sanctions lists, elevated risk, regulatory incompatibility, country of residence, insufficient documentation, or suspicious use.",
          ],
        },
        {
          title: "5. Cooperation and retention",
          items: [
            "Everwin may cooperate with valid legal requests and retain records for as long as necessary for compliance, audit, investigation, and defense of rights.",
          ],
          note: "The existence of AML/KYC controls does not mean that every user, payment, or payout request will be accepted.",
        },
      ],
    },
    "demo-accounts": {
      title: "Demo Accounts",
      updated: UPDATED_AT.en,
      lead: "Information about demonstration, testing, and simulated environments and their limitations when compared with real trading conditions.",
      intro: [
        "Demo, evaluation, and simulated environments exist for educational, operational, validation, or training purposes. They do not fully replicate live-market conditions.",
      ],
      sections: [
        {
          title: "1. Difference from live trading",
          items: [
            "Pricing, slippage, liquidity, depth, cost, execution, speed, limits, and market conditions may differ significantly from a real environment.",
          ],
        },
        {
          title: "2. Resets, limits, and availability",
          items: [
            "Everwin may limit access, reset balances, reconfigure accounts, suspend features, or discontinue demo environments at any time.",
          ],
        },
        {
          title: "3. Permitted use",
          items: [
            "Demo environments may not be used for fraud, flaw exploitation, reverse engineering, data extraction, infrastructure abuse, or circumvention of commercial rules.",
          ],
        },
        {
          title: "4. No equivalence",
          items: [
            "Results achieved in a demo or evaluation account do not guarantee the same performance in a live, funded, or future account.",
          ],
        },
        {
          title: "5. Updates",
          paragraphs: [
            "Demo and simulated-account parameters may change without prior notice to reflect technical, commercial, risk, or program-integrity requirements.",
          ],
        },
      ],
    },
    "prop-evaluation-policy": {
      title: "Prop Evaluation Policy",
      updated: UPDATED_AT.en,
      lead: "Operational rules for the evaluation journey, approval criteria, risk limits, internal review, and disqualification within the Everwin Prop program.",
      intro: [
        "This policy complements the Prop Trading Terms and explains how the evaluation is structured, monitored, and validated inside the Everwin ecosystem.",
      ],
      sections: [
        {
          title: "1. Nature of the evaluation",
          items: [
            "The evaluation is a stage designed to validate performance, discipline, rule compliance, and behavioral integrity.",
            "Completion of stages does not automatically create a right to a funded account, payout, or ongoing participation.",
          ],
        },
        {
          title: "2. Current operating requirements",
          table: tables.rules,
          note: "The table above reflects the current standard disclosed in the product flow and may be updated prospectively by the active commercial and risk policy.",
        },
        {
          title: "3. Eligibility and documentation",
          items: [
            "Everwin may require registration validation, KYC, supplemental documents, and proof of ownership before, during, or after the evaluation.",
            "Document inconsistency, irregular duplicate accounts, third-party use, or fraud may lead to immediate disqualification.",
          ],
        },
        {
          title: "4. Conduct, consistency, and integrity",
          items: [
            "The evaluation requires behavior consistent with the applicable risk rules and a reasonable expectation of repeatable performance.",
            "Abusive strategies, exploitative conduct, prohibited hedging, third-party copy trading, latency manipulation, or artificial behavior may invalidate the evaluation.",
          ],
        },
        {
          title: "5. Timing, expiry, and failure",
          items: [
            "Each phase has an operating period, minimum trading-day requirement, and its own validation criteria.",
            "Drawdown breaches, expired time limits, policy violations, or integrity failures may result in failure, cooldown, refusal, or termination.",
          ],
        },
        {
          title: "6. Approval review",
          items: [
            "Apparent completion of targets is subject to internal review before final approval.",
            "Everwin may request documents, investigate patterns, and deny progression when operational, compliance, or integrity risks are identified.",
          ],
        },
        {
          title: "7. Prospective changes",
          paragraphs: [
            "Rules, metrics, requirements, thresholds, and commercial structures may be updated prospectively for new orders, resets, new cycles, or future stages.",
          ],
        },
      ],
    },
    "prop-plans-fees": {
      title: "Prop Plans & Fees",
      updated: UPDATED_AT.en,
      lead: "Consolidated table of the currently displayed plans, active currencies, standard operating parameters, and commercial notes for the Prop program.",
      intro: [
        "Plans and fees may vary by language, campaign, currency, landing page, and prospective commercial updates. The checkout in force at the time of purchase controls that order.",
      ],
      sections: [
        {
          title: "1. Portuguese-flow plans (BRL)",
          table: tables.brl,
        },
        {
          title: "2. International-flow plans (USD)",
          table: tables.usd,
        },
        {
          title: "3. Standard evaluation parameters currently shown",
          table: tables.rules,
        },
        {
          title: "4. Conversion, taxes, and external fees",
          items: [
            "Installments, exchange spread, banking costs, card charges, remittance fees, and local taxes may affect the amount effectively charged to the user.",
          ],
        },
        {
          title: "5. Promotions and commercial updates",
          items: [
            "Promotions, discounts, bundles, special activations, and coupons may be time-limited and governed by their own terms.",
            "Everwin may change plan names, prices, benefits, and structures prospectively without retroactive obligation.",
          ],
        },
      ],
    },
    "prop-account-access": {
      title: "Prop Access & Credential Policy",
      updated: UPDATED_AT.en,
      lead: "How Everwin portal access and program-related account credentials are created, linked, protected, and recovered within the Prop journey.",
      intro: [
        "The Prop journey may involve Everwin portal credentials, email or OTP-based authentication, and separate operational credentials for the evaluation account or linked account.",
      ],
      sections: [
        {
          title: "1. Credential structure",
          items: [
            "The buyer may receive or activate an Everwin portal user in order to track status, accounts, and program communications.",
            "Operational credentials for the evaluation account may differ from the portal credentials and will be linked to the eligible account holder.",
          ],
        },
        {
          title: "2. Access provisioning",
          items: [
            "Access creation depends on approved payment, internal review, possible manual reconciliation, and operational availability.",
            "Everwin may request identity validation before releasing, resetting, or transferring credentials.",
          ],
        },
        {
          title: "3. User responsibility",
          items: [
            "The account holder must keep passwords, email access, OTP codes, devices, and authentication methods confidential and under their control.",
            "Improper sharing, third-party use, credential lending, or security negligence may result in suspension or loss of eligibility.",
          ],
        },
        {
          title: "4. Recovery, reset, and blocking",
          items: [
            "Everwin may require additional validation before password reset, account unlock, email change, or access recovery.",
            "Excessive attempts, suspicious patterns, registration mismatch, or improper use may trigger temporary blocking or manual review.",
          ],
        },
        {
          title: "5. Linking users and Prop accounts",
          items: [
            "One or more Prop accounts may be linked to the same eligible user, subject to commercial rules, operating limits, and ownership validation.",
            "The purchase is personal and tied to the real data of the buyer unless Everwin expressly approves an exception after formal review.",
          ],
        },
      ],
    },
    "prop-payout-policy": {
      title: "Prop Payout and Withdrawal Policy",
      updated: UPDATED_AT.en,
      lead: "Eligibility requirements, operational review, ownership validation, and hold/denial conditions applicable to payout requests within the Prop program.",
      intro: [
        "Payouts under the Prop program are subject to rigorous operational verification, compliance screening, ownership confirmation, full adherence to Everwin policies, and international AML/KYC standards. No payout shall be processed without explicit compliance team approval following complete account review.",
      ],
      sections: [
        {
          title: "1. OPERATIONAL ELIGIBILITY AND COMPLIANCE",
          items: [
            "Only phases, structures, and accounts expressly authorized by the active commercial policy may request payout.",
            "Apparent profit, achieved target, or positive balance do NOT automatically grant payout rights.",
            "Accounts must maintain full compliance with all operational rules (drawdown, daily loss limit, minimum trading days) throughout the entire account duration.",
            "Accounts that violated any risk rule, even if subsequently recovered, may have payout suspended or denied.",
          ],
        },
        {
          title: "2. SECURITY VALIDATION AND ACCOUNT ACCESS",
          items: [
            "MULTIPLE IPS AND GEOGRAPHIC LOCATIONS: Simultaneous or sequential access from multiple IP addresses, especially across different countries/time zones within short timeframes, will result in IMMEDIATE DISQUALIFICATION from the program.",
            "Detection of unauthorized multi-IP access without robust 2FA authentication will automatically trigger payout suspension and potential total balance forfeiture with no refund rights.",
            "VPN, Proxy, or IP masking techniques are strictly prohibited. Detection constitutes serious integrity violation.",
            "Account credential sharing, even among family members or corporate entities, is prohibited and results in immediate exclusion.",
          ],
        },
        {
          title: "3. AUTOMATED BOT DETECTION AND PROHIBITION",
          items: [
            "The platform implements continuous monitoring of behavioral patterns, execution speed, and trading algorithms.",
            "Bots, automated scripts, unauthorized APIs, and mechanized strategies are STRICTLY PROHIBITED.",
            "Bot detection will result in IMMEDIATE DISQUALIFICATION, account freeze, and balance forfeiture with no refund.",
            "Suspicious activity includes: inhuman order execution frequency, perfect mathematical patterns, absence of normal trading errors, simultaneous execution across multiple timeframes.",
            "Users are solely responsible for ensuring no third party, software, or autonomous mechanism accesses or controls their account.",
          ],
        },
        {
          title: "4. DEEP OPERATIONAL REVIEW",
          items: [
            "Prior to any approval, Everwin will conduct forensic analysis of: trading consistency, return coherence, behavioral patterns, risk history, and compliance with operational rules.",
            "Concentrated, statistically implausible, or policy-incompatible results will be escalated to specialized audit.",
            "Accounts with abnormal gains, zero drawdowns, abnormally high win rates, or other irregularity indicators may have payout indefinitely held.",
            "Everwin reserves the right to demand additional documentation, third-party verification, or independent audit as conditions for payout approval.",
          ],
        },
        {
          title: "5. OWNERSHIP VALIDATION AND DOCUMENTATION",
          items: [
            "Payout recipient must exactly match identity data verified during KYC.",
            "Any discrepancy between account owner name, identity document, and receiving bank account will result in PAYOUT DENIAL.",
            "Proof of Funds, source of income verification, and beneficial ownership documentation may be required, especially for large amounts.",
            "Accounts with multiple payout attempts to different beneficiaries or methods will be flagged for fraud investigation.",
          ],
        },
        {
          title: "6. GROUNDS FOR PAYOUT HOLD AND PERMANENT DENIAL",
          paragraphs: [
            "Everwin may permanently hold or deny payout in case of:",
          ],
          items: [
            "Fraud, identity falsification, document forgery, or any deceptive activity.",
            "Policy violation: multiple IPs, VPN/Proxy, bots, account sharing, unauthorized trading.",
            "Chargeback, bank dispute, transaction reversal, or any contested transaction.",
            "Suspicious activity consistent with money laundering, structuring, or AML red flags.",
            "Connection with individuals or entities on sanction lists (OFAC, UN, EU, etc.).",
            "Legal violation: use of prohibited materials, trading restricted instruments, or breach of local regulations.",
            "Unresponsiveness to verification requests, documentation demands, or official communication.",
            "Multiple accounts under same user, document, or IP address investigated for program fraud.",
            "Any pattern of abuse, system manipulation, or attempt to exploit platform vulnerabilities.",
          ],
        },
        {
          title: "7. PAYMENT METHODS, CURRENCIES, AND LIMITS",
          items: [
            "Payout available only via payment method identical to original deposit (e.g., card → card, bank account → bank account).",
            "Crypto/blockchain payouts subject to availability and local legislation of user's country.",
            "Minimum and maximum limits per transaction, cycle, and account established per active policy.",
            "Payout processed only in original account currency or local currency per market exchange rates set by correspondent bank.",
          ],
        },
        {
          title: "8. COSTS, FEES, AND TAXES",
          items: [
            "User responsible for all applicable taxation in their jurisdiction (income tax, gains tax, etc.).",
            "Everwin may deduct: administrative processing fees, international remittance costs, FX spreads, beneficiary bank fees, and other operational costs.",
            "Payout from bonus, promotional credit, or related sources may subject to different tax and withholding rules.",
            "For jurisdictions with exit taxes, fiscal compliance verification mandatory before payout processing.",
          ],
        },
        {
          title: "9. PROCESSING TIMELINES AND COMMUNICATION",
          items: [
            "Approved payout processed within 5-10 business days, timing varies per beneficiary bank.",
            "Everwin NOT responsible for delays from intermediary banks, clearing systems, or FX issues.",
            "Official communication via registered email account. User responsible for checking spam/junk folder.",
            "Payout reversible if beneficiary information incorrect. User bears any reversal fees.",
          ],
        },
        {
          title: "10. APPEALS AND DISPUTES",
          items: [
            "Payout denial is final decision after compliance analysis. Appeals must be submitted in writing with specific argument.",
            "Evidence of complete operational compliance may be considered for reconsideration.",
            "Any Prop program dispute governed by arbitration per Everwin's General Terms of Service.",
            "Appeal deadline: 30 days after denial notification.",
          ],
        },
        {
          title: "11. INTEGRATION WITH OTHER POLICIES",
          paragraphs: [
            "This Payout Policy complements: (a) Prop Evaluation Policy; (b) Prop Plans & Fees Policy; (c) Prop Trading Terms; (d) Prop Account Access Policy; (e) General Withdrawal Policy. For Prop program-specific conflicts, this policy prevails.",
          ],
        },
      ],
    },

    "prop-account-access-policy": {
      title: "Prop Account Access, Credentials & Integrity Policy",
      updated: UPDATED_AT.en,
      lead: "Mandatory requirements for secure account access, credential usage, identity verification, and operational integrity maintenance.",
      intro: [
        "Secure access and operation of a Prop account is the sole responsibility of the account owner. This policy establishes international standards of security, authentication, and identity verification to protect both the user and the platform's integrity.",
      ],
      sections: [
        {
          title: "1. AUTHENTICATION AND CREDENTIALS",
          items: [
            "User is solely responsible for any activity conducted under their credentials.",
            "Passwords must be minimum 12 characters including uppercase, lowercase, numbers, and special symbols.",
            "Two-factor authentication (2FA) via authenticator app (Google Authenticator, Authy) is MANDATORY for Prop accounts.",
            "SMS 2FA is considered insufficient. WhatsApp, email, or weak methods are NOT accepted as second factor.",
            "Recovery keys (backup codes) must be stored in a secure OFFLINE location and NEVER shared.",
          ],
        },
        {
          title: "2. EXPRESS PROHIBITION OF MULTIPLE ACCESS",
          items: [
            "ONLY ONE ACTIVE SESSION per account is permitted. Simultaneous login from different IPs will be detected and result in forced logout.",
            "Sequential access from multiple IPs (even if authenticated with correct 2FA) will be flagged for fraud verification.",
            "Access from different country than registration within less than 4-hour interval will result in account freeze.",
            "User travel should be proactively reported via dashboard. Everwin may request additional verification.",
            "VPN, Proxy, onion networks, Dark Web, or IP masking techniques constitute serious violation.",
          ],
        },
        {
          title: "3. BIOMETRIC AND BEHAVIORAL DETECTION",
          items: [
            "System analyzes usage patterns: typical locations, times, typing speed, device type.",
            "Abnormal changes trigger alerts and possible additional authentication.",
            "New devices must be verified by email/SMS before full account access.",
            "Automatic logout after 30 minutes inactivity on active account.",
          ],
        },
        {
          title: "4. PROHIBITION OF SHARING AND REMOTE CONTROL",
          items: [
            "Sharing login credentials with any person (family member, partner, manager) is PROHIBITED.",
            "Use of remote control software (TeamViewer, AnyDesk, Chrome Remote Desktop) to access account is PROHIBITED and detectable.",
            "Power of attorney, third-party management, or delegation must be formalized through separate legal structure, never via credential sharing.",
            "Shared accounts will be immediately terminated and balance retained without refund.",
          ],
        },
        {
          title: "5. CONTINUOUS IDENTITY VERIFICATION (KYC)",
          items: [
            "Initial verification via valid identity document (passport, national ID, driver's license) is mandatory.",
            "Identity revalidation may be required periodically, especially for large payouts.",
            "Any discrepancy between registration data and verified identity will result in account suspension.",
            "User must maintain valid identity document. Expiration will result in inability to request payout until revalidation.",
          ],
        },
        {
          title: "6. LIABILITY FOR UNAUTHORIZED ACCESS",
          items: [
            "Everwin is NOT liable for losses resulting from: (a) Compromised credentials; (b) Lack of 2FA; (c) Spyware/keylogger software on user's device.",
            "User is responsible for keeping their device secure, with updated antivirus and patched operating system.",
            "Suspicious access notification must be made IMMEDIATELY to support@everwin.trade.",
            "Everwin may, at its sole discretion, adjust balance in case of proven internal fraud, but is NOT obligated to reimburse.",
          ],
        },
      ],
    },

    "prop-trading-restrictions": {
      title: "Prop Operational Restrictions & Trading Prohibitions Policy",
      updated: UPDATED_AT.en,
      lead: "Prohibited instruments, strategies, behaviors, and techniques in the Prop program to protect operational integrity and regulatory compliance.",
      intro: [
        "To maintain operational integrity and compliance with international regulations, certain trading activities, instruments, and strategies are strictly prohibited on Prop accounts.",
      ],
      sections: [
        {
          title: "1. PROHIBITION OF BOTS, APIS, AND AUTOMATION",
          items: [
            "Trading bots, automated scripts, Expert Advisors (EAs), and any form of mechanized execution are PROHIBITED.",
            "Integration with unauthorized APIs, webhooks, or automated signals is PROHIBITED.",
            "Use of tools executing orders without real human intervention will result in immediate disqualification.",
            "Detection of inhuman execution patterns (hundreds of orders per minute, simultaneous multi-pair execution, etc.) will trigger investigation and possible termination.",
          ],
        },
        {
          title: "2. PROHIBITED HIGH-FREQUENCY ACTIVITIES",
          items: [
            "Extreme scalping (dozens of trades per hour on different pairs) may be flagged as bot activity.",
            "Order placement merely to manipulate spreads, create latency, or other predatory market-making techniques.",
            "Layering, spoofing, pump-and-dump, or any form of market fraud/manipulation.",
          ],
        },
        {
          title: "3. SPECIFIC PROHIBITED INSTRUMENTS",
          items: [
            "Indices (S&P 500, DAX, etc.) may be restricted per program version.",
            "Volatile or low-liquidity cryptocurrencies may be outside scope.",
            "Leveraged commodities or micro-contracts may be prohibited.",
            "Delisted, expired, or suspended instruments cannot be traded.",
          ],
        },
        {
          title: "4. LEVERAGE AND EXPOSURE RESTRICTIONS",
          items: [
            "Maximum leverage limit per policy: typically 1:100 or less.",
            "Overnight exposed position may be subject to additional margins.",
            "Positions left open during holidays/weekends may be automatically closed.",
            "Single instrument/pair exposure limited to ensure diversification.",
          ],
        },
      ],
    },

    "prop-purchase-reset-policy": {
      title: "Prop Purchases, Resets & Cancellations",
      updated: UPDATED_AT.en,
      lead: "Commercial rules for buying evaluations, handling duplicate orders, resets, reactivations, cancellations, and re-contracting within the Prop program.",
      intro: [
        "This policy organizes the commercial logic that applies to Prop evaluation purchases and continuation mechanisms, always subject to the active offer version in force at the relevant request date.",
      ],
      sections: [
        {
          title: "1. Purchases and duplicate orders",
          items: [
            "Duplicate orders, repeated attempts, replicated charges, or purchases showing error indicators may be paused for review before delivery.",
            "Everwin may merge, cancel, or adjust redundant orders where reasonably necessary to preserve financial and operational integrity.",
          ],
        },
        {
          title: "2. Provisioning after purchase",
          items: [
            "Evaluation activation and credential delivery are not necessarily instantaneous; they may depend on payment approval, antifraud review, and internal provisioning.",
          ],
        },
        {
          title: "3. Cancellation and refund review",
          items: [
            "Orders not yet provisioned, blocked by a material operational error, or submitted with a serious mistake may be reviewed for cancellation in light of applicable law and the active commercial policy.",
            "After provisioning, use, credential delivery, evaluation start, or operational benefit release, eligibility for cancellation or refund may be limited, reduced, or unavailable except where law requires otherwise.",
          ],
        },
        {
          title: "4. Reset, repurchase, and new attempt",
          items: [
            "Reset, repurchase, reactivation, and new contracting depend on the active offer, commercial rules, user history, and operating eligibility.",
            "Everwin is not required to grant a reset in every case, especially where there is fraud, abusive recurrence, chargeback, serious policy breach, or incompatible program use.",
          ],
        },
        {
          title: "5. Cooldown and administrative limits",
          items: [
            "Frequency limits may apply to purchases, resets, active accounts, repurchases per period, reactivations, and number of accounts per person, household, or related structure.",
          ],
        },
        {
          title: "6. Governing commercial policy",
          paragraphs: [
            "Promotions, discounts, bonuses, reset rules, and repurchase windows are governed by the commercial policy active at the time of the relevant request.",
          ],
        },
      ],
    },

    "account-closure": {
      title: "Account Closure Policy",
      updated: UPDATED_AT.en,
      lead: "Reasons, process, consequences, and right to appeal for definitive account closure at Everwin.",
      intro: [
        "This policy establishes the rules and procedures applicable to account closure at Everwin, whether initiated by the platform or the client, including reasons, process, consequences, and right to appeal.",
      ],
      sections: [
        {
          title: "1. Right to Close Accounts",
          paragraphs: [
            "Everwin reserves the right to definitively close accounts at its sole discretion when identifying violations of the Terms of Use, applicable policies, or behaviors incompatible with ecosystem integrity.",
          ],
          items: [
            "Account closure may occur without prior notice in cases of serious violation.",
            "The decision to close an account is sovereign and is not subject to contestation beyond the 30-day appeal period.",
            "Everwin shall not be liable for any losses arising from legitimate account closure.",
          ],
        },
        {
          title: "2. Reasons for Definitive Closure",
          items: [
            { label: "10x Rule Violation", text: "Attempt or effective withdrawal exceeding the 10x limit on the deposited amount in the calendar month." },
            { label: "Proven Fraud", text: "Use of false identity, falsified documents, or any deceptive activity." },
            { label: "Account Sharing", text: "Credentials shared with third parties, including family members or partners." },
            { label: "Bot/API Usage", text: "Use of automation, scripts, bots or any form of unauthorized mechanized execution." },
            { label: "Multiple Accounts", text: "Creation of duplicate accounts by the same holder or group of persons." },
            { label: "VPN/Proxy", text: "Use of IP masking techniques or unauthorized location access." },
            { label: "Operational Violation", text: "Breach of drawdown, daily loss limit, minimum days or other program parameters." },
            { label: "Suspicious Activity", text: "Patterns inconsistent with legitimate trading or anomalous behavior detected by the system." },
            { label: "Abusive Chargeback", text: "Unjustified or recurring bank disputes." },
            { label: "Non-Cooperation", text: "Refusal to provide documentation or respond to compliance requests." },
            { label: "Court Order", text: "Determination by competent authority for account closure." },
          ],
        },
        {
          title: "3. 10x Rule - Withdrawal Limit",
          paragraphs: [
            "Everwin clients CANNOT make withdrawals that exceed the 10x (ten times) limit on the amount deposited at the broker in the current calendar month.",
          ],
          items: [
            "The calculation is: Monthly Limit = Total Deposits in Month × 10",
            "Violation of this rule results in immediate account block for investigation.",
            "Upon confirmation of violation, the account will be permanently closed.",
            "There are no exceptions to the 10x rule, except court order or proven Everwin error.",
          ],
          note: "Example: If the client deposited $1,000 in the month, their withdrawal limit is $10,000. Withdrawals above this amount will be blocked.",
        },
        {
          title: "4. Closure Process",
          ordered: true,
          items: [
            "Detection of irregularity by Everwin's monitoring system.",
            "Temporary account block for investigation and forensic analysis.",
            "Complete analysis of trading patterns, transactions and compliance.",
            "Notification to Client via email with detailed description of the reason.",
            "Appeal period of 30 (thirty) days for contestation.",
            "Appeal analysis by Everwin's compliance team.",
            "Final decision communicated to Client by email.",
            "Definitive closure and retention of funds according to policy.",
          ],
        },
        {
          title: "5. Consequences of Closure",
          items: [
            "Loss of access to all services and functionalities of the Platform.",
            "Inability to use the Platform or participate in the Prop Program.",
            "Loss of eligibility for future program participation.",
            "Inability to re-register with the same data (in case of closure for violation).",
            "Retention of funds according to current policy and Terms of Use.",
            "Loss of benefits, progress or achievements obtained on the Platform.",
            "Termination of all contractual relationships with Everwin.",
          ],
        },
        {
          title: "6. Right to Appeal",
          items: [
            "The Client may submit an appeal within 30 (thirty) days of notification.",
            "The appeal must be sent in writing to compliance@everwin.trade.",
            "It must contain specific argumentation and supporting documentation proving compliance.",
            "Everwin will analyze the appeal within a reasonable period (up to 15 business days).",
            "The decision will be communicated by email and will be final and internally unappealable.",
          ],
        },
        {
          title: "7. Closure by Client Initiative",
          items: [
            "The Client may request account closure at any time.",
            "The request must be made via dashboard or email to support@everwin.trade.",
            "Before closure, the Client must withdraw any available balances.",
            "The Client must verify they meet eligibility requirements for withdrawal.",
            "Closure will be processed within a reasonable period after confirmation.",
          ],
        },
        {
          title: "8. Market References",
          paragraphs: [
            "Everwin's account closure practices are in line with international trading and financial platform market standards.",
          ],
          items: [
            "Binomo: Reserves the right to close accounts without prior notice in case of policy violation.",
            "IQ Option: Exercises discretion to define closure rules according to its terms.",
            "Dukascopy: May close accounts immediately without prior notice, according to its Terms of Use.",
            "Everwin: Adopts similar practices, focusing on ecosystem protection and regulatory compliance.",
          ],
          note: "Everwin operates under a Curaçao license (#365/JAZ) and is in compliance with international AML/KYC regulations.",
        },
        {
          title: "9. Contact",
          paragraphs: [
            `For questions about this policy, contact ${SUPPORT_EMAIL}. For compliance and closure matters, use compliance@everwin.trade.`,
          ],
        },
      ],
    },
  };
}

function getSpanishPages(): Record<LegalPageSlug, LegalPolicyPageContent> {
  const tables = buildPlanTables("es");

  return {
    privacy: {
      title: "Política de Privacidad",
      updated: UPDATED_AT.es,
      lead: "Cómo Everwin recopila, utiliza, comparte, almacena y protege datos personales en el sitio, en los flujos de corretaje y en el programa Prop.",
      intro: [
        'Esta Política de Privacidad describe cómo Everwin ("Everwin", "nosotros") trata datos personales en sus sitios, formularios, landing pages, canales de soporte, portales de cliente y flujos operativos vinculados a sus productos y programas.',
      ],
      sections: [
        {
          title: "1. Alcance",
          items: [
            "Esta política se aplica a visitantes, leads, clientes, postulantes, afiliados y usuarios que interactúan con activos digitales de Everwin.",
            "Los proveedores terceros integrados en nuestros flujos, incluidos procesadores de pago, herramientas de analytics, CRM, mensajería y verificación, pueden estar sujetos a sus propias políticas.",
          ],
        },
        {
          title: "2. Datos que podemos recopilar",
          items: [
            { label: "Identidad", text: "nombre, correo, teléfono, país, idioma, datos de registro e información enviada en formularios." },
            { label: "Datos operativos", text: "producto seleccionado, plan comprado, estado de la solicitud, historial de soporte, datos de acceso y uso del portal." },
            { label: "Datos financieros y transaccionales", text: "método de pago, estado del cobro, moneda, importe, identificadores del pedido y eventos antifraude." },
            { label: "Datos técnicos", text: "IP, tipo de dispositivo, navegador, sistema operativo, logs, identificadores de sesión, idioma y localización aproximada por país." },
            { label: "Compliance", text: "documentos, pruebas de identidad, residencia, titularidad y cualquier información necesaria para KYC, AML, prevención de fraude o revisión de payout." },
          ],
        },
        {
          title: "3. Fuentes de recopilación",
          items: [
            "Directamente del usuario cuando completa formularios, crea una cuenta, compra planes, envía documentos, accede al portal o contacta al soporte.",
            "Automáticamente mediante cookies, logs, píxeles, SDKs, analytics y herramientas técnicas de rendimiento o seguridad.",
            "Desde socios operativos y proveedores que apoyan facturación, verificación, CRM, antifraude, hosting, soporte e infraestructura.",
          ],
        },
        {
          title: "4. Finalidades del tratamiento",
          items: [
            "Operar el sitio, procesar compras, crear accesos, aprovisionar cuentas, prestar soporte y ejecutar flujos de Prop u otros productos.",
            "Mantener la seguridad y prevenir fraude, abuso, chargebacks, uso indebido de múltiples cuentas, manipulación operativa o uso no autorizado.",
            "Cumplir obligaciones legales, regulatorias, tributarias, de auditoría, investigación o requerimientos de autoridades competentes.",
            "Personalizar idioma, moneda, contenido y experiencia según elecciones explícitas, navegador, geolocalización por país e interacciones previas.",
            "Enviar comunicaciones operativas, comerciales o de retención cuando la ley lo permita y con respeto a los derechos de exclusión aplicables.",
          ],
        },
        {
          title: "5. Bases legales",
          paragraphs: [
            "Cuando corresponda, el tratamiento podrá basarse en la ejecución del contrato, obligaciones legales, interés legítimo para operar y proteger el ecosistema, ejercicio regular de derechos y consentimiento en casos específicos.",
          ],
        },
        {
          title: "6. Compartición",
          items: [
            "Podemos compartir datos con encargados y proveedores involucrados en hosting, facturación, CRM, mensajería, analytics, verificación, antifraude y soporte.",
            "También podremos divulgar información cuando sea necesario para proteger derechos, investigar conductas sospechosas, responder a solicitudes legales válidas, prevenir fraude o apoyar auditorías internas y externas.",
            "Everwin no trata la venta de datos personales como actividad principal; cualquier compartición debe estar vinculada al funcionamiento legítimo de la plataforma y de sus productos.",
          ],
        },
        {
          title: "7. Retención, seguridad y derechos",
          items: [
            "Los datos pueden conservarse mientras sean necesarios para fines operativos, legales, tributarios, contractuales, de auditoría, defensa y prevención de abuso.",
            "Aplicamos medidas administrativas, técnicas y organizativas razonables para reducir el riesgo de acceso no autorizado, fuga, pérdida, alteración o uso indebido.",
            "Dependiendo de la ley aplicable, los titulares pueden tener derechos de acceso, rectificación, actualización, portabilidad, supresión, limitación, oposición o retiro del consentimiento.",
          ],
          note: `Las solicitudes de privacidad pueden enviarse a ${SUPPORT_EMAIL}. Everwin podrá solicitar confirmación adicional de identidad antes de procesarlas.`,
        },
      ],
    },
    terms: {
      title: "Términos y Condiciones",
      updated: UPDATED_AT.es,
      lead: "Términos generales que regulan el acceso al sitio, a las páginas comerciales, a los portales de cliente y a las experiencias digitales operadas por Everwin.",
      intro: [
        "Al acceder o utilizar cualquier entorno operado por Everwin, el usuario declara que ha leído, comprendido y aceptado estos Términos, junto con las políticas específicas que correspondan a cada producto.",
      ],
      sections: [
        {
          title: "1. Elegibilidad y uso permitido",
          items: [
            "El usuario debe tener capacidad legal para contratar y utilizar los servicios en su jurisdicción.",
            "Everwin podrá restringir el acceso por razones legales, operativas, comerciales, de riesgo, de compliance o de integridad del ecosistema.",
            "Se prohíbe el fraude, abuso, ingeniería inversa, automatización no autorizada, scraping, manipulación de métricas y cualquier conducta ilícita.",
          ],
        },
        {
          title: "2. Registro, credenciales e integridad de cuenta",
          items: [
            "La información proporcionada por el usuario debe ser veraz, actual y verificable.",
            "El usuario es responsable de proteger sus credenciales, dispositivos, correo y métodos de autenticación.",
            "Everwin podrá suspender o terminar el acceso cuando existan señales de uso compartido, identidad falsa, control por terceros, fraude, abuso promocional o incumplimiento contractual.",
          ],
        },
        {
          title: "3. Naturaleza informativa y ausencia de asesoramiento",
          items: [
            "El contenido del sitio, páginas comerciales, videos, artículos, materiales educativos y comunicaciones institucionales tiene naturaleza informativa, educativa o comercial.",
            "Nada en el sitio constituye asesoramiento personalizado de inversión, financiero, legal, tributario o contable.",
          ],
        },
        {
          title: "4. Reglas específicas por producto",
          items: [
            "Productos como corretaje, materiales educativos, afiliación, evaluaciones Prop, cuentas simuladas y portales internos pueden tener políticas adicionales propias.",
            "Si existe conflicto entre estos Términos generales y una política específica, prevalecerá la política específica para la materia correspondiente.",
          ],
        },
        {
          title: "5. Propiedad intelectual",
          items: [
            "Diseño, layout, identidad visual, marcas, scripts, dashboards, workflows, software y materiales propios o licenciados por Everwin están protegidos por los derechos aplicables.",
            "No se permite copiar, revender, replicar, distribuir, modificar ni crear obras derivadas sin autorización expresa y escrita.",
          ],
        },
        {
          title: "6. Disponibilidad, cambios y responsabilidad",
          items: [
            "Los entornos de Everwin pueden modificarse, pausarse, limitarse o descontinuarse en cualquier momento por razones técnicas, legales, comerciales u operativas.",
            "En la máxima medida permitida por la ley, Everwin no garantiza disponibilidad ininterrumpida, compatibilidad universal ni resultado específico alguno.",
            "El uso continuado después de cambios en políticas, funciones, precios o flujos implica aceptación de la versión vigente.",
          ],
          note: `Las consultas generales pueden dirigirse a ${SUPPORT_EMAIL}.`,
        },
      ],
    },
    cookies: {
      title: "Política de Cookies",
      updated: UPDATED_AT.es,
      lead: "Cómo utilizamos cookies, píxeles, local storage y tecnologías similares para operación, personalización, seguridad y medición.",
      intro: [
        "Las cookies y tecnologías similares ayudan a mantener el sitio funcional, recordar preferencias, medir rendimiento, entender la navegación y proteger la operación contra abuso.",
      ],
      sections: [
        {
          title: "1. Categorías de tecnología",
          items: [
            { label: "Esenciales", text: "necesarias para login, navegación, idioma, persistencia de sesión y controles de seguridad." },
            { label: "Preferencias", text: "recuerdan idioma, elecciones del usuario y configuraciones relevantes de la interfaz." },
            { label: "Medición y analytics", text: "permiten entender el uso del sitio, rendimiento de campañas, eventos de formularios, funnels y estabilidad técnica." },
            { label: "Seguridad", text: "apoyan la validación de tráfico, mitigación de abuso, revisión antifraude y análisis de riesgo." },
          ],
        },
        {
          title: "2. Finalidades",
          items: [
            "Mantener el sitio operativo y conservar preferencias, incluido el idioma elegido manualmente o determinado automáticamente.",
            "Mejorar UX, rendimiento, estabilidad y detección de cuellos de botella en páginas comerciales y portales.",
            "Medir campañas, formularios, envíos y fuentes de tráfico cuando dicho tratamiento sea compatible con la base legal aplicable.",
          ],
        },
        {
          title: "3. Controles del usuario",
          items: [
            "El usuario puede gestionar cookies mediante la configuración del navegador o herramientas específicas que Everwin pueda ofrecer.",
            "Desactivar cookies esenciales o almacenamiento local puede afectar el login, preferencias, formularios y otras funciones críticas.",
          ],
        },
        {
          title: "4. Tecnologías de terceros",
          items: [
            "Herramientas integradas de analytics, CRM, chat, media, rendimiento, antifraude o mensajería pueden establecer sus propios identificadores técnicos.",
            "Siempre que sea posible, Everwin busca minimizar la recopilación excesiva y utilizar proveedores alineados con las necesidades operativas de la plataforma.",
          ],
        },
        {
          title: "5. Actualizaciones y contacto",
          paragraphs: [
            `Esta política puede actualizarse cuando exista un cambio relevante en herramientas, finalidades o requisitos legales. Las dudas pueden enviarse a ${SUPPORT_EMAIL}.`,
          ],
        },
      ],
    },
    "payment-policy": {
      title: "Política de Pagos",
      updated: UPDATED_AT.es,
      lead: "Reglas generales para cobros, compra de planes, aprobación de pedidos, verificación y prevención de fraude en los productos Everwin.",
      intro: [
        "Esta política se aplica a los pagos realizados en flujos oficiales de Everwin, incluidas páginas de producto, checkout Prop, planes, materiales educativos y otras ofertas comerciales de la marca.",
      ],
      sections: [
        {
          title: "1. Canales y métodos autorizados",
          items: [
            "Solo deben considerarse válidos los métodos mostrados en el checkout oficial, en páginas operadas por Everwin o mediante integraciones oficiales.",
            "La disponibilidad de moneda, cuotas, adquirente y método de pago puede variar según el país, idioma, producto, análisis de riesgo y disponibilidad técnica.",
          ],
        },
        {
          title: "2. Aprobación de pedidos",
          items: [
            "Los pedidos pueden pasar por autenticación, validación de datos, respuesta del procesador y controles de seguridad antes de la aprobación final.",
            "Un cobro exitoso no implica necesariamente aprovisionamiento inmediato; puede requerirse revisión interna, conciliación o verificación manual.",
            "Everwin podrá cancelar, retener o rechazar pedidos afectados por inconsistencias registrales, duplicados, señales de fraude, chargebacks previos, pruebas no autorizadas o uso incompatible con las políticas vigentes.",
          ],
        },
        {
          title: "3. Pagos del programa Prop",
          items: [
            "La compra de una evaluación Prop corresponde a una etapa de validación de desempeño y no a la adquisición de un valor negociable, inversión colectiva ni producto de retorno garantizado.",
            "La liberación de credenciales del portal y de la cuenta vinculada depende del pago aprobado, revisión interna y cumplimiento de las reglas comerciales y operativas aplicables.",
          ],
        },
        {
          title: "4. Tarifas, impuestos y conversión",
          items: [
            "Los precios mostrados reflejan la oferta activa al momento del checkout, pero pueden existir costos adicionales de conversión, spread, banco, impuestos, cuotas o procesador de pagos.",
            "Las obligaciones tributarias o retenciones podrán tratarse de acuerdo con la ley aplicable, el método de pago y la estructura comercial vigente.",
          ],
        },
        {
          title: "5. Disputas, chargebacks y abuso",
          items: [
            "Los pedidos en disputa, chargeback o sospecha de fraude pueden tener acceso suspendido, beneficios revisados y servicios bloqueados mientras se investiga el caso.",
            "Everwin podrá revocar accesos o negar una nueva contratación cuando exista historial de fraude, chargebacks abusivos o intentos de eludir controles de la plataforma.",
          ],
        },
        {
          title: "6. Contacto",
          paragraphs: [
            `Las consultas sobre cobros, conciliación o facturación pueden enviarse a ${SUPPORT_EMAIL}.`,
          ],
        },
      ],
    },
    "withdrawal-policy": {
      title: "Política de Retiro",
      updated: UPDATED_AT.es,
      lead: "Condiciones generales para solicitudes de retiro, devoluciones de fondos, validación de titularidad y revisiones adicionales.",
      intro: [
        "Esta política describe las reglas generales aplicables a retiros o devoluciones de fondos procesados por Everwin cuando el producto o la estructura comercial correspondiente lo permitan.",
      ],
      sections: [
        {
          title: "1. Elegibilidad y alcance",
          items: [
            "No todos los productos de Everwin generan saldo retirable. Las tarifas de evaluación, membresías, accesos o productos educativos pueden no ser retirables salvo que la política comercial aplicable disponga expresamente lo contrario.",
            "Los programas Prop, cuentas simuladas y estructuras de payout tienen reglas propias de elegibilidad y deben además cumplir la política específica del programa vigente.",
          ],
        },
        {
          title: "2. Verificación y titularidad",
          items: [
            "Everwin podrá exigir KYC, prueba de titularidad, historial operativo, documentos de respaldo, revisión antifraude y confirmación del método receptor.",
            "Los retiros a terceros, cuentas con titularidad no coincidente, documentación inconsistente o estructuras sospechosas podrán ser rechazados.",
          ],
        },
        {
          title: "3. Tiempos de procesamiento",
          items: [
            "El plazo depende del método seleccionado, la cola interna, el calendario bancario, el nivel de revisión y el proveedor externo responsable de la liquidación.",
            "Everwin no controla totalmente los retrasos causados por bancos, gateways, redes de liquidación, validadores, feriados o exigencias extraordinarias de compliance.",
          ],
        },
        {
          title: "4. Retenciones, rechazos y ajustes",
          items: [
            "Las solicitudes pueden ser retenidas, rechazadas, ajustadas o escaladas para revisión en caso de error material, divergencia registral, chargeback, sospecha de abuso, incumplimiento contractual, investigación en curso u obligación legal.",
            "Everwin podrá compensar importes adeudados, revertir liberaciones erróneas o adoptar medidas administrativas cuando un pago se haya realizado por error o sobre información incorrecta.",
          ],
        },
        {
          title: "5. Costos e impuestos",
          items: [
            "Cargos bancarios, comisiones de remesa, spread cambiario, retenciones, impuestos o gastos del método de pago pueden ser deducidos o trasladados según corresponda.",
          ],
        },
        {
          title: "6. Canal de soporte",
          paragraphs: [
            `Para consultas operativas sobre retiros y elegibilidad, utilice ${SUPPORT_EMAIL}.`,
          ],
        },
      ],
    },
    "general-fees": {
      title: "Tarifas Generales",
      updated: UPDATED_AT.es,
      lead: "Visión consolidada de las categorías de tarifas, cargos de terceros y costos operativos que pueden existir en los productos Everwin.",
      intro: [
        "Los productos de Everwin pueden implicar precios de adquisición, suscripciones, tarifas de terceros, costos operativos y cargos vinculados a moneda, método de pago, compliance o soporte excepcional.",
      ],
      sections: [
        {
          title: "1. Tarifas de producto",
          items: [
            "Planes, evaluaciones, resets, activaciones, upgrades, productos educativos y ofertas especiales pueden tener su propio precio publicado en la landing, checkout, propuesta o política específica.",
            "El precio vigente en la fecha de contratación se aplica a esa compra, salvo disposición legal en contrario.",
          ],
        },
        {
          title: "2. Costos de terceros",
          items: [
            "Gateways, adquirentes, bancos, procesadores y métodos alternativos pueden imponer cargos externos, incluidos spreads, costos de cuotas, remesas y conversión.",
          ],
        },
        {
          title: "3. Gestión administrativa y excepcional",
          items: [
            "Cuando la ley lo permita y el flujo operativo lo justifique, Everwin podrá aplicar gestión administrativa en asuntos relacionados con fraude, investigación, recuperación, chargeback, reprocesamiento o tratamiento excepcional.",
            "Los costos derivados de error del usuario, documentación incorrecta, cuentas no elegibles o intentos impropios repetidos pueden requerir revisión operativa adicional.",
          ],
        },
        {
          title: "4. Programa Prop",
          items: [
            "Las tarifas del programa Prop se detallan en la política específica de Planes y Tarifas y pueden variar según idioma, moneda, campaña, oferta y actualización prospectiva.",
          ],
        },
        {
          title: "5. Transparencia",
          paragraphs: [
            "Everwin procura presentar los valores, la moneda y las reglas relevantes durante el flujo correspondiente. Si una tarifa no aparece expresamente, el usuario debe considerar que pueden existir costos de terceros y de cambio.",
          ],
        },
      ],
    },
    "risk-disclosure": {
      title: "Divulgación de Riesgos",
      updated: UPDATED_AT.es,
      lead: "Advertencias importantes sobre riesgo de mercado, riesgo tecnológico, riesgo de ejecución, apalancamiento y programas de evaluación.",
      intro: [
        "La actividad de trading, los entornos simulados, los productos apalancados y los programas de evaluación de desempeño implican riesgos significativos. No son adecuados para todas las personas o estructuras.",
      ],
      sections: [
        {
          title: "1. Riesgo de pérdida y volatilidad",
          items: [
            "Los mercados pueden moverse rápidamente por noticias, cambios de liquidez, eventos macroeconómicos, fallas técnicas, gaps y comportamiento de otros participantes.",
            "El desempeño pasado, sea simulado o real, no garantiza resultados futuros.",
          ],
        },
        {
          title: "2. Riesgo tecnológico y operativo",
          items: [
            "Latencia, indisponibilidad, problemas de conectividad, diferencias horarias, bugs, interrupciones de terceros e incidentes operativos pueden afectar la experiencia del usuario.",
            "Everwin no garantiza disponibilidad ininterrumpida ni ausencia de fallas, retrasos o discrepancias entre entornos.",
          ],
        },
        {
          title: "3. Riesgo en entornos simulados y de evaluación",
          items: [
            "Las cuentas demo, de evaluación y simuladas pueden diferir sustancialmente de las condiciones de mercado real en precio, ejecución, liquidez, slippage, profundidad y disponibilidad.",
            "Aprobar una evaluación depende además de reglas internas, criterios de riesgo, revisión operativa y controles de compliance.",
          ],
        },
        {
          title: "4. Riesgo de margen y apalancamiento",
          items: [
            "El apalancamiento y las estructuras con margen amplifican ganancias y pérdidas, pudiendo acelerar brechas, liquidaciones o fallas de cuenta.",
          ],
        },
        {
          title: "5. Sin promesa ni asesoramiento",
          items: [
            "Everwin no promete rentabilidad, continuidad en programas, cuenta fondeada, payout, aprobación automática ni adecuación del producto al perfil del usuario.",
            "Nada en el sitio debe interpretarse como asesoramiento personalizado de inversión, fiscal, legal o contable.",
          ],
        },
      ],
    },
    "order-execution": {
      title: "Política de Ejecución de Órdenes",
      updated: UPDATED_AT.es,
      lead: "Principios generales sobre formación de precios, latencia, rechazos, registros operativos y diferencias entre ejecución indicativa y efectiva.",
      intro: [
        "Esta política describe los principios generales aplicables al procesamiento de órdenes o eventos operativos en entornos soportados por Everwin o por proveedores integrados.",
      ],
      sections: [
        {
          title: "1. Principios de ejecución",
          items: [
            "Everwin busca consistencia operativa e integridad del ecosistema, pero no puede garantizar ejecución perfecta en todos los escenarios.",
            "El precio, la liquidez, la volatilidad, la cola, el tipo de orden, las condiciones técnicas y las reglas del producto pueden afectar el resultado final.",
          ],
        },
        {
          title: "2. Precio indicativo y slippage",
          items: [
            "Las cotizaciones, gráficos y dashboards pueden ser meramente indicativos y no coincidir necesariamente con el precio ejecutado.",
            "El slippage, los gaps y las diferencias de latencia pueden producir ejecución a un valor distinto del esperado por el usuario.",
          ],
        },
        {
          title: "3. Entornos simulados y Prop",
          items: [
            "En evaluación, simulación o infraestructura Prop, la lógica interna puede incluir reglas de validación, límites de riesgo, pausas y conciliación de eventos.",
            "No se garantiza una réplica exacta del mercado en vivo y puede haber diferencias frente a condiciones de corretaje, feed o terceros.",
          ],
        },
        {
          title: "4. Rechazo, cancelación y corrección",
          items: [
            "Las órdenes o eventos pueden ser rechazados, cancelados, revisados o corregidos ante error material, falla técnica, riesgo operativo, abuso, inconsistencia de datos, fuerza mayor u obligación legal.",
          ],
        },
        {
          title: "5. Registros y auditoría",
          items: [
            "Everwin podrá conservar registros técnicos, trazas de auditoría e historial de eventos para seguridad, compliance, conciliación, prevención de abuso y resolución de disputas.",
          ],
        },
      ],
    },
    "margin-trading": {
      title: "Trading con Margen",
      updated: UPDATED_AT.es,
      lead: "Información esencial sobre productos apalancados, riesgo de liquidación, llamadas de margen y adecuación del usuario.",
      intro: [
        "Operar con margen o utilizar productos apalancados puede amplificar materialmente tanto las ganancias como las pérdidas. Esa exposición no es adecuada para todos los perfiles.",
      ],
      sections: [
        {
          title: "1. Efecto del apalancamiento",
          items: [
            "Movimientos relativamente pequeños del mercado pueden generar efectos desproporcionadamente grandes sobre saldo, patrimonio o umbrales operativos.",
          ],
        },
        {
          title: "2. Liquidación y llamadas de margen",
          items: [
            "Cuando no se cumplen los niveles requeridos de margen, las posiciones pueden reducirse, cerrarse o liquidarse automáticamente.",
            "Los eventos bruscos del mercado pueden dejar tiempo insuficiente para una reacción manual del usuario.",
          ],
        },
        {
          title: "3. Gaps, volatilidad e interrupciones",
          items: [
            "Los gaps de apertura, eventos macroeconómicos, baja liquidez y fallas técnicas pueden intensificar la exposición, el riesgo de ejecución y la dificultad para ajustar posiciones.",
          ],
        },
        {
          title: "4. Adecuación y responsabilidad del usuario",
          items: [
            "Es responsabilidad del usuario evaluar si comprende el producto, la mecánica de margen, el perfil de pérdida potencial y los riesgos específicos del mercado.",
          ],
        },
        {
          title: "5. Ausencia de garantía",
          paragraphs: [
            "Everwin no garantiza disponibilidad continua de productos con margen, condiciones estables de liquidación ni adecuación universal de la exposición apalancada.",
          ],
        },
      ],
    },
    aml: {
      title: "Política AML & KYC",
      updated: UPDATED_AT.es,
      lead: "Directrices para identificación de clientes, verificación documental, prevención de lavado de dinero, revisión de sanciones y fraude.",
      intro: [
        "Everwin mantiene controles de identificación, verificación y monitoreo dirigidos a proteger la integridad del ecosistema, reducir el fraude y cumplir expectativas de compliance aplicables.",
      ],
      sections: [
        {
          title: "1. Verificación de identidad",
          items: [
            "Podemos solicitar documentos, selfies, comprobantes, datos de registro adicionales, información empresarial u otros materiales necesarios para validar identidad y titularidad.",
            "La documentación insuficiente puede impedir compra, aprovisionamiento, retiro, payout, recuperación de acceso o participación continuada.",
          ],
        },
        {
          title: "2. Origen de fondos y revisión de riesgo",
          items: [
            "En situaciones sensibles, Everwin podrá solicitar información sobre el origen de los fondos, la finalidad de la operación, vínculos con terceros o historial transaccional.",
          ],
        },
        {
          title: "3. Monitoreo continuo",
          items: [
            "Cuentas, pagos, patrones operativos, logins, solicitudes de payout, registros duplicados, comportamiento en campañas y eventos de riesgo pueden ser monitoreados de forma continua.",
          ],
        },
        {
          title: "4. Restricciones y jurisdicciones",
          items: [
            "Everwin puede restringir o terminar la relación con base en listas de sanciones, riesgo elevado, incompatibilidad regulatoria, país de residencia, documentación insuficiente o uso sospechoso.",
          ],
        },
        {
          title: "5. Cooperación y conservación",
          items: [
            "Everwin puede cooperar con requerimientos legales válidos y conservar registros durante el tiempo necesario para compliance, auditoría, investigación y defensa de derechos.",
          ],
          note: "La existencia de controles AML/KYC no implica la aceptación automática de cualquier usuario, pago o solicitud de payout.",
        },
      ],
    },
    "demo-accounts": {
      title: "Cuentas Demo",
      updated: UPDATED_AT.es,
      lead: "Información sobre entornos de demostración, pruebas y simulación y sus limitaciones frente a condiciones reales de trading.",
      intro: [
        "Los entornos demo, de evaluación y simulados existen con fines educativos, operativos, de validación o entrenamiento. No replican completamente las condiciones del mercado en vivo.",
      ],
      sections: [
        {
          title: "1. Diferencia frente al entorno real",
          items: [
            "El precio, slippage, liquidez, profundidad, costo, ejecución, velocidad, límites y condiciones de mercado pueden diferir significativamente de un entorno real.",
          ],
        },
        {
          title: "2. Resets, límites y disponibilidad",
          items: [
            "Everwin podrá limitar el acceso, reiniciar saldos, reconfigurar cuentas, suspender recursos o discontinuar entornos demo en cualquier momento.",
          ],
        },
        {
          title: "3. Uso permitido",
          items: [
            "Los entornos demo no pueden utilizarse para fraude, explotación de fallos, ingeniería inversa, extracción de datos, abuso de infraestructura o elusión de reglas comerciales.",
          ],
        },
        {
          title: "4. Sin equivalencia",
          items: [
            "Los resultados obtenidos en una cuenta demo o de evaluación no garantizan el mismo desempeño en una cuenta real, fondeada o futura.",
          ],
        },
        {
          title: "5. Actualizaciones",
          paragraphs: [
            "Los parámetros de las cuentas demo y simuladas pueden cambiar sin aviso previo para reflejar necesidades técnicas, comerciales, de riesgo o de integridad del programa.",
          ],
        },
      ],
    },
    "prop-evaluation-policy": {
      title: "Política de Evaluación Prop",
      updated: UPDATED_AT.es,
      lead: "Reglas operativas de la jornada de evaluación, criterios de aprobación, límites de riesgo, revisión interna y descalificación en el programa Prop de Everwin.",
      intro: [
        "Esta política complementa los Términos de Prop Trading y explica cómo se estructura, monitorea y valida la evaluación dentro del ecosistema Everwin.",
      ],
      sections: [
        {
          title: "1. Naturaleza de la evaluación",
          items: [
            "La evaluación es una etapa diseñada para validar desempeño, disciplina, cumplimiento de reglas e integridad conductual.",
            "La finalización de etapas no crea automáticamente derecho a cuenta fondeada, payout ni participación continuada.",
          ],
        },
        {
          title: "2. Requisitos operativos vigentes",
          table: tables.rules,
          note: "La tabla anterior refleja el estándar actual mostrado en el flujo del producto y puede actualizarse de forma prospectiva por la política comercial y de riesgo vigente.",
        },
        {
          title: "3. Elegibilidad y documentación",
          items: [
            "Everwin podrá exigir validación registral, KYC, documentos adicionales y prueba de titularidad antes, durante o después de la evaluación.",
            "Inconsistencia documental, cuentas duplicadas irregulares, uso por terceros o fraude pueden generar descalificación inmediata.",
          ],
        },
        {
          title: "4. Conducta, consistencia e integridad",
          items: [
            "La evaluación exige comportamiento consistente con las reglas de riesgo aplicables y con una expectativa razonable de repetibilidad operativa.",
            "Las estrategias abusivas, explotación de fallos, hedging prohibido, copy trading de terceros, manipulación de latencia o conducta artificial pueden invalidar la evaluación.",
          ],
        },
        {
          title: "5. Tiempo, vencimiento y fallas",
          items: [
            "Cada fase tiene un período operativo, requisito de días mínimos de trading y criterios propios de validación.",
            "Las violaciones de drawdown, vencimientos, infracciones de política o fallas de integridad pueden resultar en fallo, cooldown, rechazo o terminación.",
          ],
        },
        {
          title: "6. Revisión de aprobación",
          items: [
            "El aparente cumplimiento de objetivos está sujeto a revisión interna antes de la aprobación final.",
            "Everwin podrá solicitar documentos, investigar patrones y negar el avance cuando identifique riesgos operativos, de compliance o de integridad.",
          ],
        },
        {
          title: "7. Cambios prospectivos",
          paragraphs: [
            "Las reglas, métricas, requisitos, umbrales y estructuras comerciales pueden actualizarse de forma prospectiva para nuevos pedidos, resets, nuevos ciclos o etapas futuras.",
          ],
        },
      ],
    },
    "prop-plans-fees": {
      title: "Planes Prop y Tarifas",
      updated: UPDATED_AT.es,
      lead: "Tabla consolidada de los planes mostrados actualmente, monedas activas, parámetros operativos estándar y notas comerciales del programa Prop.",
      intro: [
        "Los planes y tarifas pueden variar por idioma, campaña, moneda, landing page y actualizaciones comerciales prospectivas. El checkout vigente al momento de la compra controla ese pedido.",
      ],
      sections: [
        {
          title: "1. Planes del flujo en portugués (BRL)",
          table: tables.brl,
        },
        {
          title: "2. Planes del flujo internacional (USD)",
          table: tables.usd,
        },
        {
          title: "3. Parámetros estándar de evaluación actualmente mostrados",
          table: tables.rules,
        },
        {
          title: "4. Conversión, impuestos y cargos externos",
          items: [
            "Las cuotas, el spread cambiario, los costos bancarios, cargos de tarjeta, remesas y tributos locales pueden afectar el importe efectivamente cobrado al usuario.",
          ],
        },
        {
          title: "5. Promociones y actualización comercial",
          items: [
            "Promociones, descuentos, paquetes, activaciones especiales y cupones pueden tener duración limitada y regirse por sus propias condiciones.",
            "Everwin puede cambiar nombres de planes, precios, beneficios y estructuras de forma prospectiva sin obligación retroactiva.",
          ],
        },
      ],
    },
    "prop-account-access": {
      title: "Política de Acceso y Credenciales Prop",
      updated: UPDATED_AT.es,
      lead: "Cómo se crean, vinculan, protegen y recuperan los accesos al portal Everwin y las credenciales de cuenta relacionadas con el programa Prop.",
      intro: [
        "La jornada Prop puede implicar credenciales del portal Everwin, autenticación por correo u OTP y credenciales operativas separadas para la cuenta de evaluación o la cuenta vinculada.",
      ],
      sections: [
        {
          title: "1. Estructura de credenciales",
          items: [
            "El comprador puede recibir o activar un usuario del portal Everwin para acompañar estados, cuentas y comunicaciones del programa.",
            "Las credenciales operativas de la cuenta de evaluación pueden ser distintas de las del portal y estarán vinculadas al titular elegible.",
          ],
        },
        {
          title: "2. Aprovisionamiento de acceso",
          items: [
            "La creación de acceso depende del pago aprobado, revisión interna, posible conciliación manual y disponibilidad operativa.",
            "Everwin podrá solicitar validación de identidad antes de liberar, restablecer o transferir credenciales.",
          ],
        },
        {
          title: "3. Responsabilidad del usuario",
          items: [
            "El titular debe mantener bajo su control y en confidencialidad las contraseñas, el acceso al correo, los códigos OTP, dispositivos y métodos de autenticación.",
            "El compartir indebidamente, prestar credenciales, permitir uso por terceros o actuar con negligencia de seguridad puede resultar en suspensión o pérdida de elegibilidad.",
          ],
        },
        {
          title: "4. Recuperación, reset y bloqueo",
          items: [
            "Everwin podrá requerir validación adicional antes de un restablecimiento de contraseña, desbloqueo, cambio de correo o recuperación de acceso.",
            "Intentos excesivos, patrones sospechosos, divergencias registrales o uso impropio pueden activar bloqueo temporal o revisión manual.",
          ],
        },
        {
          title: "5. Vínculo entre usuarios y cuentas Prop",
          items: [
            "Una o más cuentas Prop pueden vincularse al mismo usuario elegible, sujetas a reglas comerciales, límites operativos y validación de titularidad.",
            "La compra es personal y queda ligada a los datos reales del comprador salvo aprobación expresa de Everwin después de revisión formal.",
          ],
        },
      ],
    },
    "prop-payout-policy": {
      title: "Política de Payout y Retiro - Programa Prop",
      updated: UPDATED_AT.es,
      lead: "Requisitos de elegibilidad, revisión operativa, validación de titularidad y condiciones de retención/negación aplicables a solicitudes de payout en el programa Prop.",
      intro: [
        "Los payouts en el programa Prop están sujetos a verificación operativa rigurosa, screening de compliance, confirmación de titularidad, cumplimiento integral de políticas Everwin y estándares internacionales AML/KYC. Ningún payout será procesado sin aprobación explícita del equipo de compliance mediante revisión completa de la cuenta.",
      ],
      sections: [
        {
          title: "1. ELEGIBILIDAD OPERATIVA Y COMPLIANCE",
          items: [
            "Solo fases, estructuras y cuentas expresamente autorizadas por la política comercial vigente podrán solicitar payout.",
            "Ganancia aparente, objetivo alcanzado o saldo positivo NO otorgan automáticamente derechos de payout.",
            "Cuentas deben mantener cumplimiento integral de todas las reglas operativas (drawdown, daily loss limit, días mínimos trading) durante toda la vigencia de cuenta.",
            "Cuentas que violaron cualquier regla de riesgo, aún si posteriormente se recuperaron, pueden tener payout suspendido o negado.",
          ],
        },
        {
          title: "2. VALIDACIÓN DE SEGURIDAD Y ACCESO A CUENTA",
          items: [
            "MÚLTIPLOS IPS Y UBICACIONES GEOGRÁFICAS: Accesos simultáneos o secuenciales desde múltiples direcciones IP, especialmente en diferentes países/zonas horarias en ventanas cortas de tiempo, resultarán en DESQUALIFICACIÓN INMEDIATA del programa.",
            "Detección de acceso multi-IP no autorizado sin autenticación 2FA robusta disparará automáticamente suspensión de payout y potencial pérdida total de saldo sin derechos de reembolso.",
            "VPN, Proxy o técnicas de enmascaramiento de IP son estrictamente prohibidas. Su detección constituye violación grave de integridad.",
            "Compartir credenciales de cuenta, incluso entre familiares o entidades corporativas, está prohibido y resulta en exclusión inmediata.",
          ],
        },
        {
          title: "3. DETECCIÓN AUTOMATIZADA Y PROHIBICIÓN DE BOTS",
          items: [
            "La plataforma implementa monitoreo continuo de patrones de comportamiento, velocidad de ejecución y algoritmos de trading.",
            "Bots, scripts automatizados, APIs no autorizadas y estrategias mecanizadas son ESTRICTAMENTE PROHIBIDAS.",
            "Detección de bot resultará en DESQUALIFICACIÓN INMEDIATA, congelamiento de cuenta y pérdida de saldo sin reembolso.",
            "Actividad sospechosa incluye: frecuencia de ejecución inhumana, patrones matemáticos perfectos, ausencia de errores trading normales, ejecución simultánea en múltiples timeframes.",
            "Usuarios son responsables exclusivamente de garantizar que ningún tercero, software o mecanismo autónomo acceda o controle su cuenta.",
          ],
        },
        {
          title: "4. REVISIÓN OPERATIVA PROFUNDA",
          items: [
            "Previo a cualquier aprobación, Everwin ejecutará análisis forense de: consistencia de trading, coherencia de retornos, patrones de comportamiento, historial de riesgo y cumplimiento de reglas operativas.",
            "Resultados concentrados, estadísticamente implausibles o incompatibles con política resultarán en escalamiento a auditoría especializada.",
            "Cuentas con ganancias anormales, drawdowns cero, tasas de acierto anormalmente elevadas u otros indicadores de irregularidad pueden tener payout indefinidamente retenido.",
            "Everwin se reserva derecho de exigir documentación adicional, verificación de terceros o auditoría independiente como condiciones para aprobación de payout.",
          ],
        },
        {
          title: "5. VALIDACION DE TITULARIDAD Y DOCUMENTACION",
          items: [
            "Beneficiario de payout debe corresponder exactamente con datos de identidad verificados durante KYC.",
            "Cualquier discrepancia entre nombre titular de cuenta, documento de identidad y cuenta bancaria receptora resultará en NEGACIÓN DE PAYOUT.",
            "Proof of Funds, verificación de fuente de ingresos y documentación de beneficial ownership pueden ser exigidas, especialmente para montos elevados.",
            "Cuentas con múltiples intentos de payout a diferentes beneficiarios o métodos serán flaggeadas para investigación de fraude.",
          ],
        },
        {
          title: "6. CAUSAS DE RETENCIÓN Y NEGACIÓN PERMANENTE DE PAYOUT",
          paragraphs: [
            "Everwin podrá retener o negar permanentemente payout en caso de:",
          ],
          items: [
            "Fraude, falsificación de identidad, falsificación de documentos o cualquier actividad engañosa.",
            "Violación de política: múltiplos IPs, VPN/Proxy, bots, compartimiento de cuenta, trading no autorizado.",
            "Chargeback, disputa bancaria, reversión de transacción o cualquier transacción contestada.",
            "Actividad sospechosa consistente con lavado de dinero, structuring u otros red flags AML.",
            "Conexión con individuos o entidades en listas de sanción (OFAC, UN, EU, etc.).",
            "Violación legal: uso de materiales prohibidos, trading de instrumentos restringidos o incumplimiento de regulaciones locales.",
            "Falta de respuesta a solicitudes de verificación, exigencias de documentación o comunicación oficial.",
            "Múltiples cuentas bajo mismo usuario, documento o dirección IP siendo investigadas por fraude de programa.",
            "Cualquier patrón de abuso, manipulación de sistema o intento de explotar vulnerabilidades de plataforma.",
          ],
        },
        {
          title: "7. MÉTODOS DE PAGO, MONEDAS Y LÍMITES",
          items: [
            "Payout disponible solo mediante método de pago idéntico al depósito original (ej: tarjeta → tarjeta, cuenta bancaria → cuenta bancaria).",
            "Payouts en cripto/blockchain sujetos a disponibilidad y legislación local del país del usuario.",
            "Límites mínimos y máximos por transacción, ciclo y cuenta establecidos por política vigente.",
            "Payout procesado solo en moneda original de cuenta o moneda local por tasas de cambio de mercado establecidas por banco corresponsal.",
          ],
        },
        {
          title: "8. COSTOS, TASAS E IMPUESTOS",
          items: [
            "Usuario responsable de cualquier tributación aplicable en su jurisdicción (impuesto sobre la renta, impuesto a ganancias, etc.).",
            "Everwin podrá descontar: honorarios administrativos de procesamiento, costos de remesa internacional, spreads cambiarios, cargos bancarios del beneficiario y otros costos operativos.",
            "Payout de bonus, crédito promocional o fuente relacionada puede estar sujeto a diferentes reglas de tributación y retención.",
            "Para jurisdicciones con impuestos de salida, verificación de compliance fiscal obligatoria antes de procesamiento.",
          ],
        },
        {
          title: "9. CRONOGRAMAS DE PROCESAMIENTO Y COMUNICACIÓN",
          items: [
            "Payout aprobado procesado dentro de 5-10 días hábiles, cronograma varía según banco beneficiario.",
            "Everwin NO responsable por atrasos de bancos intermediarios, sistemas de clearing o problemas FX.",
            "Comunicación oficial vía email registrado de cuenta. Usuario responsable de revisar bandeja spam.",
            "Payout reversible si información de beneficiario incorrecta. Usuario asume cualquier cargo de reversión.",
          ],
        },
        {
          title: "10. APELACIONES Y DISPUTAS",
          items: [
            "Negación de payout es decisión final tras análisis de compliance. Apelaciones deben presentarse por escrito con argumento específico.",
            "Evidencia de cumplimiento operativo completo puede ser considerada para reconsideración.",
            "Cualquier disputa de programa Prop regida por arbitraje conforme Términos Generales de Servicio Everwin.",
            "Plazo de apelación: 30 días tras notificación de negación.",
          ],
        },
        {
          title: "11. INTEGRACIÓN CON OTRAS POLÍTICAS",
          paragraphs: [
            "Esta Política de Payout complementa: (a) Política de Evaluación Prop; (b) Política de Planes y Tarifas Prop; (c) Términos de Prop Trading; (d) Política de Acceso a Cuenta Prop; (e) Política General de Retiro. Para conflictos específicos del programa Prop, prevalece esta política.",
          ],
        },
      ],
    },

    "prop-account-access-policy": {
      title: "Política de Acceso a Cuenta, Credenciales e Integridad Prop",
      updated: UPDATED_AT.es,
      lead: "Requisitos obligatorios para acceso seguro a cuenta, uso de credenciales, verificación de identidad y mantenimiento de integridad operativa.",
      intro: [
        "El acceso y operación segura de una cuenta Prop es responsabilidad exclusiva del titular de cuenta. Esta política establece estándares internacionales de seguridad, autenticación y verificación de identidad para proteger tanto al usuario como a la integridad de la plataforma.",
      ],
      sections: [
        {
          title: "1. AUTENTICACIÓN Y CREDENCIALES",
          items: [
            "Usuario es responsable exclusivamente de cualquier actividad realizada bajo sus credenciales.",
            "Contraseñas deben tener mínimo 12 caracteres incluyendo mayúsculas, minúsculas, números y símbolos especiales.",
            "Autenticación de dos factores (2FA) vía aplicativo autenticador (Google Authenticator, Authy) es OBLIGATORIA para cuentas Prop.",
            "SMS 2FA se considera insuficiente. WhatsApp, email o métodos débiles NO son aceptados como segundo factor.",
            "Claves de recuperación (backup codes) deben almacenarse en ubicación segura OFFLINE y NUNCA compartirse.",
          ],
        },
        {
          title: "2. PROHIBICIÓN EXPRESA DE MÚLTIPLES ACCESOS",
          items: [
            "SOLO UNA SESIÓN ACTIVA por cuenta permitida. Login simultáneo desde diferentes IPs será detectado y resultará en logout forzado.",
            "Acceso secuencial desde múltiples IPs (aún si se autentica con 2FA correcto) será flaggeado para verificación de fraude.",
            "Acceso desde país diferente del registro en intervalo menor a 4 horas resultará en congelamiento de cuenta.",
            "Viajes del usuario deben ser reportados proactivamente vía dashboard. Everwin podrá solicitar verificación adicional.",
            "VPN, Proxy, redes onion, Dark Web o técnicas de ocultamiento de IP constituyen violación grave.",
          ],
        },
        {
          title: "3. DETECCIÓN BIOMÉTRICA Y COMPORTAMENTAL",
          items: [
            "Sistema analiza patrones de uso: ubicaciones típicas, horarios, velocidad de digitación, tipo de dispositivo.",
            "Cambios anormales disparan alertas y posible autenticación adicional.",
            "Dispositivos nuevos deben ser verificados vía email/SMS antes de acceso pleno.",
            "Logout automático tras 30 minutos inactividad en ambiente de cuenta activa.",
          ],
        },
        {
          title: "4. PROHIBICIÓN DE COMPARTIR Y CONTROL REMOTO",
          items: [
            "Compartir credenciales de login con cualquier persona (familiar, socio, gestor) es PROHIBIDO.",
            "Uso de software de control remoto (TeamViewer, AnyDesk, Chrome Remote Desktop) para acceder a cuenta es PROHIBIDO y detectable.",
            "Poder de procurador, gestión por tercero o delegación debe formalizarse mediante estructura legal separada, nunca vía compartir credenciales.",
            "Cuentas compartidas serán inmediatamente terminadas y saldo retenido sin reembolso.",
          ],
        },
        {
          title: "5. VERIFICACIÓN CONTINUA DE IDENTIDAD (KYC)",
          items: [
            "Verificación inicial vía documento de identidad válido (pasaporte, cédula nacional, licencia) es obligatoria.",
            "Revalidación de identidad puede ser exigida periódicamente, especialmente para payouts grandes.",
            "Cualquier discrepancia entre datos de registro e identidad verificada resultará en suspensión de cuenta.",
            "Usuario debe mantener documento de identidad válido. Vencimiento resultará en imposibilidad de solicitar payout hasta revalidación.",
          ],
        },
        {
          title: "6. RESPONSABILIDAD POR ACCESO NO AUTORIZADO",
          items: [
            "Everwin NO es responsable por pérdidas resultantes de: (a) Credenciales comprometidas; (b) Falta de 2FA; (c) Software spyware/keylogger en dispositivo del usuario.",
            "Usuario es responsable de mantener su dispositivo seguro, con antivirus actualizado y sistema operativo parcheado.",
            "Notificación de acceso sospechoso debe hacerse INMEDIATAMENTE a support@everwin.trade.",
            "Everwin podrá, a su exclusivo criterio, ajustar saldo en caso de fraude interno comprobado, pero NO está obligada a reembolso.",
          ],
        },
      ],
    },

    "prop-trading-restrictions": {
      title: "Política de Restricciones Operativas y Prohibiciones de Trading Prop",
      updated: UPDATED_AT.es,
      lead: "Instrumentos, estrategias, comportamientos y técnicas prohibidas en programa Prop para proteger integridad operativa y cumplimiento regulatorio.",
      intro: [
        "Para mantener integridad operativa y cumplimiento con regulaciones internacionales, ciertas actividades de trading, instrumentos y estrategias están expresamente prohibidas en cuentas Prop.",
      ],
      sections: [
        {
          title: "1. PROHIBICIÓN DE BOTS, APIS Y AUTOMACIÓN",
          items: [
            "Bots de trading, scripts automatizados, Expert Advisors (EA) y cualquier forma de ejecución mecanizada son PROHIBIDOS.",
            "Integración con APIs no autorizadas, webhooks o señales automatizadas es PROHIBIDA.",
            "Uso de herramientas ejecutando órdenes sin intervención humana real resultará en desqualificación inmediata.",
            "Detección de patrones de ejecución inhumanos (centenas de órdenes por minuto, ejecución simultánea multi-pares, etc.) disparará investigación y posible terminación.",
          ],
        },
        {
          title: "2. ACTIVIDADES PROHIBIDAS DE ALTA FRECUENCIA",
          items: [
            "Scalping extremo (decenas de trades por hora en diferentes pares) puede ser flaggeado como actividad bot.",
            "Colocación de órdenes meramente para manipular spreads, generar latencia u otras técnicas de market-making predatorio.",
            "Layering, spoofing, pump-and-dump o cualquier forma de fraude/manipulación de mercado.",
          ],
        },
        {
          title: "3. INSTRUMENTOS ESPECÍFICOS PROHIBIDOS",
          items: [
            "Índices (S&P 500, DAX, etc.) pueden estar restringidos según versión del programa.",
            "Criptomonedas volátiles o de baja liquidez pueden estar fuera de alcance.",
            "Commodities apalancadas o micro-contratos pueden estar prohibidos.",
            "Instrumentos delisted, vencidos o bajo suspensión regulatoria no pueden ser tradados.",
          ],
        },
        {
          title: "4. RESTRICCIONES DE APALANCAMIENTO Y EXPOSICIÓN",
          items: [
            "Límite máximo de apalancamiento según política: típicamente 1:100 o menor.",
            "Posición exposed overnight puede estar sujeta a márgenes adicionales.",
            "Posiciones dejadas abiertas durante feriados/fines de semana pueden ser automáticamente cerradas.",
            "Exposición en single instrument/pares limitada para garantizar diversificación.",
          ],
        },
      ],
    },

    "prop-purchase-reset-policy": {
      title: "Compras, Resets y Cancelaciones Prop",
      updated: UPDATED_AT.es,
      lead: "Reglas comerciales para compra de evaluaciones, manejo de pedidos duplicados, resets, reactivaciones, cancelaciones y recontratación dentro del programa Prop.",
      intro: [
        "Esta política organiza la lógica comercial aplicable a la compra de evaluaciones Prop y a los mecanismos de continuidad del programa, siempre sujeta a la versión de oferta vigente en la fecha de la solicitud correspondiente.",
      ],
      sections: [
        {
          title: "1. Compras y pedidos duplicados",
          items: [
            "Los pedidos duplicados, intentos repetidos, cobros replicados o compras con indicadores de error pueden pausarse para revisión antes de la entrega.",
            "Everwin podrá unificar, cancelar o ajustar pedidos redundantes cuando sea razonablemente necesario para preservar la integridad financiera y operativa.",
          ],
        },
        {
          title: "2. Aprovisionamiento tras la compra",
          items: [
            "La activación de la evaluación y la entrega de credenciales no son necesariamente instantáneas; pueden depender de aprobación del pago, revisión antifraude y aprovisionamiento interno.",
          ],
        },
        {
          title: "3. Cancelación y revisión de reembolso",
          items: [
            "Los pedidos aún no aprovisionados, bloqueados por un error operativo material o enviados con un error grave podrán revisarse para cancelación conforme a la ley aplicable y a la política comercial vigente.",
            "Tras el aprovisionamiento, uso, entrega de credenciales, inicio de la evaluación o liberación de beneficio operativo, la elegibilidad para cancelación o reembolso puede quedar limitada, reducida o inexistente salvo obligación legal en contrario.",
          ],
        },
        {
          title: "4. Reset, recompra y nuevo intento",
          items: [
            "El reset, la recompra, la reactivación y la nueva contratación dependen de la oferta vigente, las reglas comerciales, el historial del usuario y la elegibilidad operativa.",
            "Everwin no está obligada a conceder un reset en todos los casos, especialmente frente a fraude, reincidencia abusiva, chargeback, infracción grave o uso incompatible con el programa.",
          ],
        },
        {
          title: "5. Cooldown y límites administrativos",
          items: [
            "Pueden aplicarse límites de frecuencia a compras, resets, cuentas activas, recompras por período, reactivaciones y número de cuentas por persona, domicilio o estructura relacionada.",
          ],
        },
        {
          title: "6. Política comercial vigente",
          paragraphs: [
            "Las promociones, descuentos, bonos, reglas de reset y ventanas de recompra se rigen por la política comercial vigente al momento de la solicitud correspondiente.",
          ],
        },
      ],
    },

    "account-closure": {
      title: "Política de Cierre de Cuenta",
      updated: UPDATED_AT.es,
      lead: "Motivos, proceso, consecuencias y derecho de apelación para el cierre definitivo de cuentas en Everwin.",
      intro: [
        "Esta política establece las reglas y procedimientos aplicables al cierre de cuentas en Everwin, ya sea por iniciativa de la plataforma o del cliente, incluyendo motivos, proceso, consecuencias y derecho de apelación.",
      ],
      sections: [
        {
          title: "1. Derecho de Cierre de Cuentas",
          paragraphs: [
            "Everwin se reserva el derecho de cerrar cuentas definitivamente, a su exclusivo criterio, cuando identifique violaciones de los Términos de Uso, políticas aplicables o comportamientos incompatibles con la integridad del ecosistema.",
          ],
          items: [
            "El cierre de cuenta puede ocurrir sin previo aviso en casos de violación grave.",
            "La decisión de cerrar una cuenta es soberana y no está sujeta a contestación más allá del período de apelación de 30 días.",
            "Everwin no será responsable por pérdidas derivadas de cierre legítimo de cuenta.",
          ],
        },
        {
          title: "2. Motivos para Cierre Definitivo",
          items: [
            { label: "Violación de la Regla 10x", text: "Intento o retiro efectivo que exceda el límite de 10x sobre el monto depositado en el mes calendario." },
            { label: "Fraude Comprobado", text: "Uso de identidad falsa, documentos falsificados o cualquier actividad engañosa." },
            { label: "Compartición de Cuenta", text: "Credenciales compartidas con terceros, incluso miembros de la familia o socios." },
            { label: "Uso de Bots/APIs", text: "Uso de automatización, scripts, bots o cualquier forma de ejecución mecanizada no autorizada." },
            { label: "Múltiples Cuentas", text: "Creación de cuentas duplicadas por el mismo titular o grupo de personas." },
            { label: "VPN/Proxy", text: "Uso de técnicas de enmascaramiento de IP o acceso no autorizado desde ubicación diferente." },
            { label: "Violación Operativa", text: "Incumplimiento de drawdown, límite de pérdida diaria, días mínimos u otros parámetros del programa." },
            { label: "Actividad Sospechosa", text: "Patrones inconsistentes con trading legítimo o comportamiento anómalo detectado por el sistema." },
            { label: "Chargeback Abusivo", text: "Disputas bancarias injustificadas o recurrentes." },
            { label: "No Colaboración", text: "Rechazo a proporcionar documentación o responder a solicitudes de compliance." },
            { label: "Orden Judicial", text: "Determinación de autoridad competente para el cierre de cuenta." },
          ],
        },
        {
          title: "3. Regla 10x - Límite de Retiro",
          paragraphs: [
            "Los clientes de Everwin NO pueden realizar retiros que excedan el límite de 10x (diez veces) el monto depositado en el bróker en el mes calendario en curso.",
          ],
          items: [
            "El cálculo es: Límite Mensual = Total de Depósitos en el Mes × 10",
            "La violación de esta regla resulta en bloqueo inmediato de cuenta para investigación.",
            "Tras confirmación de violación, la cuenta será cerrada definitivamente.",
            "No existen excepciones a la regla 10x, excepto orden judicial o error comprobado de Everwin.",
          ],
          note: "Ejemplo: Si el cliente depositó $1.000 en el mes, su límite de retiro es $10.000. Los retiros por encima de este monto serán bloqueados.",
        },
        {
          title: "4. Proceso de Cierre",
          ordered: true,
          items: [
            "Detección de irregularidad por el sistema de monitoreo de Everwin.",
            "Bloqueo temporal de cuenta para investigación y análisis forense.",
            "Análisis completo de patrones de trading, transacciones y cumplimiento.",
            "Notificación al Cliente por correo electrónico con descripción detallada del motivo.",
            "Período de apelación de 30 (treinta) días para contestación.",
            "Análisis de la apelación por el equipo de compliance de Everwin.",
            "Decisión final comunicada al Cliente por correo electrónico.",
            "Cierre definitivo y retención de fondos según política.",
          ],
        },
        {
          title: "5. Consecuencias del Cierre",
          items: [
            "Pérdida de acceso a todos los servicios y funcionalidades de la Plataforma.",
            "Imposibilidad de usar la Plataforma o participar del Programa Prop.",
            "Pérdida de elegibilidad para participación en programas futuros.",
            "Imposibilidad de nuevo registro con los mismos datos (en caso de cierre por violación).",
            "Retención de fondos según política vigente y Términos de Uso.",
            "Pérdida de beneficios, progreso o logros obtenidos en la Plataforma.",
            "Terminación de todas las relaciones contractuales con Everwin.",
          ],
        },
        {
          title: "6. Derecho de Apelación",
          items: [
            "El Cliente podrá presentar apelación dentro de los 30 (treinta) días posteriores a la notificación.",
            "La apelación deberá enviarse por escrito a compliance@everwin.trade.",
            "Deberá contener argumentación específica y documentación de respaldo que demuestre el cumplimiento.",
            "Everwin analizará la apelación dentro de un plazo razonable (hasta 15 días hábiles).",
            "La decisión será comunicada por correo electrónico y será definitiva e internamente inapelable.",
          ],
        },
        {
          title: "7. Cierre por Iniciativa del Cliente",
          items: [
            "El Cliente podrá solicitar el cierre de su cuenta en cualquier momento.",
            "La solicitud deberá realizarse a través del dashboard o correo electrónico a support@everwin.trade.",
            "Antes del cierre, el Cliente deberá retirar eventuales saldos disponibles.",
            "El Cliente deberá verificar si cumple con los requisitos de elegibilidad para retiro.",
            "El cierre será procesado dentro de un plazo razonable tras la confirmación.",
          ],
        },
        {
          title: "8. Referencias del Mercado",
          paragraphs: [
            "Las prácticas de cierre de cuenta de Everwin están en conformidad con estándares del mercado internacional de trading y plataformas financieras.",
          ],
          items: [
            "Binomo: Se reserva el derecho de cerrar cuentas sin previo aviso en caso de violación de políticas.",
            "IQ Option: Ejerce discrecionalidad para definir reglas de cierre según sus términos.",
            "Dukascopy: Puede cerrar cuentas inmediatamente sin previo aviso, según sus Términos de Uso.",
            "Everwin: Adopta prácticas similares, con enfoque en protección del ecosistema y cumplimiento regulatorio.",
          ],
          note: "Everwin opera bajo licencia de Curazao (#365/JAZ) y está en conformidad con regulaciones internacionales de AML/KYC.",
        },
        {
          title: "9. Contacto",
          paragraphs: [
            `Para consultas sobre esta política, contacte a ${SUPPORT_EMAIL}. Para asuntos de compliance y cierre, utilice compliance@everwin.trade.`,
          ],
        },
      ],
    },
  };
}

const LEGAL_PAGES_BY_LANGUAGE: Record<AppLanguage, Record<LegalPageSlug, LegalPolicyPageContent>> = {
  pt: enrichPages("pt", getPortuguesePages()),
  en: enrichPages("en", getEnglishPages()),
  es: enrichPages("es", getSpanishPages()),
};

export function getLegalPolicyContent(language: AppLanguage, slug: LegalPageSlug): LegalPolicyPageContent {
  return LEGAL_PAGES_BY_LANGUAGE[language][slug];
}
