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
      avatar: "size-16",
      icon: "text-[32px]",
      trophy: "text-2xl",
      name: "text-2xl",
      votes: "text-3xl",
      pct: "text-base",
      bar: "h-4",
      gap: "gap-7",
    };
  if (count <= 5)
    return {
      title: "text-3xl",
      badge: "text-base px-3 py-1",
      avatar: "size-12",
      icon: "text-[26px]",
      trophy: "text-xl",
      name: "text-xl",
      votes: "text-2xl",
      pct: "text-sm",
      bar: "h-3",
      gap: "gap-5",
    };
  if (count <= 7)
    return {
      title: "text-2xl",
      badge: "text-sm px-3 py-1",
      avatar: "size-9",
      icon: "text-[20px]",
      trophy: "text-base",
      name: "text-base",
      votes: "text-lg",
      pct: "text-xs",
      bar: "h-2.5",
      gap: "gap-3",
    };
  return {
    title: "text-xl",
    badge: "text-xs px-2 py-0.5",
    avatar: "size-7",
    icon: "text-[16px]",
    trophy: "text-sm",
    name: "text-sm",
    votes: "text-base",
    pct: "text-xs",
    bar: "h-2",
    gap: "gap-2",
  };
}

export default function ElectionsDisplayPage() {
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0d0d0d] text-white">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-8 py-4">
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
            className="h-full bg-primary"
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
            <div className="mb-5 shrink-0">
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
                  className={`shrink-0 rounded-full bg-primary/20 font-bold text-primary ${sz.badge}`}
                >
                  {pos!.totalVotes} votes
                </span>
              </div>
            </div>

            {/* Candidates */}
            {!sortedCandidates.length ? (
              <p className="text-sm text-white/30">No candidates</p>
            ) : (
              <div
                className={`flex min-h-0 flex-1 flex-col justify-evenly ${sz.gap}`}
              >
                {sortedCandidates.map((c, idx) => (
                  <div key={c.id} className="min-h-0">
                    <div className="mb-2 flex items-center gap-3">
                      <div
                        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ${sz.avatar}`}
                      >
                        {c.avatar ? (
                          <Image
                            src={c.avatar}
                            alt={c.name}
                            width={64}
                            height={64}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span
                            className={`material-symbols-outlined text-white/40 ${sz.icon}`}
                          >
                            person
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {idx === 0 && pos!.totalVotes > 0 && (
                            <span className={sz.trophy}>🏆</span>
                          )}
                          <p
                            className={`truncate font-bold text-white ${sz.name}`}
                          >
                            {c.name}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className={`font-black text-white ${sz.votes}`}>
                          {c.voteCount}
                        </p>
                        <p className={`text-white/40 ${sz.pct}`}>
                          {c.percentage}%
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-full overflow-hidden rounded-full bg-white/10 ${sz.bar}`}
                    >
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
                    ? "h-2.5 w-6 bg-primary"
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
