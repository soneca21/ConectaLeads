import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Start with Portuguese resources; others lazy-load via loadLanguage.
import ptCommon from './locales/pt/common.json';

const resources = {
  pt: { translation: ptCommon },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: { escapeValue: false },
  });

export const loadLanguage = async (lng) => {
  if (!lng || i18n.hasResourceBundle(lng, 'translation')) {
    return i18n.changeLanguage(lng || 'pt');
  }
  const module = await import(`./locales/${lng}/common.json`);
  i18n.addResourceBundle(lng, 'translation', module.default, true, true);
  return i18n.changeLanguage(lng);
};

export default i18n;
