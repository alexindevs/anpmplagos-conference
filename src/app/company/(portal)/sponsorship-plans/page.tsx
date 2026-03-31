"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getCompanyNameFromAuthUser, isCompanyRegType } from "@/lib/auth-api";
import {
  ApiError,
  formatKoboToNaira,
  getSponsorshipPlans,
  getExhibitorProfile,
  initializeSponsorshipPlanPayment,
  type SponsorshipPlanCatalogItem,
} from "@/lib/api";

const Q_PLANS = ["sponsorship-plans", "available"] as const;
const Q_PROFILE = ["company", "profile", "sponsorship-tier"] as const;

const TIER_RANK: Record<string, number> = {
  silver: 1,
  gold: 2,
  platinum: 3,
  headliner: 4,
};

const TIER_DISPLAY: Record<string, { label: string; color: string; bg: string }> = {
  silver: { label: "Silver", color: "text-slate-600", bg: "bg-slate-100" },
  gold: { label: "Gold", color: "text-amber-600", bg: "bg-amber-50" },
  platinum: { label: "Platinum", color: "text-secondary", bg: "bg-secondary/10" },
  headliner: { label: "Headliner", color: "text-primary", bg: "bg-primary/10" },
};

function PlanCard({
  plan,
  currentTierRank,
  paying,
  onPurchase,
}: {
  plan: SponsorshipPlanCatalogItem;
  currentTierRank: number;
  paying: boolean;
  onPurchase: () => void;
}) {
  const planTierRank = TIER_RANK[plan.tier.toLowerCase()] ?? 0;
  const isUpgrade = planTierRank > currentTierRank;
  const isCurrentTier = planTierRank === currentTierRank && currentTierRank > 0;
  const tierStyle = TIER_DISPLAY[plan.tier.toLowerCase()] ?? { label: plan.tier, color: "text-slate-600", bg: "bg-slate-100" };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-secondary/20 border-t-2 border-t-secondary/60 bg-white shadow-sm">
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-black text-[#181112] text-lg">{plan.name}</h3>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold mt-2 ${tierStyle.bg} ${tierStyle.color}`}>
              {tierStyle.label} Tier
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-primary">{formatKoboToNaira(plan.priceInKobo)}</p>
          </div>
        </div>

        {plan.perks && plan.perks.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Benefits</p>
            <ul className="space-y-1.5">
              {plan.perks.map((perk, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">check_circle</span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

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
              disabled={paying}
              onClick={onPurchase}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {paying ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Processing…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  {isUpgrade ? "Upgrade" : "Purchase"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompanySponsorshipPlansPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isPending: userLoading } = useAuthSession();
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && (!user || !isCompanyRegType(user))) {
      router.push("/");
    }
  }, [user, userLoading, router]);

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

  const currentTier = useMemo(() => {
    const p = profileQuery.data;
    if (!p) return "";
    return (p.highestSponsorshipTier ?? p.effectiveDisplayTier ?? p.tier ?? "").trim().toLowerCase();
  }, [profileQuery.data]);

  const currentTierRank = useMemo(() => TIER_RANK[currentTier] ?? 0, [currentTier]);

  const tierDisplay = TIER_DISPLAY[currentTier] ?? { label: currentTier || "Silver", color: "text-slate-600", bg: "bg-slate-100" };

  const groupedPlans = useMemo(() => {
    const plans = plansQuery.data ?? [];
    const groups: Record<string, SponsorshipPlanCatalogItem[]> = {
      headliner: [],
      platinum: [],
      gold: [],
      silver: [],
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

  const purchaseMutation = useMutation({
    mutationFn: initializeSponsorshipPlanPayment,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: Q_PLANS });
      void queryClient.invalidateQueries({ queryKey: Q_PROFILE });
      window.location.href = data.authorizationUrl;
    },
    onSettled: () => {
      setPayingId(null);
    },
  });

  const payError =
    purchaseMutation.error instanceof ApiError
      ? (purchaseMutation.error.body?.message as string) || purchaseMutation.error.message
      : purchaseMutation.error instanceof Error
        ? purchaseMutation.error.message
        : null;

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  const handlePurchase = (planId: string) => {
    setPayingId(planId);
    purchaseMutation.mutate({ sponsorshipPlanId: planId });
  };

  const tierOrder: Array<keyof typeof groupedPlans> = ["headliner", "platinum", "gold", "silver"];

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-8 border-l-4 border-secondary pl-4">
        <h1 className="text-2xl font-black text-[#181112]">Sponsorship Plans</h1>
        <p className="text-sm text-slate-600 mt-2">
          Upgrade your company&apos;s visibility with sponsorship tiers. Choose a plan that matches your goals.
        </p>
      </div>

      {/* Current Tier Card */}
      <div className="mb-8 rounded-xl border border-secondary/20 border-l-4 border-l-secondary bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Tier</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${tierDisplay.bg} ${tierDisplay.color}`}>
                {tierDisplay.label}
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Company</p>
            <p className="text-sm font-bold text-[#181112] mt-1">{companyName || "Your Company"}</p>
          </div>
        </div>
      </div>

      {payError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {payError}
        </div>
      )}

      {/* Plans by Tier */}
      <div className="space-y-10">
        {tierOrder.map((tierKey) => {
          const tierPlans = groupedPlans[tierKey];
          if (tierPlans.length === 0) return null;

          const tierInfo = TIER_DISPLAY[tierKey];

          return (
            <section key={tierKey} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined ${tierInfo.color}`}>
                  {tierKey === "headliner" ? "campaign" : tierKey === "platinum" ? "workspace_premium" : tierKey === "gold" ? "verified" : "stars"}
                </span>
                <h2 className={`text-xl font-black ${tierInfo.color}`}>{tierInfo.label} Plans</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tierPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    currentTierRank={currentTierRank}
                    paying={payingId === plan.id}
                    onPurchase={() => handlePurchase(plan.id)}
                  />
                ))}
              </div>
            </section>
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
    </main>
  );
}
