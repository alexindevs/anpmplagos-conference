"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getScanDetails, markAttendance, getActiveDays, type ScanResult, type EventDay } from "@/lib/api";
import { getMe, isModeratorUser } from "@/lib/auth-api";
import { ApiError } from "@/lib/api";
import { ModeratorPortalShell } from "../../components/ModeratorPortalShell";

const TIER_LABELS: Record<string, string> = {
  default: "No Tier",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  headliner: "Headliner",
};

const TIER_COLORS: Record<string, string> = {
  bronze: "text-orange-700 bg-orange-50 border-orange-200",
  silver: "text-slate-600 bg-slate-100 border-slate-300",
  gold: "text-yellow-700 bg-yellow-50 border-yellow-200",
  platinum: "text-indigo-700 bg-indigo-50 border-indigo-200",
  headliner: "text-purple-700 bg-purple-50 border-purple-200",
  default: "text-slate-500 bg-slate-50 border-slate-200",
};

export default function ScanPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth guard
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

  // Active days
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

  // Scan details
  const {
    data: scanResult,
    isPending: scanLoading,
    error: scanError,
    refetch: refetchScan,
  } = useQuery({
    queryKey: ["attendance", "scan", userId, selectedDayId],
    queryFn: () => getScanDetails(userId, selectedDayId || undefined),
    enabled: !!me && isModeratorUser(me) && !!userId,
    retry: false,
  });

  // Mark attendance
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [markError, setMarkError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const markMutation = useMutation({
    mutationFn: ({ uid, dayId, opts }: { uid: string; dayId: string; opts?: { guestName?: string; guestPhone?: string } }) =>
      markAttendance(uid, dayId, opts),
    onSuccess: (data) => {
      setSuccessMsg(data.message);
      setMarkError(null);
      setGuestName("");
      setGuestPhone("");
      queryClient.invalidateQueries({ queryKey: ["attendance", "scan", userId] });
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
    if (!selectedDayId) {
      setMarkError("Please select a conference day.");
      return;
    }
    if (scanResult?.regType === "company") {
      if (!guestName.trim()) { setMarkError("Delegate name is required."); return; }
      if (!guestPhone.trim()) { setMarkError("Delegate phone is required."); return; }
    }
    setSuccessMsg(null);
    setMarkError(null);
    const opts = scanResult?.regType === "company"
      ? { guestName: guestName.trim(), guestPhone: guestPhone.trim() }
      : undefined;
    markMutation.mutate({ uid: userId, dayId: selectedDayId, opts });
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
        {/* Back button */}
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
          <h1 className="text-xl font-black tracking-tight text-charcoal sm:text-2xl">Scan Result</h1>
          <p className="mt-2 text-xs text-slate-600 sm:text-sm">Review delegate details and mark attendance</p>
        </div>
        {/* Day selector */}
        {activeDays && activeDays.length > 0 && (
          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-secondary">
              Conference Day
            </label>
            <select
              value={selectedDayId}
              onChange={(e) => {
                setSelectedDayId(e.target.value);
                setSuccessMsg(null);
                setMarkError(null);
              }}
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

        {/* Scan result */}
        {scanLoading && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-primary/5 bg-white px-6 py-10 text-slate-500 shadow-sm">
            <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
            <span>Loading delegate info…</span>
          </div>
        )}

        {!scanLoading && scanError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center shadow-sm">
            <span className="material-symbols-outlined mb-3 block text-4xl text-red-400">error</span>
            <p className="font-bold text-red-700">
              {scanError instanceof ApiError ? scanError.message : "Failed to load delegate info."}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              The QR code may be invalid, or this account cannot be marked for attendance.
            </p>
          </div>
        )}

        {!scanLoading && scanResult && (
          <>
            {scanResult.regType === "member" && (
              <MemberCard result={scanResult} />
            )}
            {scanResult.regType === "attendee" && (
              <AttendeeCard result={scanResult} />
            )}
            {scanResult.regType === "company" && (
              <CompanyCard result={scanResult} />
            )}

            {/* Delegate name+phone form for company admits */}
            {scanResult.regType === "company" && !scanResult.alreadyFull && activeDays && activeDays.length > 0 && (
              <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Delegate Details (required)</p>
                <input
                  type="text"
                  placeholder="Full name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {/* Success / Error messages */}
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

            {/* Mark button */}
            {activeDays && activeDays.length > 0 && (
              <div className="mt-5">
                {scanResult.alreadyFull ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-slate-500">
                    <span className="material-symbols-outlined text-xl">block</span>
                    <span className="font-semibold">
                      {scanResult.regType === "company"
                        ? "All entry slots used for today"
                        : "Already marked attending for today"}
                    </span>
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
                    ) : scanResult.regType === "member" && scanResult.todayEntries.length === 1 && scanResult.hasSpouse ? (
                      "Mark Spouse Entry"
                    ) : scanResult.regType === "company" ? (
                      `Permit Entry (${(scanResult.todayEntries?.length ?? 0) + 1} of ${scanResult.maxEntries})`
                    ) : (
                      "Mark Attending"
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

// ── Card components ──────────────────────────────────────────────────────────

function AvatarOrInitials({ src, name }: { src?: string | null; name: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={56}
        height={56}
        className="size-14 rounded-full object-cover border-2 border-slate-200"
      />
    );
  }
  return (
    <div className="flex size-14 items-center justify-center rounded-full bg-secondary/10 border-2 border-secondary/20 text-xl font-black text-secondary">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function EntryPips({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`inline-block size-3 rounded-full border-2 ${i < filled ? "bg-green-500 border-green-500" : "bg-transparent border-slate-300"}`}
        />
      ))}
    </div>
  );
}

function MemberCard({ result }: { result: ScanResult }) {
  const filled = result.todayEntries.length;
  const total = result.hasSpouse ? 2 : 1;

  return (
    <div className="rounded-xl border border-secondary/20 bg-white p-4 shadow-lg shadow-secondary/10 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <AvatarOrInitials src={result.avatar} name={result.name} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">ANPMP Member</p>
          <h2 className="mt-1 text-lg font-black text-charcoal truncate sm:text-xl">{result.name}</h2>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
          <span className="text-slate-500">Today&apos;s entries</span>
          <div className="flex items-center gap-2">
            <EntryPips filled={filled} total={total} />
            <span className="text-xs font-bold text-charcoal">{filled}/{total}</span>
          </div>
        </div>

        {result.hasSpouse && (
          <div className="rounded-xl border border-secondary/15 bg-secondary/5 px-3 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-1.5">Spouse / Plus-one</p>
            <p className="font-semibold text-charcoal">{result.spouseName || "—"}</p>
            {result.spouseEmail && <p className="text-xs text-slate-500 mt-0.5">{result.spouseEmail}</p>}
            {result.spousePhone && <p className="text-xs text-slate-500">{result.spousePhone}</p>}
            <div className="mt-1.5 flex items-center gap-1">
              {filled >= 2 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                  <span className="material-symbols-outlined text-sm">check_circle</span> Spouse admitted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-sm">pending</span> Not yet admitted
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AttendeeCard({ result }: { result: ScanResult }) {
  const admitted = result.todayEntries.length >= 1;

  return (
    <div className="rounded-xl border border-secondary/20 bg-white p-4 shadow-lg shadow-secondary/10 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <AvatarOrInitials src={result.avatar} name={result.name} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">Conference Attendee</p>
          <h2 className="mt-1 text-lg font-black text-charcoal truncate sm:text-xl">{result.name}</h2>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
        <span className="text-slate-500">Today&apos;s status</span>
        {admitted ? (
          <span className="inline-flex items-center gap-1 font-bold text-green-600">
            <span className="material-symbols-outlined text-base">check_circle</span> Marked attending
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined text-base">radio_button_unchecked</span> Not yet marked
          </span>
        )}
      </div>
    </div>
  );
}

function CompanyCard({ result }: { result: ScanResult }) {
  const used = result.todayEntries.length;
  const max = result.maxEntries ?? 1;
  const tier = result.tier ?? "default";
  const tierColor = TIER_COLORS[tier] ?? TIER_COLORS.default;

  return (
    <div className="rounded-xl border border-secondary/20 bg-white p-4 shadow-lg shadow-secondary/10 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <AvatarOrInitials src={result.avatar} name={result.name} />
        <div className="flex-1 min-w-0">
          <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold sm:px-2.5 sm:py-1 ${tierColor}`}>
            {TIER_LABELS[tier] ?? tier} Tier
          </span>
          <h2 className="mt-1 text-lg font-black text-charcoal truncate sm:text-xl">{result.name}</h2>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
          <span className="text-slate-500">Entries permitted today</span>
          <div className="flex items-center gap-2">
            <EntryPips filled={used} total={max} />
            <span className="text-xs font-bold text-charcoal">{used}/{max}</span>
          </div>
        </div>
        {result.todayEntries.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Admitted today</p>
            <ul className="space-y-1">
              {result.todayEntries.map((e) => (
                <li key={e.entryIndex} className="flex items-center gap-2 text-xs">
                  <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-bold">{e.entryIndex}</span>
                  <span className="font-medium text-charcoal">{e.guestName ?? "—"}</span>
                  {e.guestPhone && <span className="text-slate-400">{e.guestPhone}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {used >= max && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-primary">
            <span className="material-symbols-outlined text-base">block</span>
            Maximum entries reached for this tier
          </div>
        )}
      </div>
    </div>
  );
}
