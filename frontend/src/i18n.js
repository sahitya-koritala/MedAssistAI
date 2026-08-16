import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/common.json';
import hi from './locales/hi/common.json';
import te from './locales/te/common.json';
import ta from './locales/ta/common.json';
import kn from './locales/kn/common.json';
import ml from './locales/ml/common.json';
import bn from './locales/bn/common.json';
import mr from './locales/mr/common.json';
import gu from './locales/gu/common.json';
import pa from './locales/pa/common.json';
import or from './locales/or/common.json';
import as from './locales/as/common.json';
import ur from './locales/ur/common.json';
import ar from './locales/ar/common.json';
import zh from './locales/zh/common.json';
import ja from './locales/ja/common.json';
import ko from './locales/ko/common.json';
import fr from './locales/fr/common.json';
import de from './locales/de/common.json';
import es from './locales/es/common.json';
import pt from './locales/pt/common.json';
import ru from './locales/ru/common.json';
import it from './locales/it/common.json';

import LanguageDetector from 'i18next-browser-languagedetector';
import { authService } from './services/authService';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  ta: { translation: ta },
  kn: { translation: kn },
  ml: { translation: ml },
  bn: { translation: bn },
  mr: { translation: mr },
  gu: { translation: gu },
  pa: { translation: pa },
  or: { translation: or },
  as: { translation: as },
  ur: { translation: ur },
  ar: { translation: ar },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  fr: { translation: fr },
  de: { translation: de },
  es: { translation: es },
  pt: { translation: pt },
  ru: { translation: ru },
  it: { translation: it }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'medassist_language',
      caches: ['localStorage'],
    },
    debug: false,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('medassist_language', lng);
  
  // Try to save to backend if user is logged in
  const token = localStorage.getItem('medico_token');
  if (token) {
    authService.setLanguage(lng).catch(e => console.error(e));
  }
});

export default i18n;
