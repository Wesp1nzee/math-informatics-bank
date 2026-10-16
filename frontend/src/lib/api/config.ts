export const apiConfig = {
  publicBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "",
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
