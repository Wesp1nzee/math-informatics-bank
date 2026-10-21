export type MotionPreference = "on" | "off";

export const MOTION_STORAGE_KEY = "motion";

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function isMotion(value: unknown): value is MotionPreference {
  return value === "on" || value === "off";
}

export function readStoredMotion(): MotionPreference | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(MOTION_STORAGE_KEY);
    if (isMotion(value)) return value;
  } catch {}
  return null;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function applyMotionPreference(preference: MotionPreference): void {
  document.documentElement.dataset.motion = preference;
  // Scroll-driven CSS animations have no JS switch, so the attribute is the switch.
  document.documentElement.style.setProperty("--motion-play", preference === "on" ? "running" : "paused");
}

export function setMotionPreference(preference: MotionPreference): void {
  try {
    window.localStorage.setItem(MOTION_STORAGE_KEY, preference);
  } catch {}
  applyMotionPreference(preference);
  emit();
}

export function subscribeMotion(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === MOTION_STORAGE_KEY || event.key === null) {
      const stored = readStoredMotion();
      applyMotionPreference(
        stored ?? (prefersReducedMotion() ? "off" : "on"),
      );
      emit();
    }
  };

  const onMotionChange = () => emit();
  window.addEventListener("storage", onStorage);
  window.addEventListener("motionpreferencechange", onMotionChange);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("motionpreferencechange", onMotionChange);
  };
}

export function getMotionPreference(): MotionPreference {
  if (typeof document === "undefined") return "on";
  const value = document.documentElement.dataset.motion;
  if (value === "on" || value === "off") return value;
  return prefersReducedMotion() ? "off" : "on";
}

export const motionInitScript = `(function(){try{var value=localStorage.getItem(${JSON.stringify(
  MOTION_STORAGE_KEY,
)});if(value!=="on"&&value!=="off"){value=matchMedia("(prefers-reduced-motion: reduce)").matches?"off":"on"}document.documentElement.dataset.motion=value;document.documentElement.style.setProperty("--motion-play",value==="on"?"running":"paused")}catch(e){document.documentElement.dataset.motion="on"}})();`;
