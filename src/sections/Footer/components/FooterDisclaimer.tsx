import { useTranslation } from "react-i18next";

export const FooterDisclaimer = () => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-[90%] max-w-[1060px] mt-10 border-t border-white/10 pt-8">
      <p className="text-white text-sm font-semibold font-bricolage_grotesque mb-4">
        {t("footer.disclaimer.title")}
      </p>

      <div className="space-y-3">
        <p className="text-gray-400 text-xs leading-5 font-bricolage_grotesque">
          {t("footer.disclaimer.text_1")}
        </p>
        <p className="text-gray-400 text-xs leading-5 font-bricolage_grotesque">
          {t("footer.disclaimer.text_2")}
        </p>
        <p className="text-gray-400 text-xs leading-5 font-bricolage_grotesque">
          {t("footer.disclaimer.text_3")}
        </p>
      </div>
    </div>
  );
};
