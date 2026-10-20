---
title: Monitoring usage
description: Read the dashboard correctly, understand cost attribution, and set useful thresholds.
group: Guides
groupOrder: 2
order: 1
updated: "2026-10-20"
---

> **Draft** — Sample content for the demo build.

The monitoring page answers three questions: how much am I using, what is it costing, and is anything broken upstream.

## Reading the KPIs

| KPI | Definition | Watch for |
|---|---|---|
| Requests | Calls that reached a provider | Sudden drops often mean client-side errors |
| Tokens | Input + output tokens billed | Output share drives cost far more than input |
| Cost | List-rate charge for the selected range | Compare against the same weekday last week |
| Error rate | Failures ÷ total requests | Excludes retries that eventually succeeded |

Each KPI shows a delta against the previous equal-length window. A 30-day view compares against the preceding 30 days, not against August.

## Why cost moves

Most cost surprises come from one of these:

1. **System prompts growing.** A long system prompt is billed on every request. Cache it where supported.
2. **Output-heavy workloads.** Output tokens typically cost 3–5× input. A model that rambles is expensive.
3. **Retry storms.** A client retrying on a non-retryable error multiplies spend without new results.
4. **Model drift.** A workload switched to a larger model without anyone noticing.

## Setting thresholds

Set a balance warning at roughly two weeks of runway at current burn. Running out mid-month is worse than the warning email.

> **Tip** — Estimated runway is computed from the last seven days of spend. A burst of batch work will make the estimate pessimistic.

## Provider health

Health reflects synthetic probes plus real traffic error rates over a rolling window.

- **Healthy** — normal latency and error rate
- **Degraded** — elevated latency or error rate, failover eligible
- **Down** — probes failing consistently

The sparkline shows the last 24 samples. A provider that recovers still shows the dip — the graph is history, not current state.

## Attribution limits

Usage is attributed to the API key that made the request. There is no per-end-user attribution in this version. If you need it, encode the dimension yourself and aggregate client-side.

