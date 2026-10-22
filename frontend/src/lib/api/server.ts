import "server-only";

import { apiConfig, apiUrl, DEFAULT_DEV_API_ORIGIN, isDevelopment } from "./config";
import { ApiError, toApiError } from "./errors";

const configuredServerBaseUrl =
  process.env.API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";

const serverBaseUrl =
  configuredServerBaseUrl || (isDevelopment() ? DEFAULT_DEV_API_ORIGIN : "");

export function isServerApiConfigured(): boolean {
  return serverBaseUrl.length > 0;
}

export type QueryValue = string | number | boolean | undefined | null;

export type ServerRequestOptions = {
  searchParams?: Record<string, QueryValue>;
  signal?: AbortSignal;
  tags?: string[];
};

export async function serverRequest<T>(
  path: string,
  options: ServerRequestOptions = {},
): Promise<T> {
  if (!isServerApiConfigured()) {
    throw ApiError.unconfigured(
      `API_BASE_URL is not configured, cannot request ${path}. ` +
        "Add it to .env.local once the backend is available.",
    );
  }

  const url = new URL(apiUrl(serverBaseUrl, path));
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), apiConfig.timeoutMs);

  try {
    const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: options.signal ?? controller.signal,
      // Public content is editorial and can change after a seed/deploy. Pages that
      // are rendered on demand read the live API; static generation during `next build`
      // still uses the normal cache so SSG routes can be produced.
      ...(options.tags
        ? { next: { tags: options.tags } }
        : isBuildPhase
          ? {}
          : { cache: "no-store" as const }),
    });

    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }

    return (await response.json()) as T;
  } catch (error) {
    throw toApiError(error);
  } finally {
    clearTimeout(timeout);
  }
}
