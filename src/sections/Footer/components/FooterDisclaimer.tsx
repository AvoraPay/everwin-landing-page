//
import { useTranslation } from "react-i18next";

export const FooterDisclaimer = () => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-[90%] max-w-[1060px] mt-10">
      <p className="text-gray-400 leading-6 font-bricolage_grotesque">
        <strong className="font-semibold text-white">{t("footer.disclaimer.title")}</strong>
      </p>

      <div className="mt-4 space-y-4">
        <p className="text-gray-400 leading-6 font-bricolage_grotesque">
          {t("footer.disclaimer.text_1")}
        </p>

        <p className="text-gray-400 leading-6 font-bricolage_grotesque">
          {t("footer.disclaimer.text_2")}
        </p>

        <p className="text-gray-400 leading-6 font-bricolage_grotesque">
          {t("footer.disclaimer.text_3")}
        </p>
      </div>
    </div>
  );
};
