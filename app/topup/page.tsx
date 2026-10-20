import { Suspense } from "react";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/empty-state";
import { TopupFlow } from "@/components/topup/topup-flow";
import { getDictionary } from "@/lib/i18n/server";

async function TopupContent() {
  const { dict, locale } = await getDictionary();

  return (
    <>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
        <CreditCard aria-hidden size={13} />
        {dict.nav.topup}
      </div>
      <PageHeader title={dict.topup.title} subtitle={dict.topup.subtitle} marker="03" />
      <TopupFlow dict={dict} locale={locale} />
    </>
  );
}

export default function TopupPage() {
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
        <TopupContent />
      </Suspense>
    </div>
  );
}
