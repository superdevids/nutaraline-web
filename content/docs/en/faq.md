---
title: FAQ
description: Short answers to the most frequently asked questions about the Nutaraline gateway.
group: Guides
groupOrder: 2
order: 2
toc: "false"
updated: "2026-10-20"
---

The questions we hear most often about the Nutaraline gateway. If your question is not answered here, continue to the [Introduction](/docs/introduction) or [Authentication](/docs/authentication).

## FAQ

### How do I get an API key?

Create an account, open the **Balance** page, and look up your key. New keys are active immediately and work on every endpoint.

### What does a Nutaraline key look like?

Every key starts with `sk-ntr-` followed by 29 hexadecimal characters (0-9, a-f). The last character is a checksum digit: if a single digit is mistyped or dropped, the key is rejected before it ever reaches the server.

### How do I send my API key?

Pass the key in the `Authorization` header using the Bearer scheme:

```bash
curl https://api.nutaraline.co.uk/v1/models \
  -H "Authorization: Bearer sk-ntr-cafebabe00000000000000000000b"
```

Credentials in the query string are deliberately unsupported.

### Which models are available?

The full list — with input/output pricing per million tokens, context length, and capabilities — lives on the **Models** page. You can also fetch it programmatically through the `/v1/models` endpoint.

### How do I monitor usage and cost?

The **Monitoring** page summarises key indicators, request trends, and per-model usage. Per-key detail lives on the **Balance** page: call history, current-month usage, and remaining balance.

### Are there realtime indicators?

Yes. Key indicators on Monitoring and the token pools on Models are refreshed over a realtime (WebSocket) connection, so what you see is live state, not a stale snapshot.

### What happens when an unlimited token pool runs out?

Usage continues without interruption: a model whose pool is exhausted automatically draws on your main balance. Pools reset at 00:00 UTC+7 Asia/Jakarta.

### Where does the daily token bonus come from?

Every day you receive free quota: per-model bonuses (for example 20M for Deepseek V4.1 Flash) plus a combined 50M bonus covering usage of featured models. Everything resets at 00:00 UTC+7 Asia/Jakarta.

### Is there a rate limit?

Each key has a rate quota. When you exceed it, the gateway returns `429` with a `Retry-After` header; back off for that duration before retrying.

### How are errors and retries handled?

Every error uses a standard envelope with an inspectable code (see [Errors](/docs/errors)). Retry-safe requests are processed idempotently, and transient upstream failures are retried or failed over automatically before they reach you.

### Is streaming supported?

Yes. Send `"stream": true` on a chat completions request and the gateway forwards server-sent events from the upstream provider without reshaping them.

### Do OpenAI SDKs work out of the box?

Yes. Because request and response shapes follow the OpenAI convention, point your SDK's `base_url` at the Nutaraline endpoint and swap the API key — no other code changes required.

### How do I add balance?

Open the **Top up** page, choose an amount or type your own, and complete payment through a Virtual Account. Balance lands automatically once payment is confirmed, and an invoice is downloadable.

### Which payment methods are supported?

Virtual Account and QRIS. Payment status is verified automatically — press "I have paid" after transferring, and your key and invoice are presented in the final step.

### Does balance expire?

No. Balance lasts until it is spent. Unlimited plans have their own subscription duration, visible in the account summary on the Balance page.

### Is my conversation data used to train models?

No. The dashboard only records usage metadata — token counts, latency, and status — never your request or response content.

### Can I ship an API key inside a browser or client app?

Don't. Client-side keys are readable by anyone; always call the gateway from your own backend and forward the result to your client application.

### How do I rotate a key safely?

Create a replacement key, deploy it, observe one full cycle, then revoke the old one (see [Authentication](/docs/authentication)). Balance is attached to the key — move any remaining balance before revoking.

### What happens when a key is revoked?

Revocation is immediate. In-flight requests finish, new requests are rejected outright, and the remaining balance is not lost — simply move it to a replacement key.
