// src/pages/legal/LegalPageShell.tsx
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export function LegalPageShell({
  title,
  updated,
  lead,
  children,
}: {
  title: string;
  updated?: string;
  lead?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
      <header className="mb-8 md:mb-10 pt-8">
        <h1 className="text-center font-bricolage_grotesque font-bold tracking-[-0.03em] text-gray-900 leading-[1.05] text-[34px] sm:text-[44px] md:text-[54px]">
          {title}
        </h1>

        <div className="mt-4 flex flex-col items-center gap-2">
          {lead && (
            <p className="max-w-[760px] text-center font-bricolage_grotesque text-gray-500 font-light text-[15px] leading-6 md:text-lg">
              {lead}
            </p>
          )}
          {updated && (
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500 font-bricolage_grotesque">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
              <span>{t("legal_page.last_updated")} {updated}</span>
            </div>
          )}
        </div>

        <div className="mt-8 h-px w-full bg-gray-200/80" />
      </header>

      {children}
    </div>
  );
}
