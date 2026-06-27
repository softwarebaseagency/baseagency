export const SCROLL_EFFECTS_REFRESH_EVENT = "base-agency:refresh-scroll-effects";

export function ensureScrollUnlocked() {
  if (typeof document === "undefined") return;

  document.documentElement.style.overflowY = "scroll";
  document.documentElement.style.overflowX = "hidden";
  document.body.style.overflowY = "auto";
  document.body.style.overflowX = "hidden";
  document.body.style.position = "";
  document.body.style.height = "";
}

export function refreshScrollEffects() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(SCROLL_EFFECTS_REFRESH_EVENT));
}
