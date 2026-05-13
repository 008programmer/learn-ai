import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en";

export type Language = {
  code: string;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
};

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
];

const STORAGE_KEY = "language";

const savedLang = localStorage.getItem(STORAGE_KEY) ?? "en";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export { i18n };
