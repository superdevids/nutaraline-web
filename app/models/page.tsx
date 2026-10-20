import { Suspense } from "react";
import { PageHeader } from "@/components/ui/empty-state";
import { ModelCatalog } from "@/components/models/model-catalog";
import { TokenPool } from "@/components/models/token-pool";
import { getModelsWithStats, getProviders } from "@/lib/dummy";
import { getDictionary } from "@/lib/i18n/server";
import { Activity } from "lucide-react";

async function ModelsContent() {
	const { dict } = await getDictionary();
	const [models, providers] = await Promise.all([getModelsWithStats(), getProviders()]);

	return (
		<>
			<div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
				<Activity
					aria-hidden
					size={13}
				/>
				{dict.nav.models}
			</div>
			<PageHeader
				title={dict.models.title}
				subtitle={dict.models.subtitle}
				marker="02"
			/>
			<TokenPool dict={dict} />
			<ModelCatalog
				models={models}
				providers={providers}
				dict={dict}
			/>
		</>
	);
}

export default function ModelsPage() {
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
				<ModelsContent />
			</Suspense>
		</div>
	);
}
