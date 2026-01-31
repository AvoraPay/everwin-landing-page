//
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const POLICIES_KEYS = [
  { key: "footer.links.privacy", to: "/legal/privacy" },
  { key: "footer.links.payment", to: "/legal/payment-policy" },
  { key: "footer.links.general_fees", to: "/legal/general-fees" },
  { key: "footer.links.terms", to: "/legal/terms" },
  { key: "footer.links.aml", to: "/legal/aml" },
];

const MORE_KEYS = [
  { key: "footer.links.withdrawal", to: "/legal/withdrawal-policy" },
  { key: "footer.links.risk", to: "/legal/risk-disclosure" },
  { key: "footer.links.order_execution", to: "/legal/order-execution" },
  { key: "footer.links.margin", to: "/legal/margin-trading" },
  { key: "footer.links.cookies", to: "/legal/cookies" },
  { key: "footer.links.demo", to: "/legal/demo-accounts" },
];

function linkCls(extra?: string) {
  return [
    "text-gray-400 hover:text-white transition font-bricolage_grotesque",
    "text-sm leading-6",
    extra ?? "",
  ].join(" ");
}

export const FooterContent = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-[90%] max-w-[1060px] flex flex-col gap-10 md:flex-row md:gap-10">
      {/* Brand */}
      <div className="flex flex-col gap-4 md:w-[320px]">
        <Link to="/" className="h-[37px] w-[131px] block" aria-label="Everwin Home">
          <img
            src="https://i.postimg.cc/RFLkLvK0/everwin-logo.png"
            alt="Everwin"
            className="h-full w-full object-contain"
            draggable={false}
          />
        </Link>

        <p className="font-bricolage_grotesque text-base leading-[22px] text-white">
          {t("footer.slogan_1")}{" "}
          <span className="text-emerald-500">{t("footer.slogan_2")}</span>
        </p>
      </div>

      {/* Columns */}
      <div className="flex flex-col gap-10 md:flex-row md:flex-1 md:justify-between">
        {/* Company */}
        <div className="flex flex-col gap-4">
        </div>

        {/* Policies */}
        <div className="flex flex-col gap-4">
          <p className="text-white text-lg font-semibold font-bricolage_grotesque">
            {t("footer.policies_title")}
          </p>

          <div className="flex flex-col gap-2">
            {POLICIES_KEYS.map((it) => (
              <Link key={it.to} to={it.to} className={linkCls()}>
                {t(it.key)}
              </Link>
            ))}
          </div>
        </div>

        {/* More */}
        <div className="flex flex-col gap-4">
          <p className="text-white text-lg font-semibold font-bricolage_grotesque">
            {t("footer.legal_title")}
          </p>

          <div className="flex flex-col gap-2">
            {MORE_KEYS.map((it) => (
              <Link key={it.to} to={it.to} className={linkCls()}>
                {t(it.key)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
