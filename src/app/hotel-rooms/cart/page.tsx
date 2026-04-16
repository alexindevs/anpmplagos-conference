"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useCheckoutHotelCart, useHotelCart, useRemoveHotelCartItem } from "@/hooks/use-hotel-cart";
import { ApiError, formatKoboToNaira, parseKoboField, type CartItem } from "@/lib/api";

function lineTitle(item: CartItem): string {
  if (item.type === "hotel_room" && item.hotelRoom) {
    const r = item.hotelRoom;
    return `${r.hotelName || "Hotel"} — ${r.roomType}`;
  }
  if (item.type === "hotel_room") return "Hotel room";
  return item.type.replace(/_/g, " ");
}

function lineAmountKobo(item: CartItem): number | null {
  const line = parseKoboField(item.lineTotalKobo);
  if (line > 0) return line;
  const unit = parseKoboField(item.unitPriceInKobo);
  if (unit > 0) return unit * (item.quantity || 1);
  const unitBase = parseKoboField(item.unitBaseAmountKobo);
  if (unitBase > 0) return unitBase * (item.quantity || 1);
  const p = parseKoboField(item.hotelRoom?.price);
  if (p > 0) return p * (item.quantity || 1);
  return null;
}

export default function HotelCartPage() {
  const router = useRouter();
  const { data: user, isPending: userLoading } = useAuthSession();
  const cartQuery = useHotelCart(!!user);
  const removeMutation = useRemoveHotelCartItem();
  const checkoutMutation = useCheckoutHotelCart();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  const items = cartQuery.data?.items ?? [];
  const totalKobo = items.reduce((sum, it) => sum + (lineAmountKobo(it) ?? 0), 0);

  const handleCheckout = () => {
    checkoutMutation.mutate(undefined, {
      onSuccess: (res) => {
        window.location.href = res.authorizationUrl;
      },
    });
  };

  if (userLoading || !user) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          Loading…
        </div>
      </div>
    );
  }

  const checkoutErr =
    checkoutMutation.error instanceof ApiError
      ? checkoutMutation.error.message
      : checkoutMutation.error
        ? "Checkout could not be started."
        : null;

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#181112]">Hotel cart</h1>
          <p className="text-sm text-slate-600 mt-1">
            Review room lines, then pay once. Totals are finalized at checkout.
          </p>
        </div>
        <Link href="/hotel-rooms" className="text-sm font-bold text-primary hover:underline shrink-0">
          Browse rooms
        </Link>
      </div>

      {cartQuery.isError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {cartQuery.error instanceof Error ? cartQuery.error.message : "Could not load cart."}
        </div>
      )}

      {checkoutErr && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {checkoutErr}
        </div>
      )}

      {cartQuery.isPending ? (
        <div className="flex items-center gap-2 text-slate-600 text-sm py-12">
          <span className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          Loading cart…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/25 bg-white p-10 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300">shopping_cart</span>
          <p className="mt-4 font-bold text-[#181112]">Your hotel cart is empty</p>
          <p className="text-sm text-slate-600 mt-2">Add rooms from the hotel directory, then return here to checkout.</p>
          <Link
            href="/hotel-rooms"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-red-700"
          >
            Hotel rooms
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-primary/15 bg-white shadow-sm overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {items.map((item) => {
                const amount = lineAmountKobo(item);
                return (
                  <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Hotel room</p>
                      <p className="font-bold text-[#181112] truncate">{lineTitle(item)}</p>
                      {item.quantity > 1 ? <p className="text-xs text-slate-500 mt-1">Qty {item.quantity}</p> : null}
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-sm font-black text-primary tabular-nums">
                        {amount != null ? formatKoboToNaira(amount) : "—"}
                      </span>
                      <button
                        type="button"
                        disabled={removeMutation.isPending}
                        onClick={() => removeMutation.mutate(item.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Estimated total</p>
                <p className="text-xl font-black text-[#181112] tabular-nums">{formatKoboToNaira(totalKobo)}</p>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending || removeMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Starting checkout…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                    Checkout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
