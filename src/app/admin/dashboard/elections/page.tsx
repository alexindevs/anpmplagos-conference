"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminElectionsSettings,
  getElectionsStats,
  toggleVoting,
  resetVotingData,
  downloadPreResetSnapshot,
  RESET_CONFIRMATION_PHRASE,
  type ResetVotingDataInput,
} from "@/lib/api";
import { toast } from "sonner";

type ResetSelections = Omit<ResetVotingDataInput, "confirmationPhrase">;

const RESET_OPTIONS: { key: keyof ResetSelections; label: string; hint?: string }[] = [
  { key: "resetCandidates", label: "Reset candidates list" },
  { key: "resetVotes", label: "Reset votes cast on candidates" },
  {
    key: "resetPositions",
    label: "Reset positions",
    hint: "Also clears their candidates and votes",
  },
  {
    key: "resetVotingState",
    label: "Reset voting open/close state",
    hint: "Back to pristine — closed, no open/close history",
  },
];

function ResetVotingDataCard() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selections, setSelections] = useState<ResetSelections>({
    resetCandidates: true,
    resetVotes: true,
    resetPositions: true,
    resetVotingState: true,
  });
  const [confirmText, setConfirmText] = useState("");

  const allChecked = Object.values(selections).every(Boolean);
  const anyChecked = Object.values(selections).some(Boolean);

  const resetMutation = useMutation({
    mutationFn: (body: ResetVotingDataInput) => resetVotingData(body),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["admin", "elections"] });
      qc.invalidateQueries({ queryKey: ["elections"] });
      toast.success(
        result.reset.length
          ? `Reset complete: ${result.reset.join(", ")}`
          : "Nothing was selected to reset."
      );
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function closeModal() {
    setOpen(false);
    setStep(1);
    setConfirmText("");
    setSelections({
      resetCandidates: true,
      resetVotes: true,
      resetPositions: true,
      resetVotingState: true,
    });
  }

  function toggleAll(checked: boolean) {
    setSelections({
      resetCandidates: checked,
      resetVotes: checked,
      resetPositions: checked,
      resetVotingState: checked,
    });
  }

  function handleDownloadAndContinue() {
    downloadPreResetSnapshot();
    setStep(2);
  }

  function handleConfirmReset() {
    resetMutation.mutate({ ...selections, confirmationPhrase: confirmText });
  }

  return (
    <>
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-red-600 dark:text-red-400">
                warning
              </span>
              <h2 className="text-lg font-bold text-charcoal dark:text-white">
                Reset Voting Data
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
              Permanently wipes selected election data. Cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition-colors hover:bg-red-700 sm:w-auto"
          >
            <span className="material-symbols-outlined text-[20px]">
              restart_alt
            </span>
            Reset Voting Data
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-[80%] md:max-w-[50%] rounded-2xl bg-white p-6 dark:bg-background-dark-soft">
            {step === 1 ? (
              <>
                <h3 className="text-lg font-bold text-charcoal dark:text-white">
                  What do you want to reset?
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                  The audit log (who did what, and who voted where) is never reset.
                </p>

                <label className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-white/10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                  All (everything related to votes)
                </label>

                <div className="mt-2 space-y-2">
                  {RESET_OPTIONS.map((opt) => (
                    <label
                      key={opt.key}
                      className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={selections[opt.key]}
                        onChange={(e) =>
                          setSelections((s) => ({
                            ...s,
                            [opt.key]: e.target.checked,
                          }))
                        }
                      />
                      <span>
                        <span className="block text-charcoal dark:text-white">
                          {opt.label}
                        </span>
                        {opt.hint && (
                          <span className="block text-xs text-slate-400 dark:text-white/40">
                            {opt.hint}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-white/60 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!anyChecked}
                    onClick={handleDownloadAndContinue}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      download
                    </span>
                    Download snapshot & Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                  This cannot be undone
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
                  A CSV snapshot of current candidates, positions, and vote counts has been downloaded. To confirm, type the phrase below exactly:
                </p>
                <p className="mt-3 select-all rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm text-charcoal dark:bg-white/10 dark:text-white">
                  {RESET_CONFIRMATION_PHRASE}
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type the phrase exactly"
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400 dark:border-white/10 dark:bg-background-dark"
                />

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-white/60 dark:hover:bg-white/5"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={
                      confirmText !== RESET_CONFIRMATION_PHRASE ||
                      resetMutation.isPending
                    }
                    onClick={handleConfirmReset}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-40"
                  >
                    {resetMutation.isPending ? "Resetting…" : "Reset permanently"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

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

        {/* Danger Zone */}
        <ResetVotingDataCard />
      </div>
    </main>
  );
}
