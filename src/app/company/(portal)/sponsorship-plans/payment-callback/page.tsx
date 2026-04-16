"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { verifyPayment } from "@/lib/api";

function SponsorshipPaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState<"verifying" | "success" | "failed" | "error">("verifying");
  const [message, setMessage] = useState("Confirming your payment…");

  const verifyQuery = useQuery({
    queryKey: ["payment", "verify", reference],
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
          setStatus("success");
          setMessage(`Your ${payment.kind === "sponsorship_plan" ? "sponsorship plan" : "payment"} has been confirmed!`);
        } else if (payment.status === "pending") {
          setStatus("verifying");
          setMessage("Payment is still processing. Please wait...");
        } else {
          setStatus("failed");
          setMessage("Payment was not successful. Please try again.");
        }
      });
    }
  }, [reference, verifyQuery.data, verifyQuery.isError]);

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-[80%] md:max-w-[50%] rounded-xl border border-secondary/20 bg-white p-8 shadow-sm text-center">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-secondary/10">
              <div className="size-8 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
            </div>
            <h1 className="text-xl font-black text-[#181112] mb-2">Confirming payment</h1>
            <p className="text-sm text-slate-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
            </div>
            <h1 className="text-xl font-black text-[#181112] mb-2">Payment Successful!</h1>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => router.push("/company/dashboard")}
                className="w-full rounded-lg bg-primary px-5 py-2.5 font-bold text-white hover:bg-red-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={() => router.push("/company/sponsorship-plans")}
                className="w-full rounded-lg border border-secondary/20 bg-white px-5 py-2.5 font-bold text-slate-700 hover:bg-secondary/5 transition-colors"
              >
                View Sponsorship Plans
              </button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
              <span className="material-symbols-outlined text-3xl text-red-600">error</span>
            </div>
            <h1 className="text-xl font-black text-[#181112] mb-2">Payment Failed</h1>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => router.push("/company/sponsorship-plans")}
                className="w-full rounded-lg bg-primary px-5 py-2.5 font-bold text-white hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => router.push("/company/support")}
                className="w-full rounded-lg border border-secondary/20 bg-white px-5 py-2.5 font-bold text-slate-700 hover:bg-secondary/5 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
              <span className="material-symbols-outlined text-3xl text-red-600">error</span>
            </div>
            <h1 className="text-xl font-black text-[#181112] mb-2">Something Went Wrong</h1>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
            <button
              type="button"
              onClick={() => router.push("/company/dashboard")}
              className="w-full rounded-lg bg-primary px-5 py-2.5 font-bold text-white hover:bg-red-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function SponsorshipPaymentCallbackPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto  w-full max-w-[80%] md:max-w-[50%] rounded-xl border border-secondary/20 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-secondary/10">
            <div className="size-8 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
          </div>
          <h1 className="text-xl font-black text-[#181112] mb-2">Loading...</h1>
        </div>
      </main>
    }>
      <SponsorshipPaymentCallbackContent />
    </Suspense>
  );
}
