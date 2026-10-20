import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch, buildApiUrl } from "@/lib/api/client";

const BASE = "https://api.nutaraline.com/v1";

describe("buildApiUrl", () => {
  it("joins base and path without double slashes", () => {
    expect(buildApiUrl("models", BASE)).toBe(`${BASE}/models`);
    expect(buildApiUrl("/models", `${BASE}/`)).toBe(`${BASE}/models`);
  });

  it("passes absolute URLs through untouched", () => {
    expect(buildApiUrl("https://other.example.com/x", BASE)).toBe(
      "https://other.example.com/x",
    );
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiFetch", () => {
  it("returns parsed JSON on success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const data = await apiFetch<{ ok: boolean }>("/models", {}, { fetchImpl, baseUrl: BASE });

    expect(data).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledWith(`${BASE}/models`, expect.anything());
  });

  it("serialises the body and sets JSON content type", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ id: 1 }));
    await apiFetch(
      "/chat/completions",
      { method: "POST", body: { model: "x" } },
      { fetchImpl, baseUrl: BASE },
    );

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ model: "x" }));
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
  });

  it("attaches the bearer token when provided", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}));
    await apiFetch("/me", { token: "sk-ntr-test" }, { fetchImpl, baseUrl: BASE });

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer sk-ntr-test");
  });

  it("throws ApiError carrying status and parsed payload on failure", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: "invalid_key" }, 401));

    const failure = await apiFetch(
      "/me",
      {},
      { fetchImpl, baseUrl: BASE },
    ).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiError);
    const apiError = failure as ApiError;
    expect(apiError.status).toBe(401);
    expect(apiError.payload).toEqual({ error: "invalid_key" });
  });

  it("keeps non-JSON bodies as raw text", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response("gateway maintenance", { status: 503 }));

    const failure = await apiFetch(
      "/status",
      {},
      { fetchImpl, baseUrl: BASE },
    ).catch((error: unknown) => error as ApiError);

    expect((failure as ApiError).payload).toBe("gateway maintenance");
  });
});
