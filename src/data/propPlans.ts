export type PropPlanKey = "plan_1" | "plan_2" | "plan_3" | "plan_4";

export type PropPlan = {
  key: PropPlanKey;
  size: number;
  price: number;
  popular: boolean;
  paymentUrl: string;
};

const NOVUS_LINKS: Record<PropPlanKey, string> = {
  plan_1: "https://pay.novuspagamentos.com/link/prop-trading---starter-plan-a63431f2",
  plan_2: "https://pay.novuspagamentos.com/link/prop-trading---medium-plan-01ae7d1e",
  plan_3: "https://pay.novuspagamentos.com/link/prop-trading---adv-plan-70873f57",
  plan_4: "https://pay.novuspagamentos.com/link/prop-trading---ultra-plan-dafe578f",
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
