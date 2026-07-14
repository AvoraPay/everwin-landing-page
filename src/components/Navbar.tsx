// everwin-page/src/components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppLinks } from "../hooks/useAppLinks";
import { useAnnouncementBar } from "../hooks/useAnnouncementBar";
import { LanguageSelector } from "./LanguageSelector";

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

export const Navbar = () => {
  const isDesktop = useIsDesktop(768);
  const { t } = useTranslation();
  const links = useAppLinks();
  const { visible: announcementVisible } = useAnnouncementBar();

  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (isDesktop) {
      setDrawerOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
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
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const onNavItem = (id: string) => {
    closeOverlays();

    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToId(id));
      });
      return;
    }

    scrollToId(id);
  };

  return (
    <header
      className="sticky inset-x-0 z-50 transition-[top] duration-150"
      style={{ top: announcementVisible ? 36 : 0 }}
    >
      <div className="border-b border-white/10 bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)]">
        <div className="mx-auto w-full max-w-[1060px] px-4 sm:px-6">
          <div style={{ height: barHeight }} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isDesktop && (
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
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
                className="block h-[34px] w-[120px] md:h-[38px] md:w-[130px]"
                aria-label="Everwin Home"
              >
                <img
                  src="https://i.postimg.cc/RFLkLvK0/everwin-logo.png"
                  alt="Everwin"
                  className="h-full w-full object-contain logo-pulse"
                  draggable={false}
                />
              </button>
            </div>

            {!isDesktop && (
              <div className="flex items-center gap-1">
                <LanguageSelector compact />
              </div>
            )}

            {isDesktop && (
              <nav className="flex items-center gap-6">
                {NAV_ITEMS.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => onNavItem(it.id)}
                    className="font-bricolage_grotesque text-sm text-white/90 transition hover:text-white"
                  >
                    {t(it.labelKey)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    closeOverlays();
                    navigate("/prop/landing");
                  }}
                  className="font-bricolage_grotesque text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
                >
                  {t("navbar.prop")}
                </button>
              </nav>
            )}

            {isDesktop && (
              <div className="flex items-center gap-2">
                <LanguageSelector compact />

                <a
                  href={links.login}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-4 font-bricolage_grotesque text-sm text-white transition hover:border-white hover:bg-white hover:text-emerald-700"
                >
                  {t("navbar.login")}
                </a>

                <a
                  href={links.register}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500/20 p-1 transition hover:bg-white"
                >
                  <span className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 font-bricolage_grotesque text-sm font-medium text-white transition hover:bg-white hover:text-emerald-700">
                    {t("navbar.create_account")}
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

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
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
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
            </div>

            <div className="px-2 py-2">
              {NAV_ITEMS.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => onNavItem(it.id)}
                  className="flex w-full items-center justify-between rounded-lg px-4 py-4 transition hover:bg-white/10"
                >
                  <span className="font-bricolage_grotesque text-[18px] text-white">{t(it.labelKey)}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/60">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  closeOverlays();
                  navigate("/prop/landing");
                }}
                className="flex w-full items-center justify-between rounded-lg px-4 py-4 transition hover:bg-white/10"
              >
                <span className="font-bricolage_grotesque text-[18px] font-semibold text-emerald-400">
                  {t("navbar.prop")}
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-400/60">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-auto border-t border-white/10 p-4">
              <div className="flex flex-col gap-3">
                <a
                  href={links.login}
                  onClick={closeOverlays}
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/20 font-bricolage_grotesque text-white transition hover:border-white hover:bg-white hover:text-emerald-700"
                >
                  {t("navbar.login")}
                </a>

                <a
                  href={links.register}
                  onClick={closeOverlays}
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-emerald-500 font-bricolage_grotesque font-medium text-white transition hover:bg-white hover:text-emerald-700"
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
