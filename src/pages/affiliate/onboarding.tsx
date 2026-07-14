import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAppLinks } from "../../hooks/useAppLinks";
import { getAffiliateContent, getAffiliateLanguage, type AffiliateLanguage } from "./content";

const ONBOARDING_STORAGE_KEY = "everwin_affiliate_onboarding_unlocked_v1";
const DEFAULT_ONBOARDING_PASSWORD = import.meta.env.VITE_AFFILIATE_ONBOARDING_PASSWORD || "";

const REAL_MEDIA = {
  managers: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1600",
  dubai: "https://images.pexels.com/photos/35664165/pexels-photo-35664165.jpeg?auto=compress&cs=tinysrgb&w=1600",
  watch: "https://images.pexels.com/photos/10842471/pexels-photo-10842471.jpeg?auto=compress&cs=tinysrgb&w=1200",
} as const;

const ONBOARDING_UI_COPY: Record<
  AffiliateLanguage,
  {
    phaseLabel: string;
    platformAlt: string;
    supportAlt: string;
    visualAlt: string;
    operationsAlt: string;
    dubaiAlt: string;
    watchAlt: string;
  }
> = {
  pt: {
    phaseLabel: "Fase",
    platformAlt: "Interface Everwin",
    supportAlt: "Equipe Everwin",
    visualAlt: "Visual Everwin",
    operationsAlt: "Interface operacional Everwin",
    dubaiAlt: "Skyline de Dubai",
    watchAlt: "Relogio de luxo dourado",
  },
  en: {
    phaseLabel: "Stage",
    platformAlt: "Everwin interface",
    supportAlt: "Everwin team",
    visualAlt: "Everwin visual",
    operationsAlt: "Everwin operational interface",
    dubaiAlt: "Dubai skyline",
    watchAlt: "Luxury gold watch",
  },
  es: {
    phaseLabel: "Fase",
    platformAlt: "Interfaz Everwin",
    supportAlt: "Equipo Everwin",
    visualAlt: "Visual Everwin",
    operationsAlt: "Interfaz operacional Everwin",
    dubaiAlt: "Skyline de Dubai",
    watchAlt: "Reloj de lujo dorado",
  },
};

function SlideVisual({
  visual,
  stats,
  bullets,
  ui,
  revShareLabel,
  monetizationLabel,
  prizeLabel,
}: {
  visual: "platform" | "support" | "levels" | "prize" | "summary" | "growth";
  stats?: string[];
  bullets: string[];
  ui: (typeof ONBOARDING_UI_COPY)[AffiliateLanguage];
  revShareLabel: string;
  monetizationLabel: string;
  prizeLabel: string;
}) {
  if (visual === "platform") {
    return (
      <div className="relative mx-auto w-full max-w-[720px]">
        <div className="relative rounded-t-[52px] bg-gray-800/10 px-3 pt-4 sm:px-4 sm:pt-5 md:px-8 md:pt-[21px]">
          <div className="relative overflow-hidden rounded-t-[34px] border border-gray-800/40 bg-gray-900 shadow-[0_30px_120px_-60px_rgba(15,23,42,0.55)]">
            <div className="aspect-[1600/882] w-full">
              <img
                src="/assets/hero.png"
                alt={ui.platformAlt}
                className="h-full w-full object-cover mix-blend-screen"
                draggable={false}
              />
            </div>
          </div>

          <div className="pointer-events-none absolute left-4 top-6 rounded-2xl bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] p-4 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.8)]">
            <p className="font-bricolage_grotesque text-sm text-emerald-400">{revShareLabel}</p>
            <p className="mt-2 font-bricolage_grotesque text-sm leading-6 text-white">{stats?.[0] ?? ""}</p>
          </div>

          <div className="pointer-events-none absolute bottom-8 right-6 rounded-2xl border border-white/10 bg-white p-4 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.45)]">
            <p className="font-bricolage_grotesque text-sm text-emerald-600">{monetizationLabel}</p>
            <p className="mt-2 font-bricolage_grotesque text-sm leading-6 text-gray-500">{stats?.[1] ?? ""}</p>
          </div>
        </div>
      </div>
    );
  }

  if (visual === "growth") {
    return (
      <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2">
        {bullets.map((bullet, index) => (
          <div key={bullet} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="font-bricolage_grotesque text-[11px] uppercase tracking-[0.14em] text-emerald-500">
              {ui.phaseLabel} {index + 1}
            </p>
            <p className="mt-3 font-bricolage_grotesque text-lg font-semibold leading-7 text-gray-800">{bullet}</p>
          </div>
        ))}
      </div>
    );
  }

  if (visual === "levels") {
    return (
      <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { name: "Starter", value: "50%" },
          { name: "Gold", value: "55%" },
          { name: "Diamond", value: "65%" },
          { name: "Titanium", value: "80%" },
        ].map((item) => (
          <div key={item.name} className="rounded-2xl bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] p-6">
            <p className="font-bricolage_grotesque text-sm text-emerald-400">{item.name}</p>
            <p className="mt-4 font-bricolage_grotesque text-5xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    );
  }

  if (visual === "support") {
    return (
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={REAL_MEDIA.managers}
          alt={ui.supportAlt}
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,19,26,0.92)_0%,rgba(17,19,26,0.72)_100%)]" />
        <div className="relative flex min-h-[420px] flex-col justify-end gap-4 p-8">
          {bullets.slice(0, 4).map((bullet) => (
            <div key={bullet} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bricolage_grotesque text-sm leading-6 text-white">{bullet}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual === "prize") {
    return (
      <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.12fr)_300px]">
        <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <p className="font-bricolage_grotesque text-xs uppercase tracking-[0.14em] text-emerald-600">{prizeLabel}</p>
          </div>

          <div className="mt-6 rounded-[24px] bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] p-6 md:p-8">
            <p className="font-bricolage_grotesque text-sm uppercase tracking-[0.14em] text-emerald-400">{stats?.[0] ?? "US$ 1M+"}</p>
            <p className="mt-4 font-bricolage_grotesque text-4xl font-semibold leading-[1] text-white md:text-5xl">Big Prize 2026</p>
            <p className="mt-4 max-w-[520px] font-bricolage_grotesque text-base leading-7 text-slate-300">
              {stats?.[1] ?? ""}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {bullets.map((bullet) => (
              <div key={bullet} className="rounded-[20px] border border-zinc-200 bg-neutral-100 p-4">
                <p className="font-bricolage_grotesque text-sm leading-6 text-gray-600">{bullet}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white p-3">
            <img
              src={REAL_MEDIA.dubai}
              alt={ui.dubaiAlt}
              className="h-[240px] w-full rounded-[22px] object-cover"
              draggable={false}
            />
          </div>
          <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white p-3">
            <img
              src={REAL_MEDIA.watch}
              alt={ui.watchAlt}
              className="h-[240px] w-full rounded-[22px] object-cover"
              draggable={false}
            />
          </div>
        </div>
      </div>
    );
  }

  if (visual === "summary") {
    return (
      <div className="grid h-full grid-cols-1 gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <img
            src="/assets/image2-everywin.png"
            alt={ui.operationsAlt}
            className="h-[220px] w-full rounded-2xl object-cover"
            draggable={false}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats?.map((item) => (
            <div key={item} className="rounded-2xl bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] p-6">
              <p className="font-bricolage_grotesque text-lg font-semibold leading-7 text-white">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-1 gap-4">
      {bullets.map((bullet) => (
        <div key={bullet} className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="font-bricolage_grotesque text-base leading-7 text-gray-600">{bullet}</p>
        </div>
      ))}
    </div>
  );
}

export default function AffiliateOnboardingPage() {
  const { i18n } = useTranslation();
  const language = getAffiliateLanguage(i18n.language);
  const content = getAffiliateContent(i18n.language);
  const ui = ONBOARDING_UI_COPY[language];
  const links = useAppLinks();
  const slides = content.onboarding.slides;

  const configuredPassword =
    (import.meta.env.VITE_AFFILIATE_ONBOARDING_PASSWORD as string | undefined)?.trim() ||
    DEFAULT_ONBOARDING_PASSWORD;

  const [inputPassword, setInputPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = slides[currentIndex];

  useEffect(() => {
    try {
      setUnlocked(window.sessionStorage.getItem(ONBOARDING_STORAGE_KEY) === "1");
    } catch {
      setUnlocked(false);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && currentIndex < slides.length - 1) {
        setCurrentIndex((index) => Math.min(index + 1, slides.length - 1));
      }
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((index) => Math.max(index - 1, 0));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, slides.length, unlocked]);

  const progress = useMemo(() => ((currentIndex + 1) / slides.length) * 100, [currentIndex, slides.length]);

  const unlock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputPassword.trim() !== configuredPassword) {
      setError(content.onboarding.gateError);
      return;
    }

    try {
      window.sessionStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
    } catch {
      // noop
    }

    setUnlocked(true);
    setError(null);
    setInputPassword("");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(187deg,rgb(246,247,249)_-24%,rgb(224,227,235)_100%)] text-gray-900">
      {!unlocked ? (
        <div className="mx-auto flex min-h-screen w-[90%] max-w-[560px] items-center justify-center py-12">
          <div className="w-full overflow-hidden rounded-[28px] border border-zinc-200 bg-white p-8 shadow-[0_30px_120px_-70px_rgba(15,23,42,0.45)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bricolage_grotesque text-sm text-emerald-500">{content.onboarding.topLabel}</p>
                <h1 className="font-bricolage_grotesque text-[30px] font-semibold leading-[1.05] text-gray-800">
                  {content.onboarding.gateTitle}
                </h1>
              </div>
            </div>

            <p className="mt-6 font-bricolage_grotesque text-base leading-[26px] text-gray-500">
              {content.onboarding.gateDescription}
            </p>

            <form className="mt-8 space-y-4" onSubmit={unlock}>
              <div className="space-y-2">
                <p className="font-bricolage_grotesque text-[11px] uppercase tracking-[0.14em] text-gray-500">
                  {content.onboarding.gateLabel}
                </p>
                <Input
                  type="password"
                  value={inputPassword}
                  onChange={(event) => setInputPassword(event.target.value)}
                  placeholder={content.onboarding.gatePlaceholder}
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="font-bricolage_grotesque text-sm text-red-700">{error}</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="font-bricolage_grotesque text-sm text-emerald-700">
                    {content.onboarding.unlockHint}
                  </p>
                </div>
              )}

              <Button type="submit" className="h-12 w-full bg-emerald-500 text-gray-900 hover:bg-emerald-400">
                {content.onboarding.gateButton}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col">
          <div className="border-b border-zinc-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex w-[90%] max-w-[1320px] items-center justify-between gap-6 py-5">
              <div>
                <p className="font-bricolage_grotesque text-sm text-emerald-500">{content.onboarding.topLabel}</p>
                <h1 className="font-bricolage_grotesque text-[28px] font-semibold leading-[1.05] text-gray-800">
                  {content.hero.badge}
                </h1>
              </div>

              <div className="hidden w-full max-w-[520px] flex-col gap-3 md:flex">
                <div className="h-2 overflow-hidden rounded-full bg-gray-800/10">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={[
                        "h-2 w-full rounded-full transition",
                        index === currentIndex ? "bg-emerald-500" : "bg-gray-800/10",
                      ].join(" ")}
                      aria-label={slide.title}
                    />
                  ))}
                </div>
              </div>

              <Link
                to="/affiliate"
                className="hidden rounded-2xl bg-gray-800/10 px-5 py-3 font-bricolage_grotesque text-sm font-medium text-gray-800 md:inline-flex"
              >
                {content.onboarding.openLanding}
              </Link>
            </div>
          </div>

          <div className="mx-auto flex w-[90%] max-w-[1320px] flex-1 flex-col justify-center py-8 md:py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center"
              >
                <div className="flex flex-col justify-center">
                  <div className="inline-flex w-fit items-center gap-2 rounded-[10px] bg-emerald-500/10 px-4 py-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <p className="font-bricolage_grotesque text-sm text-emerald-600">{currentSlide.eyebrow}</p>
                  </div>

                  <h2 className="mt-6 font-bricolage_grotesque text-[38px] font-semibold leading-[1.04] text-gray-800 md:text-[58px] md:leading-[1.02]">
                    {currentSlide.title}
                  </h2>
                  <p className="mt-6 max-w-[700px] font-bricolage_grotesque text-lg leading-[30px] text-gray-500">
                    {currentSlide.description}
                  </p>

                  <div className="mt-8 grid grid-cols-1 gap-3">
                    {currentSlide.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <p className="font-bricolage_grotesque text-base leading-[26px] text-gray-600">{bullet}</p>
                      </div>
                    ))}
                  </div>

                  {currentSlide.stats?.length ? (
                    <div className="mt-8 flex flex-wrap gap-3">
                      {currentSlide.stats.map((stat) => (
                        <div key={stat} className="rounded-2xl bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] px-5 py-4">
                          <p className="font-bricolage_grotesque text-sm text-white">{stat}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="h-full">
                  <SlideVisual
                    visual={currentSlide.visual}
                    stats={currentSlide.stats}
                    bullets={currentSlide.bullets}
                    ui={ui}
                    revShareLabel={content.hero.floatingCardTitle}
                    monetizationLabel={content.hero.floatingCardAltTitle}
                    prizeLabel={content.monetization.sideTitle}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-zinc-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex w-[90%] max-w-[1320px] flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-800/5 px-4 py-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <p className="font-bricolage_grotesque text-sm text-gray-600">
                  {currentIndex + 1} / {slides.length}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
                  disabled={currentIndex === 0}
                  className="h-12 min-w-[150px]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {content.onboarding.previous}
                </Button>

                {currentIndex === slides.length - 1 ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/affiliate"
                      className="inline-flex h-12 min-w-[150px] items-center justify-center rounded-md border border-slate-300 bg-white px-4 font-bricolage_grotesque text-sm font-medium text-slate-700"
                    >
                      {content.onboarding.openLanding}
                    </Link>
                    <a
                      href={links.register}
                      className="inline-flex h-12 min-w-[150px] items-center justify-center rounded-md bg-emerald-500 px-4 font-bricolage_grotesque text-sm font-medium text-gray-900"
                    >
                      {content.onboarding.finish}
                    </a>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setCurrentIndex((index) => Math.min(index + 1, slides.length - 1))}
                    className="h-12 min-w-[150px] bg-emerald-500 text-gray-900 hover:bg-emerald-400"
                  >
                    {content.onboarding.next}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
