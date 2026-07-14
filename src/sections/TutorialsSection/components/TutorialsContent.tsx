//
import { useTranslation } from "react-i18next";
import { useAppLinks } from "../../../hooks/useAppLinks";

export const TutorialsContent = () => {
  const { t } = useTranslation();
  const links = useAppLinks();

  return (
    <div className="relative content-start items-start box-border caret-transparent gap-x-8 flex flex-col shrink-0 h-min justify-center max-w-[400px] gap-y-8 w-full pt-[25px] md:w-6/12 md:pt-0">
      <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start break-words w-full">
        <p className="text-gray-800 text-[61px] font-medium box-border caret-transparent leading-[61px] break-words text-left font-bricolage_grotesque">
          <strong className="font-bold box-border caret-transparent break-words">
            {t("tutorials.title")}
          </strong>{" "}
          {t("tutorials.subtitle")}
        </p>
      </div>

      <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start break-words w-full">
        <p className="text-gray-800 text-base box-border caret-transparent leading-6 break-words text-left font-bricolage_grotesque">
          {t("tutorials.description")}
        </p>
      </div>

      <div className="relative box-border caret-transparent shrink-0 w-full md:w-auto">
        <a
          href={links.register}
          className="relative text-blue-700 content-center items-center bg-emerald-500/10 box-border caret-transparent gap-x-2.5 flex h-[76px] justify-center gap-y-2.5 w-64 overflow-hidden p-2 rounded-2xl"
        >
          <div className="relative content-center items-center bg-emerald-500 box-border caret-transparent gap-x-2 flex basis-0 grow shrink-0 h-full justify-center gap-y-2 w-px p-4 rounded-lg">
            <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start text-nowrap">
              <p className="text-white text-base font-medium box-border caret-transparent tracking-[0.16px] leading-6 text-center text-nowrap font-bricolage_grotesque">
                {t("tutorials.cta")}
              </p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};
