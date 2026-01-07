// everwin-page/src/sections/StepsSection/components/StepCard.tsx
import { useMemo, useRef } from "react";
import { useInViewOnce } from "../../../hooks/useInViewOnce";

export type StepCardProps = {
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
};

export const StepCard = (props: StepCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInViewOnce(cardRef, { threshold: 0.25 });

  const delayMs = useMemo(() => {
    const n = Number(props.stepNumber);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, (n - 1) * 120);
  }, [props.stepNumber]);

  return (
    <div
      ref={cardRef}
      className={[
        "relative z-[1] w-full",
        "transition-[transform,opacity,filter] duration-[850ms]",
        "ease-[cubic-bezier(0.22,1,0.36,1)]",
        "will-change-transform motion-reduce:transition-none",
        inView
          ? "opacity-100 translate-y-0 blur-0"
          : "opacity-0 translate-y-5 blur-[1px]",
      ].join(" ")}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <div className="relative flex w-full items-start gap-x-6">
        {/* LEFT: badge column (70px) */}
        <div className="relative flex w-[70px] shrink-0 items-start justify-center">
          <div className="relative flex h-[70px] w-[70px] items-center justify-center">
            <div className="relative flex h-min w-min items-center justify-center overflow-hidden rounded-[15px] bg-gray-800/30 p-1.5">
              <div className="relative flex h-[43px] w-[42px] items-center justify-center rounded-[10px] bg-gray-800 after:absolute after:left-0 after:top-0 after:block after:h-full after:w-full after:rounded-[10px] after:border-[6px] after:border-gray-800/30 after:content-['']">
                <p className="font-bricolage_grotesque text-[19.85px] font-semibold leading-[19.056px] text-white">
                  {props.stepNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: content */}
        <div className="relative flex w-px grow flex-col gap-y-6 overflow-hidden pt-1.5 pb-10 md:pb-20">
          <div className="relative flex w-full flex-col">
            <p className="font-bricolage_grotesque text-left text-lg leading-[26px] text-emerald-500">
              {props.title}
            </p>
            <p className="font-bricolage_grotesque text-left text-2xl font-semibold leading-[1.2] text-gray-800">
              {props.subtitle}
            </p>
          </div>

          <p className="font-bricolage_grotesque text-left text-base font-light leading-[26px] text-gray-500">
            {props.description}
          </p>
        </div>
      </div>
    </div>
  );
};
