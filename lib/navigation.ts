export interface NavItem {
  href: string;
  label: string;
  /** Icon key resolved by the consumer, kept as a string for serialisability. */
  icon: "monitoring" | "models" | "topup" | "balance" | "docs";
  matchPrefix?: string;
}

export const mainNav = (dict: {
  nav: { monitoring: string; models: string; topup: string; balance: string; docs: string };
}): NavItem[] => [
  { href: "/monitoring", label: dict.nav.monitoring, icon: "monitoring" },
  { href: "/models", label: dict.nav.models, icon: "models" },
  { href: "/topup", label: dict.nav.topup, icon: "topup" },
  { href: "/balance", label: dict.nav.balance, icon: "balance" },
  { href: "/docs", label: dict.nav.docs, icon: "docs" },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
