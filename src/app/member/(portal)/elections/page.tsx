"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  getElectionsStatus,
  getElectionsPositions,
  getMyVotes,
  castVote,
  ApiError,
  type CastVoteInput,
} from "@/lib/api";
import { MemberPortalShell } from "../../components/MemberPortalShell";
import { toast } from "sonner";

export default function MemberElectionsPage() {
  const { data: user } = useAuthSession();
  const qc = useQueryClient();
  const [pendingVote, setPendingVote] = useState<CastVoteInput | null>(null);

  const userId = user?.id ?? "";
  const fullName =
    user?.member?.fullName ?? user?.attendee?.fullName ?? user?.email ?? "";

  const { data: status, isLoading: loadingStatus } = useQuery({
    queryKey: ["elections", "status"],
    queryFn: getElectionsStatus,
    staleTime: 30_000,
  });

  const { data: positions, isLoading: loadingPositions } = useQuery({
    queryKey: ["elections", "positions"],
    queryFn: getElectionsPositions,
    enabled: status?.isActive === true,
  });

  const { data: myVotes, isLoading: loadingVotes } = useQuery({
    queryKey: ["elections", "my-votes"],
    queryFn: getMyVotes,
    enabled: !!user && status?.isActive === true,
  });

  // Map positionId → candidateId for already-voted positions
  const votedMap = new Map(
    (myVotes ?? []).map((v) => [v.positionId, v.candidateId])
  );

  const voteMutation = useMutation({
    mutationFn: (vars: CastVoteInput) => castVote(vars),
    onMutate: (vars) => setPendingVote(vars),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["elections", "my-votes"] });
      toast.success(
        `Vote cast for ${result.candidate.name} (${result.position.title}) ✓`
      );
    },
    onError: (err: Error) => {
      if (err instanceof ApiError && err.status === 409) {
        toast.error("You've already voted for this position.");
      } else if (err instanceof ApiError && err.status === 403) {
        toast.error(err.message);
      } else {
        toast.error("Failed to cast vote. Please try again.");
      }
    },
    onSettled: () => setPendingVote(null),
  });

  const isLoading = loadingStatus || (status?.isActive && loadingPositions) || loadingVotes;

  return (
    <MemberPortalShell userId={userId} fullName={fullName}>
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="w-full space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-charcoal dark:text-white">
              Elections
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
              Cast your vote for each position below.
            </p>
          </div>

          {/* Voting closed state */}
          {!loadingStatus && !status?.isActive && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 py-16 text-center dark:border-white/10 dark:bg-white/5">
              <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-white/20">
                lock
              </span>
              <h2 className="mt-4 text-lg font-bold text-slate-600 dark:text-white/60">
                Voting is not currently active
              </h2>
              <p className="mt-1 text-sm text-slate-400 dark:text-white/30">
                Check back when voting opens.
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && status?.isActive && (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5"
                />
              ))}
            </div>
          )}

          {/* Voting active — show positions */}
          {status?.isActive && !isLoading && (
            <>
              {!positions?.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center dark:border-white/10">
                  <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-white/20">
                    how_to_vote
                  </span>
                  <p className="mt-3 font-medium text-slate-500 dark:text-white/50">
                    No positions available yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {positions.map((pos) => {
                    const myVoteCandidateId = votedMap.get(pos.id);
                    const hasVoted = !!myVoteCandidateId;

                    return (
                      <div
                        key={pos.id}
                        className={`rounded-2xl border p-5 transition-colors sm:p-6 ${
                          hasVoted
                            ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                            : "border-slate-200 bg-white dark:border-white/10 dark:bg-background-dark-soft"
                        }`}
                      >
                        {/* Position header */}
                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h2 className="text-lg font-bold text-charcoal dark:text-white">
                              {pos.title}
                            </h2>
                            {pos.description && (
                              <p className="mt-0.5 text-sm text-slate-500 dark:text-white/50">
                                {pos.description}
                              </p>
                            )}
                          </div>
                          {hasVoted && (
                            <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <span className="material-symbols-outlined text-[14px]">
                                check_circle
                              </span>
                              Voted
                            </span>
                          )}
                        </div>

                        {/* Candidates */}
                        {!pos.candidates.length ? (
                          <p className="text-sm text-slate-400 dark:text-white/30">
                            No candidates for this position.
                          </p>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {[...pos.candidates].sort((a, b) => {
                              const surname = (n: string) => n.trim().split(/\s+/).pop()?.toLowerCase() ?? "";
                              return surname(a.name).localeCompare(surname(b.name));
                            }).map((c) => {
                              const isMyChoice =
                                myVoteCandidateId === c.id;
                              const isVoting =
                                voteMutation.isPending &&
                                pendingVote?.positionId === pos.id &&
                                pendingVote?.candidateId === c.id;

                              return (
                                <div
                                  key={c.id}
                                  className={`relative flex flex-col gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center ${
                                    isMyChoice
                                      ? "border-green-400 bg-green-50 shadow-sm dark:border-green-600 dark:bg-green-900/20"
                                      : hasVoted
                                      ? "border-slate-200 bg-white/50 dark:border-white/5 dark:bg-white/3"
                                      : "border-slate-200 bg-white hover:border-primary/30 hover:bg-primary/5 dark:border-white/10 dark:bg-white/5 dark:hover:border-primary/40"
                                  }`}
                                >
                                  {/* Avatar */}
                                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                                    {c.avatar ? (
                                      <Image
                                        src={c.avatar}
                                        alt={c.name}
                                        width={56}
                                        height={56}
                                        className="size-full object-cover"
                                      />
                                    ) : (
                                      <span className="material-symbols-outlined text-[28px] text-primary">
                                        person
                                      </span>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-charcoal dark:text-white">
                                      {c.name}
                                    </p>
                                    {c.bio && (
                                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2 dark:text-white/50">
                                        {c.bio}
                                      </p>
                                    )}
                                  </div>

                                  {/* Already voted — show checkmark */}
                                  {isMyChoice && (
                                    <span className="material-symbols-outlined shrink-0 text-[24px] text-green-600 dark:text-green-400">
                                      check_circle
                                    </span>
                                  )}

                                  {/* Vote button */}
                                  {!hasVoted && (
                                    <button
                                      type="button"
                                      disabled={
                                        voteMutation.isPending &&
                                        pendingVote?.positionId === pos.id
                                      }
                                      onClick={() =>
                                        voteMutation.mutate({
                                          positionId: pos.id,
                                          candidateId: c.id,
                                        })
                                      }
                                      className="w-full shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
                                    >
                                      {isVoting ? (
                                        <span className="flex items-center gap-1.5">
                                          <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                          Voting…
                                        </span>
                                      ) : (
                                        "Vote"
                                      )}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Progress summary */}
              {positions && positions.length > 0 && myVotes !== undefined && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm font-semibold text-slate-600 dark:text-white/60">
                    <span className="font-bold text-charcoal dark:text-white">
                      {votedMap.size}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-charcoal dark:text-white">
                      {positions.length}
                    </span>{" "}
                    position{positions.length !== 1 ? "s" : ""} voted
                    {votedMap.size === positions.length && (
                      <span className="ml-2 text-green-600 dark:text-green-400">
                        — All done! 🎉
                      </span>
                    )}
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width:
                          positions.length > 0
                            ? `${Math.round((votedMap.size / positions.length) * 100)}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </MemberPortalShell>
  );
}
