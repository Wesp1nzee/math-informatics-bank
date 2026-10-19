export const DEFAULT_DEV_API_ORIGIN = "http://localhost:8000";

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

function normalizeOrigin(value: string | undefined): string {
  return value?.trim().replace(/\/+$/, "") ?? "";
}

export const apiConfig = {
  publicBaseUrl:
    normalizeOrigin(process.env.NEXT_PUBLIC_API_BASE_URL) ||
    (isDevelopment() ? DEFAULT_DEV_API_ORIGIN : ""),
  timeoutMs: 10_000,
} as const;

export const API_PREFIX = "/api/v1";

export function isPublicApiConfigured(): boolean {
  return apiConfig.publicBaseUrl.length > 0;
}

export function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export function apiUrl(base: string, path: string): string {
  return joinUrl(base, `${API_PREFIX}/${path.replace(/^\/+/, "")}`);
}
