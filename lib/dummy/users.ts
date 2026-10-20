// DUMMY DATA — diganti dengan API nyata pada Fase 2.

import { models } from "./models-data";
import { keyFingerprint } from "@/lib/api-key";
import type {
  ModelStats,
  ModelWithStats,
  UserRequestLog,
  UserUsage,
} from "./types";

const ANCHOR = Date.UTC(2026, 9, 20, 0, 0, 0);

const FIRST_NAMES = [
  "Rani", "Bagus", "Siti", "Dimas", "Ayu", "Fajar", "Maya", "Rizky",
  "Nadia", "Yoga", "Putri", "Arif", "Intan", "Hendra", "Dewi", "Bayu",
  "Sari", "Reza", "Lia", "Taufik", "Wulan", "Andi", "Melati", "Galih",
  "Citra", "Damar", "Ratna", "Iqbal", "Nina", "Oscar", "Prita", "Rendra",
  "Sinta", "Umar", "Vina", "Wahyu", "Yuni", "Zaki", "Adit", "Bella",
  "Cahya", "Doni", "Eka", "Farah", "Gita", "Hasan",
];

const LAST_NAMES = [
  "Puspita", "Hartono", "Nurhaliza", "Prasetyo", "Lestari", "Ramadhan",
  "Kartika", "Aditya", "Santoso", "Wijaya", "Maharani", "Saputra",
  "Permata", "Kusuma", "Anggraini", "Pratama", "Wulandari", "Firmansyah",
];

const DOMAINS = [
  "korpora.id", "nusatech.dev", "datawangi.co.id", "lakonstudio.com",
  "bumipay.id", "kiriminaja.com", "sinarpage.id", "portable.id",
];

const PLANS: UserUsage["plan"][] = ["free", "pro", "unlimited"];

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

function buildUsers(count: number): UserUsage[] {
  const rand = mulberry32(20261020);
  const users: UserUsage[] = [];

  for (let index = 0; index < count; index++) {
    const first = FIRST_NAMES[index % FIRST_NAMES.length];
    const last = LAST_NAMES[(index * 3 + 1) % LAST_NAMES.length];
    const model = models[Math.floor(rand() * models.length)];
    const plan = PLANS[index % PLANS.length];

    // Descending token totals so the default order reads as a leaderboard.
    const decay = Math.pow(0.93, index);
    const tokens = Math.round((18_400_000 + rand() * 2_000_000) * decay);
    const requests = Math.round(tokens / (420 + rand() * 900));

    users.push({
      userId: `usr_${(index + 1).toString().padStart(3, "0")}`,
      userName: `${first} ${last}`,
      email: `${first.toLowerCase()}${index + 1}@${DOMAINS[index % DOMAINS.length]}`,
      plan,
      favoriteModel: model.name,
      favoriteModelId: model.id,
      totalTokens: tokens,
      totalRequests: requests,
      avgLatencyMs: Math.round(220 + rand() * 520),
      lastActiveAt: new Date(ANCHOR - index * 7 * 60_000).toISOString(),
      spendUsd: Number((tokens / 1_000_000 * 0.42).toFixed(2)),
    });
  }

  return users;
}

const users = buildUsers(FIRST_NAMES.length);

const STATUS_CYCLE: UserRequestLog["status"][] = [
  "success", "success", "success", "success", "success",
  "success", "success", "error", "success", "timeout",
];
export async function getTopUsers(count = users.length): Promise<UserUsage[]> {
  return users.slice(0, count);
}
export async function getUserRequestLogs(count = 12): Promise<UserRequestLog[]> {
  return Array.from({ length: count }, (_, index) => {
    const user = users[index % users.length];
    const model =
      models.find((entry) => entry.id === user.favoriteModelId) ?? models[0];

    return {
      id: `ulog_${(index + 1).toString().padStart(5, "0")}`,
      userId: user.userId,
      userName: user.userName,
      modelId: model.id,
      modelName: model.name,
      timestamp: new Date(ANCHOR - index * 94_000).toISOString(),
      latencyMs: Math.round(
        180 + ((index * 137) % 900) + (model.latencyTier === "deep" ? 1400 : 0),
      ),
      tokensIn: 420 + ((index * 311) % 3_600),
      tokensOut: 140 + ((index * 97) % 1_100),
      status: STATUS_CYCLE[index % STATUS_CYCLE.length],
    };
  });
}

/**
 * Usage rows that belong to one API key. The key is the only owner dimension
 * available in this dataset, so its fingerprint seeds a dedicated deterministic
 * stream — two different keys never see the same history.
 */
export async function getUsageForKey(
  apiKey: string,
  count = 8,
): Promise<UserRequestLog[]> {
  const fingerprint = keyFingerprint(apiKey);
  const seed = Number.parseInt(fingerprint, 16) || 1;
  const rand = mulberry32(seed);

  return Array.from({ length: count }, (_, index) => {
    const model = models[Math.floor(rand() * models.length)];
    const tokensIn = 320 + Math.round(rand() * 3_400);
    const tokensOut = 120 + Math.round(rand() * 1_050);
    const roll = rand();
    const status: UserRequestLog["status"] =
      roll > 0.96 ? "error" : roll > 0.93 ? "timeout" : "success";

    return {
      id: `keylog_${fingerprint}_${(index + 1).toString().padStart(4, "0")}`,
      userId: fingerprint,
      userName: "",
      modelId: model.id,
      modelName: model.name,
      timestamp: new Date(ANCHOR - index * 137_000).toISOString(),
      latencyMs: Math.round(
        170 + rand() * (model.latencyTier === "deep" ? 1_800 : 700),
      ),
      tokensIn,
      tokensOut,
      status,
    };
  });
}

/**
 * Per-model aggregates. Derived deterministically from the user ledger so the
 * models table and the leaderboard never contradict each other.
 */
export async function getModelsWithStats(): Promise<ModelWithStats[]> {
  return models.map((model, index) => {
    const owners = users.filter((user) => user.favoriteModelId === model.id);

    const base = 420_000 + ((index + 3) * 137_000) % 3_900_000;
    const stats: ModelStats = {
      modelId: model.id,
      uniqueUsers: Math.max(owners.length, 1) * (index % 3 === 0 ? 4 : 2),
      totalTokens: base * (1 + (index % 4)),
      totalRequests: Math.round(base / (28 + (index % 7) * 6)),
    };

    return { ...model, stats };
  });
}
