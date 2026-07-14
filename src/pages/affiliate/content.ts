export type AffiliateLanguage = "pt" | "en" | "es";

export type AffiliateStat = {
  value: string;
  label: string;
  note: string;
};

export type AffiliateFeature = {
  title: string;
  description: string;
};

export type AffiliateStep = {
  step: string;
  eyebrow: string;
  title: string;
  description: string;
};

export type AffiliateLevel = {
  name: string;
  commission: string;
  registrations: string;
  ftds: string;
  description: string;
};

export type AffiliateSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  stats?: string[];
  visual: "platform" | "support" | "levels" | "prize" | "summary" | "growth";
};

export type AffiliateContent = {
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    floatingCardTitle: string;
    floatingCardBody: string;
    floatingCardAltTitle: string;
    floatingCardAltBody: string;
    stats: AffiliateStat[];
  };
  overview: {
    eyebrow: string;
    title: string;
    description: string;
    features: AffiliateFeature[];
  };
  steps: {
    titleLine1: string;
    titleLine2: string;
    description: string;
    items: AffiliateStep[];
  };
  commission: {
    eyebrow: string;
    title: string;
    description: string;
    highlights: string[];
    levelsTitle: string;
    levelsDescription: string;
    levels: AffiliateLevel[];
  };
  support: {
    eyebrow: string;
    title: string;
    description: string;
    features: AffiliateFeature[];
  };
  monetization: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
    sideTitle: string;
    sideBody: string;
    prizeTitle: string;
    prizeBody: string;
  };
  executive: {
    eyebrow: string;
    title: string;
    description: string;
    points: string[];
    primaryCta: string;
    secondaryCta: string;
  };
  onboarding: {
    gateTitle: string;
    gateDescription: string;
    gateLabel: string;
    gatePlaceholder: string;
    gateButton: string;
    gateError: string;
    topLabel: string;
    unlockHint: string;
    previous: string;
    next: string;
    finish: string;
    openLanding: string;
    slides: AffiliateSlide[];
  };
};

export function getAffiliateLanguage(language?: string): AffiliateLanguage {
  if (language?.startsWith("pt")) return "pt";
  if (language?.startsWith("es")) return "es";
  return "en";
}

const affiliateContent: Record<AffiliateLanguage, AffiliateContent> = {
  pt: {
    hero: {
      badge: "EverWinTrade Partners",
      titleLine1: "Transforme indicacoes em",
      titleLine2: "uma operacao de crescimento real.",
      description:
        "O programa de afiliados da EverWinTrade foi desenhado para parceiros que querem estrutura, previsibilidade e escala. Em vez de entregar apenas um link, entregamos um ecossistema comercial completo para aquisicao, conversao e monetizacao.",
      primaryCta: "Quero ver a estrutura",
      secondaryCta: "Abrir onboarding",
      floatingCardTitle: "Real RevShare",
      floatingCardBody: "Comeca em 50% e pode chegar a 80% para parceiros Titanium.",
      floatingCardAltTitle: "Monetizacao dupla",
      floatingCardAltBody: "RevShare da corretora + infoprodutos com comissao de ate 60%.",
      stats: [
        { value: "50% -> 80%", label: "Comissao oficial", note: "Progressao baseada em performance e conformidade." },
        { value: "Calls semanais", label: "Acompanhamento", note: "Revisao de campanha, gargalos e proximos passos." },
        { value: "Gerente dedicado", label: "Suporte premium", note: "Disponivel nos niveis avancados da operacao." },
        { value: "US$ 1M+", label: "Big Prize 2026", note: "Marco oficial com Dubai, Rolex Datejust e reconhecimento institucional." },
      ],
    },
    overview: {
      eyebrow: "Visao Geral",
      title: "Mais do que um programa de afiliados: uma estrutura para construir um canal previsivel.",
      description:
        "A proposta da EverWinTrade combina operacao comercial, suporte estrategico e tecnologia propria para formar parceiros duradouros. O foco e ajudar o afiliado a crescer com controle, leitura de dados e monetizacao escalavel.",
      features: [
        {
          title: "Transparencia por dashboard proprietario",
          description: "Cadastros, FTDs, comissoes, pagamentos e performance ficam visiveis em tempo real.",
        },
        {
          title: "Gerente de afiliados e calls semanais",
          description: "Acompanhamento recorrente para discutir trafego, funil, conversao, retencao e metas.",
        },
        {
          title: "Kit de marketing e conversao",
          description: "Criativos, roteiros, scripts, argumentos comerciais e ativos para acelerar execucao.",
        },
        {
          title: "Tecnologia, lives e monetizacao complementar",
          description: "Infraestrutura para apresentacoes ao vivo, comunidades, educacao e oferta de infoprodutos.",
        },
      ],
    },
    steps: {
      titleLine1: "Como a operacao",
      titleLine2: "evolui dentro do programa",
      description:
        "A progressao acontece por resultado real. O afiliado entra, valida aquisicao, melhora funil e escala com apoio proximo da EverWinTrade.",
      items: [
        {
          step: "1",
          eyebrow: "Entrada oficial",
          title: "Comece com tracking, materiais e estrutura de validacao.",
          description:
            "O parceiro entra no ecossistema com links oficiais, suporte operacional e base suficiente para testar oferta, narrativa e audiencia.",
        },
        {
          step: "2",
          eyebrow: "Performance medida",
          title: "Suba de nivel com cadastros, FTDs e qualidade operacional.",
          description:
            "A evolucao nao depende apenas de volume bruto. Conversao, retencao, conformidade e estabilidade da operacao pesam na leitura.",
        },
        {
          step: "3",
          eyebrow: "Escala guiada",
          title: "Use gerente, calls, trafego e materiais para expandir.",
          description:
            "Nos niveis avancados, a EverWinTrade entra com apoio mais proximo para aquisicao, criativos, scripts, lives e estrutura comercial.",
        },
      ],
    },
    commission: {
      eyebrow: "Comissao e Niveis",
      title: "Real RevShare com progressao oficial de 50% ate 80%.",
      description:
        "A comissao acima de 50% nao e automatica. Ela e conquistada com base em resultado sustentavel, cadastros qualificados, FTDs recorrentes, retencao e aderencia integral as regras do programa.",
      highlights: [
        "cadastros qualificados",
        "FTDs recorrentes",
        "boa conversao",
        "retencao de base",
        "qualidade do trafego",
        "compliance e integridade operacional",
      ],
      levelsTitle: "Tabela oficial de niveis",
      levelsDescription:
        "Os niveis resumem o crescimento mensal por cadastros e FTDs, sempre acompanhados de avaliacao qualitativa da operacao.",
      levels: [
        {
          name: "N1 - Starter Affiliate",
          commission: "50%",
          registrations: "0-49",
          ftds: "0-9",
          description: "Fase de validacao, primeiros testes de conteudo, canais e funis.",
        },
        {
          name: "N2 - Advanced Affiliate",
          commission: "52,5%",
          registrations: "50-149",
          ftds: "10-24",
          description: "Canal validado com sinais iniciais de consistencia e repeticao.",
        },
        {
          name: "N3 - Gold Affiliate",
          commission: "55%",
          registrations: "150-399",
          ftds: "25-59",
          description: "Operacao funcional, base ativa de leads e claro potencial de escala.",
        },
        {
          name: "N4 - Platinum Affiliate",
          commission: "60%",
          registrations: "400-799",
          ftds: "60-149",
          description: "Estrutura consolidada, volume recorrente e caminho real para alta escala.",
        },
        {
          name: "N5 - Diamond Affiliate",
          commission: "65%",
          registrations: "800-1.999",
          ftds: "150-399",
          description: "Alta performance com previsibilidade comercial e forte presenca em aquisicao.",
        },
        {
          name: "N6 - Titanium Affiliate",
          commission: "ate 80%",
          registrations: "5.000+",
          ftds: "2.000+",
          description: "Parceiro de elite, operacao de massa e impacto estrategico dentro do ecossistema.",
        },
      ],
    },
    support: {
      eyebrow: "Suporte e Crescimento",
      title: "Gerentes, calls, trafego e leitura de dados para acelerar a operacao.",
      description:
        "O suporte da EverWinTrade nao e decorativo. O gerente acompanha gargalos, orienta estrategia, ajuda na estrutura comercial e conecta o afiliado ao que faz sentido para o proximo nivel.",
      features: [
        {
          title: "Calls semanais de performance",
          description: "Revisao de metricas, campanhas, gargalos operacionais e correcoes rapidas de rota.",
        },
        {
          title: "Acompanhamento individualizado",
          description: "Suporte proximo para funis, trafego, scripts, retencao, escala e posicionamento.",
        },
        {
          title: "Apoio tatico em crescimento",
          description: "Orientacao de campanhas, melhoria de criativos, taxa de conversao e planejamento de expansao.",
        },
        {
          title: "Seguranca operacional",
          description: "Pagamentos automatizados, compliance, transparencia total e regras claras para o ecossistema.",
        },
      ],
    },
    monetization: {
      eyebrow: "Monetizacao e Premio",
      title: "Uma operacao multifonte com recorrencia, escala e um marco oficial de reconhecimento.",
      description:
        "Ao combinar RevShare recorrente, infoprodutos e ativos proprietarios de conversao, o parceiro constrói uma receita mais robusta e ainda tem um marco claro de alta performance dentro do programa.",
      bullets: [
        "revshare recorrente com base ativa e retencao",
        "infoprodutos com comissao de ate 60%",
        "materiais premium, scripts e ativos de conversao",
        "tecnologia propria para lives, comunidade e aquisicao",
        "apoio estrutural para trafego, performance e expansao",
        "premiacao oficial para quem cruza US$ 1M+ em comissoes elegiveis",
      ],
      sideTitle: "Big Prize 2026",
      sideBody:
        "Ao ultrapassar US$ 1.000.000 em comissoes no periodo elegivel, o parceiro recebe viagem oficial para Dubai, Rolex Datejust e reconhecimento institucional dentro do programa. Nao e sorteio nem competicao: e um marco objetivo de performance.",
      prizeTitle: "Reconhecimento concreto para quem escala com consistencia.",
      prizeBody: "A EverWinTrade transforma o premio em uma narrativa de posicionamento: crescimento sustentavel, integridade operacional e relevancia comercial reconhecida publicamente.",
    },
    executive: {
      eyebrow: "Resumo Executivo",
      title: "Estrutura, suporte, tecnologia e caminho real de escala para parceiros serios.",
      description:
        "A EverWinTrade foi desenhada para afiliados que querem crescer com clareza. Quem entrega resultado real, consistencia e conformidade encontra aqui um programa com estrutura para escalar junto.",
      points: [
        "Real RevShare escalavel de 50% ate 80%",
        "progressao por cadastros, FTDs e qualidade da operacao",
        "gerentes de afiliados e calls semanais de performance",
        "dashboard proprietario com metricas e pagamentos",
        "scripts, criativos, materiais e tecnologia de lives",
        "monetizacao complementar e premiacoes concretas",
      ],
      primaryCta: "Criar conta",
      secondaryCta: "Apresentar onboarding",
    },
    onboarding: {
      gateTitle: "Onboarding EverWinTrade Partners",
      gateDescription:
        "Area protegida para apresentacao comercial dos gerentes. Entre com a senha para iniciar o modo de slides.",
      gateLabel: "Senha de acesso",
      gatePlaceholder: "Digite a senha do onboarding",
      gateButton: "Liberar apresentacao",
      gateError: "Senha incorreta. Tente novamente.",
      topLabel: "Modo apresentacao",
      unlockHint: "Use as setas do teclado para navegar pelos slides.",
      previous: "Anterior",
      next: "Proximo",
      finish: "Concluir",
      openLanding: "Abrir landing",
      slides: [
        {
          id: "vision",
          eyebrow: "Slide 01",
          title: "EverWinTrade Partners e a estrutura oficial para transformar afiliados em operacoes de crescimento.",
          description:
            "Nao entregamos apenas um link. Entregamos uma base comercial com suporte, tecnologia, acompanhamento e monetizacao escalavel.",
          bullets: [
            "Real RevShare com progressao oficial",
            "dashboard com metricas e pagamentos",
            "gerente de afiliados e calls semanais",
            "suporte estrategico para trafego e conversao",
          ],
          stats: ["50% -> 80%", "ate 60% em infoprodutos"],
          visual: "platform",
        },
        {
          id: "growth",
          eyebrow: "Slide 02",
          title: "A progressao dentro do programa e guiada por performance real.",
          description:
            "Cadastros e FTDs sao importantes, mas qualidade do trafego, retencao, estabilidade operacional e conformidade tambem pesam na leitura.",
          bullets: [
            "validacao inicial com estrutura pronta",
            "crescimento medido por cadastros + FTDs",
            "revisao qualitativa da operacao",
            "subida de nivel acompanhada por suporte crescente",
          ],
          stats: ["6 niveis oficiais", "analise quantitativa + qualitativa"],
          visual: "growth",
        },
        {
          id: "levels",
          eyebrow: "Slide 03",
          title: "O modelo comercial recompensa consistencia com uma progressao clara.",
          description:
            "O parceiro entra em 50% de Real RevShare e avanca conforme constrói uma operacao mais previsivel e saudavel.",
          bullets: [
            "Starter 50%",
            "Gold 55%",
            "Platinum 60%",
            "Diamond 65%",
            "Titanium ate 80%",
          ],
          stats: ["0-49 cadastros ate 5.000+", "0-9 FTDs ate 2.000+"],
          visual: "levels",
        },
        {
          id: "support",
          eyebrow: "Slide 04",
          title: "O suporte da EverWinTrade entra na operacao para acelerar resultado.",
          description:
            "Gerentes, calls, materiais, scripts e apoio em trafego ajudam o afiliado a reduzir tentativa e erro e crescer com mais clareza.",
          bullets: [
            "gerente de afiliados dedicado",
            "calls semanais de performance",
            "apoio consultivo em trafego e criativos",
            "analise de funil, scripts e conversao",
          ],
          stats: ["suporte proativo", "monitoramento recorrente"],
          visual: "support",
        },
        {
          id: "prize",
          eyebrow: "Slide 05",
          title: "A operacao escala com recorrencia e fecha o ciclo com um marco oficial de reconhecimento.",
          description:
            "RevShare recorrente, infoprodutos, ativos premium e um premio objetivo para quem ultrapassa US$ 1.000.000 em comissoes elegiveis.",
          bullets: [
            "infoprodutos com comissao de ate 60%",
            "tecnologia para lives, comunidade e aquisicao",
            "materiais premium para campanha e conversao",
            "Dubai + Rolex Datejust como marco oficial do Big Prize 2026",
          ],
          stats: ["US$ 1M+ em comissoes elegiveis", "premiacao oficial para todo parceiro que cruzar a meta"],
          visual: "prize",
        },
        {
          id: "close",
          eyebrow: "Slide 06",
          title: "Quem constroi resultado real, cresce com a EverWinTrade.",
          description:
            "A proposta e simples: sair do modelo de indicacoes pontuais e construir uma operacao seria, profissional e duradoura.",
          bullets: [
            "comissionamento forte e progressao oficial",
            "suporte, tecnologia e transparencia",
            "acompanhamento gerencial e materiais prontos",
            "seguranca operacional e premiacoes reais",
          ],
          stats: ["estrutura para escala", "programa desenhado para parceiros serios"],
          visual: "summary",
        },
      ],
    },
  },
  en: {
    hero: {
      badge: "EverWinTrade Partners",
      titleLine1: "Turn referrals into",
      titleLine2: "a real growth operation.",
      description:
        "EverWinTrade was built for partners who want structure, predictability, and scale. Instead of handing over only a link, we deliver a full commercial ecosystem for acquisition, conversion, and monetization.",
      primaryCta: "See the structure",
      secondaryCta: "Open onboarding",
      floatingCardTitle: "Real RevShare",
      floatingCardBody: "Starts at 50% and can reach 80% for Titanium partners.",
      floatingCardAltTitle: "Dual monetization",
      floatingCardAltBody: "Broker RevShare plus info-product commissions up to 60%.",
      stats: [
        { value: "50% -> 80%", label: "Official commission", note: "Progression driven by performance and compliance." },
        { value: "Weekly calls", label: "Follow-up", note: "Campaign review, bottlenecks, and next moves." },
        { value: "Dedicated manager", label: "Premium support", note: "Available for advanced operating levels." },
        { value: "US$ 1M+", label: "Big Prize 2026", note: "Official milestone with Dubai, Rolex Datejust, and institutional recognition." },
      ],
    },
    overview: {
      eyebrow: "Overview",
      title: "More than an affiliate program: a structure to build a predictable channel.",
      description:
        "EverWinTrade combines commercial operations, strategic support, and native technology to create long-term partners. The focus is helping affiliates grow with data visibility, control, and scalable monetization.",
      features: [
        {
          title: "Transparency through a proprietary dashboard",
          description: "Registrations, FTDs, commissions, payments, and performance stay visible in real time.",
        },
        {
          title: "Affiliate manager and weekly calls",
          description: "Recurring follow-up to discuss traffic, funnel, conversion, retention, and targets.",
        },
        {
          title: "Marketing and conversion toolkit",
          description: "Creatives, scripts, sales arguments, and assets to accelerate execution.",
        },
        {
          title: "Technology, live sessions, and extra monetization",
          description: "Infrastructure for live education, communities, and info-product offers.",
        },
      ],
    },
    steps: {
      titleLine1: "How the operation",
      titleLine2: "evolves inside the program",
      description:
        "Progression happens through real results. The affiliate joins, validates acquisition, improves the funnel, and scales with close support from EverWinTrade.",
      items: [
        {
          step: "1",
          eyebrow: "Official entry",
          title: "Start with tracking, materials, and a validation structure.",
          description:
            "The partner joins the ecosystem with official links, operational support, and enough structure to test the offer, narrative, and audience.",
        },
        {
          step: "2",
          eyebrow: "Measured performance",
          title: "Move up through registrations, FTDs, and operational quality.",
          description:
            "Progression does not depend on raw volume alone. Conversion, retention, compliance, and operational stability all matter.",
        },
        {
          step: "3",
          eyebrow: "Guided scale",
          title: "Use manager support, calls, traffic, and materials to expand.",
          description:
            "At advanced levels, EverWinTrade gets closer to support acquisition, creatives, scripts, live sessions, and commercial structure.",
        },
      ],
    },
    commission: {
      eyebrow: "Commission and Levels",
      title: "Real RevShare with an official progression from 50% to 80%.",
      description:
        "Anything above 50% is not automatic. It is earned through sustainable performance, qualified registrations, recurring FTDs, retention, and full compliance with the program rules.",
      highlights: [
        "qualified registrations",
        "recurring FTDs",
        "strong conversion",
        "base retention",
        "traffic quality",
        "compliance and operational integrity",
      ],
      levelsTitle: "Official level matrix",
      levelsDescription:
        "Each level summarizes monthly growth by registrations and FTDs, always combined with a qualitative review of the operation.",
      levels: [
        { name: "N1 - Starter Affiliate", commission: "50%", registrations: "0-49", ftds: "0-9", description: "Validation stage for content, channels, and early funnels." },
        { name: "N2 - Advanced Affiliate", commission: "52.5%", registrations: "50-149", ftds: "10-24", description: "A validated channel with early signs of consistency." },
        { name: "N3 - Gold Affiliate", commission: "55%", registrations: "150-399", ftds: "25-59", description: "Functional operation, active lead base, and clear scale potential." },
        { name: "N4 - Platinum Affiliate", commission: "60%", registrations: "400-799", ftds: "60-149", description: "Structured operation, recurring volume, and a real path to scale." },
        { name: "N5 - Diamond Affiliate", commission: "65%", registrations: "800-1,999", ftds: "150-399", description: "High performance with predictable acquisition results." },
        { name: "N6 - Titanium Affiliate", commission: "up to 80%", registrations: "5,000+", ftds: "2,000+", description: "Elite partner, massive scale, and strategic impact in the ecosystem." },
      ],
    },
    support: {
      eyebrow: "Support and Growth",
      title: "Managers, calls, traffic support, and data visibility to accelerate the operation.",
      description:
        "EverWinTrade support is not decorative. The manager tracks bottlenecks, guides strategy, helps shape the commercial structure, and connects the affiliate to the right next step.",
      features: [
        { title: "Weekly performance calls", description: "Campaign review, operational bottlenecks, metrics, and fast route corrections." },
        { title: "Individual follow-up", description: "Hands-on support for funnels, traffic, scripts, retention, scale, and positioning." },
        { title: "Tactical growth support", description: "Campaign guidance, creative improvement, conversion rate optimization, and expansion planning." },
        { title: "Operational safety", description: "Automated payments, compliance, full visibility, and clear ecosystem rules." },
      ],
    },
    monetization: {
      eyebrow: "Monetization and Prize",
      title: "A multi-source operation with recurring revenue, scale, and an official performance milestone.",
      description:
        "By combining recurring RevShare, info-products, and proprietary conversion assets, the partner builds a stronger revenue base and a clear high-performance milestone inside the program.",
      bullets: [
        "recurring RevShare backed by an active retained base",
        "info-products with commissions up to 60%",
        "premium materials, scripts, and conversion assets",
        "native technology for live sessions, communities, and acquisition",
        "structural support for traffic, performance, and expansion",
        "official reward for partners who cross US$ 1M+ in eligible commissions",
      ],
      sideTitle: "Big Prize 2026",
      sideBody:
        "Once an affiliate exceeds US$ 1,000,000 in eligible commissions, they receive an official Dubai trip, a Rolex Datejust, and institutional recognition inside the program. It is not a contest: it is a defined performance milestone.",
      prizeTitle: "Concrete recognition for partners who scale with consistency.",
      prizeBody: "EverWinTrade turns the prize into a positioning story: sustainable growth, operational integrity, and commercial relevance recognized in a visible way.",
    },
    executive: {
      eyebrow: "Executive Summary",
      title: "Structure, support, technology, and a real path to scale for serious partners.",
      description:
        "EverWinTrade was designed for affiliates who want clarity and structure while they grow. Partners who deliver real results, consistency, and compliance find an ecosystem ready to scale with them.",
      points: [
        "Real RevShare from 50% up to 80%",
        "progression driven by registrations, FTDs, and operating quality",
        "affiliate managers and weekly performance calls",
        "proprietary dashboard with metrics and payments",
        "scripts, creatives, materials, and live-session technology",
        "complementary monetization and concrete rewards",
      ],
      primaryCta: "Create account",
      secondaryCta: "Present onboarding",
    },
    onboarding: {
      gateTitle: "EverWinTrade Partners Onboarding",
      gateDescription:
        "Protected manager area for commercial presentation mode. Enter the password to unlock the slide deck.",
      gateLabel: "Access password",
      gatePlaceholder: "Enter the onboarding password",
      gateButton: "Unlock presentation",
      gateError: "Incorrect password. Please try again.",
      topLabel: "Presentation mode",
      unlockHint: "Use your keyboard arrows to move between slides.",
      previous: "Previous",
      next: "Next",
      finish: "Finish",
      openLanding: "Open landing",
      slides: [
        {
          id: "vision",
          eyebrow: "Slide 01",
          title: "EverWinTrade Partners is the official structure that turns affiliates into growth operations.",
          description:
            "We do not deliver only a link. We deliver a commercial system with support, technology, follow-up, and scalable monetization.",
          bullets: [
            "Real RevShare with official progression",
            "dashboard with metrics and payments",
            "affiliate manager and weekly calls",
            "strategic support for traffic and conversion",
          ],
          stats: ["50% -> 80%", "up to 60% from info-products"],
          visual: "platform",
        },
        {
          id: "growth",
          eyebrow: "Slide 02",
          title: "Progression inside the program is driven by real performance.",
          description:
            "Registrations and FTDs matter, but traffic quality, retention, operational stability, and compliance also shape the decision.",
          bullets: [
            "official entry with structure and assets",
            "growth measured by registrations + FTDs",
            "qualitative review of the operation",
            "higher levels unlock stronger support",
          ],
          stats: ["6 official levels", "quantitative + qualitative analysis"],
          visual: "growth",
        },
        {
          id: "levels",
          eyebrow: "Slide 03",
          title: "The commercial model rewards consistency with a clear progression.",
          description:
            "The partner starts at 50% Real RevShare and advances as the operation becomes more predictable and healthier.",
          bullets: ["Starter 50%", "Gold 55%", "Platinum 60%", "Diamond 65%", "Titanium up to 80%"],
          stats: ["0-49 registrations to 5,000+", "0-9 FTDs to 2,000+"],
          visual: "levels",
        },
        {
          id: "support",
          eyebrow: "Slide 04",
          title: "EverWinTrade support steps into the operation to accelerate results.",
          description:
            "Managers, calls, materials, scripts, and traffic guidance help the affiliate reduce trial-and-error and grow with more clarity.",
          bullets: [
            "dedicated affiliate manager",
            "weekly performance calls",
            "traffic and creative support",
            "funnel, script, and conversion guidance",
          ],
          stats: ["proactive support", "recurring monitoring"],
          visual: "support",
        },
        {
          id: "prize",
          eyebrow: "Slide 05",
          title: "The operation scales with recurring monetization and closes the cycle with an official performance milestone.",
          description:
            "Recurring RevShare, info-products, premium assets, and an objective reward for partners who exceed US$ 1,000,000 in eligible commissions.",
          bullets: [
            "info-products with commissions up to 60%",
            "technology for live sessions, communities, and acquisition",
            "premium campaign and conversion assets",
            "Dubai + Rolex Datejust as the official Big Prize 2026 milestone",
          ],
          stats: ["US$ 1M+ in eligible commissions", "official reward package for every partner who crosses the goal"],
          visual: "prize",
        },
        {
          id: "close",
          eyebrow: "Slide 06",
          title: "Partners who build real results grow with EverWinTrade.",
          description:
            "The proposal is simple: move beyond isolated referrals and build a serious, professional, long-term operation.",
          bullets: [
            "strong commission and official progression",
            "support, technology, and transparency",
            "managerial follow-up and ready-to-use assets",
            "operational safety and real rewards",
          ],
          stats: ["structure for scale", "built for serious partners"],
          visual: "summary",
        },
      ],
    },
  },
  es: {
    hero: {
      badge: "EverWinTrade Partners",
      titleLine1: "Convierta referencias en",
      titleLine2: "una operacion real de crecimiento.",
      description:
        "EverWinTrade fue creado para socios que quieren estructura, previsibilidad y escala. En lugar de entregar solo un link, entregamos un ecosistema comercial completo para adquisicion, conversion y monetizacion.",
      primaryCta: "Ver la estructura",
      secondaryCta: "Abrir onboarding",
      floatingCardTitle: "Real RevShare",
      floatingCardBody: "Comienza en 50% y puede llegar a 80% para socios Titanium.",
      floatingCardAltTitle: "Monetizacion dual",
      floatingCardAltBody: "RevShare de la corredora mas infoproductos con hasta 60% de comision.",
      stats: [
        { value: "50% -> 80%", label: "Comision oficial", note: "Progresion guiada por performance y compliance." },
        { value: "Calls semanales", label: "Acompanamiento", note: "Revision de campanas, cuellos de botella y proximos pasos." },
        { value: "Manager dedicado", label: "Soporte premium", note: "Disponible para niveles avanzados de operacion." },
        { value: "US$ 1M+", label: "Big Prize 2026", note: "Hito oficial con Dubai, Rolex Datejust y reconocimiento institucional." },
      ],
    },
    overview: {
      eyebrow: "Vision General",
      title: "Mas que un programa de afiliados: una estructura para construir un canal previsible.",
      description:
        "EverWinTrade combina operacion comercial, soporte estrategico y tecnologia propia para crear socios de largo plazo. El foco es crecer con lectura de datos, control y monetizacion escalable.",
      features: [
        {
          title: "Transparencia con dashboard propietario",
          description: "Registros, FTDs, comisiones, pagos y performance visibles en tiempo real.",
        },
        {
          title: "Affiliate manager y calls semanales",
          description: "Seguimiento recurrente para trafico, funnel, conversion, retencion y metas.",
        },
        {
          title: "Kit de marketing y conversion",
          description: "Creativos, scripts, argumentos comerciales y activos para acelerar la ejecucion.",
        },
        {
          title: "Tecnologia, lives y monetizacion extra",
          description: "Infraestructura para educacion en vivo, comunidades e infoproductos.",
        },
      ],
    },
    steps: {
      titleLine1: "Como evoluciona",
      titleLine2: "la operacion dentro del programa",
      description:
        "La progresion ocurre por resultado real. El afiliado entra, valida adquisicion, mejora su funnel y escala con soporte cercano de EverWinTrade.",
      items: [
        {
          step: "1",
          eyebrow: "Entrada oficial",
          title: "Comience con tracking, materiales y estructura de validacion.",
          description:
            "El socio entra al ecosistema con links oficiales, soporte operativo y base suficiente para probar oferta, narrativa y audiencia.",
        },
        {
          step: "2",
          eyebrow: "Performance medida",
          title: "Suba por registros, FTDs y calidad operativa.",
          description:
            "La progresion no depende solo del volumen bruto. Conversion, retencion, compliance y estabilidad importan.",
        },
        {
          step: "3",
          eyebrow: "Escala guiada",
          title: "Use manager, calls, trafico y materiales para expandir.",
          description:
            "En niveles avanzados, EverWinTrade se acerca mas para apoyar adquisicion, creativos, scripts, lives y estructura comercial.",
        },
      ],
    },
    commission: {
      eyebrow: "Comision y Niveles",
      title: "Real RevShare con progresion oficial de 50% hasta 80%.",
      description:
        "Todo lo que esta por encima de 50% no es automatico. Se conquista por performance sostenible, registros calificados, FTDs recurrentes, retencion y cumplimiento total de las reglas.",
      highlights: [
        "registros calificados",
        "FTDs recurrentes",
        "buena conversion",
        "retencion de base",
        "calidad del trafico",
        "compliance e integridad operativa",
      ],
      levelsTitle: "Tabla oficial de niveles",
      levelsDescription:
        "Cada nivel resume crecimiento mensual por registros y FTDs, siempre combinado con revision cualitativa de la operacion.",
      levels: [
        { name: "N1 - Starter Affiliate", commission: "50%", registrations: "0-49", ftds: "0-9", description: "Fase de validacion para contenido, canales y primeros funnels." },
        { name: "N2 - Advanced Affiliate", commission: "52,5%", registrations: "50-149", ftds: "10-24", description: "Canal validado con senales iniciales de consistencia." },
        { name: "N3 - Gold Affiliate", commission: "55%", registrations: "150-399", ftds: "25-59", description: "Operacion funcional, base activa de leads y potencial de escala." },
        { name: "N4 - Platinum Affiliate", commission: "60%", registrations: "400-799", ftds: "60-149", description: "Operacion estructurada, volumen recurrente y camino real a la escala." },
        { name: "N5 - Diamond Affiliate", commission: "65%", registrations: "800-1.999", ftds: "150-399", description: "Alta performance con resultados previsibles en adquisicion." },
        { name: "N6 - Titanium Affiliate", commission: "hasta 80%", registrations: "5.000+", ftds: "2.000+", description: "Socio elite, operacion masiva e impacto estrategico en el ecosistema." },
      ],
    },
    support: {
      eyebrow: "Soporte y Crecimiento",
      title: "Managers, calls, trafico y lectura de datos para acelerar la operacion.",
      description:
        "El soporte de EverWinTrade no es decorativo. El manager acompana cuellos de botella, orienta estrategia y ayuda a organizar la estructura comercial del afiliado.",
      features: [
        { title: "Calls semanales de performance", description: "Revision de campanas, metricas, cuellos de botella y ajustes rapidos de ruta." },
        { title: "Acompanamiento individual", description: "Soporte cercano para funnels, trafico, scripts, retencion, escala y posicionamiento." },
        { title: "Apoyo tactico en crecimiento", description: "Orientacion de campanas, mejora de creativos, conversion y expansion." },
        { title: "Seguridad operativa", description: "Pagos automatizados, compliance, visibilidad total y reglas claras del ecosistema." },
      ],
    },
    monetization: {
      eyebrow: "Monetizacion y Premio",
      title: "Una operacion multifuente con recurrencia, escala y un hito oficial de reconocimiento.",
      description:
        "Al combinar RevShare recurrente, infoproductos y activos propietarios de conversion, el socio construye una base de ingresos mas robusta y un hito claro de alta performance dentro del programa.",
      bullets: [
        "RevShare recurrente respaldado por una base activa y retenida",
        "infoproductos con comision de hasta 60%",
        "materiales premium, scripts y activos de conversion",
        "tecnologia propia para lives, comunidad y adquisicion",
        "apoyo estructural para trafico, performance y expansion",
        "premiacion oficial para quien supere US$ 1M+ en comisiones elegibles",
      ],
      sideTitle: "Big Prize 2026",
      sideBody:
        "Al superar US$ 1.000.000 en comisiones durante el periodo elegible, el socio recibe viaje oficial a Dubai, Rolex Datejust y reconocimiento institucional dentro del programa. No es competencia: es un hito objetivo de performance.",
      prizeTitle: "Reconocimiento concreto para quien escala con consistencia.",
      prizeBody: "EverWinTrade convierte el premio en una narrativa de posicionamiento: crecimiento sostenible, integridad operativa y relevancia comercial reconocida de forma visible.",
    },
    executive: {
      eyebrow: "Resumen Ejecutivo",
      title: "Estructura, soporte, tecnologia y camino real de escala para socios serios.",
      description:
        "EverWinTrade fue disenado para afiliados que quieren crecer con claridad. Los socios que entregan resultados reales, consistencia y conformidad encuentran un ecosistema listo para escalar con ellos.",
      points: [
        "Real RevShare de 50% hasta 80%",
        "progresion basada en registros, FTDs y calidad operativa",
        "affiliate managers y calls semanales de performance",
        "dashboard propietario con metricas y pagos",
        "scripts, creativos, materiales y tecnologia para lives",
        "monetizacion complementaria y premios concretos",
      ],
      primaryCta: "Crear cuenta",
      secondaryCta: "Presentar onboarding",
    },
    onboarding: {
      gateTitle: "Onboarding EverWinTrade Partners",
      gateDescription:
        "Area protegida para presentacion comercial de los gerentes. Ingrese la contrasena para desbloquear el modo slides.",
      gateLabel: "Contrasena de acceso",
      gatePlaceholder: "Digite la contrasena del onboarding",
      gateButton: "Desbloquear presentacion",
      gateError: "Contrasena incorrecta. Intente nuevamente.",
      topLabel: "Modo presentacion",
      unlockHint: "Use las flechas del teclado para navegar entre slides.",
      previous: "Anterior",
      next: "Siguiente",
      finish: "Finalizar",
      openLanding: "Abrir landing",
      slides: [
        {
          id: "vision",
          eyebrow: "Slide 01",
          title: "EverWinTrade Partners es la estructura oficial que convierte afiliados en operaciones de crecimiento.",
          description:
            "No entregamos solo un link. Entregamos un sistema comercial con soporte, tecnologia, seguimiento y monetizacion escalable.",
          bullets: [
            "Real RevShare con progresion oficial",
            "dashboard con metricas y pagos",
            "affiliate manager y calls semanales",
            "soporte estrategico para trafico y conversion",
          ],
          stats: ["50% -> 80%", "hasta 60% en infoproductos"],
          visual: "platform",
        },
        {
          id: "growth",
          eyebrow: "Slide 02",
          title: "La progresion dentro del programa se guia por performance real.",
          description:
            "Registros y FTDs importan, pero tambien pesan la calidad del trafico, la retencion, la estabilidad y el compliance.",
          bullets: [
            "entrada oficial con estructura y activos",
            "crecimiento medido por registros + FTDs",
            "revision cualitativa de la operacion",
            "niveles mas altos liberan mas soporte",
          ],
          stats: ["6 niveles oficiales", "analisis cuantitativo + cualitativo"],
          visual: "growth",
        },
        {
          id: "levels",
          eyebrow: "Slide 03",
          title: "El modelo comercial recompensa consistencia con una progresion clara.",
          description:
            "El socio comienza en 50% de Real RevShare y avanza a medida que la operacion se vuelve mas previsible y saludable.",
          bullets: ["Starter 50%", "Gold 55%", "Platinum 60%", "Diamond 65%", "Titanium hasta 80%"],
          stats: ["0-49 registros hasta 5.000+", "0-9 FTDs hasta 2.000+"],
          visual: "levels",
        },
        {
          id: "support",
          eyebrow: "Slide 04",
          title: "El soporte de EverWinTrade entra en la operacion para acelerar resultados.",
          description:
            "Managers, calls, materiales, scripts y orientacion de trafico ayudan al afiliado a reducir prueba y error.",
          bullets: [
            "affiliate manager dedicado",
            "calls semanales de performance",
            "soporte de trafico y creativos",
            "orientacion de funnel, scripts y conversion",
          ],
          stats: ["soporte proactivo", "seguimiento recurrente"],
          visual: "support",
        },
        {
          id: "prize",
          eyebrow: "Slide 05",
          title: "La operacion escala con recurrencia y cierra el ciclo con un hito oficial de reconocimiento.",
          description:
            "RevShare recurrente, infoproductos, activos premium y un premio objetivo para quienes superan US$ 1.000.000 en comisiones elegibles.",
          bullets: [
            "infoproductos con comision de hasta 60%",
            "tecnologia para lives, comunidad y adquisicion",
            "materiales premium para campana y conversion",
            "Dubai + Rolex Datejust como hito oficial del Big Prize 2026",
          ],
          stats: ["US$ 1M+ en comisiones elegibles", "premiacion oficial para cada socio que cruce la meta"],
          visual: "prize",
        },
        {
          id: "close",
          eyebrow: "Slide 06",
          title: "Quien construye resultados reales, crece con EverWinTrade.",
          description:
            "La propuesta es simple: salir del modelo de referencias aisladas y construir una operacion seria, profesional y duradera.",
          bullets: [
            "comision fuerte y progresion oficial",
            "soporte, tecnologia y transparencia",
            "seguimiento gerencial y materiales listos",
            "seguridad operativa y premios reales",
          ],
          stats: ["estructura para escala", "creado para socios serios"],
          visual: "summary",
        },
      ],
    },
  },
};

export function getAffiliateContent(language?: string): AffiliateContent {
  return affiliateContent[getAffiliateLanguage(language)];
}
