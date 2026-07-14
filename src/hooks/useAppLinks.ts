import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { normalizeAppLanguage } from "../lib/language";

/**
 * Returns dynamic login/register URLs based on the current i18n language.
 * Mirrors the logic originally in Navbar.
 */
export function useAppLinks() {
    const { i18n } = useTranslation();

    return useMemo(() => {
        const slug = normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language);

        return {
            login: `https://app.everwin.capital/${slug}/auth/login`,
            register: `https://app.everwin.capital/${slug}/auth/register`,
        };
    }, [i18n.language]);
}
