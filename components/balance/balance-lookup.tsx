"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronLeft,
  ChevronRight,
  Coins,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PanelDecoration } from "@/components/ui/decoration";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { LogStatusIcon } from "@/components/ui/status-badge";
import { cn } from "@/lib/cn";
import { validateApiKey } from "@/lib/api-key";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatTime,
} from "@/lib/format";
import { getBalanceFor, getTransactions, getUsageForKey } from "@/lib/dummy";
import type {
  BalanceSnapshot,
  Transaction,
  UserRequestLog,
} from "@/lib/dummy/types";
import type { Dictionary, Locale } from "@/lib/i18n";

type HistoryTab = "usage" | "topups";

/** Maximum rows rendered per history page. */
const PAGE_SIZE = 10;

interface BonusModel {
  name: string;
  tokens: number;
}

/** Free daily quota per featured model. Reset at 00:00 UTC. */
const MODEL_BONUS: BonusModel[] = [
  { name: "Deepseek V4.1 Flash", tokens: 20_000_000 },
  { name: "GLM 5.3 Flash", tokens: 20_000_000 },
  { name: "GPT 6 Astra", tokens: 5_000_000 },
  { name: "GPT 6.1 Family (Sol dan Luna)", tokens: 10_000_000 },
];

/** Combined daily bonus shared by every model below. */
const BUNDLE_TOKENS = 50_000_000;
const BUNDLE_MODELS = [
  "Muse Spark 1.3",
  "Mimo 2.6 Flash",
  "Deepseek V4 Flash",
  "Laguna 2.1",
] as const;

/** Compact "20M" rendering for bonus token amounts. */
function formatMillion(tokens: number): string {
  return `${tokens / 1_000_000}M`;
}

function TablePager({
  page,
  pageCount,
  total,
  ariaLabel,
  dict,
  onChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  ariaLabel: string;
  dict: Dictionary;
  onChange: (page: number) => void;
}) {
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);

  return (
    // Mirrors the leaderboard pager on /monitoring: row range on the left,
    // bordered chevrons around the current page indicator on the right.
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-xs text-text-muted">
      <span className="tabular">
        {formatNumber(start + 1)}–{formatNumber(end)} {dict.common.of}{" "}
        {formatNumber(total)}
      </span>
      <div className="flex items-center gap-1" role="group" aria-label={ariaLabel}>
        {page > 1 ? (
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            aria-label={dict.common.previous}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:text-text"
          >
            <ChevronLeft aria-hidden size={14} />
          </button>
        ) : null}
        <span className="tabular px-2">
          {page} / {pageCount}
        </span>
        {page < pageCount ? (
          <button
            type="button"
            onClick={() => onChange(page + 1)}
            aria-label={dict.common.next}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:text-text"
          >
            <ChevronRight aria-hidden size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

const STAT_TONES = {
  primary: { chip: "bg-primary/10 text-primary", strip: "bg-primary/60" },
  success: { chip: "bg-success/10 text-success", strip: "bg-success/60" },
  warning: { chip: "bg-warning/10 text-warning", strip: "bg-warning/60" },
  accent: { chip: "bg-accent/10 text-accent", strip: "bg-accent/60" },
} as const;

type StatTone = keyof typeof STAT_TONES;

function BalanceStatCard({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Wallet;
  tone: StatTone;
  label: string;
  value: string;
}) {
  const { chip, strip } = STAT_TONES[tone];

  return (
    <Card className="relative overflow-hidden px-5 py-4">
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-0.5", strip)} />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
          {label}
        </p>
        <span
          aria-hidden
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            chip,
          )}
        >
          <Icon size={15} />
        </span>
      </div>
      <p className="tabular mt-2 text-2xl font-bold leading-none text-text">
        {value}
      </p>
    </Card>
  );
}

export function BalanceLookup({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [snapshot, setSnapshot] = useState<BalanceSnapshot | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [usage, setUsage] = useState<UserRequestLog[]>([]);
  const [tab, setTab] = useState<HistoryTab>("usage");
  const [usagePage, setUsagePage] = useState(1);
  const [topupPage, setTopupPage] = useState(1);
  const [bundleOpen, setBundleOpen] = useState(false);

  useEffect(() => {
    if (!bundleOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setBundleOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bundleOpen]);

  async function lookup() {
    const validation = validateApiKey(keyInput);

    if (!validation.ok) {
      setError(
        validation.reason === "empty"
          ? dict.topup.keyInvalidEmpty
          : validation.reason === "checksum"
            ? dict.topup.keyInvalidChecksum
            : dict.topup.keyInvalidFormat,
      );
      return;
    }

    setError(null);
    setLoading(true);

    const [balance, history, usageLogs] = await Promise.all([
      getBalanceFor(validation.value),
      getTransactions(12),
      getUsageForKey(validation.value, 8),
    ]);

    setSnapshot(balance);
    setTransactions(history);
    setUsage(usageLogs);
    setTab("usage");
    setUsagePage(1);
    setTopupPage(1);
    setLoading(false);
  }

  function reset() {
    setSnapshot(null);
    setTransactions([]);
    setUsage([]);
    setKeyInput("");
    setError(null);
    setTab("usage");
    setUsagePage(1);
    setTopupPage(1);
    setBundleOpen(false);
  }

  const topups = transactions.filter((row) => row.type === "topup");
  const usagePageCount = Math.max(1, Math.ceil(usage.length / PAGE_SIZE));
  const topupPageCount = Math.max(1, Math.ceil(topups.length / PAGE_SIZE));
  const usageRows = usage.slice((usagePage - 1) * PAGE_SIZE, usagePage * PAGE_SIZE);
  const topupRows = topups.slice((topupPage - 1) * PAGE_SIZE, topupPage * PAGE_SIZE);

  if (!snapshot) {
    return (
      <div className="mt-8">
        <Card corners tone="accent">
          <CardBody className="flex flex-col gap-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!loading) lookup();
              }}
              noValidate
              className="flex flex-col gap-2"
            >
              <label htmlFor="balance-key" className="text-sm font-medium text-text">
                {dict.balance.keyLabel}
              </label>
              {/* Mobile: input, hint, then the button. Desktop: joined input+button row with the hint wrapping below. */}
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-0 sm:gap-y-2">
                <input
                  id="balance-key"
                  value={keyInput}
                  onChange={(event) => setKeyInput(event.target.value)}
                  placeholder={dict.balance.keyPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? "balance-key-error" : "balance-key-hint"}
                  className={cn(
                    "order-1 h-11 w-full min-w-0 rounded-md border bg-bg px-3 text-sm text-text placeholder:text-text-faint focus:border-border-strong sm:order-none sm:flex-1 sm:rounded-r-none sm:border-r-0",
                    error ? "border-error-border" : "border-border",
                  )}
                />
                {error ? (
                  <p
                    id="balance-key-error"
                    className="order-2 text-xs text-error sm:order-3 sm:w-full sm:pt-0.5"
                  >
                    {error}
                  </p>
                ) : (
                  <p
                    id="balance-key-hint"
                    className="order-2 text-xs text-text-muted sm:order-3 sm:w-full sm:pt-0.5"
                  >
                    {dict.balance.lookupHint}
                  </p>
                )}
                <Button
                  type="submit"
                  onClick={lookup}
                  disabled={loading}
                  className="order-3 h-11 w-full shrink-0 sm:order-2 sm:w-auto sm:rounded-l-none"
                >
                  {loading ? dict.common.loading : dict.balance.lookup}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="surface-lift flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
          <ShieldCheck aria-hidden size={14} className="shrink-0 text-success" />
          <span className="text-text-muted">{dict.balance.keyLabel}:</span>
          <code className="tabular truncate rounded bg-bg px-2 py-0.5 text-text">
            {snapshot.apiKeyMasked}
          </code>
        </div>
        <Button onClick={reset} className="h-11 w-full shrink-0 sm:w-auto">
          {dict.balance.lookupAnother}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BalanceStatCard
          icon={Wallet}
          tone="primary"
          label={dict.balance.currentBalance}
          value={formatCurrency(snapshot.balance, "IDR")}
        />
        <BalanceStatCard
          icon={ArrowDownToLine}
          tone="success"
          label={dict.balance.topupThisMonth}
          value={formatCurrency(snapshot.topupThisMonth, "IDR")}
        />
        <BalanceStatCard
          icon={ArrowUpFromLine}
          tone="warning"
          label={dict.balance.spentThisMonth}
          value={formatCurrency(snapshot.spentThisMonth, "IDR")}
        />
        <BalanceStatCard
          icon={Coins}
          tone="accent"
          label={dict.balance.tokensThisMonth}
          value={formatNumber(snapshot.tokensThisMonth)}
        />
      </div>

      <Card corners className="overflow-hidden">
        <div className="relative border-b border-border px-5 py-4">
          <PanelDecoration
            variant="dots"
            className="text-border-strong opacity-25"
            style={{ maskImage: "radial-gradient(ellipse 90% 80% at 100% 0%, black, transparent 72%)" }}
          />
          <h2 className="relative text-base font-semibold text-text">
            {dict.balance.bonusTitle}
          </h2>
          <p className="relative mt-0.5 text-sm text-text-muted">
            {dict.balance.bonusSubtitle}
          </p>
        </div>
        <ul className="grid gap-px bg-border sm:grid-cols-2">
          <li className="bg-surface px-5 py-5 sm:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2">
                <p className="min-w-0 break-words text-sm font-semibold text-text">
                  {dict.balance.bonusBundleTitle}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBundleOpen(true)}
                >
                  {dict.balance.bonusBundleCta}
                </Button>
              </div>
              <span className="tabular shrink-0 text-xl font-bold leading-none text-primary">
                {formatMillion(BUNDLE_TOKENS)}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={100}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${dict.balance.bonusBundleTitle}: ${formatMillion(BUNDLE_TOKENS)} ${dict.balance.bonusBundleQuota}`}
              className="mt-3 h-4 w-full overflow-hidden rounded-full bg-bg"
            >
              <span className="block h-full w-full rounded-full bg-primary" />
            </div>
            <p className="mt-2 text-xs text-text-muted">
              {dict.balance.bonusResetLabel}
            </p>
          </li>
          {MODEL_BONUS.map((model) => (
            <li key={model.name} className="bg-surface px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 break-words text-sm font-semibold text-text">
                  {model.name}
                </p>
                <span className="tabular shrink-0 text-xl font-bold leading-none text-primary">
                  {formatMillion(model.tokens)}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={100}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${model.name}: ${formatMillion(model.tokens)} ${dict.balance.bonusBundleQuota}`}
                className="mt-3 h-4 w-full overflow-hidden rounded-full bg-bg"
              >
                <span className="block h-full w-full rounded-full bg-primary" />
              </div>
              <p className="mt-2 text-xs text-text-muted">
                {dict.balance.bonusResetLabel}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      {snapshot.balance === 0 ? (
        <Card>
          <EmptyState
            icon={<Wallet aria-hidden size={28} />}
            title={dict.balance.emptyBalanceTitle}
            body={dict.balance.emptyBalanceBody}
            action={
              <Link
                href="/topup"
                className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-text-on-primary"
              >
                {dict.balance.emptyBalanceCta}
              </Link>
            }
          />
        </Card>
      ) : null}

      <Card>
        <div className="border-b border-border px-3 pt-3 sm:px-5 sm:pt-4">
          <div
            role="tablist"
            aria-label={dict.balance.dashboardTitle}
            className="flex flex-col gap-1 sm:flex-row"
          >
            {(
              [
                {
                  id: "usage" as const,
                  label: dict.balance.usageHistoryTitle,
                  count: usage.length,
                },
                {
                  id: "topups" as const,
                  label: dict.balance.topupHistoryTitle,
                  count: topups.length,
                },
              ] satisfies { id: HistoryTab; label: string; count: number }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`balance-tab-${item.id}`}
                aria-selected={tab === item.id}
                aria-controls={`balance-panel-${item.id}`}
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  tab === item.id
                    ? "border-border-strong bg-surface-raised text-text"
                    : "border-border text-text-muted hover:text-text",
                )}
              >
                <span className="truncate">{item.label}</span>
                <span
                  className={cn(
                    "tabular rounded px-1.5 py-0.5 text-xs",
                    tab === item.id
                      ? "bg-primary/15 text-primary"
                      : "bg-bg text-text-muted",
                  )}
                >
                  {formatNumber(item.count)}
                </span>
              </button>
            ))}
          </div>
          <p className="px-3 pb-3 pt-2 text-xs text-text-muted">
            {tab === "usage"
              ? dict.balance.usageHistorySubtitle
              : dict.balance.topupHistorySubtitle}
          </p>
        </div>

        {tab === "usage" ? (
          <div
            role="tabpanel"
            id="balance-panel-usage"
            aria-labelledby="balance-tab-usage"
          >
            <Table caption={dict.balance.usageHistoryTitle}>
              <THead>
                <TH>{dict.balance.usageColumns.time}</TH>
                <TH>{dict.balance.usageColumns.model}</TH>
                <TH align="right">{dict.balance.usageColumns.tokensIn}</TH>
                <TH align="right">{dict.balance.usageColumns.tokensOut}</TH>
                <TH align="right">{dict.balance.usageColumns.latency}</TH>
                <TH align="right">{dict.balance.usageColumns.status}</TH>
              </THead>
              <TBody>
                {usageRows.map((row) => (
                  <TR key={row.id}>
                    <TD numeric className="text-text-muted">
                      {formatTime(row.timestamp)}
                    </TD>
                    <TD className="whitespace-nowrap">{row.modelName}</TD>
                    <TD numeric align="right">
                      {formatNumber(row.tokensIn)}
                    </TD>
                    <TD numeric align="right">
                      {formatNumber(row.tokensOut)}
                    </TD>
                    <TD numeric align="right">
                      {row.latencyMs} ms
                    </TD>
                    <TD align="right">
                      <LogStatusIcon status={row.status} dict={dict} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <TablePager
              ariaLabel={dict.balance.usageHistoryTitle}
              page={usagePage}
              pageCount={usagePageCount}
              total={usage.length}
              dict={dict}
              onChange={setUsagePage}
            />
          </div>
        ) : (
          <div
            role="tabpanel"
            id="balance-panel-topups"
            aria-labelledby="balance-tab-topups"
          >
            {topups.length === 0 ? (
              <div className="py-8">
                <EmptyState title={dict.balance.noHistory} />
              </div>
            ) : (
              <Table caption={dict.balance.topupHistoryTitle}>
                <THead>
                  <TH>{dict.balance.topupColumns.date}</TH>
                  <TH align="right">{dict.balance.topupColumns.amount}</TH>
                  <TH align="right">{dict.balance.topupColumns.status}</TH>
                  <TH align="right">{dict.balance.topupColumns.balanceAfter}</TH>
                </THead>
                <TBody>
                  {topupRows.map((row) => (
                    <TR key={row.id}>
                      <TD numeric className="text-text-muted">
                        {formatDateTime(row.createdAt, locale)}
                      </TD>
                      <TD numeric align="right" className="text-success">
                        +{formatCurrency(row.amount, "IDR")}
                      </TD>
                      <TD align="right">
                        <Badge
                          tone={
                            row.status === "completed"
                              ? "success"
                              : row.status === "pending"
                                ? "warning"
                                : "error"
                          }
                        >
                          {dict.billing.status[row.status]}
                        </Badge>
                      </TD>
                      <TD numeric align="right" className="text-text-muted">
                        {formatCurrency(row.balanceAfter, "IDR")}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
            {topups.length > 0 ? (
              <TablePager
                ariaLabel={dict.balance.topupHistoryTitle}
                page={topupPage}
                pageCount={topupPageCount}
                total={topups.length}
                dict={dict}
                onChange={setTopupPage}
              />
            ) : null}
          </div>
        )}
      </Card>

      {bundleOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setBundleOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="balance-bundle-title"
            className="w-full max-w-md rounded-lg border border-border bg-surface"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <h3
                id="balance-bundle-title"
                className="text-sm font-semibold text-text"
              >
                {dict.balance.bonusBundleModelsTitle}
              </h3>
              <button
                type="button"
                onClick={() => setBundleOpen(false)}
                aria-label={dict.common.close}
                className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
              >
                <X aria-hidden size={16} />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-text-muted">
                {dict.balance.bonusBundleModelsBody}
              </p>
              <ul className="mt-3 divide-y divide-border">
                {BUNDLE_MODELS.map((name) => (
                  <li
                    key={name}
                    className="flex items-center gap-2 py-2.5 text-sm text-text"
                  >
                    <Coins aria-hidden size={14} className="shrink-0 text-success" />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-border px-5 py-3">
              <Button
                variant="secondary"
                className="h-11 w-full"
                onClick={() => setBundleOpen(false)}
              >
                {dict.common.close}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
