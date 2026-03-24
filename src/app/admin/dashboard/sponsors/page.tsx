"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  formatKoboToNaira,
  getAdminSponsors,
  type SponsorStatus,
  type SponsorTier,
} from "@/lib/api";

const STATUS_OPTIONS: SponsorStatus[] = [
  "pending_pledge",
  "pending_payment",
  "active",
  "cancelled",
];

const TIER_OPTIONS: SponsorTier[] = ["platinum", "gold", "silver", "bronze", "custom"];

export default function SponsorsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SponsorStatus | "">("");
  const [tier, setTier] = useState<SponsorTier | "">("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "sponsors", page, pageSize, search, status, tier],
    queryFn: () =>
      getAdminSponsors({
        page,
        pageSize,
        search: search || undefined,
        status: status || undefined,
        tier: tier || undefined,
      }),
  });

  const stats = useMemo(() => {
    const items = data?.items ?? [];
    const total = items.length;
    const active = items.filter((s) => s.status === "active").length;
    const pending = items.filter((s) => s.status === "pending_pledge" || s.status === "pending_payment").length;
    const totalPledged = items.reduce((sum, s) => sum + (s.sponsorAmount ?? 0), 0);
    return { total, active, pending, totalPledged };
  }, [data]);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#181112] dark:text-white">Sponsors</h2>
            <p className="text-sm text-slate-500 dark:text-white/50">Manage sponsors and sponsorship tiers</p>
          </div>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="relative min-w-[260px] flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 dark:text-white/40">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search by company or email..."
              className="w-full rounded-lg border-none bg-background-light py-2 pl-10 pr-4 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as SponsorStatus | "");
            }}
            className="cursor-pointer rounded-lg border-none bg-background-light px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={tier}
            onChange={(e) => {
              setPage(1);
              setTier(e.target.value as SponsorTier | "");
            }}
            className="cursor-pointer rounded-lg border-none bg-background-light px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white"
          >
            <option value="">All tiers</option>
            {TIER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="Total Sponsors" value={String(stats.total)} />
          <StatCard label="Active" value={String(stats.active)} valueClass="text-secondary" />
          <StatCard label="Pending" value={String(stats.pending)} valueClass="text-primary" />
          <StatCard label="Total Pledged" value={formatKoboToNaira(stats.totalPledged)} />
        </div>

        <div className="overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 dark:border-border-dark dark:bg-background-dark-softer">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Company</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Tier</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 dark:divide-border-dark">
                {isLoading && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-slate-500 dark:text-white/50" colSpan={6}>
                      Loading sponsors...
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-primary" colSpan={6}>
                      Unable to load sponsors.
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && (data?.items?.length ?? 0) === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-slate-500 dark:text-white/50" colSpan={6}>
                      No sponsors yet.
                    </td>
                  </tr>
                )}
                {(data?.items ?? []).map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-primary/5 dark:hover:bg-background-dark-softer">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#181112] dark:text-white">{row.companyName}</p>
                      <p className="text-xs text-slate-500 dark:text-white/50">{row.contactEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#181112] dark:text-white/70">{row.primaryContactName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/70">{formatKoboToNaira(row.sponsorAmount)}</td>
                    <td className="px-6 py-4 text-sm text-[#181112] dark:text-white/70">{row.tier ?? "custom"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary">
                        {row.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button type="button" className="inline-flex items-center text-slate-400 dark:text-white/40 transition-colors hover:text-primary" title="Edit">
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
                            disabled
                            className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-400 dark:bg-background-dark-softer dark:text-white/40 cursor-not-allowed"
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
                className="rounded p-1 transition-colors hover:bg-white disabled:opacity-50 dark:hover:bg-background-dark-soft"
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

function StatCard({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">{label}</p>
      <p className={`mt-1 text-2xl font-black text-[#181112] dark:text-white ${valueClass ?? ""}`}>{value}</p>
    </div>
  );
}
