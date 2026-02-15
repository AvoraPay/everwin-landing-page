//
import { useTranslation } from "react-i18next";
import { useAppLinks } from "../../../hooks/useAppLinks";

export const TradingContent = () => {
  const { t } = useTranslation();
  const links = useAppLinks();

  return (
    <div className="w-full md:max-w-[520px]">
      <h2 className="text-gray-800 font-bricolage_grotesque font-semibold tracking-tight text-[44px] leading-[1.05] md:text-[64px]">
        {t("trading.title_1")}
        <br />
        {t("trading.title_2")}
      </h2>

      <p className="mt-6 text-gray-500 font-bricolage_grotesque text-base leading-[26px]">
        {t("trading.description")}
      </p>

      <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center">
        <a
          href={links.register}
          className="w-full md:w-auto"
        >
          <div className="rounded-2xl bg-emerald-500/10 p-2 w-full md:w-[240px]">
            <div className="h-[64px] rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_18px_40px_rgba(16,185,129,0.18)]">
              <span className="text-gray-900 font-bricolage_grotesque font-medium">
                {t("trading.cta")}
              </span>
            </div>
          </div>
        </a>

        <div className="flex items-center gap-3">
          <img
            src="https://framerusercontent.com/images/38v77eiCsz7j7TUEJoIXTSHdw8.png?width=443&height=172"
            alt=""
            className="h-[43px] w-auto object-contain"
          />

          <div className="flex flex-col justify-center">
            <div className="text-gray-800 font-bricolage_grotesque font-semibold leading-[1] text-[40px]">
              700K<span className="text-emerald-500">+</span>
            </div>
            <div className="mt-1 text-gray-800 font-bricolage_grotesque text-sm leading-[14px]">
              {t("trading.stat_label")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
