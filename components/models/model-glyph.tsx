import { cn } from "@/lib/cn";

/**
 * Deterministic avatar for a model: initials plus a provider-derived hue.
 * Deliberately typographic rather than a logo set, so no third-party marks are
 * reproduced and every model renders without an asset request.
 */
const providerHue: Record<string, number> = {
  prv_openai: 160,
  prv_anthropic: 30,
  prv_google: 210,
  prv_meta: 260,
  prv_mistral: 20,
  prv_deepseek: 190,
  prv_alibaba: 340,
  prv_xai: 285,
};

function initials(name: string): string {
  const words = name.split(/[\s.-]+/).filter(Boolean);

  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function ModelGlyph({
  providerId,
  name,
  size = 32,
  className,
}: {
  providerId: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const hue = providerHue[providerId] ?? 150;

  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.36)),
        backgroundColor: `hsl(${hue} 42% 16%)`,
        borderColor: `hsl(${hue} 45% 32%)`,
        color: `hsl(${hue} 70% 72%)`,
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border font-bold tracking-tight",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
