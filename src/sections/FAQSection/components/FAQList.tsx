//
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={[
        "h-5 w-5 shrink-0 transition-transform duration-300",
        open ? "rotate-0" : "-rotate-90",
      ].join(" ")}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 12.5L10 9l3.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const FAQList = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  // 5 items, indices 0..4
  const indices = [0, 1, 2, 3, 4];

  return (
    <div className="mx-auto w-full max-w-[1060px]">
      <div className="flex w-full flex-col gap-y-[14px]">
        {indices.map((i) => {
          const isOpen = openIndex === i;
          const panelId = `${baseId}-panel-${i}`;
          const buttonId = `${baseId}-btn-${i}`;

          return (
            <div
              key={i}
              className={[
                "w-full rounded-xl bg-slate-50 p-4",
                "ring-1 ring-gray-900/5",
              ].join(" ")}
            >
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex((prev) => (prev === i ? null : i))}
                className="flex w-full items-center justify-between gap-x-4 text-left"
              >
                <p className="font-bricolage_grotesque text-base font-semibold leading-6 text-gray-800 md:text-lg md:leading-7">
                  {t(`faq.items.${i}.q`)}
                </p>

                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white ring-1 ring-gray-900/5">
                  <Chevron open={isOpen} />
                </span>
              </button>

              {/* Smooth open/close (no layout bugs) */}
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={[
                  "grid transition-[grid-template-rows,opacity] duration-500",
                  "ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                ].join(" ")}
              >
                <div className="overflow-hidden">
                  <div className="pt-3">
                    <p className="font-bricolage_grotesque text-sm leading-6 text-gray-600 md:text-base md:leading-[26px]">
                      {t(`faq.items.${i}.a`)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
