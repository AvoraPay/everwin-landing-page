// everwin-page/src/components/Navbar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppLinks } from "../hooks/useAppLinks";

const NAV_ITEMS = [
  { labelKey: "navbar.home", id: "top" },
  { labelKey: "navbar.assets", id: "assets" },
  { labelKey: "navbar.tools", id: "tools" },
  { labelKey: "navbar.tutorials", id: "tutorials" },
  { labelKey: "navbar.support", id: "support" },
  { labelKey: "navbar.faq", id: "faq" },
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

const FlagES = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 16" aria-hidden="true">
    <rect width="24" height="16" fill="#AA151B" />
    <rect width="24" height="8" y="4" fill="#F1BF00" />
  </svg>
);

export const Navbar = () => {
  const isDesktop = useIsDesktop(768);
  const { t, i18n } = useTranslation();
  const links = useAppLinks();

  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

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

  const closeOverlays = () => {
    setDrawerOpen(false);
    setLangOpen(false);
  };

  // ✅ scroll sem # na URL
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Compensa navbar fixa
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // ✅ clique do menu: se não estiver na home, volta pra home e depois rola
  const onNavItem = (id: string) => {
    closeOverlays();

    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      // espera o render da home antes de procurar o elemento
      requestAnimationFrame(() => {
        // 2 frames costuma ser mais estável com layout pesado
        requestAnimationFrame(() => scrollToId(id));
      });
      return;
    }

    scrollToId(id);
  };

  const LanguageButton = useMemo(() => {
    const currentLang = i18n.language; // or i18n.resolvedLanguage
    let Flag = FlagUK;
    if (currentLang.startsWith("pt")) Flag = FlagPT;
    if (currentLang.startsWith("es")) Flag = FlagES;

    const changeLanguage = (lng: string) => {
      i18n.changeLanguage(lng);
      setLangOpen(false);
    };

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
              onClick={() => changeLanguage("en")}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition text-left"
            >
              <span className="h-4 w-6 overflow-hidden rounded-sm block">
                <FlagUK className="h-4 w-6" />
              </span>
              <span className="text-white text-sm font-bricolage_grotesque">English</span>
            </button>

            <button
              type="button"
              onClick={() => changeLanguage("pt")}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition text-left"
            >
              <span className="h-4 w-6 overflow-hidden rounded-sm block">
                <FlagPT className="h-4 w-6" />
              </span>
              <span className="text-white text-sm font-bricolage_grotesque">Português</span>
            </button>

            <button
              type="button"
              onClick={() => changeLanguage("es")}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition text-left"
            >
              <span className="h-4 w-6 overflow-hidden rounded-sm block">
                <FlagES className="h-4 w-6" />
              </span>
              <span className="text-white text-sm font-bricolage_grotesque">Español</span>
            </button>
          </div>
        )}
      </div>
    );
  }, [langOpen, i18n.language, i18n]);

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

              <button
                type="button"
                onClick={() => {
                  closeOverlays();
                  if (location.pathname !== "/") navigate("/");
                  requestAnimationFrame(() => scrollToId("top"));
                }}
                className="block h-[34px] md:h-[38px] w-[120px] md:w-[130px]"
                aria-label="Everwin Home"
              >
                <img
                  src="https://i.postimg.cc/RFLkLvK0/everwin-logo.png"
                  alt="Everwin"
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </button>
            </div>

            {/* CENTER: desktop nav */}
            {isDesktop && (
              <nav className="flex items-center gap-6">
                {NAV_ITEMS.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => onNavItem(it.id)}
                    className="text-white/90 hover:text-white transition font-bricolage_grotesque text-sm"
                  >
                    {t(it.labelKey)}
                  </button>
                ))}
              </nav>
            )}

            {/* RIGHT: actions + language (desktop only) */}
            {isDesktop && (
              <div className="flex items-center gap-2">
                <a
                  href={links.login}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-white hover:bg-white hover:text-emerald-700 hover:border-white transition font-bricolage_grotesque text-sm"
                >
                  {t("navbar.login")}
                </a>

                <a
                  href={links.register}
                  className="inline-flex items-center justify-center p-1 rounded-xl bg-emerald-500/20 hover:bg-white transition"
                >
                  <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-white hover:text-emerald-700 transition font-bricolage_grotesque text-sm font-medium">
                    {t("navbar.create_account")}
                  </span>
                </a>

                {LanguageButton}
              </div>
            )}
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

              {LanguageButton}
            </div>

            {/* nav list */}
            <div className="px-2 py-2">
              {NAV_ITEMS.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => onNavItem(it.id)}
                  className="w-full flex items-center justify-between px-4 py-4 rounded-lg hover:bg-white/10 transition"
                >
                  <span className="text-white font-bricolage_grotesque text-[18px]">
                    {t(it.labelKey)}
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/60">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              ))}
            </div>

            {/* drawer actions */}
            <div className="mt-auto p-4 border-t border-white/10">
              <div className="flex flex-col gap-2">
                <a
                  href={links.login}
                  onClick={closeOverlays}
                  className="w-full inline-flex items-center justify-center h-11 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-white hover:bg-white hover:text-emerald-700 hover:border-white transition font-bricolage_grotesque"
                >
                  {t("navbar.login")}
                </a>

                <a
                  href={links.register}
                  onClick={closeOverlays}
                  className="w-full inline-flex items-center justify-center h-11 rounded-lg bg-emerald-500 text-white hover:bg-white hover:text-emerald-700 transition font-bricolage_grotesque font-medium"
                >
                  {t("navbar.create_account")}
                </a>
              </div>
            </div>
          </aside>
        </>
      )}
    </header>
  );
};

