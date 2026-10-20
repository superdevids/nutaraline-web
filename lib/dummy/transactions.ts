// DUMMY DATA — diganti dengan API nyata pada Fase 2.

import { isZeroBalanceKey, maskApiKey } from "@/lib/api-key";
import type { BalanceSnapshot, Invoice, Transaction } from "./types";

const ANCHOR = Date.UTC(2026, 9, 20, 0, 0, 0);
const DAY_MS = 86_400_000;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Keys ending in "0000" resolve to a zero balance. This exists so the empty
 * state can be demonstrated without special-casing components.
 */
export async function getBalanceFor(apiKey: string): Promise<BalanceSnapshot> {
  const masked = maskApiKey(apiKey);
  const zero = isZeroBalanceKey(apiKey);

  const base = zero ? 0 : 1_482_500;
  const spent = zero ? 0 : 213_400;

  return {
    apiKeyMasked: masked,
    balance: base,
    currency: "IDR",
    spentThisMonth: spent,
    topupThisMonth: zero ? 0 : 500_000,
    // Roughly 60 tokens per rupiah at the blended rate.
    tokensThisMonth: zero ? 0 : spent * 60,
    // 1.0 per day is a deliberate round number: it reads as an estimate, not a promise.
    estimatedDaysLeft: zero ? 0 : Math.floor(base / 9_800),
  };
}
export async function getTransactions(count = 18): Promise<Transaction[]> {
  const rand = mulberry32(count * 6151);
  const rows: Transaction[] = [];
  let balance = 1_482_500;

  for (let i = 0; i < count; i++) {
    const isTopup = rand() > 0.55;
    const amount = isTopup
      ? [50_000, 100_000, 250_000, 500_000][Math.floor(rand() * 4)]
      : Math.round(2_000 + rand() * 38_000);

    balance = isTopup ? balance + amount : Math.max(0, balance - amount);

    rows.push({
      id: `trx_${(i + 1).toString().padStart(5, "0")}`,
      createdAt: new Date(ANCHOR - i * (DAY_MS / 2) - rand() * DAY_MS).toISOString(),
      type: isTopup ? "topup" : "usage",
      amount,
      currency: "IDR",
      status: rand() > 0.94 ? "failed" : i === 0 ? "pending" : "completed",
      method: isTopup ? (rand() > 0.5 ? "virtual-account" : "qris") : undefined,
      balanceAfter: balance,
      descriptionKey: isTopup ? "billing.topupCredit" : "billing.usageCharge",
    });
  }

  return rows;
}
export async function createInvoice(amount: number): Promise<Invoice> {
  const now = ANCHOR;
  return {
    id: `inv_${amount.toString(36)}`,
    amount,
    currency: "IDR",
    status: "pending",
    virtualAccount: `8808 ${String(amount).padStart(8, "0").slice(0, 4)} ${String(amount).padStart(8, "0").slice(4, 8)}`,
    expiresAt: new Date(now + 3_600_000 * 24).toISOString(),
    createdAt: new Date(now).toISOString(),
  };
}

export const TOPUP_PRESETS = [
  5_000, 10_000, 20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000,
];
