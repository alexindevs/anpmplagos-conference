"use client";

import { getAutomaticCheckoutDiscountPercent } from "@/lib/automatic-checkout-discount";

export function AutomaticCheckoutDiscountNote({ className = "" }: { className?: string }) {
  const pct = getAutomaticCheckoutDiscountPercent();
  if (pct <= 0) return null;
  const y = new Date().getFullYear();
  const endLabel = pct === 10 ? `May 31, ${y}` : `June 30, ${y}`;
  return (
    <div
      className={`rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-100 ${className}`}
    >
      <span className="font-bold">{pct}%</span> off at checkout on booths, sponsorship plans, and conference
      registration tickets through <span className="font-semibold">{endLabel}</span>.
    </div>
  );
}
