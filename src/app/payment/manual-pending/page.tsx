"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { claimPaymentMade, ApiError } from "@/lib/api";

const BANK_NAME = process.env.NEXT_PUBLIC_BANK_NAME ?? "";
const ACCOUNT_NUMBER = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "";
const ACCOUNT_NAME = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "";

export default function ManualPaymentPendingPage() {
  return (
    <Suspense>
      <ManualPaymentPendingContent />
    </Suspense>
  );
}

function ManualPaymentPendingContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? "";
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!reference) return;
    setLoading(true);
    setError(null);
    try {
      await claimPaymentMade(reference);
      setClaimed(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[80%] md:max-w-[50%] rounded-2xl border border-primary/10 bg-white shadow-lg dark:border-border-dark dark:bg-background-dark-soft">
        <div className="border-b border-primary/10 px-8 py-6 dark:border-border-dark">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-primary">account_balance</span>
            <div>
              <h1 className="text-xl font-black tracking-tight text-charcoal dark:text-white">
                Bank Transfer Payment
              </h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-white/50">
                Complete your payment via bank transfer
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Instructions */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-700/30 dark:bg-amber-900/20">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Please transfer the exact amount to the account below, then click &ldquo;I&rsquo;ve made this payment&rdquo;.
            </p>
          </div>

          {/* Bank details */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-border-dark dark:bg-background-dark-softer overflow-hidden">
            <div className="divide-y divide-slate-200 dark:divide-border-dark">
              {BANK_NAME && (
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">Bank</span>
                  <span className="font-bold text-charcoal dark:text-white">{BANK_NAME}</span>
                </div>
              )}
              {ACCOUNT_NUMBER && (
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">Account Number</span>
                  <span className="font-mono font-bold text-lg text-charcoal dark:text-white">{ACCOUNT_NUMBER}</span>
                </div>
              )}
              {ACCOUNT_NAME && (
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">Account Name</span>
                  <span className="font-bold text-charcoal dark:text-white">{ACCOUNT_NAME}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">Reference</span>
                <span className="font-mono text-sm font-bold text-charcoal dark:text-white">{reference}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-white/50">
            Use your payment reference as the narration/description when making the transfer so it can be matched to your account.
          </p>

          {/* Claim state */}
          {claimed ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-5 text-center dark:border-green-700/30 dark:bg-green-900/20">
              <span className="material-symbols-outlined mb-2 block text-3xl text-green-600 dark:text-green-400">check_circle</span>
              <p className="font-bold text-green-800 dark:text-green-200">Payment confirmed!</p>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                An admin will verify your transfer and activate your registration shortly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}
              <button
                onClick={handleClaim}
                disabled={loading || !reference}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && (
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                )}
                {loading ? "Confirming…" : "I've made this payment"}
              </button>
              <p className="text-center text-xs text-slate-400 dark:text-white/30">
                Only click after you&rsquo;ve completed the bank transfer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
