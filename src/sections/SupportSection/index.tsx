//
import { useTranslation } from "react-i18next";

export const SupportSection = () => {
  const { t } = useTranslation();
  return (
    <div id="support" className="relative content-center items-center box-border caret-transparent gap-x-0 flex flex-col shrink-0 h-min justify-center gap-y-0 w-full overflow-hidden py-[100px] md:py-8">
      <div className="box-border caret-transparent contents">
        <div className="relative content-end items-end box-border caret-transparent gap-x-0 flex shrink-0 h-[609px] justify-center gap-y-0 w-full py-[90px] scroll-mt-[78px] md:content-center md:items-center md:h-min after:accent-auto after:box-border after:caret-transparent after:text-black after:block after:text-xs after:not-italic after:normal-nums after:font-normal after:h-full after:tracking-[normal] after:leading-[normal] after:list-outside after:list-disc after:pointer-events-none after:absolute after:text-start after:indent-[0px] after:normal-case after:visible after:w-full after:border after:border-gray-800 after:border-separate after:border-solid after:left-0 after:top-0 after:font-sans_serif">
          <div className="absolute box-border caret-transparent inset-0">
            <img
              src="https://i.postimg.cc/CSgdkvSn/bg-helpdesk.png"
              alt=""
              className="aspect-[auto_1977_/_1060] box-border caret-transparent h-full object-cover object-[70.2%_47.3%] w-full"
            />
          </div>
          <div className="relative content-start items-start box-border caret-transparent gap-x-2.5 flex flex-col shrink-0 h-min justify-center max-w-[1060px] gap-y-2.5 w-[90%] overflow-hidden">
            <div className="relative content-start items-start box-border caret-transparent gap-x-6 flex flex-col shrink-0 h-min justify-center gap-y-6 w-full md:w-[341px]">
              <div className="relative content-center items-center backdrop-blur-[10px] bg-emerald-500/10 box-border caret-transparent gap-x-2.5 flex shrink-0 h-[38px] justify-center gap-y-2.5 w-min px-4 py-6 rounded-[9px]">
                <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start text-nowrap">
                  <p className="text-emerald-500 text-2xl box-border caret-transparent leading-6 text-center text-nowrap font-bricolage_grotesque">
                    {t("support.badge")}
                  </p>
                </div>
              </div>
              <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start break-words w-full">
                <p className="text-emerald-500 text-[62px] box-border caret-transparent leading-[74.4px] break-words font-bricolage_grotesque">
                  <span className="text-white box-border caret-transparent break-words">
                    {t("support.title_prefix")}{" "}
                  </span>
                  {t("support.title_suffix")}
                </p>
              </div>
              <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start break-words w-[314px]">
                <p className="text-white text-lg box-border caret-transparent leading-[26px] break-words font-bricolage_grotesque">
                  {t("support.desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
