"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminElectionsSettings,
  getElectionsStats,
  toggleVoting,
} from "@/lib/api";
import { toast } from "sonner";

export default function ElectionsOverviewPage() {
  const qc = useQueryClient();

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ["admin", "elections", "settings"],
    queryFn: getAdminElectionsSettings,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin", "elections", "stats"],
    queryFn: getElectionsStats,
    refetchInterval: 15_000,
  });

  const toggleMutation = useMutation({
    mutationFn: (active: boolean) => toggleVoting(active),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["admin", "elections"] });
      qc.invalidateQueries({ queryKey: ["elections", "status"] });
      toast.success(
        updated.isActive ? "Voting is now LIVE 🗳️" : "Voting has been closed."
      );
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const isActive = settings?.isActive ?? false;

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="w-full space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-white">
            Elections
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
            Manage positions, candidates, and control when voting is open.
          </p>
        </div>

        {/* Voting Toggle Card */}
        <div
          className={`rounded-2xl border p-6 transition-colors ${
            isActive
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
              : "border-slate-200 bg-white dark:border-white/10 dark:bg-background-dark-soft"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[28px] ${
                    isActive ? "text-green-600" : "text-slate-400"
                  }`}
                >
                  how_to_vote
                </span>
                <h2 className="text-lg font-bold text-charcoal dark:text-white">
                  Voting is{" "}
                  <span
                    className={isActive ? "text-green-600" : "text-slate-400"}
                  >
                    {loadingSettings ? "…" : isActive ? "LIVE" : "CLOSED"}
                  </span>
                </h2>
              </div>
              {settings?.activatedAt && (
                <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                  {isActive ? "Opened" : "Last opened"}{" "}
                  {new Date(settings.activatedAt).toLocaleString()}
                </p>
              )}
              {!isActive && settings?.deactivatedAt && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
                  Closed {new Date(settings.deactivatedAt).toLocaleString()}
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={toggleMutation.isPending || loadingSettings}
              onClick={() => toggleMutation.mutate(!isActive)}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold transition-colors disabled:opacity-60 sm:w-auto ${
                isActive
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isActive ? "toggle_off" : "toggle_on"}
              </span>
              {toggleMutation.isPending
                ? "Saving…"
                : isActive
                ? "Close Voting"
                : "Open Voting"}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Voters",
              value: loadingStats ? "…" : stats?.uniqueVoters ?? 0,
              icon: "people",
            },
            {
              label: "Total Votes Cast",
              value: loadingStats ? "…" : stats?.totalVotes ?? 0,
              icon: "ballot",
            },
            {
              label: "Active Positions",
              value: loadingStats ? "…" : stats?.totalPositions ?? 0,
              icon: "list_alt",
            },
            {
              label: "Completed Voters",
              value: loadingStats ? "…" : stats?.completedVoters ?? 0,
              icon: "how_to_reg",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-background-dark-soft"
            >
              <span className="material-symbols-outlined text-[24px] text-primary">
                {stat.icon}
              </span>
              <p className="mt-2 text-2xl font-bold text-charcoal dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-white/50">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/dashboard/elections/positions"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-primary/30 hover:bg-primary/5 dark:border-white/10 dark:bg-background-dark-soft dark:hover:border-primary/30"
          >
            <span className="material-symbols-outlined text-[28px] text-primary">
              list_alt
            </span>
            <div>
              <p className="font-bold text-charcoal dark:text-white">
                Positions & Candidates
              </p>
              <p className="text-xs text-slate-500 dark:text-white/50">
                Add positions and manage candidates
              </p>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/elections/results"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-primary/30 hover:bg-primary/5 dark:border-white/10 dark:bg-background-dark-soft dark:hover:border-primary/30"
          >
            <span className="material-symbols-outlined text-[28px] text-primary">
              bar_chart
            </span>
            <div>
              <p className="font-bold text-charcoal dark:text-white">
                Live Results
              </p>
              <p className="text-xs text-slate-500 dark:text-white/50">
                Real-time vote counts per candidate
              </p>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/elections/audit"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-primary/30 hover:bg-primary/5 dark:border-white/10 dark:bg-background-dark-soft dark:hover:border-primary/30"
          >
            <span className="material-symbols-outlined text-[28px] text-primary">
              fact_check
            </span>
            <div>
              <p className="font-bold text-charcoal dark:text-white">
                Audit Log
              </p>
              <p className="text-xs text-slate-500 dark:text-white/50">
                Full vote record with IP tracking
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
