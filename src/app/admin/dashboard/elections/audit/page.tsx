"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminElectionsAudit, downloadElectionsAuditCsv } from "@/lib/api";

const PAGE_SIZE = 50;

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
              Vote Audit Log
            </h1>
            {data && (
              <p className="text-xs text-slate-500 dark:text-white/50">
                {data.total.toLocaleString()} total vote
                {data.total !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={downloadElectionsAuditCsv}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 sm:w-auto"
          >
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                <tr>
                  {[
                    "Voter",
                    "Position",
                    "Candidate",
                    "Voted At",
                    "IP Address",
                    "User Agent",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/40"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {isLoading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !data?.data.length ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400 dark:text-white/30"
                    >
                      No votes recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.data.map((vote) => (
                    <tr
                      key={vote.id}
                      className="bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-charcoal dark:text-white">
                          {vote.voterName}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-white/30">
                          {vote.voterEmail}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                        {vote.positionTitle}
                      </td>
                      <td className="px-4 py-3 font-semibold text-charcoal dark:text-white">
                        {vote.candidateName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-white/50">
                        {new Date(vote.votedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400 dark:text-white/30">
                        {vote.ipAddress ?? "—"}
                      </td>
                      <td
                        className="truncate px-4 py-3 text-xs text-slate-400 dark:text-white/30"
                        title={vote.userAgent ?? undefined}
                      >
                        {vote.userAgent ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
