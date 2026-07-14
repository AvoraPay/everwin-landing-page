import { useTranslation } from "react-i18next";
import { useAppLinks } from "../../../hooks/useAppLinks";

export const HeroButtons = () => {
  const { t } = useTranslation();
  const links = useAppLinks();

  const scrollToNext = () => {
    const el = document.getElementById("assets");
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 md:flex-row md:gap-4">
      <a
        href={links.register}
        className="group relative w-full max-w-[260px] overflow-hidden rounded-2xl bg-emerald-500/10 p-2"
      >
        <div className="flex h-[64px] items-center justify-center rounded-lg bg-emerald-500 px-6 transition-transform duration-300 group-hover:scale-[1.01]">
          <span className="font-bricolage_grotesque text-base font-medium text-white">
            {t("hero.start_now")}
          </span>
        </div>
      </a>

      <button
        type="button"
        onClick={scrollToNext}
        className="flex h-[56px] items-center justify-center gap-2 rounded-md px-4 text-gray-500 md:h-[60px] cursor-pointer"
      >
        <span className="font-sora text-base leading-6">{t("hero.find_out_more")}</span>
        <img
          src="https://c.animaapp.com/mk284v6uqUa07j/assets/icon-1.svg"
          alt="Icon"
          className="h-2.5 w-4"
        />
      </button>
    </div>
  );
};
