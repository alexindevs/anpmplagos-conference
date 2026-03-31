"use client";

import { useEffect, useRef } from "react";

type AddRoomSlotsModalProps = {
  open: boolean;
  onClose: () => void;
  isSubmitting?: boolean;
  onSubmit: (data: { hotel: string; roomLabel: string; quantity: number; price: string; notes: string }) => void;
};

export function AddRoomSlotsModal({ open, onClose, isSubmitting, onSubmit }: AddRoomSlotsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose, isSubmitting]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (isSubmitting) return;
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    onSubmit({
      hotel: (fd.get("hotel") as string) || "",
      roomLabel: (fd.get("roomLabel") as string) || "",
      quantity: parseInt((fd.get("quantity") as string) || "1", 10) || 1,
      price: (fd.get("price") as string) || "",
      notes: (fd.get("notes") as string) || "",
    });
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-room-slots-title"
        className=" w-full max-w-[80%] md:max-w-[50%] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-border-dark dark:bg-background-dark-soft"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-border-dark">
          <h3 id="add-room-slots-title" className="text-lg font-bold text-[#181112] dark:text-white">
            Add hotel room slots
          </h3>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-background-dark-softer dark:hover:text-white/70 disabled:opacity-50"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="hotel"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-white/70"
            >
              Hotel
            </label>
            <input
              id="hotel"
              name="hotel"
              type="text"
              required
              defaultValue="Welcome Hotel"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[#181112] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="roomLabel"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-white/70"
            >
              Room type / label
            </label>
            <input
              id="roomLabel"
              name="roomLabel"
              type="text"
              required
              placeholder="e.g. Standard Double, Deluxe Suite"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[#181112] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="quantity"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-white/70"
            >
              Number of slots
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              required
              defaultValue={1}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[#181112] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="price"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-white/70"
            >
              Price per room (₦)
            </label>
            <input
              id="price"
              name="price"
              type="text"
              required
              placeholder="e.g. 120000"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[#181112] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="notes"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-white/70"
            >
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="e.g. Partner hotel – Lagos Grande"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[#181112] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60"
            >
              {isSubmitting ? "Creating…" : "Add slots"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-border-dark dark:bg-background-dark-softer dark:text-white/70 dark:hover:bg-background-dark disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
