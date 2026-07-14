import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Reveal } from "../../components/Reveal";

const FAQ_KEYS = ["0", "1", "2", "3", "4", "5"] as const;

export const PropFAQ = () => {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

    return (
        <section className="relative w-full py-[90px] md:py-[120px] px-4 bg-gray-50">
            <div className="mx-auto w-full max-w-[760px]">
                <Reveal>
                    <div className="flex flex-col items-center text-center gap-y-4 mb-12">
                        <h2 className="font-bricolage_grotesque text-[38px] font-semibold leading-[44px] text-gray-800 md:text-[52px] md:leading-[62.4px]">
                            {t("prop.faq.title")}
                        </h2>
                        <p className="max-w-[560px] font-bricolage_grotesque text-base font-light leading-6 text-gray-500">
                            {t("prop.faq.description")}
                        </p>
                    </div>
                </Reveal>

                <div className="flex flex-col gap-3">
                    {FAQ_KEYS.map((key, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <Reveal key={key} delay={i * 60} distance={12}>
                                <div
                                    className={[
                                        "rounded-2xl border transition-all duration-300",
                                        isOpen
                                            ? "border-emerald-500/30 bg-white shadow-lg shadow-emerald-500/5"
                                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
                                    ].join(" ")}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggle(i)}
                                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                    >
                                        <span className="font-bricolage_grotesque text-base font-medium text-gray-800">
                                            {t(`prop.faq.items.${key}.q`)}
                                        </span>
                                        <div className={[
                                            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300",
                                            isOpen ? "bg-emerald-500 text-white rotate-180" : "bg-gray-100 text-gray-400",
                                        ].join(" ")}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                    <div
                                        className={[
                                            "overflow-hidden transition-all duration-300",
                                            isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0",
                                        ].join(" ")}
                                    >
                                        <p className="px-6 pb-5 font-bricolage_grotesque text-sm leading-6 text-gray-500">
                                            {t(`prop.faq.items.${key}.a`)}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
