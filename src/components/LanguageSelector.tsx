import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { normalizeAppLanguage, setStoredManualLanguage, type AppLanguage } from "../lib/language";

/* ── SVG flag components ── */

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

/* ── helpers ── */

const FLAGS: Record<AppLanguage, typeof FlagUK> = { en: FlagUK, pt: FlagPT, es: FlagES };
const LABELS: Record<AppLanguage, string> = { en: "English", pt: "Português", es: "Español" };
const LANGUAGE_OPTIONS: AppLanguage[] = ["en", "pt", "es"];

/* ── component ── */

type LanguageSelectorProps = {
  compact?: boolean;
  className?: string;
};

export function LanguageSelector({ compact = false, className = "" }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const currentLang = normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const changeLanguage = async (lng: AppLanguage) => {
    setStoredManualLanguage(lng);
    await i18n.changeLanguage(lng);
    setOpen(false);
  };

  const CurrentFlag = FLAGS[currentLang];

  /* ── compact (desktop navbar) ── */
  if (compact) {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-white/10"
          aria-label="Language selector"
          aria-expanded={open}
        >
          <span className="block h-4 w-6 overflow-hidden rounded-sm">
            <CurrentFlag className="h-4 w-6" />
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-[170px] overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] shadow-xl">
            {LANGUAGE_OPTIONS.map((lng) => {
              const Flag = FLAGS[lng];
              return (
                <button
                  key={lng}
                  type="button"
                  onClick={() => void changeLanguage(lng)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-white/10"
                >
                  <span className="block h-4 w-6 overflow-hidden rounded-sm">
                    <Flag className="h-4 w-6" />
                  </span>
                  <span className="font-bricolage_grotesque text-sm text-white">{LABELS[lng]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ── full-width (mobile drawer) ── */
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 transition hover:bg-white/10"
        aria-label="Language selector"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <span className="block h-4 w-6 overflow-hidden rounded-sm">
            <CurrentFlag className="h-4 w-6" />
          </span>
          <span className="font-bricolage_grotesque text-sm">{LABELS[currentLang]}</span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60">
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-full overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] shadow-xl">
          {LANGUAGE_OPTIONS.map((lng) => {
            const Flag = FLAGS[lng];
            return (
              <button
                key={lng}
                type="button"
                onClick={() => void changeLanguage(lng)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/10"
              >
                <span className="block h-4 w-6 overflow-hidden rounded-sm">
                  <Flag className="h-4 w-6" />
                </span>
                <span className="font-bricolage_grotesque text-sm text-white">{LABELS[lng]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
