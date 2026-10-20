---
title: Introduction
description: What nutaraline is, how the gateway sits between your app and upstream providers, and what you get out of it.
group: Getting Started
groupOrder: 1
order: 1
updated: "2026-10-20"
---

> **Draft** — Sample content for the demo build.

nutaraline is an inference gateway. You send one request format to a single endpoint, and we route it to an upstream provider, normalise the response, and record the usage against your API key.

## Why a gateway

Calling providers directly means maintaining an integration per vendor: different auth headers, different payload shapes, different streaming formats, different error taxonomies. A gateway collapses that surface.

| Without a gateway | With nutaraline |
|---|---|
| One SDK per provider | One HTTP contract |
| Provider-specific retries | Retries and failover handled upstream |
| Usage spread across dashboards | One ledger per API key |
| No shared rate limiting | Central quotas and burst control |

## Request lifecycle

1. You send a request to `https://api.nutaraline.co.uk/v1/chat/completions`.
2. We authenticate the API key and check the balance attached to it.
3. The model name is resolved to an upstream provider and deployment.
4. The request is forwarded, streamed or buffered, and the response is normalised.
5. Token counts and cost are written to the usage ledger.

If the upstream returns a retryable error, the gateway retries against the same provider before considering an eligible fallback.

### What is normalised

- Message roles and content blocks
- Tool call and tool result shapes
- Usage objects (input, output, cached tokens)
- Error codes and retry hints

### What is not normalised

Provider-specific features that have no equivalent elsewhere — for example a vendor's proprietary file upload flow — are passed through only when the target model supports them. Otherwise we reject the request rather than silently dropping fields.

## Base URL

```bash
https://api.nutaraline.co.uk/v1
```

Every endpoint is versioned. Breaking changes ship under a new version prefix; the previous version remains available for at least six months.

## Next steps

- Read the [quickstart](/en/docs/quickstart) to send your first request.
- See [authentication](/en/docs/authentication) for key handling.
- Browse available models before choosing a default.

