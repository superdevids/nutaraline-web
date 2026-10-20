import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/components/layout/bottom-nav";
import type { NavItem } from "@/lib/navigation";

const pathname = vi.hoisted(() => ({ value: "/monitoring" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.value,
}));

const items: NavItem[] = [
  { href: "/monitoring", label: "Pemantauan", icon: "monitoring" },
  { href: "/models", label: "Model", icon: "models" },
  { href: "/topup", label: "Isi Saldo", icon: "topup" },
  { href: "/balance", label: "Saldo", icon: "balance" },
  { href: "/docs", label: "Dokumentasi", icon: "docs" },
];

describe("BottomNav", () => {
  it("renders every destination", () => {
    render(<BottomNav items={items} label="Navigasi utama" />);
    for (const item of items) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it("is a labelled navigation landmark", () => {
    render(<BottomNav items={items} label="Navigasi utama" />);
    expect(
      screen.getByRole("navigation", { name: "Navigasi utama" }),
    ).toBeInTheDocument();
  });

  it("marks the current route", () => {
    render(<BottomNav items={items} label="Navigasi utama" />);
    expect(screen.getByText("Pemantauan").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not mark other routes", () => {
    render(<BottomNav items={items} label="Navigasi utama" />);
    expect(screen.getByText("Model").closest("a")).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("treats nested routes as active", () => {
    pathname.value = "/docs/quickstart";
    render(<BottomNav items={items} label="Navigasi utama" />);
    expect(screen.getByText("Dokumentasi").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
    pathname.value = "/monitoring";
  });

  it("renders one icon per destination", () => {
    const { container } = render(
      <BottomNav items={items} label="Navigasi utama" />,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(items.length);
  });
});
