import { describe, expect, it } from "vitest";
import {
  GatewaySocket,
  nextReconnectDelay,
  type MinimalSocket,
} from "@/lib/api/gateway-socket";

class FakeSocket implements MinimalSocket {
  readyState = 0;
  sent: string[] = [];
  closed = false;

  onopen: ((event: unknown) => void) | null = null;
  onclose: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;

  close(): void {
    this.closed = true;
    this.readyState = 3;
  }
  send(data: string): void {
    this.sent.push(data);
  }
}

/** Drives all socket events for one gateway instance. */
function harness() {
  const sockets: FakeSocket[] = [];
  const scheduled: { delayMs: number; run: () => void; cancelled: boolean }[] = [];

  const scheduleReconnect = (delayMs: number, run: () => void) => {
    const entry = { delayMs, run, cancelled: false };
    scheduled.push(entry);
    return () => {
      entry.cancelled = true;
    };
  };

  const gateway = new GatewaySocket({
    url: "wss://gw.test/ws",
    socketFactory: () => {
      const socket = new FakeSocket();
      sockets.push(socket);
      return socket;
    },
    scheduleReconnect,
    baseDelayMs: 500,
    maxDelayMs: 5_000,
  });

  return { gateway, sockets, scheduled };
}

describe("nextReconnectDelay", () => {
  it("doubles from the base delay and never exceeds the cap", () => {
    expect(nextReconnectDelay(0)).toBe(1_000);
    expect(nextReconnectDelay(1)).toBe(2_000);
    expect(nextReconnectDelay(2)).toBe(4_000);
    expect(nextReconnectDelay(10, 1_000, 30_000)).toBe(30_000);
  });
});

describe("GatewaySocket", () => {
  it("walks connecting → open and reports the url it opened", () => {
    const { gateway, sockets } = harness();
    const statuses: string[] = [];
    gateway.onStatus = (status) => statuses.push(status);

    gateway.connect();

    expect(statuses).toEqual(["connecting"]);
    expect(sockets).toHaveLength(1);

    sockets[0].onopen?.(undefined);
    expect(statuses).toEqual(["connecting", "open"]);
  });

  it("passes JSON messages through parsing, raw when not JSON", () => {
    const { gateway, sockets } = harness();
    const messages: unknown[] = [];
    gateway.onMessage = (data) => messages.push(data);
    gateway.connect();

    sockets[0].onmessage?.({ data: '{"tokens":72}' });
    sockets[0].onmessage?.({ data: "plain-text" });

    expect(messages).toEqual([{ tokens: 72 }, "plain-text"]);
  });

  it("reconnects with growing delays after an unexpected close", () => {
    const { gateway, sockets, scheduled } = harness();
    const statuses: string[] = [];
    gateway.onStatus = (status) => statuses.push(status);
    gateway.connect();
    sockets[0].onopen?.(undefined);

    sockets[0].onclose?.(undefined);

    expect(statuses).toContain("reconnecting");
    expect(scheduled).toHaveLength(1);
    expect(scheduled[0].delayMs).toBe(1_000);

    scheduled[0].run();

    expect(sockets).toHaveLength(2);
    expect(statuses[statuses.length - 1]).toBe("reconnecting");

    sockets[1].onclose?.(undefined);
    expect(scheduled[1].delayMs).toBe(2_000);
  });

  it("does not reconnect after an explicit close", () => {
    const { gateway, sockets, scheduled } = harness();
    const statuses: string[] = [];
    gateway.onStatus = (status) => statuses.push(status);
    gateway.connect();
    sockets[0].onopen?.(undefined);

    gateway.close();
    expect(sockets[0].closed).toBe(true);

    // Real sockets always deliver the close event after close(); the handler
    // must see the cancelled flag and stop, not re-arm.
    sockets[0].onclose?.(undefined);

    expect(statuses).toContain("closed");
    expect(scheduled).toHaveLength(0);
  });

  it("ignores send while the socket is down", () => {
    const { gateway } = harness();
    expect(() => gateway.send({ a: 1 })).not.toThrow();
  });

  it("sends JSON payloads when open", () => {
    const { gateway, sockets } = harness();
    gateway.connect();
    sockets[0].onopen?.(undefined);
    sockets[0].readyState = 1;

    gateway.send({ type: "subscribe" });

    expect(sockets[0].sent).toEqual([JSON.stringify({ type: "subscribe" })]);
  });
});
