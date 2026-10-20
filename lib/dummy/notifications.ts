// DUMMY DATA — diganti dengan API nyata pada Fase 2.

import type { Notification } from "./types";

const ANCHOR = Date.UTC(2026, 9, 20, 0, 0, 0);
const MINUTE_MS = 60_000;

export const notifications: Notification[] = [
  {
    id: "ntf_001",
    createdAt: new Date(ANCHOR - 12 * MINUTE_MS).toISOString(),
    category: "system",
    severity: "warning",
    titleKey: "notifications.items.googleDegradedTitle",
    bodyKey: "notifications.items.googleDegradedBody",
    read: false,
    href: "/monitoring",
  },
  {
    id: "ntf_002",
    createdAt: new Date(ANCHOR - 55 * MINUTE_MS).toISOString(),
    category: "billing",
    severity: "success",
    titleKey: "notifications.items.topupSucceededTitle",
    bodyKey: "notifications.items.topupSucceededBody",
    read: false,
    href: "/balance",
  },
  {
    id: "ntf_003",
    createdAt: new Date(ANCHOR - 3 * 60 * MINUTE_MS).toISOString(),
    category: "security",
    severity: "error",
    titleKey: "notifications.items.keyRevokedTitle",
    bodyKey: "notifications.items.keyRevokedBody",
    read: false,
    href: "/balance",
  },
  {
    id: "ntf_004",
    createdAt: new Date(ANCHOR - 6 * 60 * MINUTE_MS).toISOString(),
    category: "billing",
    severity: "warning",
    titleKey: "notifications.items.lowBalanceTitle",
    bodyKey: "notifications.items.lowBalanceBody",
    read: false,
    href: "/topup",
  },
  {
    id: "ntf_005",
    createdAt: new Date(ANCHOR - 26 * 60 * MINUTE_MS).toISOString(),
    category: "system",
    severity: "success",
    titleKey: "notifications.items.xaiRecoveredTitle",
    bodyKey: "notifications.items.xaiRecoveredBody",
    read: true,
    href: "/monitoring",
  },
  {
    id: "ntf_006",
    createdAt: new Date(ANCHOR - 2 * 1440 * MINUTE_MS).toISOString(),
    category: "system",
    severity: "info",
    titleKey: "notifications.items.newModelTitle",
    bodyKey: "notifications.items.newModelBody",
    read: true,
    href: "/models",
  },
  {
    id: "ntf_007",
    createdAt: new Date(ANCHOR - 3 * 1440 * MINUTE_MS).toISOString(),
    category: "security",
    severity: "warning",
    titleKey: "notifications.items.newKeyCreatedTitle",
    bodyKey: "notifications.items.newKeyCreatedBody",
    read: true,
    href: "/balance",
  },
  {
    id: "ntf_008",
    createdAt: new Date(ANCHOR - 4 * 1440 * MINUTE_MS).toISOString(),
    category: "billing",
    severity: "info",
    titleKey: "notifications.items.invoiceTitle",
    bodyKey: "notifications.items.invoiceBody",
    read: true,
    href: "/balance",
  },
  {
    id: "ntf_009",
    createdAt: new Date(ANCHOR - 6 * 1440 * MINUTE_MS).toISOString(),
    category: "system",
    severity: "info",
    titleKey: "notifications.items.maintenanceTitle",
    bodyKey: "notifications.items.maintenanceBody",
    read: true,
  },
  {
    id: "ntf_010",
    createdAt: new Date(ANCHOR - 8 * 1440 * MINUTE_MS).toISOString(),
    category: "billing",
    severity: "success",
    titleKey: "notifications.items.autoTopupTitle",
    bodyKey: "notifications.items.autoTopupBody",
    read: true,
    href: "/topup",
  },
  {
    id: "ntf_011",
    createdAt: new Date(ANCHOR - 11 * 1440 * MINUTE_MS).toISOString(),
    category: "security",
    severity: "info",
    titleKey: "notifications.items.loginNewDeviceTitle",
    bodyKey: "notifications.items.loginNewDeviceBody",
    read: true,
  },
  {
    id: "ntf_012",
    createdAt: new Date(ANCHOR - 14 * 1440 * MINUTE_MS).toISOString(),
    category: "system",
    severity: "success",
    titleKey: "notifications.items.statusPageTitle",
    bodyKey: "notifications.items.statusPageBody",
    read: true,
  },
];
export async function getNotifications(): Promise<Notification[]> {
  return notifications;
}
export async function getUnreadCount(): Promise<number> {
  return notifications.filter((item) => !item.read).length;
}
