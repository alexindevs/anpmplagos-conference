"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminConferenceDays,
  createAdminConferenceDay,
  updateAdminConferenceDay,
  deleteAdminConferenceDay,
  listModeratorsAdmin,
  inviteModeratorAdmin,
  deactivateModeratorAdmin,
  revokeModeratorInvite,
  getAdminDayAttendanceSummary,
  downloadAttendancePdf,
  type EventDay,
  type ModeratorSummary,
  type PendingInvite,
  type AttendanceSummary,
} from "@/lib/api";
import { ApiError } from "@/lib/api";

const Q_DAYS = ["admin", "conference-days"] as const;
const Q_MODS = ["admin", "moderators"] as const;

function formatDateLocal(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toDateInputValue(iso: string) {
  return iso.slice(0, 10);
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-charcoal dark:text-white">Attendance Management</h2>
            <p className="text-sm text-slate-500 dark:text-white/50">
              Manage conference days, attendance moderators, and view check-in records.
            </p>
          </div>
          <PdfDownloadWidget isAdmin />
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        <div className="space-y-10">
          <ConferenceDaysSection onSelectDay={setSelectedDayId} selectedDayId={selectedDayId} />
          <ModeratorsSection />
          {selectedDayId && <AttendanceSummarySection dayId={selectedDayId} />}
        </div>
      </div>
    </>
  );
}

// ─── PDF Download Widget ────────────────────────────────────────────────────

function PdfDownloadWidget({ isAdmin }: { isAdmin: boolean }) {
  const { data: days } = useQuery({
    queryKey: ["admin", "conference-days"],
    queryFn: getAdminConferenceDays,
    staleTime: 30_000,
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
        isAdmin,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Download failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shrink-0 rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
        Download Report
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-background-light px-3 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white sm:flex-1"
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
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-bold text-white hover:bg-secondary/90 disabled:opacity-50 sm:w-auto"
        >
          <span className="material-symbols-outlined text-base">
            {loading ? "progress_activity" : "picture_as_pdf"}
          </span>
          {loading ? "Generating…" : "PDF"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-700 dark:text-red-300">{error}</p>}
    </div>
  );
}

// ─── Conference Days Section ────────────────────────────────────────────────

function ConferenceDaysSection({
  onSelectDay,
  selectedDayId,
}: {
  onSelectDay: (id: string) => void;
  selectedDayId: string | null;
}) {
  const qc = useQueryClient();

  const { data: days, isPending } = useQuery({
    queryKey: Q_DAYS,
    queryFn: getAdminConferenceDays,
  });

  const [showForm, setShowForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newActive, setNewActive] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDate, setEditDate] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: { label: string; date: string; isActive: boolean }) =>
      createAdminConferenceDay(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: Q_DAYS });
      setShowForm(false);
      setNewLabel("");
      setNewDate("");
      setNewActive(false);
      setFormError(null);
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : "Failed to create day.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ label: string; date: string; isActive: boolean }> }) =>
      updateAdminConferenceDay(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: Q_DAYS });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminConferenceDay(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: Q_DAYS }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newDate) { setFormError("Label and date are required."); return; }
    createMutation.mutate({ label: newLabel.trim(), date: newDate, isActive: newActive });
  };

  const startEdit = (day: EventDay) => {
    setEditingId(day.id);
    setEditLabel(day.label);
    setEditDate(toDateInputValue(day.date));
  };

  const saveEdit = (day: EventDay) => {
    updateMutation.mutate({ id: day.id, data: { label: editLabel, date: editDate } });
  };

  const toggleActive = (day: EventDay) => {
    updateMutation.mutate({ id: day.id, data: { isActive: !day.isActive } });
  };

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-charcoal dark:text-white">Conference Days</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 sm:w-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Day
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 space-y-4 rounded-xl border border-primary/5 bg-white p-5 shadow-sm dark:border-border-dark dark:bg-background-dark-soft sm:p-6"
        >
          <h3 className="font-bold text-charcoal dark:text-white">New Conference Day</h3>
          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">{formError}</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">Label</label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Day 1"
                className="w-full rounded-lg border border-slate-200 bg-background-light px-3 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-background-light px-3 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newActive}
              onChange={(e) => setNewActive(e.target.checked)}
              className="rounded"
            />
            <span>Activate immediately</span>
          </label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
            >
              {createMutation.isPending ? "Saving…" : "Save Day"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormError(null); }}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium dark:border-border-dark sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isPending && (
        <div className="flex items-center gap-2 text-slate-400 dark:text-white/50 py-6">
          <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
          Loading…
        </div>
      )}

      {!isPending && (!days || days.length === 0) && (
        <p className="rounded-xl border border-primary/5 bg-white py-10 text-center text-sm text-slate-500 dark:border-border-dark dark:bg-background-dark-soft dark:text-white/50">
          No conference days yet. Add one above.
        </p>
      )}

      {days && days.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-primary/5 dark:border-border-dark dark:bg-background-dark-softer">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Label</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5 dark:divide-border-dark">
              {days.map((day: EventDay) => (
                <tr key={day.id} className={`transition-colors hover:bg-primary/5 dark:hover:bg-background-dark-softer ${selectedDayId === day.id ? "bg-secondary/5 dark:bg-secondary/10" : ""}`}>
                  <td className="px-4 py-4 sm:px-6">
                    {editingId === day.id ? (
                      <input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-background-light px-2 py-1 text-sm outline-none focus:border-primary dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
                      />
                    ) : (
                      <span className="font-bold text-charcoal dark:text-white">{day.label}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-white/70 sm:px-6">
                    {editingId === day.id ? (
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-background-light px-2 py-1 text-sm outline-none focus:border-primary dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
                      />
                    ) : (
                      formatDateLocal(day.date)
                    )}
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <button
                      onClick={() => toggleActive(day)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                        day.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${day.isActive ? "bg-green-500" : "bg-slate-400"}`} />
                      {day.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap gap-2">
                      {editingId === day.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(day)}
                            disabled={updateMutation.isPending}
                            className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-white hover:bg-secondary/90 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium dark:border-border-dark"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { onSelectDay(day.id); }}
                            className="rounded-lg bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary hover:bg-secondary/20"
                          >
                            View
                          </button>
                          <button
                            onClick={() => startEdit(day)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-border-dark dark:hover:bg-background-dark-softer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${day.label}"? This will also delete all attendance records for this day.`)) {
                                deleteMutation.mutate(day.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/30"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ─── Moderators Section ─────────────────────────────────────────────────────

function ModeratorsSection() {
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const { data, isPending } = useQuery({
    queryKey: Q_MODS,
    queryFn: listModeratorsAdmin,
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) => inviteModeratorAdmin(email),
    onSuccess: (res) => {
      setInviteSuccess(res.message);
      setInviteEmail("");
      setInviteError(null);
      qc.invalidateQueries({ queryKey: Q_MODS });
      setTimeout(() => setInviteSuccess(null), 5000);
    },
    onError: (err) => {
      setInviteError(err instanceof ApiError ? err.message : "Failed to send invite.");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateModeratorAdmin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: Q_MODS }),
  });

  const revokeInviteMutation = useMutation({
    mutationFn: (id: string) => revokeModeratorInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: Q_MODS }),
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate(inviteEmail.trim().toLowerCase());
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-charcoal dark:text-white">Attendance Moderators</h2>
        <button
          onClick={() => setShowInvite((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          Add Moderator
        </button>
      </div>

      {showInvite && (
        <form
          onSubmit={handleInvite}
          className="mb-6 rounded-xl border border-primary/5 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft"
        >
          <h3 className="mb-4 font-bold text-charcoal dark:text-white">Invite New Moderator</h3>
          {inviteError && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">{inviteError}</p>
          )}
          {inviteSuccess && (
            <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">{inviteSuccess}</p>
          )}
            <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="moderator@example.com"
              required
              className="w-full rounded-lg border border-slate-200 bg-background-light px-4 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white sm:flex-1"
            />
            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
            >
              {inviteMutation.isPending ? "Sending…" : "Send Invite"}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-white/50">
            The moderator will receive an email with a link to set up their account (expires in 7 days).
          </p>
        </form>
      )}

      {isPending && (
        <div className="flex items-center gap-2 text-slate-400 dark:text-white/50 py-6">
          <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
          Loading…
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Active moderators */}
          {data.moderators.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
              <div className="border-b border-primary/10 bg-primary/5 px-6 py-3 dark:border-border-dark dark:bg-background-dark-softer">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Active Moderators</p>
              </div>
              <ul className="divide-y divide-primary/5 dark:divide-border-dark">
                {data.moderators.map((mod: ModeratorSummary) => (
                  <li key={mod.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <p className="font-bold text-charcoal dark:text-white">{mod.name}</p>
                      <p className="text-xs text-slate-500 dark:text-white/50">{mod.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Deactivate ${mod.email}? They will be logged out of all devices.`)) {
                          deactivateMutation.mutate(mod.id);
                        }
                      }}
                      className="w-full rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/30 sm:w-auto"
                    >
                      Deactivate
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pending invites */}
          {data.pendingInvites.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm dark:border-amber-900/50 dark:bg-background-dark-soft">
              <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Pending Invites</p>
              </div>
              <ul className="divide-y divide-amber-100 dark:divide-amber-900/30">
                {data.pendingInvites.map((invite: PendingInvite) => (
                  <li key={invite.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <p className="font-bold text-charcoal dark:text-white">{invite.email}</p>
                      <p className="text-xs text-slate-500 dark:text-white/50">
                        Expires {new Date(invite.expiresAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                      </p>
                    </div>
                    <button
                      onClick={() => revokeInviteMutation.mutate(invite.id)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-border-dark dark:hover:bg-background-dark-softer sm:w-auto"
                    >
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.moderators.length === 0 && data.pendingInvites.length === 0 && (
            <p className="rounded-xl border border-primary/5 bg-white py-10 text-center text-sm text-slate-500 dark:border-border-dark dark:bg-background-dark-soft dark:text-white/50">
              No moderators yet. Invite someone to get started.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Attendance Summary Section ─────────────────────────────────────────────

function AttendanceSummarySection({ dayId }: { dayId: string }) {
  const { data: days } = useQuery({
    queryKey: Q_DAYS,
    queryFn: getAdminConferenceDays,
  });

  const day = days?.find((d: EventDay) => d.id === dayId);

  const { data: summary, isPending } = useQuery({
    queryKey: ["admin", "attendance-summary", dayId],
    queryFn: () => getAdminDayAttendanceSummary(dayId),
    enabled: !!dayId,
  });

  return (
    <section>
      <h2 className="mb-6 text-lg font-bold text-charcoal dark:text-white">
        Attendance: <span className="text-secondary">{day?.label ?? "Selected Day"}</span>
      </h2>

      {isPending && (
        <div className="flex items-center gap-2 text-slate-400 dark:text-white/50 py-6">
          <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
          Loading…
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon="family_restroom"
            label="Members"
            value={summary.members.uniqueCheckedIn}
            sub={`${summary.members.memberEntries} member + ${summary.members.spouseEntries} spouse entries`}
          />
          <StatCard
            icon="person"
            label="Attendees"
            value={summary.attendees.uniqueCheckedIn}
            sub="Unique attendees checked in"
          />
          <StatCard
            icon="business"
            label="Companies"
            value={summary.companies.uniqueCompanies}
            sub={`${summary.companies.totalEntries} total rep entries`}
          />
        </div>
      )}
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-primary/5 bg-white p-5 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-2xl text-secondary">{icon}</span>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">{label}</p>
      </div>
      <p className="mt-3 text-4xl font-black text-charcoal dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-white/50">{sub}</p>
    </div>
  );
}
