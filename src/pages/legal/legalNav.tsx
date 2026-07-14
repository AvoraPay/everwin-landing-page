// src/pages/legal/legalNav.ts
export type LegalItem = {
  slug: string;           // "privacy"
  title: string;          // "Privacy Policy"
  short?: string;         // mini descrição
};

export const LEGAL_ITEMS: LegalItem[] = [
  { slug: "privacy", title: "legal_section.sidebar.privacy" },
  { slug: "terms", title: "legal_section.sidebar.terms" },
  { slug: "prop-trading-terms", title: "legal_section.sidebar.prop_trading_terms" },
  { slug: "prop-evaluation-policy", title: "legal_section.sidebar.prop_evaluation" },
  { slug: "prop-plans-fees", title: "legal_section.sidebar.prop_plans" },
  { slug: "prop-account-access", title: "legal_section.sidebar.prop_access" },
  { slug: "prop-account-access-policy", title: "legal_section.sidebar.prop_account_access_policy" },
  { slug: "prop-payout-policy", title: "legal_section.sidebar.prop_payout" },
  { slug: "prop-purchase-reset-policy", title: "legal_section.sidebar.prop_purchase_reset" },
  { slug: "prop-trading-restrictions", title: "legal_section.sidebar.prop_trading_restrictions" },
  { slug: "cookies", title: "legal_section.sidebar.cookies" },
  { slug: "payment-policy", title: "legal_section.sidebar.payment" },
  { slug: "withdrawal-policy", title: "legal_section.sidebar.withdrawal" },
  { slug: "general-fees", title: "legal_section.sidebar.general_fees" },
  { slug: "risk-disclosure", title: "legal_section.sidebar.risk" },
  { slug: "order-execution", title: "legal_section.sidebar.order_execution" },
  { slug: "margin-trading", title: "legal_section.sidebar.margin" },
  { slug: "aml", title: "legal_section.sidebar.aml" },
  { slug: "demo-accounts", title: "legal_section.sidebar.demo" },
  { slug: "account-closure", title: "legal_section.sidebar.account_closure" },
];

export const legalPath = (slug: string) => `/legal/${slug}`;
