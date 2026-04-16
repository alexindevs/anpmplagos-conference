"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useCheckoutConferenceCart, useConferenceCart, useRemoveConferenceCartItem } from "@/hooks/use-conference-cart";
import { ApiError, formatKoboToNaira, parseKoboField, type CartItem } from "@/lib/api";
import { getCompanyNameFromAuthUser, isCompanyRegType } from "@/lib/auth-api";
import { boothPrimaryName } from "@/lib/booth-display";

function lineTitle(item: CartItem): string {
  const t = item.type;
  if (t === "booth" && item.booth) return boothPrimaryName(item.booth) || item.booth.code || "Booth";
  if (t === "booth") return "Booth";
  if (t === "sponsorship_plan" && item.sponsorshipPlan) return item.sponsorshipPlan.name;
  if (t === "sponsorship_plan") return "Sponsorship plan";
  if (t === "masterclass" && item.masterclass) return item.masterclass.title;
  if (t === "presentation" && item.presentation) return item.presentation.title;
  if (t === "advert_slot" && item.advertSlot) return item.advertSlot.title;
  if (t === "branding_slot" && item.brandingSlot) return item.brandingSlot.title;
  if (t === "masterclass") return "Masterclass";
  if (t === "presentation") return "Presentation";
  if (t === "advert_slot") return "Advert slot";
  if (t === "branding_slot") return "Branding slot";
  return t.replace(/_/g, " ");
}

function lineAmountKobo(item: CartItem): number | null {
  const line = parseKoboField(item.lineTotalKobo);
  if (line > 0) return line;
  const unit = parseKoboField(item.unitPriceInKobo);
  if (unit > 0) return unit * (item.quantity || 1);
  const unitBase = parseKoboField(item.unitBaseAmountKobo);
  if (unitBase > 0) return unitBase * (item.quantity || 1);
  const nested =
    item.booth?.price ??
    item.sponsorshipPlan?.priceInKobo ??
    item.masterclass?.priceInKobo ??
    item.presentation?.priceInKobo ??
    item.advertSlot?.price ??
    item.brandingSlot?.price;
  const nestedK = parseKoboField(nested);
  if (nestedK > 0) return nestedK * (item.quantity || 1);
  return null;
}

export default function CompanyCartPage() {
  const router = useRouter();
  const { data: user, isPending: userLoading } = useAuthSession();
  const cartQuery = useConferenceCart(!!user && isCompanyRegType(user ?? undefined));
  const removeMutation = useRemoveConferenceCartItem();
  const checkoutMutation = useCheckoutConferenceCart();
  const companyName = getCompanyNameFromAuthUser(user ?? undefined);

  useEffect(() => {
    if (!userLoading && (!user || !isCompanyRegType(user))) {
      router.push("/");
    }
  }, [user, userLoading, router]);

  const items = cartQuery.data?.items ?? [];
  const totalKobo = items.reduce((sum, it) => {
    const line = lineAmountKobo(it);
    return sum + (line ?? 0);
  }, 0);
  const hasUnknownPrices = items.some((it) => lineAmountKobo(it) == null);

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
          <div className="size-8 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
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
          <h1 className="text-2xl font-black text-[#181112]">Conference cart</h1>
          <p className="text-sm text-slate-600 mt-1">
            Review items for {companyName || "your company"}, then pay once. Prices are finalized at checkout.
          </p>
        </div>
        <Link
          href="/company/sponsorship-plans"
          className="text-sm font-bold text-secondary hover:underline shrink-0"
        >
          Continue shopping
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
          <span className="size-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
          Loading cart…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-secondary/20 bg-white p-10 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300">shopping_cart</span>
          <p className="mt-4 font-bold text-[#181112]">Your cart is empty</p>
          <p className="text-sm text-slate-600 mt-2">Add booths, sponsorship plans, sessions, or marketing slots from the shop.</p>
          <Link
            href="/company/sponsorship-plans"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-red-700"
          >
            Go to shop
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-secondary/20 bg-white shadow-sm overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {items.map((item) => {
                const amount = lineAmountKobo(item);
                return (
                  <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.type.replace(/_/g, " ")}</p>
                      <p className="font-bold text-[#181112] truncate">{lineTitle(item)}</p>
                      {item.quantity > 1 ? (
                        <p className="text-xs text-slate-500 mt-1">Qty {item.quantity}</p>
                      ) : null}
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
                <p className="text-xl font-black text-[#181112] tabular-nums">
                  {hasUnknownPrices && totalKobo === 0 ? "—" : formatKoboToNaira(totalKobo)}
                </p>
                {hasUnknownPrices ? (
                  <p className="text-xs text-slate-500 mt-1">Some lines omit price in the cart payload; Paystack will show the final amount.</p>
                ) : null}
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
