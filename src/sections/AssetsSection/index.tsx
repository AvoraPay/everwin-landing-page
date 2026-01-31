//
import { useTranslation } from "react-i18next";
import { CountUp } from "../../components/CountUp";
import { TradingViewTickerTape } from "./components/AssetCarousel";

export function AssetsSection() {
  const { t } = useTranslation();

  return (
    <section id="assets" className="w-full bg-gray-100 border-t border-gray-200/60 py-20 md:py-24">
      <div className="mx-auto w-[92%] max-w-[1060px]">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-10">
            {/* +200 */}
            <div className="flex items-end leading-none">
              <span className="text-emerald-500 text-[70px] md:text-[86px] font-bold font-bricolage_grotesque">
                +
              </span>

              <CountUp
                to={200}
                durationMs={1200}
                className="text-gray-800 text-[120px] md:text-[156px] font-bold font-bricolage_grotesque"
              />
            </div>

            {/* headline */}
            <div className="max-w-[620px] text-center md:text-left">
              <h2 className="text-gray-800 text-[34px] md:text-[44px] font-semibold leading-[1.1] font-bricolage_grotesque">
                <span className="text-emerald-500">{t("assets.headline_1")}</span>{" "}
                {t("assets.headline_2")}
              </h2>
            </div>
          </div>

          {/* subtitle */}
          <p className="text-gray-500 text-[18px] leading-[26px] text-center font-bricolage_grotesque">
            {t("assets.subtitle")}
          </p>
        </div>
      </div>

      {/* carousel */}
      <div className="mt-10">
        <TradingViewTickerTape />
      </div>
    </section>
  );
}
