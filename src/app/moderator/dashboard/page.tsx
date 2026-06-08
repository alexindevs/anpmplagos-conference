"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getActiveDays,
  getAllDaysForModerator,
  getDayCheckins,
  downloadAttendancePdf,
  type EventDay,
  type CheckinRecord,
  ApiError,
} from "@/lib/api";
import { getMe, isModeratorUser } from "@/lib/auth-api";
import { ModeratorPortalShell } from "../components/ModeratorPortalShell";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function checkinName(r: CheckinRecord): string {
  // Prefer the collected delegate/spouse name when available
  if (r.guestName) return r.guestName;
  return (
    r.user.member?.fullName ??
    r.user.attendee?.fullName ??
    r.user.company?.companyName ??
    r.user.email
  );
}

function checkinInitial(r: CheckinRecord): string {
  const n = checkinName(r);
  return n.charAt(0).toUpperCase();
}

function checkinSubDetail(r: CheckinRecord): string | null {
  if (r.user.regType === "company" && r.guestName) {
    return r.user.company?.companyName ?? "";
  }
  if (r.user.regType === "member" && r.entryIndex === 2 && r.guestName) {
    return `Spouse of ${r.user.member?.fullName ?? "member"}`;
  }
  return null;
}

const TYPE_STYLE: Record<string, string> = {
  member: "bg-blue-50 text-blue-700",
  attendee: "bg-green-50 text-green-700",
  company: "bg-purple-50 text-purple-700",
};

const TYPE_LABEL: Record<string, string> = {
  member: "Member",
  attendee: "Attendee",
  company: "Company",
};

const INITIAL_BG: Record<string, string> = {
  member: "bg-blue-100 text-blue-700",
  attendee: "bg-green-100 text-green-700",
  company: "bg-purple-100 text-purple-700",
};

// ─── Checkins list ─────────────────────────────────────────────────────────

function DayCheckinList({ dayId }: { dayId: string }) {
  const { data, isPending, dataUpdatedAt } = useQuery({
    queryKey: ["moderator", "checkins", dayId],
    queryFn: () => getDayCheckins(dayId, 1, 200),
    refetchInterval: 30_000,
  });

  const records = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-secondary">how_to_reg</span>
          <h4 className="text-sm font-bold text-charcoal">
            Checked in
            <span className="ml-1.5 rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-bold text-secondary">
              {total}
            </span>
          </h4>
        </div>
        {dataUpdatedAt > 0 && (
          <span className="text-[10px] text-slate-400">
            Updated {formatTime(new Date(dataUpdatedAt).toISOString())}
          </span>
        )}
      </div>

      {isPending && (
        <div className="flex items-center gap-2 py-4 text-slate-400">
          <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
          <span className="text-xs">Loading…</span>
        </div>
      )}

      {!isPending && records.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center">
          <span className="material-symbols-outlined mb-1 block text-2xl text-slate-300">
            person_search
          </span>
          <p className="text-xs text-slate-400">No check-ins yet</p>
        </div>
      )}

      {records.length > 0 && (
        <div className="divide-y divide-slate-50 rounded-lg border border-slate-100 bg-slate-50/50 overflow-hidden">
          {records.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 bg-white hover:bg-slate-50/80 transition-colors">
              {/* Avatar initial */}
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${INITIAL_BG[r.user.regType] ?? "bg-slate-100 text-slate-600"}`}
              >
                {checkinInitial(r)}
              </div>

              {/* Name + type */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-charcoal leading-tight">
                  {checkinName(r)}
                </p>
                {checkinSubDetail(r) && (
                  <p className="truncate text-[10px] text-slate-400 leading-tight">
                    {checkinSubDetail(r)}
                  </p>
                )}
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TYPE_STYLE[r.user.regType] ?? "bg-slate-100 text-slate-600"}`}
                  >
                    {TYPE_LABEL[r.user.regType] ?? r.user.regType}
                  </span>
                  {r.entryIndex > 1 && (
                    <span className="text-[10px] text-slate-400">
                      Entry {r.entryIndex}
                    </span>
                  )}
                </div>
              </div>

              {/* Time */}
              <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                {formatTime(r.markedAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Day card ───────────────────────────────────────────────────────────────

function DayCard({ day }: { day: EventDay }) {
  const [showList, setShowList] = useState(true);

  return (
    <div className="rounded-xl border border-secondary/20 bg-white p-4 shadow-lg shadow-secondary/10 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 sm:px-3 sm:py-1">
            <span className="size-1.5 rounded-full bg-green-500 sm:size-2" />
            Active
          </span>
          <h3 className="mt-2 text-lg font-black text-charcoal sm:text-xl">{day.label}</h3>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">{formatDate(day.date)}</p>
        </div>
        <span className="material-symbols-outlined text-3xl text-secondary sm:text-4xl">today</span>
      </div>

      <div className="mt-4 rounded-lg bg-secondary/5 px-3 py-3 text-xs text-slate-700 sm:mt-5 sm:px-4 sm:py-4 sm:text-sm">
        <span className="material-symbols-outlined mr-1.5 text-base align-middle">qr_code_scanner</span>
        Scan a delegate QR code — it will open directly in your browser to mark attendance for this day.
      </div>

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setShowList((v) => !v)}
        className="mt-4 flex w-full items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-secondary/20 hover:bg-secondary/5 hover:text-secondary transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">format_list_bulleted</span>
          {showList ? "Hide" : "Show"} attendance list
        </span>
        <span className="material-symbols-outlined text-base">
          {showList ? "expand_less" : "expand_more"}
        </span>
      </button>

      {showList && <DayCheckinList dayId={day.id} />}
    </div>
  );
}

// ─── PDF widget ─────────────────────────────────────────────────────────────

function ModeratorPdfWidget() {
  const { data: days } = useQuery({
    queryKey: ["moderator", "all-days-for-pdf"],
    queryFn: getAllDaysForModerator,
    staleTime: 60_000,
  });

  const [selectedDay, setSelectedDay] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      await downloadAttendancePdf(
        selectedDay === "all" ? undefined : selectedDay,
        false,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Download failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm sm:p-5">
      <p className="mb-3 text-xs text-slate-600 sm:mb-4 sm:text-sm">
        Download a PDF list of all check-ins for a specific day or all days.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:flex-1 sm:px-4"
        >
          <option value="all">All Days</option>
          {days?.map((d: EventDay) => (
            <option key={d.id} value={d.id}>
              {d.label} — {new Date(d.date).toLocaleDateString("en-NG", { dateStyle: "medium" })}
            </option>
          ))}
        </select>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-white hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>
            {loading ? "progress_activity" : "picture_as_pdf"}
          </span>
          {loading ? "Generating…" : "Download PDF"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs font-medium text-red-700 sm:mt-3">{error}</p>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ModeratorDashboardPage() {
  const router = useRouter();

  const { data: me, isPending: authPending } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!authPending && me && !isModeratorUser(me)) router.replace("/login");
    if (!authPending && !me) router.replace("/login");
  }, [authPending, me, router]);

  const { data: activeDays, isPending: daysLoading, refetch } = useQuery({
    queryKey: ["moderator", "active-days"],
    queryFn: getActiveDays,
    enabled: !!me && isModeratorUser(me),
    refetchInterval: 60_000,
  });

  if (authPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-slate-400">
          progress_activity
        </span>
      </div>
    );
  }

  const moderatorName = me?.admin?.name ?? me?.email ?? "Moderator";

  return (
    <ModeratorPortalShell moderatorName={moderatorName}>
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl font-black tracking-tight text-charcoal sm:text-2xl">
            Welcome, <span className="text-primary">{moderatorName}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Scan delegate QR codes to mark attendance for today&apos;s conference sessions.
          </p>
        </div>

        {/* Active Days + Checkins */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-charcoal sm:text-lg">
              Today&apos;s Conference Day
            </h2>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1 text-xs font-medium text-secondary hover:text-primary sm:text-sm"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {daysLoading && (
            <div className="flex items-center gap-2 rounded-xl border border-primary/5 bg-white px-6 py-8 text-slate-500 shadow-sm">
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              <span>Loading…</span>
            </div>
          )}

          {!daysLoading && (!activeDays || activeDays.length === 0) && (
            <div className="rounded-xl border border-primary/5 bg-white px-6 py-12 text-center shadow-sm">
              <span className="material-symbols-outlined mb-3 block text-4xl text-slate-300">
                event_busy
              </span>
              <p className="font-bold text-slate-600">No active conference day today</p>
              <p className="mt-2 text-sm text-slate-500">
                Check back when an event day has been activated by the admin team.
              </p>
            </div>
          )}

          {activeDays && activeDays.length > 0 && (
            <div className="space-y-4">
              {activeDays.map((day: EventDay) => (
                <DayCard key={day.id} day={day} />
              ))}
            </div>
          )}
        </section>

        {/* PDF Download */}
        <section className="mt-8 sm:mt-10">
          <h2 className="mb-3 text-sm font-bold text-charcoal sm:text-base">Attendance Report</h2>
          <ModeratorPdfWidget />
        </section>

        {/* Instructions */}
        <section className="mt-8 sm:mt-10">
          <h2 className="mb-4 text-base font-bold text-charcoal sm:text-lg">
            How to mark attendance
          </h2>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm sm:p-6">
            <ol className="space-y-3 text-xs text-slate-700 sm:space-y-4 sm:text-sm">
              <li className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  1
                </span>
                <span className="pt-0.5">
                  Ask the delegate to show their conference QR code (on their phone or printed).
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  2
                </span>
                <span className="pt-0.5">
                  Scan the QR code with your phone camera — it will open a page in this browser.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  3
                </span>
                <span className="pt-0.5">
                  Review the delegate&apos;s details and tap &quot;Mark Attending&quot; for the active
                  conference day.
                </span>
              </li>
            </ol>
          </div>
        </section>
      </main>
    </ModeratorPortalShell>
  );
}
