// src/pages/legal/LegalLayout.tsx
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LEGAL_ITEMS, legalPath } from "./legalNav";

function cx(...x: Array<string | false | undefined>) {
  return x.filter(Boolean).join(" ");
}

export const LegalLayout = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="w-full bg-neutral-100 p-5">
      {/* container igual Home */}
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* espaçamento vertical igual “seção” */}
        <div className="py-10 md:py-14">
          {/* Card principal */}
          <div className="rounded-3xl border border-gray-200 bg-white shadow-[0_20px_60px_-35px_rgba(0,0,0,0.25)] overflow-hidden">
            {/* Top bar do card */}
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-5 md:px-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bricolage_grotesque">
                  {t("legal_section.top_title")}
                </p>
                <p className="mt-1 text-sm text-gray-500 font-bricolage_grotesque">
                  {t("legal_section.top_desc")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="md:hidden inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-gray-800 shadow-sm hover:bg-gray-50 transition font-bricolage_grotesque"
              >
                <span>{t("legal_section.policies_title")}</span>
                <span className="text-gray-400">☰</span>
              </button>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-[320px_1fr]">
              {/* Sidebar desktop */}
              <aside className="hidden md:block border-r border-gray-200 bg-[linear-gradient(to_bottom,#ffffff,#fbfbfb)]">
                <div className="p-5">
                  <div className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-gray-400 font-bricolage_grotesque">
                    {t("legal_section.policies_title")}
                  </div>

                  <nav className="mt-2 flex flex-col gap-1">
                    {LEGAL_ITEMS.map((it) => (
                      <NavLink
                        key={it.slug}
                        to={legalPath(it.slug)}
                        className={({ isActive }) =>
                          cx(
                            "group flex items-center justify-between rounded-xl px-3 py-3 transition",
                            "font-bricolage_grotesque text-[14px] md:text-[15px]",
                            isActive
                              ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )
                        }
                        end
                      >
                        <span className="font-medium">{t(it.title)}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition text-gray-400">
                          →
                        </span>
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Content com max-width e padding igual */}
              <section className="p-6 sm:p-8 md:p-10">
                <div className="mx-auto w-full max-w-[900px]">
                  <Outlet />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer simples */}
      {open && (
        <>
          <button
            aria-label="Close overlay"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-[86%] max-w-[380px] bg-white border-l border-gray-200 shadow-2xl">
            <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200">
              <p className="font-bricolage_grotesque font-semibold text-gray-900">
                {t("legal_section.policies_title")}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-3">
              <nav className="flex flex-col gap-1">
                {LEGAL_ITEMS.map((it) => (
                  <NavLink
                    key={it.slug}
                    to={legalPath(it.slug)}
                    className={({ isActive }) =>
                      cx(
                        "group flex items-center justify-between rounded-xl px-3 py-3 transition",
                        "font-bricolage_grotesque text-[14px] md:text-[15px]",
                        isActive
                          ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )
                    }
                    end
                  >
                    <span className="font-medium">{t(it.title)}</span>
                    <span className="text-gray-400">→</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
