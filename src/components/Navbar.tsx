// everwin-page/src/components/Navbar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

const LINKS = {
  home: "https://everwintrade.com/",
  login: "https://trade.everwintrade.com/pt/login",
  register: "https://trade.everwintrade.com/rn/register",
};

const NAV_ITEMS = [
  { label: "Home", href: "#top" },
  { label: "Assets", href: "#assets" },
  { label: "Tools", href: "#tools" },
  { label: "Tutorials", href: "#tutorials" },
  { label: "Support", href: "#support" },
  { label: "FAQ", href: "#faq" },
];

function useIsDesktop(minWidth = 768) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= minWidth;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const onChange = () => setIsDesktop(mq.matches);

    onChange();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, [minWidth]);

  return isDesktop;
}

type Locale = "en" | "pt";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem("everwin_locale");
  if (saved === "pt" || saved === "en") return saved;
  return "en";
}

function setLocaleGlobal(locale: Locale) {
  try {
    window.localStorage.setItem("everwin_locale", locale);
  } catch {}
  document.documentElement.lang = locale === "pt" ? "pt" : "en";
  window.dispatchEvent(
    new CustomEvent("everwin:locale-change", { detail: { locale } })
  );
}

const FlagUK = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 16" aria-hidden="true">
    <rect width="24" height="16" fill="#012169" />
    <path d="M0 0 L24 16 M24 0 L0 16" stroke="#FFF" strokeWidth="3.2" />
    <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.6" />
    <path d="M12 0v16 M0 8h24" stroke="#FFF" strokeWidth="5" />
    <path d="M12 0v16 M0 8h24" stroke="#C8102E" strokeWidth="3" />
  </svg>
);

const FlagPT = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 16" aria-hidden="true">
    <rect width="24" height="16" fill="#FF0000" />
    <rect width="10" height="16" fill="#006600" />
    <circle cx="10" cy="8" r="3.2" fill="#FFD700" />
    <circle cx="10" cy="8" r="1.6" fill="#FFF" opacity="0.9" />
  </svg>
);

export const Navbar = () => {
  const isDesktop = useIsDesktop(768);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    setLocaleGlobal(locale);
  }, [locale]);

  useEffect(() => {
    if (isDesktop) {
      setDrawerOpen(false);
      setLangOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setLangOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const barHeight = isDesktop ? 78 : 64;

  const onNavClick = () => {
    setDrawerOpen(false);
    setLangOpen(false);
  };

  const LanguageButton = useMemo(() => {
    const Flag = locale === "pt" ? FlagPT : FlagUK;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setLangOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/10 transition"
          aria-label="Language selector"
          aria-expanded={langOpen}
        >
          <span className="h-4 w-6 overflow-hidden rounded-sm block">
            <Flag className="h-4 w-6" />
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {langOpen && (
          <div className="absolute right-0 mt-2 w-[170px] rounded-lg border border-white/10 bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] shadow-xl overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setLocale("en");
                setLangOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition text-left"
            >
              <span className="h-4 w-6 overflow-hidden rounded-sm block">
                <FlagUK className="h-4 w-6" />
              </span>
              <span className="text-white text-sm font-bricolage_grotesque">English</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLocale("pt");
                setLangOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition text-left"
            >
              <span className="h-4 w-6 overflow-hidden rounded-sm block">
                <FlagPT className="h-4 w-6" />
              </span>
              <span className="text-white text-sm font-bricolage_grotesque">Português</span>
            </button>
          </div>
        )}
      </div>
    );
  }, [langOpen, locale]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* TOP BAR */}
      <div className="border-b border-white/10 bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)]">
        <div className="mx-auto max-w-[1060px] w-full px-4 sm:px-6">
          <div style={{ height: barHeight }} className="flex items-center justify-between">
            {/* LEFT: hamburger (mobile) + logo */}
            <div className="flex items-center gap-3">
              {!isDesktop && (
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open menu"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-white/10 transition text-white"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 7h16M4 12h16M4 17h16"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}

              <a
                href={LINKS.home}
                className="block h-[34px] md:h-[38px] w-[120px] md:w-[130px]"
                aria-label="Everwin Home"
              >
                <img
                  src="https://i.postimg.cc/RFLkLvK0/everwin-logo.png"
                  alt="Everwin"
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </a>
            </div>

            {/* CENTER: desktop nav */}
            {isDesktop && (
              <nav className="flex items-center gap-6">
                {NAV_ITEMS.map((it) => (
                  <a
                    key={it.href}
                    href={it.href}
                    className="text-white/90 hover:text-white transition font-bricolage_grotesque text-sm"
                  >
                    {it.label}
                  </a>
                ))}
              </nav>
            )}

            {/* RIGHT: actions + language (language only on desktop, and after buttons) */}
            <div className="flex items-center gap-2">
              <a
                href={LINKS.login}
                className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-white hover:bg-white hover:text-emerald-700 hover:border-white transition font-bricolage_grotesque text-sm"
              >
                Entrar
              </a>

              <a
                href={LINKS.register}
                className="inline-flex items-center justify-center p-1 rounded-xl bg-emerald-500/20 hover:bg-white transition"
              >
                <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-white hover:text-emerald-700 transition font-bricolage_grotesque text-sm font-medium">
                  Cadastrar
                </span>
              </a>

              {/* ✅ desktop: bandeira à direita dos botões */}
              {isDesktop && LanguageButton}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {!isDesktop && (
        <>
          {drawerOpen && (
            <button
              type="button"
              aria-label="Close menu overlay"
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/50"
            />
          )}

          <aside
            className={[
              "fixed inset-y-0 left-0 z-50 w-[82%] max-w-[340px] border-r border-white/10",
              "bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)]",
              "transform transition-transform duration-200 ease-out",
              drawerOpen ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
          >
            {/* drawer header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-white/10 transition text-white"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* ✅ mobile: bandeira no menu, canto superior direito */}
              {LanguageButton}
            </div>

            {/* nav list */}
            <div className="px-2 py-2">
              {NAV_ITEMS.map((it) => (
                <a
                  key={it.href}
                  href={it.href}
                  onClick={onNavClick}
                  className="flex items-center justify-between px-4 py-4 rounded-lg hover:bg-white/10 transition"
                >
                  <span className="text-white font-bricolage_grotesque text-[18px]">
                    {it.label}
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/60">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </a>
              ))}
            </div>

            {/* drawer actions */}
            <div className="mt-auto p-4 border-t border-white/10">
              <div className="flex flex-col gap-2">
                <a
                  href={LINKS.login}
                  onClick={onNavClick}
                  className="w-full inline-flex items-center justify-center h-11 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-white hover:bg-white hover:text-emerald-700 hover:border-white transition font-bricolage_grotesque"
                >
                  Entrar
                </a>

                <a
                  href={LINKS.register}
                  onClick={onNavClick}
                  className="w-full inline-flex items-center justify-center h-11 rounded-lg bg-emerald-500 text-white hover:bg-white hover:text-emerald-700 transition font-bricolage_grotesque font-medium"
                >
                  Cadastrar
                </a>
              </div>
            </div>
          </aside>
        </>
      )}
    </header>
  );
};
