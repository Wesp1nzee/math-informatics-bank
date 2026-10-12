/**
 * Single source of truth for API endpoints that are safe to use anywhere.
 *
 * `NEXT_PUBLIC_API_BASE_URL` is inlined into the browser bundle and must never
 * contain secrets. The server-only `API_BASE_URL` lives in `./server`.
 */
export const apiConfig = {
  publicBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "",
  timeoutMs: 10_000,
} as const;

export function isPublicApiConfigured(): boolean {
  return apiConfig.publicBaseUrl.length > 0;
}

export function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
