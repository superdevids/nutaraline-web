import { Suspense } from "react";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/empty-state";
import { BalanceLookup } from "@/components/balance/balance-lookup";
import { getDictionary } from "@/lib/i18n/server";

async function BalanceContent() {
  const { dict, locale } = await getDictionary();

  return (
    <>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
        <Wallet aria-hidden size={13} />
        {dict.nav.balance}
      </div>
      <PageHeader title={dict.balance.title} subtitle={dict.balance.subtitle} marker="04" />
      <BalanceLookup dict={dict} locale={locale} />
    </>
  );
}

export default function BalancePage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6">
      <Suspense
        fallback={
          <div
            aria-hidden
            className="h-96 animate-pulse rounded-lg border border-border bg-surface"
          />
        }
      >
        <BalanceContent />
      </Suspense>
    </div>
  );
}
