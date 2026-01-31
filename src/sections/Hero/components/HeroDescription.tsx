import { useTranslation } from "react-i18next";

export const HeroDescription = () => {
  const { t } = useTranslation();
  return (
    <p className="w-full max-w-[860px] text-center font-bricolage_grotesque text-gray-500 font-light text-[16px] leading-6 md:text-lg">
      {t("hero.description")}
    </p>
  );
};
