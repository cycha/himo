import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enAds from './locales/en/ads.json';
import enDashboard from './locales/en/dashboard.json';

import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frAds from './locales/fr/ads.json';
import frDashboard from './locales/fr/dashboard.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    ads: enAds,
    dashboard: enDashboard,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    ads: frAds,
    dashboard: frDashboard,
  },
};

// Get initial language from localStorage safely
const getInitialLanguage = (): string => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('language') || 'en';
    }
  } catch (error) {
    console.warn('Failed to access localStorage:', error);
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
