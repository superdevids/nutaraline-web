// DUMMY DATA — diganti dengan API nyata pada Fase 2.

export type Capability =
  | "vision"
  | "tools"
  | "reasoning"
  | "thinking"
  | "long-context"
  | "json";

export type ProviderStatus = "healthy" | "degraded" | "down";

export interface ModelPricing {
  inputPer1M: number;
  outputPer1M: number;
  currency: "USD";
}

export interface Model {
  id: string;
  name: string;
  slug: string;
  providerId: string;
  description: string;
  contextWindow: number;
  maxOutput: number;
  pricing: ModelPricing;
  capabilities: Capability[];
  latencyTier: "fast" | "balanced" | "deep";
  releasedAt: string;
  status: "available" | "preview" | "deprecated";
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  status: ProviderStatus;
  uptime30d: number;
  latencyP50: number;
  latencyP95: number;
  region: string;
  modelsCount: number;
  sparkline: number[];
}

export interface UsagePoint {
  date: string;
  /** Time of day for sub-daily samples, e.g. "12:00". Absent on daily rows. */
  at?: string;
  requests: number;
  tokensIn: number;
  tokensOut: number;
  cost: number;
}

export interface UsageTotals {
  requests: number;
  tokens: number;
  cost: number;
  errorRate: number;
}

export interface UsageSummary {
  range: 7 | 30 | 90;
  totals: UsageTotals;
  delta: UsageTotals;
  series: UsagePoint[];
}

export interface RequestLog {
  id: string;
  timestamp: string;
  modelId: string;
  modelName: string;
  providerId: string;
  providerName: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  status: "success" | "error" | "timeout";
  cost: number;
}

export interface ModelBreakdown {
  modelId: string;
  modelName: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface ProviderBreakdown {
  providerId: string;
  providerName: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface Transaction {
  id: string;
  createdAt: string;
  type: "topup" | "usage";
  amount: number;
  currency: "IDR";
  status: "completed" | "pending" | "failed";
  method?: "virtual-account" | "qris";
  balanceAfter: number;
  descriptionKey: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: "IDR";
  status: "pending" | "paid" | "expired";
  virtualAccount: string;
  expiresAt: string;
  createdAt: string;
}

export interface BalanceSnapshot {
  apiKeyMasked: string;
  balance: number;
  currency: "IDR";
  spentThisMonth: number;
  topupThisMonth: number;
  /** Tokens consumed this month by requests billed to this key. */
  tokensThisMonth: number;
  estimatedDaysLeft: number;
}

export interface Notification {
  id: string;
  createdAt: string;
  category: "billing" | "system" | "security";
  severity: "info" | "success" | "warning" | "error";
  titleKey: string;
  bodyKey: string;
  read: boolean;
  href?: string;
}

export interface LandingMetric {
  labelKey: string;
  value: string;
  suffix?: string;
}

export interface LifetimeTotals {
  requests: number;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  since: string;
}

export interface RealtimeSnapshot {
  requestsPerMinute: number;
  tokensPerMinute: number;
  medianLatencyMs: number;
  p95LatencyMs: number;
  requestsLastMinute: number;
  /** 10 samples, one per minute, oldest first. Values are 0–1 (1 = fully up). */
  uptimeWindow: number[];
  uptimeTenMinutes: number;
}

export interface UserUsage {
  userId: string;
  userName: string;
  email: string;
  plan: "free" | "pro" | "unlimited";
  favoriteModel: string;
  favoriteModelId: string;
  totalTokens: number;
  totalRequests: number;
  avgLatencyMs: number;
  lastActiveAt: string;
  spendUsd: number;
}

export interface UserRequestLog {
  id: string;
  userId: string;
  userName: string;
  modelId: string;
  modelName: string;
  timestamp: string;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  status: "success" | "error" | "timeout";
}

export interface ModelStats {
  modelId: string;
  uniqueUsers: number;
  totalTokens: number;
  totalRequests: number;
}

export interface ModelWithStats extends Model {
  stats: ModelStats;
}

export type UnlimitedPlanInterval = "weekly";
