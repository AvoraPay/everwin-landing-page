import { useTranslation } from "react-i18next";
import { Reveal } from "../../components/Reveal";
import { Parallax } from "../../components/Parallax";

export const PropCTA = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden px-4 py-24 md:py-32">
      <Parallax config={{ y: [-10, 10], scale: [1, 1], rotate: [0, 0] }}>
        <div className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[760px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[100px]" />
      </Parallax>

      <div className="relative z-[1] mx-auto flex w-full max-w-[760px] flex-col items-center gap-y-6 rounded-[30px] border border-gray-200 bg-white/85 px-6 py-12 text-center shadow-[0_25px_65px_-48px_rgba(15,23,42,0.6)] md:px-10 md:py-14">
        <Reveal>
          <h2 className="font-bricolage_grotesque text-[38px] font-bold leading-[42px] text-gray-800 md:text-[56px] md:leading-[60px]">
            {t("prop.cta.title_1")}{" "}
            <span className="text-emerald-500">{t("prop.cta.title_2")}</span>
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <p className="max-w-[560px] font-bricolage_grotesque text-base leading-7 text-gray-500">
            {t("prop.cta.description")}
          </p>
        </Reveal>

        <Reveal delay={200}>
          <a href="#prop-plans" className="group relative mt-2 inline-flex overflow-hidden rounded-2xl bg-emerald-500/10 p-2">
            <span className="flex h-[64px] items-center justify-center gap-2 rounded-lg bg-emerald-500 px-8 font-bricolage_grotesque text-base font-medium text-white transition-transform duration-300 group-hover:scale-[1.01]">
              {t("prop.cta.button")}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
};
