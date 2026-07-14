import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { Reveal } from "../../components/Reveal";

const STEPS = ["step_1", "step_2", "step_3"] as const;

const ICONS = [
  <svg key="target" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
  <svg key="check" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>,
  <svg key="trophy" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
];

const PHASE_STYLE = "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";

export const PropHowItWorks = () => {
  const { t } = useTranslation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(wrapRef, { start: 0.9, end: 0.25 });

  return (
    <section className="relative w-full py-[90px] md:py-[120px] px-4">
      <div className="mx-auto w-full max-w-[810px]">
        <Reveal>
          <div className="flex flex-col items-center text-center gap-y-4 mb-16 md:mb-20">
            <h2 className="font-bricolage_grotesque text-[42px] leading-[44px] text-gray-800 md:text-[62px] md:leading-[62px]">
              {t("prop.how.title_1")} <strong className="font-bold text-emerald-500">{t("prop.how.title_2")}</strong>
            </h2>
            <p className="max-w-[560px] font-bricolage_grotesque text-base font-light leading-6 text-gray-500">
              {t("prop.how.description")}
            </p>
          </div>
        </Reveal>

        <div ref={wrapRef} className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[35px] top-[35px] bottom-[35px] w-[3px] overflow-hidden rounded-full bg-gray-800/10"
          >
            <div
              className="absolute left-0 top-0 h-full w-full origin-top rounded-full bg-emerald-400 will-change-transform"
              style={{ transform: `scaleY(${progress})` }}
            />
          </div>

          <div className="relative flex flex-col">
            {STEPS.map((key, i) => (
              <Reveal key={key} delay={i * 120} distance={20}>
                <div className="flex items-start gap-5 py-8">
                  <div className={`relative z-[1] flex h-[70px] w-[70px] flex-shrink-0 items-center justify-center rounded-full border-2 ${PHASE_STYLE} transition-all duration-500`}>
                    {ICONS[i]}
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border ${PHASE_STYLE}`}>
                      {t(`prop.how.${key}.phase`)}
                    </span>
                    <h3 className="font-bricolage_grotesque text-xl font-bold text-gray-800 md:text-2xl">
                      {t(`prop.how.${key}.title`)}
                    </h3>
                    <p className="font-bricolage_grotesque text-base font-light leading-6 text-gray-500 max-w-[480px]">
                      {t(`prop.how.${key}.desc`)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
