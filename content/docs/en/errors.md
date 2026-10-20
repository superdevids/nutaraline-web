---
title: Errors
description: Error taxonomy, retry semantics, and how to handle partial failures.
group: API Reference
groupOrder: 3
order: 3
updated: "2026-10-20"
---

> **Draft** — Sample content for the demo build.

All errors share one envelope:

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "missing_model",
    "message": "The 'model' field is required.",
    "request_id": "req_01HX"
  }
}
```

Always log `request_id`. It is the only handle support can use to trace a specific call.

## Types

| Type | HTTP | Retryable |
|---|---|---|
| `invalid_request_error` | 400 | No |
| `authentication_error` | 401 | No |
| `insufficient_balance` | 402 | No — top up first |
| `not_found_error` | 404 | No |
| `rate_limit_exceeded` | 429 | Yes, with backoff |
| `upstream_error` | 502 | Yes |
| `timeout_error` | 504 | Yes |
| `internal_error` | 500 | Sometimes |

## Retry strategy

Retry only on 429, 502, 504, and 500. Use exponential backoff with jitter:

```text
delay = min(cap, base * 2^attempt) * (0.5 + random())
```

Recommended `base` is 500 ms, `cap` is 20 s, and `attempt` max is 4.

> **Warning** — Do not retry `402`. The key has no balance; retrying burns time and changes nothing.

## Partial streaming failures

A long completion can fail mid-stream. The client receives chunks, then an error event. There is no automatic resume: the partial text is yours to keep or discard, but it is still billed for the tokens the model produced.

## Failover behaviour

When an upstream provider is degraded, the gateway may retry against another provider serving the same model family. Failover is skipped when:

- The request uses provider-specific parameters
- The model has only one deployment
- The caller disabled failover

## Idempotency

`POST /v1/chat/completions` is not idempotent. If a timeout occurs after the model has begun generating, a retry bills a second completion. Supply an `Idempotency-Key` header when that cost matters.

