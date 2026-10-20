import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/layout/site-header";
import type { NavItem } from "@/lib/navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/models",
  useRouter: () => ({ refresh: () => {} }),
}));

const items: NavItem[] = [
  { href: "/monitoring", label: "Pemantauan", icon: "monitoring" },
  { href: "/models", label: "Model", icon: "models" },
  { href: "/topup", label: "Isi Saldo", icon: "topup" },
  { href: "/balance", label: "Saldo", icon: "balance" },
  { href: "/docs", label: "Dokumentasi", icon: "docs" },
];

const labels = {
  mainNavigation: "Navigasi utama",
  switchLanguage: "Ganti bahasa",
  brand: "Nutaraline",
  notifications: "Notifikasi",
};

function renderHeader() {
  return render(<SiteHeader items={items} locale="id" labels={labels} />);
}

describe("SiteHeader", () => {
  it("renders the brand name", () => {
    renderHeader();
    expect(screen.getByText("Nutaraline")).toBeInTheDocument();
  });

  it("renders every navigation item", () => {
    renderHeader();
    for (const item of items) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it("marks the active route with aria-current", () => {
    renderHeader();
    expect(screen.getByText("Model").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not mark inactive routes", () => {
    renderHeader();
    expect(screen.getByText("Saldo").closest("a")).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("exposes the notification bell with an accessible name", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: "Notifikasi" })).toBeInTheDocument();
  });

  it("renders no unread badge", () => {
    renderHeader();
    const bell = screen.getByRole("link", { name: "Notifikasi" });
    expect(bell.textContent).toBe("");
  });

  it("renders no admin link", () => {
    renderHeader();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("marks the active language only", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: "ID" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("has no hamburger button: phones use the bottom navigation", () => {
    renderHeader();
    expect(screen.queryByLabelText("Buka menu")).toBeNull();
    expect(screen.queryByLabelText("Tutup menu")).toBeNull();
  });
});
