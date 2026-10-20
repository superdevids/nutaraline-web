import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Grid pitch kept in sync with `.dot-grid` in globals.css. */
const GRID = 16;

/**
 * One tile of the structural grid: two 1px rules crossing at the tile corner.
 * Repeating it draws interlocking boxes — cheaper than an SVG pattern, and it
 * inherits `currentColor` so callers tint the whole motif at once.
 */
const GRID_TILE: CSSProperties = {
	backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
	backgroundSize: `${GRID * 2}px ${GRID * 2}px`,
};

const HATCH: CSSProperties = {
	backgroundImage: "repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 7px)",
};

const DOTS: CSSProperties = {
	backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
	backgroundSize: "12px 12px",
};

/**
 * Ambient geometry behind a panel's content. Purely decorative: hidden from
 * assistive tech and never intercepts pointer events.
 *
 * One vocabulary, one colour source — every shape paints with `currentColor`,
 * so a caller shifts the motif with a single text-colour utility. All of them
 * stay under ~15% alpha so the data always wins. Pick at most one per surface.
 */
export function PanelDecoration({ variant = "arcs", className, style }: { variant?: "arcs" | "dots" | "grid" | "hatch" | "beam" | "rings-out"; className?: string; style?: CSSProperties }) {
	const base = "pointer-events-none absolute";

	if (variant === "grid" || variant === "dots" || variant === "hatch") {
		const layer = { grid: GRID_TILE, dots: DOTS, hatch: HATCH }[variant];

		return (
			<div
				aria-hidden
				className={cn(base, "inset-0", className)}
				style={{ ...layer, ...style }}
			/>
		);
	}

	if (variant === "beam") {
		return (
			<div
				aria-hidden
				className={cn(base, "inset-0 bg-linear-to-tr from-transparent via-accent/[0.05] to-transparent", className)}
			/>
		);
	}

	// arcs: concentric rings hugging a corner. rings-out: large rings straddling
	// the panel edge, so the shape reads as a cut-out rather than an inlay.
	return (
		<svg
			aria-hidden
			viewBox="0 0 160 160"
			className={cn(base, "h-40 w-40", className)}
		>
			{variant === "rings-out" ? (
				<>
					<circle
						cx="160"
						cy="0"
						r="70"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					/>
					<circle
						cx="160"
						cy="0"
						r="104"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					/>
					<circle
						cx="160"
						cy="0"
						r="138"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					/>
				</>
			) : (
				<>
					<circle
						cx="80"
						cy="80"
						r="26"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					/>
					<circle
						cx="80"
						cy="80"
						r="46"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					/>
					<circle
						cx="80"
						cy="80"
						r="62"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					/>
					<circle
						cx="80"
						cy="80"
						r="76"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					/>
				</>
			)}
		</svg>
	);
}

/**
 * Framed corner marks — four L-brackets hugging the panel edge. Reads as a
 * technical drawing crop mark; `group-hover` brightens them if the caller set
 * `group` on the container.
 */
export function PanelCorners({ className }: { className?: string }) {
	const bracket = "absolute h-3 w-3 border-accent/40 transition-colors group-hover:border-accent/70";

	return (
		<div
			aria-hidden
			className={cn("pointer-events-none absolute inset-0", className)}
		>
			<span className={cn(bracket, "top-0 left-0 border-t border-l")} />
			<span className={cn(bracket, "top-0 right-0 border-t border-r")} />
			<span className={cn(bracket, "bottom-0 left-0 border-b border-l")} />
			<span className={cn(bracket, "bottom-0 right-0 border-b border-r")} />
		</div>
	);
}

/**
 * Oversized outlined wordmark used as page branding behind the title block.
 *
 * Position is fixed here, not passed in: every route must place it at the same
 * x/y, so the offset lives in one place. The offsets are chosen against a
 * container whose top-left is the header's content origin — callers wrap it the
 * same way (`PageHeader`, or a `relative` hero with zero top padding).
 * Hidden below `md` where it would collide with copy instead of sitting behind.
 */
export function GhostBrand({ className }: { className?: string }) {
	return (
		<span
			aria-hidden
			className={cn(
				// Stroke at 1.5px over a faint fill: the fill is what keeps the letters
				// readable against the backdrop gradient, where a bare 1px outline
				// disappeared. Both colours come from the theme.
				"pointer-events-none absolute top-0 right-8 hidden select-none font-black uppercase leading-none tracking-tighter text-transparent [-webkit-text-stroke:1.5px_var(--border-strong)] opacity-60 md:block",
				className,
			)}
			style={{ WebkitTextFillColor: "transparent", textShadow: "0 0 40px color-mix(in srgb, var(--accent) 20%, transparent)" }}
		>
			NUTARALINE
		</span>
	);
}

/** Hairline that fades at both ends. Used to close a panel without a full border. */
export function GlowRule({ className }: { className?: string }) {
	return (
		<span
			aria-hidden
			className={cn("pointer-events-none absolute inset-x-0 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent", className)}
		/>
	);
}

/**
 * Section heading for a grid or list inside a panel: a small accent rule, the
 * label, and an optional count. Keeps dense data areas readable without
 * another card.
 */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<p className={cn("flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-text-muted", className)}>
			<span
				aria-hidden
				className="h-3 w-0.5 rounded-full bg-accent"
			/>
			{children}
		</p>
	);
}

/**
 * Page header texture, shared by every route: a dotted lattice fading
 * downward, sitting behind the title block. Docs, legal, and dashboard pages
 * all use this exact element so their headers match pixel for pixel.
 */
export function HeaderTexture({ className, children }: { className?: string; children?: ReactNode }) {
	return (
		<div
			aria-hidden
			className={cn("pointer-events-none absolute inset-x-0 -top-8 -z-10 h-48 overflow-hidden", className)}
		>
			<div className="dot-grid absolute inset-0 opacity-50" />
			{children}
		</div>
	);
}

/**
 * Flat wash behind a page title block. Scoped to the content column instead of
 * the viewport so it never fights `page-backdrop`.
 */
export function HeroGlow({ className, children }: { className?: string; children?: ReactNode }) {
	return (
		<div
			aria-hidden
			className={cn("pointer-events-none absolute inset-x-0 -top-16 -z-10 h-64 overflow-hidden", className)}
		>
			<div className="dot-grid absolute inset-0 opacity-60" />
			<div className="absolute -top-24 left-1/4 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-3xl" />
			<div
				className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-accent/25 to-transparent"
				style={{ maskImage: "linear-gradient(to right, transparent, black 30%, black 70%, transparent)" }}
			/>
			{children}
		</div>
	);
}
