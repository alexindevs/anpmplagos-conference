"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  adminAssignAdvertSlot,
  adminAssignBrandingSlot,
  adminUnassignAdvertSlot,
  adminUnassignBrandingSlot,
  apiAssetUrl,
  deleteAdminAdvertSlot,
  deleteAdminBrandingSlot,
  formatKoboToNaira,
  getAdminAdvertSlots,
  getAdminBrandingSlots,
  patchAdminAdvertSlotReserve,
  patchAdminAdvertSlotTotalSlots,
  patchAdminAdvertSlotUnreserve,
  patchAdminBrandingSlotReserve,
  patchAdminBrandingSlotTotalSlots,
  patchAdminBrandingSlotUnreserve,
  postAdminAdvertSlot,
  postAdminBrandingSlot,
  type AdminAdvertSlot,
  type AdminBrandingSlot,
} from "@/lib/api";
import { AssignCompanyModal } from "./components/AssignCompanyModal";
import { CreateMarketingSlotModal, type MarketingSlotKind } from "./components/CreateMarketingSlotModal";

const ADMIN_ADVERT_KEY = ["admin", "advert-slots"] as const;
const ADMIN_BRANDING_KEY = ["admin", "branding-slots"] as const;
const ADMIN_PLACEHOLDER_COMPANY_ID = "admin";

function slotStatus(row: { availableSlots: number; totalSlots: number; isReserved: boolean }): {
  label: string;
  className: string;
} {
  if (row.isReserved) {
    return {
      label: "Reserved",
      className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    };
  }
  if (row.availableSlots <= 0) {
    return {
      label: "Sold out",
      className: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
    };
  }
  if (row.availableSlots < row.totalSlots) {
    return {
      label: "Partially sold",
      className: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary",
    };
  }
  return {
    label: "Available",
    className: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary",
  };
}

type SlotRow = AdminAdvertSlot | AdminBrandingSlot;

function SlotsTable({
  kind,
  rows,
  isLoading,
  isError,
  reserveMutation,
  unreserveMutation,
  deleteMutation,
  onAssignClick,
  unassignMutation,
  onEditTotalClick,
}: {
  kind: MarketingSlotKind;
  rows: SlotRow[];
  isLoading: boolean;
  isError: boolean;
  reserveMutation: { isPending: boolean; mutate: (id: string) => void };
  unreserveMutation: { isPending: boolean; mutate: (id: string) => void };
  deleteMutation: { isPending: boolean; mutate: (id: string) => void };
  onAssignClick: (row: SlotRow) => void;
  unassignMutation: { isPending: boolean; mutate: (payload: { companyId: string; slotId: string }) => void };
  onEditTotalClick: (row: SlotRow) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="border-b border-primary/10 bg-primary/5 dark:border-border-dark dark:bg-background-dark-softer">
              <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500 dark:text-white/50">Image</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500 dark:text-white/50">Title</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500 dark:text-white/50">Price</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500 dark:text-white/50">Slots</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500 dark:text-white/50">Status</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500 dark:text-white/50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5 dark:divide-border-dark">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-sm text-slate-500 dark:text-white/50">
                  Loading…
                </td>
              </tr>
            )}
            {isError && !isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-sm text-red-600 dark:text-red-400">
                  Could not load {kind} slots.
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-sm text-slate-500 dark:text-white/50">
                  No {kind} slots yet.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              rows.map((row) => {
                const st = slotStatus(row);
                const img = apiAssetUrl(row.image);
                const sold = row.totalSlots - row.availableSlots;
                const canDelete = sold === 0;
                const canReserve = !row.isReserved;
                const canUnreserve = row.isReserved;
                const canAssign = row.availableSlots > 0 && !row.isReserved;
                const canFree = sold > 0;
                return (
                  <tr key={row.id} className="hover:bg-primary/5 dark:hover:bg-background-dark-softer">
                    <td className="px-4 py-3">
                      {img ? (
                        <Image src={img} alt="" width={48} height={48} className="size-12 rounded-lg object-cover border border-slate-100" />
                      ) : (
                        <div className="size-12 rounded-lg bg-slate-100 dark:bg-background-dark-softer" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-charcoal dark:text-white/90 max-w-[200px]">
                      <span className="line-clamp-2">{row.title}</span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{formatKoboToNaira(row.price)}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className="font-mono font-bold text-charcoal dark:text-white">
                        {row.availableSlots}
                      </span>
                      <span className="text-slate-400"> / {row.totalSlots}</span>
                      <span className="block text-xs text-slate-500 dark:text-white/50">
                        {sold} sold
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditTotalClick(row)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-border-dark dark:text-white"
                        >
                          Edit total
                        </button>
                        {canAssign && (
                          <button
                            type="button"
                            onClick={() => onAssignClick(row)}
                            className="rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 text-xs font-bold text-primary hover:bg-primary/10"
                          >
                            Assign
                          </button>
                        )}
                        {canFree && (
                          <button
                            type="button"
                            disabled={unassignMutation.isPending}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Free one copy of this slot? This increments the available count by 1."
                                )
                              ) {
                                unassignMutation.mutate({
                                  companyId: ADMIN_PLACEHOLDER_COMPANY_ID,
                                  slotId: row.id,
                                });
                              }
                            }}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-border-dark dark:text-white"
                          >
                            Free 1
                          </button>
                        )}
                        {canReserve && (
                          <button
                            type="button"
                            disabled={reserveMutation.isPending}
                            onClick={() => reserveMutation.mutate(row.id)}
                            className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                          >
                            Reserve
                          </button>
                        )}
                        {canUnreserve && (
                          <button
                            type="button"
                            disabled={unreserveMutation.isPending}
                            onClick={() => unreserveMutation.mutate(row.id)}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 dark:border-border-dark dark:text-white"
                          >
                            Unreserve
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              if (window.confirm("Delete this slot? Only if no copies have been sold and no pending payment.")) {
                                deleteMutation.mutate(row.id);
                              }
                            }}
                            className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-700 dark:border-red-900 dark:text-red-300"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditTotalSlotsModal({
  open,
  row,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  row: SlotRow | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (newTotal: number) => void;
}) {
  const [value, setValue] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open && row) {
      setValue(String(row.totalSlots));
      setErr(null);
    }
  }, [open, row]);

  if (!open || !row) return null;

  const sold = row.totalSlots - row.availableSlots;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
      <div className="w-[80%] md:max-w-[50%] mx-auto rounded-xl border border-primary/10 bg-white shadow-xl dark:border-border-dark dark:bg-background-dark-soft">
        <div className="border-b border-primary/10 px-6 py-4 dark:border-border-dark">
          <h3 className="text-lg font-black text-charcoal dark:text-white">Edit total slots</h3>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">{row.title}</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const n = Math.round(Number(value));
            if (!Number.isFinite(n) || n < 1) {
              setErr("Total must be a positive integer.");
              return;
            }
            if (n < sold) {
              setErr(`Cannot reduce below sold count (${sold}).`);
              return;
            }
            setErr(null);
            onSubmit(n);
          }}
          className="px-6 py-4 space-y-4"
        >
          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {err}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-white/50 mb-1">
              Total slots
            </label>
            <input
              type="number"
              min={Math.max(1, sold)}
              step={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
              Currently {row.availableSlots} available / {row.totalSlots} total · {sold} sold.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-border-dark dark:text-white dark:hover:bg-background-dark-softer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminMarketingPage() {
  const queryClient = useQueryClient();
  const [createKind, setCreateKind] = useState<MarketingSlotKind | null>(null);
  const [assignTarget, setAssignTarget] = useState<{ kind: MarketingSlotKind; row: SlotRow } | null>(null);
  const [editTotalTarget, setEditTotalTarget] = useState<{ kind: MarketingSlotKind; row: SlotRow } | null>(null);

  const advertQuery = useQuery({
    queryKey: ADMIN_ADVERT_KEY,
    queryFn: getAdminAdvertSlots,
  });

  const brandingQuery = useQuery({
    queryKey: ADMIN_BRANDING_KEY,
    queryFn: getAdminBrandingSlots,
  });

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_ADVERT_KEY });
    void queryClient.invalidateQueries({ queryKey: ADMIN_BRANDING_KEY });
    void queryClient.invalidateQueries({ queryKey: ["advert-slots", "available"] });
    void queryClient.invalidateQueries({ queryKey: ["branding-slots", "available"] });
    void queryClient.invalidateQueries({ queryKey: ["advert-slots", "me"] });
    void queryClient.invalidateQueries({ queryKey: ["branding-slots", "me"] });
  };

  const createAdvertMutation = useMutation({
    mutationFn: postAdminAdvertSlot,
    onSuccess: () => {
      invalidateAll();
      setCreateKind(null);
    },
  });

  const createBrandingMutation = useMutation({
    mutationFn: postAdminBrandingSlot,
    onSuccess: () => {
      invalidateAll();
      setCreateKind(null);
    },
  });

  const advertReserve = useMutation({
    mutationFn: patchAdminAdvertSlotReserve,
    onSuccess: invalidateAll,
  });
  const advertUnreserve = useMutation({
    mutationFn: patchAdminAdvertSlotUnreserve,
    onSuccess: invalidateAll,
  });
  const advertDelete = useMutation({
    mutationFn: deleteAdminAdvertSlot,
    onSuccess: invalidateAll,
  });

  const brandingReserve = useMutation({
    mutationFn: patchAdminBrandingSlotReserve,
    onSuccess: invalidateAll,
  });
  const brandingUnreserve = useMutation({
    mutationFn: patchAdminBrandingSlotUnreserve,
    onSuccess: invalidateAll,
  });
  const brandingDelete = useMutation({
    mutationFn: deleteAdminBrandingSlot,
    onSuccess: invalidateAll,
  });

  const assignAdvert = useMutation({
    mutationFn: ({ companyId, slotId }: { companyId: string; slotId: string }) =>
      adminAssignAdvertSlot(companyId, slotId),
    onSuccess: () => {
      invalidateAll();
      setAssignTarget(null);
    },
  });

  const assignBranding = useMutation({
    mutationFn: ({ companyId, slotId }: { companyId: string; slotId: string }) =>
      adminAssignBrandingSlot(companyId, slotId),
    onSuccess: () => {
      invalidateAll();
      setAssignTarget(null);
    },
  });

  const unassignAdvert = useMutation({
    mutationFn: ({ companyId, slotId }: { companyId: string; slotId: string }) =>
      adminUnassignAdvertSlot(companyId, slotId),
    onSuccess: invalidateAll,
  });

  const unassignBranding = useMutation({
    mutationFn: ({ companyId, slotId }: { companyId: string; slotId: string }) =>
      adminUnassignBrandingSlot(companyId, slotId),
    onSuccess: invalidateAll,
  });

  const editAdvertTotal = useMutation({
    mutationFn: ({ id, totalSlots }: { id: string; totalSlots: number }) =>
      patchAdminAdvertSlotTotalSlots(id, totalSlots),
    onSuccess: () => {
      invalidateAll();
      setEditTotalTarget(null);
    },
  });

  const editBrandingTotal = useMutation({
    mutationFn: ({ id, totalSlots }: { id: string; totalSlots: number }) =>
      patchAdminBrandingSlotTotalSlots(id, totalSlots),
    onSuccess: () => {
      invalidateAll();
      setEditTotalTarget(null);
    },
  });

  const advertRows = advertQuery.data ?? [];
  const brandingRows = brandingQuery.data ?? [];

  const stats = useMemo(() => {
    const aAvail = advertRows.reduce((s, r) => s + (r.isReserved ? 0 : r.availableSlots), 0);
    const bAvail = brandingRows.reduce((s, r) => s + (r.isReserved ? 0 : r.availableSlots), 0);
    const aTotal = advertRows.reduce((s, r) => s + r.totalSlots, 0);
    const bTotal = brandingRows.reduce((s, r) => s + r.totalSlots, 0);
    const aSold = aTotal - advertRows.reduce((s, r) => s + r.availableSlots, 0);
    const bSold = bTotal - brandingRows.reduce((s, r) => s + r.availableSlots, 0);
    const revenue =
      advertRows.reduce((s, r) => s + (r.totalSlots - r.availableSlots) * (r.price || 0), 0) +
      brandingRows.reduce((s, r) => s + (r.totalSlots - r.availableSlots) * (r.price || 0), 0);
    return {
      advertListings: advertRows.length,
      brandingListings: brandingRows.length,
      advertCapacity: aTotal,
      brandingCapacity: bTotal,
      advertAvail: aAvail,
      brandingAvail: bAvail,
      advertSold: aSold,
      brandingSold: bSold,
      reserved: [...advertRows, ...brandingRows].filter((r) => r.isReserved).length,
      revenueKobo: revenue,
    };
  }, [advertRows, brandingRows]);

  const actionError =
    [createAdvertMutation.error, createBrandingMutation.error, assignAdvert.error, assignBranding.error].find(
      Boolean
    ) ??
    advertQuery.error ??
    brandingQuery.error;

  const errMsg =
    actionError instanceof ApiError
      ? (actionError.body?.message as string) || actionError.message
      : actionError instanceof Error
        ? actionError.message
        : null;

  const createSubmitting = createAdvertMutation.isPending || createBrandingMutation.isPending;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-charcoal dark:text-slate-100 sm:text-2xl">Marketing</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Advert and branding slot inventory. Each listing can have multiple copies for sale — companies decrement availability as they purchase.
            </p>
          </div>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        {errMsg && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {errMsg}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Advert capacity</p>
            <p className="mt-1 text-2xl font-black text-charcoal dark:text-white">{stats.advertCapacity}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.advertAvail} available · {stats.advertSold} sold · {stats.advertListings} listings
            </p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Branding capacity</p>
            <p className="mt-1 text-2xl font-black text-charcoal dark:text-white">{stats.brandingCapacity}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.brandingAvail} available · {stats.brandingSold} sold · {stats.brandingListings} listings
            </p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Reserved listings</p>
            <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{stats.reserved}</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Sold copies — listed value</p>
            <p className="mt-1 text-2xl font-black text-primary">{formatKoboToNaira(stats.revenueKobo)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Total list price for all sold copies.</p>
          </div>
        </div>

        <section className="mb-12 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-black text-charcoal dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">ads_click</span>
              Advert slots
            </h3>
            <button
              type="button"
              onClick={() => setCreateKind("advert")}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-red-700"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New advert slot
            </button>
          </div>
          <SlotsTable
            kind="advert"
            rows={advertRows}
            isLoading={advertQuery.isLoading}
            isError={advertQuery.isError}
            reserveMutation={advertReserve}
            unreserveMutation={advertUnreserve}
            deleteMutation={advertDelete}
            onAssignClick={(row) => setAssignTarget({ kind: "advert", row })}
            unassignMutation={unassignAdvert}
            onEditTotalClick={(row) => setEditTotalTarget({ kind: "advert", row })}
          />
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-black text-charcoal dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">palette</span>
              Branding slots
            </h3>
            <button
              type="button"
              onClick={() => setCreateKind("branding")}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-red-700"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New branding slot
            </button>
          </div>
          <SlotsTable
            kind="branding"
            rows={brandingRows}
            isLoading={brandingQuery.isLoading}
            isError={brandingQuery.isError}
            reserveMutation={brandingReserve}
            unreserveMutation={brandingUnreserve}
            deleteMutation={brandingDelete}
            onAssignClick={(row) => setAssignTarget({ kind: "branding", row })}
            unassignMutation={unassignBranding}
            onEditTotalClick={(row) => setEditTotalTarget({ kind: "branding", row })}
          />
        </section>
      </div>

      <CreateMarketingSlotModal
        open={createKind === "advert"}
        kind="advert"
        isSubmitting={createAdvertMutation.isPending}
        onClose={() => !createSubmitting && setCreateKind(null)}
        onSubmit={(payload) =>
          createAdvertMutation.mutate({
            title: payload.title,
            price: payload.priceKobo,
            description: payload.description,
            isReserved: payload.isReserved,
            totalSlots: payload.totalSlots,
            advertSlotImage: payload.imageFile,
          })
        }
      />
      <CreateMarketingSlotModal
        open={createKind === "branding"}
        kind="branding"
        isSubmitting={createBrandingMutation.isPending}
        onClose={() => !createSubmitting && setCreateKind(null)}
        onSubmit={(payload) =>
          createBrandingMutation.mutate({
            title: payload.title,
            price: payload.priceKobo,
            description: payload.description,
            isReserved: payload.isReserved,
            totalSlots: payload.totalSlots,
            brandingSlotImage: payload.imageFile,
          })
        }
      />

      <AssignCompanyModal
        open={assignTarget?.kind === "advert"}
        kind="advert"
        slotId={assignTarget?.row.id ?? ""}
        slotTitle={assignTarget?.row.title ?? ""}
        isSubmitting={assignAdvert.isPending}
        onClose={() => !assignAdvert.isPending && setAssignTarget(null)}
        onAssign={(companyId) => {
          if (!assignTarget || assignTarget.kind !== "advert") return;
          assignAdvert.mutate({ companyId, slotId: assignTarget.row.id });
        }}
      />
      <AssignCompanyModal
        open={assignTarget?.kind === "branding"}
        kind="branding"
        slotId={assignTarget?.row.id ?? ""}
        slotTitle={assignTarget?.row.title ?? ""}
        isSubmitting={assignBranding.isPending}
        onClose={() => !assignBranding.isPending && setAssignTarget(null)}
        onAssign={(companyId) => {
          if (!assignTarget || assignTarget.kind !== "branding") return;
          assignBranding.mutate({ companyId, slotId: assignTarget.row.id });
        }}
      />

      <EditTotalSlotsModal
        open={!!editTotalTarget}
        row={editTotalTarget?.row ?? null}
        isSubmitting={editAdvertTotal.isPending || editBrandingTotal.isPending}
        onClose={() => {
          if (!editAdvertTotal.isPending && !editBrandingTotal.isPending) setEditTotalTarget(null);
        }}
        onSubmit={(newTotal) => {
          if (!editTotalTarget) return;
          if (editTotalTarget.kind === "advert") {
            editAdvertTotal.mutate({ id: editTotalTarget.row.id, totalSlots: newTotal });
          } else {
            editBrandingTotal.mutate({ id: editTotalTarget.row.id, totalSlots: newTotal });
          }
        }}
      />
    </>
  );
}
