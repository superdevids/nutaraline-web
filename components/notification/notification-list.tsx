"use client";

import { useSyncExternalStore } from "react";
import {
  Bell,
  ChevronDown,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/format";
import type { Notification } from "@/lib/dummy/types";
import type { Dictionary, Locale } from "@/lib/i18n";

const categoryIcon = {
  billing: Wallet,
  system: Bell,
  security: ShieldAlert,
};

const severityIconClass = {
  info: "border-info/50 text-info",
  success: "border-success/50 text-success",
  warning: "border-warning/50 text-warning",
  error: "border-error/50 text-error",
};

const READ_STORAGE_KEY = "nutaraline.notification.read.v1";
const EMPTY_READ_IDS: string[] = [];

function loadReadIds(): string[] {
  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

/** External store so read-state survives reloads AND satisfies SSR. */
const readStore = (() => {
  let cache: string[] | null = null;
  const listeners = new Set<() => void>();

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot(): string[] {
      if (cache === null) cache = loadReadIds();
      return cache;
    },
    set(next: string[]) {
      cache = next;
      try {
        window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable (private mode etc.) — state just isn't kept.
      }
      listeners.forEach((listener) => listener());
    },
  };
})();

/** Dummy data stores full dict paths ("notifications.items.x"); the items
 * object is keyed by the short segment, so resolve the last segment. */
function notificationText(dict: Dictionary, key: string): string {
  const shortKey = key.split(".").pop() as keyof Dictionary["notification"]["items"];
  return dict.notification.items[shortKey] ?? "";
}

export function NotificationList({
  notifications,
  dict,
  locale,
  now,
}: {
  notifications: Notification[];
  dict: Dictionary;
  locale: Locale;
  now: string;
}) {
  const readIds = useSyncExternalStore(
    readStore.subscribe,
    readStore.getSnapshot,
    () => EMPTY_READ_IDS,
  );

  function markRead(id: string) {
    if (!readIds.includes(id)) {
      readStore.set(readIds.concat(id));
    }
  }

  const nowDate = new Date(now);

  return (
    <div className="mt-8">
      <Card corners className="overflow-hidden">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell aria-hidden size={28} />}
            title={dict.notification.emptyTitle}
            body={dict.notification.emptyBody}
          />
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((item) => {
              const Icon = categoryIcon[item.category];

              return (
                <li key={item.id}>
                  <details name="nutaraline-notification" className="group">
                    <summary
                      onToggle={(event) => {
                        if ((event.currentTarget as HTMLDetailsElement).open) {
                          markRead(item.id);
                        }
                      }}
                      className="flex cursor-pointer select-none items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-raised/40 [&::-webkit-details-marker]:hidden"
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                          severityIconClass[item.severity],
                        )}
                      >
                        <Icon aria-hidden size={14} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-text">
                          {notificationText(dict, item.titleKey)}
                        </span>
                        <span className="mt-0.5 block text-xs text-text-faint">
                          {formatRelativeTime(item.createdAt, nowDate, locale)}
                        </span>
                      </span>

                      <ChevronDown
                        aria-hidden
                        size={15}
                        className="shrink-0 text-text-muted transition-transform group-open:rotate-180"
                      />
                    </summary>

                    <div className="border-t border-border bg-bg px-4 py-3">
                      <p className="text-sm leading-6 text-text-muted">
                        {notificationText(dict, item.bodyKey)}
                      </p>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
