import "server-only";

import { apiConfig, joinUrl } from "./config";
import { ApiError, toApiError } from "./errors";

/**
 * Base URL for server-side requests. Kept in this server-only module so the
 * value can never end up in the client bundle.
 */
const serverBaseUrl = process.env.API_BASE_URL?.trim() ?? "";

export function isServerApiConfigured(): boolean {
  return serverBaseUrl.length > 0;
}

export type QueryValue = string | number | boolean | undefined | null;

export type ServerRequestOptions = {
  /** Query string parameters; `undefined` and `null` values are skipped. */
  searchParams?: Record<string, QueryValue>;
  signal?: AbortSignal;
  /** Next.js fetch cache tags, for on-demand revalidation later. */
  tags?: string[];
};

/**
 * Typed fetch wrapper for server-side (SSR / build) requests to the future
 * FastAPI backend. Throws `ApiError` so every caller handles failures the same
 * way. This layer is the only place that knows about HTTP.
 */
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

  const url = new URL(joinUrl(serverBaseUrl, path));
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), apiConfig.timeoutMs);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: options.signal ?? controller.signal,
      ...(options.tags ? { next: { tags: options.tags } } : {}),
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
