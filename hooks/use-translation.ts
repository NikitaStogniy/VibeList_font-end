import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Custom hook for translations
 * Wraps react-i18next's useTranslation for easier usage
 */
export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  return {
    t,
    language: i18n.language,
    currentLanguage: i18n.language,
    changeLanguage: (lng: string) => i18n.changeLanguage(lng),
    languages: Object.keys(i18n.options.resources || {}),
  };
}
