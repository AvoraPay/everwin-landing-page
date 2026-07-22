export type PropPlanKey = "plan_1" | "plan_2" | "plan_3" | "plan_4";

export type PropPlan = {
  key: PropPlanKey;
  size: number;
  price: number;
  popular: boolean;
  paymentUrl: string;
};

const BASE = "https://everwin.capital";

const NOVUS_RAW: Record<PropPlanKey, string> = {
  plan_1: "https://pay.novuspagamentos.com/link/prop-trading-testing-fee--7518d57d",
  plan_2: "https://pay.novuspagamentos.com/link/prop-trading-testing-fee-b2c78af5",
  plan_3: "https://pay.novuspagamentos.com/link/prop-trade-testing-fee-15b8e2db",
  plan_4: "https://pay.novuspagamentos.com/link/prop-trade-testing-fee-2efb525d",
};

const buildNovusLink = (raw: string, planKey: PropPlanKey): string => {
  const successUrl = encodeURIComponent(`${BASE}/prop/thank-you?plan=${planKey}`);
  const cancelUrl = encodeURIComponent(`${BASE}/prop/checkout?plan=${planKey}`);
  return `${raw}?success_url=${successUrl}&cancel_url=${cancelUrl}`;
};

const NOVUS_LINKS: Record<PropPlanKey, string> = {
  plan_1: buildNovusLink(NOVUS_RAW.plan_1, "plan_1"),
  plan_2: buildNovusLink(NOVUS_RAW.plan_2, "plan_2"),
  plan_3: buildNovusLink(NOVUS_RAW.plan_3, "plan_3"),
  plan_4: buildNovusLink(NOVUS_RAW.plan_4, "plan_4"),
};

const BRL_PLANS: PropPlan[] = [
  { key: "plan_1", size: 25000, price: 497, popular: false, paymentUrl: NOVUS_LINKS.plan_1 },
  { key: "plan_2", size: 50000, price: 874, popular: true, paymentUrl: NOVUS_LINKS.plan_2 },
  { key: "plan_3", size: 100000, price: 1397, popular: false, paymentUrl: NOVUS_LINKS.plan_3 },
  { key: "plan_4", size: 150000, price: 1497, popular: false, paymentUrl: NOVUS_LINKS.plan_4 },
];

const USD_PLANS: PropPlan[] = [
  { key: "plan_1", size: 12500, price: 199, popular: false, paymentUrl: NOVUS_LINKS.plan_1 },
  { key: "plan_2", size: 25000, price: 349, popular: true, paymentUrl: NOVUS_LINKS.plan_2 },
  { key: "plan_3", size: 50000, price: 549, popular: false, paymentUrl: NOVUS_LINKS.plan_3 },
  { key: "plan_4", size: 75000, price: 999, popular: false, paymentUrl: NOVUS_LINKS.plan_4 },
];

const getPricingMode = (language?: string): "BRL" | "USD" =>
  language?.startsWith("pt") ? "BRL" : "USD";

export const getPropPlans = (language?: string): PropPlan[] =>
  getPricingMode(language) === "BRL" ? BRL_PLANS : USD_PLANS;

export const formatPropCurrency = (value: number, language?: string): string => {
  const mode = getPricingMode(language);
  const locale = mode === "BRL" ? "pt-BR" : "en-US";
  const currency = mode === "BRL" ? "BRL" : "USD";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
