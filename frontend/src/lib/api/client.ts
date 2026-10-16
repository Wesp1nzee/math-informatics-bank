import { apiConfig, isPublicApiConfigured, joinUrl } from "./config";
import { ApiError, toApiError } from "./errors";

export type ClientRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

/**
 * Typed fetch wrapper for browser requests. Uses only `NEXT_PUBLIC_API_BASE_URL`
 * so no secrets ever reach the client bundle.
 *
 * The public surface (task catalogue, articles) is rendered on the server, so
 * this is currently used for write operations such as tutor lead submission.
 */
export async function clientRequest<T>(
  path: string,
  options: ClientRequestOptions = {},
): Promise<T> {
  if (!isPublicApiConfigured()) {
    throw ApiError.unconfigured(
      `NEXT_PUBLIC_API_BASE_URL is not configured, cannot request ${path}.`,
    );
  }

  const { body, headers, ...rest } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), apiConfig.timeoutMs);

  try {
    const response = await fetch(joinUrl(apiConfig.publicBaseUrl, path), {
      // Cookie-based sessions: send/receive the HttpOnly session cookie.
      credentials: "include",
      ...rest,
      signal: rest.signal ?? controller.signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    throw toApiError(error);
  } finally {
    clearTimeout(timeout);
  }
}
