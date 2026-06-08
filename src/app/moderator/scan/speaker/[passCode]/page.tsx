"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSpeakerScanDetails,
  markSpeakerAttendance,
  getActiveDays,
  type SpeakerScanResult,
  type EventDay,
} from "@/lib/api";
import { getMe, isModeratorUser } from "@/lib/auth-api";
import { ApiError } from "@/lib/api";
import { ModeratorPortalShell } from "../../../components/ModeratorPortalShell";

const KIND_LABELS: Record<string, string> = {
  speaker: "Speaker",
  special_guest: "Special Guest",
};

export default function SpeakerScanPage() {
  const params = useParams<{ passCode: string }>();
  const passCode = params.passCode;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: me, isPending: authPending } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!authPending && (!me || !isModeratorUser(me))) {
      router.replace("/login");
    }
  }, [authPending, me, router]);

  const { data: activeDays } = useQuery({
    queryKey: ["moderator", "active-days"],
    queryFn: getActiveDays,
    enabled: !!me && isModeratorUser(me),
    staleTime: 30_000,
  });

  const [selectedDayId, setSelectedDayId] = useState<string>("");

  useEffect(() => {
    if (activeDays && activeDays.length > 0 && !selectedDayId) {
      setSelectedDayId(activeDays[0].id);
    }
  }, [activeDays, selectedDayId]);

  const {
    data: scanResult,
    isPending: scanLoading,
    error: scanError,
    refetch: refetchScan,
  } = useQuery({
    queryKey: ["attendance", "speaker-scan", passCode, selectedDayId],
    queryFn: () => getSpeakerScanDetails(passCode, selectedDayId || undefined),
    enabled: !!me && isModeratorUser(me) && !!passCode,
    retry: false,
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [markError, setMarkError] = useState<string | null>(null);

  const markMutation = useMutation({
    mutationFn: ({ pCode, dayId }: { pCode: string; dayId: string }) =>
      markSpeakerAttendance(pCode, dayId),
    onSuccess: (data) => {
      setSuccessMsg(data.message);
      setMarkError(null);
      queryClient.invalidateQueries({ queryKey: ["attendance", "speaker-scan", passCode] });
      refetchScan();
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError
          ? err.message || "Failed to mark attendance."
          : "Something went wrong.";
      setMarkError(msg);
    },
  });

  const handleMark = () => {
    if (!selectedDayId) { setMarkError("Please select a conference day."); return; }
    setSuccessMsg(null);
    setMarkError(null);
    markMutation.mutate({ pCode: passCode, dayId: selectedDayId });
  };

  if (authPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-slate-400">progress_activity</span>
      </div>
    );
  }

  const moderatorName = me?.admin?.name ?? me?.email ?? "Moderator";

  return (
    <ModeratorPortalShell moderatorName={moderatorName}>
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <Link
            href="/moderator/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-secondary sm:gap-2 sm:text-sm"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-black tracking-tight text-charcoal sm:text-2xl">Speaker / Guest Pass</h1>
          <p className="mt-2 text-xs text-slate-600 sm:text-sm">Review details and mark attendance</p>
        </div>

        {activeDays && activeDays.length > 0 && (
          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-secondary">
              Conference Day
            </label>
            <select
              value={selectedDayId}
              onChange={(e) => { setSelectedDayId(e.target.value); setSuccessMsg(null); setMarkError(null); }}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-charcoal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {activeDays.map((d: EventDay) => (
                <option key={d.id} value={d.id}>
                  {d.label} — {new Date(d.date).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                </option>
              ))}
            </select>
          </div>
        )}

        {!activeDays || activeDays.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center shadow-sm">
            <span className="material-symbols-outlined mb-3 block text-4xl text-amber-400">warning</span>
            <p className="font-bold text-amber-700">No active conference day</p>
            <p className="mt-2 text-sm text-amber-600">Attendance marking is disabled until an active day is set.</p>
          </div>
        ) : null}

        {scanLoading && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-primary/5 bg-white px-6 py-10 text-slate-500 shadow-sm">
            <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
            <span>Loading pass info…</span>
          </div>
        )}

        {!scanLoading && scanError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center shadow-sm">
            <span className="material-symbols-outlined mb-3 block text-4xl text-red-400">error</span>
            <p className="font-bold text-red-700">
              {scanError instanceof ApiError ? scanError.message : "Invalid or unrecognised pass."}
            </p>
          </div>
        )}

        {!scanLoading && scanResult && (
          <>
            <SpeakerCard result={scanResult} />

            {successMsg && (
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-5 py-4 text-green-700 shadow-sm">
                <span className="material-symbols-outlined text-xl">check_circle</span>
                <span className="font-bold">{successMsg}</span>
              </div>
            )}
            {markError && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700 shadow-sm">
                {markError}
              </div>
            )}

            {activeDays && activeDays.length > 0 && (
              <div className="mt-5">
                {scanResult.admitted ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 px-5 py-4 text-green-700">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    <span className="font-semibold">Already admitted today</span>
                  </div>
                ) : (
                  <button
                    onClick={handleMark}
                    disabled={markMutation.isPending}
                    className="w-full rounded-xl bg-primary px-5 py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-primary/25 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {markMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                        Marking…
                      </span>
                    ) : (
                      `Admit ${KIND_LABELS[scanResult.kind] ?? "Guest"}`
                    )}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </ModeratorPortalShell>
  );
}

function SpeakerCard({ result }: { result: SpeakerScanResult }) {
  const kindLabel = KIND_LABELS[result.kind] ?? "Guest";
  const pillColor =
    result.kind === "speaker"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : "bg-amber-50 border-amber-200 text-amber-800";

  return (
    <div className="rounded-xl border border-secondary/20 bg-white p-4 shadow-lg shadow-secondary/10 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        {result.avatar ? (
          <Image
            src={result.avatar}
            alt={result.name}
            width={56}
            height={56}
            className="size-14 rounded-full object-cover border-2 border-slate-200"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-full bg-secondary/10 border-2 border-secondary/20 text-xl font-black text-secondary">
            {result.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${pillColor}`}>
            {kindLabel}
          </span>
          <h2 className="mt-1 text-lg font-black text-charcoal truncate sm:text-xl">{result.name}</h2>
          <p className="text-sm font-medium text-slate-600">{result.role}</p>
          <p className="text-xs text-slate-400 italic">{result.qualifications}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
        <span className="text-slate-500">Today&apos;s status</span>
        {result.admitted ? (
          <span className="inline-flex items-center gap-1 font-bold text-green-600">
            <span className="material-symbols-outlined text-base">check_circle</span>
            Admitted
            {result.markedAt && (
              <span className="ml-1 text-xs font-normal text-slate-400">
                at {new Date(result.markedAt).toLocaleTimeString("en-NG", { timeStyle: "short" })}
              </span>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined text-base">radio_button_unchecked</span>
            Not yet admitted
          </span>
        )}
      </div>
    </div>
  );
}
