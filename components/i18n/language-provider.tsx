"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { LanguageCode, languages, translations } from "@/lib/i18n/translations";
import {
  applyLanguageToDocument,
  getStoredLanguage,
  setCurrentLanguage
} from "@/lib/i18n/language";

type LanguageContextValue = {
  language: LanguageCode;
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  direction: "rtl" | "ltr";
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = getStoredLanguage();
    setLanguageState(saved);
    setCurrentLanguage(saved);
    setReady(true);
  }, []);

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    setCurrentLanguage(nextLanguage);
  };

  const direction = languages[language].direction;

  useEffect(() => {
    if (!ready) return;
    applyLanguageToDocument(language);
  }, [direction, language, ready]);

  const value = useMemo(
    () => ({
      language,
      currentLanguage: language,
      setLanguage,
      direction,
      t: (key: string) => translations[language][key] ?? translations.en[key] ?? key
    }),
    [direction, language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

export { getStoredLanguage, setCurrentLanguage as setLanguageStorage } from "@/lib/i18n/language";
