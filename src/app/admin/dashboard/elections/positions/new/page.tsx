"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPosition } from "@/lib/api";
import { toast } from "sonner";

export default function NewPositionPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");

  const mutation = useMutation({
    mutationFn: () =>
      createPosition({
        title: title.trim(),
        description: description.trim() || undefined,
        order: Number(order) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "elections", "positions"] });
      toast.success("Position created.");
      router.push("/admin/dashboard/elections/positions");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    mutation.mutate();
  };

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="w-full space-y-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-white/50">
          <Link href="/admin/dashboard/elections" className="hover:text-primary">
            Elections
          </Link>
          <span>/</span>
          <Link
            href="/admin/dashboard/elections/positions"
            className="hover:text-primary"
          >
            Positions
          </Link>
          <span>/</span>
          <span>New</span>
        </div>

        <h1 className="text-2xl font-bold text-[#181112] dark:text-white">
          New Position
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-background-dark-soft sm:p-6"
        >
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-white/80">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. President"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#181112] placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/30"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-white/80">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional description of this position…"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#181112] placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/30"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-white/80">
              Display Order
            </label>
            <input
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#181112] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white sm:w-32"
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-white/30">
              Lower numbers appear first.
            </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Link
              href="/admin/dashboard/elections/positions"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white/60 sm:w-auto"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
            >
              {mutation.isPending ? "Creating…" : "Create Position"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
