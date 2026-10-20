import { Suspense } from "react";
import { ErrorScreen } from "@/components/errors/error-screen";
import { PageLoading } from "@/components/ui/page-loading";
import { ERROR_CODES, isErrorCode, toneForCode } from "@/lib/errors";
import { getDictionary } from "@/lib/i18n/server";

export async function generateStaticParams() {
  return ERROR_CODES.map((code) => ({ code: String(code) }));
}

/**
 * `params` is request-time data, so it is read inside the Suspense boundary.
 * Validating the code outside the boundary is unnecessary: an unknown slug
 * simply falls through to `unknown` and renders a generic error screen, which
 * is friendlier than a 404 for a URL a user was redirected to by a client.
 */
async function ErrorContent({
  params,
}: {
  params: PageProps<"/error/[code]">["params"];
}) {
  const { code } = await params;
  const { dict } = await getDictionary();

  const isValid = isErrorCode(code);
  const key = isValid ? code : "unknown";
  const entry = dict.errorPages.codes[key];
  const numeric = isValid ? Number(code) : 0;

  return (
    <ErrorScreen
      code={isValid ? numeric : "unknown"}
      tone={toneForCode(numeric)}
      title={entry.title}
      body={entry.body}
      hint={entry.hint}
      dict={dict}
    />
  );
}

function ErrorSkeleton() {
  return <PageLoading />;
}

export default async function ErrorPage({
  params,
}: PageProps<"/error/[code]">) {
  return (
    <Suspense fallback={<ErrorSkeleton />}>
      <ErrorContent params={params} />
    </Suspense>
  );
}
