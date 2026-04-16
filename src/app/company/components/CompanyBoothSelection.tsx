"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  getAvailableBooths,
  getExhibitorDashboard,
  getExhibitorProfile,
  getPublicExhibitors,
  formatKoboToNaira,
  type Booth,
  type PublicExhibitor,
} from "@/lib/api";
import { conferenceCartQueryKey, useAddConferenceCartItem } from "@/hooks/use-conference-cart";
import { boothPrimaryName, boothSizeTierLine } from "@/lib/booth-display";
import { useClientPagination } from "@/hooks/use-shop-client-pagination";
import { exhibitorBoothDraftKey } from "@/lib/company-local-storage";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  getCompanyIdFromAuthUser,
  getCompanyNameFromAuthUser,
  isCompanyRegType,
} from "@/lib/auth-api";

/** Lower = higher tier (displayed first). Unknown tiers sort last. */
const TIER_RANK: Record<string, number> = {
  headliner: 0,
  "headliner tier": 0,
  platinum: 1,
  "platinum tier": 1,
  gold: 2,
  "gold tier": 2,
  silver: 3,
  "silver tier": 3,
};

function tierRank(tier: string | null | undefined): number {
  const k = (tier ?? "").trim().toLowerCase();
  if (k in TIER_RANK) return TIER_RANK[k]!;
  if (!k || k === "default") return 50;
  return 25;
}

function sortOtherExhibitorsByTier(a: PublicExhibitor, b: PublicExhibitor): number {
  const tr = tierRank(a.tier) - tierRank(b.tier);
  if (tr !== 0) return tr;
  return a.companyName.localeCompare(b.companyName, undefined, { sensitivity: "base" });
}

function normalizeTier(t: string | null | undefined): string {
  return (t ?? "").trim().toLowerCase();
}

function tiersMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const na = normalizeTier(a);
  const nb = normalizeTier(b);
  if (!na || !nb) return false;
  return na === nb;
}

function boothImageSrc(booth: Pick<Booth, "boothImage" | "imageUrl">): string | null {
  const raw = booth.boothImage ?? booth.imageUrl;
  if (!raw?.trim()) return null;
  const u = raw.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
  return `${base}${u.startsWith("/") ? "" : "/"}${u}`;
}

function BoothCardImage({
  src,
  alt,
  className = "h-44",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative w-full shrink-0 bg-slate-100 ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 480px" />
    </div>
  );
}

function BoothCardReadonly({
  booth,
  subtitle,
  badge,
  profileHref,
  variant = "default",
  directoryCompanyName,
  directoryTagline,
  primaryContactName,
  primaryContactPhone,
}: {
  booth: Booth;
  subtitle?: string;
  badge?: string;
  /** Public directory: footer is profile CTA (or notice), not booth price. */
  variant?: "default" | "directory";
  profileHref?: string;
  /** Directory: headline (exhibitor company); booth name moves to meta area. */
  directoryCompanyName?: string;
  directoryTagline?: string;
  primaryContactName?: string;
  primaryContactPhone?: string;
}) {
  const metaLine = boothSizeTierLine(booth);
  const img = boothImageSrc(booth);
  const isDirectory = variant === "directory";
  const headline =
    isDirectory && directoryCompanyName?.trim()
      ? directoryCompanyName.trim()
      : boothPrimaryName(booth);
  const headerIcon = isDirectory ? "business" : "store";
  const hasContact =
    isDirectory &&
    (primaryContactName?.trim() || primaryContactPhone?.trim());

  return (
    <div className="flex flex-col min-w-full overflow-hidden rounded-xl border-2 border-secondary/25 bg-white shadow-sm">
      {img ? <BoothCardImage src={img} alt={`${headline} booth`} /> : null}
      <div className="flex flex-col p-6 flex-1 min-h-0">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined shrink-0 text-2xl text-secondary">{headerIcon}</span>
            <h3 className="text-lg font-bold text-[#181112] truncate">{headline}</h3>
          </div>
          {badge ? (
            <span className="shrink-0 rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
              {badge}
            </span>
          ) : null}
        </div>
        {isDirectory && directoryTagline?.trim() ? (
          <p className="text-sm text-slate-600 mb-3 leading-snug">{directoryTagline.trim()}</p>
        ) : null}
        {hasContact ? (
          <div className="mb-3 space-y-1 rounded-lg border border-secondary/15 bg-slate-50/80 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Primary contact</p>
            {primaryContactName?.trim() ? (
              <p className="text-sm font-semibold text-[#181112]">{primaryContactName.trim()}</p>
            ) : null}
            {primaryContactPhone?.trim() ? (
              <a
                href={`tel:${primaryContactPhone.replace(/\s/g, "")}`}
                className="inline-block text-sm font-medium text-secondary hover:underline"
              >
                {primaryContactPhone.trim()}
              </a>
            ) : null}
          </div>
        ) : null}
        {!isDirectory && subtitle ? <p className="text-xs font-semibold text-slate-600 mb-1">{subtitle}</p> : null}
        {isDirectory ? (
          <p className="text-xs text-slate-600 mb-2">
            <span className="font-bold uppercase tracking-wider text-slate-500">Booth</span>{" "}
            <span className="font-semibold text-[#181112]">
              {boothPrimaryName(booth)}
              {metaLine ? ` · ${metaLine}` : ""}
            </span>
          </p>
        ) : metaLine ? (
          <p className="text-sm font-medium text-slate-700 mb-1">{metaLine}</p>
        ) : null}
        {booth.description ? <p className="text-xs text-slate-500 mb-3 line-clamp-3">{booth.description}</p> : null}
        <div className="mt-auto pt-3 border-t border-secondary/15">
          {isDirectory ? (
            profileHref ? (
              <Link
                href={profileHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-2.5 text-sm font-bold text-secondary transition-colors hover:bg-secondary/10"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                View exhibitor profile
              </Link>
            ) : (
              <p className="text-center text-xs text-slate-500 py-2">Public profile not available yet.</p>
            )
          ) : (
            <p className="text-lg font-black text-primary">
              {booth.price != null ? formatKoboToNaira(booth.price) : "—"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CompanyBoothSelection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedBoothId, setSelectedBoothId] = useState<string>("");
  const [addingBoothId, setAddingBoothId] = useState<string | null>(null);

  const { data: user, isPending: userLoading } = useAuthSession();
  const companyId = getCompanyIdFromAuthUser(user ?? undefined);

  const addCartMutation = useAddConferenceCartItem();

  const cartErrorMessage =
    addCartMutation.error instanceof ApiError
      ? (addCartMutation.error.body?.message as string) || addCartMutation.error.message
      : addCartMutation.error instanceof Error
        ? addCartMutation.error.message
        : "Could not add to cart. Please try again.";

  const { data: booths = [], isLoading: boothsLoading, isError } = useQuery({
    queryKey: ["company", "booths", "available"],
    queryFn: getAvailableBooths,
  });

  const { page, setPage, totalPages, pageItems: boothPage } = useClientPagination(booths);

  /** Same payload + React Query cache as dashboard (`GET /me/dashboard`) so assigned booth matches. */
  const { data: dashboardData } = useQuery({
    queryKey: ["company", "dashboard", companyId],
    queryFn: async () => {
      try {
        return await getExhibitorDashboard();
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
    enabled: Boolean(companyId) && !userLoading,
    retry: false,
  });

  const boothStatus = dashboardData?.booth;

  const { data: publicExhibitors = [], isLoading: publicListLoading } = useQuery({
    queryKey: ["companies", "public", "list", "company-shop-booths"],
    queryFn: getPublicExhibitors,
  });

  const { data: exhibitorProfile } = useQuery({
    queryKey: ["company", "me", "profile", "company-shop-booths"],
    queryFn: getExhibitorProfile,
    enabled: !!companyId,
  });

  const myBooth: Booth | null =
    boothStatus?.assignedBooth &&
    String(boothStatus.status ?? "").toLowerCase() === "assigned"
      ? boothStatus.assignedBooth
      : null;

  /** Prefer profile tier; fall back to tier on assigned booth if API sends it. */
  const myTierLabel =
    exhibitorProfile?.tier?.trim() || myBooth?.tier?.trim() || null;

  const { sameTierOthers, otherTierOthers } = useMemo(() => {
    if (!companyId) {
      return { sameTierOthers: [] as PublicExhibitor[], otherTierOthers: [] as PublicExhibitor[] };
    }
    const base = publicExhibitors
      .filter((e) => e.booth && e.id !== companyId)
      .filter((e) => (myBooth ? e.booth!.id !== myBooth.id : true));

    if (!myTierLabel) {
      return {
        sameTierOthers: [],
        otherTierOthers: [...base].sort(sortOtherExhibitorsByTier),
      };
    }

    const same: PublicExhibitor[] = [];
    const rest: PublicExhibitor[] = [];
    for (const e of base) {
      if (tiersMatch(e.tier, myTierLabel)) same.push(e);
      else rest.push(e);
    }
    same.sort((a, b) =>
      a.companyName.localeCompare(b.companyName, undefined, { sensitivity: "base" })
    );
    rest.sort(sortOtherExhibitorsByTier);
    return { sameTierOthers: same, otherTierOthers: rest };
  }, [publicExhibitors, companyId, myBooth, myTierLabel]);

  useEffect(() => {
    if (!userLoading && (!user || !isCompanyRegType(user))) {
      router.push("/");
    }
  }, [user, userLoading, router]);

  const goToDashboard = () => {
    router.push("/company/dashboard");
  };

  const handleAddBoothToCart = () => {
    if (!companyId || !selectedBoothId || myBooth) return;
    setAddingBoothId(selectedBoothId);
    addCartMutation.mutate(
      { type: "booth", boothId: selectedBoothId },
      {
        onSettled: () => setAddingBoothId(null),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: ["company", "booths", "available"] });
          void queryClient.invalidateQueries({ queryKey: conferenceCartQueryKey });
        },
      }
    );
  };

  const selectedBooth = booths.find((b) => b.id === selectedBoothId);
  const selectedBoothMetaLine = selectedBooth ? boothSizeTierLine(selectedBooth) : null;
  const selectedBoothImage = selectedBooth ? boothImageSrc(selectedBooth) : null;

  useEffect(() => {
    if (!selectedBooth || !companyId) return;
    try {
      localStorage.setItem(
        exhibitorBoothDraftKey(companyId),
        JSON.stringify({
          boothId: selectedBooth.id,
          name: selectedBooth.name,
          hall: selectedBooth.hall,
          floorSection: selectedBooth.floorSection,
          size: selectedBooth.size,
          tier: selectedBooth.tier,
          description: selectedBooth.description,
          price: selectedBooth.price,
          isReserved: selectedBooth.isReserved ?? false,
          isTaken: selectedBooth.isTaken,
          updatedAt: Date.now(),
        })
      );
      // Legacy global key leaked drafts across accounts — remove if present
      localStorage.removeItem("exhibitorBoothDraft");
    } catch {
      /* ignore quota / private mode */
    }
  }, [selectedBooth, companyId]);

  const companyName = getCompanyNameFromAuthUser(user ?? undefined);

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

  return (
    <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <h2 className="mb-6 text-2xl font-black text-[#181112]">Booths</h2>

        {isError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            Unable to load available booths. Please try again later.
          </div>
        )}

        {addCartMutation.isError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {cartErrorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-10">
            {/* 1. Your booth */}
            {myBooth ? (
              <section>
                <h2 className="text-lg font-black text-[#181112] mb-1">Your booth</h2>
                <p className="text-sm text-slate-600 mb-4">
                  Currently assigned to {companyName || "your company"}.
                  {myTierLabel ? (
                    <span className="block mt-2">
                      <span className="font-bold text-[#181112]">Your tier:</span>{" "}
                      <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-bold text-secondary">
                        {myTierLabel}
                      </span>
                    </span>
                  ) : null}
                </p>
                <div className="w-auto md:max-w-100">
                  <BoothCardReadonly booth={myBooth} badge="Yours" />
                </div>
              </section>
            ) : (
              <section className="rounded-xl border border-dashed border-secondary/30 bg-secondary/5 px-4 py-4">
                <p className="text-sm font-semibold text-[#181112]">No booth assigned yet</p>
                <p className="text-sm text-slate-600 mt-1">
                  Choose an available booth below, then use <span className="font-semibold">Add booth to cart</span> in
                  the summary. Checkout once from your{" "}
                  <Link href="/company/cart" className="font-bold text-secondary hover:underline">
                    conference cart
                  </Link>
                  .
                </p>
                {myTierLabel ? (
                  <p className="text-sm mt-3">
                    <span className="font-bold text-[#181112]">Your tier:</span>{" "}
                    <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-bold text-secondary">
                      {myTierLabel}
                    </span>
                  </p>
                ) : null}
              </section>
            )}

            {/* 2. Other companies (ordered in data: same tier then other tiers) */}
            <section>
              <h2 className="text-lg font-black text-[#181112] mb-4">Other companies</h2>
              {publicListLoading ? (
                <div className="flex items-center gap-3 py-8 text-slate-600">
                  <div className="size-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
                  Loading directory…
                </div>
              ) : sameTierOthers.length === 0 && otherTierOthers.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No other companies listed yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...sameTierOthers, ...otherTierOthers].map((ex) => {
                    const b = ex.booth!;
                    const tierLabel = ex.tier?.trim() || "Exhibitor";
                    const profileHref = ex.slug
                      ? `/company/${encodeURIComponent(ex.slug)}`
                      : undefined;
                    return (
                      <div key={ex.id} className="relative">
                        <BoothCardReadonly
                          variant="directory"
                          booth={b}
                          badge={tierLabel}
                          profileHref={profileHref}
                          directoryCompanyName={ex.companyName}
                          directoryTagline={ex.tagline}
                          primaryContactName={ex.primaryContactName}
                          primaryContactPhone={ex.primaryContactPhone}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 3. Available to book */}
            <section>
              <h2 className="text-lg font-black text-[#181112] mb-4">Available booths</h2>
              {boothsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="size-8 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
                    <span className="text-slate-600">Loading booths...</span>
                  </div>
                </div>
              ) : booths.length === 0 ? (
                <div className="rounded-xl border border-secondary/20 bg-slate-50 py-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">
                    inventory_2
                  </span>
                  <p className="text-slate-600 font-bold">No booths available at this time</p>
                  <p className="text-sm text-slate-500 mt-2">Please check back later</p>
                </div>
              ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {boothPage.map((booth) => {
                    const sizeTierLine = boothSizeTierLine(booth);
                    const img = boothImageSrc(booth);
                    return (
                      <label
                        key={booth.id}
                        className={`relative flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 transition-all group ${
                          selectedBoothId === booth.id
                            ? "border-secondary bg-secondary/10 shadow-sm ring-2 ring-secondary/20"
                            : "border-secondary/25 bg-white hover:border-secondary/60"
                        }`}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name="booth"
                          checked={selectedBoothId === booth.id}
                          onChange={() => setSelectedBoothId(booth.id)}
                        />
                        {img ? (
                          <BoothCardImage src={img} alt={`${boothPrimaryName(booth)} booth`} className="h-40" />
                        ) : null}
                        <div className="flex flex-1 flex-col p-6 min-h-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="material-symbols-outlined shrink-0 text-2xl text-secondary">store</span>
                              <h3 className="text-lg font-bold text-[#181112] truncate">
                                {boothPrimaryName(booth)}
                              </h3>
                            </div>
                            {selectedBoothId === booth.id && (
                              <span className="material-symbols-outlined shrink-0 text-secondary">check_circle</span>
                            )}
                          </div>
                          {sizeTierLine ? (
                            <p className="text-sm font-medium text-slate-700 mb-1">{sizeTierLine}</p>
                          ) : null}
                          {booth.description && (
                            <p className="text-xs text-slate-500 mb-3">{booth.description}</p>
                          )}
                          <div className="mt-auto pt-3 border-t border-secondary/15">
                            <p className="text-2xl font-black text-primary">
                              {booth.price ? formatKoboToNaira(booth.price) : "Contact us"}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {totalPages > 1 ? (
                  <div className="flex items-center justify-center gap-3 pt-6">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
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
                      onClick={() => setPage(page + 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-700 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
                </>
              )}
            </section>
          </div>

          {/* Summary - right col */}
          <aside className="xl:col-span-1">
            <div className="sticky top-4 rounded-xl border border-secondary/20 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-[#181112] mb-4">Selection Summary</h3>
              {selectedBooth ? (
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booth</p>
                    {selectedBoothImage ? (
                      <div className="relative mb-3 mt-2 h-32 w-full overflow-hidden rounded-lg border border-secondary/20 bg-slate-100">
                        <Image
                          src={selectedBoothImage}
                          alt={`${boothPrimaryName(selectedBooth)} booth preview`}
                          fill
                          className="object-cover"
                          sizes="320px"
                        />
                      </div>
                    ) : null}
                    <p className="text-base font-bold text-[#181112] mt-1">
                      {boothPrimaryName(selectedBooth)}
                    </p>
                    {selectedBoothMetaLine ? (
                      <p className="text-sm text-slate-600">{selectedBoothMetaLine}</p>
                    ) : null}
                  </div>
                  {selectedBooth.description && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Details</p>
                      <p className="text-sm text-slate-600 mt-1">{selectedBooth.description}</p>
                    </div>
                  )}
                  <div className="pt-3 border-t border-secondary/15">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price</p>
                    <p className="text-3xl font-black text-primary">
                      {selectedBooth.price ? formatKoboToNaira(selectedBooth.price) : "—"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 mb-6">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">mouse</span>
                  <p className="text-sm text-slate-500">Select an available booth to see details here</p>
                </div>
              )}
              {myBooth ? (
                <>
                  <button
                    type="button"
                    onClick={goToDashboard}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 shadow-lg transition-all"
                  >
                    <span className="material-symbols-outlined">dashboard</span>
                    Go to dashboard
                  </button>
                  <p className="text-xs text-slate-500 text-center mt-3">
                    Your booth is already assigned. Manage it from your dashboard.
                  </p>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAddBoothToCart}
                    disabled={!selectedBoothId || !companyId || addCartMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                  >
                    {addingBoothId === selectedBoothId && addCartMutation.isPending ? (
                      <>
                        <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Adding…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">add_shopping_cart</span>
                        Add booth to cart
                      </>
                    )}
                  </button>
                  <Link
                    href="/company/cart"
                    className="mt-3 w-full inline-flex items-center justify-center rounded-lg border border-secondary/30 bg-white px-4 py-2.5 text-sm font-bold text-secondary hover:bg-secondary/5"
                  >
                    View cart
                  </Link>
                  <button
                    type="button"
                    onClick={goToDashboard}
                    className="mt-2 w-full text-center text-sm font-bold text-slate-600 hover:underline"
                  >
                    Go to dashboard
                  </button>
                  <p className="text-xs text-slate-500 text-center mt-3">
                    Complete payment from your cart. Your booth is assigned when the order is paid successfully.
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
    </div>
  );
}
