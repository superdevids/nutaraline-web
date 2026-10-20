"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n";
import type { UserUsage } from "@/lib/dummy/types";

const PAGE_SIZE = 10;

export function Leaderboard({
  users,
  dict,
}: {
  users: UserUsage[];
  dict: Dictionary;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) return users;

    return users.filter((user) =>
      user.userName.toLowerCase().includes(needle),
    );
  }, [users, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  function onSearch(value: string) {
    setQuery(value);
    setPage(0);
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-text">
            {dict.monitoring.users.leaderboardTitle}
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            {dict.monitoring.users.leaderboardSubtitle}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            aria-hidden
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={dict.monitoring.users.searchPlaceholder}
            aria-label={dict.monitoring.users.searchPlaceholder}
            className="h-9 w-full rounded-md border border-border bg-bg pl-8 pr-3 text-sm text-text placeholder:text-text-faint"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={dict.monitoring.users.emptyTitle}
          body={dict.monitoring.users.emptyBody}
        />
      ) : (
        <>
          <Table caption={dict.monitoring.users.leaderboardTitle}>
            <THead>
              <TH>{dict.monitoring.users.columns.user}</TH>
              <TH>{dict.monitoring.users.columns.favoriteModel}</TH>
              <TH align="right">{dict.monitoring.users.columns.tokens}</TH>
              <TH align="right">{dict.monitoring.users.columns.requests}</TH>
            </THead>
            <TBody>
              {rows.map((user) => (
                <TR key={user.userId}>
                  <TD>
                    <p className="font-medium text-text">{user.userName}</p>
                  </TD>
                  <TD className="text-text-muted">{user.favoriteModel}</TD>
                  <TD numeric align="right">
                    {formatNumber(user.totalTokens)}
                  </TD>
                  <TD numeric align="right">
                    {formatNumber(user.totalRequests)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-xs text-text-muted">
            <span className="tabular">
              {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}{" "}
              {dict.common.of} {formatNumber(filtered.length)}
            </span>

            <div className="flex items-center gap-1">
              {safePage > 0 ? (
                <button
                  type="button"
                  onClick={() => setPage(safePage - 1)}
                  aria-label={dict.common.previous}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:text-text"
                >
                  <ChevronLeft aria-hidden size={14} />
                </button>
              ) : null}

              <span className="tabular px-2">
                {safePage + 1} / {pageCount}
              </span>

              {safePage < pageCount - 1 ? (
                <button
                  type="button"
                  onClick={() => setPage(safePage + 1)}
                  aria-label={dict.common.next}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:text-text"
                >
                  <ChevronRight aria-hidden size={14} />
                </button>
              ) : null}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
