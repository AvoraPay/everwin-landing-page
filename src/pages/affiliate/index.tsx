import { useEffect, useRef, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  Crown,
  Gift,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Parallax } from "../../components/Parallax";
import { Reveal } from "../../components/Reveal";
import { useAppLinks } from "../../hooks/useAppLinks";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { StepCard } from "../../sections/StepsSection/components/StepCard";
import { getAffiliateContent, getAffiliateLanguage, type AffiliateLanguage } from "./content";

const REAL_MEDIA = {
  managers: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1600",
  dubai: "https://images.pexels.com/photos/35664165/pexels-photo-35664165.jpeg?auto=compress&cs=tinysrgb&w=1600",
  watch: "https://images.pexels.com/photos/10842471/pexels-photo-10842471.jpeg?auto=compress&cs=tinysrgb&w=1200",
} as const;

const AFFILIATE_UI_COPY: Record<
  AffiliateLanguage,
  {
    platformAlt: string;
    operationsAlt: string;
    featuredAlt: string;
    supportAlt: string;
    commercialEyebrow: string;
    commercialTitle: string;
    dashboardLabel: string;
    dashboardBody: string;
    operationLabel: string;
    operationBody: string;
    registrationsLabel: string;
    ftdsLabel: string;
    infoProductsCommission: string;
    bigPrizeCardTitle: string;
    bigPrizeCardDescription: string;
    targetMessageLead: string;
    targetMessageHighlight: string;
    managersBadge: string;
    managersTitle: string;
    dubaiBadge: string;
    dubaiTitle: string;
    watchBadge: string;
    watchTitle: string;
    dubaiAlt: string;
    watchAlt: string;
  }
> = {
  pt: {
    platformAlt: "Interface da plataforma Everwin",
    operationsAlt: "Interface da plataforma Everwin com area operacional",
    featuredAlt: "Visual da plataforma Everwin em destaque",
    supportAlt: "Equipe de suporte Everwin",
    commercialEyebrow: "Estrutura comercial e operacional",
    commercialTitle: "O parceiro cresce com leitura de dados, suporte e ativos prontos para rodar.",
    dashboardLabel: "Dashboard",
    dashboardBody: "Cadastros, FTDs e pagamentos",
    operationLabel: "Operacao",
    operationBody: "Funil, lives e conversao",
    registrationsLabel: "Cadastros",
    ftdsLabel: "FTDs",
    infoProductsCommission: "Comissao adicional com infoprodutos do ecossistema",
    bigPrizeCardTitle: "Big Prize 2026",
    bigPrizeCardDescription:
      "Ao ultrapassar US$ 1.000.000 em comissoes elegiveis, o parceiro recebe viagem oficial para Dubai, Rolex Datejust e reconhecimento institucional dentro do programa.",
    targetMessageLead: "marco elegivel para",
    targetMessageHighlight: " premiacao integral",
    managersBadge: "Gerentes de conta",
    managersTitle: "Apresentacao, follow-up e suporte comercial com cara de operacao real.",
    dubaiBadge: "Experiencia oficial",
    dubaiTitle: "Dubai funciona como a experiencia de celebracao reservada a quem constroi escala real com performance consistente.",
    watchBadge: "Reconhecimento institucional",
    watchTitle: "O Rolex Datejust simboliza o marco atingido e o nivel de relevancia comercial conquistado dentro do ecossistema.",
    dubaiAlt: "Skyline de Dubai",
    watchAlt: "Relogio de luxo dourado",
  },
  en: {
    platformAlt: "Everwin platform interface",
    operationsAlt: "Everwin platform interface with operational area",
    featuredAlt: "Featured Everwin platform visual",
    supportAlt: "Everwin support team",
    commercialEyebrow: "Commercial and operational structure",
    commercialTitle: "Partners grow with data visibility, support, and assets that are ready to launch.",
    dashboardLabel: "Dashboard",
    dashboardBody: "Registrations, FTDs, and payouts",
    operationLabel: "Operation",
    operationBody: "Funnels, live sessions, and conversion",
    registrationsLabel: "Registrations",
    ftdsLabel: "FTDs",
    infoProductsCommission: "Additional commission from ecosystem info-products",
    bigPrizeCardTitle: "Big Prize 2026",
    bigPrizeCardDescription:
      "Once the partner exceeds US$ 1,000,000 in eligible commissions, they receive an official Dubai trip, a Rolex Datejust, and institutional recognition inside the program.",
    targetMessageLead: "eligible milestone for",
    targetMessageHighlight: " full reward package",
    managersBadge: "Account managers",
    managersTitle: "Presentation, follow-up, and commercial support that feel like a real sales operation.",
    dubaiBadge: "Official experience",
    dubaiTitle: "Dubai becomes the celebration experience reserved for partners who build real scale with consistent performance.",
    watchBadge: "Institutional recognition",
    watchTitle: "The Rolex Datejust marks the milestone achieved and the level of commercial relevance earned inside the ecosystem.",
    dubaiAlt: "Dubai skyline",
    watchAlt: "Luxury gold watch",
  },
  es: {
    platformAlt: "Interfaz de la plataforma Everwin",
    operationsAlt: "Interfaz de la plataforma Everwin con area operativa",
    featuredAlt: "Visual destacado de la plataforma Everwin",
    supportAlt: "Equipo de soporte Everwin",
    commercialEyebrow: "Estructura comercial y operativa",
    commercialTitle: "El socio crece con lectura de datos, soporte y activos listos para salir al mercado.",
    dashboardLabel: "Dashboard",
    dashboardBody: "Registros, FTDs y pagos",
    operationLabel: "Operacion",
    operationBody: "Funnel, lives y conversion",
    registrationsLabel: "Registros",
    ftdsLabel: "FTDs",
    infoProductsCommission: "Comision adicional con infoproductos del ecosistema",
    bigPrizeCardTitle: "Big Prize 2026",
    bigPrizeCardDescription:
      "Al superar US$ 1.000.000 en comisiones elegibles, el socio recibe viaje oficial a Dubai, Rolex Datejust y reconocimiento institucional dentro del programa.",
    targetMessageLead: "hito elegible para",
    targetMessageHighlight: " premio completo",
    managersBadge: "Managers de cuenta",
    managersTitle: "Presentacion, seguimiento y soporte comercial con cara de operacion real.",
    dubaiBadge: "Experiencia oficial",
    dubaiTitle: "Dubai funciona como la experiencia de celebracion reservada a quienes construyen escala real con performance consistente.",
    watchBadge: "Reconocimiento institucional",
    watchTitle: "El Rolex Datejust simboliza el hito alcanzado y el nivel de relevancia comercial conquistado dentro del ecosistema.",
    dubaiAlt: "Skyline de Dubai",
    watchAlt: "Reloj de lujo dorado",
  },
};

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-5 text-center">
      <div className="inline-flex items-center gap-2 rounded-[10px] bg-emerald-500/10 px-4 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <p className="font-bricolage_grotesque text-sm text-emerald-600">{eyebrow}</p>
      </div>
      <h2 className="max-w-[860px] font-bricolage_grotesque text-[34px] font-semibold leading-[1.06] text-gray-800 md:text-[52px] md:leading-[1.05]">
        {title}
      </h2>
      <p className="max-w-[760px] font-bricolage_grotesque text-base leading-[26px] text-gray-500">
        {description}
      </p>
    </div>
  );
}

function DarkFeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-400">
        {icon}
      </div>
      <h3 className="font-bricolage_grotesque text-2xl font-semibold leading-[1.1] text-white">{title}</h3>
      <p className="font-bricolage_grotesque text-base leading-[26px] text-slate-300">{description}</p>
    </div>
  );
}

function LightFeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6">
      <p className="font-bricolage_grotesque text-[24px] font-semibold leading-[1.1] text-gray-800">{title}</p>
      <p className="mt-4 font-bricolage_grotesque text-base leading-[26px] text-gray-500">{description}</p>
    </div>
  );
}

function VisualPhotoCard({
  src,
  alt,
  eyebrow,
  title,
}: {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <img src={src} alt={alt} className="h-[240px] w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,19,26,0.02)_0%,rgba(17,19,26,0.84)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="font-bricolage_grotesque text-[11px] uppercase tracking-[0.16em] text-emerald-300">{eyebrow}</p>
        <p className="mt-2 font-bricolage_grotesque text-lg font-semibold leading-7 text-white">{title}</p>
      </div>
    </div>
  );
}

function PrizeMediaCard({
  src,
  alt,
  eyebrow,
  title,
}: {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_-44px_rgba(15,23,42,0.24)]">
      <img src={src} alt={alt} className="h-[240px] w-full object-cover" loading="lazy" />
      <div className="p-6">
        <p className="font-bricolage_grotesque text-[11px] uppercase tracking-[0.16em] text-emerald-500">{eyebrow}</p>
        <p className="mt-3 font-bricolage_grotesque text-lg font-semibold leading-7 text-gray-800">{title}</p>
      </div>
    </div>
  );
}

function AffiliateHeroVisual({
  floatingCardTitle,
  floatingCardBody,
  floatingCardAltTitle,
  floatingCardAltBody,
  platformAlt,
}: {
  floatingCardTitle: string;
  floatingCardBody: string;
  floatingCardAltTitle: string;
  floatingCardAltBody: string;
  platformAlt: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[1120px]">
      <Parallax config={{ y: [-10, 20], scale: [1, 1.01], rotate: [0, 0] }}>
        <div className="relative rounded-t-[52px] bg-gray-800/10 px-3 pt-4 sm:px-4 sm:pt-5 md:px-8 md:pt-[21px]">
          <div className="relative overflow-hidden rounded-t-[34px] border border-gray-800/40 bg-gray-900 shadow-[0_30px_120px_-60px_rgba(15,23,42,0.55)]">
            <div className="aspect-[1600/882] w-full">
              <img
                src="/assets/hero.png"
                alt={platformAlt}
                className="h-full w-full object-cover mix-blend-screen"
                draggable={false}
              />
            </div>
          </div>

          <div className="pointer-events-none absolute left-4 top-5 w-[190px] sm:left-8 sm:w-[230px] md:left-12 md:top-8">
            <div className="rounded-2xl bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] p-4 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.8)]">
              <p className="font-bricolage_grotesque text-sm text-emerald-400">{floatingCardTitle}</p>
              <p className="mt-2 font-bricolage_grotesque text-sm leading-6 text-white">{floatingCardBody}</p>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-6 right-2 w-[210px] sm:right-4 sm:w-[250px] md:right-10 md:bottom-10">
            <div className="rounded-2xl border border-white/10 bg-white p-4 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.45)]">
              <p className="font-bricolage_grotesque text-sm text-emerald-600">{floatingCardAltTitle}</p>
              <p className="mt-2 font-bricolage_grotesque text-sm leading-6 text-gray-500">{floatingCardAltBody}</p>
            </div>
          </div>
        </div>
      </Parallax>
    </div>
  );
}

function AffiliateSteps({
  titleLine1,
  titleLine2,
  description,
  items,
}: ReturnType<typeof getAffiliateContent>["steps"]) {
  const stepsWrapRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(stepsWrapRef, { start: 0.9, end: 0.25 });

  return (
    <div className="relative mx-auto flex w-full max-w-[810px] flex-col items-center justify-center px-4 py-[90px] md:px-0">
      <div className="flex w-full flex-col items-center justify-center gap-y-20">
        <div className="relative z-[1] flex w-full flex-col items-center justify-center gap-y-6 overflow-hidden">
          <div className="w-full">
            <p className="font-bricolage_grotesque text-center text-[42px] leading-[44px] text-gray-800 md:text-[62px] md:leading-[62px]">
              {titleLine1}
            </p>
            <p className="font-bricolage_grotesque text-center text-[42px] leading-[44px] text-emerald-500 md:text-[62px] md:leading-[62px]">
              <strong className="font-bold">{titleLine2}</strong>
            </p>
          </div>

          <p className="font-bricolage_grotesque text-center text-base font-light leading-6 text-gray-500">
            {description}
          </p>
        </div>

        <div ref={stepsWrapRef} className="relative w-full">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[35px] left-[35px] top-[35px] w-[3px] overflow-hidden rounded-full bg-gray-800/10"
          >
            <div
              className="absolute left-0 top-0 h-full w-full origin-top rounded-full bg-emerald-400 will-change-transform"
              style={{ transform: `scaleY(${progress})` }}
            />
          </div>

          <div className="relative flex w-full flex-col">
            {items.map((item) => (
              <StepCard
                key={item.step}
                stepNumber={item.step}
                title={item.eyebrow}
                subtitle={item.title}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Affiliate() {
  const { i18n } = useTranslation();
  const language = getAffiliateLanguage(i18n.language);
  const content = getAffiliateContent(i18n.language);
  const ui = AFFILIATE_UI_COPY[language];
  const links = useAppLinks();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <div className="w-full">
      <section className="relative flex w-full flex-col items-center overflow-hidden bg-[linear-gradient(187deg,rgb(246,247,249)_-24%,rgb(224,227,235)_100%)] px-4 pt-[96px] md:px-0">
        <Reveal className="relative z-[2] flex w-full max-w-[980px] flex-col items-center gap-5 md:gap-6">
          <div className="inline-flex items-center gap-2 rounded-[10px] bg-emerald-500/10 px-4 py-2">
            <Crown className="h-4 w-4 text-emerald-500" />
            <p className="font-bricolage_grotesque text-sm text-emerald-600">{content.hero.badge}</p>
          </div>

          <h1 className="text-center font-bricolage_grotesque text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-gray-800 sm:text-[48px] md:text-[62px]">
            <span className="block">{content.hero.titleLine1}</span>
            <span className="block text-emerald-500">{content.hero.titleLine2}</span>
          </h1>

          <p className="max-w-[820px] text-center font-bricolage_grotesque text-base leading-[26px] text-gray-500 md:text-lg">
            {content.hero.description}
          </p>

          <div className="flex w-full flex-col items-center justify-center gap-3 md:flex-row md:gap-4">
            <a
              href="#affiliate-overview"
              className="group relative w-full max-w-[260px] overflow-hidden rounded-2xl bg-emerald-500/10 p-2"
            >
              <div className="flex h-[64px] items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 transition-transform duration-300 group-hover:scale-[1.01]">
                <span className="font-bricolage_grotesque text-base font-medium text-gray-900">
                  {content.hero.primaryCta}
                </span>
                <ArrowRight className="h-4 w-4 text-gray-900" />
              </div>
            </a>

            <Link
              to="/affiliate/onboarding"
              className="group relative w-full max-w-[260px] overflow-hidden rounded-2xl bg-gray-800/10 p-2"
            >
              <div className="flex h-[64px] items-center justify-center rounded-lg bg-white px-6 transition-transform duration-300 group-hover:scale-[1.01]">
                <span className="font-bricolage_grotesque text-base font-medium text-gray-800">
                  {content.hero.secondaryCta}
                </span>
              </div>
            </Link>
          </div>
        </Reveal>

        <div className="relative z-[1] mt-10 w-full md:mt-14">
          <Reveal>
            <AffiliateHeroVisual
              floatingCardTitle={content.hero.floatingCardTitle}
              floatingCardBody={content.hero.floatingCardBody}
              floatingCardAltTitle={content.hero.floatingCardAltTitle}
              floatingCardAltBody={content.hero.floatingCardAltBody}
              platformAlt={ui.platformAlt}
            />
          </Reveal>
        </div>
      </section>

      <section id="affiliate-overview" className="relative w-full py-[90px]">
        <div className="mx-auto flex w-[90%] max-w-[1060px] flex-col gap-12">
          <Reveal>
            <SectionHeading
              eyebrow={content.overview.eyebrow}
              title={content.overview.title}
              description={content.overview.description}
            />
          </Reveal>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {content.hero.stats.map((item, index) => (
              <Reveal key={item.label} delay={index * 80}>
                <div className="h-full overflow-hidden rounded-2xl border-2 border-zinc-200 p-6">
                  <p className="font-bricolage_grotesque text-[34px] font-semibold leading-[1] text-gray-800">
                    {item.value}
                  </p>
                  <p className="mt-3 font-bricolage_grotesque text-lg font-semibold text-emerald-500">
                    {item.label}
                  </p>
                  <p className="mt-3 font-bricolage_grotesque text-sm leading-6 text-gray-500">
                    {item.note}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.05fr_0.95fr]">
            <Reveal className="h-full">
              <div className="grid h-full grid-cols-1 gap-5 sm:grid-cols-2">
                {content.overview.features.map((item, index) => (
                  <LightFeatureCard
                    key={item.title}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            </Reveal>

            <Reveal delay={120} className="h-full">
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] p-6 md:p-8">
                <div>
                  <p className="font-bricolage_grotesque text-sm text-emerald-400">
                    {ui.commercialEyebrow}
                  </p>
                  <h3 className="mt-4 font-bricolage_grotesque text-[34px] font-semibold leading-[1.02] text-white">
                    {ui.commercialTitle}
                  </h3>
                </div>

                <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <img
                    src="/assets/image2-everywin.png"
                    alt={ui.operationsAlt}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-bricolage_grotesque text-[11px] uppercase tracking-[0.14em] text-slate-400">
                      {ui.dashboardLabel}
                    </p>
                    <p className="mt-2 font-bricolage_grotesque text-lg font-semibold text-white">
                      {ui.dashboardBody}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-bricolage_grotesque text-[11px] uppercase tracking-[0.14em] text-slate-400">
                      {ui.operationLabel}
                    </p>
                    <p className="mt-2 font-bricolage_grotesque text-lg font-semibold text-white">
                      {ui.operationBody}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative w-full overflow-hidden bg-[linear-gradient(187deg,rgb(246,247,249)_-24%,rgb(224,227,235)_100%)]">
        <Reveal>
          <AffiliateSteps {...content.steps} />
        </Reveal>
      </section>

      <section className="relative w-full py-[90px]">
        <div className="mx-auto flex w-[90%] max-w-[1060px] flex-col gap-12">
          <Reveal>
            <SectionHeading
              eyebrow={content.commission.eyebrow}
              title={content.commission.title}
              description={content.commission.description}
            />
          </Reveal>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-[0.92fr_1.08fr]">
            <Reveal className="h-full">
              <div className="flex h-full flex-col justify-between rounded-2xl bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] p-6 md:p-8">
                <div>
                  <p className="font-bricolage_grotesque text-sm text-emerald-400">
                    {content.commission.levelsTitle}
                  </p>
                  <h3 className="mt-4 font-bricolage_grotesque text-[36px] font-semibold leading-[1.04] text-white">
                    {content.commission.levelsDescription}
                  </h3>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  {content.commission.highlights.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-bricolage_grotesque text-sm leading-6 text-slate-200">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 overflow-hidden rounded-2xl">
                  <img
                    src="/assets/image-3.png"
                    alt={ui.featuredAlt}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {content.commission.levels.map((level, index) => (
                <Reveal key={level.name} delay={index * 60}>
                  <div className="h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bricolage_grotesque text-[22px] font-semibold leading-[1.12] text-gray-800">
                          {level.name}
                        </p>
                        <p className="mt-3 font-bricolage_grotesque text-sm leading-6 text-gray-500">
                          {level.description}
                        </p>
                      </div>
                      <div className="rounded-xl bg-emerald-500/10 px-3 py-2">
                        <p className="font-bricolage_grotesque text-lg font-semibold text-emerald-600">
                          {level.commission}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-neutral-100 p-4">
                        <p className="font-bricolage_grotesque text-[11px] uppercase tracking-[0.14em] text-gray-500">
                          {ui.registrationsLabel}
                        </p>
                        <p className="mt-2 font-bricolage_grotesque text-xl font-semibold text-gray-800">
                          {level.registrations}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-neutral-100 p-4">
                        <p className="font-bricolage_grotesque text-[11px] uppercase tracking-[0.14em] text-gray-500">
                          {ui.ftdsLabel}
                        </p>
                        <p className="mt-2 font-bricolage_grotesque text-xl font-semibold text-gray-800">
                          {level.ftds}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="support" className="relative w-full overflow-hidden py-[90px]">
        <div className="absolute inset-0">
          <img
            src="/assets/bg-helpdesk.jpg"
            alt={ui.supportAlt}
            className="h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,19,26,0.94)_0%,rgba(17,19,26,0.76)_48%,rgba(17,19,26,0.82)_100%)]" />
        </div>

        <div className="relative mx-auto flex w-[90%] max-w-[1060px] flex-col gap-10">
          <Reveal>
            <div className="max-w-[560px]">
              <div className="inline-flex items-center gap-2 rounded-[10px] bg-emerald-500/10 px-4 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <p className="font-bricolage_grotesque text-sm text-emerald-400">{content.support.eyebrow}</p>
              </div>
              <h2 className="mt-6 font-bricolage_grotesque text-[38px] font-semibold leading-[1.04] text-white md:text-[62px] md:leading-[1.04]">
                {content.support.title}
              </h2>
              <p className="mt-6 font-bricolage_grotesque text-lg leading-[30px] text-slate-300">
                {content.support.description}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Reveal>
              <VisualPhotoCard
                src={REAL_MEDIA.managers}
                alt={ui.supportAlt}
                eyebrow={ui.managersBadge}
                title={ui.managersTitle}
              />
            </Reveal>
            <Reveal delay={80}>
              <VisualPhotoCard
                src={REAL_MEDIA.dubai}
                alt={ui.dubaiAlt}
                eyebrow={ui.dubaiBadge}
                title={ui.dubaiTitle}
              />
            </Reveal>
            <Reveal delay={160}>
              <VisualPhotoCard
                src={REAL_MEDIA.watch}
                alt={ui.watchAlt}
                eyebrow={ui.watchBadge}
                title={ui.watchTitle}
              />
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Reveal delay={60}>
              <DarkFeatureCard
                title={content.support.features[0].title}
                description={content.support.features[0].description}
                icon={<Users className="h-5 w-5" />}
              />
            </Reveal>
            <Reveal delay={120}>
              <DarkFeatureCard
                title={content.support.features[1].title}
                description={content.support.features[1].description}
                icon={<Rocket className="h-5 w-5" />}
              />
            </Reveal>
            <Reveal delay={180}>
              <DarkFeatureCard
                title={content.support.features[2].title}
                description={content.support.features[2].description}
                icon={<BriefcaseBusiness className="h-5 w-5" />}
              />
            </Reveal>
            <Reveal delay={240}>
              <DarkFeatureCard
                title={content.support.features[3].title}
                description={content.support.features[3].description}
                icon={<ShieldCheck className="h-5 w-5" />}
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative w-full py-[90px]">
        <div className="mx-auto flex w-[90%] max-w-[1060px] flex-col gap-12">
          <Reveal>
            <SectionHeading
              eyebrow={content.monetization.eyebrow}
              title={content.monetization.title}
              description={content.monetization.description}
            />
          </Reveal>

          <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,1.08fr)_360px]">
            <div className="grid gap-5">
              <Reveal>
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_-44px_rgba(15,23,42,0.24)]">
                  <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
                        <Gift className="h-4 w-4 text-emerald-500" />
                        <p className="font-bricolage_grotesque text-[11px] uppercase tracking-[0.16em] text-emerald-600">
                          {content.monetization.sideTitle}
                        </p>
                      </div>
                      <p className="mt-5 font-bricolage_grotesque text-[30px] font-semibold leading-[1.05] text-gray-800 md:text-[38px]">
                        {content.monetization.prizeTitle}
                      </p>
                      <p className="mt-4 font-bricolage_grotesque text-base leading-[28px] text-gray-500">
                        {content.monetization.prizeBody}
                      </p>
                      <p className="mt-4 font-bricolage_grotesque text-base leading-[28px] text-gray-600">
                        {content.monetization.sideBody}
                      </p>
                    </div>

                    <div className="rounded-[24px] bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] p-6">
                      <p className="font-bricolage_grotesque text-[11px] uppercase tracking-[0.16em] text-emerald-400">
                        {ui.bigPrizeCardTitle}
                      </p>
                      <p className="mt-4 font-bricolage_grotesque text-5xl font-bold leading-none text-white">US$ 1M+</p>
                      <p className="mt-4 font-bricolage_grotesque text-base leading-7 text-slate-300">
                        {ui.targetMessageLead}
                        <span className="text-emerald-400">{ui.targetMessageHighlight}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <Reveal delay={80}>
                  <div className="flex h-full flex-col justify-center rounded-[28px] bg-emerald-500 p-8 shadow-[0_24px_60px_-40px_rgba(16,185,129,0.42)]">
                    <p className="font-bricolage_grotesque text-5xl font-bold leading-none text-white">60%</p>
                    <p className="mt-4 font-bricolage_grotesque text-lg leading-7 text-white/90">
                      {ui.infoProductsCommission}
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={120}>
                  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.24)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-500">
                        <BadgeDollarSign className="h-5 w-5" />
                      </div>
                      <p className="font-bricolage_grotesque text-sm text-emerald-500">{ui.bigPrizeCardTitle}</p>
                    </div>
                    <p className="mt-4 font-bricolage_grotesque text-base leading-[28px] text-gray-600">
                      {ui.bigPrizeCardDescription}
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {content.monetization.bullets.map((item) => (
                        <div key={item} className="rounded-[20px] bg-neutral-100 p-4">
                          <p className="font-bricolage_grotesque text-sm leading-6 text-gray-600">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <Reveal className="w-full">
                <PrizeMediaCard
                  src={REAL_MEDIA.dubai}
                  alt={ui.dubaiAlt}
                  eyebrow={ui.dubaiBadge}
                  title={ui.dubaiTitle}
                />
              </Reveal>

              <Reveal delay={120} className="w-full">
                <PrizeMediaCard
                  src={REAL_MEDIA.watch}
                  alt={ui.watchAlt}
                  eyebrow={ui.watchBadge}
                  title={ui.watchTitle}
                />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full overflow-hidden pt-[90px] pb-20">
        <div className="mx-auto w-[90%] max-w-[1060px]">
          <Reveal>
            <div className="flex w-full flex-col items-center gap-y-6">
              <SectionHeading
                eyebrow={content.executive.eyebrow}
                title={content.executive.title}
                description={content.executive.description}
              />

              <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {content.executive.points.map((item, index) => (
                  <Reveal key={item} delay={index * 50}>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                      <p className="font-bricolage_grotesque text-base leading-[26px] text-gray-600">{item}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-2 flex w-full flex-col items-center justify-center gap-3 md:flex-row">
                <a
                  href={links.register}
                  className="group relative w-full max-w-[260px] overflow-hidden rounded-2xl bg-emerald-500/10 p-2"
                >
                  <div className="flex h-[64px] items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 transition-transform duration-300 group-hover:scale-[1.01]">
                    <span className="font-bricolage_grotesque text-base font-medium text-gray-900">
                      {content.executive.primaryCta}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-900" />
                  </div>
                </a>

                <Link
                  to="/affiliate/onboarding"
                  className="group relative w-full max-w-[260px] overflow-hidden rounded-2xl bg-gray-800/10 p-2"
                >
                  <div className="flex h-[64px] items-center justify-center rounded-lg bg-white px-6 transition-transform duration-300 group-hover:scale-[1.01]">
                    <span className="font-bricolage_grotesque text-base font-medium text-gray-800">
                      {content.executive.secondaryCta}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
