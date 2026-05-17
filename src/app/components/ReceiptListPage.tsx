"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyReceipts,
  getAllReceiptsAdmin,
  printReceiptById,
  adminVerifyManualPayment,
  adminRefundPayment,
  formatKoboToNaira,
  ApiError,
  type ReceiptData,
  type ReceiptLineItem,
} from "@/lib/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const KIND_LABELS: Record<string, string> = {
  registration: "Registration",
  order: "Order",
  booth: "Booth",
  hotel_room: "Hotel Room",
  sponsorship_plan: "Sponsorship",
  masterclass: "Masterclass",
  panel: "Panel",
  presentation: "Presentation",
  advert_slot: "Advert Slot",
  branding_slot: "Branding Slot",
};

const KIND_COLORS: Record<string, string> = {
  registration: "bg-blue-50 text-blue-700 border-blue-200",
  order: "bg-purple-50 text-purple-700 border-purple-200",
  booth: "bg-amber-50 text-amber-700 border-amber-200",
  hotel_room: "bg-cyan-50 text-cyan-700 border-cyan-200",
  sponsorship_plan: "bg-yellow-50 text-yellow-700 border-yellow-200",
  masterclass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  panel: "bg-pink-50 text-pink-700 border-pink-200",
  presentation: "bg-pink-50 text-pink-700 border-pink-200",
  advert_slot: "bg-rose-50 text-rose-700 border-rose-200",
  branding_slot: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  refunded: "bg-slate-50 text-slate-600 border-slate-200",
};

const STATUS_ICONS: Record<string, string> = {
  success: "check_circle",
  failed: "cancel",
  pending: "schedule",
  refunded: "replay",
};

function hasBundleAllocations(a: ReceiptLineItem["bundleAllocations"] | undefined): boolean {
  if (!a) return false;
  if (a.booth) return true;
  if (a.masterclass) return true;
  if (a.presentation) return true;
  if (a.advertSlots && a.advertSlots.length > 0) return true;
  if (a.brandingSlots && a.brandingSlots.length > 0) return true;
  return false;
}

function KindBadge({ kind }: { kind: string }) {
  const color = KIND_COLORS[kind] ?? "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${color}`}>
      {KIND_LABELS[kind] ?? kind}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "bg-slate-50 text-slate-600 border-slate-200";
  const icon = STATUS_ICONS[status] ?? "info";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${color}`}>
      <span className="material-symbols-outlined text-xs">{icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function ReceiptDetail({ receipt }: { receipt: ReceiptData }) {
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  const handlePrint = async () => {
    setPrinting(true);
    setPrintError(null);
    try {
      await printReceiptById(receipt.id);
    } catch (err) {
      setPrintError(err instanceof ApiError ? err.message : "Failed to open receipt.");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="border-t border-primary/10 bg-primary/5 px-4 py-4 dark:border-border-dark dark:bg-background-dark-softer sm:px-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
              Reference
            </p>
            <p className="mt-0.5 font-mono text-xs text-charcoal dark:text-white">
              {receipt.reference}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
              Provider
            </p>
            <p className="mt-0.5 font-semibold capitalize text-charcoal dark:text-white">
              {receipt.provider}
            </p>
          </div>
          {receipt.paidAt && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
                Paid At
              </p>
              <p className="mt-0.5 text-charcoal dark:text-white">
                {new Date(receipt.paidAt).toLocaleString("en-NG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          )}
        </div>

        {receipt.items.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
              Items
            </p>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left dark:border-border-dark dark:bg-background-dark-softer">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                  {receipt.items.map((item: ReceiptLineItem, i: number) => {
                    const alloc = item.bundleAllocations;
                    const showAllocated = hasBundleAllocations(alloc);

                    return (
                      <tr key={i} className="align-top">
                        <td className="px-4 py-3">
                          <p className="font-bold text-charcoal dark:text-white">
                            {item.title}
                          </p>
                          {showAllocated && alloc ? (
                            <div className="mt-1.5 space-y-0.5 text-xs text-slate-500 dark:text-white/50">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">
                                Allocated
                              </p>
                              {alloc.booth && (
                                <p>
                                  Booth: {alloc.booth.name} ({alloc.booth.tier})
                                </p>
                              )}
                              {alloc.masterclass && (
                                <p>
                                  Masterclass: {alloc.masterclass.title} ·{" "}
                                  {alloc.masterclass.duration} on {alloc.masterclass.day}
                                </p>
                              )}
                              {alloc.presentation && (
                                <p>
                                  Presentation: {alloc.presentation.title} ·{" "}
                                  {alloc.presentation.duration} on {alloc.presentation.day}
                                </p>
                              )}
                              {alloc.advertSlots?.map((s, si) => (
                                <p key={si}>Ad slot: {s.title}</p>
                              ))}
                              {alloc.brandingSlots?.map((s, si) => (
                                <p key={si}>Branding slot: {s.title}</p>
                              ))}
                            </div>
                          ) : item.bundlePerks && item.bundlePerks.length > 0 ? (
                            <div className="mt-1.5">
                              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">
                                Packages included
                              </p>
                              <ul className="space-y-0.5">
                                {item.bundlePerks.map((perk, pi) => (
                                  <li
                                    key={pi}
                                    className="flex items-start gap-1 text-xs text-slate-500 dark:text-white/50"
                                  >
                                    <span className="material-symbols-outlined mt-0.5 text-xs text-green-500">
                                      check
                                    </span>
                                    {perk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-white/70">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-white/70">
                          {formatKoboToNaira(item.unitPriceKobo)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-charcoal dark:text-white">
                          {formatKoboToNaira(item.totalKobo)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t border-slate-200 bg-slate-50 dark:border-border-dark dark:bg-background-dark-softer">
                  {receipt.totalAmountKobo !== receipt.baseAmountKobo && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-right text-xs text-slate-500 dark:text-white/50"
                      >
                        Subtotal
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-slate-600 dark:text-white/70">
                        {formatKoboToNaira(receipt.baseAmountKobo)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50"
                    >
                      Total
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-black text-charcoal dark:text-white">
                      {formatKoboToNaira(receipt.totalAmountKobo)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handlePrint}
            disabled={printing}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-border-dark dark:bg-background-dark-soft dark:text-white dark:hover:bg-background-dark-softer sm:w-auto"
          >
            <span
              className={`material-symbols-outlined text-base ${
                printing ? "animate-spin" : ""
              }`}
            >
              {printing ? "progress_activity" : "print"}
            </span>
            {printing ? "Opening…" : "Print Receipt"}
          </button>
          {printError && (
            <p className="text-xs text-red-700 dark:text-red-300">{printError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main list component ──────────────────────────────────────────────────────

interface ReceiptListPageProps {
  /** If true, calls /api/receipts/admin and shows the User column */
  isAdmin?: boolean;
  /** Tailwind accent class for active filter pills, defaults to primary */
  accent?: "primary" | "secondary";
  /** If true, hides the page title header (useful when parent provides its own header) */
  hideHeader?: boolean;
}

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
] as const;

export function ReceiptListPage({ isAdmin = false, accent = "primary", hideHeader = false }: ReceiptListPageProps) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [verifyingRef, setVerifyingRef] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [refundingRef, setRefundingRef] = useState<string | null>(null);
  const [refundNotice, setRefundNotice] = useState<{ kind: "success" | "warning" | "error"; message: string } | null>(null);
  const PAGE_SIZE = 20;

  const handleVerifyPayment = async (reference: string) => {
    setVerifyingRef(reference);
    setVerifyError(null);
    try {
      await adminVerifyManualPayment(reference);
      await queryClient.invalidateQueries({ queryKey: ["receipts"] });
    } catch (e) {
      setVerifyError(e instanceof ApiError ? e.message : "Failed to verify payment.");
    } finally {
      setVerifyingRef(null);
    }
  };

  const handleRefundPayment = async (reference: string) => {
    const ok = typeof window === "undefined"
      ? true
      : window.confirm(
          `Refund payment ${reference}?\n\nThis will request a Paystack refund and reverse all inventory (booths, slots, sessions, registration, etc.) tied to this payment. This cannot be undone.`,
        );
    if (!ok) return;
    setRefundingRef(reference);
    setRefundNotice(null);
    try {
      const result = await adminRefundPayment(reference);
      await queryClient.invalidateQueries({ queryKey: ["receipts"] });
      if (!result.paystackRefunded && result.errors.length > 0) {
        setRefundNotice({
          kind: "error",
          message: `Refund marked, but Paystack refund failed AND ${result.errors.length} asset(s) failed to reverse: ${result.errors.join("; ")}`,
        });
      } else if (!result.paystackRefunded) {
        setRefundNotice({
          kind: "warning",
          message: "Inventory reversed and payment marked refunded, but Paystack refund call failed — verify the refund manually in your Paystack dashboard.",
        });
      } else if (result.errors.length > 0) {
        setRefundNotice({
          kind: "warning",
          message: `Refund succeeded but ${result.errors.length} asset(s) failed to reverse cleanly: ${result.errors.join("; ")}`,
        });
      } else {
        setRefundNotice({ kind: "success", message: "Payment refunded and all inventory reversed." });
      }
    } catch (e) {
      setRefundNotice({
        kind: "error",
        message: e instanceof ApiError ? e.message : "Failed to refund payment.",
      });
    } finally {
      setRefundingRef(null);
    }
  };

  const queryFn = isAdmin ? getAllReceiptsAdmin : getMyReceipts;

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["receipts", isAdmin ? "admin" : "mine", statusFilter, kindFilter, page],
    queryFn: () =>
      queryFn({
        page,
        pageSize: PAGE_SIZE,
        status: statusFilter || undefined,
        kind: kindFilter || undefined,
      }),
    staleTime: 30_000,
  });

  const accentActive =
    accent === "secondary"
      ? "bg-secondary text-white border-secondary"
      : "bg-primary text-white border-primary";

  return (
    <div>
      {/* Header */}
      {!hideHeader && (
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-charcoal dark:text-white">Payment History</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
            {isAdmin ? "All payments across all accounts." : "Your transaction receipts and payment history."}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`rounded-lg border px-4 py-2 text-xs font-bold transition-colors ${
                statusFilter === f.value
                  ? accentActive
                  : `border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-border-dark dark:text-white/70 dark:hover:bg-background-dark-softer`
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Kind selector */}
        <select
          value={kindFilter}
          onChange={(e) => { setKindFilter(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-slate-200 bg-background-light px-4 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white sm:ml-auto sm:w-auto"
        >
          <option value="">All Types</option>
          {Object.entries(KIND_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isPending && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/5 bg-white px-6 py-10 text-slate-400 shadow-sm dark:border-border-dark dark:bg-background-dark-soft dark:text-white/50">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading receipts…
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center shadow-sm dark:border-red-900/40 dark:bg-red-950/30">
          <span className="material-symbols-outlined mb-2 block text-3xl text-red-400">error</span>
          <p className="font-bold text-red-700 dark:text-red-200">
            {error instanceof ApiError ? error.message : "Failed to load receipts."}
          </p>
        </div>
      )}

      {/* Empty */}
      {!isPending && !isError && data?.data.length === 0 && (
        <div className="rounded-xl border border-primary/5 bg-white px-6 py-12 text-center shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <span className="material-symbols-outlined mb-3 block text-4xl text-slate-300 dark:text-white/20">receipt_long</span>
          <p className="font-bold text-slate-600 dark:text-white/70">No receipts found</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
            {statusFilter || kindFilter ? "Try adjusting your filters." : "Your payment history will appear here."}
          </p>
        </div>
      )}

      {/* Verify error */}
      {verifyError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {verifyError}
        </div>
      )}

      {/* Refund notice */}
      {refundNotice && (
        <div
          className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
            refundNotice.kind === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300"
              : refundNotice.kind === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          <span>{refundNotice.message}</span>
          <button
            onClick={() => setRefundNotice(null)}
            className="material-symbols-outlined text-base opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            close
          </button>
        </div>
      )}

      {/* Table */}
      {data && data.data.length > 0 && (
        <div className="rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 text-left dark:border-border-dark dark:bg-background-dark-softer">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Reference</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Type</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">User</th>}
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Date</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 dark:divide-border-dark">
                {data.data.map((receipt: ReceiptData) => (
                  <>
                    <tr
                      key={receipt.id}
                      className={`transition-colors hover:bg-primary/5 dark:hover:bg-background-dark-softer ${
                        expandedId === receipt.id ? "bg-primary/5 dark:bg-background-dark-softer" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-600 dark:text-white/70">{receipt.reference}</span>
                      </td>
                      <td className="px-6 py-4">
                        <KindBadge kind={receipt.kind} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={receipt.status} />
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <p className="font-bold text-charcoal dark:text-white">{receipt.user.name || receipt.user.email}</p>
                          <p className="text-xs text-slate-500 dark:text-white/50">{receipt.user.regType}</p>
                        </td>
                      )}
                      <td className="px-6 py-4 text-right font-bold text-charcoal dark:text-white">
                        {formatKoboToNaira(receipt.totalAmountKobo)}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-white/70">
                        {new Date(receipt.paidAt ?? receipt.createdAt).toLocaleDateString("en-NG", {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && receipt.provider === "manual" && receipt.status === "pending" && (
                            <button
                              onClick={() => handleVerifyPayment(receipt.reference)}
                              disabled={verifyingRef === receipt.reference}
                              className="flex items-center gap-1 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800 hover:bg-green-100 disabled:opacity-50 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30"
                            >
                              <span className={`material-symbols-outlined text-sm ${verifyingRef === receipt.reference ? "animate-spin" : ""}`}>
                                {verifyingRef === receipt.reference ? "progress_activity" : "check_circle"}
                              </span>
                              {verifyingRef === receipt.reference ? "Verifying…" : "Verify"}
                            </button>
                          )}
                          {isAdmin && receipt.status === "success" && (
                            <button
                              onClick={() => handleRefundPayment(receipt.reference)}
                              disabled={refundingRef === receipt.reference}
                              className="flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-800 hover:bg-red-100 disabled:opacity-50 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                            >
                              <span className={`material-symbols-outlined text-sm ${refundingRef === receipt.reference ? "animate-spin" : ""}`}>
                                {refundingRef === receipt.reference ? "progress_activity" : "currency_exchange"}
                              </span>
                              {refundingRef === receipt.reference ? "Refunding…" : "Refund"}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setExpandedId(expandedId === receipt.id ? null : receipt.id)
                            }
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-border-dark dark:text-white/90 dark:hover:bg-background-dark-softer"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {expandedId === receipt.id ? "expand_less" : "expand_more"}
                            </span>
                            {expandedId === receipt.id ? "Hide" : "Details"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === receipt.id && (
                      <tr key={`${receipt.id}-detail`}>
                        <td colSpan={isAdmin ? 7 : 6} className="p-0">
                          <ReceiptDetail receipt={receipt} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-primary/10 bg-primary/5 px-4 py-4 dark:border-border-dark dark:bg-background-dark-softer sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-500 dark:text-white/50">
                {data.pagination.total} receipt{data.pagination.total !== 1 ? "s" : ""} ·{" "}
                Page {data.pagination.page} of {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-dark dark:text-white/90 dark:hover:bg-background-dark-soft"
                >
                  Previous
                </button>
                <button
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-dark dark:text-white/90 dark:hover:bg-background-dark-soft"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
