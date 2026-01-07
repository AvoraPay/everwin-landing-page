// everwin-page/src/sections/StepsSection/index.tsx
import { useRef } from "react";
import { StepCard } from "./components/StepCard";
import { useScrollProgress } from "../../hooks/useScrollProgress";

export const StepsSection = () => {
  const stepsWrapRef = useRef<HTMLDivElement>(null);

  // Progress suave ao longo do bloco de steps (0..1)
  const progress = useScrollProgress(stepsWrapRef, { start: 0.9, end: 0.25 });

  return (
    <div className="relative mx-auto flex w-full max-w-[810px] flex-col items-center justify-center px-4 py-[90px] md:px-0">
      <div className="flex w-full flex-col items-center justify-center gap-y-20">
        {/* Header */}
        <div className="relative z-[1] flex w-full flex-col items-center justify-center gap-y-6 overflow-hidden">
          <div className="w-full">
            <p className="font-bricolage_grotesque text-center text-[42px] leading-[44px] text-gray-800 md:text-[62px] md:leading-[62px]">
              Get started in just
            </p>
            <p className="font-bricolage_grotesque text-center text-[42px] leading-[44px] text-emerald-500 md:text-[62px] md:leading-[62px]">
              <strong className="font-bold">3 Simple Steps</strong>
            </p>
          </div>

          <p className="font-bricolage_grotesque text-center text-base font-light leading-6 text-gray-500">
            We’ve streamlined the journey so you can set up, practice, and go live with confidence.
          </p>
        </div>

        {/* Steps + Single continuous connector */}
        <div ref={stepsWrapRef} className="relative w-full">
          {/* ONE continuous base line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[35px] top-[35px] bottom-[35px] w-[3px] overflow-hidden rounded-full bg-gray-800/10"
          >
            {/* Green fill */}
            <div
              className="absolute left-0 top-0 h-full w-full origin-top rounded-full bg-emerald-400 will-change-transform"
              style={{ transform: `scaleY(${progress})` }}
            />
          </div>

          <div className="relative flex w-full flex-col">
            <StepCard
              stepNumber="1"
              title="First Step"
              subtitle="Create your Everwin account."
              description="Sign up in minutes and unlock your dashboard to start exploring the platform right away."
            />

            <StepCard
              stepNumber="2"
              title="Second Step"
              subtitle="Practice inside Everwin — risk-free."
              description="Get a demo balance to test strategies with Everwin tools until you feel consistent and confident."
            />

            <StepCard
              stepNumber="3"
              title="Third Step"
              subtitle="Deposit and go live."
              description="Make your first deposit and access a broader set of assets — with simple controls and clear execution."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
