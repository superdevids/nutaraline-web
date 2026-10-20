import { Suspense } from "react";
import { PageLoading } from "@/components/ui/page-loading";
import { getDictionary } from "@/lib/i18n/server";

async function LoadingLabel() {
  const { dict } = await getDictionary();
  return <PageLoading label={dict.common.loading} variant="article" />;
}

export default function DocsLoading() {
  return (
    <Suspense fallback={<PageLoading label="Memuat…" variant="article" />}>
      <LoadingLabel />
    </Suspense>
  );
}
