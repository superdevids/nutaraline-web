export const ERROR_CODES = [400, 401, 403, 404, 408, 429, 500, 502, 503] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/**
 * Strict match: only the canonical decimal form is accepted. `Number("400 ")`
 * and `Number("4e2")` both coerce to valid codes, which would let a malformed
 * URL render a legitimate error page.
 */
export function isErrorCode(value: string): value is `${ErrorCode}` {
  return (ERROR_CODES as readonly number[]).some((code) => String(code) === value);
}

const TONES: Record<number, "info" | "warning" | "error"> = {
  400: "warning",
  401: "warning",
  403: "warning",
  404: "info",
  408: "warning",
  429: "warning",
  500: "error",
  502: "error",
  503: "error",
};

export function toneForCode(code: number): "info" | "warning" | "error" {
  return TONES[code] ?? "error";
}

/** Replaces the verbose default that leaks internals in production. */
export function describeStatus(code: number): string {
  switch (code) {
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 408:
      return "Request Timeout";
    case 429:
      return "Too Many Requests";
    case 500:
      return "Internal Server Error";
    case 502:
      return "Bad Gateway";
    case 503:
      return "Service Unavailable";
    default:
      return "Unknown Error";
  }
}
