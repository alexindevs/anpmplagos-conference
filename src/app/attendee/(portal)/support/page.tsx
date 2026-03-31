"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getMyRegistration, getMySupportTickets } from "@/lib/api";
import { supportCategoryLabel, supportStatusLabel } from "@/lib/support-ticket-labels";
import { AttendeePortalShell } from "../../components/AttendeePortalShell";

export default function AttendeeSupportPage() {
  const { data: user } = useAuthSession();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: registration } = useQuery({
    queryKey: ["member", "registration"],
    queryFn: getMyRegistration,
    enabled: !!user,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["support", "my-tickets", page, pageSize],
    queryFn: () => getMySupportTickets({ page, pageSize }),
    enabled: Boolean(user),
  });

  const profile = registration?.member || registration?.attendee;
  const fullName = profile?.fullName || user?.member?.fullName || user?.attendee?.fullName || "Attendee";
  const userId = user?.id || "";
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  return (
    <AttendeePortalShell userId={userId} fullName={fullName}>
      <header className="sticky top-0 z-10 border-b border-primary/15 bg-background-light/95 px-4 py-5 backdrop-blur sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="border-l-4 border-primary pl-4">
            <h1 className="text-2xl font-black text-charcoal">Support</h1>
            <p className="mt-1 text-sm text-slate-600">
              Send a message to the conference team and track replies here.
            </p>
          </div>
          <Link
            href="/attendee/support/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:brightness-110 sm:w-auto"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New request
          </Link>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-primary/20 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-primary/15 bg-slate-50/90">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Subject</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Topic</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {isLoading && (
                  <tr>
                    <td className="px-4 py-8 text-slate-500" colSpan={5}>
                      Loading your requests…
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className="px-4 py-8 text-red-700" colSpan={5}>
                      Unable to load support requests. Please try again later.
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && (data?.items?.length ?? 0) === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-600" colSpan={5}>
                      You have not submitted any requests yet. Use &quot;New request&quot; to contact the team.
                    </td>
                  </tr>
                )}
                {(data?.items ?? []).map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-primary/5">
                    <td className="px-4 py-3 font-semibold text-charcoal">{row.title}</td>
                    <td className="px-4 py-3 text-slate-600">{supportCategoryLabel(row.category)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          row.status === "answered"
                            ? "bg-primary/15 text-primary"
                            : row.status === "open"
                              ? "bg-amber-50 text-amber-900"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {supportStatusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(row.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/attendee/support/${row.id}`}
                        className="text-sm font-bold text-primary hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(data?.total ?? 0) > pageSize && (
            <div className="flex items-center justify-between border-t border-primary/15 bg-slate-50/80 px-4 py-3">
              <p className="text-sm text-slate-600">
                Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold disabled:opacity-40"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AttendeePortalShell>
  );
}
