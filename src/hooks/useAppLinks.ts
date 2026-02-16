import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Returns dynamic login/register URLs based on the current i18n language.
 * Mirrors the logic originally in Navbar.
 */
export function useAppLinks() {
    const { i18n } = useTranslation();

    return useMemo(() => {
        const current = i18n.language;
        let slug = "en";
        if (current.startsWith("pt")) slug = "pt";
        else if (current.startsWith("es")) slug = "es";

        return {
            login: `https://app.everwin.trade/${slug}/auth/login`,
            register: `https://app.everwin.trade/${slug}/auth/register`,
        };
    }, [i18n.language]);
}
