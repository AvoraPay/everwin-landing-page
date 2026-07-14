import { useTranslation } from "react-i18next";

export const SupportSection = () => {
  const { t } = useTranslation();
  return (
    <section
      id="support"
      className="relative w-full overflow-hidden h-[500px] md:h-[650px]"
    >
      <div className="absolute inset-0">
        <img
          src="https://i.postimg.cc/CSgdkvSn/bg-helpdesk.png"
          alt=""
          className="h-full w-full object-cover object-[center_30%]"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      <div className="relative mx-auto flex h-full w-[90%] max-w-[1060px] flex-col justify-center gap-6">
        <div className="inline-flex w-min items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 backdrop-blur-[10px]">
          <p className="text-sm font-semibold text-emerald-500 font-bricolage_grotesque whitespace-nowrap">
            {t("support.badge")}
          </p>
        </div>

        <h2 className="text-[28px] font-semibold leading-[1.15] md:text-[44px] font-bricolage_grotesque">
          <span className="text-white">{t("support.title_prefix")} </span>
          <span className="text-emerald-500">{t("support.title_suffix")}</span>
        </h2>

        <p className="max-w-[360px] text-base leading-relaxed text-white/80 font-bricolage_grotesque md:text-lg">
          {t("support.desc")}
        </p>
      </div>
    </section>
  );
};
