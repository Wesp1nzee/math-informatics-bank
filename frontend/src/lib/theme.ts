export type ThemePreference = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function isTheme(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark";
}

function systemTheme(): ThemePreference {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readStoredTheme(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(value)) return value;
  } catch {}
  return null;
}

export function applyThemePreference(preference: ThemePreference): void {
  document.documentElement.dataset.theme = preference;
}

export function setThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {}
  applyThemePreference(preference);
  emit();
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      applyThemePreference(readStoredTheme() ?? systemTheme());
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getThemePreference(): ThemePreference {
  if (typeof document === "undefined") return "light";
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : systemTheme();
}

export const themeInitScript = `(function(){try{var value=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(value!=="light"&&value!=="dark"){value=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=value;document.documentElement.dataset.js="true"}catch(e){}})();`;
