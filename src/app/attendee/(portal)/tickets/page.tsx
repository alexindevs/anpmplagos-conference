"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  getMyRegistration,
  formatKoboToNaira,
  initializeRegistrationPayment,
  getMyEventPasses,
  generateConferencePass,
  generateHotelPass,
  getMyBookedHotelRooms,
  getPassPurchaseEligibility,
  ApiError,
} from "@/lib/api";
import { AutomaticCheckoutDiscountNote } from "@/app/components/AutomaticCheckoutDiscountNote";
import { applyAutomaticDiscountKobo, getAutomaticCheckoutDiscountPercent } from "@/lib/automatic-checkout-discount";
import { AttendeePortalShell } from "../../components/AttendeePortalShell";
import Link from "next/link";

const PRICE_NON_MEMBER = 5500000; // 55,000 NGN in kobo

export default function AttendeeTicketsPage() {
  const router = useRouter();
  const { data: user } = useAuthSession();
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isGeneratingPasses, setIsGeneratingPasses] = useState(false);

  const { data: registration, isLoading } = useQuery({
    queryKey: ["attendee", "registration"],
    queryFn: getMyRegistration,
    enabled: !!user,
  });

  const profile = registration?.attendee;
  const fullName = profile?.fullName || user?.attendee?.fullName || "Attendee";
  const userId = user?.id || "";

  const regDiscountPct = getAutomaticCheckoutDiscountPercent();
  const registrationDueKobo = applyAutomaticDiscountKobo(PRICE_NON_MEMBER, regDiscountPct);
  const isPaid = registration?.payment?.status === "success";
  const isPending = registration?.user?.registrationStatus === "pending_payment";

  const {
    data: eligibility,
    isLoading: eligibilityLoading,
    isError: eligibilityError,
  } = useQuery({
    queryKey: ["event-pass", "pass-purchase-eligibility"],
    queryFn: getPassPurchaseEligibility,
    enabled: !!user && isPaid,
  });

  const canAccessPasses = eligibility?.isEligible === true;

  const { data: eventPasses, refetch: refetchPasses } = useQuery({
    queryKey: ["attendee", "event-passes"],
    queryFn: getMyEventPasses,
    enabled: !!user && isPaid && canAccessPasses,
  });

  const { data: hotelBookings = [] } = useQuery({
    queryKey: ["attendee", "hotel-bookings"],
    queryFn: getMyBookedHotelRooms,
    enabled: !!user && isPaid && canAccessPasses,
  });

  const handleCompletePayment = async () => {
    if (!userId) {
      toast.error("We couldn't find your account. Please sign in again.");
      return;
    }
    setIsInitializingPayment(true);
    try {
      const paymentData = await initializeRegistrationPayment(userId);
      if (paymentData.manualMode) {
        router.push(`/payment/manual-pending?reference=${encodeURIComponent(paymentData.reference)}`);
        return;
      }
      window.location.href = paymentData.authorizationUrl;
    } catch (error) {
      console.error("Payment initialization failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize payment. Please try again.";
      toast.error(errorMessage);
      setIsInitializingPayment(false);
    }
  };

  useEffect(() => {
    const generatePassesIfNeeded = async () => {
      console.log("Pass generation check:", { isPaid, userId, isGeneratingPasses, hotelBookingsCount: hotelBookings.length, eventPasses });
      
      if (!isPaid || !userId || !canAccessPasses || isGeneratingPasses) return;
      
      const needsConferencePass = !eventPasses?.conferencePass;
      const needsHotelPass = hotelBookings.length > 0 && !eventPasses?.hotelPass;
      
      console.log("Pass needs:", { needsConferencePass, needsHotelPass });
      
      if (!needsConferencePass && !needsHotelPass) return;

      setIsGeneratingPasses(true);
      try {
        if (needsConferencePass) {
          console.log("Generating conference pass...");
          await generateConferencePass(userId);
        }
        if (needsHotelPass) {
          console.log("Generating hotel pass...");
          await generateHotelPass(userId);
        }
        await refetchPasses();
        console.log("Passes generated successfully");
      } catch (error) {
        console.error("Pass generation error:", error);
        if (error instanceof ApiError && error.status !== 400) {
          console.error("Failed to generate passes:", error);
        }
      } finally {
        setIsGeneratingPasses(false);
      }
    };

    generatePassesIfNeeded();
  }, [isPaid, userId, canAccessPasses, eventPasses, hotelBookings, refetchPasses, isGeneratingPasses]);

  const handleDownloadTicket = (url: string | undefined, filename: string) => {
    if (!url) {
      toast.error("Ticket not available yet. Try again in a moment.");
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <AttendeePortalShell userId={userId} fullName={fullName}>
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 border-l-4 border-primary pl-4">
          <h1 className="text-xl font-black text-charcoal sm:text-2xl">My Conference Ticket</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage your conference registration</p>
        </div>

        {isLoading || (isPaid && eligibilityLoading) ? (
          <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
        ) : (
          <div className="">
            {isPaid && eligibilityError ? (
              <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-red-300 mb-4">error</span>
                <h2 className="text-xl font-black text-charcoal mb-2">Couldn&apos;t verify ticket access</h2>
                <p className="text-slate-500 mb-4">
                  Something went wrong while checking your pass eligibility. Please try again or contact support.
                </p>
                <Link
                  href="/attendee/support"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined">support</span>
                  Contact Support
                </Link>
              </div>
            ) : isPaid && !canAccessPasses ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-amber-500 mb-4">lock</span>
                <h2 className="text-xl font-black text-charcoal mb-2">Tickets not available</h2>
                <p className="text-slate-600 mb-4 mx-auto">
                  Your account isn&apos;t eligible for conference passes right now. If you believe this is a mistake, please contact support.
                </p>
                <Link
                  href="/attendee/support"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined">support</span>
                  Contact Support
                </Link>
              </div>
            ) : isPaid ? (
              <div className="rounded-xl border-2 border-green-500 bg-white p-5 shadow-lg sm:p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="rounded-full bg-green-100 p-4">
                    <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-center text-charcoal mb-2">
                  ANPMP Lagos Conference 2026
                </h2>
                <p className="text-center text-slate-500 mb-6">Official Conference Ticket</p>

                <div className="border-t border-b border-slate-200 py-6 my-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Attendee</p>
                      <p className="mt-1 text-lg font-bold text-charcoal">{profile?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Registration Type</p>
                      <p className="mt-1 text-lg font-bold text-charcoal">Non-Member</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ticket Price</p>
                      <p className="mt-1 text-lg font-bold text-primary">{formatKoboToNaira(PRICE_NON_MEMBER)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</p>
                      <p className="mt-1 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                        CONFIRMED
                      </p>
                    </div>
                  </div>
                </div>

                {registration?.payment && (
                  <div className="rounded-lg bg-slate-50 p-4 mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Payment Details</p>
                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <span className="text-slate-500">Reference:</span>
                        <span className="ml-2 font-mono font-semibold">{registration.payment.reference}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Paid:</span>
                        <span className="ml-2 font-semibold">
                          {registration.payment.paidAt
                            ? new Date(registration.payment.paidAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-black text-charcoal mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-fresh-green">qr_code_2</span>
                      Download Your Tickets
                    </h3>
                    
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => handleDownloadTicket(eventPasses?.conferencePass?.qrCodeUrl, `conference-ticket-${fullName}.png`)}
                        disabled={!eventPasses?.conferencePass?.qrCodeUrl || isGeneratingPasses}
                        className="flex w-full flex-col gap-3 p-4 bg-gradient-to-r from-fresh-green to-medical-green text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-2xl">confirmation_number</span>
                          <div className="text-left">
                            <p className="font-black">Conference Ticket</p>
                            <p className="text-xs text-white/80 font-normal">
                              {isGeneratingPasses ? "Generating..." : "QR Code for Entry"}
                            </p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined">download</span>
                      </button>

                      {eventPasses?.hotelPass && (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadTicket(eventPasses.hotelPass?.qrCodeUrl, `hotel-pass-${fullName}.png`)}
                            disabled={!eventPasses.hotelPass?.qrCodeUrl}
                            className="flex w-full flex-col gap-3 p-4 bg-gradient-to-r from-primary to-red-700 text-white font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-2xl">hotel</span>
                              <div className="text-left">
                                <p className="font-black">Hotel Pass</p>
                                <p className="text-xs text-white/80 font-normal">All Hotel Reservations</p>
                              </div>
                            </div>
                            <span className="material-symbols-outlined">download</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500">
                      Please present these tickets at the conference registration desk and hotel check-in.
                    </p>
                  </div>
                </div>
              </div>
            ) : isPending ? (
              <div className="rounded-xl border-2 border-secondary bg-mint-whisper/40 p-5 shadow-lg sm:p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="rounded-full bg-secondary/10 p-4">
                    <span className="material-symbols-outlined text-4xl text-secondary">pending</span>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-center text-charcoal mb-2">
                  Payment Pending
                </h2>
                <p className="text-center text-slate-500 mb-6">
                  Complete your payment to confirm your registration
                </p>

                <AutomaticCheckoutDiscountNote className="mb-4" />

                <div className="border-t border-b border-slate-200 py-6 my-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Attendee</p>
                      <p className="mt-1 text-lg font-bold text-charcoal">{profile?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Amount Due</p>
                      {regDiscountPct > 0 ? (
                        <div className="mt-1">
                          <p className="text-sm text-slate-500 line-through tabular-nums">{formatKoboToNaira(PRICE_NON_MEMBER)}</p>
                          <p className="text-lg font-bold text-primary tabular-nums">{formatKoboToNaira(registrationDueKobo)}</p>
                        </div>
                      ) : (
                        <p className="mt-1 text-lg font-bold text-primary tabular-nums">{formatKoboToNaira(PRICE_NON_MEMBER)}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleCompletePayment}
                    disabled={isInitializingPayment}
                    className="w-full rounded-lg bg-primary px-6 py-3 font-bold text-white shadow-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isInitializingPayment ? (
                      <>
                        <span className="inline-block size-5 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2 align-middle" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined mr-2 align-middle">payments</span>
                        Complete Payment
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-slate-500">
                    You will be redirected to our secure payment provider.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">help</span>
                <h2 className="text-xl font-black text-charcoal mb-2">Registration Status Unknown</h2>
                <p className="text-slate-500 mb-4">
                  We couldn&apos;t determine your registration status. Please contact support for assistance.
                </p>
                <Link
                  href="/attendee/support"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined">support</span>
                  Contact Support
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </AttendeePortalShell>
  );
}
