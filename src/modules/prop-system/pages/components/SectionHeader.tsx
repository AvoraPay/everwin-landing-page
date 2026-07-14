import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export function SectionHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="relative mb-6 overflow-hidden rounded-[26px] border border-slate-200/90 bg-white/92 px-6 py-6 shadow-[0_28px_64px_-54px_rgba(15,23,42,0.38)] backdrop-blur-xl md:px-7">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      <div className="absolute -left-10 top-0 h-28 w-28 rounded-full bg-slate-900/[0.04] blur-3xl" />
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {t("prop_portal.layout.workspace_badge")}
          </span>
          <h1 className="mt-4 font-bricolage_grotesque text-balance text-[30px] font-semibold tracking-[-0.04em] text-slate-950 md:text-[40px] md:leading-[1.02]">
            {title}
          </h1>
          <p className="mt-3 max-w-[760px] text-pretty text-sm leading-6 text-slate-600 md:text-[15px]">
            {description}
          </p>
        </div>
        {actions ? <div className="relative flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
