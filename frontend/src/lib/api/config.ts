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
