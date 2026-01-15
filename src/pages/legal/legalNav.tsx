// src/pages/legal/legalNav.ts
export type LegalItem = {
  slug: string;           // "privacy"
  title: string;          // "Privacy Policy"
  short?: string;         // mini descrição
};

export const LEGAL_ITEMS: LegalItem[] = [
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms & Conditions" },
  { slug: "cookies", title: "Cookies Policy" },
  { slug: "payment-policy", title: "Payment Policy" },
  { slug: "withdrawal-policy", title: "Withdrawal Policy" },
  { slug: "general-fees", title: "General Fees" },
  { slug: "risk-disclosure", title: "Risk Disclosure" },
  { slug: "order-execution", title: "Order Execution Policy" },
  { slug: "margin-trading", title: "Margin Trading" },
  { slug: "aml", title: "AML & KYC Policy" },
  { slug: "demo-accounts", title: "Demo Accounts" },
];

export const legalPath = (slug: string) => `/legal/${slug}`;
