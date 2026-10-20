// DUMMY DATA — diganti dengan API nyata pada Fase 2.
//
// i18n keys required by this data layer:
//   NOTIFICATIONS: notifications.items.{googleDegradedTitle,googleDegradedBody,
//     topupSucceededTitle,topupSucceededBody,keyRevokedTitle,keyRevokedBody,
//     lowBalanceTitle,lowBalanceBody,xaiRecoveredTitle,xaiRecoveredBody,
//     newModelTitle,newModelBody,newKeyCreatedTitle,newKeyCreatedBody,
//     invoiceTitle,invoiceBody,maintenanceTitle,maintenanceBody,
//     autoTopupTitle,autoTopupBody,loginNewDeviceTitle,loginNewDeviceBody,
//     statusPageTitle,statusPageBody}
//   BILLING: billing.topupCredit, billing.usageCharge
//   STATUS: status.healthy, status.degraded, status.down
//   CAPABILITIES: models.capabilities.{vision,tools,reasoning,long-context,json}
//   LANDING: home.metrics.{models,uptime,latency,requests}

export * from "./types";
export { models } from "./models-data";
export { providers } from "./providers-data";
export {
  getModels,
  getModelBySlug,
  getProviders,
  getProviderById,
} from "./catalog";
export {
  getUsageSummary,
  getTrendSeries,
  getRequestLogs,
  getModelBreakdown,
  getProviderBreakdown,
  getLifetimeTotals,
  getRealtimeSnapshot,
} from "./usage";
export {
  getBalanceFor,
  getTransactions,
  createInvoice,
  TOPUP_PRESETS,
} from "./transactions";
export { getNotifications, getUnreadCount } from "./notifications";
export { getTopUsers, getUserRequestLogs, getUsageForKey, getModelsWithStats } from "./users";
export {
  MIN_TOPUP_IDR,
  MAX_TOPUP_IDR,
  UNLIMITED_PLAN_PRICE_IDR,
  UNLIMITED_PLAN_DAYS,
  validateTopupAmount,
  allowedPresets,
} from "./plans";
