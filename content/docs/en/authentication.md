---
title: Authentication
description: How API keys are formatted, transmitted, rotated, and revoked.
group: Getting Started
groupOrder: 1
order: 3
updated: "2026-10-20"
---

> **Draft** — Sample content for the demo build.

## Key format

Every nutaraline key follows a fixed shape:

```text
sk-ntr-<29 hex characters, 0-9/a-f>
```

The prefix identifies the key as a gateway credential, so secret scanners can flag it when it leaks.

## Transmission

Send the key in the `Authorization` header on every request:

```bash
curl https://api.nutaraline.co.uk/v1/models \
  -H "Authorization: Bearer sk-ntr-cafebabe00000000000000000000b"
```

Never send keys in query strings. Query strings appear in proxy logs, browser history, and referrer headers.

### A note on query-string auth

Some providers accept `?api_key=`. We do not. A request with a query-string credential is rejected with `invalid_request_error` regardless of whether the key is valid.

## Storage

| Environment | Recommended storage |
|---|---|
| Local development | `.env.local`, excluded from version control |
| CI | Encrypted secret store |
| Server runtime | Environment variable or secret manager |
| Browser | Never |

If a key ever needs to run in a browser, stop — proxy the request through your own backend instead.

## Rotation

Rotate keys on a schedule, and immediately after any suspected exposure.

1. Create a replacement key.
2. Deploy the new key to your services.
3. Observe traffic on the new key for one full deployment cycle.
4. Revoke the old key.

Revocation is immediate. In-flight requests that already authenticated continue to completion; new requests fail.

## Balance is attached to the key

A key is not just a credential — it owns a balance. Topping up a key increases only that key's balance.

> **Warning** — Revoking a key does not refund its remaining balance. Transfer the balance or drain it before rotating if the value matters.

## Error responses

| Status | Code | When |
|---|---|---|
| 401 | `authentication_error` | Missing, malformed, or revoked key |
| 402 | `insufficient_balance` | Key authenticated but has no balance |
| 429 | `rate_limit_exceeded` | Quota for the current window is exhausted |

