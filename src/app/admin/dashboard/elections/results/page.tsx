"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getElectionsResults } from "@/lib/api";

export default function ElectionsResultsPage() {
  const { data: results, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["admin", "elections", "results"],
    queryFn: getElectionsResults,
    refetchInterval: 10_000,
  });

  const openDisplayMode = () => {
    window.open("/admin/elections-display", "_blank", "noopener,noreferrer");
  };

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
              <span>Live Results</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-[#181112] dark:text-white">
              Live Results
            </h1>
            {dataUpdatedAt > 0 && (
              <p className="text-xs text-slate-400 dark:text-white/30">
                Last updated {new Date(dataUpdatedAt).toLocaleTimeString()} ·
                auto-refreshes every 10s
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={openDisplayMode}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 sm:w-auto"
          >
            <span className="material-symbols-outlined text-[18px]">
              tv
            </span>
            Large Screen Mode
          </button>
        </div>

        {/* Results grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5"
              />
            ))}
          </div>
        ) : !results?.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-20 text-center dark:border-white/10">
            <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-white/20">
              bar_chart
            </span>
            <p className="mt-3 font-medium text-slate-500 dark:text-white/50">
              No positions configured yet
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {results.map((pos) => (
              <div
                key={pos.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-background-dark-soft"
              >
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-bold text-[#181112] dark:text-white">
                    {pos.title}
                  </h2>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {pos.totalVotes} vote{pos.totalVotes !== 1 ? "s" : ""}
                  </span>
                </div>

                {!pos.candidates.length ? (
                  <p className="text-sm text-slate-400 dark:text-white/30">
                    No candidates
                  </p>
                ) : (
                  <div className="space-y-3">
                    {[...pos.candidates]
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map((c, idx) => (
                        <div key={c.id}>
                          <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                            {/* Avatar */}
                            <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                              {c.avatar ? (
                                <Image
                                  src={c.avatar}
                                  alt={c.name}
                                  width={28}
                                  height={28}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-[14px] text-primary">
                                  person
                                </span>
                              )}
                            </div>
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#181112] dark:text-white">
                              {idx === 0 && pos.totalVotes > 0 && (
                                <span className="mr-1">🏆</span>
                              )}
                              {c.name}
                            </span>
                            <span className="shrink-0 text-xs font-bold text-slate-500 dark:text-white/50 sm:text-right">
                              {c.voteCount} ({c.percentage}%)
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${c.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
