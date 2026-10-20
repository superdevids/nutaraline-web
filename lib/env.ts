/**
 * Deployment configuration. All values are NEXT_PUBLIC_ so the same module
 * works in server components and the browser — Next.js inlines them at build
 * time. Do not read `process.env` anywhere else for these settings.
 *
 * NODE_ENV is managed by Next.js (it flips to "production" for builds) and is
 * deliberately not used for feature gating; use NEXT_PUBLIC_ENV instead.
 */

export type AppEnv = "development" | "production";

const DEFAULT_API_URL = "http://localhost:8787/v1";
const DEFAULT_WS_URL = "ws://localhost:8787/ws";

export function parseAppEnv(value: string | undefined): AppEnv {
  return value === "production" ? "production" : "development";
}

export function resolveApiUrl(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed.replace(/\/+$/, "") : DEFAULT_API_URL;
}

export function resolveWsUrl(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_WS_URL;
}

const appEnv = parseAppEnv(process.env.NEXT_PUBLIC_ENV);

/** True on development builds — gates every demo/draft message in the app. */
export const isDemoBuild = appEnv === "development";

export const appEnvName: AppEnv = appEnv;
export const apiUrl = resolveApiUrl(process.env.NEXT_PUBLIC_API_URL);
export const wsUrl = resolveWsUrl(process.env.NEXT_PUBLIC_WS_URL);
