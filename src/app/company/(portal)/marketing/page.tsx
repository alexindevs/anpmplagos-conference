"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getCompanyNameFromAuthUser, isCompanyRegType } from "@/lib/auth-api";
import {
  ApiError,
  apiAssetUrl,
  formatKoboToNaira,
  getAvailableAdvertSlots,
  getAvailableBrandingSlots,
  getMyAdvertSlots,
  getMyBrandingSlots,
  initializeAdvertSlotPayment,
  initializeBrandingSlotPayment,
  type CompanyMarketingSlot,
} from "@/lib/api";

const Q_ADV_AVAIL = ["advert-slots", "available"] as const;
const Q_BRAND_AVAIL = ["branding-slots", "available"] as const;
const Q_ADV_ME = ["advert-slots", "me"] as const;
const Q_BRAND_ME = ["branding-slots", "me"] as const;

function CatalogCard({
  slot,
  paying,
  onPay,
}: {
  slot: CompanyMarketingSlot;
  paying: boolean;
  onPay: () => void;
}) {
  const img = apiAssetUrl(slot.image);
  const available = !slot.isTaken && !slot.isReserved;
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-secondary/20 border-t-2 border-t-secondary/60 bg-white shadow-sm">
      <div className="aspect-16/10 bg-slate-100 relative">
        {img ? (
          <Image src={img} alt="" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
            <span className="material-symbols-outlined text-5xl">image</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-bold text-[#181112] line-clamp-2">{slot.title}</h4>
        <p className="text-lg font-black text-primary mt-2">{formatKoboToNaira(slot.price)}</p>
        {slot.description?.trim() ? (
          <p className="text-xs text-slate-600 mt-2 line-clamp-3">{slot.description}</p>
        ) : null}
        <div className="mt-auto pt-4">
          <button
            type="button"
            disabled={!available || paying}
            onClick={onPay}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paying ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Starting…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">payments</span>
                {available ? "Purchase" : "Unavailable"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MySlotsTable({ rows, emptyLabel }: { rows: CompanyMarketingSlot[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600">
        {emptyLabel}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-secondary/20">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="py-2.5 px-3 text-xs font-bold uppercase text-slate-500 w-16" />
            <th className="py-2.5 px-3 text-xs font-bold uppercase text-slate-500">Title</th>
            <th className="py-2.5 px-3 text-xs font-bold uppercase text-slate-500 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((slot) => {
            const img = apiAssetUrl(slot.image);
            return (
              <tr key={slot.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2 px-3">
                  {img ? (
                    <Image src={img} alt="" width={40} height={40} className="size-10 rounded object-cover" />
                  ) : (
                    <div className="size-10 rounded bg-slate-100" />
                  )}
                </td>
                <td className="py-2.5 px-3 font-semibold text-[#181112]">{slot.title}</td>
                <td className="py-2.5 px-3 text-right font-bold text-primary whitespace-nowrap">
                  {formatKoboToNaira(slot.price)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Company marketing: advert & branding slot catalog, checkout, and purchased listings. @see FRONTEND-ADVERT-BRANDING-SLOTS.md */
export default function CompanyMarketingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isPending: userLoading } = useAuthSession();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payKind, setPayKind] = useState<"advert" | "branding" | null>(null);

  useEffect(() => {
    if (!userLoading && (!user || !isCompanyRegType(user))) {
      router.push("/");
    }
  }, [user, userLoading, router]);

  const isCompany = !!user && isCompanyRegType(user);

  const advertAvail = useQuery({
    queryKey: Q_ADV_AVAIL,
    queryFn: getAvailableAdvertSlots,
    staleTime: 60 * 1000,
  });

  const brandAvail = useQuery({
    queryKey: Q_BRAND_AVAIL,
    queryFn: getAvailableBrandingSlots,
    staleTime: 60 * 1000,
  });

  const advertMine = useQuery({
    queryKey: Q_ADV_ME,
    queryFn: getMyAdvertSlots,
    enabled: !userLoading && isCompany,
    staleTime: 60 * 1000,
  });

  const brandMine = useQuery({
    queryKey: Q_BRAND_ME,
    queryFn: getMyBrandingSlots,
    enabled: !userLoading && isCompany,
    staleTime: 60 * 1000,
  });

  const totalSpentKobo = useMemo(() => {
    const a = advertMine.data ?? [];
    const b = brandMine.data ?? [];
    return [...a, ...b].reduce((s, r) => s + (typeof r.price === "number" ? r.price : 0), 0);
  }, [advertMine.data, brandMine.data]);

  const payAdvert = useMutation({
    mutationFn: initializeAdvertSlotPayment,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: Q_ADV_AVAIL });
      void queryClient.invalidateQueries({ queryKey: Q_ADV_ME });
      window.location.href = data.authorizationUrl;
    },
    onSettled: () => {
      setPayingId(null);
      setPayKind(null);
    },
  });

  const payBrand = useMutation({
    mutationFn: initializeBrandingSlotPayment,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: Q_BRAND_AVAIL });
      void queryClient.invalidateQueries({ queryKey: Q_BRAND_ME });
      window.location.href = data.authorizationUrl;
    },
    onSettled: () => {
      setPayingId(null);
      setPayKind(null);
    },
  });

  const companyName = getCompanyNameFromAuthUser(user ?? undefined);

  const payError =
    payAdvert.error instanceof ApiError
      ? (payAdvert.error.body?.message as string) || payAdvert.error.message
      : payBrand.error instanceof ApiError
        ? (payBrand.error.body?.message as string) || payBrand.error.message
        : payAdvert.error instanceof Error
          ? payAdvert.error.message
          : payBrand.error instanceof Error
            ? payBrand.error.message
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

  const handlePayAdvert = (id: string) => {
    setPayingId(id);
    setPayKind("advert");
    payAdvert.mutate({ advertSlotId: id });
  };

  const handlePayBrand = (id: string) => {
    setPayingId(id);
    setPayKind("branding");
    payBrand.mutate({ brandingSlotId: id });
  };

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-8 border-l-4 border-secondary pl-4">
        <h1 className="text-2xl font-black text-[#181112]">Marketing</h1>
        <p className="text-sm text-slate-600 mt-2">
          Book advert and branding placements for {companyName || "your company"}. Browse available slots below and pay
          online to confirm your purchase.
        </p>
      </div>

      {isCompany && (
        <div className="mb-8 rounded-xl border border-secondary/20 border-l-4 border-l-secondary bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Your marketing spend</p>
          <p className="text-2xl font-black text-primary mt-1">{formatKoboToNaira(totalSpentKobo)}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total price of your confirmed advert and branding slots.
          </p>
        </div>
      )}

      {payError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{payError}</div>
      )}

      <div className="flex flex-col gap-12">
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#181112] flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">ads_click</span>
              Advert slots
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Paid advertising placements you can book for the conference.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Your advert slots</h3>
            {advertMine.isError && (
              <p className="text-sm text-red-600 mb-2">
                {advertMine.error instanceof Error ? advertMine.error.message : "Could not load your slots."}
              </p>
            )}
            {advertMine.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="size-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
                Loading…
              </div>
            ) : (
              <MySlotsTable
                rows={advertMine.data ?? []}
                emptyLabel="No advert slots purchased yet. Book from the catalog below."
              />
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Available advert slots</h3>
            {advertAvail.isError && (
              <p className="text-sm text-red-600 mb-2">
                {advertAvail.error instanceof Error ? advertAvail.error.message : "Could not load catalog."}
              </p>
            )}
            {advertAvail.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-600 py-8">
                <div className="size-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
                Loading catalog…
              </div>
            ) : (advertAvail.data ?? []).length === 0 ? (
              <p className="text-sm text-slate-600 py-6">No advert slots available right now.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {(advertAvail.data ?? []).map((slot) => (
                  <CatalogCard
                    key={slot.id}
                    slot={slot}
                    paying={payingId === slot.id && payKind === "advert"}
                    onPay={() => handlePayAdvert(slot.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6 border-t border-secondary/20 pt-12">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-[#181112]">
              <span className="material-symbols-outlined text-secondary">palette</span>
              Branding slots
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Venue and conference branding visibility (banners, signage, sponsored areas).
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Your branding slots</h3>
            {brandMine.isError && (
              <p className="text-sm text-red-600 mb-2">
                {brandMine.error instanceof Error ? brandMine.error.message : "Could not load your slots."}
              </p>
            )}
            {brandMine.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="size-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
                Loading…
              </div>
            ) : (
              <MySlotsTable
                rows={brandMine.data ?? []}
                emptyLabel="No branding slots purchased yet. Book from the catalog below."
              />
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
              Available branding slots
            </h3>
            {brandAvail.isError && (
              <p className="text-sm text-red-600 mb-2">
                {brandAvail.error instanceof Error ? brandAvail.error.message : "Could not load catalog."}
              </p>
            )}
            {brandAvail.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-600 py-8">
                <div className="size-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
                Loading catalog…
              </div>
            ) : (brandAvail.data ?? []).length === 0 ? (
              <p className="text-sm text-slate-600 py-6">No branding slots available right now.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {(brandAvail.data ?? []).map((slot) => (
                  <CatalogCard
                    key={slot.id}
                    slot={slot}
                    paying={payingId === slot.id && payKind === "branding"}
                    onPay={() => handlePayBrand(slot.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
