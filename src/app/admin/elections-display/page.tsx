"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getElectionsResults } from "@/lib/api";

export default function ElectionsDisplayPage() {
  const { data: results, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["elections", "display", "results"],
    queryFn: getElectionsResults,
    refetchInterval: 5_000,
  });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-primary">
            how_to_vote
          </span>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              ANPMP Lagos Conference 2026
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Live Election Results
            </p>
          </div>
        </div>
        <div className="text-right">
          {dataUpdatedAt > 0 && (
            <p className="text-xs text-white/40">
              Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
            </p>
          )}
          <div className="mt-0.5 flex items-center justify-end gap-1.5">
            <span className="inline-block size-2 animate-pulse rounded-full bg-green-400" />
            <span className="text-xs font-semibold text-green-400">LIVE</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-8 lg:px-12 lg:py-10">
        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-white/5"
              />
            ))}
          </div>
        ) : !results?.length ? (
          <div className="flex flex-col items-center justify-center py-40">
            <span className="material-symbols-outlined text-[64px] text-white/20">
              bar_chart
            </span>
            <p className="mt-4 text-lg font-semibold text-white/40">
              No results to display yet
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((pos) => (
              <div
                key={pos.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-5 flex items-start justify-between gap-2">
                  <h2 className="text-xl font-black leading-tight text-white">
                    {pos.title}
                  </h2>
                  <span className="shrink-0 rounded-full bg-primary/20 px-3 py-1 text-sm font-bold text-primary">
                    {pos.totalVotes}
                  </span>
                </div>

                {!pos.candidates.length ? (
                  <p className="text-sm text-white/30">No candidates</p>
                ) : (
                  <div className="space-y-5">
                    {[...pos.candidates]
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map((c, idx) => (
                        <div key={c.id}>
                          <div className="mb-2 flex items-center gap-3">
                            {/* Avatar */}
                            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
                              {c.avatar ? (
                                <Image
                                  src={c.avatar}
                                  alt={c.name}
                                  width={40}
                                  height={40}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-[20px] text-white/40">
                                  person
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                {idx === 0 && pos.totalVotes > 0 && (
                                  <span className="text-lg">🏆</span>
                                )}
                                <p className="truncate text-base font-bold text-white">
                                  {c.name}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-lg font-black text-white">
                                {c.voteCount}
                              </p>
                              <p className="text-xs text-white/40">
                                {c.percentage}%
                              </p>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                idx === 0
                                  ? "bg-primary"
                                  : idx === 1
                                  ? "bg-primary/60"
                                  : "bg-white/30"
                              }`}
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
      </main>

      {/* Close button */}
      <button
        type="button"
        onClick={() => window.close()}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white/60 transition-colors hover:bg-white/20 hover:text-white"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
        Close
      </button>
    </div>
  );
}
