"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminSponsorshipPlan,
  downloadPlanBuyers,
  formatKoboToNaira,
  getAdminAdvertSlots,
  getAdminBrandingSlots,
  getAdminSponsorshipPlans,
  getPlanAnalytics,
  parseNairaInputToKobo,
  patchAdminSponsorshipPlan,
  postAdminSponsorshipPlan,
  type AdminAdvertSlot,
  type AdminBrandingSlot,
  type ConferenceDay,
  type PlanAnalytics,
  type SessionSlotDuration,
  type SponsorshipBundleBoothTier,
  type SponsorshipPlanCatalogItem,
} from "@/lib/api";

const Q_PLANS = ["admin", "sponsorship-plans"] as const;

const TIER_OPTIONS = [
  { value: "bronze", label: "Bronze", color: "bg-orange-100 text-orange-800" },
  { value: "silver", label: "Silver", color: "bg-slate-100 text-slate-700" },
  { value: "gold", label: "Gold", color: "bg-amber-100 text-amber-700" },
  { value: "platinum", label: "Platinum", color: "bg-secondary/10 text-secondary" },
  { value: "headliner", label: "Headliner", color: "bg-primary/10 text-primary" },
];

/** Bundle checkout may only assign headliner, platinum, or gold booths (not silver/bronze). */
const BUNDLE_BOOTH_OPTIONS: { value: "" | SponsorshipBundleBoothTier; label: string }[] = [
  { value: "", label: "No booth in bundle" },
  { value: "headliner", label: "Headliner booth (7m x 3m)" },
  { value: "platinum", label: "Platinum booth (5m x 3m)" },
  { value: "gold", label: "Gold booth (3m x 3m)" },
];

const DURATION_OPTIONS: { value: SessionSlotDuration; label: string }[] = [
  { value: "m5", label: "5 min" },
  { value: "m10", label: "10 min" },
  { value: "m15", label: "15 min" },
  { value: "m20", label: "20 min" },
  { value: "m30", label: "30 min" },
  { value: "m45", label: "45 min" },
  { value: "h1", label: "1 hour" },
  { value: "h2", label: "2 hours" },
];

const DAY_OPTIONS: { value: ConferenceDay; label: string }[] = [
  { value: "day_1", label: "Day 1" },
  { value: "day_2", label: "Day 2" },
];

function getTierStyle(tier: string) {
  return (
    TIER_OPTIONS.find((t) => t.value === tier.toLowerCase()) ?? {
      value: tier,
      label: tier,
      color: "bg-slate-100 text-slate-700",
    }
  );
}

function advertIdsFromPlan(plan: SponsorshipPlanCatalogItem | null | undefined): string[] {
  if (!plan?.advertSlots?.length) return [];
  return plan.advertSlots
    .map((row) => row.advertSlot?.id ?? (row as unknown as { advertSlotId?: string }).advertSlotId)
    .filter((id): id is string => Boolean(id));
}

function brandingIdsFromPlan(plan: SponsorshipPlanCatalogItem | null | undefined): string[] {
  if (!plan?.brandingSlots?.length) return [];
  return plan.brandingSlots
    .map((row) => row.brandingSlot?.id ?? (row as unknown as { brandingSlotId?: string }).brandingSlotId)
    .filter((id): id is string => Boolean(id));
}

/** Pre-fill price field from stored kobo (whole naira as string). */
function koboToNairaInputValue(kobo: number | undefined): string {
  const k = kobo ?? 0;
  if (k <= 0) return "";
  const naira = k / 100;
  return Number.isInteger(naira) ? String(naira) : String(naira);
}

interface PlanFormData {
  name: string;
  /** User-entered naira (commas/decimals allowed); converted to kobo on save. */
  priceNaira: string;
  tier: string;
  isActive: boolean;
  ticketAdmits: number;
  bundleBoothTier: "" | SponsorshipBundleBoothTier;
  bundleMasterclassDuration: "" | SessionSlotDuration;
  bundleMasterclassDay: "" | ConferenceDay;
  bundlePresentationDuration: "" | SessionSlotDuration;
  bundlePresentationDay: "" | ConferenceDay;
  advertSlotIds: string[];
  brandingSlotIds: string[];
  manualPerks: string[];
}

function durationLabel(v: SessionSlotDuration | "" | undefined): string {
  if (!v) return "";
  return DURATION_OPTIONS.find((d) => d.value === v)?.label ?? String(v);
}

function dayLabel(v: ConferenceDay | "" | undefined): string {
  if (!v) return "";
  return DAY_OPTIONS.find((d) => d.value === v)?.label ?? String(v);
}

function deriveBundlePerksFromForm(
  form: PlanFormData,
  adverts: AdminAdvertSlot[],
  branding: AdminBrandingSlot[],
  existingPlan?: SponsorshipPlanCatalogItem | null,
): string[] {
  const lines: string[] = [];
  const n = Math.max(1, Number(form.ticketAdmits) || 1);
  lines.push(
    n === 1
      ? "Conference delegate admission for one person"
      : `Conference delegate admission for ${n} people`,
  );

  if (form.bundleBoothTier) {
    const t = form.bundleBoothTier.charAt(0).toUpperCase() + form.bundleBoothTier.slice(1);
    lines.push(`${t} booth`);
  }

  if (form.bundleMasterclassDuration && form.bundleMasterclassDay) {
    lines.push(
      `A ${durationLabel(form.bundleMasterclassDuration)} long masterclass on ${dayLabel(form.bundleMasterclassDay)}`,
    );
  }

  if (form.bundlePresentationDuration && form.bundlePresentationDay) {
    lines.push(
      `Presentation slot: ${durationLabel(form.bundlePresentationDuration)} on ${dayLabel(form.bundlePresentationDay)}`,
    );
  }

  for (const id of form.advertSlotIds) {
    const slot = adverts.find((a) => a.id === id);
    const fromPlan = existingPlan?.advertSlots?.find((r) => r.advertSlot?.id === id)?.advertSlot?.title?.trim();
    const title = slot?.title?.trim() || fromPlan || "Advert slot";
    lines.push(`Advert placement: ${title}`);
  }

  for (const id of form.brandingSlotIds) {
    const slot = branding.find((b) => b.id === id);
    const fromPlan = existingPlan?.brandingSlots?.find((r) => r.brandingSlot?.id === id)?.brandingSlot?.title?.trim();
    const title = slot?.title?.trim() || fromPlan || "Branding slot";
    lines.push(`Branding placement: ${title}`);
  }

  for (const perk of form.manualPerks) {
    if (perk.trim()) lines.push(perk.trim());
  }

  return lines;
}

function planFormDefaults(
  plan: SponsorshipPlanCatalogItem | null | undefined,
  opts?: { defaultTier?: string },
): PlanFormData {
  const bt = plan?.bundleBoothTier;
  const boothOk = bt === "gold" || bt === "platinum" || bt === "headliner" ? bt : "";
  const tierDefault = plan?.tier ?? opts?.defaultTier ?? "silver";
  return {
    name: plan?.name ?? "",
    priceNaira: koboToNairaInputValue(plan?.priceInKobo),
    tier: tierDefault,
    isActive: plan == null || plan.isActive !== false,
    ticketAdmits: plan?.ticketAdmits != null && plan.ticketAdmits >= 1 ? plan.ticketAdmits : 1,
    bundleBoothTier: boothOk,
    bundleMasterclassDuration: (plan?.bundleMasterclassDuration as SessionSlotDuration) ?? "",
    bundleMasterclassDay: (plan?.bundleMasterclassDay as ConferenceDay) ?? "",
    bundlePresentationDuration: (plan?.bundlePresentationDuration as SessionSlotDuration) ?? "",
    bundlePresentationDay: (plan?.bundlePresentationDay as ConferenceDay) ?? "",
    advertSlotIds: advertIdsFromPlan(plan),
    brandingSlotIds: brandingIdsFromPlan(plan),
    manualPerks: plan?.manualPerks ?? [],
  };
}

function formValidationMessage(f: PlanFormData): string | null {
  const priceKobo = parseNairaInputToKobo(f.priceNaira);
  if (priceKobo == null || priceKobo <= 0) {
    return "Enter a valid price in naira (e.g. 50000 or 50,000).";
  }
  const mc = !!(f.bundleMasterclassDuration || f.bundleMasterclassDay);
  const mcFull = !!(f.bundleMasterclassDuration && f.bundleMasterclassDay);
  if (mc && !mcFull) return "Masterclass bundle: set both duration and day, or clear both.";
  const pr = !!(f.bundlePresentationDuration || f.bundlePresentationDay);
  const prFull = !!(f.bundlePresentationDuration && f.bundlePresentationDay);
  if (pr && !prFull) return "Presentation bundle: set both duration and day, or clear both.";
  return null;
}

function buildSponsorshipPlanPayload(
  data: PlanFormData,
  isPatch: boolean,
  adverts: AdminAdvertSlot[],
  branding: AdminBrandingSlot[],
  existingPlan?: SponsorshipPlanCatalogItem | null,
): Record<string, unknown> {
  const perks = deriveBundlePerksFromForm(data, adverts, branding, existingPlan);
  const priceKobo = parseNairaInputToKobo(data.priceNaira) ?? 0;
  const payload: Record<string, unknown> = {
    name: data.name,
    priceInKobo: priceKobo,
    tier: data.tier,
    perks,
    manualPerks: data.manualPerks,
    isActive: data.isActive,
    ticketAdmits: Math.max(1, Number(data.ticketAdmits) || 1),
    advertSlotIds: data.advertSlotIds,
    brandingSlotIds: data.brandingSlotIds,
  };
  if (data.bundleBoothTier) payload.bundleBoothTier = data.bundleBoothTier;
  const mcFull = data.bundleMasterclassDuration && data.bundleMasterclassDay;
  if (mcFull) {
    payload.bundleMasterclassDuration = data.bundleMasterclassDuration;
    payload.bundleMasterclassDay = data.bundleMasterclassDay;
  } else if (isPatch) {
    payload.bundleMasterclassDuration = null;
    payload.bundleMasterclassDay = null;
  }
  const prFull = data.bundlePresentationDuration && data.bundlePresentationDay;
  if (prFull) {
    payload.bundlePresentationDuration = data.bundlePresentationDuration;
    payload.bundlePresentationDay = data.bundlePresentationDay;
  } else if (isPatch) {
    payload.bundlePresentationDuration = null;
    payload.bundlePresentationDay = null;
  }
  return payload;
}

function bundleSummaryLine(plan: SponsorshipPlanCatalogItem): string {
  const parts: string[] = [];
  if (plan.ticketAdmits != null && plan.ticketAdmits > 1) parts.push(`${plan.ticketAdmits} admits`);
  if (plan.bundleBoothTier) parts.push(`${plan.bundleBoothTier} booth`);
  if (plan.bundleMasterclassDuration && plan.bundleMasterclassDay) parts.push("masterclass slot");
  if (plan.bundlePresentationDuration && plan.bundlePresentationDay) parts.push("presentation slot");
  const nAdv = plan.advertSlots?.length ?? 0;
  const nBr = plan.brandingSlots?.length ?? 0;
  if (nAdv) parts.push(`${nAdv} advert`);
  if (nBr) parts.push(`${nBr} branding`);
  return parts.length ? parts.join(" · ") : "No bundles";
}

type PlanSaveContext = { adverts: AdminAdvertSlot[]; branding: AdminBrandingSlot[] };

function DirtyDot({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      className="inline-block size-1.5 rounded-full bg-amber-400 ml-1.5 align-middle shrink-0"
      title="Changed"
    />
  );
}

function StockBadge({ plan }: { plan: SponsorshipPlanCatalogItem }) {
  if (plan.remainingPurchases === 0) {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
        Out of Stock
      </span>
    );
  }
  if (plan.remainingPurchases != null && plan.remainingPurchases <= 3) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
        Low Stock · {plan.remainingPurchases} left
      </span>
    );
  }
  return null;
}

function SlotSection({
  label,
  selectedIds,
  snapshotIds,
  allSlots,
  loading,
  isEditing,
  pickerOpen,
  onToggle,
  onTogglePicker,
}: {
  label: string;
  selectedIds: string[];
  snapshotIds: string[];
  allSlots: (AdminAdvertSlot | AdminBrandingSlot)[];
  loading: boolean;
  isEditing: boolean;
  pickerOpen: boolean;
  onToggle: (id: string) => void;
  onTogglePicker: () => void;
}) {
  const selectedSlots = selectedIds.map((id) => ({
    id,
    slot: allSlots.find((s) => s.id === id),
  }));
  const availableToAdd = allSlots.filter(
    (s) => !selectedIds.includes(s.id) && !s.isReserved && s.availableSlots > 0,
  );
  const slotsDirty =
    isEditing &&
    JSON.stringify([...selectedIds].sort()) !== JSON.stringify([...snapshotIds].sort());

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium text-slate-700 dark:text-white/70">{label}</p>
          <DirtyDot show={slotsDirty} />
        </div>
        {selectedIds.length > 0 && (
          <span className="text-xs text-slate-400 dark:text-white/40">{selectedIds.length} linked</span>
        )}
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {loading ? (
          <span className="text-xs text-slate-400 py-1">Loading…</span>
        ) : selectedSlots.length === 0 ? (
          <span className="text-xs text-slate-400 dark:text-white/40 py-1">None linked</span>
        ) : (
          selectedSlots.map(({ id, slot }) => {
            const isOrphaned = !slot;
            const isNew = isEditing && !snapshotIds.includes(id);
            return (
              <span
                key={id}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  isOrphaned
                    ? "bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400"
                    : isNew
                      ? "border border-dashed border-secondary text-secondary"
                      : "bg-secondary/10 text-secondary"
                }`}
              >
                {slot?.title ?? "Removed slot"}
                <button
                  type="button"
                  onClick={() => onToggle(id)}
                  className="hover:text-red-500 transition-colors ml-0.5"
                  aria-label={`Remove ${slot?.title ?? "slot"}`}
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            );
          })
        )}
      </div>

      {/* Picker trigger + dropdown */}
      <div className="mt-2">
        <button
          type="button"
          onClick={onTogglePicker}
          className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-[15px]">
            {pickerOpen ? "expand_less" : "add"}
          </span>
          {pickerOpen ? "Close" : "Add slot"}
        </button>

        {pickerOpen && (
          <div className="mt-1.5 rounded-lg border border-slate-200 dark:border-border-dark overflow-hidden">
            {availableToAdd.length === 0 ? (
              <p className="px-3 py-2.5 text-xs text-slate-400 dark:text-white/40">
                No slots available to add.
              </p>
            ) : (
              <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-border-dark">
                {availableToAdd.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onToggle(slot.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-secondary/5 dark:hover:bg-secondary/10 transition-colors"
                  >
                    <span className="truncate text-charcoal dark:text-white">{slot.title}</span>
                    <span className="shrink-0 text-xs font-semibold text-secondary ml-2">+ Add</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analytics tab ──────────────────────────────────────────────────────────

function AnalyticsTab({ plan }: { plan: SponsorshipPlanCatalogItem }) {
  const analyticsQuery = useQuery<PlanAnalytics>({
    queryKey: ["admin", "sponsorship-plans", plan.id, "analytics"],
    queryFn: () => getPlanAnalytics(plan.id),
    staleTime: 30 * 1000,
  });
  const [downloading, setDownloading] = useState<"pdf" | "csv" | null>(null);
  const [dlError, setDlError] = useState<string | null>(null);

  const handleDownload = async (format: "pdf" | "csv") => {
    setDownloading(format);
    setDlError(null);
    try {
      await downloadPlanBuyers(plan.id, format, plan.name);
    } catch {
      setDlError("Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (analyticsQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-slate-400">
        <div className="size-5 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
        Loading analytics…
      </div>
    );
  }

  if (analyticsQuery.isError || !analyticsQuery.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
        Failed to load analytics.
      </div>
    );
  }

  const a = analyticsQuery.data;

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-100 p-3 text-center dark:border-border-dark">
          <p className="text-2xl font-black text-charcoal dark:text-white">{a.purchaseCount}</p>
          <p className="text-xs text-slate-400 dark:text-white/40 mt-0.5">purchases</p>
        </div>
        <div className="rounded-lg border border-slate-100 p-3 text-center dark:border-border-dark">
          <p className="text-2xl font-black text-charcoal dark:text-white">
            {a.remainingPurchases ?? "∞"}
          </p>
          <p className="text-xs text-slate-400 dark:text-white/40 mt-0.5">remaining</p>
        </div>
        <div className="rounded-lg border border-slate-100 p-3 text-center dark:border-border-dark">
          <p
            className={`text-sm font-black ${
              a.isPurchasable ? "text-green-600" : "text-red-600"
            }`}
          >
            {a.isPurchasable ? "Available" : "Unavailable"}
          </p>
          <p className="text-xs text-slate-400 dark:text-white/40 mt-0.5">status</p>
        </div>
      </div>

      {/* Constraint breakdown */}
      {a.constraints.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30 mb-2">
            Stock breakdown
          </p>
          <div className="rounded-lg border border-slate-100 dark:border-border-dark overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-background-dark border-b border-slate-100 dark:border-border-dark">
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/40">
                    Constraint
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/40">
                    Total
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/40">
                    Available
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                {a.constraints.map((c, i) => (
                  <tr
                    key={i}
                    className={
                      c.available === 0
                        ? "bg-red-50 dark:bg-red-900/20"
                        : c.available <= 3
                          ? "bg-amber-50/60 dark:bg-amber-900/10"
                          : ""
                    }
                  >
                    <td className="px-3 py-2 text-charcoal dark:text-white">{c.label}</td>
                    <td className="px-3 py-2 text-right text-slate-500 dark:text-white/50">
                      {c.total}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-bold ${
                        c.available === 0
                          ? "text-red-600"
                          : c.available <= 3
                            ? "text-amber-600"
                            : "text-green-600"
                      }`}
                    >
                      {c.available}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {a.constraints.length === 0 && (
        <p className="text-sm text-slate-400 dark:text-white/40">
          This plan has no stock-limiting constraints — it can be purchased unlimited times while active.
        </p>
      )}

      {/* Export */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30 mb-2">
          Export buyers
        </p>
        {a.purchaseCount === 0 ? (
          <p className="text-xs text-slate-400 dark:text-white/40">No purchases yet — nothing to export.</p>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!!downloading}
              onClick={() => handleDownload("pdf")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-border-dark px-3 py-2 text-sm font-medium text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-background-dark disabled:opacity-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              {downloading === "pdf" ? "Downloading…" : "PDF"}
            </button>
            <button
              type="button"
              disabled={!!downloading}
              onClick={() => handleDownload("csv")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-border-dark px-3 py-2 text-sm font-medium text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-background-dark disabled:opacity-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">table_view</span>
              {downloading === "csv" ? "Downloading…" : "CSV"}
            </button>
          </div>
        )}
        {dlError && (
          <p className="mt-2 text-xs text-red-600">{dlError}</p>
        )}
      </div>
    </div>
  );
}

// ─── Plan modal ─────────────────────────────────────────────────────────────

function PlanModal({
  isOpen,
  onClose,
  plan,
  defaultTier,
  onSave,
  isSaving,
  saveError,
}: {
  isOpen: boolean;
  onClose: () => void;
  plan?: SponsorshipPlanCatalogItem | null;
  defaultTier?: string;
  onSave: (data: PlanFormData, ctx: PlanSaveContext) => void;
  isSaving: boolean;
  saveError: Error | null;
}) {
  const isEditing = !!plan;
  const [activeTab, setActiveTab] = useState<"edit" | "analytics">("edit");
  const [form, setForm] = useState<PlanFormData>(() => planFormDefaults(plan, { defaultTier }));
  const [snapshot] = useState<PlanFormData>(() => planFormDefaults(plan, { defaultTier }));
  const [manualPerkInput, setManualPerkInput] = useState("");
  const [newPerkSet, setNewPerkSet] = useState<Set<string>>(new Set());
  const [previewOpen, setPreviewOpen] = useState(true);
  const [advertPickerOpen, setAdvertPickerOpen] = useState(false);
  const [brandingPickerOpen, setBrandingPickerOpen] = useState(false);

  const advertsQuery = useQuery({
    queryKey: ["admin", "advert-slots", "plan-modal"],
    queryFn: getAdminAdvertSlots,
    enabled: isOpen,
    staleTime: 30 * 1000,
  });
  const brandingQuery = useQuery({
    queryKey: ["admin", "branding-slots", "plan-modal"],
    queryFn: getAdminBrandingSlots,
    enabled: isOpen,
    staleTime: 30 * 1000,
  });

  if (!isOpen) return null;

  const derivedPerks = deriveBundlePerksFromForm(
    form,
    advertsQuery.data ?? [],
    brandingQuery.data ?? [],
    plan ?? null,
  );
  const validationMsg = formValidationMessage(form);
  const canSave = !validationMsg && form.name.trim();

  const toggleId = (field: "advertSlotIds" | "brandingSlotIds", id: string) => {
    setForm((f) => {
      const cur = f[field];
      const has = cur.includes(id);
      return { ...f, [field]: has ? cur.filter((x) => x !== id) : [...cur, id] };
    });
  };

  const addManualPerk = () => {
    const trimmed = manualPerkInput.trim();
    if (!trimmed) return;
    setForm((f) => ({ ...f, manualPerks: [...f.manualPerks, trimmed] }));
    setNewPerkSet((s) => new Set([...s, trimmed]));
    setManualPerkInput("");
  };

  const removeManualPerk = (idx: number) => {
    const perk = form.manualPerks[idx];
    setForm((f) => ({ ...f, manualPerks: f.manualPerks.filter((_, j) => j !== idx) }));
    setNewPerkSet((s) => { const next = new Set(s); next.delete(perk); return next; });
  };

  const fieldDirty = (field: keyof PlanFormData): boolean => {
    if (!isEditing) return false;
    return JSON.stringify(form[field]) !== JSON.stringify(snapshot[field]);
  };

  const tierInfo = getTierStyle(form.tier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="my-8 w-[80%] md:w-[50%] rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-border-dark dark:bg-background-dark-soft">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-black text-charcoal dark:text-white">
              {isEditing ? "Edit plan" : "New sponsorship plan"}
            </h2>
            {isEditing && (
              <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">
                Changes are not saved until you click Save.
              </p>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${tierInfo.color}`}>
            {tierInfo.label}
          </span>
        </div>

        {/* ── Tab bar (edit mode only) ── */}
        {isEditing && (
          <div className="flex gap-1 rounded-lg bg-slate-100 dark:bg-background-dark p-1 mb-5">
            {(["edit", "analytics"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-white dark:bg-background-dark-soft text-charcoal dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* ── Analytics tab ── */}
        {isEditing && activeTab === "analytics" && plan ? (
          <AnalyticsTab plan={plan} />
        ) : (
          <div className="space-y-0 max-h-[70vh] overflow-y-auto pr-1">

            {/* ── Snapshot banner (edit only) ── */}
            {isEditing && plan && (
              <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 dark:border-border-dark dark:bg-background-dark px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30 mb-1.5">
                  Currently saved
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-white/50">
                  <span className="font-semibold text-charcoal dark:text-white">{plan.name}</span>
                  <span>·</span>
                  <span>{formatKoboToNaira(plan.priceInKobo)}</span>
                  {plan.bundleBoothTier && (
                    <><span>·</span><span>{plan.bundleBoothTier.charAt(0).toUpperCase() + plan.bundleBoothTier.slice(1)} booth</span></>
                  )}
                  {(plan.ticketAdmits ?? 1) > 1 && (
                    <><span>·</span><span>{plan.ticketAdmits} admits</span></>
                  )}
                  {(plan.advertSlots?.length ?? 0) > 0 && (
                    <><span>·</span><span>{plan.advertSlots!.length} advert {plan.advertSlots!.length === 1 ? "slot" : "slots"}</span></>
                  )}
                  {(plan.brandingSlots?.length ?? 0) > 0 && (
                    <><span>·</span><span>{plan.brandingSlots!.length} branding {plan.brandingSlots!.length === 1 ? "slot" : "slots"}</span></>
                  )}
                  {(plan.manualPerks?.length ?? 0) > 0 && (
                    <><span>·</span><span>{plan.manualPerks!.length} extra {plan.manualPerks!.length === 1 ? "perk" : "perks"}</span></>
                  )}
                  {plan.isActive === false && (
                    <><span>·</span><span className="italic">Inactive</span></>
                  )}
                </div>
              </div>
            )}

            {/* ── Plan basics ── */}
            <div className="space-y-4 pb-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">Plan basics</p>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-white/70 mb-1">
                  Plan name <DirtyDot show={fieldDirty("name")} />
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-white"
                  placeholder="e.g. Gold Bundle"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-white/70 mb-1">
                    Display tier <DirtyDot show={fieldDirty("tier")} />
                  </label>
                  <select
                    value={form.tier}
                    onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-white"
                  >
                    {TIER_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-white/70 mb-1">
                    Price (₦ naira) <DirtyDot show={fieldDirty("priceNaira")} />
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={form.priceNaira}
                    onChange={(e) => setForm((f) => ({ ...f, priceNaira: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-white"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-start">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-white/70 mb-1">
                    Delegate admissions <DirtyDot show={fieldDirty("ticketAdmits")} />
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.ticketAdmits}
                    onChange={(e) => setForm((f) => ({ ...f, ticketAdmits: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                  />
                </div>
                <div className="pt-7">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="size-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                    />
                    <span className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-white/70">
                      Active (visible to sponsors)
                      <DirtyDot show={fieldDirty("isActive")} />
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* ── Bundle contents ── */}
            <div className="space-y-4 py-5 border-t border-slate-100 dark:border-border-dark">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">Bundle contents</p>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-white/70 mb-1">
                  Booth <DirtyDot show={fieldDirty("bundleBoothTier")} />
                </label>
                <select
                  value={form.bundleBoothTier}
                  onChange={(e) => setForm((f) => ({ ...f, bundleBoothTier: e.target.value as PlanFormData["bundleBoothTier"] }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                >
                  {BUNDLE_BOOTH_OPTIONS.map((o) => (
                    <option key={o.value || "none"} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                  Headliner, Platinum, or Gold only. Assigned at checkout.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-border-dark dark:bg-background-dark">
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/40 mb-2">
                    Masterclass slot
                    <DirtyDot show={fieldDirty("bundleMasterclassDuration") || fieldDirty("bundleMasterclassDay")} />
                  </p>
                  <div className="space-y-2">
                    <select
                      value={form.bundleMasterclassDuration}
                      onChange={(e) => setForm((f) => ({ ...f, bundleMasterclassDuration: e.target.value as PlanFormData["bundleMasterclassDuration"] }))}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-border-dark dark:bg-background-dark dark:text-white"
                    >
                      <option value="">Duration…</option>
                      {DURATION_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <select
                      value={form.bundleMasterclassDay}
                      onChange={(e) => setForm((f) => ({ ...f, bundleMasterclassDay: e.target.value as PlanFormData["bundleMasterclassDay"] }))}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-border-dark dark:bg-background-dark dark:text-white"
                    >
                      <option value="">Day…</option>
                      {DAY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-border-dark dark:bg-background-dark">
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/40 mb-2">
                    Presentation slot
                    <DirtyDot show={fieldDirty("bundlePresentationDuration") || fieldDirty("bundlePresentationDay")} />
                  </p>
                  <div className="space-y-2">
                    <select
                      value={form.bundlePresentationDuration}
                      onChange={(e) => setForm((f) => ({ ...f, bundlePresentationDuration: e.target.value as PlanFormData["bundlePresentationDuration"] }))}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-border-dark dark:bg-background-dark dark:text-white"
                    >
                      <option value="">Duration…</option>
                      {DURATION_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <select
                      value={form.bundlePresentationDay}
                      onChange={(e) => setForm((f) => ({ ...f, bundlePresentationDay: e.target.value as PlanFormData["bundlePresentationDay"] }))}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-border-dark dark:bg-background-dark dark:text-white"
                    >
                      <option value="">Day…</option>
                      {DAY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Marketing slots ── */}
            <div className="space-y-4 py-5 border-t border-slate-100 dark:border-border-dark">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">Marketing slots</p>

              <SlotSection
                label="Advert slots"
                selectedIds={form.advertSlotIds}
                snapshotIds={snapshot.advertSlotIds}
                allSlots={advertsQuery.data ?? []}
                loading={advertsQuery.isLoading}
                isEditing={isEditing}
                pickerOpen={advertPickerOpen}
                onToggle={(id) => toggleId("advertSlotIds", id)}
                onTogglePicker={() => setAdvertPickerOpen((v) => !v)}
              />

              <SlotSection
                label="Branding slots"
                selectedIds={form.brandingSlotIds}
                snapshotIds={snapshot.brandingSlotIds}
                allSlots={brandingQuery.data ?? []}
                loading={brandingQuery.isLoading}
                isEditing={isEditing}
                pickerOpen={brandingPickerOpen}
                onToggle={(id) => toggleId("brandingSlotIds", id)}
                onTogglePicker={() => setBrandingPickerOpen((v) => !v)}
              />
            </div>

            {/* ── Other perks ── */}
            <div className="space-y-3 py-5 border-t border-slate-100 dark:border-border-dark">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">
                Other perks
                <DirtyDot show={fieldDirty("manualPerks")} />
              </p>

              {form.manualPerks.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.manualPerks.map((perk, i) => {
                    const isNew = isEditing && newPerkSet.has(perk);
                    return (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isNew
                            ? "border border-dashed border-secondary/70 text-secondary"
                            : "bg-slate-100 text-slate-700 dark:bg-background-dark dark:text-white/70"
                        }`}
                      >
                        {perk}
                        <button
                          type="button"
                          onClick={() => removeManualPerk(i)}
                          className="hover:text-red-500 transition-colors ml-0.5"
                          aria-label="Remove perk"
                        >
                          <span className="material-symbols-outlined text-[13px]">close</span>
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manualPerkInput}
                  onChange={(e) => setManualPerkInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addManualPerk(); } }}
                  placeholder="e.g. Logo on event website"
                  className="flex-1 bg-transparent border-0 border-b-2 border-secondary px-1 py-1.5 text-sm text-charcoal dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addManualPerk}
                  className="rounded-lg bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary hover:bg-secondary/20 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* ── What companies will see ── */}
            <div className="border-t border-slate-100 dark:border-border-dark pt-5 pb-1">
              <button
                type="button"
                onClick={() => setPreviewOpen((v) => !v)}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-background-dark transition-colors"
              >
                <span>What companies will see</span>
                <span className="material-symbols-outlined text-[18px]">
                  {previewOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {previewOpen && (
                <ul className="mt-3 space-y-1.5 px-1">
                  {derivedPerks.map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-charcoal dark:text-white/90">
                      <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">check_circle</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        )}

        {activeTab === "edit" && validationMsg && (
          <p className="mt-3 text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2">{validationMsg}</p>
        )}
        {activeTab === "edit" && saveError && (
          <p className="mt-3 text-sm text-red-800 bg-red-50 rounded-lg px-3 py-2">{saveError.message}</p>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-border-dark dark:text-white/70 dark:hover:bg-background-dark"
          >
            {activeTab === "analytics" ? "Close" : "Cancel"}
          </button>
          {activeTab === "edit" && (
            <button
              type="button"
              onClick={() => onSave(form, { adverts: advertsQuery.data ?? [], branding: brandingQuery.data ?? [] })}
              disabled={isSaving || !canSave}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create plan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminSponsorshipPlansPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInstance, setModalInstance] = useState(0);
  const [editingPlan, setEditingPlan] = useState<SponsorshipPlanCatalogItem | null>(null);
  const [createDefaultTier, setCreateDefaultTier] = useState<string | undefined>(undefined);

  const { data: plans, isLoading, isError } = useQuery({
    queryKey: Q_PLANS,
    queryFn: () => getAdminSponsorshipPlans(),
    staleTime: 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: async (vars: { data: PlanFormData; adverts: AdminAdvertSlot[]; branding: AdminBrandingSlot[] }) => {
      const payload = buildSponsorshipPlanPayload(
        vars.data,
        Boolean(editingPlan),
        vars.adverts,
        vars.branding,
        editingPlan,
      );
      if (editingPlan) {
        return patchAdminSponsorshipPlan(editingPlan.id, payload);
      }
      return postAdminSponsorshipPlan(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: Q_PLANS });
      setIsModalOpen(false);
      setEditingPlan(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminSponsorshipPlan(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: Q_PLANS });
    },
  });

  const handleSave = (data: PlanFormData, ctx: PlanSaveContext) => {
    saveMutation.mutate({ data, adverts: ctx.adverts, branding: ctx.branding });
  };

  const handleEdit = (plan: SponsorshipPlanCatalogItem) => {
    saveMutation.reset();
    setCreateDefaultTier(undefined);
    setEditingPlan(plan);
    setModalInstance((n) => n + 1);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    saveMutation.reset();
    setCreateDefaultTier(undefined);
    setEditingPlan(null);
    setModalInstance((n) => n + 1);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this sponsorship plan? Only allowed if there are no payments.")) {
      deleteMutation.mutate(id);
    }
  };

  // Sort: tier order, then price ascending
  const TIER_ORDER = ["headliner", "platinum", "gold", "silver", "bronze"];
  const sortedPlans = [...(plans ?? [])].sort((a, b) => {
    const ta = TIER_ORDER.indexOf(a.tier.toLowerCase());
    const tb = TIER_ORDER.indexOf(b.tier.toLowerCase());
    if (ta !== tb) return (ta === -1 ? 99 : ta) - (tb === -1 ? 99 : tb);
    return a.priceInKobo - b.priceInKobo;
  });

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-charcoal dark:text-white">
              Sponsorship plans
            </h2>
            <p className="text-sm text-slate-500 dark:text-white/50">
              Create and manage sponsorship packages with booths, sessions, and marketing slots.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create plan
          </button>
        </div>
      </header>

      <div className="bg-background-light p-4 dark:bg-background-dark sm:p-6 lg:p-8">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600 py-8">
            <div className="size-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
            Loading sponsorship plans…
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-800">
            Failed to load sponsorship plans. Please try again.
          </div>
        ) : sortedPlans.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center dark:border-border-dark dark:bg-background-dark-soft/40">
            <p className="text-slate-400 dark:text-white/30 text-sm">No sponsorship plans yet.</p>
            <button
              type="button"
              onClick={handleCreate}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Create your first plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sortedPlans.map((plan) => {
              const tierInfo = getTierStyle(plan.tier);
              return (
                <div
                  key={plan.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2 px-5 pt-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tierInfo.color}`}>
                        {tierInfo.label}
                      </span>
                      <StockBadge plan={plan} />
                      {plan.isActive === false && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-background-dark dark:text-white/50">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(plan)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-secondary/10 hover:text-secondary"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(plan.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Plan name + price */}
                  <div className="px-5 pt-3">
                    <h3 className="text-lg font-black text-charcoal dark:text-white leading-tight">
                      {plan.name}
                    </h3>
                    <p className="text-2xl font-black text-primary mt-0.5">
                      {formatKoboToNaira(plan.priceInKobo)}
                    </p>
                  </div>

                  {/* Bundle summary */}
                  <p className="px-5 pt-2 text-xs text-slate-500 dark:text-white/40">
                    {bundleSummaryLine(plan)}
                  </p>

                  {/* Perks preview */}
                  {plan.perks && plan.perks.length > 0 && (
                    <ul className="px-5 pt-3 space-y-1">
                      {plan.perks.slice(0, 3).map((perk, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-white/60">
                          <span className="material-symbols-outlined text-secondary text-[13px] shrink-0 mt-0.5">check_circle</span>
                          <span className="line-clamp-1">{perk}</span>
                        </li>
                      ))}
                      {plan.perks.length > 3 && (
                        <li className="text-xs text-slate-400 pl-5">+{plan.perks.length - 3} more</li>
                      )}
                    </ul>
                  )}

                  {/* Footer stats */}
                  <div className="mt-auto flex items-center gap-4 border-t border-slate-100 dark:border-border-dark px-5 py-3 mt-4">
                    <span className="text-sm text-slate-600 dark:text-white/60">
                      <span className="font-bold text-charcoal dark:text-white">
                        {plan.purchaseCount ?? 0}
                      </span>{" "}
                      bought
                    </span>
                    {plan.remainingPurchases != null ? (
                      <span className="text-sm text-slate-600 dark:text-white/60">
                        <span className="font-bold text-charcoal dark:text-white">
                          {plan.remainingPurchases}
                        </span>{" "}
                        remaining
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-white/30">No stock limit</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PlanModal
        key={modalInstance}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
          setCreateDefaultTier(undefined);
        }}
        plan={editingPlan}
        defaultTier={editingPlan ? undefined : createDefaultTier}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
        saveError={saveMutation.error instanceof Error ? saveMutation.error : null}
      />
    </>
  );
}
