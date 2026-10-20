"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { telegramChannelUrl, whatsAppUrl } from "@/lib/contact";
import type { Dictionary } from "@/lib/i18n";
import { PanelDecoration } from "@/components/ui/decoration";
import { ScrollToTopButton } from "./scroll-to-top-button";

/**
 * Floating support launcher, pinned bottom-right on every page. Closes on
 * Escape, outside click, or route change is handled by the layout remount —
 * the panel is deliberately not a modal so the page stays usable.
 */
export function ContactButton({ dict }: { dict: Dictionary }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const channels = [
    {
      href: telegramChannelUrl(),
      label: dict.contact.telegram,
      hint: dict.contact.telegramHint,
      icon: Send,
      tone: "text-info",
    },
    {
      href: whatsAppUrl(),
      label: dict.contact.whatsapp,
      hint: dict.contact.whatsappHint,
      icon: MessageCircle,
      tone: "text-success",
    },
  ];

  return (
    <div className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex flex-row items-end gap-2 md:right-6 md:bottom-6">
      {open ? (
        <>
          <div
            aria-hidden
            className="fixed inset-0 -z-10"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label={dict.contact.title}
            className="w-64 animate-fade-up surface-lift rounded-lg border border-border bg-surface shadow-xl shadow-bg-deep/60 max-sm:w-[min(16rem,calc(100vw-7rem))]"
          >
            <div className="relative overflow-hidden">
              <PanelDecoration
                variant="hatch"
                className="text-accent/12"
                style={{ maskImage: "linear-gradient(to right, transparent, black)" }}
              />
            <div className="relative flex items-start justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">
                  {dict.contact.title}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {dict.contact.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict.contact.close}
                className="-mr-1 rounded-md p-1 text-text-faint transition-colors hover:bg-surface-raised hover:text-text"
              >
                <X aria-hidden size={14} />
              </button>
            </div>
            </div>

            <ul className="flex flex-col">
              {channels.map(({ href, label, hint, icon: Icon, tone }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-raised/60"
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border",
                        tone,
                      )}
                    >
                      <Icon aria-hidden size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-text">
                        {label}
                      </span>
                      <span className="block text-xs text-text-faint">
                        {hint}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      <div className="flex flex-col items-end gap-2">
        <ScrollToTopButton dict={dict} />

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? dict.contact.close : dict.contact.open}
          title={open ? dict.contact.close : dict.contact.open}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent text-text-on-primary shadow-lg shadow-accent/25 transition-transform hover:scale-105 active:scale-95"
        >
          {open ? (
            <X aria-hidden size={18} />
          ) : (
            <MessageCircle aria-hidden size={19} />
          )}
        </button>
      </div>
    </div>
  );
}
