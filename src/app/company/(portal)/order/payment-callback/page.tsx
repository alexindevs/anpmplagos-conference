"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { conferenceCartQueryKey } from "@/hooks/use-conference-cart";
import { hotelCartQueryKey } from "@/hooks/use-hotel-cart";
import { useAuthSession } from "@/hooks/use-auth-session";
import { isCompanyRegType } from "@/lib/auth-api";
import { verifyPayment } from "@/lib/api";

function OrderPaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isPending: sessionLoading } = useAuthSession();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const cartHref = useMemo(() => {
    if (!user) return "/hotel-rooms/cart";
    return isCompanyRegType(user) ? "/company/cart" : "/hotel-rooms/cart";
  }, [user]);

  const [status, setStatus] = useState<"verifying" | "success" | "failed" | "error">("verifying");
  const [message, setMessage] = useState("Confirming your payment…");

  const verifyQuery = useQuery({
    queryKey: ["payment", "verify", "order", reference],
    queryFn: async () => {
      if (!reference) throw new Error("No reference provided");
      return verifyPayment(reference);
    },
    enabled: !!reference,
    retry: false,
  });

  useEffect(() => {
    if (!reference) {
      queueMicrotask(() => {
        setStatus("error");
        setMessage("No payment reference found.");
      });
      return;
    }

    if (verifyQuery.isError) {
      queueMicrotask(() => {
        setStatus("error");
        setMessage("Could not confirm payment. Please contact support if you were charged.");
      });
      return;
    }

    if (verifyQuery.data) {
      const payment = verifyQuery.data.payment;
      queueMicrotask(() => {
        if (payment.status === "success") {
          void queryClient.invalidateQueries({ queryKey: conferenceCartQueryKey });
          void queryClient.invalidateQueries({ queryKey: hotelCartQueryKey });
          void queryClient.invalidateQueries({ queryKey: ["hotel-rooms", "available"] });
          void queryClient.invalidateQueries({ queryKey: ["hotel-rooms", "me"] });
          setStatus("success");
          setMessage(
            payment.kind === "order"
              ? "Your order payment was confirmed. Your purchases and hotel bookings will show in your portal shortly."
              : "Your payment has been confirmed."
          );
        } else if (payment.status === "pending") {
          setStatus("verifying");
          setMessage("Payment is still processing. Please wait...");
        } else {
          setStatus("failed");
          setMessage("Payment was not successful. Please try again.");
        }
      });
    }
  }, [reference, verifyQuery.data, verifyQuery.isError, queryClient]);

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-[80%] md:max-w-[50%] rounded-xl border border-secondary/20 bg-white p-8 shadow-sm text-center">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-secondary/10">
              <div className="size-8 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
            </div>
            <h1 className="text-xl font-black text-charcoal mb-2">Confirming payment</h1>
            <p className="text-sm text-slate-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
            </div>
            <h1 className="text-xl font-black text-charcoal mb-2">Payment successful</h1>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
            <div className="flex flex-col gap-2">
              {!sessionLoading && user && isCompanyRegType(user) ? (
                <>
                  <button
                    type="button"
                    onClick={() => router.push("/company/dashboard")}
                    className="w-full rounded-lg bg-primary px-5 py-2.5 font-bold text-white hover:bg-red-700 transition-colors"
                  >
                    Go to dashboard
                  </button>
                  <Link
                    href="/company/sponsorship-plans"
                    className="w-full rounded-lg border border-secondary/20 bg-white px-5 py-2.5 font-bold text-slate-700 hover:bg-secondary/5 transition-colors inline-block text-center"
                  >
                    Back to shop
                  </Link>
                  <Link
                    href="/hotel-rooms"
                    className="w-full rounded-lg border border-secondary/20 bg-white px-5 py-2.5 font-bold text-slate-700 hover:bg-secondary/5 transition-colors inline-block text-center"
                  >
                    Hotel rooms
                  </Link>
                </>
              ) : !sessionLoading && user && user.regType === "member" ? (
                <>
                  <button
                    type="button"
                    onClick={() => router.push("/member/dashboard")}
                    className="w-full rounded-lg bg-primary px-5 py-2.5 font-bold text-white hover:bg-red-700 transition-colors"
                  >
                    Profile
                  </button>
                  <Link
                    href="/hotel-rooms"
                    className="w-full rounded-lg border border-secondary/20 bg-white px-5 py-2.5 font-bold text-slate-700 hover:bg-secondary/5 transition-colors inline-block text-center"
                  >
                    Hotel rooms
                  </Link>
                </>
              ) : !sessionLoading && user && user.regType === "attendee" ? (
                <>
                  <button
                    type="button"
                    onClick={() => router.push("/attendee/dashboard")}
                    className="w-full rounded-lg bg-primary px-5 py-2.5 font-bold text-white hover:bg-red-700 transition-colors"
                  >
                    Profile
                  </button>
                  <Link
                    href="/hotel-rooms"
                    className="w-full rounded-lg border border-secondary/20 bg-white px-5 py-2.5 font-bold text-slate-700 hover:bg-secondary/5 transition-colors inline-block text-center"
                  >
                    Hotel rooms
                  </Link>
                </>
              ) : !sessionLoading && user ? (
                <button
                  type="button"
                  onClick={() => router.push("/hotel-rooms")}
                  className="w-full rounded-lg bg-primary px-5 py-2.5 font-bold text-white hover:bg-red-700 transition-colors"
                >
                  Hotel rooms
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => router.push("/hotel-rooms")}
                    className="w-full rounded-lg bg-primary px-5 py-2.5 font-bold text-white hover:bg-red-700 transition-colors"
                  >
                    Hotel rooms
                  </button>
                  <Link
                    href="/login"
                    className="w-full rounded-lg border border-secondary/20 bg-white px-5 py-2.5 font-bold text-slate-700 hover:bg-secondary/5 transition-colors inline-block text-center"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-50">
              <span className="material-symbols-outlined text-3xl text-red-600">cancel</span>
            </div>
            <h1 className="text-xl font-black text-charcoal mb-2">Payment not completed</h1>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
            <div className="flex flex-col gap-2">
              <Link
                href={cartHref}
                className="w-full rounded-lg bg-primary px-5 py-2.5 font-bold text-white hover:bg-red-700 transition-colors text-center"
              >
                Return to cart
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-50">
              <span className="material-symbols-outlined text-3xl text-amber-600">error</span>
            </div>
            <h1 className="text-xl font-black text-charcoal mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
            <Link
              href={cartHref}
              className="inline-block w-full rounded-lg border border-secondary/20 px-5 py-2.5 font-bold text-slate-700 hover:bg-secondary/5"
            >
              Cart
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function CompanyOrderPaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 px-4 py-16 flex justify-center">
          <div className="size-10 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
        </main>
      }
    >
      <OrderPaymentCallbackContent />
    </Suspense>
  );
}
