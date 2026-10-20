"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/errors/error-screen";
import type { Dictionary } from "@/lib/i18n";

// A Client Component cannot read cookies, so this boundary carries a minimal
// English dictionary. The fully localised versions live at /error/[code].
const boundaryCopy = {
	errorPages: {
		eyebrow: "Request error",
		codeLabel: "Status",
		back: "Go back",
		backToMonitoring: "Back",
		requestId: "Request ID",
		codes: {},
	},
	errors: {
		retry: "Try again",
		errorTitle: "Something went wrong",
		errorBody: "An unexpected error occurred. Try again in a moment.",
	},
} as unknown as Dictionary;

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<ErrorScreen
			code={500}
			tone="error"
			title={boundaryCopy.errors.errorTitle}
			body={boundaryCopy.errors.errorBody}
			hint="Retry once. If it persists, contact support with the request ID below."
			dict={boundaryCopy}
			requestId={error.digest}
			onRetry={reset}
		/>
	);
}
