import "server-only";

import { apiConfig, apiUrl } from "./config";
import { ApiError, toApiError } from "./errors";

const serverBaseUrl = process.env.API_BASE_URL?.trim() ?? "";

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
