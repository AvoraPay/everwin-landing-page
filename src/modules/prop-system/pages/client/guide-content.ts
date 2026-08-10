import type { PlanTemplate, PropAccount } from "../../types";

/**
 * The trader's rulebook.
 *
 * Every number here is derived from the account and the plan the trader
 * actually bought — never from a constant written into the copy — so the guide
 * always agrees with the rest of the portal. The text itself follows the
 * published Everwin policies and the rules engine that grades the account.
 */

export type GuideMoney = (value: number) => string;

export type GuideContext = {
  plan: PlanTemplate;
  account: PropAccount;
  money: GuideMoney;
};

export type GuideBlock = { heading?: string; text: string };

export type GuideTopic = {
  id: string;
  group: string;
  title: string;
  summary: string;
  body: (ctx: GuideContext) => GuideBlock[];
};

export const GUIDE_GROUPS = [
  "Antes de tudo",
  "A avaliação",
  "Os limites de risco",
  "Aprovação e payout",
  "Conduta e acesso",
  "Quando algo dá errado",
] as const;

const SUPPORT = "support@everwin.capital";

export const GUIDE_TOPICS: GuideTopic[] = [
  /* ───────────────────────── antes de tudo ───────────────────────── */
  {
    id: "o-que-voce-contratou",
    group: "Antes de tudo",
    title: "O que você contratou",
    summary: "Uma etapa de validação sobre capital simulado",
    body: ({ account, money }) => [
      {
        heading: "O produto",
        text: `Você contratou uma etapa de validação operacional sobre um saldo simulado de ${money(account.initialBalance)}. O objetivo é medir método, disciplina e controle de risco — não vender uma promessa de lucro.`,
      },
      {
        heading: "O saldo é simulado",
        text: `Os ${money(account.initialBalance)} que aparecem no portal são capital de avaliação da Everwin, com recursos virtuais e finalidade de treinamento e validação. Não é dinheiro seu depositado em corretora, não é instrumento financeiro e não é investimento.`,
      },
      {
        heading: "Concluir fases não é um direito adquirido",
        text: "Cumprir as metas habilita você à análise de conta financiada, não à conta financiada em si. A aprovação final depende também de conformidade com as regras de risco, de execução e de conduta durante toda a avaliação.",
      },
      {
        heading: "Nada é garantido",
        text: "O serviço é fornecido sem garantia de resultado, de lucratividade ou de aprovação em qualquer fase. Nenhum conteúdo da Everwin é recomendação de investimento: a decisão de operar, e o risco dela, são exclusivamente seus.",
      },
      {
        heading: "Com quem você contrata",
        text: "O contrato é com a Everwin Capital Trading Global, sediada em Curaçao, sob Master License de Gaming Services Provider N.V. #365/JAZ. O processamento de pagamentos é feito pelo agente de pagamento do programa, que pode aparecer com outro nome na fatura do seu cartão.",
      },
      {
        heading: "As regras podem mudar",
        text: `A política vigente na data prevalece, e alterações passam a valer a partir da publicação. Vale a pena reler este guia antes de iniciar uma nova fase ou uma nova avaliação. Dúvida sobre qual regra se aplica ao seu caso: ${SUPPORT}.`,
      },
    ],
  },
  {
    id: "plano-taxa-e-pagamento",
    group: "Antes de tudo",
    title: "Plano, taxa e pagamento",
    summary: "O que muda entre os planos — e o que não muda",
    body: ({ account, plan, money }) => [
      {
        heading: "Seu plano",
        text: `${plan.name}: taxa de ${money(plan.fee)} para um saldo simulado de ${money(account.initialBalance)}.`,
      },
      {
        heading: "As regras não mudam por tamanho de conta",
        text: `Todos os planos carregam os mesmos parâmetros: ${plan.profitTargetPhase1Pct}% de meta na Fase 1, ${plan.profitTargetPhase2Pct}% acumulados na Fase 2, ${plan.maxDrawdownPct}% de drawdown máximo, ${plan.dailyLossLimitPct}% de perda diária, ${plan.minTradingDays} dias mínimos de trading e ${plan.durationDays} dias de prazo por fase. Só mudam o tamanho da conta e a taxa.`,
      },
      {
        heading: "As tabelas em real e em dólar são ofertas distintas",
        text: "Não é conversão de moeda: são planos diferentes, com tamanhos de conta e taxas próprios. O plano que você contratou é o que está registrado nesta conta.",
      },
      {
        heading: "O valor efetivamente debitado",
        text: "O checkout vigente no momento da compra é o que vale para aquele pedido. Parcelamento, spread cambial, IOF, tarifa bancária e custo do adquirente podem alterar o valor final debitado pelo seu banco.",
      },
      {
        heading: "Cancelamento e reembolso",
        text: `Pedidos ainda não provisionados, ou com erro material comprovado, podem ser analisados para cancelamento. Depois do provisionamento, do envio das credenciais ou do início efetivo da avaliação, a elegibilidade a reembolso pode ser limitada ou inexistente. Peça a análise por ${SUPPORT} antes de operar.`,
      },
    ],
  },
  {
    id: "elegibilidade-e-kyc",
    group: "Antes de tudo",
    title: "Elegibilidade e verificação",
    summary: "Quem pode participar e quais documentos serão pedidos",
    body: () => [
      {
        heading: "Quem pode contratar",
        text: "É exigido ter 18 anos ou mais, capacidade legal plena, residência em jurisdição permitida e não constar em listas de sanção (OFAC, ONU, UE). O serviço não é oferecido nos Estados Unidos e territórios, em países sob embargo ou onde a licença da Everwin não seja reconhecida.",
      },
      {
        heading: "Quem não pode",
        text: "Funcionários da Everwin e parentes diretos — cônjuge, filhos, pais e irmãos — não podem participar do programa. Verificar se o uso é permitido na sua jurisdição é responsabilidade sua.",
      },
      {
        heading: "O que pode ser exigido",
        text: "Documento de identidade válido (RG, CNH ou passaporte), comprovante de residência emitido nos últimos 90 dias, selfie para verificação biométrica e, quando aplicável, documentos societários e comprovação de origem de recursos. A verificação pode ser solicitada antes, durante ou depois da avaliação.",
      },
      {
        heading: "Divergência cadastral suspende a conta",
        text: "Discrepância entre os dados cadastrados e a identidade verificada suspende a conta até a regularização, e documento vencido bloqueia payout até a revalidação. Informação falsa é violação grave, com encerramento e retenção de valores.",
      },
      {
        heading: "A liberação não é instantânea",
        text: "As credenciais dependem de pagamento aprovado, revisão antifraude e provisionamento da conta na plataforma. A confirmação da cobrança pelo seu banco não significa acesso liberado no mesmo minuto — acompanhe o status pelo portal.",
      },
    ],
  },

  /* ───────────────────────── a avaliação ───────────────────────── */
  {
    id: "as-duas-fases",
    group: "A avaliação",
    title: "As duas fases",
    summary: "Como a avaliação avança do início ao veredito",
    body: ({ plan, account }) => [
      {
        heading: "Estrutura",
        text: `A avaliação tem duas fases. Cada uma tem meta própria, prazo de ${plan.durationDays} dias, exigência de ${plan.minTradingDays} dias mínimos de trading e os mesmos limites de risco: ${plan.dailyLossLimitPct}% de perda diária e ${plan.maxDrawdownPct}% de drawdown máximo.`,
      },
      {
        heading: "Quem decide",
        text: "Um motor de regras roda no servidor da Everwin, lê os resultados registrados na sua conta e grava o status. O que vale é o status gravado — ele é o mesmo que você vê no topo deste portal.",
      },
      {
        heading: "Os status possíveis",
        text: "Aguardando pagamento, aguardando criação da conta, ativa, pausada por limite diário, aprovada na avaliação, reprovada por drawdown, reprovada por prazo, em cooldown, aprovada para conta financiada e rejeitada.",
      },
      {
        heading: "A virada de fase",
        text: `Ao cumprir a Fase 1, a conta passa para a Fase 2: o resultado do dia zera, o contador de dias operados zera e o prazo de ${plan.durationDays} dias recomeça a partir daquele instante. O saldo, esse, não é zerado — o lucro que você trouxe continua com você.`,
      },
      {
        heading: "O fim da Fase 2",
        text: "Concluída a Fase 2, a conta é marcada como aprovada na avaliação e entra em revisão para conta financiada. Essa promoção é uma decisão da mesa, não um passo automático do sistema.",
      },
    ],
  },
  {
    id: "o-que-o-sistema-mede",
    group: "A avaliação",
    title: "O que o sistema mede",
    summary: "Resultado fechado do dia, não equity flutuante",
    body: ({ plan }) => [
      {
        heading: "O resultado do dia é o que conta",
        text: "A avaliação é calculada sobre o resultado registrado de cada dia e sobre o saldo que ele produz. Prejuízo flutuante de posição aberta não é lido pelo motor de regras — mas vira resultado no instante em que a posição fecha.",
      },
      {
        heading: "Não use isso como brecha",
        text: "Carregar uma posição perdedora para o dia seguinte não protege nada: ela simplesmente transfere a perda para outro dia, e o drawdown acumulado continua contando desde o início da avaliação.",
      },
      {
        heading: "O que conta como dia de trading",
        text: `Conta cada dia com resultado registrado na sua conta, inclusive dia com resultado zero ou negativo. É essa contagem que alimenta a exigência de ${plan.minTradingDays} dias mínimos.`,
      },
      {
        heading: "Confira sua série",
        text: `A aba Calendário mostra exatamente os dias registrados na sua conta, um a um. Se algum dia divergir do seu extrato da plataforma, conteste por escrito em ${SUPPORT} informando a data e o valor esperado.`,
      },
    ],
  },
  {
    id: "meta-fase-1",
    group: "A avaliação",
    title: `Meta da Fase 1`,
    summary: "Quanto você precisa lucrar — e o que mais é exigido",
    body: ({ plan, account, money }) => [
      {
        heading: "O número",
        text: `Sobre o saldo inicial de ${money(account.initialBalance)}, a Fase 1 exige ${money((plan.profitTargetPhase1Pct / 100) * account.initialBalance)} de lucro, ou seja, chegar a ${money(account.initialBalance * (1 + plan.profitTargetPhase1Pct / 100))}.`,
      },
      {
        heading: "Cravar a meta já basta",
        text: `Atingir exatamente ${plan.profitTargetPhase1Pct}% satisfaz a condição de lucro. Você não precisa ultrapassar a meta.`,
      },
      {
        heading: "Lucro sozinho não avança",
        text: `O avanço exige as duas condições ao mesmo tempo: lucro igual ou acima da meta e pelo menos ${plan.minTradingDays} dias de trading registrados. Faltando uma delas, a conta continua ativa na Fase 1 — e continua exposta ao drawdown e ao prazo.`,
      },
      {
        heading: "Bateu a meta cedo?",
        text: `Se o lucro chegar antes dos ${plan.minTradingDays} dias, o resultado não fica travado a seu favor: a conta segue viva e pode ser reprovada por drawdown ou por prazo depois disso. Reduza risco até fechar os dias mínimos.`,
      },
    ],
  },
  {
    id: "meta-fase-2",
    group: "A avaliação",
    title: "Meta da Fase 2",
    summary: "Acumulada, não recomeçada do zero",
    body: ({ plan, account, money }) => [
      {
        heading: "O número",
        text: `Na Fase 2 a meta é chegar a ${money(account.initialBalance * (1 + plan.profitTargetPhase2Pct / 100))}, contados a partir do mesmo saldo inicial contratado de ${money(account.initialBalance)}.`,
      },
      {
        heading: "Os ganhos são cumulativos",
        text: `O saldo não é zerado na virada. Quem termina a Fase 1 com exatos ${plan.profitTargetPhase1Pct}% precisa de mais ${plan.profitTargetPhase2Pct - plan.profitTargetPhase1Pct}% para fechar a Fase 2 — e não de ${plan.profitTargetPhase2Pct}% novos.`,
      },
      {
        heading: "O que é zerado",
        text: `Zeram o contador de dias operados e o prazo. São ${plan.minTradingDays} dias novos dentro de ${plan.durationDays} dias novos: os dias da Fase 1 não são aproveitados.`,
      },
      {
        heading: "O risco não afrouxa",
        text: `Nenhum limite fica mais generoso na Fase 2. O piso de drawdown e o limite diário continuam calculados sobre o saldo inicial contratado de ${money(account.initialBalance)}.`,
      },
    ],
  },
  {
    id: "prazo",
    group: "A avaliação",
    title: "O prazo de cada fase",
    summary: "Dias corridos, com hora exata de expiração",
    body: ({ plan, account }) => [
      {
        heading: "Dias corridos",
        text: `Cada fase tem ${plan.durationDays} dias corridos, não dias úteis. Feriado, fim de semana e dia sem operar consomem prazo igual.`,
      },
      {
        heading: "A hora conta",
        text: "O prazo é registrado como um instante exato, não como o fim do dia. Uma conta iniciada às 14h32 expira às 14h32 do trigésimo dia — não confie no último dia inteiro.",
      },
      {
        heading: "O relógio reinicia na Fase 2",
        text: `Na virada de fase o prazo é recontado do zero, a partir do momento exato do avanço: ${plan.durationDays} dias inteiros para a segunda fase.`,
      },
      {
        heading: "Se o prazo estourar",
        text: `A avaliação é encerrada por tempo, com registro de reprovação por prazo. O seu prazo atual está no topo desta página e termina em ${account.endDate.slice(0, 10).split("-").reverse().join("/")}.`,
      },
    ],
  },

  /* ─────────────────────── os limites de risco ─────────────────────── */
  {
    id: "drawdown-maximo",
    group: "Os limites de risco",
    title: "Drawdown máximo",
    summary: "O piso que encerra a avaliação",
    body: ({ plan, account, money }) => [
      {
        heading: "O seu piso",
        text: `Seu piso é ${money(account.initialBalance * (1 - plan.maxDrawdownPct / 100))}. Uma perda acumulada de ${money((plan.maxDrawdownPct / 100) * account.initialBalance)} sobre o saldo inicial de ${money(account.initialBalance)} encerra a avaliação.`,
      },
      {
        heading: "Encostar já reprova",
        text: "O teste é por igual ou abaixo: cravar exatamente o piso reprova a conta. Não é preciso ultrapassar.",
      },
      {
        heading: "É acumulado, e é fixo",
        text: `O piso conta desde o início da avaliação, não é reiniciado a cada dia e não sobe quando você lucra. Ele é calculado sobre o saldo inicial contratado de ${money(account.initialBalance)} e permanece o mesmo nas duas fases.`,
      },
      {
        heading: "A consequência é terminal",
        text: "A violação encerra a avaliação e abre um período de espera antes de qualquer nova tentativa. A conta não volta a ser avaliada depois disso.",
      },
    ],
  },
  {
    id: "folga-atual",
    group: "Os limites de risco",
    title: "A sua folga hoje",
    summary: "Quanto falta para cada limite, com os seus números",
    body: ({ plan, account, money }) => [
      {
        heading: "Até o piso de drawdown",
        text: `Do saldo atual de ${money(account.balance)} até o piso de ${money(account.initialBalance * (1 - plan.maxDrawdownPct / 100))} há ${money(Math.max(0, account.balance - account.initialBalance * (1 - plan.maxDrawdownPct / 100)))} de folga.`,
      },
      {
        heading: "Até a meta da fase",
        text: (() => {
          const targetPct = account.phase === 1 ? plan.profitTargetPhase1Pct : plan.profitTargetPhase2Pct;
          const target = account.initialBalance * (1 + targetPct / 100);
          const missing = Math.max(0, target - account.balance);
          return missing > 0
            ? `A meta da fase ${account.phase} é ${money(target)}. Faltam ${money(missing)}.`
            : `A meta da fase ${account.phase} (${money(target)}) já está cumprida em saldo. Restam os dias mínimos e o prazo.`;
        })(),
      },
      {
        heading: "Dias registrados",
        text: `Você tem ${account.daysTraded} ${account.daysTraded === 1 ? "dia registrado" : "dias registrados"} de ${plan.minTradingDays} exigidos nesta fase.`,
      },
      {
        heading: "O pior drawdown já atingido",
        text: `O histórico não é zerado na virada de fase: o pior recuo já registrado nesta conta é de ${account.maxDrawdownHitPct.toFixed(2)}%, contra um limite de ${plan.maxDrawdownPct}%.`,
      },
    ],
  },
  {
    id: "perda-diaria",
    group: "Os limites de risco",
    title: "Limite de perda diária",
    summary: "Pausa a conta, não reprova",
    body: ({ plan, account, money }) => [
      {
        heading: "O gatilho",
        text: `A conta é pausada quando o resultado do dia chega a ${money(-(plan.dailyLossLimitPct / 100) * account.initialBalance)}, ou seja, ${plan.dailyLossLimitPct}% do saldo inicial contratado de ${money(account.initialBalance)}.`,
      },
      {
        heading: "A base é o saldo contratado",
        text: `O cálculo usa sempre o saldo inicial contratado, que é fixo — não o saldo com que você abriu o dia. Use ${money((plan.dailyLossLimitPct / 100) * account.initialBalance)} como referência do seu limite diário em qualquer dia da avaliação.`,
      },
      {
        heading: "O efeito é pausa",
        text: "Estourar o limite diário pausa a conta: é um freio, não uma reprovação. A conta volta a ficar ativa quando o resultado do dia deixa de estar no limite — na prática, no dia seguinte.",
      },
      {
        heading: "Não use o limite como stop",
        text: `Operar colado no limite é perigoso: slippage ou um gap podem levar a perda além do previsto e converter uma pausa em violação de drawdown, essa sim terminal. Trate ${money((plan.dailyLossLimitPct / 100) * account.initialBalance)} como um teto que você nunca deve encostar, não como um alvo.`,
      },
    ],
  },
  {
    id: "dias-minimos",
    group: "Os limites de risco",
    title: "Dias mínimos de trading",
    summary: "Um portão para passar, nunca um motivo de falha",
    body: ({ plan }) => [
      {
        heading: "A regra",
        text: `São exigidos ${plan.minTradingDays} dias de trading registrados em cada fase. Eles não reprovam ninguém: apenas impedem que a fase seja concluída antes disso.`,
      },
      {
        heading: "Por que existem",
        text: "Atingir a meta com um único dia excepcional não demonstra método. O mínimo de dias existe para que o resultado seja um processo, não um evento.",
      },
      {
        heading: "O que conta como dia",
        text: "Conta cada dia com resultado registrado, inclusive dia com resultado zero ou negativo. Dia sem resultado registrado não entra na contagem.",
      },
      {
        heading: "Zera na virada",
        text: `O contador volta a zero na Fase 2: são ${plan.minTradingDays} dias novos, dentro do novo prazo.`,
      },
    ],
  },
  {
    id: "regra-de-consistencia",
    group: "Os limites de risco",
    title: "A regra de consistência",
    summary: "Um único dia não pode carregar a fase inteira",
    body: ({ plan, account, money }) => {
      const rule = plan.consistencyRulePct ?? 0;
      if (rule <= 0) {
        return [
          {
            heading: "Desativada no seu plano",
            text: "Seu plano não aplica limite de participação por dia. A meta é o número fixo da fase.",
          },
        ];
      }

      const exampleDay = (plan.dailyLossLimitPct / 100) * account.initialBalance;
      const exampleRequired = exampleDay / (rule / 100);

      return [
        {
          heading: "A regra",
          text: `Nenhum dia isolado pode representar mais de ${rule}% do seu lucro acumulado. A conta do sistema é direta: melhor dia dividido pelo lucro total precisa ficar em ${rule}% ou menos.`,
        },
        {
          heading: "Por que ela existe",
          text: "Uma avaliação mede método, e método aparece na repetição. Bater a meta inteira num pregão excepcional prova sorte, tamanho de posição ou um evento de mercado — não um processo que se repete no mês seguinte com o capital da mesa.",
        },
        {
          heading: "O que acontece quando você passa do limite",
          text: `A meta deixa de ser um número fixo e passa a ser calculada: melhor dia dividido por ${rule}%. Ela sobe até que aquele dia caiba na regra. Num dia de ${money(exampleDay)}, por exemplo, o lucro total exigido vira ${money(exampleRequired)}.`,
        },
        {
          heading: "O dia bom não é apagado nem punido",
          text: "O lucro daquele dia continua inteiro no seu saldo e conta para a meta como qualquer outro. O que muda é só que ele deixa de bastar sozinho: a regra pede que o resto do resultado o acompanhe.",
        },
        {
          heading: "Como voltar ao limite",
          text: "Somando dias menores. O melhor dia fica onde está e o lucro total cresce, então a participação dele cai naturalmente. Não existe como reduzir o numerador — só como aumentar o denominador.",
        },
        {
          heading: "Ela nunca reprova a sua conta",
          text: `A regra de consistência não encerra avaliação, não gera cooldown e não é violação. Ela apenas segura a conclusão da fase até a proporção fechar. Quem reprova continua sendo o drawdown e o prazo.`,
        },
        {
          heading: "Quantos dias isso implica",
          text: `Com o limite em ${rule}%, se todos os seus dias rendessem igual você precisaria de pelo menos ${Math.ceil(100 / rule)} dias positivos para a proporção fechar — acima dos ${plan.minTradingDays} dias mínimos. Na prática, dias desiguais mudam essa conta: o que importa é a proporção, não a contagem.`,
        },
        {
          heading: "Onde acompanhar",
          text: "A aba Risco mostra o seu melhor dia, a participação dele no lucro acumulado e, quando for o caso, a meta já ajustada. O número exibido lá é o mesmo que o servidor usa para decidir.",
        },
      ];
    },
  },
  {
    id: "consistencia",
    group: "Os limites de risco",
    title: "O que a mesa observa",
    summary: "Além dos limites, o comportamento",
    body: ({ plan, money, account }) => [
      {
        heading: "Distribuição do resultado",
        text: `Um trader que faz ${money((plan.profitTargetPhase1Pct / 100) * account.initialBalance)} em ${plan.minTradingDays} dias parecidos passa uma leitura muito diferente de quem faz o mesmo em um único dia e fica parado no resto.`,
      },
      {
        heading: "Tamanho de risco",
        text: "Risco por operação estável ao longo da avaliação é o indicador mais valorizado. Dobrar tamanho depois de um dia negativo é o padrão que mais reprova em revisão.",
      },
      {
        heading: "Comportamento após perda",
        text: "Parar quando o dia vira contra você vale mais, na análise, do que recuperar o prejuízo no mesmo pregão.",
      },
      {
        heading: "Os indicadores do portal",
        text: "Os placares de consistência, disciplina de risco e Edge Score na aba Desempenho são leitura visual do seu histórico. Eles ajudam você a se orientar, mas não aprovam nem reprovam nada: quem decide é o status da conta.",
      },
    ],
  },

  /* ─────────────────────── aprovação e payout ─────────────────────── */
  {
    id: "aprovacao",
    group: "Aprovação e payout",
    title: "Bater a meta não é ser aprovado",
    summary: "O que acontece entre a Fase 2 e a conta financiada",
    body: ({ plan, account, money }) => [
      {
        heading: "Revisão interna",
        text: "A conclusão das metas é submetida a revisão interna antes da aprovação final. A Everwin pode pedir documentos, revisar o histórico de operações e negar o avanço por risco operacional, inconsistência ou descumprimento contratual.",
      },
      {
        heading: "A aprovação é uma decisão da mesa",
        text: "Não existe promoção automática de aprovado na avaliação para conta financiada. A mudança é feita pela equipe depois da revisão, e você é avisado por e-mail.",
      },
      {
        heading: "Os limites continuam valendo até lá",
        text: `Mesmo com a meta cumprida, o piso de ${money(account.initialBalance * (1 - plan.maxDrawdownPct / 100))} e o prazo continuam ativos enquanto a conta estiver em avaliação. Encostar no piso depois de ter atingido a meta ainda converte a conta em reprovada por drawdown.`,
      },
      {
        heading: "Conformidade acompanha o período inteiro",
        text: "A análise cobre toda a vigência da conta, não apenas o dia da conclusão. Violação de conduta ocorrida no meio da avaliação pesa mesmo que o resultado final seja positivo.",
      },
    ],
  },
  {
    id: "payout-condicoes",
    group: "Aprovação e payout",
    title: "Payout: quando existe direito",
    summary: "Lucro na tela não é saque aprovado",
    body: () => [
      {
        heading: "A regra base",
        text: "Lucro aparente, meta atingida ou saldo positivo não conferem, por si sós, direito a payout. Somente as estruturas e contas expressamente autorizadas pela política comercial vigente podem solicitar, e nenhum payout é processado sem aprovação de compliance.",
      },
      {
        heading: "Violação anterior continua contando",
        text: "Conta que violou regra de risco em algum momento pode ter payout suspenso ou negado mesmo tendo se recuperado depois. A exigência de conformidade vale por toda a vigência da conta, não apenas no dia do pedido.",
      },
      {
        heading: "Resultado atípico entra em análise",
        text: "Antes da aprovação há análise de consistência, coerência dos retornos e histórico de risco. Ganhos anormais, drawdown zero ou taxa de acerto atipicamente alta podem prolongar a revisão.",
      },
      {
        heading: "Motivos de negação",
        text: "Fraude ou documento falso, uso de VPN ou de automação, compartilhamento de conta, chargeback ou transação contestada, indícios de lavagem, vínculo com listas de sanção, operação em instrumentos não permitidos, falta de resposta à verificação e múltiplas contas sob o mesmo usuário, documento ou IP.",
      },
      {
        heading: "Antes de contar com o dinheiro",
        text: `Peça por escrito, a ${SUPPORT}, a confirmação das condições de payout aplicáveis à sua conta — percentual, ciclo e limites — e guarde a resposta.`,
      },
    ],
  },
  {
    id: "payout-mecanica",
    group: "Aprovação e payout",
    title: "Como o payout é pago",
    summary: "Método, titularidade, prazos e descontos",
    body: () => [
      {
        heading: "O caminho de volta é o mesmo da ida",
        text: "O payout é liberado para método idêntico ao do pagamento original: cartão para cartão, conta bancária para conta bancária. Pagamento em cripto depende de disponibilidade e da legislação do seu país.",
      },
      {
        heading: "Titularidade tem de bater",
        text: "O recebedor precisa corresponder exatamente à identidade verificada. Divergência entre nome do titular, documento e conta bancária resulta em negação, e pedido para beneficiário diferente é tratado como indício de fraude.",
      },
      {
        heading: "Prazos e descontos",
        text: "O payout aprovado é processado em 5 a 10 dias úteis, variando conforme o banco destinatário. Podem incidir taxa administrativa, custo de remessa internacional, spread cambial e tarifas do banco beneficiário. A tributação na sua jurisdição é responsabilidade sua.",
      },
      {
        heading: "Dados errados custam caro",
        text: "Se os dados do beneficiário estiverem incorretos, o payout pode ser revertido e a taxa de reversão fica por sua conta. Confira agência, conta e documento antes de enviar o pedido.",
      },
      {
        heading: "Comunicação oficial",
        text: "Tudo é comunicado no e-mail cadastrado. Manter esse endereço atualizado e conferir a caixa de spam é obrigação sua.",
      },
    ],
  },
  {
    id: "limite-de-saque",
    group: "Aprovação e payout",
    title: "O limite de saque mensal",
    summary: "A regra dos 10x — e por que errar nela bloqueia a conta",
    body: () => [
      {
        heading: "A regra",
        text: "Não é permitido sacar mais que 10 vezes o valor depositado no mês civil em curso. A conta é feita do dia 1 ao último dia do mês: 1.000 depositados equivalem a um teto de 10.000 no mesmo mês.",
      },
      {
        heading: "A tentativa já basta para bloquear",
        text: "Solicitar acima do teto não gera uma recusa simples: dispara bloqueio imediato da conta para investigação, suspensão de todos os saques e análise forense das transações, com possibilidade de encerramento definitivo.",
      },
      {
        heading: "Onde ela costuma passar despercebida",
        text: "Essa regra vive nos Termos Gerais e na política de encerramento de conta, não nas páginas específicas do programa Prop. Quem lê apenas as páginas do Prop pode não encontrá-la.",
      },
      {
        heading: "O que fazer antes de qualquer saque relevante",
        text: `Peça por escrito, a ${SUPPORT}, o teto exato aplicado à sua conta e a base usada no cálculo. A punição por errar essa conta é bloqueio, não recusa do pedido — vale a pena confirmar antes.`,
      },
    ],
  },

  /* ─────────────────────── conduta e acesso ─────────────────────── */
  {
    id: "automacao",
    group: "Conduta e acesso",
    title: "Automação",
    summary: "Bot, EA e script levam a desqualificação",
    body: () => [
      {
        heading: "A regra",
        text: "Bots de trading, scripts automatizados, Expert Advisors, APIs não autorizadas, webhooks e sinais automatizados são proibidos. Execução sem intervenção humana real resulta em desqualificação imediata, congelamento da conta e retenção do saldo, sem reembolso.",
      },
      {
        heading: "O que aciona investigação",
        text: "Frequência de ordens incompatível com operação manual, padrões matematicamente perfeitos, ausência dos erros normais de execução humana e atuação simultânea em múltiplos timeframes ou pares. Centenas de ordens por minuto acionam apuração automática.",
      },
      {
        heading: "Se você usa algum tipo de algoritmo",
        text: `Peça autorização por escrito antes de operar, com comprovação de autoria da estratégia, em ${SUPPORT}. Enquanto não houver essa autorização no seu caso, opere pela regra mais restritiva: execução manual.`,
      },
      {
        heading: "Conduta é decisão humana",
        text: "O motor de regras não julga conduta — ele só trata risco. Qualquer medida por automação é aplicada pela equipe, depois de apuração, e comunicada por e-mail.",
      },
      {
        heading: "Terceiros também são responsabilidade sua",
        text: "Você responde por garantir que nenhum terceiro, software ou mecanismo autônomo acesse ou controle sua conta. Não há distinção entre você ter contratado o robô e alguém tê-lo instalado no seu ambiente.",
      },
    ],
  },
  {
    id: "restricoes-de-execucao",
    group: "Conduta e acesso",
    title: "Restrições de execução",
    summary: "Scalping, hedge, contratos e instrumentos",
    body: () => [
      {
        heading: "Alta frequência",
        text: "Scalping extremo — dezenas de trades por hora em pares diferentes — pode ser sinalizado como atividade de bot e abrir apuração. Não há um número publicado separando o aceito do sinalizado: a leitura é qualitativa.",
      },
      {
        heading: "Manipulação",
        text: "São proibidas ordens colocadas apenas para manipular spread ou gerar latência, market-making predatório, layering, spoofing e pump-and-dump. Explorar latência, erro de cotação, bug ou anomalia operacional é infração grave, mesmo quando o resultado é positivo.",
      },
      {
        heading: "Hedge, contratos e cópia",
        text: "Hedge é proibido, inclusive posições opostas no mesmo instrumento abertas em contas relacionadas. Manter contratos MINI e MICRO simultaneamente é proibido. Copy trading só é permitido entre contas do mesmo titular.",
      },
      {
        heading: "Alavancagem e exposição",
        text: "A alavancagem máxima é tipicamente 1:100 ou menos, a exposição em um único instrumento é limitada e posição overnight pode exigir margem adicional.",
      },
      {
        heading: "Fim de semana e feriados",
        text: "Posições abertas em feriados ou finais de semana podem ser fechadas automaticamente. Feche o que estiver aberto antes do fechamento de sexta-feira.",
      },
      {
        heading: "Instrumentos",
        text: `Índices, cripto de baixa liquidez, commodities alavancadas e micro-contratos podem estar restritos conforme a versão do programa. Instrumento delistado, vencido ou sob suspensão regulatória é proibição absoluta. Em dúvida sobre um ativo específico, confirme em ${SUPPORT} antes de operá-lo.`,
      },
    ],
  },
  {
    id: "acesso-e-credenciais",
    group: "Conduta e acesso",
    title: "Acesso, senha e 2FA",
    summary: "Como proteger a conta sem cair em bloqueio",
    body: () => [
      {
        heading: "Senha e segundo fator",
        text: "Senha de no mínimo 12 caracteres, com maiúsculas, minúsculas, números e símbolos. 2FA por aplicativo autenticador (Google Authenticator, Authy) é obrigatório em contas Prop — SMS, WhatsApp e e-mail não são aceitos como segundo fator. Guarde os códigos de backup offline.",
      },
      {
        heading: "Uma sessão por vez",
        text: "É permitida uma única sessão ativa por conta. Login simultâneo de outro IP força o logout da anterior, e há logout automático após 30 minutos de inatividade.",
      },
      {
        heading: "Geografia",
        text: "Acessos simultâneos ou sequenciais de múltiplos IPs, especialmente de países ou fusos diferentes em janelas curtas, resultam em desqualificação. Acesso de país diferente do cadastro em intervalo menor que 4 horas congela a conta. Se for viajar, avise antes.",
      },
      {
        heading: "VPN e controle remoto",
        text: "VPN, proxy, redes onion e qualquer mascaramento de IP são proibidos e classificados como violação grave, com encerramento sem aviso prévio. TeamViewer, AnyDesk e Chrome Remote Desktop também são proibidos e são detectáveis.",
      },
      {
        heading: "O risco de credencial é seu",
        text: "A Everwin não responde por perdas decorrentes de credencial comprometida, ausência de 2FA ou software malicioso no seu computador. Trate a senha da plataforma como trata a do seu banco.",
      },
    ],
  },
  {
    id: "conta-pessoal",
    group: "Conduta e acesso",
    title: "Conta pessoal e múltiplas contas",
    summary: "Compartilhar credencial encerra a conta",
    body: () => [
      {
        heading: "A conta é pessoal",
        text: "Compartilhar credenciais é proibido inclusive com cônjuge, familiar, sócio ou gestor. Conta compartilhada é encerrada e o saldo retido, sem reembolso. Qualquer atividade feita com suas credenciais é tratada como ato seu.",
      },
      {
        heading: "Antes de comprar uma segunda conta",
        text: `Peça autorização expressa por escrito a ${SUPPORT} e guarde a resposta. A compra é pessoal e vinculada aos dados reais do comprador, salvo autorização formal.`,
      },
      {
        heading: "O efeito é em cadeia",
        text: "Detecção de múltiplas contas não derruba uma conta: encerra todas as contas relacionadas, retém os saldos de todas e impede novo cadastro com os mesmos dados.",
      },
      {
        heading: "Mesmo IP também pesa",
        text: "Múltiplas contas sob o mesmo usuário, documento ou endereço IP constam entre os fundamentos de negação permanente de payout. Se você mora com outro trader do programa, informe isso antes, por escrito.",
      },
    ],
  },

  /* ─────────────────── quando algo dá errado ─────────────────── */
  {
    id: "falha-e-recompra",
    group: "Quando algo dá errado",
    title: "Se você for reprovado",
    summary: "Cooldown, status terminal e nova avaliação",
    body: ({ plan, money }) => [
      {
        heading: "O que reprova",
        text: `Duas condições reprovam a conta: encostar no piso de drawdown e estourar o prazo da fase. As duas gravam um período de espera de 7 dias a partir daquele instante.`,
      },
      {
        heading: "O status é terminal",
        text: "Depois da reprovação a conta não volta sozinha ao ciclo quando os 7 dias passam. É preciso contratar uma nova avaliação.",
      },
      {
        heading: "Reset não é automático",
        text: `Refazer a avaliação significa contratar de novo, com nova taxa de ${money(plan.fee)}. Não há garantia de que uma condição especial de reset será oferecida.`,
      },
      {
        heading: "Limites de recompra",
        text: "Podem existir limites de quantas avaliações e resets uma mesma pessoa contrata em janelas de 30 dias, além de limite de contas ativas por pessoa e por residência.",
      },
      {
        heading: "Reembolso após o início",
        text: "Depois do envio das credenciais ou do início efetivo da avaliação, a elegibilidade a reembolso pode ser limitada, reduzida ou inexistente.",
      },
    ],
  },
  {
    id: "suporte-e-apelacao",
    group: "Quando algo dá errado",
    title: "Suporte, apelação e disputa",
    summary: "Canais, prazos e onde a discussão termina",
    body: () => [
      {
        heading: "O canal",
        text: `${SUPPORT} é o canal oficial para dúvida, contestação de dados, pedido de autorização e apelação. Registre tudo por escrito: conversa informal não conta prazo nem gera comprovação.`,
      },
      {
        heading: "Prazo para apelar",
        text: "A apelação de encerramento ou de negação de payout tem 30 dias corridos contados da notificação. Ela precisa ser escrita, com identificação completa, número da conta, data da notificação, argumento específico e documentação comprobatória.",
      },
      {
        heading: "Prazo de resposta",
        text: "A análise da apelação sai em até 15 dias úteis. A decisão é descrita como definitiva e irrecorrível na esfera interna.",
      },
      {
        heading: "O bloqueio vem antes da apuração",
        text: "O processo publicado tem cinco etapas: detecção com bloqueio imediato, investigação de 1 a 15 dias, notificação por e-mail, período de apelação de 30 dias e decisão final. Ou seja, o bloqueio acontece antes da investigação — não interprete o bloqueio como veredito.",
      },
      {
        heading: "Onde a disputa termina",
        text: "Antes de qualquer ação judicial há 30 dias de negociação direta, depois mediação com custos divididos e, por fim, arbitragem na Corte de Arbitragem de Curaçao, com árbitro único, em inglês, sede em Willemstad. O contrato é regido pela lei de Curaçao.",
      },
      {
        heading: "Notificação por e-mail",
        text: "E-mail é considerado recebido no momento do envio, salvo retorno de erro. Filtro de spam ou cadastro desatualizado é risco seu — mantenha o endereço em dia.",
      },
    ],
  },
];
