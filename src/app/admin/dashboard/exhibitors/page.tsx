"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminExhibitors } from "@/lib/api";

export default function ExhibitorsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "exhibitors", page, pageSize, search],
    queryFn: () => getAdminExhibitors({ page, pageSize, search: search || undefined }),
  });

  const stats = useMemo(() => {
    const items = data?.items ?? [];
    const total = data?.total ?? items.length;
    const confirmed = items.filter((i) => (i.status ?? "").toLowerCase() === "confirmed").length;
    const pending = items.filter((i) => (i.status ?? "").toLowerCase().includes("pending")).length;
    const withdrawn = items.filter((i) => (i.status ?? "").toLowerCase() === "withdrawn").length;
    return { total, confirmed, pending, withdrawn };
  }, [data]);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-charcoal dark:text-white">
              Exhibitors
            </h2>
            <p className="text-sm text-slate-500 dark:text-white/50">
              Manage exhibitor companies and booth assignments
            </p>
          </div>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 w-full flex-1 sm:min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search by company or contact name..."
              className="w-full rounded-lg border-none bg-background-light py-2 pl-10 pr-4 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white"
            />
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <select className="w-full min-w-0 cursor-pointer rounded-lg border-none bg-background-light px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white sm:w-auto">
              <option value="">All statuses</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Withdrawn</option>
            </select>
          </div>
          <button
            type="button"
            className="self-start p-2 text-slate-400 dark:text-white/40 transition-colors hover:text-primary sm:self-center"
            title="Filters"
          >
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">Total Exhibitors</p>
            <p className="mt-1 text-2xl font-black text-charcoal dark:text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">Confirmed</p>
            <p className="mt-1 text-2xl font-black text-secondary">{stats.confirmed}</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">Pending</p>
            <p className="mt-1 text-2xl font-black text-primary">{stats.pending}</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">Withdrawn</p>
            <p className="mt-1 text-2xl font-black text-primary/60">{stats.withdrawn}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 dark:border-border-dark dark:bg-background-dark-softer">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Company
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Booth
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 dark:divide-border-dark">
                {isLoading && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-slate-500 dark:text-white/50" colSpan={5}>
                      Loading exhibitors...
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-primary" colSpan={5}>
                      Unable to load exhibitors.
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && (data?.items?.length ?? 0) === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-slate-500 dark:text-white/50" colSpan={5}>
                      No exhibitors found.
                    </td>
                  </tr>
                )}
                {(data?.items ?? []).map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-primary/5 dark:hover:bg-background-dark-softer">
                    <td className="px-6 py-4">
                      <p className="font-bold text-charcoal dark:text-white">{row.companyName}</p>
                      <p className="text-xs text-slate-500 dark:text-white/50">{row.contactEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal dark:text-white/70">{row.primaryContactName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/70">
                      {row.booth?.name ?? row.booth?.code ?? row.booth?.floorSection ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary">
                        {(row.status ?? "confirmed").replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center text-slate-400 dark:text-white/40 transition-colors hover:text-primary"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-lg">edit_note</span>
                        </button>
                        {row.slug ? (
                          <Link
                            href={`/company/${row.slug}`}
                            target="_blank"
                            className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-background-dark-softer dark:text-white/90 dark:hover:bg-background-dark"
                          >
                            View
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-400 dark:bg-background-dark-softer dark:text-white/40 cursor-not-allowed"
                            disabled
                          >
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between bg-primary/5 px-6 py-4 dark:bg-background-dark-softer">
            <p className="text-sm text-slate-500 dark:text-white/50">
              Showing page <span className="font-bold text-slate-700 dark:text-white/70">{page}</span> of{" "}
              <span className="font-bold text-slate-700 dark:text-white/70">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
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
                className="rounded p-1 transition-colors hover:bg-white dark:hover:bg-background-dark-soft"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
