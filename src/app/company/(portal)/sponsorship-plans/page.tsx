"use client";

import { Suspense } from "react";
import { ShopPageClient, ShopShellLoading } from "./ShopPageClient";

export default function CompanySponsorshipShopPage() {
  return (
    <Suspense fallback={<ShopShellLoading />}>
      <ShopPageClient />
    </Suspense>
  );
}
