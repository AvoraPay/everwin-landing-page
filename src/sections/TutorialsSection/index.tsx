// everwin-page/src/sections/TutorialsSection/index.tsx
import { TutorialsImage } from "./components/TutorialsImage";
import { TutorialsContent } from "./components/TutorialsContent";

export const TutorialsSection = () => {
  return (
    <div  id="tutorials" className="relative content-center items-center box-border caret-transparent gap-x-8 flex flex-col shrink-0 h-min justify-center gap-y-8 w-full overflow-hidden py-[100px] md:py-[120px]">
      <div className="relative content-start items-start box-border caret-transparent gap-x-8 flex flex-col shrink-0 h-min justify-start max-w-[1060px] gap-y-8 w-[90%] z-[2] md:content-center md:items-center md:gap-x-[60px] md:flex-row md:gap-y-[60px]">
        <div className="box-border caret-transparent contents">
          <TutorialsImage />
        </div>
        <TutorialsContent />
      </div>
    </div>
  );
};
