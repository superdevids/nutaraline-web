import Link from "next/link";
import { Activity } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

export function Footer({ dict }: { dict: Dictionary }) {
  const columns = [
    {
      title: dict.footer.product,
      links: [
        { href: "/monitoring", label: dict.nav.monitoring },
        { href: "/models", label: dict.nav.models },
        { href: "/topup", label: dict.nav.topup },
        { href: "/balance", label: dict.nav.balance },
      ],
    },
    {
      title: dict.footer.resources,
      links: [
        { href: "/docs", label: dict.nav.docs },
        { href: "/notification", label: dict.nav.notification },
        { href: "/tos", label: dict.nav.tos },
        { href: "/privacy", label: dict.nav.privacy },
      ],
    },
  ];

  return (
    <footer className="relative mt-auto border-t border-border bg-bg-deep">
      {/* Accent hairline that fades out at both ends: links the footer to the
          page without drawing another full border. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-accent/50 to-transparent"
      />
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-32 opacity-30" aria-hidden />
      <div className="relative mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(2,1fr)]">
        <div>
          <Link
            href="/monitoring"
            className="inline-flex items-center gap-2 text-base font-bold tracking-tight text-text"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full bg-accent"
            />
            {dict.common.appName}
          </Link>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
            {dict.common.tagline}
          </p>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-faint">
              {column.title}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted transition-colors hover:text-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-5 text-xs text-text-faint sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>{dict.footer.copyright}</p>
          <p className="flex items-center gap-1.5">
            <Activity aria-hidden size={11} className="text-accent" />
            {dict.footer.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
