import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import hi from './hi.json';

export const LANG_KEY = '@cattlecare_lang';
export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
] as const;

export type LangCode = 'en' | 'hi';

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
const defaultLang: LangCode = deviceLang === 'hi' ? 'hi' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: defaultLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  initImmediate: false,
});

export async function loadSavedLanguage(): Promise<boolean> {
  try {
    const saved = await AsyncStorage.getItem(LANG_KEY);
    if (saved) {
      if (saved !== i18n.language) await i18n.changeLanguage(saved);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function changeLanguage(lang: LangCode) {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANG_KEY, lang);
}

export default i18n;
