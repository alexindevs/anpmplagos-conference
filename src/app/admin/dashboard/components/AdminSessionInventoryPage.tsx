"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  type ConferenceDay,
  type CreateAdminSessionSlotInput,
  type PatchAdminSessionSlotPayload,
  formatKoboToNaira,
  type SessionSlotDuration,
  type SessionStatus,
} from "@/lib/api";

export type SessionInventoryRow = {
  id: string;
  title: string;
  description?: string;
  priceInKobo?: number;
  slotDuration?: SessionSlotDuration;
  conferenceDay?: ConferenceDay;
  status: SessionStatus;
  isTaken?: boolean;
  isReserved?: boolean;
  takenBy?: { id: string; companyName: string } | null;
};

export interface AdminSessionInventoryConfig {
  title: string;
  subtitle: string;
  queryKey: readonly string[];
  addButtonLabel: string;
  createDefaults: { title: string; description: string };
  /** When true, create/edit collect `slotDuration` and `conferenceDay` (masterclasses & presentations). */
  collectSlotShape?: boolean;
  list: () => Promise<SessionInventoryRow[]>;
  create: (body: CreateAdminSessionSlotInput) => Promise<unknown>;
  patch: (id: string, body: PatchAdminSessionSlotPayload) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
}

const SLOT_DURATION_OPTIONS: { value: SessionSlotDuration; label: string }[] = [
  { value: "m10", label: "10 min" },
  { value: "m15", label: "15 min" },
  { value: "m20", label: "20 min" },
  { value: "m30", label: "30 min" },
  { value: "m45", label: "45 min" },
  { value: "h1", label: "1 hour" },
  { value: "h2", label: "2 hours" },
];

const CONFERENCE_DAY_OPTIONS: { value: ConferenceDay; label: string }[] = [
  { value: "day_1", label: "Day 1" },
  { value: "day_2", label: "Day 2" },
];

function slotDurationLabel(v?: SessionSlotDuration): string {
  if (!v) return "—";
  return SLOT_DURATION_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

function conferenceDayLabel(v?: ConferenceDay): string {
  if (!v) return "—";
  return CONFERENCE_DAY_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

function parseNairaToKobo(input: string): number {
  const n = parseFloat(String(input).replace(/,/g, "").trim());
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function koboToNairaField(k?: number): string {
  if (k == null || Number.isNaN(k)) return "";
  return String(k / 100);
}

export function AdminSessionInventoryPage({ config }: { config: AdminSessionInventoryConfig }) {
  const collectSlotShape = Boolean(config.collectSlotShape);
  const tableColCount = collectSlotShape ? 8 : 6;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SessionStatus | "">("");
  const [modal, setModal] = useState<
    | { mode: "create" }
    | { mode: "edit"; row: SessionInventoryRow }
    | null
  >(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriceNaira, setFormPriceNaira] = useState("");
  const [formSlotDuration, setFormSlotDuration] = useState<SessionSlotDuration>("m30");
  const [formConferenceDay, setFormConferenceDay] = useState<ConferenceDay>("day_1");
  const [formStatus, setFormStatus] = useState<SessionStatus>("draft");
  const [formReserved, setFormReserved] = useState(false);
  const [formQuantity, setFormQuantity] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: [...config.queryKey],
    queryFn: config.list,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [...config.queryKey] });

  const createMutation = useMutation({
    mutationFn: () => {
      const priceInKobo = parseNairaToKobo(formPriceNaira);
      const body: CreateAdminSessionSlotInput = {
        title: formTitle.trim() || config.createDefaults.title,
        description: formDescription.trim() || config.createDefaults.description,
        priceInKobo,
        quantity: formQuantity > 1 ? formQuantity : undefined,
      };
      if (collectSlotShape) {
        body.slotDuration = formSlotDuration;
        body.conferenceDay = formConferenceDay;
      }
      return config.create(body);
    },
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (e) => setFormError(e instanceof ApiError ? e.message : "Could not create slot."),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!modal || modal.mode !== "edit") throw new Error("No row");
      const priceInKobo = parseNairaToKobo(formPriceNaira);
      const body: PatchAdminSessionSlotPayload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        priceInKobo,
        status: formStatus,
        isReserved: formReserved,
      };
      if (collectSlotShape) {
        body.slotDuration = formSlotDuration;
        body.conferenceDay = formConferenceDay;
      }
      return config.patch(modal.row.id, body);
    },
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (e) => setFormError(e instanceof ApiError ? e.message : "Could not save changes."),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: PatchAdminSessionSlotPayload }) =>
      config.patch(id, body),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => config.remove(id),
    onSuccess: () => invalidate(),
  });

  const openCreate = () => {
    setFormTitle(config.createDefaults.title);
    setFormDescription(config.createDefaults.description);
    setFormPriceNaira("0");
    setFormSlotDuration("m30");
    setFormConferenceDay("day_1");
    setFormStatus("draft");
    setFormReserved(false);
    setFormQuantity(1);
    setFormError(null);
    setModal({ mode: "create" });
  };

  const openEdit = (row: SessionInventoryRow) => {
    setFormTitle(row.title);
    setFormDescription(row.description ?? "");
    setFormPriceNaira(koboToNairaField(row.priceInKobo));
    setFormSlotDuration(row.slotDuration ?? "m30");
    setFormConferenceDay(row.conferenceDay ?? "day_1");
    setFormStatus(row.status);
    setFormReserved(!!row.isReserved);
    setFormError(null);
    setModal({ mode: "edit", row });
  };

  const closeModal = () => {
    setModal(null);
    setFormError(null);
  };

  const filtered = useMemo(() => {
    const items = data ?? [];
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.takenBy?.companyName ?? "").toLowerCase().includes(q);
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const busy =
    createMutation.isPending || saveMutation.isPending || patchMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-charcoal dark:text-white sm:text-2xl">
              {config.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-white/50">{config.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 sm:w-auto"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {config.addButtonLabel}
          </button>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or buyer…"
              className="w-full rounded-lg border-none bg-background-light py-2 pl-10 pr-4 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SessionStatus | "")}
            className="w-full cursor-pointer rounded-lg border-none bg-background-light px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white sm:w-auto"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {deleteMutation.isError && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">
            {deleteMutation.error instanceof ApiError
              ? deleteMutation.error.message
              : "Could not delete slot."}
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 dark:border-border-dark dark:bg-background-dark-softer">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Title
                  </th>
                  {collectSlotShape ? (
                    <>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                        Day
                      </th>
                    </>
                  ) : null}
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Price
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Buyer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Hold
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 dark:divide-border-dark">
                {isLoading && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-slate-500 dark:text-white/50" colSpan={tableColCount}>
                      Loading…
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-primary" colSpan={tableColCount}>
                      Unable to load slots.
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && filtered.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-slate-500 dark:text-white/50" colSpan={tableColCount}>
                      No slots yet.
                    </td>
                  </tr>
                )}
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-primary/5 dark:hover:bg-background-dark-softer"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-charcoal dark:text-white">
                      {row.title}
                    </td>
                    {collectSlotShape ? (
                      <>
                        <td className="px-6 py-4 text-sm text-charcoal dark:text-white/90">
                          {slotDurationLabel(row.slotDuration)}
                        </td>
                        <td className="px-6 py-4 text-sm text-charcoal dark:text-white/90">
                          {conferenceDayLabel(row.conferenceDay)}
                        </td>
                      </>
                    ) : null}
                    <td className="px-6 py-4 text-sm text-charcoal dark:text-white/90">
                      {formatKoboToNaira(row.priceInKobo)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.status === "published"
                            ? "bg-secondary/10 text-secondary dark:bg-secondary/20"
                            : row.status === "cancelled"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                              : "bg-slate-200 text-slate-700 dark:bg-background-dark-softer dark:text-white/90"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal dark:text-white/90">
                      {row.isTaken && row.takenBy?.companyName ? row.takenBy.companyName : row.isTaken ? "Sold" : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/70">
                      {row.isReserved ? "Yes" : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="inline-flex items-center rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary dark:hover:bg-background-dark-softer"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        {row.status !== "published" && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              patchMutation.mutate({ id: row.id, body: { status: "published" } })
                            }
                            className="inline-flex items-center rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary dark:hover:bg-background-dark-softer disabled:opacity-40"
                            title="Publish"
                          >
                            <span className="material-symbols-outlined text-lg">publish</span>
                          </button>
                        )}
                        {row.status === "published" && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => patchMutation.mutate({ id: row.id, body: { status: "draft" } })}
                            className="inline-flex items-center rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-background-dark-softer disabled:opacity-40"
                            title="Unpublish"
                          >
                            <span className="material-symbols-outlined text-lg">drafts</span>
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy || row.isTaken}
                          onClick={() =>
                            patchMutation.mutate({
                              id: row.id,
                              body: { isReserved: !row.isReserved },
                            })
                          }
                          className="inline-flex items-center rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-secondary dark:hover:bg-background-dark-softer disabled:opacity-40"
                          title={row.isReserved ? "Release hold" : "Hold for admin"}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {row.isReserved ? "lock_open" : "lock"}
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled={busy || !!row.isTaken}
                          onClick={() => {
                            if (
                              typeof window !== "undefined" &&
                              !window.confirm("Delete this slot? This cannot be undone.")
                            )
                              return;
                            deleteMutation.mutate(row.id);
                          }}
                          className="inline-flex items-center rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-500 dark:hover:bg-background-dark-softer disabled:opacity-40"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="max-h-[90vh] w-full max-w-[80%] md:max-w-[50%] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-border-dark dark:bg-background-dark-soft"
            role="dialog"
            aria-modal="true"
          >
            <h3 className="text-lg font-black text-charcoal dark:text-white">
              {modal.mode === "create" ? "New slot" : "Edit slot"}
            </h3>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50">
                Title
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                />
              </label>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50">
                Description
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                />
              </label>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50">
                Price (₦)
                <input
                  type="text"
                  inputMode="decimal"
                  value={formPriceNaira}
                  onChange={(e) => setFormPriceNaira(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                />
              </label>
              {modal.mode === "create" && (
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50">
                  Number of slots
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                  />
                </label>
              )}
              {collectSlotShape && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50">
                    Slot duration
                    <select
                      value={formSlotDuration}
                      onChange={(e) => setFormSlotDuration(e.target.value as SessionSlotDuration)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                    >
                      {SLOT_DURATION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50">
                    Conference day
                    <select
                      value={formConferenceDay}
                      onChange={(e) => setFormConferenceDay(e.target.value as ConferenceDay)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                    >
                      {CONFERENCE_DAY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              {modal.mode === "edit" && (
                <>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50">
                    Status
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as SessionStatus)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-charcoal dark:text-white">
                    <input
                      type="checkbox"
                      checked={formReserved}
                      onChange={(e) => setFormReserved(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    Admin hold (not available for purchase)
                  </label>
                </>
              )}
            </div>
            {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 dark:border-border-dark dark:text-white"
              >
                Cancel
              </button>
              {modal.mode === "create" ? (
                <button
                  type="button"
                  disabled={createMutation.isPending}
                  onClick={() => {
                    setFormError(null);
                    createMutation.mutate();
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating…" : "Create"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saveMutation.isPending}
                  onClick={() => {
                    setFormError(null);
                    saveMutation.mutate();
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {saveMutation.isPending ? "Saving…" : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
