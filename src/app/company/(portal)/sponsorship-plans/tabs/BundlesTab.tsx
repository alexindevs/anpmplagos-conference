"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { conferenceCartQueryKey, useAddConferenceCartItem } from "@/hooks/use-conference-cart";
import { getCompanyNameFromAuthUser, isCompanyRegType } from "@/lib/auth-api";
import { ApiError, formatKoboToNaira, getExhibitorProfile, getSponsorshipPlans, type SponsorshipPlanCatalogItem } from "@/lib/api";
import { useClientPagination } from "@/hooks/use-shop-client-pagination";

const Q_PLANS = ["sponsorship-plans", "available"] as const;
const Q_PROFILE = ["company", "profile", "sponsorship-tier"] as const;

const TIER_RANK: Record<string, number> = {
  default: -1,
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
  headliner: 4,
};

const TIER_DISPLAY: Record<string, { label: string; color: string; bg: string }> = {
  bronze: { label: "Bronze", color: "text-orange-800", bg: "bg-orange-50" },
  silver: { label: "Silver", color: "text-slate-600", bg: "bg-slate-100" },
  gold: { label: "Gold", color: "text-amber-600", bg: "bg-amber-50" },
  platinum: { label: "Platinum", color: "text-secondary", bg: "bg-secondary/10" },
  headliner: { label: "Headliner", color: "text-primary", bg: "bg-primary/10" },
};

const SLOT_DURATION_LABEL: Record<string, string> = {
  m10: "10 min",
  m15: "15 min",
  m20: "20 min",
  m30: "30 min",
  m45: "45 min",
  h1: "1 hr",
  h2: "2 hr",
};

const CONFERENCE_DAY_LABEL: Record<string, string> = {
  day_1: "Day 1",
  day_2: "Day 2",
};

/** Fallback lines when `plan.perks` is empty (older payloads). Mirrors bundle composition. */
function synthesizedPlanBenefitLines(plan: SponsorshipPlanCatalogItem): string[] {
  const lines: string[] = [];
  const admits = plan.ticketAdmits ?? 1;
  lines.push(
    admits === 1
      ? "Conference delegate admission for one person"
      : `Conference delegate admission for ${admits} people`,
  );
  if (plan.bundleBoothTier) {
    const t = plan.bundleBoothTier.charAt(0).toUpperCase() + plan.bundleBoothTier.slice(1);
    lines.push(`${t}-tier exhibitor booth assigned at checkout`);
  }
  if (plan.bundleMasterclassDuration && plan.bundleMasterclassDay) {
    const d = SLOT_DURATION_LABEL[plan.bundleMasterclassDuration] ?? plan.bundleMasterclassDuration;
    const day = CONFERENCE_DAY_LABEL[plan.bundleMasterclassDay] ?? plan.bundleMasterclassDay;
    lines.push(`Masterclass slot: ${d} · ${day}`);
  }
  if (plan.bundlePresentationDuration && plan.bundlePresentationDay) {
    const d = SLOT_DURATION_LABEL[plan.bundlePresentationDuration] ?? plan.bundlePresentationDuration;
    const day = CONFERENCE_DAY_LABEL[plan.bundlePresentationDay] ?? plan.bundlePresentationDay;
    lines.push(`Presentation slot: ${d} · ${day}`);
  }
  (plan.advertSlots ?? []).forEach((row) => {
    const t = row.advertSlot?.title ?? "Advert slot";
    lines.push(`Advert placement: ${t}`);
  });
  (plan.brandingSlots ?? []).forEach((row) => {
    const t = row.brandingSlot?.title ?? "Branding slot";
    lines.push(`Branding placement: ${t}`);
  });
  return lines;
}

function planBenefitLines(plan: SponsorshipPlanCatalogItem): string[] {
  const fromPerks = (plan.perks ?? []).map((p) => p.trim()).filter(Boolean);
  if (fromPerks.length > 0) return fromPerks;
  return synthesizedPlanBenefitLines(plan);
}

function PlanCard({
  plan,
  currentTierRank,
  adding,
  onAddToCart,
}: {
  plan: SponsorshipPlanCatalogItem;
  currentTierRank: number;
  adding: boolean;
  onAddToCart: () => void;
}) {
  const planTierRank = TIER_RANK[plan.tier.toLowerCase()] ?? 0;
  const isUpgrade = planTierRank > currentTierRank;
  const isCurrentTier = planTierRank === currentTierRank && currentTierRank > 0;
  const tierStyle =
    TIER_DISPLAY[plan.tier.toLowerCase()] ?? { label: plan.tier, color: "text-slate-600", bg: "bg-slate-100" };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-secondary/20 border-t-2 border-t-secondary/60 bg-white shadow-sm">
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-black text-[#181112] text-lg">{plan.name}</h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold mt-2 ${tierStyle.bg} ${tierStyle.color}`}
            >
              {tierStyle.label} Tier
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-primary">{formatKoboToNaira(plan.priceInKobo)}</p>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-secondary/15 bg-secondary/5 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Benefits</p>
          <ul className="space-y-1.5">
            {planBenefitLines(plan).map((line, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">check_circle</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-4">
          {isCurrentTier ? (
            <button
              type="button"
              disabled
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-500 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              Current Tier
            </button>
          ) : (
            <button
              type="button"
              disabled={adding}
              onClick={onAddToCart}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {adding ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Adding…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  {isUpgrade ? "Add upgrade to cart" : "Add to cart"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PaginationBar({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-700 disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-700 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

function TierPlanSection({
  tierKey,
  tierPlans,
  tierInfo,
  currentTierRank,
  addingId,
  addPending,
  onAddPlan,
}: {
  tierKey: string;
  tierPlans: SponsorshipPlanCatalogItem[];
  tierInfo: { label: string; color: string; bg: string };
  currentTierRank: number;
  addingId: string | null;
  addPending: boolean;
  onAddPlan: (planId: string) => void;
}) {
  const { page, setPage, totalPages, pageItems } = useClientPagination(tierPlans);
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined ${tierInfo.color}`}>
          {tierKey === "headliner"
            ? "campaign"
            : tierKey === "platinum"
              ? "workspace_premium"
              : tierKey === "gold"
                ? "verified"
                : tierKey === "bronze"
                  ? "shield"
                  : "stars"}
        </span>
        <h2 className={`text-xl font-black ${tierInfo.color}`}>{tierInfo.label} plans</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pageItems.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentTierRank={currentTierRank}
            adding={addingId === plan.id && addPending}
            onAddToCart={() => onAddPlan(plan.id)}
          />
        ))}
      </div>
      <PaginationBar page={page} totalPages={totalPages} onPage={setPage} />
    </section>
  );
}

export function BundlesTab() {
  const queryClient = useQueryClient();
  const { data: user, isPending: userLoading } = useAuthSession();
  const [addingId, setAddingId] = useState<string | null>(null);
  const isCompany = !!user && isCompanyRegType(user);
  const companyName = getCompanyNameFromAuthUser(user ?? undefined);

  const profileQuery = useQuery({
    queryKey: Q_PROFILE,
    queryFn: getExhibitorProfile,
    enabled: !userLoading && isCompany,
    staleTime: 60 * 1000,
  });

  const plansQuery = useQuery({
    queryKey: Q_PLANS,
    queryFn: getSponsorshipPlans,
    staleTime: 60 * 1000,
  });

  const addCartMutation = useAddConferenceCartItem();

  const currentTier = useMemo(() => {
    const p = profileQuery.data;
    if (!p) return "";
    return (p.highestSponsorshipTier ?? p.effectiveDisplayTier ?? p.tier ?? "").trim().toLowerCase();
  }, [profileQuery.data]);

  const currentTierRank = useMemo(() => TIER_RANK[currentTier] ?? 0, [currentTier]);

  const tierDisplay =
    !currentTier || currentTier === "default"
      ? { label: "Directory listing", color: "text-slate-600", bg: "bg-slate-100" }
      : (TIER_DISPLAY[currentTier] ?? {
          label: currentTier.charAt(0).toUpperCase() + currentTier.slice(1),
          color: "text-slate-600",
          bg: "bg-slate-100",
        });

  const groupedPlans = useMemo(() => {
    const plans = plansQuery.data ?? [];
    const groups: Record<string, SponsorshipPlanCatalogItem[]> = {
      headliner: [],
      platinum: [],
      gold: [],
      silver: [],
      bronze: [],
    };
    plans.forEach((plan) => {
      const tier = plan.tier.toLowerCase();
      if (groups[tier]) {
        groups[tier].push(plan);
      } else {
        groups.silver.push(plan);
      }
    });
    return groups;
  }, [plansQuery.data]);

  const tierOrder: Array<keyof typeof groupedPlans> = ["headliner", "platinum", "gold", "silver", "bronze"];

  const cartError =
    addCartMutation.error instanceof ApiError
      ? (addCartMutation.error.body?.message as string) || addCartMutation.error.message
      : addCartMutation.error instanceof Error
        ? addCartMutation.error.message
        : null;

  const handleAddPlan = (planId: string) => {
    setAddingId(planId);
    addCartMutation.mutate(
      { type: "sponsorship_plan", sponsorshipPlanId: planId },
      {
        onSettled: () => setAddingId(null),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: Q_PLANS });
          void queryClient.invalidateQueries({ queryKey: Q_PROFILE });
          void queryClient.invalidateQueries({ queryKey: conferenceCartQueryKey });
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-secondary/20 border-l-4 border-l-secondary bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Current tier</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${tierDisplay.bg} ${tierDisplay.color}`}
              >
                {tierDisplay.label}
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Company</p>
            <p className="text-sm font-bold text-[#181112] mt-1">{companyName || "Your company"}</p>
          </div>
        </div>
      </div>

      {cartError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{cartError}</div>
      )}

      <div className="space-y-2">
        <p className="text-sm text-slate-600">
          Add a sponsorship plan to your{" "}
          <Link href="/company/cart" className="font-bold text-secondary hover:underline">
            conference cart
          </Link>
          , then checkout once. Bundle booth, session slots, and marketing links are fulfilled when payment completes.
        </p>
        <p className="text-xs text-slate-600 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2">
          Do not mix a <strong className="text-[#181112]">standalone booth</strong> line with a plan that includes a{" "}
          <strong className="text-[#181112]">booth bundle</strong>. Only one booth-bundle plan per checkout.
        </p>
      </div>

      <div className="space-y-10">
        {tierOrder.map((tierKey) => {
          const tierPlans = groupedPlans[tierKey];
          if (tierPlans.length === 0) return null;
          const tierInfo = TIER_DISPLAY[tierKey];
          return (
            <TierPlanSection
              key={tierKey}
              tierKey={tierKey}
              tierPlans={tierPlans}
              tierInfo={tierInfo}
              currentTierRank={currentTierRank}
              addingId={addingId}
              addPending={addCartMutation.isPending}
              onAddPlan={handleAddPlan}
            />
          );
        })}
      </div>

      {plansQuery.isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-600 py-8">
          <div className="size-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
          Loading sponsorship plans…
        </div>
      )}

      {!plansQuery.isLoading && (plansQuery.data?.length ?? 0) === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300">campaign</span>
          <p className="text-sm font-bold text-[#181112] mt-3">No sponsorship plans available</p>
          <p className="text-xs text-slate-500 mt-1">Check back later for new sponsorship opportunities.</p>
        </div>
      )}
    </div>
  );
}
