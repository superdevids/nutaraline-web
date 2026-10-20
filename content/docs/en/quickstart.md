---
title: Quickstart
description: Create a key, send your first request, and read the response in under five minutes.
group: Getting Started
groupOrder: 1
order: 2
updated: "2026-10-20"
---

> **Draft** — Sample content for the demo build.

This guide takes you from zero to a successful chat completion.

## Create an API key

Keys are created in the balance page. A key looks like this:

```text
sk-ntr-cafebabe00000000000000000000b
```

Treat it like a password. It is the only credential the gateway accepts.

> **Note** — The key above is a documentation placeholder. It will not authenticate.

## Send a request

```bash
curl https://api.nutaraline.co.uk/v1/chat/completions \
  -H "Authorization: Bearer sk-ntr-cafebabe00000000000000000000b" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      { "role": "user", "content": "Explain vector databases in two sentences." }
    ]
  }'
```

A successful response looks like:

```json
{
  "id": "chatcmpl_01HX",
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "..." },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 18, "completion_tokens": 42, "total_tokens": 60 }
}
```

## Stream the response

Add `"stream": true` to receive server-sent events. Each event is a JSON delta:

| Field | Meaning |
|---|---|
| `choices[0].delta.content` | New text fragment |
| `choices[0].finish_reason` | Set on the final chunk only |
| `usage` | Present on the final chunk when enabled |

## Check what it cost

Open the balance page and look up your key. The ledger shows the request cost computed from input and output tokens at the model's published rate.

```text
input  = 18 tokens × $0.15 / 1M  = $0.0000027
output = 42 tokens × $0.60 / 1M  = $0.0000252
```

Charges are aggregated before they hit your balance, so individual rounding errors do not accumulate.

## Common first-run mistakes

- Sending `Authorization` without the `Bearer ` prefix.
- Using a model slug from a different provider while pointing at its own base URL.
- Forgetting `Content-Type: application/json`.
- Reusing a revoked key after rotation.

