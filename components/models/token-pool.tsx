"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Card } from "@/components/ui/card";
import { PanelDecoration } from "@/components/ui/decoration";
import { CopyModelIdButton } from "./model-identity";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n";

export interface PoolModel {
	name: string;
	slug: string;
	/** Remaining share of the pool, 0–100. */
	remainingPercent: number;
	resetInHours: number;
}

const POOL_MODELS: PoolModel[] = [
	{ name: "Deepseek V4.1 Flash", slug: "deepseek-v4-1-flash", remainingPercent: 82, resetInHours: 14 },
	{ name: "Deepseek V4 Flash", slug: "deepseek-v4-flash", remainingPercent: 61, resetInHours: 14 },
	{ name: "GLM 5.3 Flash", slug: "glm-5-3-flash", remainingPercent: 34, resetInHours: 9 },
	{ name: "GPT Family (Astra, Sol, Luna)", slug: "gpt-family-6", remainingPercent: 8, resetInHours: 3 },
];

export function poolTone(percent: number): {
	bar: string;
	text: string;
	label: "healthy" | "moderate" | "low" | "critical";
} {
	if (percent > 60) {
		return { bar: "bg-success", text: "text-success", label: "healthy" };
	}
	if (percent > 30) {
		return { bar: "bg-warning", text: "text-warning", label: "moderate" };
	}
	if (percent > 10) {
		return { bar: "bg-[#f08a24]", text: "text-[#f08a24]", label: "low" };
	}
	return { bar: "bg-error", text: "text-error", label: "critical" };
}

export function nextPoolPercent(current: number, tickMs: number, windowMs: number): number {
	const spent = (tickMs / windowMs) * 100;
	return Number(Math.max(0, current - spent).toFixed(2));
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function TokenPool({ dict }: { dict: Dictionary }) {
	const [pools, setPools] = useState<PoolModel[]>(POOL_MODELS);

	useEffect(() => {
		const id = window.setInterval(() => {
			setPools((previous) =>
				previous.map((pool) => ({
					...pool,
					remainingPercent: nextPoolPercent(pool.remainingPercent, 60_000, DAY_MS),
				})),
			);
		}, 60_000);

		return () => window.clearInterval(id);
	}, []);

	return (
		<Card
			corners
			tone="accent"
			className="mt-6"
		>
			<div className="relative border-b border-border px-5 py-4">
				<PanelDecoration
					variant="beam"
					className="-z-0"
				/>
				<h2 className="relative text-base font-semibold text-text">{dict.models.pool.title}</h2>
				<p className="relative mt-0.5 text-sm text-text-muted">{dict.models.pool.subtitle}</p>
			</div>

			<ul className="grid gap-px bg-border sm:grid-cols-2">
				{pools.map((pool, index) => {
					const tone = poolTone(pool.remainingPercent);

					return (
						<li
							key={pool.slug}
							style={{ "--delay": `${index * 60}ms` } as CSSProperties}
							className="animate-settle bg-surface px-5 py-5"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="flex min-w-0 flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2">
									<p className="min-w-0 break-words text-sm font-semibold text-text">{pool.name}</p>
									<CopyModelIdButton
										slug={pool.slug}
										copyLabel={dict.common.copyModelId}
										copiedLabel={dict.common.copiedModelId}
									/>
								</div>
								<span className={cn("tabular shrink-0 text-xl font-bold leading-none", tone.text)}>{formatPercent(pool.remainingPercent, 0)}</span>
							</div>

							<div
								role="progressbar"
								aria-valuenow={Math.round(pool.remainingPercent)}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label={`${pool.name}: ${dict.models.pool.remaining}`}
								className="mt-3 h-4 w-full overflow-hidden rounded-full bg-bg"
							>
								<span
									className={cn("animate-bar block h-full rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] transition-[width] duration-700", tone.bar)}
									style={{ width: `${pool.remainingPercent}%` }}
								/>
							</div>

							<p className="mt-2 text-xs text-text-muted">
								{dict.models.pool.resetIn} {pool.resetInHours} {dict.models.pool.hours}
							</p>
						</li>
					);
				})}
			</ul>
		</Card>
	);
}
