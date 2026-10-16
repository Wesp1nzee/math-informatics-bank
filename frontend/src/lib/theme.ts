/**
 * Theme preference: "light" or "dark".
 *
 * The choice is persisted in `localStorage` and reflected as a `data-theme`
 * attribute on <html>, which the stylesheet reads (see globals.css). On the
 * first visit (nothing stored yet) the OS preference is resolved and used as
 * the default, without persisting it until the user picks a button.
 *
 * `themeInitScript` must run before first paint to avoid a flash of the wrong
 * theme; it is injected with `strategy="beforeInteractive"` from the root
 * layout.
 */

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
  } catch {
    // localStorage can be unavailable (private mode, blocked storage).
  }
  return null;
}

export function applyThemePreference(preference: ThemePreference): void {
  document.documentElement.dataset.theme = preference;
}

export function setThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Ignore storage failures; the attribute below still updates.
  }
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

/**
 * Snapshot for `useSyncExternalStore`. Reads the attribute (kept in sync with
 * storage by the init script and `setThemePreference`) so the value is stable
 * between emits.
 */
export function getThemePreference(): ThemePreference {
  if (typeof document === "undefined") return "light";
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : systemTheme();
}

export const themeInitScript = `(function(){try{var value=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(value!=="light"&&value!=="dark"){value=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=value}catch(e){}})();`;
