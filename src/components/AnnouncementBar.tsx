"use client";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAnnouncementBar } from "../hooks/useAnnouncementBar";

function MarqueeContent({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-4 px-6">
      <span className="text-[13px] font-medium text-white font-bricolage_grotesque whitespace-nowrap">
        {text}
      </span>
      <span className="text-white/30 text-xs">•</span>
    </span>
  );
}

export const AnnouncementBar = () => {
  const { t } = useTranslation();
  const { visible, close } = useAnnouncementBar();

  if (!visible) return null;

  const text = t("announcement.text");
  const cta = t("announcement.cta");

  return (
    <div className="sticky top-0 z-[60] flex h-9 w-full overflow-hidden bg-emerald-600">
      {/* Scrolling text area */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 flex animate-marquee will-change-transform">
          {Array.from({ length: 14 }).map((_, i) => (
            <MarqueeContent key={`a-${i}`} text={text} />
          ))}
        </div>
        <div className="absolute inset-0 flex animate-marquee will-change-transform" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => (
            <MarqueeContent key={`b-${i}`} text={text} />
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-emerald-600 to-transparent z-[1]" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-emerald-600 to-transparent z-[1]" />
      </div>

      {/* Fixed CTA button */}
      <a
        href="https://www.everwin.capital/prop"
        onClick={close}
        className="flex shrink-0 items-center bg-emerald-700/60 px-4 text-xs font-semibold text-white transition hover:bg-emerald-700 font-bricolage_grotesque z-[2]"
      >
        {cta}
      </a>

      {/* Close button */}
      <button
        type="button"
        onClick={close}
        aria-label="Fechar"
        className="flex shrink-0 items-center justify-center w-9 text-white/60 transition hover:text-white hover:bg-emerald-700/40 z-[2]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
