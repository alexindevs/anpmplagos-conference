"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyPayment, formatKoboToNaira, type Payment } from "@/lib/api";

const SESSION_KINDS = new Set(["masterclass", "panel", "presentation"]);

function sessionSuccessMessage(kind: string | undefined): string {
  if (kind === "masterclass")
    return "Your payment was received. Your masterclass will appear under “Your bookings” on the Masterclasses page shortly.";
  if (kind === "panel")
    return "Your payment was received. Your panel session will appear under “Your bookings” on the Panel sessions page shortly.";
  if (kind === "presentation")
    return "Your payment was received. Your presentation will appear under “Your bookings” on the Presentations page shortly.";
  return "Your payment was processed successfully.";
}

function CompanySessionsPaymentCallbackContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const { data: result, isError, error, isPending, isFetching } = useQuery({
    queryKey: ["payment", "verify", "sessions", reference],
    queryFn: () => verifyPayment(reference!),
    enabled: !!reference,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const payment: Payment | undefined = result?.payment;

  useEffect(() => {
    if (!payment || !SESSION_KINDS.has(payment.kind)) return;
    if (payment.status === "success") {
      void queryClient.invalidateQueries({ queryKey: ["company", "session-slots"] });
    }
  }, [payment, queryClient]);

  const verifying = !!reference && (isPending || isFetching);

  if (!reference) {
    return (
      <main className="flex flex-1 justify-center items-center py-16 px-4">
        <div className=" w-full max-w-[80%] md:max-w-[50%] text-center">
          <span className="material-symbols-outlined text-6xl text-red-600 mb-4">error</span>
          <h1 className="text-3xl font-black text-[#181112] mb-4">Invalid payment link</h1>
          <p className="text-gray-600 mb-6">This link is missing payment details.</p>
          <Link
            href="/company/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (verifying) {
    return (
      <main className="flex flex-1 justify-center items-center py-16 px-4">
        <div className=" w-full max-w-[80%] md:max-w-[50%] text-center">
          <div className="mb-6 flex justify-center">
            <div className="size-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
          <h1 className="text-3xl font-black text-[#181112] mb-4">Confirming payment</h1>
          <p className="text-gray-600">Please wait while we confirm your booking…</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex flex-1 justify-center items-center py-16 px-4">
        <div className=" w-full max-w-[80%] md:max-w-[50%] text-center">
          <span className="material-symbols-outlined text-6xl text-red-600 mb-4">error</span>
          <h1 className="text-3xl font-black text-[#181112] mb-4">Could not confirm payment</h1>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : "Something went wrong. You can return to your portal and try again."}
          </p>
          <Link
            href="/company/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const isSuccess = payment?.status === "success";
  const isFailed = payment?.status === "failed";
  const isRefunded = payment?.status === "refunded";
  const isSession = payment && SESSION_KINDS.has(payment.kind);

  return (
    <main className="flex flex-1 justify-center py-16 px-4">
      <div className="w-full max-w-[80%] md:max-w-[50%]">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex justify-center mb-6">
            {isSuccess && (
              <div className="size-20 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
              </div>
            )}
            {isFailed && (
              <div className="size-20 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-red-600">cancel</span>
              </div>
            )}
            {isRefunded && (
              <div className="size-20 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-amber-600">sync</span>
              </div>
            )}
            {!isSuccess && !isFailed && !isRefunded && (
              <div className="size-20 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-gray-600">schedule</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl font-black text-center text-[#181112] mb-3">
            {isSuccess && "Payment successful"}
            {isFailed && "Payment failed"}
            {isRefunded && "Payment refunded"}
            {!isSuccess && !isFailed && !isRefunded && "Payment pending"}
          </h1>

          <p className="text-center text-gray-600 mb-8">
            {isSuccess && sessionSuccessMessage(payment?.kind)}
            {isFailed && "Your payment could not be completed. You can try again from the session page in your portal."}
            {isRefunded && "This payment was refunded."}
            {!isSuccess && !isFailed && !isRefunded && "Your payment is still processing. You can refresh this page in a moment."}
          </p>

          {payment && isSuccess && payment.baseAmount != null && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Amount</p>
              <p className="text-2xl font-black text-primary">{formatKoboToNaira(payment.baseAmount)}</p>
            </div>
          )}

          {!isSession && payment && (
            <p className="text-center text-sm text-amber-800 mb-4">
              This payment is not linked to a session slot. Open the correct section in your company portal if you were
              buying something else.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {isSuccess && (
              <>
                <Link
                  href="/company/sponsorship-plans?tab=masterclasses"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
                >
                  Masterclasses
                </Link>
                <Link
                  href="/company/sponsorship-plans?tab=presentations"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-6 py-3 text-[#181112] font-bold hover:bg-slate-50 transition-colors"
                >
                  Presentations
                </Link>
                <Link
                  href="/company/sponsorship-plans?tab=bundles"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-6 py-3 text-[#181112] font-bold hover:bg-slate-50 transition-colors"
                >
                  Sponsorship &amp; catalog
                </Link>
              </>
            )}
            {(isFailed || isRefunded) && (
              <Link
                href="/company/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Back to dashboard
              </Link>
            )}
            {!isSuccess && !isFailed && !isRefunded && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Check again
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Fallback() {
  return (
    <main className="flex flex-1 justify-center items-center py-16 px-4">
      <div className=" w-full max-w-[80%] md:max-w-[50%] text-center">
        <div className="mb-6 flex justify-center">
          <div className="size-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
        <h1 className="text-3xl font-black text-[#181112] mb-4">Loading</h1>
        <p className="text-gray-600">Preparing confirmation…</p>
      </div>
    </main>
  );
}

export default function CompanySessionsPaymentCallbackPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <CompanySessionsPaymentCallbackContent />
    </Suspense>
  );
}
