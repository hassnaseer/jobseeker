import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en, { type TranslationDict } from './en';
import es from './es';
import fr from './fr';

export type Language = 'en' | 'es' | 'fr';

const DICTS: Record<Language, TranslationDict> = { en, es, fr };
const LANGUAGE_KEY = 'jl_language';

type NamespaceKey = keyof TranslationDict;

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <NS extends NamespaceKey>(ns: NS, key: keyof TranslationDict[NS]) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (stored === 'en' || stored === 'es' || stored === 'fr') setLanguageState(stored);
    });
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_KEY, lang).catch(() => undefined);
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (ns, key) => {
        const dict = DICTS[language];
        const entry = (dict[ns] as Record<string, string>)[key as string];
        return entry ?? String(key);
      },
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
