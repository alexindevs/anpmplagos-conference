"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useConferenceCart } from "@/hooks/use-conference-cart";
import { isCompanyRegType } from "@/lib/auth-api";
import { SHOP_TAB_IDS, parseShopTab, type ShopTabId } from "./shop-tab-ids";
import { AdvertsTab } from "./tabs/AdvertsTab";
import { BrandingTab } from "./tabs/BrandingTab";
import { BundlesTab } from "./tabs/BundlesTab";
import { CompanyBoothSelection } from "@/app/company/components/CompanyBoothSelection";
import { MasterclassesTab } from "./tabs/MasterclassesTab";
import { PresentationsTab } from "./tabs/PresentationsTab";

const TAB_LABELS: Record<ShopTabId, string> = {
  bundles: "Sponsorship bundles",
  booths: "Booths",
  adverts: "Adverts",
  branding: "Branding",
  masterclasses: "Masterclasses",
  presentations: "Presentations",
};

export function ShopShellLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-600">
        <div className="size-8 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
        <span>Loading…</span>
      </div>
    </div>
  );
}

export function ShopPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const { data: user, isPending: userLoading } = useAuthSession();
  const cartQuery = useConferenceCart(mounted && !!user && isCompanyRegType(user ?? undefined));

  const tab = useMemo(() => parseShopTab(searchParams.get("tab")), [searchParams]);

  const setTab = useCallback(
    (id: ShopTabId) => {
      router.replace(`/company/sponsorship-plans?tab=${id}`, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || userLoading) return;
    if (!user || !isCompanyRegType(user)) {
      router.push("/");
    }
  }, [mounted, user, userLoading, router]);

  const cartCount = cartQuery.data?.items?.length ?? 0;

  /** Wait for mount so server HTML matches first client paint (session/cache differs SSR vs client). */
  if (!mounted || userLoading || !user || !isCompanyRegType(user)) {
    return <ShopShellLoading />;
  }

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-l-4 border-secondary pl-4">
        <div>
          <h1 className="text-2xl font-black text-[#181112]">Sponsorship &amp; catalog</h1>
          <p className="text-sm text-slate-600 mt-2">
            Sponsorship bundles, booths, marketing slots, and sessions — add items to your cart and pay once.
          </p>
        </div>
        <Link
          href="/company/cart"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-secondary/30 bg-white px-4 py-2.5 text-sm font-bold text-secondary shadow-sm hover:bg-secondary/5"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
          Cart{cartCount > 0 ? ` (${cartCount})` : ""}
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Shop sections"
        className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4"
      >
        {SHOP_TAB_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            id={`shop-tab-${id}`}
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
              tab === id
                ? "bg-primary text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {TAB_LABELS[id]}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-labelledby={`shop-tab-${tab}`}>
        {tab === "bundles" && <BundlesTab />}
        {tab === "booths" && <CompanyBoothSelection />}
        {tab === "adverts" && <AdvertsTab />}
        {tab === "branding" && <BrandingTab />}
        {tab === "masterclasses" && <MasterclassesTab />}
        {tab === "presentations" && <PresentationsTab />}
      </div>
    </main>
  );
}
