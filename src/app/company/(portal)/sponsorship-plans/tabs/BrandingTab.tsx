"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MarketingCatalogCard, MarketingMySlotsTable } from "@/app/company/components/MarketingSlotCatalog";
import { useAuthSession } from "@/hooks/use-auth-session";
import { conferenceCartQueryKey, useAddConferenceCartItem } from "@/hooks/use-conference-cart";
import { getCompanyNameFromAuthUser, isCompanyRegType } from "@/lib/auth-api";
import { ApiError, formatKoboToNaira, getAvailableBrandingSlots, getMyBrandingSlots } from "@/lib/api";
import { useClientPagination } from "@/hooks/use-shop-client-pagination";

const Q_BRAND_AVAIL = ["branding-slots", "available"] as const;
const Q_BRAND_ME = ["branding-slots", "me"] as const;

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

export function BrandingTab() {
  const queryClient = useQueryClient();
  const { data: user, isPending: userLoading } = useAuthSession();
  const [addingId, setAddingId] = useState<string | null>(null);
  const isCompany = !!user && isCompanyRegType(user);
  const companyName = getCompanyNameFromAuthUser(user ?? undefined);
  const addCartMutation = useAddConferenceCartItem();

  const brandAvail = useQuery({
    queryKey: Q_BRAND_AVAIL,
    queryFn: getAvailableBrandingSlots,
    staleTime: 60 * 1000,
  });

  const brandMine = useQuery({
    queryKey: Q_BRAND_ME,
    queryFn: getMyBrandingSlots,
    enabled: !userLoading && isCompany,
    staleTime: 60 * 1000,
  });

  const catalog = brandAvail.data ?? [];
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
      { type: "branding_slot", brandingSlotId: id },
      {
        onSettled: () => setAddingId(null),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: Q_BRAND_AVAIL });
          void queryClient.invalidateQueries({ queryKey: Q_BRAND_ME });
          void queryClient.invalidateQueries({ queryKey: conferenceCartQueryKey });
        },
      }
    );
  };

  const totalSpentKobo = useMemo(() => {
    return (brandMine.data ?? []).reduce((s, r) => s + (typeof r.price === "number" ? r.price : 0), 0);
  }, [brandMine.data]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-black text-charcoal">
          <span className="material-symbols-outlined text-secondary">palette</span>
          Branding slots
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Venue and conference branding for {companyName || "your company"}. Add to your{" "}
          <Link href="/company/cart" className="font-bold text-secondary hover:underline">
            conference cart
          </Link>
          .
        </p>
      </div>

      {isCompany && (
        <div className="rounded-xl border border-secondary/20 border-l-4 border-l-secondary bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Your confirmed branding spend</p>
          <p className="text-2xl font-black text-primary mt-1">{formatKoboToNaira(totalSpentKobo)}</p>
        </div>
      )}

      {cartError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{cartError}</div>
      )}

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
          <MarketingMySlotsTable
            rows={brandMine.data ?? []}
            emptyLabel="No branding slots purchased yet. Add from the catalog below."
          />
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Available Hall Branding Slots</h3>
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
        ) : catalog.length === 0 ? (
          <p className="text-sm text-slate-600 py-6">No branding slots available right now.</p>
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
