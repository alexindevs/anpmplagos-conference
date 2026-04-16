"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** Legacy URL: Paystack may still redirect here. Canonical handler is `/company/order/payment-callback`. */
function RedirectToOrderCallback() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const qs = searchParams.toString();
    window.location.replace(`/company/order/payment-callback${qs ? `?${qs}` : ""}`);
  }, [searchParams]);
  return (
    <main className="flex-1 px-4 py-16 flex flex-col items-center justify-center gap-3">
      <div className="size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      <p className="text-sm text-slate-600">Redirecting…</p>
    </main>
  );
}

export default function HotelOrderPaymentCallbackRedirectPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 px-4 py-16 flex justify-center">
          <div className="size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </main>
      }
    >
      <RedirectToOrderCallback />
    </Suspense>
  );
}
