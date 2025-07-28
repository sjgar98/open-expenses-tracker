import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../model/lang';

i18n.use(initReactI18next).init({
  lng: localStorage.getItem('lang') ?? SUPPORTED_LANGUAGES[0].lang_code,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: await import('./lang/en.json'),
    es: await import('./lang/es.json'),
  },
});

export default i18n;

