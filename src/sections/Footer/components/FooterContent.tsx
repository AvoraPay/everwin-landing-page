import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const GENERAL_KEYS = [
  { key: "footer.links.privacy", to: "/legal/privacy" },
  { key: "footer.links.terms", to: "/legal/terms" },
  { key: "footer.links.risk", to: "/legal/risk-disclosure" },
  { key: "footer.links.cookies", to: "/legal/cookies" },
  { key: "footer.links.aml", to: "/legal/aml" },
  { key: "footer.links.demo", to: "/legal/demo-accounts" },
];

const PROP_KEYS = [
  { key: "footer.links.prop_trading_terms", to: "/legal/prop-trading-terms" },
  { key: "footer.links.prop_evaluation", to: "/legal/prop-evaluation-policy" },
  { key: "footer.links.prop_plans", to: "/legal/prop-plans-fees" },
  { key: "footer.links.prop_access", to: "/legal/prop-account-access" },
  { key: "footer.links.prop_account_access_policy", to: "/legal/prop-account-access-policy" },
  { key: "footer.links.prop_payout", to: "/legal/prop-payout-policy" },
  { key: "footer.links.prop_purchase_reset", to: "/legal/prop-purchase-reset-policy" },
  { key: "footer.links.prop_trading_restrictions", to: "/legal/prop-trading-restrictions" },
];

const OPERATIONS_KEYS = [
  { key: "footer.links.payment", to: "/legal/payment-policy" },
  { key: "footer.links.withdrawal", to: "/legal/withdrawal-policy" },
  { key: "footer.links.general_fees", to: "/legal/general-fees" },
  { key: "footer.links.order_execution", to: "/legal/order-execution" },
  { key: "footer.links.margin", to: "/legal/margin-trading" },
  { key: "footer.links.account_closure", to: "/legal/account-closure" },
];

function linkCls() {
  return "text-gray-400 hover:text-white transition font-bricolage_grotesque text-sm leading-7";
}

function CollapsibleSection({
  title,
  items,
  defaultOpen = false,
}: {
  title: string;
  items: { key: string; to: string }[];
  defaultOpen?: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left md:cursor-default"
      >
        <p className="text-white text-sm font-semibold font-bricolage_grotesque">
          {title}
        </p>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 md:hidden ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className={`overflow-hidden transition-all duration-300 md:!h-auto md:!opacity-100 ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 md:max-h-none"}`}>
        <div className="flex flex-col gap-1 pb-4 md:pb-0">
          {items.map((it) => (
            <Link key={it.to} to={it.to} className={linkCls()}>
              {t(it.key)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopColumn({
  title,
  items,
}: {
  title: string;
  items: { key: string; to: string }[];
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <p className="text-white text-xs font-semibold uppercase tracking-wider font-bricolage_grotesque">
        {title}
      </p>
      <div className="flex flex-col gap-1">
        {items.map((it) => (
          <Link key={it.to} to={it.to} className={linkCls()}>
            {t(it.key)}
          </Link>
        ))}
      </div>
    </div>
  );
}

export const FooterContent = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-[90%] max-w-[1060px]">
      {/* Desktop */}
      <div className="hidden lg:flex lg:gap-16">
        <div className="flex w-[260px] shrink-0 flex-col gap-4">
          <Link to="/" className="h-[37px] w-[131px] block" aria-label="Everwin Home">
            <img
              src="https://i.postimg.cc/RFLkLvK0/everwin-logo.png"
              alt="Everwin"
              className="h-full w-full object-contain"
              draggable={false}
            />
          </Link>
          <p className="font-bricolage_grotesque text-sm leading-[22px] text-gray-400">
            {t("footer.slogan_1")}{" "}
            <span className="text-emerald-500">{t("footer.slogan_2")}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 flex-1 gap-10">
          <DesktopColumn title={t("footer.policies_title")} items={GENERAL_KEYS} />
          <DesktopColumn title="Prop Trading" items={PROP_KEYS} />
          <DesktopColumn title={t("footer.legal_title")} items={OPERATIONS_KEYS} />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col lg:hidden">
        <Link to="/" className="h-[37px] w-[131px] block mb-5" aria-label="Everwin Home">
          <img
            src="https://i.postimg.cc/RFLkLvK0/everwin-logo.png"
            alt="Everwin"
            className="h-full w-full object-contain"
            draggable={false}
          />
        </Link>

        <CollapsibleSection title={t("footer.policies_title")} items={GENERAL_KEYS} defaultOpen />
        <CollapsibleSection title="Prop Trading" items={PROP_KEYS} />
        <CollapsibleSection title={t("footer.legal_title")} items={OPERATIONS_KEYS} />
      </div>
    </div>
  );
};
