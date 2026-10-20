import { describe, expect, it } from "vitest";
import { toDisplayStatus } from "@/components/monitoring/connection-card";
import type { GatewayStatus } from "@/lib/api/gateway-socket";

describe("toDisplayStatus", () => {
  it("maps the socket lifecycle onto the three product states", () => {
    const cases: Record<GatewayStatus, string> = {
      open: "connected",
      connecting: "connecting",
      reconnecting: "connecting",
      closed: "disconnected",
    };

    for (const [status, expected] of Object.entries(cases)) {
      expect(toDisplayStatus(status as GatewayStatus)).toBe(expected);
    }
  });
});
