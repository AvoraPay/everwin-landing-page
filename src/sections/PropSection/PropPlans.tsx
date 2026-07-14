import { useTranslation } from "react-i18next";
import { Reveal } from "../../components/Reveal";
import { useNavigate } from "react-router-dom";
import { formatPropCurrency, getPropPlans } from "../../data/propPlans";

export const PropPlans = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const plans = getPropPlans(i18n.language);

  const rows = [
    { label: t("prop.plans.phase1_target"), value: t("prop.plans.values.phase1") },
    { label: t("prop.plans.phase2_target"), value: t("prop.plans.values.phase2") },
    { label: t("prop.plans.max_drawdown"), value: t("prop.plans.values.drawdown") },
    { label: t("prop.plans.daily_drawdown"), value: t("prop.plans.values.daily") },
    { label: t("prop.plans.duration"), value: t("prop.plans.values.duration") },
    { label: t("prop.plans.min_days"), value: t("prop.plans.values.min_days") },
    { label: t("prop.plans.profit_split"), value: t("prop.plans.values.split") },
  ];

  return (
    <section
      id="prop-plans"
      className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(248,250,252,0)_0%,rgba(248,250,252,0.85)_24%,rgba(255,255,255,1)_100%)] px-4 py-[90px] md:py-[120px]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{
        backgroundImage:
          "linear-gradient(rgba(15,23,42,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.08) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }} />
      <div className="pointer-events-none absolute -right-36 top-6 h-[280px] w-[280px] rounded-full bg-emerald-500/10 blur-[90px]" />

      <div className="relative z-[1] mx-auto w-full max-w-[1100px]">
        <Reveal>
          <div className="mb-14 flex flex-col items-center gap-y-4 text-center">
            <h2 className="font-bricolage_grotesque text-[42px] leading-[44px] text-gray-800 md:text-[62px] md:leading-[62px]">
              {t("prop.plans.title_1")}{" "}
              <strong className="font-bold text-emerald-500">{t("prop.plans.title_2")}</strong>
            </h2>
            <p className="max-w-[560px] font-bricolage_grotesque text-base font-light leading-6 text-gray-500">
              {t("prop.plans.description")}
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <Reveal key={plan.key} delay={i * 90} distance={20}>
              <div
                className={[
                  "group relative flex h-full cursor-pointer flex-col rounded-2xl border bg-white p-6 shadow-[0_22px_60px_-50px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-1",
                  plan.popular ? "border-emerald-500/40" : "border-gray-200 hover:border-emerald-500/35",
                ].join(" ")}
                onClick={() => navigate(`/prop/checkout?plan=${plan.key}`)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-emerald-500/25 bg-emerald-500/15 px-4 py-1">
                    <span className="whitespace-nowrap font-bricolage_grotesque text-xs font-semibold text-emerald-600">
                      {t("prop.plans.popular")}
                    </span>
                  </div>
                )}

                <div className="mb-1 mt-2">
                  <span className="font-bricolage_grotesque text-sm text-gray-500">{t("prop.plans.account_size")}</span>
                </div>
                <h3 className="mb-1 font-bricolage_grotesque text-3xl font-bold text-gray-800">
                  {formatPropCurrency(plan.size, i18n.language)}
                </h3>

                <div className="mb-5">
                  <span className="font-bricolage_grotesque text-sm text-gray-500">{t("prop.plans.fee")}: </span>
                  <span className="font-bricolage_grotesque text-lg font-bold text-emerald-500">
                    {formatPropCurrency(plan.price, i18n.language)}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 border-t border-gray-200 pt-5">
                  {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-2">
                      <span className="font-bricolage_grotesque text-xs text-gray-500 md:text-sm">{row.label}</span>
                      <span className="font-bricolage_grotesque text-xs font-medium text-gray-700 md:text-sm">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="group/btn relative inline-flex w-full overflow-hidden rounded-2xl bg-emerald-500/10 p-2">
                    <span className="flex h-[54px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 font-bricolage_grotesque text-sm font-medium text-white transition-transform duration-300 group-hover/btn:scale-[1.01]">
                      {t("prop.plans.cta")}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-center font-bricolage_grotesque text-[11px] text-gray-500">
                  {t("prop.plans.refund_note")}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
