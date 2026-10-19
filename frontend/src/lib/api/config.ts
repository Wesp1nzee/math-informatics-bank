/**
 * Local FastAPI backend used when no explicit origin is configured.
 *
 * The default applies to `next dev` only: production builds and deployments
 * must set the API origin explicitly, otherwise content pages have no source
 * of truth.
 */
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

/**
 * Versioned path prefix appended to every API endpoint. Both base URLs are
 * configured as a bare origin (e.g. `http://localhost:8000`); `/api/v1` is
 * added centrally here so it never has to be repeated in callers or env vars.
 */
export const API_PREFIX = "/api/v1";

export function isPublicApiConfigured(): boolean {
  return apiConfig.publicBaseUrl.length > 0;
}

export function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/** Build the absolute URL for a versioned endpoint: `apiUrl(base, "/tasks")` → `base/api/v1/tasks`. */
export function apiUrl(base: string, path: string): string {
  return joinUrl(base, `${API_PREFIX}/${path.replace(/^\/+/, "")}`);
}
