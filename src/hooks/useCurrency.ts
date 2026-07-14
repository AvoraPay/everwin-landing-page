import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { normalizeAppLanguage } from "../lib/language";

/**
 * Currency conversion hook.
 * Base currency is BRL. When user switches language:
 *  - pt → BRL (R$)
 *  - en → USD ($)
 *  - es → USD ($)
 *
 * Exchange rate is hardcoded for MVP — can be replaced with API later.
 */

const RATES: Record<string, { symbol: string; code: string; rate: number }> = {
    pt: { symbol: "R$", code: "BRL", rate: 1 },
    en: { symbol: "$", code: "USD", rate: 0.17 },       // ~1 USD = 5.85 BRL
    es: { symbol: "$", code: "USD", rate: 0.17 },
};

export function useCurrency() {
    const { i18n } = useTranslation();

    return useMemo(() => {
        const lang = normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language);

        const { symbol, code, rate } = RATES[lang] ?? RATES.en;

        /**
         * Convert a BRL value to the current currency.
         * @param brl - amount in BRL
         * @param decimals - number of decimal places (default 0 for clean display)
         */
        const convert = (brl: number, decimals = 0): string => {
            const converted = brl * rate;
            // Format with locale-aware thousands separator
            return `${symbol} ${converted.toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es" : "en-US", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })}`;
        };

        /**
         * Format an account size in the current currency (e.g. "R$ 25.000" or "$5,000")
         */
        const formatSize = (brl: number): string => {
            const converted = brl * rate;
            return `${symbol} ${Math.round(converted).toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es" : "en-US")}`;
        };

        return { symbol, code, rate, convert, formatSize, lang };
    }, [i18n.language]);
}
