"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatedNumber } from "@/components/monitoring/animated-number";
import { GlowRule, PanelDecoration } from "@/components/ui/decoration";

/** Lifetime totals refresh once a minute, matching the backend rollup cadence. */
const REFRESH_MS = 60_000;

/**
 * Lifetime counters. They arrive from the server, then drift upward locally so
 * the page feels live without hammering the API: each refresh adds a fraction
 * of the observed per-minute volume.
 */
export function LifetimeStats({ initialRequests, initialTokens, requestsLabel, tokensLabel, tokensIcon, requestsIcon, perMinuteRequests, perMinuteTokens }: { initialRequests: number; initialTokens: number; requestsLabel: string; tokensLabel: string; tokensIcon: React.ReactNode; requestsIcon: React.ReactNode; perMinuteRequests: number; perMinuteTokens: number }) {
	const [requests, setRequests] = useState(initialRequests);
	const [tokens, setTokens] = useState(initialTokens);

	useEffect(() => {
		const id = window.setInterval(() => {
			setRequests((value) => value + perMinuteRequests);
			setTokens((value) => value + perMinuteTokens);
		}, REFRESH_MS);

		return () => window.clearInterval(id);
	}, [perMinuteRequests, perMinuteTokens]);

	return (
		<div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
			<div className="lg:col-span-2 surface-sweep animate-settle group relative overflow-hidden rounded-lg border border-border bg-surface px-5 py-5 transition-colors hover:border-border-strong">
				<div
					aria-hidden
					className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-2xl"
				/>
				<GlowRule className="bottom-0" />

				<div className="flex items-center gap-2 text-text-faint">
					{tokensIcon}
					<p className="text-xs font-medium uppercase tracking-wide">{tokensLabel}</p>
				</div>
				<p className="relative mt-3 text-4xl font-bold leading-none tracking-tighter text-text sm:text-5xl [font-variant-numeric:tabular-nums]">
					<AnimatedNumber
						value={tokens}
						durationMs={900}
					/>
				</p>
			</div>

			<div className="surface-lift animate-settle col-span-1 group relative overflow-hidden rounded-lg border border-border bg-surface px-5 py-5 transition-colors hover:border-border-strong" style={{ "--delay": "80ms" } as CSSProperties}>
				<PanelDecoration
					variant="dots"
					className="text-border-strong opacity-40"
					style={{ maskImage: "radial-gradient(ellipse 90% 70% at 100% 0%, black, transparent 70%)" }}
				/>
				<div className="flex items-center gap-2 text-text-faint">
					{requestsIcon}
					<p className="text-xs font-medium uppercase tracking-wide">{requestsLabel}</p>
				</div>
				<p className="relative mt-3 text-4xl font-bold leading-none tracking-tighter text-text sm:text-5xl [font-variant-numeric:tabular-nums]">
					<AnimatedNumber
						value={requests}
						durationMs={900}
					/>
				</p>
			</div>
		</div>
	);
}
