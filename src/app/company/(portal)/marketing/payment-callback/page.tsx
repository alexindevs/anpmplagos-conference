"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyPayment, formatKoboToNaira, type Payment } from "@/lib/api";

const MARKETING_KINDS = new Set(["advert_slot", "branding_slot"]);

/**
 * Paystack return URL for advert / branding slot payments.
 * Configure backend: `/company/marketing/payment-callback?reference=...` (legacy URL; shop lives under `/company/sponsorship-plans`.)
 */
function CompanyMarketingPaymentCallbackContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const { data: result, isError, error, isPending, isFetching } = useQuery({
    queryKey: ["payment", "verify", "marketing", reference],
    queryFn: () => verifyPayment(reference!),
    enabled: !!reference,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const payment: Payment | undefined = result?.payment;

  useEffect(() => {
    if (!payment || !MARKETING_KINDS.has(payment.kind)) return;
    if (payment.status === "success") {
      void queryClient.invalidateQueries({ queryKey: ["advert-slots"] });
      void queryClient.invalidateQueries({ queryKey: ["branding-slots"] });
    }
  }, [payment, queryClient]);

  const verifying = !!reference && (isPending || isFetching);

  if (!reference) {
    return (
      <main className="flex flex-1 justify-center items-center py-16 px-4">
        <div className=" w-full max-w-[80%] md:max-w-[50%] text-center">
          <span className="material-symbols-outlined text-6xl text-red-600 mb-4">error</span>
          <h1 className="text-3xl font-black text-[#181112] mb-4">Invalid payment link</h1>
          <p className="text-gray-600 mb-6">This link is missing a payment reference.</p>
          <Link
            href="/company/sponsorship-plans?tab=adverts"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
          >
            Back to Marketing
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
          <p className="text-gray-600">Please wait while we confirm your marketing purchase…</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex flex-1 justify-center items-center py-16 px-4">
        <div className=" w-full max-w-[80%] md:max-w-[50%] text-center">
          <span className="material-symbols-outlined text-6xl text-red-600 mb-4">error</span>
          <h1 className="text-3xl font-black text-[#181112] mb-4">Verification failed</h1>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : "We couldn't confirm your payment."}
          </p>
          <Link
            href="/company/sponsorship-plans?tab=adverts"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
          >
            Back to Marketing
          </Link>
        </div>
      </main>
    );
  }

  const isSuccess = payment?.status === "success";
  const isFailed = payment?.status === "failed";
  const isRefunded = payment?.status === "refunded";
  const isMarketing = payment && MARKETING_KINDS.has(payment.kind);

  const successBlurb = () => {
    if (!isSuccess || !payment) return "";
    if (payment.kind === "advert_slot")
      return "Your payment was received. Your advert will appear under “Your advert slots” shortly.";
    if (payment.kind === "branding_slot")
      return "Your payment was received. Your branding placement will appear under “Your branding slots” shortly.";
    return "Your payment was processed successfully.";
  };

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
            {isSuccess && successBlurb()}
            {isFailed && "Your payment could not be completed. You can try again from Marketing."}
            {isRefunded && "This payment was refunded."}
            {!isSuccess && !isFailed && !isRefunded && "Your payment is still processing. Check back in a moment."}
          </p>

          {payment && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Reference</p>
                  <p className="text-sm font-mono text-[#181112] break-all">{payment.reference}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    isSuccess
                      ? "bg-green-100 text-green-700"
                      : isFailed
                        ? "bg-red-100 text-red-700"
                        : isRefunded
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {payment.status}
                </span>
              </div>

              {payment.kind && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Payment type</p>
                  <p className="text-sm text-[#181112] capitalize">{payment.kind.replace(/_/g, " ")}</p>
                </div>
              )}

              {payment.advertSlotId && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Advert slot</p>
                  <p className="text-sm font-mono text-[#181112] break-all">{payment.advertSlotId}</p>
                </div>
              )}

              {payment.brandingSlotId && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Branding slot</p>
                  <p className="text-sm font-mono text-[#181112] break-all">{payment.brandingSlotId}</p>
                </div>
              )}

              {payment.baseAmount != null && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Amount</p>
                  <p className="text-2xl font-black text-primary">{formatKoboToNaira(payment.baseAmount)}</p>
                </div>
              )}

              {payment.paidAt && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Paid at</p>
                  <p className="text-sm text-[#181112]">
                    {new Date(payment.paidAt).toLocaleString("en-NG", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isMarketing && payment && (
            <p className="text-center text-sm text-amber-800 mb-4">
              This reference is not an advert or branding slot payment. Use the correct portal section.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {isSuccess && (
              <Link
                href="/company/sponsorship-plans?tab=adverts"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
              >
                <span className="material-symbols-outlined">campaign</span>
                Back to Marketing
              </Link>
            )}
            {(isFailed || isRefunded) && (
              <>
                <Link
                  href="/company/sponsorship-plans?tab=adverts"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
                >
                  Try again
                </Link>
                <Link href="/" className="text-center text-sm text-gray-600 hover:text-primary transition-colors">
                  Return to home
                </Link>
              </>
            )}
            {!isSuccess && !isFailed && !isRefunded && (
              <>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
                >
                  Check status again
                </button>
                <Link href="/company/sponsorship-plans?tab=adverts" className="text-center text-sm text-gray-600 hover:text-primary">
                  Marketing
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function MarketingPaymentCallbackFallback() {
  return (
    <main className="flex flex-1 justify-center items-center py-16 px-4">
      <div className=" w-full max-w-[80%] md:max-w-[50%] text-center">
        <div className="mb-6 flex justify-center">
          <div className="size-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
        <h1 className="text-3xl font-black text-[#181112] mb-4">Loading</h1>
        <p className="text-gray-600">Confirming your payment…</p>
      </div>
    </main>
  );
}

export default function CompanyMarketingPaymentCallbackPage() {
  return (
    <Suspense fallback={<MarketingPaymentCallbackFallback />}>
      <CompanyMarketingPaymentCallbackContent />
    </Suspense>
  );
}
