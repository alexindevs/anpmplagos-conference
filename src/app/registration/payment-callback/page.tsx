"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { verifyRegistrationPayment } from "@/lib/api";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");
  const effectiveRef = reference || trxref;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["registration", "payment-verify", effectiveRef],
    queryFn: () => verifyRegistrationPayment(effectiveRef!),
    enabled: !!effectiveRef,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const payment = data?.payment;
  const isSuccess = payment?.status === "success";
  const isFailed = payment?.status === "failed";
  const isRefunded = payment?.status === "refunded";

  if (!effectiveRef) {
    return (
      <main className="flex flex-1 justify-center items-center py-16 px-4">
        <div className=" w-full max-w-[80%] md:max-w-[50%] text-center">
          <span className="material-symbols-outlined text-6xl text-red-600 mb-4">error</span>
          <h1 className="text-3xl font-black text-[#181112] mb-4">Invalid Payment Link</h1>
          <p className="text-gray-600 mb-6">
            This payment link appears to be invalid or incomplete.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex flex-1 justify-center items-center py-16 px-4">
        <div className=" w-full max-w-[80%] md:max-w-[50%] text-center">
          <div className="mb-6 flex justify-center">
            <div className="size-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
          <h1 className="text-3xl font-black text-[#181112] mb-4">Confirming payment</h1>
          <p className="text-gray-600">
            Please wait while we confirm your payment…
          </p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex flex-1 justify-center items-center py-16 px-4">
        <div className=" w-full max-w-[80%] md:max-w-[50%] text-center">
          <span className="material-symbols-outlined text-6xl text-red-600 mb-4">error</span>
          <h1 className="text-3xl font-black text-[#181112] mb-4">Verification Failed</h1>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : "We couldn't confirm your payment. Please contact support if this issue persists."}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/member/tickets"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
            >
              Check Ticket Status
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 justify-center py-16 px-4">
      <div className="w-full max-w-[80%] md:max-w-[50%]">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Status icon */}
          <div className="flex justify-center mb-6">
            {isSuccess && (
              <div className="size-20 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-green-600">
                  check_circle
                </span>
              </div>
            )}
            {isFailed && (
              <div className="size-20 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-red-600">
                  cancel
                </span>
              </div>
            )}
            {isRefunded && (
              <div className="size-20 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-amber-600">
                  sync
                </span>
              </div>
            )}
            {!isSuccess && !isFailed && !isRefunded && (
              <div className="size-20 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-gray-600">
                  schedule
                </span>
              </div>
            )}
          </div>

          {/* Status heading */}
          <h1 className="text-3xl font-black text-center text-[#181112] mb-3">
            {isSuccess && "Payment Successful!"}
            {isFailed && "Payment Failed"}
            {isRefunded && "Payment Refunded"}
            {!isSuccess && !isFailed && !isRefunded && "Payment Pending"}
          </h1>

          {/* Status message */}
          <p className="text-center text-gray-600 mb-8">
            {isSuccess && "Your registration is now confirmed. You can now access your conference ticket."}
            {isFailed && "Your payment could not be completed. Please try again or contact support."}
            {isRefunded && "Your payment has been refunded."}
            {!isSuccess && !isFailed && !isRefunded && "Your payment is still being processed. This may take a few moments."}
          </p>

          {/* Payment details */}
          {payment && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">Reference</p>
                  <p className="text-xs font-mono text-[#181112] break-all">{payment.reference}</p>
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
                  <p className="text-xs font-semibold text-gray-500 uppercase">Payment Type</p>
                  <p className="text-sm text-[#181112] capitalize">{payment.kind.replace("_", " ")}</p>
                </div>
              )}

              {payment.paidAt && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Paid At</p>
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

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {isSuccess && (
              <Link
                href="/member/tickets"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
              >
                <span className="material-symbols-outlined">confirmation_number</span>
                View My Ticket
              </Link>
            )}
            {(isFailed || isRefunded) && (
              <>
                <Link
                  href="/member/tickets"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
                >
                  <span className="material-symbols-outlined">refresh</span>
                  Try Again
                </Link>
                <Link
                  href="/"
                  className="text-center text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Return to Home
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
                  <span className="material-symbols-outlined">refresh</span>
                  Check Status Again
                </button>
                <Link
                  href="/"
                  className="text-center text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Return to Home
                </Link>
              </>
            )}
          </div>

          {/* Support note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Need help?</span> If you have any questions about this payment,
              please contact support with reference: <span className="font-mono">{payment?.reference}</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function PaymentCallbackFallback() {
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

export default function RegistrationPaymentCallbackPage() {
  return (
    <Suspense fallback={<PaymentCallbackFallback />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
