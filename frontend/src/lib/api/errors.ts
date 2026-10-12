export type ApiErrorKind = "unconfigured" | "network" | "timeout" | "http" | "unknown";

type ApiErrorOptions = {
  status?: number;
  details?: unknown;
  cause?: unknown;
};

/**
 * Normalized error for anything that can go wrong while talking to the API.
 * UI components switch on `kind` instead of guessing from the message.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly details?: unknown;

  constructor(kind: ApiErrorKind, message: string, options: ApiErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = options.status;
    this.details = options.details;
  }

  static unconfigured(message: string): ApiError {
    return new ApiError("unconfigured", message);
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text().catch(() => undefined);
    }
    return new ApiError("http", `Request failed with status ${response.status}`, {
      status: response.status,
      details,
    });
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError("timeout", "Request timed out", { cause: error });
  }
  if (error instanceof Error) {
    return new ApiError("network", error.message, { cause: error });
  }
  return new ApiError("unknown", "Unknown API error", { details: error });
}

/** Human-readable, user-facing message (Russian UI). */
export function describeApiError(error: unknown): string {
  if (!isApiError(error)) {
    return "Не удалось загрузить данные. Попробуйте обновить страницу.";
  }
  switch (error.kind) {
    case "unconfigured":
      return "Сервер данных ещё не подключён. Пока показываем встроенный демонстрационный набор.";
    case "timeout":
      return "Сервер отвечает слишком долго. Попробуйте ещё раз чуть позже.";
    case "http":
      return error.status === 404
        ? "Запрошенные данные не найдены."
        : "Сервер вернул ошибку. Попробуйте ещё раз чуть позже.";
    case "network":
      return "Нет связи с сервером. Проверьте подключение к сети.";
    default:
      return "Не удалось загрузить данные. Попробуйте обновить страницу.";
  }
}
