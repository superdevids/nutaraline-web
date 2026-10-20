"use client";

import { useState } from "react";
import { Check, Clock, Copy, Download, Infinity as InfinityIcon, Wallet } from "lucide-react";
import { Alert } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PanelDecoration } from "@/components/ui/decoration";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { generateApiKey, keyFingerprint, maskApiKey, validateApiKey } from "@/lib/api-key";
import { formatCurrency, formatDate } from "@/lib/format";
import { MAX_TOPUP_IDR, MIN_TOPUP_IDR, UNLIMITED_PLAN_DAYS, UNLIMITED_PLAN_PRICE_IDR, allowedPresets, validateTopupAmount, type PurchaseKind } from "@/lib/dummy/plans";
import { createInvoice, getBalanceFor } from "@/lib/dummy";
import { isDemoBuild } from "@/lib/env";
import type { BalanceSnapshot, Invoice } from "@/lib/dummy/types";
import type { Dictionary, Locale } from "@/lib/i18n";

type PaymentMethod = "virtual-account" | "qris";
type Phase = "form" | "payment" | "done";

interface Receipt {
	masked: string;
	kind: PurchaseKind;
	amount: number;
	reference: string;
	method: PaymentMethod;
}

/** Downloads a plain-text invoice for the completed purchase. */
function downloadInvoice(receipt: Receipt, key: string | null) {
	const lines = ["NUTARALINE — INVOICE", "====================", `Reference     : ${receipt.reference}`, `Amount        : ${formatCurrency(receipt.amount, "IDR")}`, `Product       : ${receipt.kind === "unlimited" ? "Unlimited plan" : "Balance credit"}`, key ? `New API key   : ${key}` : "", "", "Simulated purchase. No funds were charged."].filter(Boolean);

	const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");

	anchor.href = url;
	anchor.download = `${receipt.reference}.txt`;
	anchor.click();
	URL.revokeObjectURL(url);
}

/** Groups digits as the user types: "100000" becomes "100.000". */
function formatThousands(digits: string): string {
	if (!digits) return "";

	return new Intl.NumberFormat("de-DE").format(Number(digits));
}

/** Deterministic QR placeholder derived from the invoice reference. */
function qrCells(seed: string, size = 21): boolean[][] {
	const cells: boolean[][] = [];

	for (let row = 0; row < size; row++) {
		const line: boolean[] = [];
		for (let column = 0; column < size; column++) {
			const code = seed.charCodeAt((row * size + column) % seed.length);
			line.push((code + row * 7 + column * 13) % 3 !== 0);
		}
		cells.push(line);
	}

	return cells;
}

export function TopupFlow({ dict, locale }: { dict: Dictionary; locale: Locale }) {
	const [phase, setPhase] = useState<Phase>("form");
	const [kind, setKind] = useState<PurchaseKind>("balance");
	const [amountInput, setAmountInput] = useState("5000");
	const [amountError, setAmountError] = useState<string | null>(null);
	const [keyInput, setKeyInput] = useState("");
	const [keyError, setKeyError] = useState<string | null>(null);
	const method: PaymentMethod = "virtual-account";
	const [snapshot, setSnapshot] = useState<BalanceSnapshot | null>(null);
	const [invoice, setInvoice] = useState<Invoice | null>(null);
	const [receipt, setReceipt] = useState<Receipt | null>(null);
	const [issuedKey, setIssuedKey] = useState<string | null>(null);
	const [copied, setCopied] = useState<string | null>(null);

	const presets = allowedPresets();

	function resolveAmount(): number | null {
		if (kind === "unlimited") return UNLIMITED_PLAN_PRICE_IDR;

		const validation = validateTopupAmount(amountInput);

		if (!validation.ok) {
			setAmountError(validation.reason === "below-min" ? dict.topup.amountBelowMin : validation.reason === "above-max" ? dict.topup.amountAboveMax : dict.topup.amountInvalid);
			return null;
		}

		setAmountError(null);
		return validation.value;
	}

	async function startPayment() {
		const resolved = resolveAmount();
		if (resolved === null) return;

		let existing: BalanceSnapshot | null = null;

		if (keyInput.trim().length > 0) {
			const validation = validateApiKey(keyInput);

			if (!validation.ok) {
				setKeyError(validation.reason === "empty" ? dict.topup.keyInvalidEmpty : validation.reason === "checksum" ? dict.topup.keyInvalidChecksum : dict.topup.keyInvalidFormat);
				return;
			}

			setKeyError(null);
			existing = await getBalanceFor(validation.value);
		}

		setSnapshot(existing);
		setInvoice(await createInvoice(resolved));
		setPhase("payment");
	}

	async function confirmPaid() {
		if (!invoice) return;

		const newKey = keyInput.trim().length === 0 ? generateApiKey() : null;
		const masked = snapshot ? snapshot.apiKeyMasked : maskApiKey(newKey as string);

		if (newKey) setIssuedKey(newKey);

		setReceipt({
			masked,
			kind,
			amount: invoice.amount,
			reference: invoice.id,
			method,
		});

		// Only derived values are persisted; the raw key never reaches storage.
		try {
			sessionStorage.setItem(
				"nutaraline.topup",
				JSON.stringify({
					fingerprint: keyFingerprint(newKey ?? keyInput),
					masked,
					amount: invoice.amount,
					kind,
					reference: invoice.id,
				}),
			);
		} catch {
			// Storage can be blocked; the flow still completes.
		}

		setPhase("done");
	}

	function restart() {
		setPhase("form");
		setKeyInput("");
		setKeyError(null);
		setAmountError(null);
		setSnapshot(null);
		setInvoice(null);
		setReceipt(null);
		setIssuedKey(null);
		setCopied(null);
	}

	async function copyValue(id: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(id);
			window.setTimeout(() => setCopied(null), 1600);
		} catch {
			setCopied(null);
		}
	}

	const amountHelper = dict.topup.amountHelper.replace("{min}", formatCurrency(MIN_TOPUP_IDR, "IDR")).replace("{max}", formatCurrency(MAX_TOPUP_IDR, "IDR"));

	return (
		<div className="mt-6">
			<div className="flex flex-col gap-4">
				{phase === "form" ? (
					<Card
						corners
						tone="accent"
					>
						<CardHeader
							title={dict.topup.formTitle}
							subtitle={dict.topup.formSubtitle}
						/>
						<CardBody className="flex flex-col gap-5">
							<div className="grid gap-3 sm:grid-cols-2">
								{(
									[
										{ id: "balance", icon: Wallet, title: dict.topup.kindBalance, body: dict.topup.kindBalanceBody },
										{ id: "unlimited", icon: InfinityIcon, title: dict.topup.kindUnlimited, body: dict.topup.kindUnlimitedBody },
									] as const
								).map((option) => {
									const active = kind === option.id;
									const Icon = option.icon;

									return (
										<button
											key={option.id}
											type="button"
											aria-pressed={active}
											onClick={() => {
												setKind(option.id);
												setAmountError(null);
											}}
											className={cn("rounded-lg border p-4 text-left transition-colors", active ? "border-accent bg-linear-to-br from-accent/[0.10] to-success-bg shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]" : "border-border bg-surface hover:border-border-strong")}
										>
											<span className="flex items-center gap-2">
												<Icon
													aria-hidden
													size={18}
													className={active ? "text-accent" : "text-text-muted"}
												/>
												<span className="text-sm font-semibold text-text">{option.title}</span>
											</span>
											<p className="mt-2 text-xs leading-relaxed text-text-muted">{option.body}</p>
										</button>
									);
								})}
							</div>

							{kind === "balance" ? (
								<div className="flex flex-col gap-3">
									<p className="text-sm font-medium text-text">{dict.topup.amountLabel}</p>
									<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
										{presets.map((preset) => {
											const active = String(preset) === amountInput;
											return (
												<button
													key={preset}
													type="button"
													aria-pressed={active}
													onClick={() => setAmountInput(String(preset))}
													className={cn("tabular rounded-md border px-3 py-2.5 text-sm font-medium transition-colors", active ? "border-accent bg-success-bg text-success" : "border-border text-text hover:bg-surface-raised")}
												>
													{formatCurrency(preset, "IDR")}
												</button>
											);
										})}
									</div>

									<div className="flex flex-col gap-1.5">
										<label
											htmlFor="topup-amount"
											className="text-sm font-medium text-text"
										>
											{dict.topup.customAmountLabel}
										</label>
										<div className="relative">
											<span
												aria-hidden
												className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted"
											>
												Rp
											</span>
											<input
												id="topup-amount"
												inputMode="numeric"
												value={formatThousands(amountInput)}
												onChange={(event) => {
													const digits = event.target.value.replace(/[^\d]/g, "");
													// Hard cap: typing beyond the maximum truncates instead
													// of accepting an amount that will fail validation later.
													const capped = digits.slice(0, String(MAX_TOPUP_IDR).length);
													setAmountInput(Number(capped) > MAX_TOPUP_IDR ? String(MAX_TOPUP_IDR) : capped);
													setAmountError(null);
												}}
												aria-invalid={Boolean(amountError) || undefined}
												aria-describedby={amountError ? "topup-amount-error" : "topup-amount-hint"}
												className={cn("tabular h-11 w-full rounded-md border bg-bg pl-10 pr-3 text-sm text-text", "placeholder:text-text-faint focus:border-border-strong", amountError ? "border-error-border" : "border-border")}
											/>
										</div>
										{amountError ? (
											<p
												id="topup-amount-error"
												className="text-xs text-error"
											>
												{amountError}
											</p>
										) : (
											<p
												id="topup-amount-hint"
												className="text-xs text-text-muted"
											>
												{amountHelper}
											</p>
										)}
									</div>
								</div>
							) : (
								<div className="rounded-md border border-border bg-bg p-4">
									<p className="tabular text-2xl font-bold text-text">
										{formatCurrency(UNLIMITED_PLAN_PRICE_IDR, "IDR")}
										<span className="ml-1 text-sm font-normal text-text-muted">
											/ {UNLIMITED_PLAN_DAYS} {dict.balance.days}
										</span>
									</p>
									<ul className="mt-3 flex flex-col gap-1.5 text-xs text-text-muted">
										<li>• {dict.topup.unlimitedBenefitOne}</li>
										<li>• {dict.topup.unlimitedBenefitTwo}</li>
									</ul>
								</div>
							)}

							<Input
								id="topup-key"
								label={dict.topup.keyOptionalLabel}
								hint={dict.topup.keyOptionalHelper}
								placeholder={dict.topup.keyPlaceholder}
								error={keyError ?? undefined}
								value={keyInput}
								onChange={(event) => setKeyInput(event.target.value)}
								autoComplete="off"
								spellCheck={false}
							/>

							<div className="flex flex-col gap-3">
								<div className="flex items-baseline justify-between gap-3">
									<span className="text-sm text-text-muted">{dict.common.total}</span>
									<span className="tabular text-2xl font-bold text-text">{formatCurrency(kind === "unlimited" ? UNLIMITED_PLAN_PRICE_IDR : Number(amountInput.replace(/[^\d]/g, "")) || 0, "IDR")}</span>
								</div>
								<Button
									onClick={startPayment}
									size="lg"
								>
									{dict.topup.payNow}
								</Button>
								{isDemoBuild ? <p className="text-xs leading-relaxed text-text-faint">{dict.topup.simulateNotice}</p> : null}
							</div>
						</CardBody>
					</Card>
				) : null}

				{phase === "payment" && invoice ? (
					<Card
						corners
						tone="accent"
					>
						<CardHeader title={dict.topup.paymentTitle} />
						<CardBody className="flex flex-col gap-4">
							{isDemoBuild ? (
								<Alert
									tone="info"
									title={dict.topup.simulateNotice}
								>
									{dict.topup.paymentBody}
								</Alert>
							) : null}

							{/* Two columns on desktop: bill on the left, QR on the right.
							    The amount is the single hero figure; the rest hangs off
							    a receipt-style rule list with a status pill and a
							    reference. On phones the QR comes first because scanning
							    is the action; the bill reads directly below it. */}
							<div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
								<div className="order-2 flex lg:order-1">
									<div className="surface-sweep relative flex h-full w-full flex-col overflow-hidden rounded-md border border-border bg-bg">
										<PanelDecoration
											variant="rings-out"
											className="right-0 -top-6 text-accent/15"
										/>

										{/* Hero band: amount plus a pending pill. */}
										<div className="relative border-b border-border px-5 py-5">
											<div className="flex flex-wrap items-start justify-between gap-3">
												<div className="min-w-0">
													<p className="text-xs font-medium uppercase tracking-wide text-text-muted">{dict.topup.totalDue}</p>
													<p className="tabular mt-1.5 text-4xl font-bold leading-none tracking-tight text-text">{formatCurrency(invoice.amount, "IDR")}</p>
												</div>
												<span className="inline-flex items-center gap-1.5 rounded-full border border-warning-border bg-warning-bg px-2.5 py-1 text-[11px] font-semibold text-warning">
													<Clock
														aria-hidden
														size={11}
													/>
													{dict.topup.lockedAmount}
												</span>
											</div>
											<p className="tabular relative mt-3 text-xs text-text-faint">
												{dict.topup.reference}: {invoice.id}
											</p>
										</div>

										{/* Receipt lines: label left, value right, hairline between. */}
										<dl className="flex flex-1 flex-col px-5 py-2">
											<div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-3">
												<dt className="text-xs text-text-muted">{dict.topup.expiresAt}</dt>
												<dd className="tabular text-sm font-medium text-text">{formatDate(invoice.expiresAt, locale)}</dd>
											</div>
											<div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-3">
												<dt className="text-xs text-text-muted">{dict.topup.purposeLabel}</dt>
												<dd className="text-sm font-medium text-text">{kind === "unlimited" ? dict.topup.kindUnlimited : dict.topup.kindBalance}</dd>
											</div>
											<div className="flex items-center justify-between gap-4 py-3">
												<dt className="text-xs text-text-muted">{dict.topup.maskedKey}</dt>
												<dd className="flex min-w-0 items-center gap-1.5">
													<code className="min-w-0 truncate font-mono text-sm text-text">{snapshot ? snapshot.apiKeyMasked : dict.topup.newKeyPending}</code>
													{snapshot ? (
														<button
															type="button"
															onClick={() => copyValue("masked", snapshot.apiKeyMasked)}
															aria-live="polite"
															title={dict.common.copy}
															className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
														>
															{copied === "masked" ? (
																<Check
																	aria-hidden
																	size={12}
																/>
															) : (
																<Copy
																	aria-hidden
																	size={12}
																/>
															)}
														</button>
													) : null}
												</dd>
											</div>
										</dl>
									</div>
								</div>

								{/* QR column: the code fills the width, and the caption sits
								    on a footer rule so the column ends cleanly instead of
								    trailing off in empty space. */}
								<div className="order-1 flex w-full flex-col overflow-hidden rounded-md border border-dashed border-border-strong bg-bg lg:order-2">
									<p className="border-b border-border px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted">{dict.topup.qrTitle}</p>
									<div className="flex flex-1 items-center justify-center p-4">
										<div className="grid aspect-square w-full grid-cols-21 gap-px rounded bg-white p-2">
											{qrCells(invoice.id).flatMap((row, rowIndex) =>
												row.map((filled, columnIndex) => (
													<span
														key={`${rowIndex}-${columnIndex}`}
														className={cn("block h-full w-full", filled ? "bg-black" : "bg-white")}
													/>
												)),
											)}
										</div>
									</div>
									<p className="border-t border-border px-4 py-3 text-center text-xs leading-relaxed text-text-muted">{dict.topup.qrisScanHint}</p>
								</div>
							</div>

							<p className="text-xs text-text-faint">{dict.topup.pendingNotice}</p>

							<div className="flex flex-col gap-2 sm:grid sm:grid-cols-2">
								<Button
									onClick={confirmPaid}
									className="order-1 sm:order-2"
								>
									{dict.topup.paidButton}
								</Button>
								<Button
									variant="ghost"
									onClick={restart}
									className="order-2 sm:order-1"
								>
									{dict.common.cancel}
								</Button>
							</div>
						</CardBody>
					</Card>
				) : null}

				{phase === "done" && receipt ? (
					<Card>
						<CardHeader title={dict.topup.doneTitle} />
						<CardBody className="flex flex-col gap-4">
							<Alert
								tone="success"
								title={dict.topup.doneTitle}
							>
								{receipt.kind === "unlimited" ? dict.topup.doneUnlimitedBody : dict.topup.doneBody}
							</Alert>

							<dl className="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
								<div>
									<dt className="text-xs text-text-muted">{dict.topup.purposeLabel}</dt>
									<dd className="mt-1 text-base font-medium text-text">{receipt.kind === "unlimited" ? dict.topup.kindUnlimited : dict.topup.kindBalance}</dd>
								</div>
								<div>
									<dt className="text-xs text-text-muted">{dict.common.amount}</dt>
									<dd className="tabular mt-1 text-base font-semibold text-text">{formatCurrency(receipt.amount, "IDR")}</dd>
								</div>
								<div>
									<dt className="text-xs text-text-muted">{dict.topup.reference}</dt>
									<dd className="tabular mt-1 text-base font-medium text-text">{receipt.reference}</dd>
								</div>
							</dl>

							{issuedKey ? (
								<div className="rounded-md border border-warning-border bg-warning-bg p-4">
									<p className="text-sm font-semibold text-warning">{dict.topup.newKeyTitle}</p>
									<p className="mt-1 text-xs text-text-muted">{dict.topup.newKeyWarning}</p>
									{/* One row height for the key, the copy button, and the
                      invoice button: `h-10` on all three. The text sizes stay
                      different, but the boxes lock together. */}
									<div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
										<code className="tabular flex h-10 min-w-0 flex-1 items-center overflow-hidden rounded-md border border-border bg-bg px-3 text-sm text-text sm:rounded-l-md sm:rounded-r-none sm:border-r-0">
											<span className="truncate">{issuedKey}</span>
										</code>
										<button
											type="button"
											onClick={() => copyValue("key", issuedKey)}
											aria-live="polite"
											className={cn("inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors sm:w-auto sm:rounded-none", copied === "key" ? "border-success-border bg-success text-bg-deep" : "border-border bg-bg text-text-muted hover:text-text")}
										>
											{copied === "key" ? (
												<Check
													aria-hidden
													size={13}
												/>
											) : (
												<Copy
													aria-hidden
													size={13}
												/>
											)}
											{copied === "key" ? dict.common.copied : dict.common.copy}
										</button>
										<button
											type="button"
											onClick={() => downloadInvoice(receipt, issuedKey)}
											className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-md border border-border bg-bg px-3 text-xs font-medium text-text-muted transition-colors hover:text-text sm:w-auto sm:rounded-l-none sm:rounded-r-md sm:border-l-0"
										>
											<Download
												aria-hidden
												size={13}
											/>
											{dict.topup.downloadInvoice}
										</button>
									</div>
								</div>
							) : null}

							<div className="grid gap-2 sm:grid-cols-2">
								<Button
									onClick={restart}
									variant="secondary"
								>
									{dict.topup.topupAgain}
								</Button>
								<ButtonLink
									href="/balance"
									variant="primary"
								>
									{dict.topup.viewBalance}
								</ButtonLink>
							</div>
						</CardBody>
					</Card>
				) : null}
			</div>
		</div>
	);
}
