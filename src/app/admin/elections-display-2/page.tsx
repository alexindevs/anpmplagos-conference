"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getElectionsResults } from "@/lib/api";

const SLIDE_INTERVAL_MS = 10_000;

function sizeClasses(count: number) {
  if (count <= 3)
    return {
      title: "text-4xl",
      badge: "text-lg px-4 py-1.5",
      photo: "size-48",
      name: "text-3xl",
      votes: "text-3xl",
      pct: "text-lg",
      gridCols: "grid-cols-3",
    };
  if (count <= 5)
    return {
      title: "text-3xl",
      badge: "text-base px-3 py-1",
      photo: "size-36",
      name: "text-2xl",
      votes: "text-2xl",
      pct: "text-base",
      gridCols: "grid-cols-4",
    };
  if (count <= 7)
    return {
      title: "text-2xl",
      badge: "text-sm px-3 py-1",
      photo: "size-28",
      name: "text-xl",
      votes: "text-xl",
      pct: "text-sm",
      gridCols: "grid-cols-4",
    };
  return {
    title: "text-xl",
    badge: "text-xs px-2 py-0.5",
    photo: "size-24",
    name: "text-lg",
    votes: "text-lg",
    pct: "text-sm",
    gridCols: "grid-cols-5",
  };
}

export default function ElectionsDisplayPage2() {
  const { data: results, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["elections", "display", "results"],
    queryFn: getElectionsResults,
    refetchInterval: 5_000,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(100);

  const total = results?.length ?? 0;

  // Clamp index if positions are removed
  useEffect(() => {
    if (total > 0 && currentIndex >= total) setCurrentIndex(total - 1);
  }, [total, currentIndex]);

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setFading(false);
    }, 250);
  }, []);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    goTo((currentIndex + 1) % total);
  }, [currentIndex, total, goTo]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    goTo((currentIndex - 1 + total) % total);
  }, [currentIndex, total, goTo]);

  // Auto-advance — resets whenever goNext changes (i.e. on every slide change or manual nav)
  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(goNext, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [goNext, total]);

  // Progress bar
  useEffect(() => {
    if (total <= 1) return;
    setProgress(100);
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.max(0, 100 - (elapsed / SLIDE_INTERVAL_MS) * 100));
    }, 50);
    return () => clearInterval(timer);
  }, [currentIndex, total]);

  const safeIndex = Math.min(currentIndex, Math.max(0, total - 1));
  const pos = results?.[safeIndex];
  const sz = sizeClasses(pos?.candidates.length ?? 0);
  const sortedCandidates = pos
    ? [...pos.candidates].sort((a, b) => b.voteCount - a.voteCount)
    : [];
  const topVoteCount = sortedCandidates[0]?.voteCount ?? 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0d0d0d] text-white">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-green-400">
            how_to_vote
          </span>
          <div>
            <h1 className="text-xl font-black tracking-tight">
              ANPMP Lagos Conference 2026
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-400">
              Live Election Results (Grid Layout)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
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
          <button
            type="button"
            onClick={() => window.close()}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white/50 transition-colors hover:bg-white/20 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Close
          </button>
        </div>
      </header>

      {/* Progress bar */}
      {total > 1 && (
        <div className="h-0.5 shrink-0 bg-white/10">
          <div
            className="h-full bg-green-400"
            style={{ width: `${progress}%`, transition: "width 50ms linear" }}
          />
        </div>
      )}

      {/* Slide area */}
      <main className="flex min-h-0 flex-1 items-center justify-center px-8 py-6">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-2xl bg-white/5" />
        ) : !results?.length ? (
          <div className="flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[64px] text-white/20">
              bar_chart
            </span>
            <p className="mt-4 text-lg font-semibold text-white/40">
              No results to display yet
            </p>
          </div>
        ) : (
          <div
            className={`flex h-full w-full flex-col rounded-2xl border border-white/10 bg-white/5 p-8 transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
          >
            {/* Position header */}
            <div className="mb-6 shrink-0">
              {total > 1 && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/30">
                  Position {safeIndex + 1} of {total}
                </p>
              )}
              <div className="flex items-start justify-between gap-4">
                <h2
                  className={`font-black leading-tight text-white ${sz.title}`}
                >
                  {pos!.title}
                </h2>
                <span
                  className={`shrink-0 rounded-full bg-green-400/20 font-bold text-green-400 ${sz.badge}`}
                >
                  {pos!.totalVotes} votes
                </span>
              </div>
            </div>

            {/* Candidates — photo on top, name + votes side by side below */}
            {!sortedCandidates.length ? (
              <p className="text-sm text-white/30">No candidates</p>
            ) : (
              <div
                className={`grid min-h-0 flex-1 content-center gap-6 ${sz.gridCols}`}
              >
                {sortedCandidates.map((c) => {
                  const isLeader = topVoteCount > 0 && c.voteCount === topVoteCount;
                  return (
                    <div
                      key={c.id}
                      className={`flex flex-col items-center rounded-2xl border px-4 py-6 text-center transition-colors ${
                        isLeader
                          ? "border-green-400/60 bg-green-400/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      {/* Circular picture */}
                      <div
                        className={`relative shrink-0 overflow-hidden rounded-full border-4 bg-white/10 ${sz.photo} ${
                          isLeader ? "border-green-400" : "border-white/10"
                        }`}
                      >
                        {c.avatar ? (
                          <Image
                            src={c.avatar}
                            alt={c.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="material-symbols-outlined text-[48px] text-white/30">
                              person
                            </span>
                          </div>
                        )}
                        {isLeader && (
                          <span className="absolute -right-1 -top-1 text-2xl">
                            🏆
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <p
                        className={`mt-4 w-full truncate font-bold text-white ${sz.name}`}
                      >
                        {c.name}
                      </p>

                      {/* Votes — always visible */}
                      <p
                        className={`mt-1 font-black ${sz.votes} ${
                          isLeader ? "text-green-400" : "text-white"
                        }`}
                      >
                        {c.voteCount > 0
                          ? `${c.voteCount} vote${c.voteCount === 1 ? "" : "s"}`
                          : "No votes"}
                      </p>
                      {c.voteCount > 0 && (
                        <p className={`text-white/40 ${sz.pct}`}>
                          {c.percentage}%
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Nav bar */}
      {total > 1 && (
        <nav className="flex shrink-0 items-center justify-between border-t border-white/10 px-8 py-3">
          <button
            type="button"
            onClick={goPrev}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Prev
          </button>

          <div className="flex items-center gap-2">
            {results!.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === safeIndex
                    ? "h-2.5 w-6 bg-green-400"
                    : "size-2.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          >
            Next
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>
        </nav>
      )}
    </div>
  );
}
