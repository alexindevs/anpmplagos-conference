"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminSupportTickets } from "@/lib/api";
import { supportCategoryLabel, supportStatusLabel } from "@/lib/support-ticket-labels";

function regTypeLabel(reg: string): string {
  switch (reg) {
    case "company":
      return "Company";
    case "member":
      return "Member";
    case "attendee":
      return "Attendee";
    case "admin":
      return "Admin";
    default:
      return reg;
  }
}

export default function AdminSupportTicketsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "support", "tickets", page, pageSize],
    queryFn: () => getAdminSupportTickets({ page, pageSize }),
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#181112] dark:text-white">Support requests</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
            Review messages from companies and other attendees and send replies.
          </p>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        <div className="overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 dark:border-border-dark dark:bg-background-dark-softer">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    From
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Topic
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Open
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 dark:divide-border-dark">
                {isLoading && (
                  <tr>
                    <td className="px-4 py-8 text-slate-500 dark:text-white/50" colSpan={6}>
                      Loading requests…
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className="px-4 py-8 text-primary" colSpan={6}>
                      Unable to load support requests.
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && (data?.items?.length ?? 0) === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-500 dark:text-white/50" colSpan={6}>
                      No support requests yet.
                    </td>
                  </tr>
                )}
                {(data?.items ?? []).map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-primary/5 dark:hover:bg-background-dark-softer"
                  >
                    <td className="px-4 py-3 font-semibold text-[#181112] dark:text-white">{row.title}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#181112] dark:text-white/90">{row.submitterDisplayName}</p>
                      <p className="text-xs text-slate-500 dark:text-white/50">{row.submitterEmail}</p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
                        {regTypeLabel(row.submitterRegType)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                      {supportCategoryLabel(row.category)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          row.status === "answered"
                            ? "bg-secondary/15 text-secondary dark:bg-secondary/25"
                            : row.status === "open"
                              ? "bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
                              : "bg-slate-100 text-slate-700 dark:bg-background-dark-softer dark:text-white/80"
                        }`}
                      >
                        {supportStatusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                      {new Date(row.createdAt).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/dashboard/support/${row.id}`}
                        className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200 dark:bg-background-dark-softer dark:text-white dark:hover:bg-background-dark"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(data?.total ?? 0) > pageSize && (
            <div className="flex items-center justify-between bg-primary/5 px-4 py-3 dark:bg-background-dark-softer">
              <p className="text-sm text-slate-500 dark:text-white/50">
                Page <span className="font-bold text-slate-700 dark:text-white/70">{page}</span> of{" "}
                <span className="font-bold text-slate-700 dark:text-white/70">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded p-1 transition-colors hover:bg-white disabled:opacity-50 dark:hover:bg-background-dark-soft"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  type="button"
                  className="rounded p-1 transition-colors hover:bg-white disabled:opacity-50 dark:hover:bg-background-dark-soft"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
