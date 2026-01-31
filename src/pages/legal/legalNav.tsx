// src/pages/legal/legalNav.ts
export type LegalItem = {
  slug: string;           // "privacy"
  title: string;          // "Privacy Policy"
  short?: string;         // mini descrição
};

export const LEGAL_ITEMS: LegalItem[] = [
  { slug: "privacy", title: "legal_section.sidebar.privacy" },
  { slug: "terms", title: "legal_section.sidebar.terms" },
  { slug: "cookies", title: "legal_section.sidebar.cookies" },
  { slug: "payment-policy", title: "legal_section.sidebar.payment" },
  { slug: "withdrawal-policy", title: "legal_section.sidebar.withdrawal" },
  { slug: "general-fees", title: "legal_section.sidebar.general_fees" },
  { slug: "risk-disclosure", title: "legal_section.sidebar.risk" },
  { slug: "order-execution", title: "legal_section.sidebar.order_execution" },
  { slug: "margin-trading", title: "legal_section.sidebar.margin" },
  { slug: "aml", title: "legal_section.sidebar.aml" },
  { slug: "demo-accounts", title: "legal_section.sidebar.demo" },
];

export const legalPath = (slug: string) => `/legal/${slug}`;
