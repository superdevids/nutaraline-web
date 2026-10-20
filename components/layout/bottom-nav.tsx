"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Boxes,
  Wallet,
  type LucideIcon,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { isActivePath, type NavItem } from "@/lib/navigation";

const icons: Record<NavItem["icon"], LucideIcon> = {
  monitoring: Activity,
  models: Boxes,
  topup: CreditCard,
  balance: Wallet,
  docs: BookOpen,
};

/**
 * Bottom navigation for phones and tablets. Fixed to the viewport, with a safe
 * area inset so it clears the home indicator on iOS. The page reserves space
 * for it via `--bottom-nav-height`.
 */
export function BottomNav({
  items,
  label,
}: {
  items: NavItem[];
  label: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-deep/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-t from-accent/[0.05] to-transparent"
      />
      <ul className="relative mx-auto flex w-full max-w-[640px] items-stretch">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = icons[item.icon];

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors",
                  active ? "text-accent" : "text-text-muted",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-linear-to-r from-transparent via-accent to-transparent"
                  />
                ) : null}
                <Icon aria-hidden size={18} strokeWidth={active ? 2.4 : 2} />
                <span className="max-w-full truncate leading-none">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
