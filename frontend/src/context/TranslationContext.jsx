import { createContext, useContext } from "react";
import { useTranslation as useI18nTranslation } from "react-i18next";
import i18n from "../i18n";

export const TranslationContext = createContext(undefined);

export function TranslationProvider({ children }) {
  return (
    <TranslationContext.Provider value={{ i18n }}>
      {children}
    </TranslationContext.Provider>
  );
}

// Custom hook to use translation
export function useTranslation() {
  const { t, i18n } = useI18nTranslation();
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };
  
  return {
    t,
    language: i18n.language,
    setLanguage: changeLanguage,
    i18n
  };
}

