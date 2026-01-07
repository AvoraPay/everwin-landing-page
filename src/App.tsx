//  everwin-page/src/App.tsx
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { Navbar } from "./components/Navbar";

import { Hero } from "./sections/Hero";
import { AssetsSection } from "./sections/AssetsSection";
import { DepositWithdrawalSection } from "./sections/DepositWithdrawalSection";
import { TradingSection } from "./sections/TradingSection";
import { TutorialsSection } from "./sections/TutorialsSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { SupportSection } from "./sections/SupportSection";
import { ToolsSection } from "./sections/ToolsSection";
import { StepsSection } from "./sections/StepsSection";
import { FAQSection } from "./sections/FAQSection";
import { Footer } from "./sections/Footer";

export const App = () => {
  return (
    <div className="min-h-screen bg-neutral-100 text-black font-sans_serif">
      {/* Top fixed items */}
      <Navbar />
      <DisclaimerBanner />

      {/* Content (reserva espaço da navbar fixa) */}
      <main className="pt-16 md:pt-[78px]">
        <div className="mx-auto w-full">
          <Hero />
          <AssetsSection />
          <DepositWithdrawalSection />
          <TradingSection />
          <TutorialsSection />
          <TestimonialsSection />
          <SupportSection />
          <ToolsSection />
          <StepsSection />
          <FAQSection />
          <Footer />
        </div>
      </main>
    </div>
  );
};
