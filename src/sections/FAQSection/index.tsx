//
import { useTranslation } from "react-i18next";
import { FAQList } from "./components/FAQList";
import { useAppLinks } from "../../hooks/useAppLinks";

export const FAQSection = () => {
  const { t } = useTranslation();
  const links = useAppLinks();

  return (
    <section id="faq" className="relative w-full overflow-hidden pt-[90px] pb-20">
      <div className="mx-auto w-[90%] max-w-[1060px]">
        <div className="flex w-full flex-col items-center gap-y-6">
          <h2 className="text-center font-bricolage_grotesque text-[38px] font-semibold leading-[44px] text-gray-800 md:text-[52px] md:leading-[62.4px]">
            {t("faq.title")}
          </h2>

          <p className="w-full text-center font-bricolage_grotesque text-base leading-[26px] text-gray-600 md:max-w-[720px]">
            {t("faq.desc_1")}{" "}
            <span className="font-semibold text-gray-800">Everwin</span> {t("faq.desc_2")}
          </p>

          <div className="w-full md:max-w-[260px]">
            <a
              href={links.register}
              className="flex h-[76px] w-full items-center justify-center rounded-2xl bg-emerald-500/10 p-2"
            >
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-emerald-500 px-6">
                <p className="text-center font-bricolage_grotesque text-base font-medium leading-6 text-gray-800">
                  {t("faq.cta")}
                </p>
              </div>
            </a>
          </div>
        </div>

        <div className="mt-10 w-full">
          <FAQList />
        </div>
      </div>
    </section>
  );
};
