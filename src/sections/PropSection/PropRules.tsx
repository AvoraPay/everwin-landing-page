import { useTranslation } from "react-i18next";
import { Reveal } from "../../components/Reveal";

const RULE_KEYS = ["rule_1", "rule_2", "rule_3", "rule_4", "rule_5", "rule_6", "rule_7", "rule_8"] as const;

const RULE_ICONS = [
    <svg key="0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>,
    <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>,
    <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 118 2.83" /><path d="M22 12A10 10 0 0012 2v10z" /></svg>,
    <svg key="4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
    <svg key="5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    <svg key="6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
    <svg key="7" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
];

export const PropRules = () => {
    const { t } = useTranslation();

    return (
        <section className="relative w-full py-[90px] md:py-[120px] px-4">
            <div className="mx-auto w-full max-w-[1060px]">
                <Reveal>
                    <div className="flex flex-col items-center text-center gap-y-4 mb-14">
                        <h2 className="font-bricolage_grotesque text-[42px] leading-[44px] text-gray-800 md:text-[62px] md:leading-[62px]">
                            {t("prop.rules.title_1")}{" "}
                            <strong className="font-bold text-emerald-500">{t("prop.rules.title_2")}</strong>
                        </h2>
                        <p className="max-w-[560px] font-bricolage_grotesque text-base font-light leading-6 text-gray-500">
                            {t("prop.rules.description")}
                        </p>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {RULE_KEYS.map((key, i) => (
                        <Reveal key={key} delay={i * 60} distance={18}>
                            <div className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-400 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 h-full">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-all group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/20">
                                    {RULE_ICONS[i]}
                                </div>
                                <h3 className="font-bricolage_grotesque text-base font-semibold text-gray-800">
                                    {t(`prop.rules.${key}.title`)}
                                </h3>
                                <p className="font-bricolage_grotesque text-sm font-light leading-5 text-gray-500">
                                    {t(`prop.rules.${key}.desc`)}
                                </p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};
