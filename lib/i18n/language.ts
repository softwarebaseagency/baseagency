import { LanguageCode, languages } from "@/lib/i18n/translations";
import { ensureScrollUnlocked, refreshScrollEffects } from "@/lib/scroll-effects";

export type { LanguageCode } from "@/lib/i18n/translations";

const STORAGE_KEY = "base-agency-language";
const DEFAULT_LANGUAGE: LanguageCode = "en";

export function isLanguageCode(value: string | null | undefined): value is LanguageCode {
  return Boolean(value && value in languages);
}

export function getStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const saved = localStorage.getItem(STORAGE_KEY);
  return isLanguageCode(saved) ? saved : DEFAULT_LANGUAGE;
}

export function saveLanguage(language: LanguageCode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, language);
}

export function getDirection(language: LanguageCode): "rtl" | "ltr" {
  return languages[language].direction;
}

export function applyLanguageToDocument(language: LanguageCode) {
  if (typeof document === "undefined") return;

  const nextDirection = getDirection(language);
  const root = document.documentElement;
  const { scrollX, scrollY } = window;

  root.lang = language;
  root.dir = nextDirection;
  ensureScrollUnlocked();

  // Preserve viewport position while direction/layout recalculates.
  requestAnimationFrame(() => {
    ensureScrollUnlocked();
    window.scrollTo(scrollX, scrollY);
    refreshScrollEffects();
  });
}

/** Client-side snapshot of the active language (defaults until hydrated). */
export let currentLanguage: LanguageCode = DEFAULT_LANGUAGE;

export function setCurrentLanguage(language: LanguageCode) {
  currentLanguage = language;
  saveLanguage(language);
  applyLanguageToDocument(language);
}

export function direction(language: LanguageCode = currentLanguage): "rtl" | "ltr" {
  return getDirection(language);
}

export function setLanguage(language: LanguageCode) {
  setCurrentLanguage(language);
}
