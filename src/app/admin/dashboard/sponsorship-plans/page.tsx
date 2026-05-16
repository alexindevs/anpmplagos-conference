"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminSponsorshipPlan,
  formatKoboToNaira,
  getAdminAdvertSlots,
  getAdminBrandingSlots,
  getAdminSponsorshipPlans,
  parseNairaInputToKobo,
  patchAdminSponsorshipPlan,
  postAdminSponsorshipPlan,
  type AdminAdvertSlot,
  type AdminBrandingSlot,
  type ConferenceDay,
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
  return plan.advertSlots.map((row) => row.advertSlot?.id).filter((id): id is string => Boolean(id));
}

function brandingIdsFromPlan(plan: SponsorshipPlanCatalogItem | null | undefined): string[] {
  if (!plan?.brandingSlots?.length) return [];
  return plan.brandingSlots.map((row) => row.brandingSlot?.id).filter((id): id is string => Boolean(id));
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
  return parts.length ? parts.join(" · ") : "—";
}

type PlanSaveContext = { adverts: AdminAdvertSlot[]; branding: AdminBrandingSlot[] };

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
  /** When creating, pre-select display tier (e.g. from an empty tier row). */
  defaultTier?: string;
  onSave: (data: PlanFormData, ctx: PlanSaveContext) => void;
  isSaving: boolean;
  saveError: Error | null;
}) {
  const [form, setForm] = useState<PlanFormData>(() => planFormDefaults(plan, { defaultTier }));

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

  const slotSelectable = (slot: AdminAdvertSlot | AdminBrandingSlot, selectedIds: string[]) => {
    if (selectedIds.includes(slot.id)) return true;
    return slot.availableSlots === slot.totalSlots && !slot.isReserved;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="my-8 w-full max-w-[90%] md:max-w-[50%] rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-border-dark dark:bg-background-dark-soft">
        <h2 className="text-xl font-black text-charcoal dark:text-white mb-4">
          {plan ? "Edit sponsorship plan" : "Create sponsorship plan"}
        </h2>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">Plan name</label>
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
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">
                Display tier
              </label>
              <select
                value={form.tier}
                onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-white"
              >
                {TIER_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">
                Price (₦ naira)
              </label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={form.priceNaira}
                onChange={(e) => setForm((f) => ({ ...f, priceNaira: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-white"
                placeholder="e.g. 50000 or 50,000"
              />
          
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">
              Delegate admissions included
            </label>
            <input
              type="number"
              min={1}
              value={form.ticketAdmits}
              onChange={(e) => setForm((f) => ({ ...f, ticketAdmits: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
              How many conference delegates this plan covers when purchased (minimum 1).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">
              Bundle booth (checkout assignment)
            </label>
            <select
              value={form.bundleBoothTier}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  bundleBoothTier: e.target.value as PlanFormData["bundleBoothTier"],
                }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
            >
              {BUNDLE_BOOTH_OPTIONS.map((o) => (
                <option key={o.value || "none"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
              Bundles may only include a <span className="font-semibold">Headliner</span>,{" "}
              <span className="font-semibold">Platinum</span>, or <span className="font-semibold">Gold</span> booth.
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-border-dark dark:bg-background-dark">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Bundle masterclass slot</p>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.bundleMasterclassDuration}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    bundleMasterclassDuration: e.target.value as PlanFormData["bundleMasterclassDuration"],
                  }))
                }
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
              >
                <option value="">Duration…</option>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <select
                value={form.bundleMasterclassDay}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bundleMasterclassDay: e.target.value as PlanFormData["bundleMasterclassDay"] }))
                }
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
              >
                <option value="">Day…</option>
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-border-dark dark:bg-background-dark">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Bundle presentation slot</p>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.bundlePresentationDuration}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    bundlePresentationDuration: e.target.value as PlanFormData["bundlePresentationDuration"],
                  }))
                }
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
              >
                <option value="">Duration…</option>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <select
                value={form.bundlePresentationDay}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    bundlePresentationDay: e.target.value as PlanFormData["bundlePresentationDay"],
                  }))
                }
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
              >
                <option value="">Day…</option>
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="plan-is-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="size-4 rounded border-slate-300 text-primary focus:ring-primary/30"
            />
            <label htmlFor="plan-is-active" className="text-sm font-medium text-slate-700 dark:text-white/70">
              Plan is active (visible for purchase)
            </label>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-white/70 mb-2">Advert slots (optional)</p>
            <p className="text-xs text-slate-500 mb-2">Only available slots can be added. Saving updates this plan&apos;s advert and branding selections.</p>
            <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 divide-y dark:border-border-dark">
              {advertsQuery.isLoading ? (
                <p className="p-3 text-xs text-slate-500">Loading…</p>
              ) : (
                (advertsQuery.data ?? []).map((slot) => {
                  const sel = form.advertSlotIds.includes(slot.id);
                  const ok = slotSelectable(slot, form.advertSlotIds);
                  return (
                    <label
                      key={slot.id}
                      className={`flex items-center gap-2 px-3 py-2 text-sm ${ok || sel ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                    >
                      <input
                        type="checkbox"
                        checked={sel}
                        disabled={!ok && !sel}
                        onChange={() => {
                          if (sel) toggleId("advertSlotIds", slot.id);
                          else if (ok) toggleId("advertSlotIds", slot.id);
                        }}
                      />
                      <span className="truncate">{slot.title}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-white/70 mb-2">Branding slots (optional)</p>
            <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 divide-y dark:border-border-dark">
              {brandingQuery.isLoading ? (
                <p className="p-3 text-xs text-slate-500">Loading…</p>
              ) : (
                (brandingQuery.data ?? []).map((slot) => {
                  const sel = form.brandingSlotIds.includes(slot.id);
                  const ok = slotSelectable(slot, form.brandingSlotIds);
                  return (
                    <label
                      key={slot.id}
                      className={`flex items-center gap-2 px-3 py-2 text-sm ${ok || sel ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                    >
                      <input
                        type="checkbox"
                        checked={sel}
                        disabled={!ok && !sel}
                        onChange={() => {
                          if (sel) toggleId("brandingSlotIds", slot.id);
                          else if (ok) toggleId("brandingSlotIds", slot.id);
                        }}
                      />
                      <span className="truncate">{slot.title}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-4 dark:border-secondary/30 dark:bg-secondary/10">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">
              Plan perks (saved with this bundle)
            </p>
            <p className="text-xs text-slate-500 dark:text-white/50 mb-3">
              Included automatically based on the selected booth, sessions, and marketing slots.
            </p>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-charcoal dark:text-white/90">
              {derivedPerks.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        {validationMsg && (
          <p className="mt-3 text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2">{validationMsg}</p>
        )}
        {saveError && (
          <p className="mt-3 text-sm text-red-800 bg-red-50 rounded-lg px-3 py-2">{saveError.message}</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-border-dark dark:text-white/70 dark:hover:bg-background-dark"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onSave(form, {
                adverts: advertsQuery.data ?? [],
                branding: brandingQuery.data ?? [],
              })
            }
            disabled={isSaving || !canSave}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Saving…" : plan ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

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

  const groupedPlans = useMemo(() => {
    const groups: Record<string, SponsorshipPlanCatalogItem[]> = {
      headliner: [],
      platinum: [],
      gold: [],
      silver: [],
      bronze: [],
    };
    (plans ?? []).forEach((plan) => {
      const tier = plan.tier.toLowerCase();
      if (groups[tier]) {
        groups[tier].push(plan);
      } else {
        groups.silver.push(plan);
      }
    });
    return groups;
  }, [plans]);

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

  const handleCreateForTier = (tierKey: string) => {
    saveMutation.reset();
    setEditingPlan(null);
    setCreateDefaultTier(tierKey);
    setModalInstance((n) => n + 1);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this sponsorship plan? Only allowed if there are no payments.")) {
      deleteMutation.mutate(id);
    }
  };

  const tierOrder: Array<keyof typeof groupedPlans> = ["headliner", "platinum", "gold", "silver", "bronze"];

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-charcoal dark:text-white">Sponsorship plans</h2>
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
        ) : (
          <div className="space-y-6">
            {tierOrder.map((tierKey) => {
              const tierPlans = groupedPlans[tierKey];
              const tierInfo = getTierStyle(tierKey);

              return (
                <section key={tierKey} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`rounded-full px-3 py-1 text-sm font-black ${tierInfo.color}`}>{tierInfo.label}</span>
                    {tierPlans.length === 0 && (
                      <button
                        type="button"
                        onClick={() => handleCreateForTier(tierKey)}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:border-secondary hover:bg-secondary/5 hover:text-secondary dark:border-border-dark dark:bg-background-dark-soft dark:hover:border-secondary"
                        title="Create plan"
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                      </button>
                    )}
                  </div>

                  {tierPlans.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-10 dark:border-border-dark dark:bg-background-dark-soft/40" />
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 dark:border-border-dark dark:bg-background-dark-softer">
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                                Name
                              </th>
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                                Price
                              </th>
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                                Bundle
                              </th>
                              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                                Perks
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                            {tierPlans.map((plan) => (
                              <tr
                                key={plan.id}
                                className="transition-colors hover:bg-slate-50 dark:hover:bg-background-dark-softer"
                              >
                                <td className="px-4 py-3">
                                  <div className="font-bold text-charcoal dark:text-white">{plan.name}</div>
                                  {plan.isActive === false && (
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-background-dark dark:text-white/50">
                                      INACTIVE
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="font-black text-primary">{formatKoboToNaira(plan.priceInKobo)}</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-600 dark:text-white/60 max-w-[220px]">
                                  {bundleSummaryLine(plan)}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-slate-600 dark:text-white/60">
                                    {plan.perks && plan.perks.length > 0 ? (
                                      <ul className="space-y-0.5">
                                        {plan.perks.slice(0, 2).map((perk, idx) => (
                                          <li key={idx} className="truncate max-w-[200px]">
                                            {perk}
                                          </li>
                                        ))}
                                        {plan.perks.length > 2 && (
                                          <li className="text-xs text-slate-400">+{plan.perks.length - 2} more</li>
                                        )}
                                      </ul>
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(plan)}
                                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-secondary/10 hover:text-secondary"
                                      title="Edit"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(plan.id)}
                                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                      title="Delete"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>
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
