"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminPatchBooth,
  ApiError,
  formatKoboToNaira,
  getAdminBooths,
  getAdminCompanies,
  postAdminCompanyBooth,
  type Booth,
  type CompanySummary,
} from "@/lib/api";

function boothTitle(b: Booth): string {
  return (
    b.name?.trim() ||
    b.code?.trim() ||
    [b.hall, b.floorSection].filter(Boolean).join(" · ") ||
    "—"
  );
}

function boothStatus(b: Booth): { label: string; className: string } {
  if (b.isTaken) {
    return {
      label: "Occupied",
      className: "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary",
    };
  }
  if (b.isReserved) {
    return {
      label: "Reserved",
      className: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
    };
  }
  return {
    label: "Available",
    className: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary",
  };
}

const COMPANY_LIST_PAGE_SIZE = 500;

export default function BoothManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [assignModalBoothId, setAssignModalBoothId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const {
    data: booths = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "booths"],
    queryFn: getAdminBooths,
  });

  const { data: companiesResult, isPending: companiesLoading } = useQuery({
    queryKey: ["admin", "companies", "list", COMPANY_LIST_PAGE_SIZE],
    queryFn: () => getAdminCompanies({ page: 1, pageSize: COMPANY_LIST_PAGE_SIZE }),
  });

  const companiesSorted = useMemo(() => {
    const items = companiesResult?.items ?? [];
    return [...items].sort((a, b) =>
      (a.companyName || "").localeCompare(b.companyName || "", undefined, { sensitivity: "base" })
    );
  }, [companiesResult]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return booths;
    return booths.filter((b) => {
      const t = boothTitle(b).toLowerCase();
      const hall = (b.hall || "").toLowerCase();
      const section = (b.floorSection || "").toLowerCase();
      const tier = (b.tier || "").toLowerCase();
      return t.includes(q) || hall.includes(q) || section.includes(q) || tier.includes(q);
    });
  }, [booths, search]);

  const stats = useMemo(() => {
    const total = booths.length;
    const available = booths.filter((b) => !b.isTaken && !b.isReserved).length;
    const reserved = booths.filter((b) => !b.isTaken && b.isReserved).length;
    const occupied = booths.filter((b) => b.isTaken).length;
    return { total, available, reserved, occupied };
  }, [booths]);

  const invalidateBoothData = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "booths"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "summary"] });
  };

  const reserveMutation = useMutation({
    mutationFn: (id: string) => adminPatchBooth(id, { isReserved: true }),
    onMutate: (id) => setReservingId(id),
    onSettled: () => setReservingId(null),
    onSuccess: invalidateBoothData,
  });

  const assignBoothMutation = useMutation({
    mutationFn: ({ companyId, boothId }: { companyId: string; boothId: string }) =>
      postAdminCompanyBooth(companyId, boothId),
    onSuccess: () => {
      setAssignModalBoothId(null);
      setSelectedCompanyId("");
      invalidateBoothData();
    },
  });

  const unassignMutation = useMutation({
    mutationFn: (companyId: string) => postAdminCompanyBooth(companyId, null),
    onSuccess: invalidateBoothData,
  });

  const reserveError =
    reserveMutation.isError && reserveMutation.error instanceof ApiError
      ? reserveMutation.error.message
      : reserveMutation.isError
        ? "Could not reserve this booth."
        : null;

  const assignError =
    assignBoothMutation.isError && assignBoothMutation.error instanceof ApiError
      ? assignBoothMutation.error.message
      : assignBoothMutation.isError
        ? "Could not assign booth."
        : null;

  const unassignError =
    unassignMutation.isError && unassignMutation.error instanceof ApiError
      ? unassignMutation.error.message
      : unassignMutation.isError
        ? "Could not unassign booth."
        : null;

  const handleReserve = (id: string) => {
    reserveMutation.mutate(id);
  };

  const openAssignModal = (boothId: string) => {
    setSelectedCompanyId("");
    setAssignModalBoothId(boothId);
  };

  const confirmAssign = () => {
    if (!assignModalBoothId || !selectedCompanyId) return;
    assignBoothMutation.mutate({ companyId: selectedCompanyId, boothId: assignModalBoothId });
  };

  const companyOptionLabel = (e: CompanySummary) => {
    const has = e.booth != null;
    return has ? `${e.companyName} (already has a booth)` : e.companyName;
  };

  function boothOccupantCompanyId(row: Booth): string | undefined {
    const id = row.companyId ?? row.exhibitorId;
    return id?.trim() || undefined;
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#181112] dark:text-white sm:text-2xl">
              Booth Management
            </h2>
            <p className="text-sm text-slate-500 dark:text-white/50">
              Organize floor space and manage company booth assignments
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/admin/dashboard/floor-plan"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/20 bg-white px-4 py-2.5 text-sm font-bold text-primary shadow-sm transition-all hover:bg-primary/5 dark:border-primary/30 dark:bg-background-dark-soft dark:text-primary sm:w-auto"
            >
              <span className="material-symbols-outlined text-sm">map</span>
              View floor plan
            </Link>
            <Link
              href="/admin/dashboard/booths/new"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 sm:w-auto"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add New Booth
            </Link>
          </div>
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
              placeholder="Search by title, tier, hall, or section..."
              className="w-full rounded-lg border-none bg-background-light py-2 pl-10 pr-4 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white"
            />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
              Total Booths
            </p>
            <p className="mt-1 text-2xl font-black text-[#181112] dark:text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
              Available
            </p>
            <p className="mt-1 text-2xl font-black text-secondary">{stats.available}</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
              Reserved
            </p>
            <p className="mt-1 text-2xl font-black text-primary">{stats.reserved}</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
              Occupied
            </p>
            <p className="mt-1 text-2xl font-black text-primary">{stats.occupied}</p>
          </div>
        </div>

        {isError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error instanceof ApiError ? error.message : "Could not load booths."}{" "}
            <button type="button" className="font-bold underline" onClick={() => void refetch()}>
              Retry
            </button>
          </div>
        )}

        {reserveError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {reserveError}
          </div>
        )}

        {(assignError || unassignError) && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {assignError || unassignError}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 dark:border-border-dark dark:bg-background-dark-softer">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Title
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Size
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Tier
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Price
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 dark:divide-border-dark">
                {isPending ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-white/50">
                      Loading booths…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-white/50">
                      {booths.length === 0
                        ? "No booths yet. Create one to get started."
                        : "No booths match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const occupantCompanyId = boothOccupantCompanyId(row);
                    const status = boothStatus(row);
                    const canReserve = !row.isTaken && !row.isReserved;
                    const canAssignCompany = !row.isTaken;
                    const canUnassign = row.isTaken && occupantCompanyId;
                    const busyReserve = reservingId === row.id && reserveMutation.isPending;
                    const busyUnassign = Boolean(
                      occupantCompanyId &&
                        unassignMutation.isPending &&
                        unassignMutation.variables === occupantCompanyId
                    );
                    return (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-primary/5 dark:hover:bg-background-dark-softer"
                      >
                        <td className="px-6 py-4 font-bold text-[#181112] dark:text-white">
                          {boothTitle(row)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/70">
                          {row.size?.trim() || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/70">
                          {row.tier?.trim() || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/70">
                          {formatKoboToNaira(row.price)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {canReserve && (
                              <button
                                type="button"
                                disabled={busyReserve}
                                onClick={() => handleReserve(row.id)}
                                className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-secondary/90 disabled:opacity-60"
                              >
                                {busyReserve ? "Reserving…" : "Reserve"}
                              </button>
                            )}
                            {canAssignCompany && (
                              <button
                                type="button"
                                onClick={() => openAssignModal(row.id)}
                                className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20"
                              >
                                Assign company
                              </button>
                            )}
                            {canUnassign && occupantCompanyId && (
                              <button
                                type="button"
                                disabled={busyUnassign}
                                onClick={() => unassignMutation.mutate(occupantCompanyId)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-60 dark:border-border-dark dark:text-slate-200 dark:hover:bg-background-dark-softer"
                              >
                                {busyUnassign ? "Unassigning…" : "Unassign"}
                              </button>
                            )}
                            {row.isTaken && !occupantCompanyId && (
                              <span className="text-xs text-slate-400 dark:text-white/40" title="Occupied">
                                —
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {!isPending && filtered.length > 0 && (
            <div className="flex items-center justify-between bg-primary/5 px-6 py-4 dark:bg-background-dark-softer">
              <p className="text-sm text-slate-500 dark:text-white/50">
                Showing <span className="font-bold text-slate-700 dark:text-white/70">{filtered.length}</span>{" "}
                {search.trim() ? "matching " : ""}
                booth{filtered.length === 1 ? "" : "s"}
                {search.trim() ? ` (${booths.length} total)` : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {assignModalBoothId && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-booth-title"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-border-dark dark:bg-background-dark-soft">
            <h3 id="assign-booth-title" className="text-lg font-black text-[#181112] dark:text-white">
              Assign company to booth
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
              Choose a company. Their booth will be set to this slot (per server rules).
            </p>
            <label htmlFor="assign-company" className="mt-4 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Company
            </label>
            {companiesLoading ? (
              <p className="mt-2 text-sm text-slate-500">Loading companies…</p>
            ) : (
              <select
                id="assign-company"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#181112] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white"
              >
                <option value="">Select a company…</option>
                {companiesSorted.map((c) => (
                  <option key={c.id} value={c.id}>
                    {companyOptionLabel(c)}
                  </option>
                ))}
              </select>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-border-dark dark:text-slate-200 dark:hover:bg-background-dark-softer"
                onClick={() => {
                  setAssignModalBoothId(null);
                  setSelectedCompanyId("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedCompanyId || assignBoothMutation.isPending}
                onClick={confirmAssign}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {assignBoothMutation.isPending ? "Assigning…" : "Assign booth"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
