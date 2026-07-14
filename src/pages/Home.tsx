// src/pages/Home.tsx
import { useEffect } from "react";

import { Hero } from "../sections/Hero";
import { AssetsSection } from "../sections/AssetsSection";
import { DepositWithdrawalSection } from "../sections/DepositWithdrawalSection";
import { TradingSection } from "../sections/TradingSection";
import { TutorialsSection } from "../sections/TutorialsSection";
import { TestimonialsSection } from "../sections/TestimonialsSection";
import { SupportSection } from "../sections/SupportSection";
import { ToolsSection } from "../sections/ToolsSection";
import { StepsSection } from "../sections/StepsSection";
import { FAQSection } from "../sections/FAQSection";

export default function Home() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <div className="w-full">
      <Hero />

      <div className="mx-auto w-full max-w-[1600px]">
        <AssetsSection />
        <DepositWithdrawalSection />
        <TradingSection />
        <TutorialsSection />
        <TestimonialsSection />
        <ToolsSection />
        <StepsSection />
        <FAQSection />
      </div>

      <SupportSection />
    </div>
  );
}
