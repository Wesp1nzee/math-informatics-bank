import type { PulseKind } from "@/features/world/types";

/**
 * A tiny, React-free event bus between client leaves (quiz, form, scroll
 * engine) and the single `WorldCanvas`. Components never import the scene
 * directly — they call `pulseWorld` / `setWorldState`, which forward to the
 * registered world (if mounted) or remember the last requested state.
 */

type WorldApi = {
  setState: (name: string) => void;
  pulse: (kind: PulseKind) => void;
  scan: () => void;
};

let worldApi: WorldApi | null = null;
let lastState: string | null = null;
let scanPending = false;

export function registerWorld(api: WorldApi): void {
  worldApi = api;
  if (lastState) api.setState(lastState);
  if (scanPending) {
    scanPending = false;
    api.scan();
  }
}

export function unregisterWorld(): void {
  worldApi = null;
}

export function setWorldState(name: string): void {
  lastState = name;
  worldApi?.setState(name);
}

export function pulseWorld(kind: PulseKind): void {
  worldApi?.pulse(kind);
}

export function scanWorld(): void {
  if (worldApi) worldApi.scan();
  else scanPending = true;
}

export function currentWorldState(): string | null {
  return lastState;
}
