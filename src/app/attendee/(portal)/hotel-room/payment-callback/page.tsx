"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyPayment, formatKoboToNaira, type Payment } from "@/lib/api";
import { useAuthSession } from "@/hooks/use-auth-session";
import { AttendeePortalShell } from "../../../components/AttendeePortalShell";

function AttendeeHotelRoomPaymentCallbackContent() {
  const { data: user } = useAuthSession();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const profile = user?.attendee;
  const fullName = profile?.fullName || "Attendee";
  const userId = user?.id || "";

  const { data: result, isError, error, isPending, isFetching } = useQuery({
    queryKey: ["payment", "verify", "hotel-room", reference],
    queryFn: () => verifyPayment(reference!),
    enabled: !!reference,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const payment: Payment | undefined = result?.payment;

  useEffect(() => {
    if (!payment || payment.kind !== "hotel_room") return;
    localStorage.setItem(
      "hotelRoomPaymentResult",
      JSON.stringify({
        reference: payment.reference,
        status: payment.status,
        kind: payment.kind,
        hotelRoomId: payment.hotelRoomId ?? null,
        paidAt: payment.paidAt ?? null,
        updatedAt: Date.now(),
      })
    );
    if (payment.status === "success") {
      void queryClient.invalidateQueries({ queryKey: ["hotel-rooms", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["hotel-rooms", "available"] });
      void queryClient.invalidateQueries({ queryKey: ["attendee", "event-passes"] });
    }
  }, [payment, queryClient]);

  const verifying = !!reference && (isPending || isFetching);

  if (!reference) {
    return (
      <AttendeePortalShell userId={userId} fullName={fullName}>
        <main className="flex flex-1 justify-center items-center py-16 px-4">
        <div className="w-full text-center">
          <span className="material-symbols-outlined text-6xl text-red-600 mb-4">error</span>
          <h1 className="text-3xl font-black text-charcoal mb-4">Invalid payment link</h1>
          <p className="text-gray-600 mb-6">
            This link is missing a payment reference. Return to hotel rooms and try again.
          </p>
          <Link
            href="/hotel-rooms"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
          >
            Back to hotel rooms
          </Link>
        </div>
      </main>
      </AttendeePortalShell>
    );
  }

  if (verifying) {
    return (
      <AttendeePortalShell userId={userId} fullName={fullName}>
        <main className="flex flex-1 justify-center items-center py-16 px-4">
        <div className="w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="size-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
          <h1 className="text-3xl font-black text-charcoal mb-4">Verifying payment</h1>
          <p className="text-gray-600">
            Please wait while we confirm your hotel booking payment…
          </p>
        </div>
      </main>
      </AttendeePortalShell>
    );
  }

  if (isError) {
    return (
      <AttendeePortalShell userId={userId} fullName={fullName}>
        <main className="flex flex-1 justify-center items-center py-16 px-4">
        <div className="w-full text-center">
          <span className="material-symbols-outlined text-6xl text-red-600 mb-4">error</span>
          <h1 className="text-3xl font-black text-charcoal mb-4">Verification failed</h1>
          <p className="text-gray-600 mb-6">
            {error instanceof Error
              ? error.message
              : "Unable to verify your payment. Contact support if money was debited."}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/hotel-rooms"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
            >
              Back to hotel rooms
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Return to home
            </Link>
          </div>
        </div>
      </main>
      </AttendeePortalShell>
    );
  }

  const isSuccess = payment?.status === "success";
  const isFailed = payment?.status === "failed";
  const isRefunded = payment?.status === "refunded";

  return (
    <AttendeePortalShell userId={userId} fullName={fullName}>
      <main className="flex flex-1 justify-center py-16 px-4">
      <div className="w-full">
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

          <h1 className="text-3xl font-black text-center text-charcoal mb-3">
            {isSuccess && "Booking payment successful"}
            {isFailed && "Payment failed"}
            {isRefunded && "Payment refunded"}
            {!isSuccess && !isFailed && !isRefunded && "Payment pending"}
          </h1>

          <p className="text-center text-gray-600 mb-8">
            {isSuccess &&
              payment?.kind === "hotel_room" &&
              "Your hotel room reservation is confirmed. You can view your booking details in your tickets."}
            {isSuccess && payment?.kind !== "hotel_room" && "Your payment was processed successfully."}
            {isFailed && "Your payment could not be completed. You can try again from the hotel rooms page."}
            {isRefunded && "This payment was refunded. The room may be available again."}
            {!isSuccess && !isFailed && !isRefunded && "Your payment is still processing. You can refresh in a moment."}
          </p>

          {payment && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Reference</p>
                  <p className="text-sm font-mono text-charcoal break-all">{payment.reference}</p>
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
                  <p className="text-sm text-charcoal capitalize">{payment.kind.replace("_", " ")}</p>
                </div>
              )}

              {payment.hotelRoomId && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Room slot</p>
                  <p className="text-sm font-mono text-charcoal break-all">{payment.hotelRoomId}</p>
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
                  <p className="text-sm text-charcoal">
                    {new Date(payment.paidAt).toLocaleString("en-NG", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {isSuccess && (
              <>
                <Link
                  href="/attendee/tickets"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-fresh-green px-6 py-3 text-white font-bold hover:bg-medical-green transition-colors"
                >
                  <span className="material-symbols-outlined">confirmation_number</span>
                  View my tickets
                </Link>
                <Link
                  href="/hotel-rooms"
                  className="text-center text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Back to hotel rooms
                </Link>
              </>
            )}
            {(isFailed || isRefunded) && (
              <>
                <Link
                  href="/hotel-rooms"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors"
                >
                  <span className="material-symbols-outlined">refresh</span>
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
                  <span className="material-symbols-outlined">refresh</span>
                  Check status again
                </button>
                <Link href="/hotel-rooms" className="text-center text-sm text-gray-600 hover:text-primary">
                  Hotel rooms
                </Link>
              </>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Need help?</span> Contact support with reference:{" "}
              <span className="font-mono">{payment?.reference}</span>
            </p>
          </div>
        </div>
      </div>
    </main>
    </AttendeePortalShell>
  );
}

function PaymentCallbackSuspenseFallback() {
  return (
    <main className="flex flex-1 justify-center items-center py-16 px-4">
      <div className="w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="size-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
        <h1 className="text-3xl font-black text-charcoal mb-4">Loading</h1>
        <p className="text-gray-600">Preparing payment verification…</p>
      </div>
    </main>
  );
}

export default function AttendeeHotelRoomPaymentCallbackPage() {
  return (
    <Suspense fallback={<PaymentCallbackSuspenseFallback />}>
      <AttendeeHotelRoomPaymentCallbackContent />
    </Suspense>
  );
}
