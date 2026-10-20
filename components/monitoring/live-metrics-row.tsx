"use client";

import { useEffect, useState } from "react";
import { LiveCard } from "@/components/monitoring/stat-card";
import { UptimeStrip } from "@/components/monitoring/uptime-strip";
import { AnimatedNumber } from "@/components/monitoring/animated-number";
import { TICK_MS, nextLiveMetrics, readClock, type LiveMetrics } from "@/lib/live-metrics";
import { formatPercent } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n";

/**
 * Realtime row. Starts from a server-provided snapshot so the first paint
 * matches the server, then ticks every three seconds and resets each minute.
 */
export function LiveMetricsRow({ initial, dict }: { initial: LiveMetrics; dict: Dictionary }) {
	const [metrics, setMetrics] = useState<LiveMetrics>(initial);

	useEffect(() => {
		const id = window.setInterval(() => {
			setMetrics((previous) => nextLiveMetrics(previous, readClock()));
		}, TICK_MS);

		return () => window.clearInterval(id);
	}, []);

	const uptimeTone = metrics.uptimePercent >= 99.9 ? "success" : metrics.uptimePercent >= 99 ? "warning" : "error";

	// The strip is illustrative for the current minute: eight segments, one per
	// tick elapsed, so it fills visibly as the minute progresses.
	const filled = Math.max(1, Math.ceil((metrics.requests / 2_200) * 8));
	const window8 = Array.from({ length: 8 }, (_, index) => (index < filled ? 1 : 0.4));

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<LiveCard
				label={dict.monitoring.hero.requestsPerMinute}
				value={<AnimatedNumber value={metrics.requests} />}
				hint={dict.monitoring.hero.lastMinute}
			/>
			<LiveCard
				label={dict.monitoring.hero.tokensPerMinute}
				value={<AnimatedNumber value={metrics.tokens} />}
				hint={dict.monitoring.hero.lastMinute}
			/>
			<LiveCard
				label={dict.monitoring.hero.medianLatency}
				value={<AnimatedNumber value={metrics.medianLatencyMs} />}
				hint={dict.monitoring.hero.millisecondsHint}
			/>
			<div className="rounded-lg border border-border bg-surface px-4 py-4 transition-colors hover:border-border-strong">
				<p className="text-xs font-medium uppercase tracking-wide text-text-faint">{dict.monitoring.hero.uptime10m}</p>
				<div className="mt-2">
					<p className="tabular text-xl font-bold leading-none text-text">{formatPercent(metrics.uptimePercent, 2)}</p>
				</div>
				<div className="mt-2">
					<UptimeStrip
						window={window8}
						tone={uptimeTone}
					/>
				</div>
			</div>
		</div>
	);
}
