import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import bnTranslation from "./locales/bn.json";
import enTranslation from "./locales/en.json";

const resources = {
  bn: { translation: bnTranslation },
  en: { translation: enTranslation },
};

const savedLang = typeof window !== "undefined" ? localStorage.getItem("mrittika_language") || "bn" : "bn";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: "bn",
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("mrittika_language", lng);
    document.documentElement.lang = lng;
  }
});

export default i18n;
