import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Reveal } from "../../components/Reveal";
import { Parallax } from "../../components/Parallax";
import { CountUp } from "../../components/CountUp";
import { formatPropCurrency, getPropPlans } from "../../data/propPlans";

const TICKER_LINES = [
  { top: "16%", width: "32%", duration: 16, delay: 0 },
  { top: "30%", width: "24%", duration: 18, delay: 4 },
  { top: "44%", width: "28%", duration: 14, delay: 2 },
] as const;

const CANDLES = [
  { left: "12%", height: 34, delay: 0.2, duration: 3.6 },
  { left: "20%", height: 52, delay: 1.4, duration: 2.8 },
  { left: "31%", height: 40, delay: 2.2, duration: 3.3 },
  { left: "43%", height: 60, delay: 0.8, duration: 3.1 },
  { left: "56%", height: 46, delay: 1.1, duration: 3.4 },
  { left: "68%", height: 56, delay: 0.4, duration: 3.7 },
  { left: "80%", height: 42, delay: 1.9, duration: 2.9 },
] as const;

export const PropHero = () => {
  const { t, i18n } = useTranslation();

  const plans = getPropPlans(i18n.language);
  const maxAccountSize = Math.max(...plans.map((plan) => plan.size));

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(187deg,rgb(246,247,249)_-24%,rgb(224,227,235)_100%)] pt-[120px] pb-24 md:pt-[160px] md:pb-32">
      <Parallax config={{ y: [-24, 24], scale: [1, 1], rotate: [0, 0] }}>
        <div className="pointer-events-none absolute -right-48 -top-32 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[110px]" />
      </Parallax>
      <Parallax config={{ y: [18, -18], scale: [1, 1], rotate: [0, 0] }}>
        <div className="pointer-events-none absolute -bottom-48 -left-36 h-[380px] w-[380px] rounded-full bg-emerald-400/10 blur-[100px]" />
      </Parallax>

      <div className="pointer-events-none absolute inset-0">
        <div className="trading-grid absolute inset-0 opacity-[0.14]" />

        {TICKER_LINES.map((line) => (
          <span
            key={`${line.top}-${line.duration}`}
            className="trading-ticker-line"
            style={{
              top: line.top,
              width: line.width,
              animationDuration: `${line.duration}s`,
              animationDelay: `-${line.delay}s`,
            }}
          />
        ))}

        <div className="absolute inset-x-8 top-[26%] h-[190px] opacity-30 md:h-[240px]">
          <svg viewBox="0 0 1000 240" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,140 L130,118 L220,145 L360,112 L470,130 L620,84 L760,102 L860,74 L1000,92" className="trading-chart-stroke" />
            <path d="M0,178 L120,190 L250,168 L340,182 L450,156 L560,168 L680,138 L790,150 L900,122 L1000,134" className="trading-chart-stroke trading-chart-delay" />
          </svg>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[34%]">
          {CANDLES.map((candle) => (
            <span
              key={`${candle.left}-${candle.height}`}
              className="trading-candle"
              style={{
                left: candle.left,
                height: `${candle.height}px`,
                animationDelay: `-${candle.delay}s`,
                animationDuration: `${candle.duration}s`,
              }}
            >
              <span className="trading-candle-body" style={{ height: `${Math.max(12, candle.height * 0.48)}px` }} />
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-[1] mx-auto w-[90%] max-w-[1060px]">
        <div className="flex flex-col items-center text-center">
          <Reveal delay={0} distance={12}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="font-bricolage_grotesque text-sm font-medium tracking-wide text-emerald-600">
                {t("prop.hero.badge")}
              </span>
            </div>
          </Reveal>

          <Reveal delay={100} distance={22}>
            <h1 className="text-center font-bricolage_grotesque text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-gray-800 sm:text-[48px] md:text-[68px]">
              <span className="block">{t("prop.hero.heading_1")}</span>
              <span className="block text-emerald-500">{t("prop.hero.heading_2")}</span>
            </h1>
          </Reveal>

          <Reveal delay={180} distance={16}>
            <p className="mt-6 max-w-[700px] font-bricolage_grotesque text-base leading-7 text-gray-500 md:text-lg">
              {t("prop.hero.description")}
            </p>
          </Reveal>

          <Reveal delay={260} distance={12}>
            <a href="#prop-plans" className="group relative mt-10 inline-flex overflow-hidden rounded-2xl bg-emerald-500/10 p-2">
              <span className="flex h-[64px] items-center justify-center gap-2 rounded-lg bg-emerald-500 px-8 font-bricolage_grotesque text-base font-medium text-white transition-transform duration-300 group-hover:scale-[1.01]">
                {t("prop.hero.cta")}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </Reveal>

          <Reveal delay={360} distance={20}>
            <div className="mt-16 grid w-full max-w-[780px] grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
              <StatCard value={formatPropCurrency(maxAccountSize, i18n.language)} label={t("prop.hero.stat_capital_label")} />
              <StatCard value={<><CountUp to={90} durationMs={1400} /> %</>} label={t("prop.hero.stat_split_label")} />
              <StatCard value={<><CountUp to={100} durationMs={1200} /> %</>} label={t("prop.hero.stat_refund_label")} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

function StatCard({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="flex h-full flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.45)]">
      <span className="font-bricolage_grotesque text-2xl font-bold text-emerald-500 md:text-3xl">{value}</span>
      <span className="font-bricolage_grotesque text-xs text-gray-500 md:text-sm">{label}</span>
    </div>
  );
}
