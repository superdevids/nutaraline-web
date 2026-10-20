import { describe, expect, it } from "vitest";
import {
  parseAppEnv,
  resolveApiUrl,
  resolveWsUrl,
  isDemoBuild,
  apiUrl,
  wsUrl,
} from "@/lib/env";

describe("app environment", () => {
  it("treats only the exact string production as production", () => {
    expect(parseAppEnv("production")).toBe("production");
  });

  it("falls back to development for anything else", () => {
    for (const value of [undefined, "", "Development", "prod", "staging"]) {
      expect(parseAppEnv(value)).toBe("development");
    }
  });

  it("defaults the API URL to local gateway and strips trailing slashes", () => {
    expect(resolveApiUrl(undefined)).toContain("localhost");
    expect(resolveApiUrl("https://api.nutaraline.com/v1/")).toBe(
      "https://api.nutaraline.com/v1",
    );
    expect(resolveApiUrl("   ")).toBe(resolveApiUrl(undefined));
  });

  it("defaults the WebSocket URL and keeps non-empty values as-is", () => {
    expect(resolveWsUrl(undefined)).toContain("ws://");
    expect(resolveWsUrl("wss://gw.example.com/ws")).toBe("wss://gw.example.com/ws");
  });

  it("exposes build-time constants as strings/booleans", () => {
    expect(typeof apiUrl).toBe("string");
    expect(typeof wsUrl).toBe("string");
    expect(typeof isDemoBuild).toBe("boolean");
  });
});
