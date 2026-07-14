import type { i18n as I18nInstance } from "i18next";

export type AppLanguage = "en" | "pt" | "es";

export const APP_LANGUAGE_STORAGE_KEY = "everwin.language.manual";

const GEO_CACHE_STORAGE_KEY = "everwin.language.geo";
const GEO_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const GEO_LOOKUP_URL = "https://ipwho.is/";

const PORTUGUESE_COUNTRIES = new Set(["AO", "BR", "CV", "GW", "MZ", "PT", "ST", "TL"]);
const SPANISH_COUNTRIES = new Set([
  "AR",
  "BO",
  "CL",
  "CO",
  "CR",
  "CU",
  "DO",
  "EC",
  "ES",
  "GQ",
  "GT",
  "HN",
  "MX",
  "NI",
  "PA",
  "PE",
  "PR",
  "PY",
  "SV",
  "UY",
  "VE",
]);

type GeoCachePayload = {
  countryCode: string;
  language: AppLanguage;
  expiresAt: number;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function normalizeAppLanguage(value?: string | null): AppLanguage {
  const normalized = `${value ?? ""}`.toLowerCase();
  if (normalized.startsWith("pt")) return "pt";
  if (normalized.startsWith("es")) return "es";
  return "en";
}

function getQueryLanguage(): AppLanguage | null {
  if (!isBrowser()) return null;
  const queryLanguage = new URLSearchParams(window.location.search).get("lang");
  if (!queryLanguage) return null;
  return normalizeAppLanguage(queryLanguage);
}

export function getStoredManualLanguage(): AppLanguage | null {
  if (!isBrowser()) return null;
  const stored = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
  return stored ? normalizeAppLanguage(stored) : null;
}

export function setStoredManualLanguage(language: AppLanguage) {
  if (!isBrowser()) return;
  window.localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
}

function getNavigatorLanguage(): AppLanguage | null {
  if (!isBrowser()) return null;
  const candidates = [...(window.navigator.languages ?? []), window.navigator.language].filter(Boolean);
  if (!candidates.length) return null;
  return normalizeAppLanguage(candidates[0]);
}

function getHtmlLanguage(): AppLanguage | null {
  if (typeof document === "undefined") return null;
  const htmlLanguage = document.documentElement.lang;
  return htmlLanguage ? normalizeAppLanguage(htmlLanguage) : null;
}

export function getInitialAppLanguage(): AppLanguage {
  return getQueryLanguage() ?? getStoredManualLanguage() ?? getHtmlLanguage() ?? getNavigatorLanguage() ?? "en";
}

export function setDocumentLanguage(language: AppLanguage) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
}

function getCountryMappedLanguage(countryCode?: string | null): AppLanguage | null {
  const normalizedCountry = `${countryCode ?? ""}`.trim().toUpperCase();
  if (!normalizedCountry) return null;
  if (PORTUGUESE_COUNTRIES.has(normalizedCountry)) return "pt";
  if (SPANISH_COUNTRIES.has(normalizedCountry)) return "es";
  return "en";
}

function readGeoCache(): GeoCachePayload | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(GEO_CACHE_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as GeoCachePayload;
    if (!parsed?.language || !parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(GEO_CACHE_STORAGE_KEY);
      return null;
    }
    return {
      countryCode: parsed.countryCode,
      language: normalizeAppLanguage(parsed.language),
      expiresAt: parsed.expiresAt,
    };
  } catch {
    window.localStorage.removeItem(GEO_CACHE_STORAGE_KEY);
    return null;
  }
}

function writeGeoCache(countryCode: string, language: AppLanguage) {
  if (!isBrowser()) return;
  const payload: GeoCachePayload = {
    countryCode,
    language,
    expiresAt: Date.now() + GEO_CACHE_TTL_MS,
  };
  window.localStorage.setItem(GEO_CACHE_STORAGE_KEY, JSON.stringify(payload));
}

async function fetchGeoLanguage(): Promise<AppLanguage | null> {
  if (!isBrowser()) return null;

  const cached = readGeoCache();
  if (cached) return cached.language;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(GEO_LOOKUP_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      success?: boolean;
      country_code?: string;
      country_code2?: string;
    };

    if (payload.success === false) return null;

    const countryCode = `${payload.country_code ?? payload.country_code2 ?? ""}`.toUpperCase();
    const language = getCountryMappedLanguage(countryCode);
    if (!countryCode || !language) return null;

    writeGeoCache(countryCode, language);
    return language;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function applyAutomaticLanguage(i18nInstance: I18nInstance) {
  if (!isBrowser()) return;

  const queryLanguage = getQueryLanguage();
  if (queryLanguage) {
    if (normalizeAppLanguage(i18nInstance.resolvedLanguage) !== queryLanguage) {
      await i18nInstance.changeLanguage(queryLanguage);
    }
    return;
  }

  const manualLanguage = getStoredManualLanguage();
  if (manualLanguage) {
    if (normalizeAppLanguage(i18nInstance.resolvedLanguage) !== manualLanguage) {
      await i18nInstance.changeLanguage(manualLanguage);
    }
    return;
  }

  const geoLanguage = await fetchGeoLanguage();
  if (!geoLanguage) return;

  if (getStoredManualLanguage()) return;

  if (normalizeAppLanguage(i18nInstance.resolvedLanguage) !== geoLanguage) {
    await i18nInstance.changeLanguage(geoLanguage);
  }
}
