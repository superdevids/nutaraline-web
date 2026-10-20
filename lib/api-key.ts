// API key helpers.
//
// SECURITY NOTE: masking and local checksum validation here are UX hygiene —
// they catch typos early and keep keys out of screenshots. Neither is a
// security control; there is no server-side auth in this phase, and anything
// sent to the browser is readable by the user. Real authorisation happens
// when the server looks the key up. This file is dependency-free so the same
// algorithm can be copied verbatim into the API server.

export const API_KEY_PREFIX = "sk-ntr-";
/** 28 content hex characters + 1 checksum digit. */
export const API_KEY_BODY_LENGTH = 29;
export const API_KEY_CONTENT_LENGTH = 28;
export const MASK_CHAR = "•";

const HEX = "0123456789abcdef";
const BODY_PATTERN = /^[0-9a-f]{29}$/;
const CONTENT_PATTERN = /^[0-9a-f]{28}$/;

/**
 * Demo key used across docs (curl examples have a valid checksum):
 * content "cafebabe" + 20×"0" → checksum digit "b".
 */
export const EXAMPLE_API_KEY = "sk-ntr-cafebabe00000000000000000000b";
/** Valid example whose last four characters are "0000" → zero balance demo. */
export const EMPTY_BALANCE_API_KEY = "sk-ntr-caaebabe000000000000000000000";

export type ApiKeyValidation =
  | { ok: true; value: string }
  | { ok: false; reason: "empty" | "format" | "checksum" };

function hexValue(ch: string): number | null {
  const code = ch.charCodeAt(0);
  if (code >= 48 && code <= 57) return code - 48; // 0-9
  if (code >= 97 && code <= 102) return code - 87; // a-f
  if (code >= 65 && code <= 70) return code - 55; // A-F
  return null;
}

/**
 * Luhn mod-16 over hex digits. With the check digit appended on the right,
 * every second content digit — odd indices — is doubled; doubled values ≥ 16
 * fold back by 15 so they stay inside one hex digit's range. The check digit
 * is chosen so the grand total divides evenly by 16.
 */
export function checksumDigit(content: string): number | null {
  if (!CONTENT_PATTERN.test(content)) return null;

  let sum = 0;
  for (let index = 0; index < content.length; index++) {
    const value = parseInt(content[index], 16);
    sum += index % 2 === 1 ? (value * 2 >= 16 ? value * 2 - 15 : value * 2) : value;
  }

  return (16 - (sum % 16)) % 16;
}

function randomHexContent(): string {
  let content = "";

  for (let index = 0; index < API_KEY_CONTENT_LENGTH; index++) {
    content += HEX[Math.floor(Math.random() * 16)];
  }

  return content;
}

/**
 * Builds a checksum-valid key. `content` must be exactly 28 hex characters;
 * anything else falls back to a random body. Demo flows use Math.random — a
 * production server should prefer a CSPRNG for issued keys.
 */
export function generateApiKey(content?: string): string {
  const normalized = content?.toLowerCase() ?? "";

  const body = CONTENT_PATTERN.test(normalized)
    ? normalized
    : randomHexContent();
  const digit = checksumDigit(body);

  return `${API_KEY_PREFIX}${body}${digit === null ? "0" : HEX[digit]}`;
}

export function validateApiKey(input: string): ApiKeyValidation {
  const value = input.trim();

  if (!value) return { ok: false, reason: "empty" };

  if (!value.startsWith(API_KEY_PREFIX)) return { ok: false, reason: "format" };

  const body = value.slice(API_KEY_PREFIX.length).toLowerCase();
  if (!BODY_PATTERN.test(body)) return { ok: false, reason: "format" };

  const content = body.slice(0, API_KEY_CONTENT_LENGTH);
  const check = hexValue(body[API_KEY_CONTENT_LENGTH]);
  if (check === null || check !== checksumDigit(content)) {
    return { ok: false, reason: "checksum" };
  }

  // Uppercase input is accepted but normalised so every consumer sees the
  // canonical lowercase form.
  return { ok: true, value: `${API_KEY_PREFIX}${body}` };
}

export function maskApiKey(key: string): string {
  if (!key.startsWith(API_KEY_PREFIX)) {
    return MASK_CHAR.repeat(Math.min(key.length, 12));
  }

  const body = key.slice(API_KEY_PREFIX.length);
  if (body.length <= 4) {
    return `${API_KEY_PREFIX}${MASK_CHAR.repeat(6)}`;
  }

  return `${API_KEY_PREFIX}${MASK_CHAR.repeat(6)}${body.slice(-4)}`;
}

/**
 * Stable, non-cryptographic fingerprint used only as a local index for
 * session state. Never treat this as authentication.
 */
export function keyFingerprint(key: string): string {
  let hash = 0x811c9dc5;

  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Keys ending in "0000" resolve to a zero balance so the empty state can be
 * exercised without special-casing in components. Checksum-valid keys can
 * still end that way (see EMPTY_BALANCE_API_KEY).
 */
export function isZeroBalanceKey(key: string): boolean {
  return key.trim().endsWith("0000");
}
