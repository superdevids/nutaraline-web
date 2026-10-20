---
title: Models endpoint
description: List every model reachable through the gateway, with pricing and capabilities.
group: API Reference
groupOrder: 3
order: 2
updated: "2026-10-20"
---

> **Draft** — Sample content for the demo build.

```http
GET /v1/models
```

Returns every model your key can reach. The response is paginated.

## Example

```bash
curl https://api.nutaraline.co.uk/v1/models \
  -H "Authorization: Bearer sk-ntr-cafebabe00000000000000000000b"
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o-mini",
      "provider": "openai",
      "context_window": 128000,
      "max_output": 16384,
      "pricing": { "input_per_1m": 0.15, "output_per_1m": 0.6, "currency": "USD" },
      "capabilities": ["vision", "tools", "json"],
      "status": "available"
    }
  ],
  "has_more": false
}
```

## Fields

| Field | Type | Notes |
|---|---|---|
| `id` | string | Slug to pass as `model` |
| `provider` | string | Upstream vendor |
| `context_window` | integer | Total tokens in + out the model accepts |
| `max_output` | integer | Upper bound on generated tokens |
| `pricing.input_per_1m` | number | USD per million input tokens |
| `pricing.output_per_1m` | number | USD per million output tokens |
| `capabilities` | string[] | Feature flags |
| `status` | string | `available`, `preview`, or `deprecated` |

## Capability values

- `vision` — accepts image blocks
- `tools` — supports function calling
- `reasoning` — exposes a reasoning step
- `long-context` — context window above 200K tokens
- `json` — honours `response_format`

## Filtering

```http
GET /v1/models?provider=anthropic&capability=vision
```

Filters combine with AND. Unknown values return an empty list rather than an error, so a typo does not break a listing UI.

## Pricing caveat

Prices shown are the list rate at request time. A provider can change them; the gateway bills at the rate in effect when the request was served, which may differ from a catalog fetched earlier.

