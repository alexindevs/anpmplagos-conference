"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getMySupportTickets } from "@/lib/api";
import { isCompanyRegType } from "@/lib/auth-api";
import { supportCategoryLabel, supportStatusLabel } from "@/lib/support-ticket-labels";

export default function CompanySupportPage() {
  const router = useRouter();
  const { data: user, isPending: userLoading } = useAuthSession();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (!userLoading && (!user || !isCompanyRegType(user))) {
      router.replace("/");
    }
  }, [user, userLoading, router]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["support", "my-tickets", page, pageSize],
    queryFn: () => getMySupportTickets({ page, pageSize }),
    enabled: Boolean(user && isCompanyRegType(user)),
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  if (userLoading || !user || !isCompanyRegType(user)) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="size-10 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-secondary/15 bg-background-light/95 px-4 py-5 backdrop-blur sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="border-l-4 border-secondary pl-4">
            <h1 className="text-2xl font-black text-[#181112]">Support</h1>
            <p className="mt-1 text-sm text-slate-600">
              Send a message to the conference team and track replies here.
            </p>
          </div>
          <Link
            href="/company/support/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-colors hover:brightness-110 sm:w-auto"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New request
          </Link>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-secondary/20 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-secondary/15 bg-slate-50/90">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Subject</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Topic</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
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
                  <tr key={row.id} className="transition-colors hover:bg-secondary/5">
                    <td className="px-4 py-3 font-semibold text-[#181112]">{row.title}</td>
                    <td className="px-4 py-3 text-slate-600">{supportCategoryLabel(row.category)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          row.status === "answered"
                            ? "bg-secondary/15 text-secondary"
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
                        href={`/company/support/${row.id}`}
                        className="text-sm font-bold text-secondary hover:underline"
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
            <div className="flex items-center justify-between border-t border-secondary/15 bg-slate-50/80 px-4 py-3">
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
    </>
  );
}
