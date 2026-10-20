---
title: Chat completions
description: The primary endpoint. Message format, sampling parameters, tools, and streaming.
group: API Reference
groupOrder: 3
order: 1
updated: "2026-10-20"
---

> **Draft** — Sample content for the demo build.

```http
POST /v1/chat/completions
```

## Request body

| Field | Type | Required | Notes |
|---|---|---|---|
| `model` | string | yes | Model slug from the catalog |
| `messages` | array | yes | Conversation history, oldest first |
| `stream` | boolean | no | Defaults to `false` |
| `temperature` | number | no | 0–2, defaults to 1 |
| `top_p` | number | no | 0–1 |
| `max_tokens` | integer | no | Capped by the model's max output |
| `tools` | array | no | Function definitions |
| `tool_choice` | string \| object | no | `auto`, `none`, or a named tool |
| `response_format` | object | no | `{"type":"json_object"}` where supported |

## Messages

Each message has a `role` and `content`. Content may be a string or an array of blocks.

```json
{
  "role": "user",
  "content": [
    { "type": "text", "text": "What is in this image?" },
    { "type": "image_url", "image_url": { "url": "https://example.com/chart.png" } }
  ]
}
```

### Supported roles

- `system` — instructions that apply to the whole conversation
- `user` — end-user input
- `assistant` — prior model output, including tool calls
- `tool` — the result of a tool invocation

## Sampling parameters

Temperature and top_p interact. Change one, not both. A common pattern:

```json
{ "temperature": 0.2 }
```

for extraction and classification, and the default for conversational use.

## Tools

Define a tool, then handle the call:

```json
{
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "Current weather for a city",
      "parameters": {
        "type": "object",
        "properties": { "city": { "type": "string" } },
        "required": ["city"]
      }
    }
  }]
}
```

When the model returns `finish_reason: "tool_calls"`, execute the function yourself and send the result back in a message with `role: "tool"`.

## Streaming

With `stream: true` the response is a sequence of `data:` lines terminated by `data: [DONE]`. Parse incrementally — do not wait for the full body.

### Mid-stream errors

An error that occurs after the first chunk arrives as an event with an `error` object rather than an HTTP status. Your parser must handle it.

## Response shape

```json
{
  "id": "chatcmpl_01HX",
  "object": "chat.completion",
  "created": 1761000000,
  "model": "claude-3-5-sonnet",
  "choices": [
    { "index": 0, "message": { "role": "assistant", "content": "..." }, "finish_reason": "stop" }
  ],
  "usage": {
    "prompt_tokens": 120,
    "completion_tokens": 340,
    "total_tokens": 460
  }
}
```

## Finish reasons

| Value | Meaning |
|---|---|
| `stop` | Natural end of the message |
| `length` | Hit `max_tokens` |
| `tool_calls` | Model wants a tool executed |
| `content_filter` | Blocked by provider safety policy |

