"use client";

import { useEffect, useState } from "react";
import { parseNairaInputToKobo } from "@/lib/api";

export type MarketingSlotKind = "advert" | "branding";

type Props = {
  open: boolean;
  kind: MarketingSlotKind;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    priceKobo: number;
    description: string | null;
    isReserved: boolean;
    imageFile: File;
  }) => void;
};

export function CreateMarketingSlotModal({ open, kind, isSubmitting, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [priceNaira, setPriceNaira] = useState("");
  const [description, setDescription] = useState("");
  const [isReserved, setIsReserved] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setPriceNaira("");
    setDescription("");
    setIsReserved(false);
    setFile(null);
    setLocalError(null);
  };

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setPriceNaira("");
    setDescription("");
    setIsReserved(false);
    setFile(null);
    setLocalError(null);
  }, [open, kind]);

  if (!open) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const t = title.trim();
    if (!t) {
      setLocalError("Title is required.");
      return;
    }
    const kobo = parseNairaInputToKobo(priceNaira);
    if (kobo == null || kobo < 1) {
      setLocalError("Enter a valid price in Naira (e.g. 50000).");
      return;
    }
    if (!file) {
      setLocalError("Upload an image (JPEG/PNG, max 5MB).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError("Image must be 5MB or smaller.");
      return;
    }
    onSubmit({
      title: t,
      priceKobo: kobo,
      description: description.trim() || null,
      isReserved,
      imageFile: file,
    });
  };

  const label = kind === "advert" ? "advert slot" : "branding slot";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
      <div className="w-full max-w-[80%] md:max-w-[50%] rounded-xl border border-primary/10 bg-white shadow-xl dark:border-border-dark dark:bg-background-dark-soft">
        <div className="border-b border-primary/10 px-6 py-4 dark:border-border-dark">
          <h3 className="text-lg font-black text-[#181112] dark:text-white">New {label}</h3>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[min(80vh,640px)] overflow-y-auto">
          {localError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {localError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50 mb-1">
              Price (₦ Naira)
            </label>
            <input
              type="text"
              value={priceNaira}
              onChange={(e) => setPriceNaira(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50 mb-1">
              Image (JPEG/PNG, max 5MB)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-slate-600 dark:text-white/70"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-white/80">
            <input
              type="checkbox"
              checked={isReserved}
              onChange={(e) => setIsReserved(e.target.checked)}
              className="rounded border-slate-300"
            />
            Create as reserved (hold)
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-border-dark dark:text-white dark:hover:bg-background-dark-softer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating…" : "Create slot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
