/**
 * Nutaraline brand mark — minimal: a dark tile, a single hexagonal aperture
 * stroke in brand green, and one solid core dot. No gradients, no clutter.
 */
export function BrandMark({
  size = 28,
  pulse = true,
}: {
  size?: number;
  pulse?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="64" height="64" rx="16" className="fill-bg" />
      <path
        d="M32 14 47.59 23v18L32 50 16.41 41V23L32 14Z"
        fill="none"
        strokeWidth="3.5"
        strokeLinejoin="round"
        className="stroke-accent"
      />
      <circle cx="32" cy="32" r="4" className="fill-accent">
        {pulse ? (
          <animate
            attributeName="opacity"
            values="1;0.45;1"
            dur="2.4s"
            repeatCount="indefinite"
          />
        ) : null}
      </circle>
    </svg>
  );
}
