"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ArrowDownUp, LayoutGrid, Rows3, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ModelGlyph } from "./model-glyph";
import { CapabilityList, CopyModelIdButton } from "./model-identity";
import { LiveStatValue, growthFor } from "./live-stat-value";
import { cn } from "@/lib/cn";
import { MOBILE_QUERY, useMediaQuery } from "@/lib/use-media-query";
import {
  formatCompact,
  formatPricePerMillion,
} from "@/lib/format";
import type { Dictionary } from "@/lib/i18n";
import type { ModelWithStats, Provider } from "@/lib/dummy/types";

type SortKey =
  | "name"
  | "priceInputAsc"
  | "priceOutputAsc"
  | "requestsDesc"
  | "tokensDesc"
  | "usersDesc"
  | "contextDesc";

type View = "cards" | "table";

const SORT_KEYS: SortKey[] = [
  "name",
  "priceInputAsc",
  "priceOutputAsc",
  "requestsDesc",
  "tokensDesc",
  "usersDesc",
  "contextDesc",
];

function sortModels(models: ModelWithStats[], key: SortKey): ModelWithStats[] {
  const copy = [...models];

  switch (key) {
    case "priceInputAsc":
      return copy.sort((a, b) => a.pricing.inputPer1M - b.pricing.inputPer1M);
    case "priceOutputAsc":
      return copy.sort((a, b) => a.pricing.outputPer1M - b.pricing.outputPer1M);
    case "requestsDesc":
      return copy.sort((a, b) => b.stats.totalRequests - a.stats.totalRequests);
    case "tokensDesc":
      return copy.sort((a, b) => b.stats.totalTokens - a.stats.totalTokens);
    case "usersDesc":
      return copy.sort((a, b) => b.stats.uniqueUsers - a.stats.uniqueUsers);
    case "contextDesc":
      return copy.sort((a, b) => b.contextWindow - a.contextWindow);
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

/** Rupiah with a smaller currency prefix than the amount. */
function Price({ value }: { value: string }) {
  const amount = value.replace(/^Rp/, "");

  return (
    <span className="tabular font-bold text-text">
      <span className="mr-0.5 text-xs font-medium text-text-muted">Rp</span>
      <span className="text-lg">{amount}</span>
    </span>
  );
}

export function ModelCatalog({
  models,
  providers,
  dict,
}: {
  models: ModelWithStats[];
  providers: Provider[];
  dict: Dictionary;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [view, setView] = useState<View | null>(null);

  // Resolved once the viewport is known: cards on phones, table elsewhere.
  const activeView: View = view ?? (isMobile === true ? "cards" : "table");

  const providerName = useMemo(() => {
    const map = new Map(providers.map((item) => [item.id, item.name]));
    return (id: string) => map.get(id) ?? id;
  }, [providers]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = needle
      ? models.filter(
          (model) =>
            model.name.toLowerCase().includes(needle) ||
            model.slug.toLowerCase().includes(needle) ||
            providerName(model.providerId).toLowerCase().includes(needle),
        )
      : models;

    return sortModels(filtered, sort);
  }, [models, query, sort, providerName]);

  return (
    <div>
      <div className="surface-lift mt-6 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 lg:flex-row lg:items-center">
        <div className="relative w-full flex-1 sm:min-w-[220px]">
          <Search
            aria-hidden
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dict.models.searchPlaceholder}
            aria-label={dict.models.searchPlaceholder}
            className="h-10 w-full rounded-md border border-border bg-bg pl-9 pr-3 text-sm text-text placeholder:text-text-faint"
          />
        </div>

        <div className="relative w-full lg:w-auto">
          <ArrowDownUp
            aria-hidden
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
          />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            aria-label={dict.models.sortLabel}
            className="h-10 w-full appearance-none rounded-md border border-border bg-bg pl-9 pr-9 text-sm text-text lg:w-auto"
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {dict.models.sort[key]}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8l4 4 4-4" />
          </svg>
        </div>

        <div
          role="group"
          aria-label={dict.models.viewLabel}
          className="flex h-10 w-fit items-center gap-0.5 self-start rounded-md border border-border p-0.5 lg:self-auto"
        >
          <button
            type="button"
            onClick={() => setView("cards")}
            aria-pressed={activeView === "cards"}
            className={cn(
              "inline-flex h-full items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors",
              activeView === "cards"
                ? "bg-surface-raised text-text"
                : "text-text-muted hover:text-text",
            )}
          >
            <LayoutGrid aria-hidden size={13} />
            {dict.models.viewCards}
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            aria-pressed={activeView === "table"}
            className={cn(
              "inline-flex h-full items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors",
              activeView === "table"
                ? "bg-surface-raised text-text"
                : "text-text-muted hover:text-text",
            )}
          >
            <Rows3 aria-hidden size={13} />
            {dict.models.viewTable}
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-text">
        {dict.models.showing} {visible.length} {dict.common.of} {models.length}{" "}
        {dict.common.results}
      </p>

      {visible.length === 0 ? (
        <Card className="mt-4">
          <EmptyState
            title={dict.models.emptyTitle}
            body={dict.models.emptyBody}
            action={
              <Button variant="secondary" onClick={() => setQuery("")}>
                {dict.models.resetFilters}
              </Button>
            }
          />
        </Card>
      ) : activeView === "cards" ? (
        <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((model, index) => (
            <Card
              as="li"
              key={model.id}
              corners
              animate
              className="group flex flex-col p-4 transition-colors hover:border-border-strong"
              style={{ "--delay": `${Math.min(index, 8) * 40}ms` } as CSSProperties}
            >
              <div className="flex items-center gap-2.5">
                <ModelGlyph
                  providerId={model.providerId}
                  name={model.name}
                  size={32}
                />
                <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-text">
                  {model.name}
                </h2>
                <CopyModelIdButton
                  slug={model.slug}
                  copyLabel={dict.common.copyModelId}
                  copiedLabel={dict.common.copiedModelId}
                />
              </div>

              <CapabilityList
                capabilities={model.capabilities}
                labels={dict.models.capabilities}
                className="mt-2.5"
                size="xs"
              />

              <dl className="tabular mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2.5">
                <div>
                  <dt className="text-xs text-text-muted">
                    {dict.common.contextWindow}
                  </dt>
                  <dd className="text-base font-semibold text-text">
                    {formatCompact(model.contextWindow)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">
                    {dict.models.inputPrice}
                  </dt>
                  <dd>
                    <Price value={formatPricePerMillion(model.pricing.inputPer1M)} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">
                    {dict.common.maxOutput}
                  </dt>
                  <dd className="text-base font-semibold text-text">
                    {formatCompact(model.maxOutput)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">
                    {dict.models.outputPrice}
                  </dt>
                  <dd>
                    <Price value={formatPricePerMillion(model.pricing.outputPer1M)} />
                  </dd>
                </div>
              </dl>

              <dl className="tabular mt-2.5 flex flex-col gap-1 rounded-md bg-bg px-2.5 py-2">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-xs text-text-muted">
                    {dict.models.stats.users}
                  </dt>
                  <dd className="text-lg font-bold text-text">
                    <LiveStatValue
                      value={model.stats.uniqueUsers}
                      growBy={growthFor(`${model.id}-u`, 2)}
                    />
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-xs text-text-muted">
                    {dict.models.stats.tokens}
                  </dt>
                  <dd className="text-lg font-bold text-text">
                    <LiveStatValue
                      value={model.stats.totalTokens}
                      growBy={growthFor(`${model.id}-t`, 12_000)}
                    />
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-xs text-text-muted">
                    {dict.models.stats.requests}
                  </dt>
                  <dd className="text-lg font-bold text-text">
                    <LiveStatValue
                      value={model.stats.totalRequests}
                      growBy={growthFor(`${model.id}-r`, 400)}
                    />
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </ul>
      ) : (
        <Card className="mt-4">
          <Table caption={dict.models.title}>
            <THead>
              <TH>{dict.models.columns.model}</TH>
              <TH align="right">{dict.models.columns.input}</TH>
              <TH align="right">{dict.models.columns.output}</TH>
              <TH align="right">{dict.models.columns.info}</TH>
            </THead>
            <TBody>
              {visible.map((model) => (
                <TR key={model.id}>
                  <TD>
                    <div className="flex items-start gap-3">
                      <ModelGlyph
                        providerId={model.providerId}
                        name={model.name}
                        size={32}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-text">
                            {model.name}
                          </p>
                          <CopyModelIdButton
                            slug={model.slug}
                            copyLabel={dict.common.copyModelId}
                            copiedLabel={dict.common.copiedModelId}
                          />
                        </div>
                        <p className="tabular mt-1 whitespace-nowrap text-xs text-text-muted">
                          {dict.models.columns.contextShort}:{" "}
                          <span className="text-text">
                            {formatCompact(model.contextWindow)}
                          </span>{" "}
                          · {dict.models.columns.outputShort}:{" "}
                          <span className="text-text">
                            {formatCompact(model.maxOutput)}
                          </span>
                        </p>
                        <CapabilityList
                          capabilities={model.capabilities}
                          labels={dict.models.capabilities}
                          className="mt-2"
                          size="xs"
                        />
                      </div>
                    </div>
                  </TD>
                  <TD numeric align="right">
                    <Price value={formatPricePerMillion(model.pricing.inputPer1M)} />
                  </TD>
                  <TD numeric align="right">
                    <Price value={formatPricePerMillion(model.pricing.outputPer1M)} />
                  </TD>
                  <TD align="right">
                    <div className="tabular flex flex-col items-end gap-1 text-xs whitespace-nowrap">
                      <span className="text-text">
                        <LiveStatValue
                          value={model.stats.uniqueUsers}
                          growBy={growthFor(`${model.id}-u`, 2)}
                        />{" "}
                        <span className="text-text-muted">
                          {dict.models.stats.users}
                        </span>
                      </span>
                      <span className="text-text">
                        <LiveStatValue
                          value={model.stats.totalTokens}
                          growBy={growthFor(`${model.id}-t`, 12_000)}
                        />{" "}
                        <span className="text-text-muted">
                          {dict.models.stats.tokens}
                        </span>
                      </span>
                      <span className="text-text">
                        <LiveStatValue
                          value={model.stats.totalRequests}
                          growBy={growthFor(`${model.id}-r`, 400)}
                        />{" "}
                        <span className="text-text-muted">
                          {dict.models.stats.requests}
                        </span>
                      </span>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
