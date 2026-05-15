"use client";

import { useEffect, useState } from "react";
import type { MarketingSlotKind } from "./CreateMarketingSlotModal";

type Props = {
  open: boolean;
  kind: MarketingSlotKind;
  slotId: string;
  slotTitle: string;
  isSubmitting: boolean;
  onClose: () => void;
  onAssign: (companyId: string) => void;
};

export function AssignCompanyModal({
  open,
  kind,
  slotId,
  slotTitle,
  isSubmitting,
  onClose,
  onAssign,
}: Props) {
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    if (open) setCompanyId("");
  }, [open, slotId]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = companyId.trim();
    if (!id) return;
    onAssign(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
      <div className=" w-full max-w-[80%] md:max-w-[50%] rounded-xl border border-primary/10 bg-white shadow-xl dark:border-border-dark dark:bg-background-dark-soft">
        <div className="border-b border-primary/10 px-6 py-4 dark:border-border-dark">
          <h3 className="text-lg font-black text-charcoal dark:text-white">Assign {kind} slot</h3>
          <p className="text-sm text-slate-600 dark:text-white/60 mt-1 truncate" title={slotTitle}>
            {slotTitle}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-1 break-all">{slotId}</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50 mb-1">
              Company ID
            </label>
            <input
              type="text"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="Paste company ID"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono dark:border-border-dark dark:bg-background-dark dark:text-white"
              required
            />
            <p className="text-xs text-slate-500 mt-2 dark:text-white/50">
              The slot must be available (not reserved). Another company cannot already hold it.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => !isSubmitting && onClose()}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-border-dark dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {isSubmitting ? "Assigning…" : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
