"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  adminCreateBooth,
  ApiError,
  BOOTH_TIER_OPTIONS,
  parseNairaInputToKobo,
  type BoothTier,
} from "@/lib/api";

export default function AddNewBoothPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [tier, setTier] = useState<BoothTier>(BOOTH_TIER_OPTIONS[0]);
  const [size, setSize] = useState("");
  const [priceNaira, setPriceNaira] = useState("");
  const [description, setDescription] = useState("");
  const [reserveOnCreate, setReserveOnCreate] = useState(false);
  const [boothImageFile, setBoothImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!boothImageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(boothImageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [boothImageFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const priceKobo = parseNairaInputToKobo(priceNaira);
    if (priceKobo == null || priceKobo <= 0) {
      setError("Enter a valid price in naira (numbers only).");
      setSubmitting(false);
      return;
    }
    try {
      await adminCreateBooth({
        name: title.trim(),
        size: size.trim(),
        tier,
        price: priceKobo,
        description: description || null,
        isReserved: reserveOnCreate || undefined,
        boothImageFile: boothImageFile ?? undefined,
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "booths"] });
      router.push("/admin/dashboard/booths");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Unable to create booth. Please try again.");
      } else {
        setError("Unable to create booth. Please try again.");
      }
      setSubmitting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#181112] dark:text-slate-100">
              Add New Booth
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create a new booth for the conference floor
            </p>
          </div>
          <Link
            href="/admin/dashboard/booths"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-border-dark dark:bg-background-dark-soft dark:text-slate-200 dark:hover:bg-background-dark"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Booths
          </Link>
        </div>
      </header>

      <div className="bg-background-light p-4 dark:bg-background-dark sm:p-6 lg:p-8">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft"
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="booth-title"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Title
              </label>
              <input
                id="booth-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Premium corner booth A-12"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[#181112] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-slate-100"
              />
            </div>
            <div>
              <label
                htmlFor="booth-tier"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Tier
              </label>
              <select
                id="booth-tier"
                required
                value={tier}
                onChange={(e) => setTier(e.target.value as BoothTier)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[#181112] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-slate-100"
              >
                {BOOTH_TIER_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="size"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Size
              </label>
              <input
                id="size"
                type="text"
                required
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 3m × 3m, 9 sqm"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[#181112] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-slate-100"
              />
            </div>
            <div>
              <label
                htmlFor="priceNaira"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Price (₦)
              </label>
              <input
                id="priceNaira"
                type="text"
                required
                inputMode="decimal"
                value={priceNaira}
                onChange={(e) => setPriceNaira(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[#181112] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-slate-100"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Near main entrance"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[#181112] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-slate-100"
              />
            </div>
            <div>
              <label
                htmlFor="boothImage"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Booth image (optional)
              </label>
              <input
                id="boothImage"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-bold file:text-primary hover:file:bg-primary/15 dark:text-slate-300"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setBoothImageFile(f);
                }}
              />
              {imagePreviewUrl && (
                <div className="relative mt-3 h-40 w-full max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-border-dark dark:bg-background-dark-softer">
                  <Image
                    src={imagePreviewUrl}
                    alt="Booth preview"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
              )}
              {boothImageFile && (
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-primary hover:underline"
                  onClick={() => {
                    setBoothImageFile(null);
                    const input = document.getElementById("boothImage") as HTMLInputElement | null;
                    if (input) input.value = "";
                  }}
                >
                  Remove image
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-border-dark dark:bg-background-dark-softer dark:text-slate-200">
              <input
                id="reserveOnCreate"
                type="checkbox"
                checked={reserveOnCreate}
                onChange={(e) => setReserveOnCreate(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40"
              />
              <label htmlFor="reserveOnCreate" className="cursor-pointer">
                Reserve this booth immediately (mark as reserved)
              </label>
            </div>
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Create Booth"}
            </button>
            <Link
              href="/admin/dashboard/booths"
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-border-dark dark:bg-background-dark-softer dark:text-slate-200 dark:hover:bg-background-dark"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
