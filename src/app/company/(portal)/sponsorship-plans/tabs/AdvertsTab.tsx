"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MarketingCatalogCard, MarketingMySlotsTable } from "@/app/company/components/MarketingSlotCatalog";
import { useAuthSession } from "@/hooks/use-auth-session";
import { conferenceCartQueryKey, useAddConferenceCartItem } from "@/hooks/use-conference-cart";
import { getCompanyNameFromAuthUser, isCompanyRegType } from "@/lib/auth-api";
import { ApiError, formatKoboToNaira, getAvailableAdvertSlots, getMyAdvertSlots } from "@/lib/api";
import { useClientPagination } from "@/hooks/use-shop-client-pagination";

const Q_ADV_AVAIL = ["advert-slots", "available"] as const;
const Q_ADV_ME = ["advert-slots", "me"] as const;

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
    <div className="flex items-center justify-center gap-3 pt-6">
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

export function AdvertsTab() {
  const queryClient = useQueryClient();
  const { data: user, isPending: userLoading } = useAuthSession();
  const [addingId, setAddingId] = useState<string | null>(null);
  const isCompany = !!user && isCompanyRegType(user);
  const companyName = getCompanyNameFromAuthUser(user ?? undefined);
  const addCartMutation = useAddConferenceCartItem();

  const advertAvail = useQuery({
    queryKey: Q_ADV_AVAIL,
    queryFn: getAvailableAdvertSlots,
    staleTime: 60 * 1000,
  });

  const advertMine = useQuery({
    queryKey: Q_ADV_ME,
    queryFn: getMyAdvertSlots,
    enabled: !userLoading && isCompany,
    staleTime: 60 * 1000,
  });

  const catalog = advertAvail.data ?? [];
  const { page, setPage, totalPages, pageItems } = useClientPagination(catalog);

  const cartError =
    addCartMutation.error instanceof ApiError
      ? (addCartMutation.error.body?.message as string) || addCartMutation.error.message
      : addCartMutation.error instanceof Error
        ? addCartMutation.error.message
        : null;

  const handleAdd = (id: string) => {
    setAddingId(id);
    addCartMutation.mutate(
      { type: "advert_slot", advertSlotId: id },
      {
        onSettled: () => setAddingId(null),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: Q_ADV_AVAIL });
          void queryClient.invalidateQueries({ queryKey: Q_ADV_ME });
          void queryClient.invalidateQueries({ queryKey: conferenceCartQueryKey });
        },
      }
    );
  };

  const totalSpentKobo = useMemo(() => {
    return (advertMine.data ?? []).reduce((s, r) => s + (typeof r.price === "number" ? r.price : 0), 0);
  }, [advertMine.data]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-[#181112] flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">ads_click</span>
          Advert slots
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Paid placements for {companyName || "your company"}. Add catalog items to your{" "}
          <Link href="/company/cart" className="font-bold text-secondary hover:underline">
            conference cart
          </Link>
          .
        </p>
      </div>

      {isCompany && (
        <div className="rounded-xl border border-secondary/20 border-l-4 border-l-secondary bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Your confirmed advert spend</p>
          <p className="text-2xl font-black text-primary mt-1">{formatKoboToNaira(totalSpentKobo)}</p>
        </div>
      )}

      {cartError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{cartError}</div>
      )}

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
          <MarketingMySlotsTable
            rows={advertMine.data ?? []}
            emptyLabel="No advert slots purchased yet. Add from the catalog below."
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
        ) : catalog.length === 0 ? (
          <p className="text-sm text-slate-600 py-6">No advert slots available right now.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((slot) => (
                <MarketingCatalogCard
                  key={slot.id}
                  slot={slot}
                  busy={addingId === slot.id && addCartMutation.isPending}
                  onAddToCart={() => handleAdd(slot.id)}
                />
              ))}
            </div>
            <PaginationBar page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
