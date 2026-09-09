"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminElectionsAudit, downloadElectionsAuditTxt } from "@/lib/api";

const PAGE_SIZE = 50;

const TYPE_ICON: Record<string, string> = {
  VOTE_CAST: "how_to_vote",
  CANDIDATE_CREATED: "person_add",
  CANDIDATE_UPDATED: "edit",
  CANDIDATE_DELETED: "person_remove",
  POSITION_CREATED: "playlist_add",
  POSITION_UPDATED: "edit_note",
  POSITION_DELETED: "playlist_remove",
  VOTING_OPENED: "lock_open",
  VOTING_CLOSED: "lock",
  DATA_RESET: "warning",
};

export default function ElectionsAuditPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "elections", "audit", page],
    queryFn: () => getAdminElectionsAudit({ page, limit: PAGE_SIZE }),
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
              <span>Audit Log</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-charcoal dark:text-white">
              Election Audit Log
            </h1>
            <p className="text-xs text-slate-500 dark:text-white/50">
              {data
                ? `${data.total.toLocaleString()} event${data.total !== 1 ? "s" : ""} — `
                : ""}
              permanent record of votes cast and admin actions. Never cleared, not even by a data reset.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadElectionsAuditTxt}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 sm:w-auto"
          >
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Export .txt
          </button>
        </div>

        {/* Log feed */}
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-background-dark-soft">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="h-5 animate-pulse rounded bg-slate-100 dark:bg-white/5"
                />
              ))}
            </div>
          ) : !data?.data.length ? (
            <p className="py-12 text-center text-sm text-slate-400 dark:text-white/30">
              No activity recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 font-mono text-xs dark:divide-white/5">
              {data.data.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <span
                    className={`material-symbols-outlined mt-0.5 shrink-0 text-[16px] ${
                      event.type === "DATA_RESET"
                        ? "text-red-500"
                        : event.type === "VOTE_CAST"
                        ? "text-green-500"
                        : "text-slate-400 dark:text-white/40"
                    }`}
                  >
                    {TYPE_ICON[event.type] ?? "info"}
                  </span>
                  <span className="whitespace-pre-wrap break-all text-slate-700 dark:text-white/70">
                    {event.line}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-white/60"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500 dark:text-white/50">
              Page {page} of {data.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-white/60"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
