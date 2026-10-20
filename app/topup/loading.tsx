import { Suspense } from "react";
import { PageLoading } from "@/components/ui/page-loading";
import { getDictionary } from "@/lib/i18n/server";

async function LoadingLabel() {
  const { dict } = await getDictionary();
  return <PageLoading label={dict.common.loading} />;
}

export default function TopupLoading() {
  return (
    <Suspense fallback={<PageLoading label="Memuat…" />}>
      <LoadingLabel />
    </Suspense>
  );
}
