"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  formatKoboToNaira,
  getSponsorshipPlans,
  type SponsorshipPlanCatalogItem,
} from "@/lib/api";

const Q_PLANS = ["admin", "sponsorship-plans"] as const;

const TIER_OPTIONS = [
  { value: "silver", label: "Silver", color: "bg-slate-100 text-slate-700" },
  { value: "gold", label: "Gold", color: "bg-amber-100 text-amber-700" },
  { value: "platinum", label: "Platinum", color: "bg-secondary/10 text-secondary" },
  { value: "headliner", label: "Headliner", color: "bg-primary/10 text-primary" },
];

function getTierStyle(tier: string) {
  return (
    TIER_OPTIONS.find((t) => t.value === tier.toLowerCase()) ?? {
      label: tier,
      color: "bg-slate-100 text-slate-700",
    }
  );
}

interface PlanFormData {
  name: string;
  priceInKobo: number;
  tier: string;
  perks: string[];
  isActive: boolean;
}

function PlanModal({
  isOpen,
  onClose,
  plan,
  onSave,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  plan?: SponsorshipPlanCatalogItem | null;
  onSave: (data: PlanFormData) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<PlanFormData>({
    name: plan?.name ?? "",
    priceInKobo: plan?.priceInKobo ?? 0,
    tier: plan?.tier ?? "silver",
    perks: plan?.perks ?? [""],
    isActive: true,
  });

  if (!isOpen) return null;

  const addPerk = () => setForm((f) => ({ ...f, perks: [...f.perks, ""] }));
  const removePerk = (idx: number) =>
    setForm((f) => ({ ...f, perks: f.perks.filter((_, i) => i !== idx) }));
  const updatePerk = (idx: number, value: string) =>
    setForm((f) => ({ ...f, perks: f.perks.map((p, i) => (i === idx ? value : p)) }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-border-dark dark:bg-background-dark-soft">
        <h2 className="text-xl font-black text-[#181112] dark:text-white mb-4">
          {plan ? "Edit Sponsorship Plan" : "Create Sponsorship Plan"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">Plan Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-white"
              placeholder="e.g., Gold Premium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">Tier</label>
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
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">Price (kobo)</label>
              <input
                type="number"
                value={form.priceInKobo || ""}
                onChange={(e) => setForm((f) => ({ ...f, priceInKobo: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-white"
                placeholder="e.g., 500000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">Perks / Benefits</label>
            <div className="space-y-2">
              {form.perks.map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={perk}
                    onChange={(e) => updatePerk(idx, e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-white"
                    placeholder={`Benefit ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removePerk(idx)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove perk"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPerk}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-secondary/80"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Benefit
            </button>
          </div>
        </div>

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
            onClick={() => onSave(form)}
            disabled={isSaving || !form.name || form.priceInKobo <= 0}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Saving..." : plan ? "Save Changes" : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSponsorshipPlansPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SponsorshipPlanCatalogItem | null>(null);
  const [filterTier, setFilterTier] = useState<string>("");

  const { data: plans, isLoading, isError } = useQuery({
    queryKey: Q_PLANS,
    queryFn: getSponsorshipPlans,
    staleTime: 60 * 1000,
  });

  const filteredPlans = useMemo(() => {
    if (!filterTier) return plans ?? [];
    return (plans ?? []).filter((p) => p.tier.toLowerCase() === filterTier.toLowerCase());
  }, [plans, filterTier]);

  const groupedPlans = useMemo(() => {
    const groups: Record<string, SponsorshipPlanCatalogItem[]> = {
      headliner: [],
      platinum: [],
      gold: [],
      silver: [],
    };
    filteredPlans.forEach((plan) => {
      const tier = plan.tier.toLowerCase();
      if (groups[tier]) {
        groups[tier].push(plan);
      } else {
        groups.silver.push(plan);
      }
    });
    return groups;
  }, [filteredPlans]);

  const saveMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const url = editingPlan
        ? `/api/admin/sponsorship-plans/${editingPlan.id}`
        : "/api/admin/sponsorship-plans";
      const method = editingPlan ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to save plan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: Q_PLANS });
      setIsModalOpen(false);
      setEditingPlan(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/sponsorship-plans/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to delete plan");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: Q_PLANS });
    },
  });

  const handleSave = (data: PlanFormData) => {
    saveMutation.mutate(data);
  };

  const handleEdit = (plan: SponsorshipPlanCatalogItem) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this sponsorship plan?")) {
      deleteMutation.mutate(id);
    }
  };

  const stats = useMemo(() => {
    const all = plans ?? [];
    return {
      total: all.length,
      active: all.filter((p) => p.isActive !== false).length,
      byTier: {
        silver: all.filter((p) => p.tier.toLowerCase() === "silver").length,
        gold: all.filter((p) => p.tier.toLowerCase() === "gold").length,
        platinum: all.filter((p) => p.tier.toLowerCase() === "platinum").length,
        headliner: all.filter((p) => p.tier.toLowerCase() === "headliner").length,
      },
    };
  }, [plans]);

  const tierOrder: Array<keyof typeof groupedPlans> = ["headliner", "platinum", "gold", "silver"];

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#181112] dark:text-white">Sponsorship Plans</h2>
            <p className="text-sm text-slate-500 dark:text-white/50">Create and manage sponsorship plans for companies</p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Plan
          </button>
        </div>
      </header>

      <div className="bg-background-light p-4 dark:bg-background-dark sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          <StatCard label="Total Plans" value={String(stats.total)} />
          <StatCard label="Silver" value={String(stats.byTier.silver)} color="bg-slate-100 text-slate-700" />
          <StatCard label="Gold" value={String(stats.byTier.gold)} color="bg-amber-100 text-amber-700" />
          <StatCard label="Platinum" value={String(stats.byTier.platinum)} color="bg-secondary/10 text-secondary" />
          <StatCard label="Headliner" value={String(stats.byTier.headliner)} color="bg-primary/10 text-primary" />
        </div>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-600 dark:text-white/60">Filter by tier:</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterTier("")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                !filterTier ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {TIER_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setFilterTier(t.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  filterTier === t.value ? t.color : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plans by Tier */}
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
          <div className="space-y-8">
            {tierOrder.map((tierKey) => {
              const tierPlans = groupedPlans[tierKey];
              if (tierPlans.length === 0) return null;

              const tierInfo = getTierStyle(tierKey);

              return (
                <section key={tierKey} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined ${tierInfo.color.split(" ")[1]}`}>
                      {tierKey === "headliner" ? "campaign" : tierKey === "platinum" ? "workspace_premium" : tierKey === "gold" ? "verified" : "stars"}
                    </span>
                    <h3 className={`text-lg font-black ${tierInfo.color.split(" ")[1]}`}>
                      {tierInfo.label} Plans
                      <span className="ml-2 text-sm font-medium text-slate-500">({tierPlans.length})</span>
                    </h3>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 dark:border-border-dark dark:bg-background-dark-softer">
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Name</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Price</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Perks</th>
                            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                          {tierPlans.map((plan) => (
                            <tr
                              key={plan.id}
                              className="transition-colors hover:bg-slate-50 dark:hover:bg-background-dark-softer"
                            >
                              <td className="px-4 py-3">
                                <div className="font-bold text-[#181112] dark:text-white">{plan.name}</div>
                                {plan.isActive === false && (
                                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-background-dark dark:text-white/50">
                                    INACTIVE
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-black text-primary">{formatKoboToNaira(plan.priceInKobo)}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-slate-600 dark:text-white/60">
                                  {plan.perks && plan.perks.length > 0 ? (
                                    <ul className="space-y-0.5">
                                      {plan.perks.slice(0, 2).map((perk, idx) => (
                                        <li key={idx} className="truncate max-w-[200px]">{perk}</li>
                                      ))}
                                      {plan.perks.length > 2 && (
                                        <li className="text-xs text-slate-400">+{plan.perks.length - 2} more</li>
                                      )}
                                    </ul>
                                  ) : (
                                    <span className="text-slate-400">No perks listed</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(plan)}
                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-secondary/10 hover:text-secondary"
                                    title="Edit plan"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(plan.id)}
                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                    title="Delete plan"
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
                </section>
              );
            })}

            {(plans?.length ?? 0) === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-12 text-center dark:border-border-dark dark:bg-background-dark-soft">
                <span className="material-symbols-outlined text-4xl text-slate-300">campaign</span>
                <p className="mt-3 text-sm font-bold text-[#181112] dark:text-white">No sponsorship plans yet</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                  Create your first plan to start offering sponsorships to companies.
                </p>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Create First Plan
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <PlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        plan={editingPlan}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
      />
    </>
  );
}

function StatCard({
  label,
  value,
  color = "bg-slate-100 text-[#181112]",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">{label}</p>
      <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
