// everwin-page/src/sections/Footer/index.tsx
import { FooterContent } from "./components/FooterContent";
import { FooterDisclaimer } from "./components/FooterDisclaimer";
import { FooterBottom } from "./components/FooterBottom";

export const Footer = () => {
  return (
    <footer className="relative w-full bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] py-12 md:py-[60px]">
      {/* top border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-white/10" />

      <FooterContent />
      <FooterDisclaimer />
      <FooterBottom />
    </footer>
  );
};
