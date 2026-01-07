// everwin-page/src/sections/Hero/components/HeroContent.tsx
import { HeroHeading } from "./HeroHeading";
import { HeroDescription } from "./HeroDescription";
import { HeroButtons } from "./HeroButtons";
import { HeroAssetCards } from "./HeroAssetCards";

export const HeroContent = () => {
  return (
    <div className="relative flex w-full flex-col items-center">
      {/* Text block */}
      <div className="relative z-[2] flex w-full max-w-[980px] flex-col items-center gap-5 md:gap-6">
        <HeroHeading />
        <HeroDescription />
        <HeroButtons />
      </div>

      {/* Visual block */}
      <div className="relative z-[1] mt-10 w-full md:mt-14">
        <HeroAssetCards />
      </div>
    </div>
  );
};
