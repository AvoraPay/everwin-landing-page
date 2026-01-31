import { useTranslation, Trans } from "react-i18next";

export const HeroHeading = () => {
  const { t } = useTranslation();
  return (
    <h1 className="text-center font-bricolage_grotesque font-bold tracking-[-0.03em] text-gray-800 leading-[1.05] text-[40px] sm:text-[48px] md:text-[62px]">
      <span className="block">{t("hero.heading_1")}</span>
      <span className="block">
        <Trans i18nKey="hero.heading_2" components={[<span className="text-emerald-500" />]} />
      </span>
    </h1>
  );
};
