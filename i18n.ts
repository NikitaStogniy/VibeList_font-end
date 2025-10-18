import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';

import en from './locales/en.json';
import es from './locales/es.json';
import ru from './locales/ru.json';

// Define available languages
export const languages = {
  en: { translation: en },
  es: { translation: es },
  ru: { translation: ru },
};

// Get device locale using React Native's built-in APIs
const getDeviceLanguage = (): string => {
  let locale = 'en';

  if (Platform.OS === 'ios') {
    locale = NativeModules.SettingsManager?.settings?.AppleLocale ||
             NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
             'en';
  } else if (Platform.OS === 'android') {
    locale = NativeModules.I18nManager?.localeIdentifier || 'en';
  }

  // Extract language code from locale (e.g., "en_US" -> "en")
  return locale.split(/[-_]/)[0];
};

const deviceLanguage = getDeviceLanguage();

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: languages,
    lng: deviceLanguage,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

export default i18n;
