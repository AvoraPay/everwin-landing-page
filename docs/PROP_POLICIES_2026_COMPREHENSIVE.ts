/**
 * COMPREHENSIVE PROP POLICIES - INTERNATIONAL LEGAL STANDARDS
 * 
 * This file contains enhanced legal content for all Prop-related policies
 * with international jurisprudence, compliance standards, and risk mitigation.
 * 
 * Languages: Portuguese (PT), English (EN), Spanish (ES)
 * Updated: March 26, 2026
 * 
 * Key Security Measures:
 * - Multi-IP Account Access Prohibition
 * - Automated Bot Detection & Disqualification
 * - International AML/KYC Compliance
 * - Account Integrity Verification
 * - Fraud Prevention & Chargeback Protection
 */

export const PROP_POLICIES_2026 = {
  pt: {
    // ================== PORTUGUÊS ==================
    "prop-payout-policy": {
      title: "Política de Payout e Retirada - Programa Prop",
      updated: "26 de março de 2026",
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
      updated: "26 de março de 2026",
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
      updated: "26 de março de 2026",
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
  },

  en: {
    // ================== ENGLISH ==================
    "prop-payout-policy": {
      title: "Prop Payout and Withdrawal Policy",
      updated: "March 26, 2026",
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
  },

  es: {
    // ================== ESPAÑOL ==================
    "prop-payout-policy": {
      title: "Política de Payout y Retiro - Programa Prop",
      updated: "26 de marzo de 2026",
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
            "MÚLTIPLES IPS Y UBICACIONES GEOGRÁFICAS: Accesos simultáneos o secuenciales desde múltiples direcciones IP, especialmente en diferentes países/zonas horarias en ventanas cortas de tiempo, resultarán en DESQUALIFICACIÓN INMEDIATA del programa.",
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
            "Violación de política: múltiples IPs, VPN/Proxy, bots, compartimiento de cuenta, trading no autorizado.",
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
  },
};

export default PROP_POLICIES_2026;
