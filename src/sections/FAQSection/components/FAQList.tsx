// everwin-page/src/sections/FAQSection/components/FAQList.tsx
import { useId, useState } from "react";

type FAQ = {
  q: string;
  a: string;
};

const FAQS: FAQ[] = [
  {
    q: "What’s the minimum deposit and withdrawal on Everwin?",
    a: "Minimum amounts can vary by payment method and region. You’ll always see it clearly in the deposit/withdraw screen before confirming the request.",
  },
  {
    q: "Can I withdraw funds whenever I want?",
    a: "You can request a withdrawal at any time. Processing time depends on the method you choose and account verification steps designed to keep your account secure.",
  },
  {
    q: "Is there a demo account to practice first?",
    a: "Yes. Everwin provides a demo environment so you can test the platform and build confidence before using real funds.",
  },
  {
    q: "Can I use Everwin on mobile?",
    a: "Yes. You can access your account from mobile and desktop. The experience is designed to stay smooth even on smaller screens.",
  },
  {
    q: "How do I contact Everwin support?",
    a: "If you need help, you can contact the support team by email or through the help options available inside the platform. If something is urgent, include your account email and a short description of the issue.",
  },
];

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
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="mx-auto w-full max-w-[1060px]">
      <div className="flex w-full flex-col gap-y-[14px]">
        {FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;
          const panelId = `${baseId}-panel-${idx}`;
          const buttonId = `${baseId}-btn-${idx}`;

          return (
            <div
              key={idx}
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
                onClick={() => setOpenIndex((prev) => (prev === idx ? null : idx))}
                className="flex w-full items-center justify-between gap-x-4 text-left"
              >
                <p className="font-bricolage_grotesque text-base font-semibold leading-6 text-gray-800 md:text-lg md:leading-7">
                  {item.q}
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
                      {item.a}
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
