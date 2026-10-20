/**
 * Realtime channel to the Nutaraline gateway. Wraps the WebSocket with
 * automatic reconnection (exponential backoff, capped) and a status callback,
 * so live metrics and notification feeds can subscribe without caring about
 * drops. Browser-only: instantiate inside client components/effects.
 */
import { wsUrl } from "@/lib/env";

export type GatewayStatus = "connecting" | "open" | "closed" | "reconnecting";

/** The slice of the WebSocket API the gateway depends on; injectable in tests. */
export interface MinimalSocket {
  readonly readyState: number;
  close(code?: number): void;
  send(data: string): void;
  onopen: ((event: unknown) => void) | null;
  onclose: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
}

export type SocketFactory = (url: string) => MinimalSocket;

/**
 * The browser WebSocket's handler types are structural mismatch only — the
 * gateway treats every event as opaque, never reading event fields — so one
 * localised cast keeps the adapter honest without wrapping properties.
 */
const browserSocketFactory: SocketFactory = (socketUrl) =>
  new WebSocket(socketUrl) as unknown as MinimalSocket;

const DEFAULT_BASE_DELAY_MS = 1_000;
const DEFAULT_MAX_DELAY_MS = 30_000;

/** Exponential backoff capped at `maxDelayMs`. Attempt 0 → base delay. */
export function nextReconnectDelay(
  attempt: number,
  baseDelayMs = DEFAULT_BASE_DELAY_MS,
  maxDelayMs = DEFAULT_MAX_DELAY_MS,
): number {
  if (attempt < 0) return baseDelayMs;
  const delay = baseDelayMs * 2 ** attempt;
  return Math.min(delay, maxDelayMs);
}

export interface GatewaySocketOptions {
  url?: string;
  /** Builds the socket; defaults to the browser WebSocket. */
  socketFactory?: SocketFactory;
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Schedules the reconnect; injectable so tests can control time. */
  scheduleReconnect?: (delayMs: number, run: () => void) => () => void;
  /** Parity hook for tests; defaults to an internal handle for the schedule. */
  onReconnectScheduled?: (attempt: number) => void;
}

const defaultScheduleReconnect = (
  delayMs: number,
  run: () => void,
): (() => void) => {
  const timer = window.setTimeout(run, delayMs);
  return () => window.clearTimeout(timer);
};

export class GatewaySocket {
  private socket: MinimalSocket | null = null;
  private attempt = 0;
  private cancelled = false;
  private cancelReconnect: (() => void) | null = null;

  private readonly url: string;
  private readonly socketFactory: SocketFactory;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly scheduleReconnect: (
    delayMs: number,
    run: () => void,
  ) => () => void;

  onMessage: ((data: unknown) => void) | null = null;
  onStatus: ((status: GatewayStatus) => void) | null = null;

  constructor(options: GatewaySocketOptions = {}) {
    this.url = options.url ?? wsUrl;
    this.socketFactory = options.socketFactory ?? browserSocketFactory;
    this.baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
    this.maxDelayMs = options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
    this.scheduleReconnect =
      options.scheduleReconnect ?? defaultScheduleReconnect;
  }

  /** Idempotent: an already-open (or connecting) socket is left alone. */
  connect(): void {
    if (this.cancelled) return;
    if (this.socket) return;
    this.attempt = 0;
    this.open();
  }

  /** Drops the connection permanently; no further reconnection attempts. */
  close(): void {
    this.cancelled = true;
    this.cancelReconnect?.();
    this.cancelReconnect = null;
    this.socket?.close();
    this.socket = null;
  }

  /** Queues a JSON payload; silently ignored while the socket is down. */
  send(payload: unknown): void {
    if (!this.socket || this.socket.readyState === 2 || this.socket.readyState === 3) {
      return;
    }
    this.socket.send(JSON.stringify(payload));
  }

  private open(): void {
    this.emit(this.attempt === 0 ? "connecting" : "reconnecting");
    const socket = this.socketFactory(this.url);
    this.socket = socket;

    socket.onopen = () => {
      this.attempt = 0;
      this.emit("open");
    };
    socket.onmessage = (event) => {
      if (typeof this.onMessage !== "function") return;
      const raw = event.data;
      if (typeof raw !== "string") {
        this.onMessage(raw);
        return;
      }
      try {
        this.onMessage(JSON.parse(raw));
      } catch {
        this.onMessage(raw);
      }
    };
    socket.onerror = () => this.emit("reconnecting");
    socket.onclose = () => {
      this.socket = null;
      if (this.cancelled) {
        this.emit("closed");
        return;
      }
      this.attempt += 1;
      this.emit("reconnecting");
      const delay = nextReconnectDelay(this.attempt, this.baseDelayMs, this.maxDelayMs);
      this.cancelReconnect = this.scheduleReconnect(delay, () => this.open());
    };
  }

  private emit(status: GatewayStatus): void {
    this.onStatus?.(status);
  }
}
