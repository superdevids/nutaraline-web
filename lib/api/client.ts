/**
 * Minimal HTTP client for the Nutaraline gateway. The app currently renders
 * dummy data; when endpoints go live, components call `apiFetch` here.
 */
import { apiUrl } from "@/lib/env";

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/** Join the base URL with a path; absolute http(s) paths pass through. */
export function buildApiUrl(path: string, baseUrl: string = apiUrl): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = baseUrl.replace(/\/+$/, "");
  const suffix = path.replace(/^\/+/, "");
  return `${base}/${suffix}`;
}

export interface ApiRequestInit extends Omit<RequestInit, "body"> {
  /** Sent as a JSON body when provided. */
  body?: unknown;
  /** Attached as `Authorization: Bearer <token>` when provided. */
  token?: string;
}

export interface ApiRequestDeps {
  fetchImpl?: typeof fetch;
  baseUrl?: string;
}

export async function apiFetch<T>(
  path: string,
  init: ApiRequestInit = {},
  deps: ApiRequestDeps = {},
): Promise<T> {
  const { fetchImpl = fetch, baseUrl = apiUrl } = deps;
  const { body, token, headers, ...rest } = init;

  const finalHeaders = new Headers(headers);
  if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetchImpl(buildApiUrl(path, baseUrl), {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text.length > 0) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      `Request failed: ${response.status} ${response.statusText}`,
      response.status,
      payload,
    );
  }

  return payload as T;
}
