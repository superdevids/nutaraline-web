import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { GhostNumber, HeroGlow } from "./decoration";

export function EmptyState({ icon, title, body, action, className }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode; className?: string }) {
	return (
		<div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-14 text-center", className)}>
			{icon ? <div className="text-text-faint">{icon}</div> : null}
			<div>
				<p className="text-base font-semibold text-text">{title}</p>
				{body ? <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">{body}</p> : null}
			</div>
			{action}
		</div>
	);
}

export function PageHeader({ title, subtitle, action, marker, glow = true }: { title: string; subtitle?: string; action?: ReactNode; marker?: string; glow?: boolean }) {
	return (
		<div className="relative mb-6 flex flex-wrap items-end justify-between gap-4 pt-3">
			{glow ? (
				<HeroGlow>
					{marker ? <GhostNumber value={marker} className="right-0 -top-8 text-[8rem]" /> : null}
				</HeroGlow>
			) : null}
			<div className="min-w-0">
				<h1 className="bg-linear-to-b from-text to-text-muted bg-clip-text text-3xl font-bold tracking-tight text-transparent">{title}</h1>
				{subtitle ? <p className="mt-1.5 max-w-2xl text-sm text-text-muted">{subtitle}</p> : null}
			</div>
			{action}
		</div>
	);
}
