// everwin-page/src/sections/Hero/index.tsx
import { HeroContent } from "./components/HeroContent";

export const Hero = () => {
  return (
    <div id="top" className="relative content-center items-center bg-[linear-gradient(187deg,rgb(246,247,249)_-24%,rgb(224,227,235)_100%)] box-border caret-transparent gap-x-2.5 flex flex-col shrink-0 h-min justify-end gap-y-2.5 w-full overflow-hidden pt-[90px]">
      <HeroContent />
    </div>
  );
};
