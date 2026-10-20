"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { GatewaySocket, type GatewayStatus } from "@/lib/api/gateway-socket";
import { apiUrl } from "@/lib/env";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/i18n";

type DisplayStatus = "connecting" | "connected" | "disconnected";

/** Maps the socket lifecycle to the three states the product exposes. */
export function toDisplayStatus(status: GatewayStatus): DisplayStatus {
	if (status === "open") return "connected";
	if (status === "connecting" || status === "reconnecting") return "connecting";
	return "disconnected";
}

const statusTone: Record<DisplayStatus, string> = {
	connected: "text-success",
	connecting: "text-warning",
	disconnected: "text-error",
};

const statusDot: Record<DisplayStatus, { dot: string; bar: string }> = {
	connected: { dot: "bg-success", bar: "bg-success/60" },
	connecting: { dot: "bg-warning", bar: "bg-warning/60" },
	disconnected: { dot: "bg-error", bar: "bg-error/60" },
};

/**
 * Gateway connection strip: the copyable base URL and the live socket status,
 * laid out as a single divider line rather than a card so it reads as page
 * metadata. Subscribes to the realtime channel, no polling.
 */
export function ConnectionCard({ dict }: { dict: Dictionary }) {
	const [status, setStatus] = useState<DisplayStatus>("connecting");
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const socket = new GatewaySocket();
		socket.onStatus = (next) => setStatus(toDisplayStatus(next));
		socket.connect();

		return () => socket.close();
	}, []);

	async function copy() {
		try {
			await navigator.clipboard.writeText(apiUrl);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			setCopied(false);
		}
	}

	const statusLabel = {
		connected: dict.monitoring.hero.connectionConnected,
		connecting: dict.monitoring.hero.connectionConnecting,
		disconnected: dict.monitoring.hero.connectionDisconnected,
	}[status];
	const tone = statusTone[status];
	const dot = statusDot[status];

	return (
		<div
			className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
			title={dict.monitoring.hero.connectionHint}
		>
			<div className="flex min-w-0 items-center gap-3">
				<span className="shrink-0 text-sm font-medium text-text-faint">{dict.monitoring.hero.baseUrl}</span>
				<span
					aria-hidden
					className="h-4 w-px shrink-0 bg-border-strong"
				/>
				<code className="truncate font-mono text-sm text-text">{apiUrl}</code>
				<button
					type="button"
					onClick={copy}
					title={copied ? dict.common.copied : dict.common.copy}
					aria-label={`${copied ? dict.common.copied : dict.common.copy}: ${apiUrl}`}
					className={cn("inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors", copied ? "text-success" : "text-text-muted hover:text-text")}
				>
					{copied ? (
						<Check
							aria-hidden
							size={13}
						/>
					) : (
						<Copy
							aria-hidden
							size={13}
						/>
					)}
					<span className="whitespace-nowrap">{copied ? dict.common.copied : dict.common.copy}</span>
				</button>
			</div>

			<div className="flex items-center gap-3 sm:shrink-0">
				<span className="text-sm font-medium text-text-faint">{dict.monitoring.hero.connection}</span>
				<span
					aria-hidden
					className="h-4 w-px bg-border-strong"
				/>
				<span
					role="status"
					aria-live="polite"
					className={cn("inline-flex items-center gap-2 text-sm font-semibold", tone)}
				>
					<span
						aria-hidden
						className="relative flex h-2.5 w-2.5 shrink-0"
					>
						<span className={cn("absolute inset-0 rounded-full opacity-50", dot.bar, status === "connecting" && "animate-ping")} />
						<span className={cn("absolute -inset-1 rounded-full border", status === "connected" ? "animate-halo border-success" : "border-transparent")} />
						<span className={cn("relative h-2.5 w-2.5 rounded-full", dot.dot)} />
					</span>
					{statusLabel}
				</span>
			</div>
		</div>
	);
}
