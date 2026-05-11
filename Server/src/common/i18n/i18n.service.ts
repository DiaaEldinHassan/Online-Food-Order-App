import en from "./locales/en.json";
import ar from "./locales/ar.json";

const translations: Record<string, Record<string, string>> = { en, ar };

export const t = (key: string, lang: string = "en"): string => {
  const langTranslations = translations[lang];
  if (langTranslations && langTranslations[key]) {
    return langTranslations[key];
  }
  const enTranslations = translations["en"];
  if (enTranslations && enTranslations[key]) {
    return enTranslations[key];
  }
  return key;
};
