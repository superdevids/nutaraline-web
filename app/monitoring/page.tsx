import { Suspense } from "react";
import { Activity, Coins, ServerCog } from "lucide-react";
import { PanelDecoration } from "@/components/ui/decoration";
import { PageLoading } from "@/components/ui/page-loading";
import { PageHeader } from "@/components/ui/empty-state";
import { LifetimeStats } from "@/components/monitoring/lifetime-stats";
import { LiveMetricsRow } from "@/components/monitoring/live-metrics-row";
import { ConnectionCard } from "@/components/monitoring/connection-card";
import { initialLiveMetrics } from "@/lib/live-metrics";
import { RequestTable } from "@/components/monitoring/request-table";
import { Leaderboard } from "@/components/monitoring/leaderboard";
import { ModelUsageChart } from "@/components/monitoring/model-usage-chart";
import { UsageAreaChart } from "@/components/charts/usage-chart";
import { getLifetimeTotals, getModelBreakdown, getRealtimeSnapshot, getRequestLogs, getTopUsers, getTrendSeries } from "@/lib/dummy";
import { getDictionary } from "@/lib/i18n/server";

function parseRange(value: string | string[] | undefined): 7 | 30 | 90 {
	const raw = Array.isArray(value) ? value[0] : value;
	const parsed = Number(raw);
	return parsed === 7 || parsed === 90 ? parsed : 30;
}

async function MonitoringContent({ range }: { range: 7 | 30 | 90 }) {
	const { dict } = await getDictionary();

	const [lifetime, realtime, logs, byModel, topUsers, trend] = await Promise.all([getLifetimeTotals(), getRealtimeSnapshot(), getRequestLogs(15), getModelBreakdown(range), getTopUsers(), getTrendSeries()]);

	const lifetimeTokens = lifetime.tokensIn + lifetime.tokensOut;

	return (
		<>
			<ConnectionCard dict={dict} />
			<div className="mt-4">
				<LifetimeStats
					initialRequests={lifetime.requests}
					initialTokens={lifetimeTokens}
					requestsLabel={dict.monitoring.hero.lifetimeRequests}
					tokensLabel={dict.monitoring.hero.lifetimeTokens}
					tokensIcon={
						<Coins
							aria-hidden
							size={14}
						/>
					}
					requestsIcon={
						<ServerCog
							aria-hidden
							size={14}
						/>
					}
					perMinuteRequests={realtime.requestsPerMinute}
					perMinuteTokens={realtime.tokensPerMinute}
				/>
			</div>
			<div className="mt-4">
				<LiveMetricsRow
					initial={initialLiveMetrics(Date.UTC(2026, 9, 20, 0, 0, 0))}
					dict={dict}
				/>
			</div>

			<div className="surface-sweep mt-4 rounded-lg border border-border bg-surface">
				<div className="relative border-b border-border px-5 py-4">
					<PanelDecoration
						variant="hatch"
						className="text-accent/12"
						style={{ maskImage: "linear-gradient(to right, transparent 40%, black)" }}
					/>
					<h2 className="relative text-base font-semibold text-text">{dict.monitoring.chartTitle}</h2>
					<p className="relative mt-0.5 text-sm text-text-muted">{dict.monitoring.chartSubtitle}</p>
				</div>
				<div className="overflow-x-auto px-5 py-4">
					<UsageAreaChart
						data={trend}
						metric="requests"
						label={dict.monitoring.metricRequests}
						valueFormat="number"
					/>
				</div>
			</div>
			<div className="mt-4">
				<ModelUsageChart
					rows={byModel}
					dict={dict}
				/>
			</div>
			<div className="mt-4">
				<RequestTable
					logs={logs}
					dict={dict}
				/>
			</div>
			<div className="mt-4">
				<Leaderboard
					users={topUsers}
					dict={dict}
				/>
			</div>
		</>
	);
}

function Skeleton() {
	return <PageLoading variant="monitoring" />;
}


async function MonitoringRoute({ searchParams }: { searchParams: PageProps<"/monitoring">["searchParams"] }) {
	const query = await searchParams;
	const range = parseRange(query.range);
	const { dict } = await getDictionary();

	return (
		<>
			<div className="mb-8">
				<div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
					<Activity
						aria-hidden
						size={13}
					/>
					{dict.monitoring.title}
				</div>
				<PageHeader
					title={dict.monitoring.hero.title}
					subtitle={dict.monitoring.hero.subtitle}
				/>
			</div>
			<MonitoringContent range={range} />
		</>
	);
}

export default function MonitoringPage({ searchParams }: PageProps<"/monitoring">) {
	return (
		<div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6">
			<Suspense fallback={<Skeleton />}>
				<MonitoringRoute searchParams={searchParams} />
			</Suspense>
		</div>
	);
}
