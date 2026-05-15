"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listAdminPositions,
  deletePosition,
  updatePosition,
  type AdminPositionWithCounts,
} from "@/lib/api";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

export default function ElectionsPositionsPage() {
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<AdminPositionWithCounts | null>(null);

  const { data: positions, isLoading } = useQuery({
    queryKey: ["admin", "elections", "positions"],
    queryFn: listAdminPositions,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePosition(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "elections"] });
      toast.success("Position deleted.");
      setConfirmDelete(null);
    },
    onError: (err: Error) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete position.");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updatePosition(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "elections", "positions"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/50">
              <Link href="/admin/dashboard/elections" className="hover:text-primary">
                Elections
              </Link>
              <span>/</span>
              <span>Positions</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-charcoal dark:text-white">
              Positions &amp; Candidates
            </h1>
          </div>
          <Link
            href="/admin/dashboard/elections/positions/new"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 sm:w-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Position
          </Link>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
            ))}
          </div>
        ) : !positions?.length ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center dark:border-white/10">
            <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-white/20">
              ballot
            </span>
            <p className="mt-3 font-medium text-slate-500 dark:text-white/50">
              No positions yet
            </p>
            <Link
              href="/admin/dashboard/elections/positions/new"
              className="mt-4 inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add your first position
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((pos) => (
              <div
                key={pos.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-background-dark-soft sm:flex-row sm:items-center"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    how_to_vote
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-charcoal dark:text-white">
                    {pos.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-white/50">
                    {pos._count.candidates} candidate{pos._count.candidates !== 1 ? "s" : ""} ·{" "}
                    {pos._count.votes} vote{pos._count.votes !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Active badge */}
                <button
                  type="button"
                  onClick={() =>
                    toggleActiveMutation.mutate({ id: pos.id, isActive: !pos.isActive })
                  }
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    pos.isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-white/40"
                  }`}
                >
                  {pos.isActive ? "Active" : "Inactive"}
                </button>

                <div className="flex flex-wrap gap-2 sm:ml-auto sm:justify-end">
                  <Link
                    href={`/admin/dashboard/elections/positions/${pos.id}`}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-primary/30 hover:text-primary dark:border-white/10 dark:text-white/60"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(pos)}
                    className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/40 p-4 sm:items-center">
          <div className="mb-4 w-full rounded-2xl bg-white p-5 shadow-xl sm:mb-0 sm:w-11/12 lg:w-8/12 xl:w-5/12 dark:bg-background-dark-soft">
            <h2 className="text-lg font-bold text-charcoal dark:text-white">
              Delete position?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
              <strong>{confirmDelete.title}</strong> has{" "}
              <strong>{confirmDelete._count.votes}</strong> vote
              {confirmDelete._count.votes !== 1 ? "s" : ""}. This action
              {confirmDelete._count.votes > 0
                ? " will be blocked because votes have already been cast."
                : " cannot be undone."}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white/60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
