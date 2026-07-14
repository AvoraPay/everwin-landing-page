import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import pt from "./locales/pt.json";
import es from "./locales/es.json";
import { propSupplemental } from "./locales/propSupplemental";
import {
  applyAutomaticLanguage,
  getInitialAppLanguage,
  normalizeAppLanguage,
  setDocumentLanguage,
} from "./lib/language";

const initialLanguage = getInitialAppLanguage();

const initPromise = i18n
  .use(initReactI18next)
  .init({
    lng: initialLanguage,
    resources: {
      en: {
        translation: {
          ...en,
          ...propSupplemental.en,
        },
      },
      pt: {
        translation: {
          ...pt,
          ...propSupplemental.pt,
        },
      },
      es: {
        translation: {
          ...es,
          ...propSupplemental.es,
        },
      },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "pt", "es"],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
  });

setDocumentLanguage(initialLanguage);

i18n.on("languageChanged", (language) => {
  setDocumentLanguage(normalizeAppLanguage(language));
});

void initPromise.then(() => applyAutomaticLanguage(i18n));

export default i18n;
