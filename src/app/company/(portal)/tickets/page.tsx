"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  getExhibitorProfile,
  getMyEventPasses,
  generateConferencePass,
  generateHotelPass,
  getMyBookedHotelRooms,
  getPassPurchaseEligibility,
  ApiError,
} from "@/lib/api";
import { getCompanyNameFromAuthUser } from "@/lib/auth-api";
import Link from "next/link";

export default function CompanyTicketsPage() {
  const { data: user } = useAuthSession();
  const [isGeneratingPasses, setIsGeneratingPasses] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["company", "profile", "tickets"],
    queryFn: getExhibitorProfile,
    enabled: !!user,
  });

  const {
    data: eligibility,
    isLoading: eligibilityLoading,
    isError: eligibilityError,
  } = useQuery({
    queryKey: ["event-pass", "pass-purchase-eligibility"],
    queryFn: getPassPurchaseEligibility,
    enabled: !!user && !!profile,
  });

  const canAccessPasses = eligibility?.isEligible === true;

  const companyName = profile?.companyName || getCompanyNameFromAuthUser(user) || "Company";
  const userId = user?.id || "";

  const { data: eventPasses, refetch: refetchPasses } = useQuery({
    queryKey: ["company", "event-passes"],
    queryFn: getMyEventPasses,
    enabled: !!user && !!profile && canAccessPasses,
  });

  const { data: hotelBookings = [] } = useQuery({
    queryKey: ["company", "hotel-bookings"],
    queryFn: getMyBookedHotelRooms,
    enabled: !!user && !!profile && canAccessPasses,
  });

  useEffect(() => {
    const generatePassesIfNeeded = async () => {
      if (!profile || !userId || !canAccessPasses || isGeneratingPasses) return;

      const needsConferencePass = !eventPasses?.conferencePass;
      const needsHotelPass = hotelBookings.length > 0 && !eventPasses?.hotelPass;

      if (!needsConferencePass && !needsHotelPass) return;

      setIsGeneratingPasses(true);
      try {
        if (needsConferencePass) {
          await generateConferencePass(userId);
        }
        if (needsHotelPass) {
          await generateHotelPass(userId);
        }
        await refetchPasses();
      } catch (error) {
        if (error instanceof ApiError && error.status === 400) return;
      } finally {
        setIsGeneratingPasses(false);
      }
    };

    generatePassesIfNeeded();
  }, [profile, userId, canAccessPasses, eventPasses, hotelBookings, refetchPasses, isGeneratingPasses]);

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
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 border-l-4 border-secondary pl-4">
        <h1 className="text-xl font-black text-charcoal sm:text-2xl">Company Conference Ticket</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage your company&apos;s conference registration</p>
      </div>

      {isLoading || (profile && eligibilityLoading) ? (
        <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
      ) : profile && eligibilityError ? (
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-red-300 mb-4">error</span>
          <h2 className="text-xl font-black text-charcoal mb-2">Couldn&apos;t verify ticket access</h2>
          <p className="text-slate-500 mb-4">
            Something went wrong while checking your pass eligibility. Please try again or contact support.
          </p>
          <Link
            href="/company/support"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined">support</span>
            Contact Support
          </Link>
        </div>
      ) : profile && !canAccessPasses ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 text-center sm:p-8">
          <span className="material-symbols-outlined text-4xl text-amber-500 mb-4">lock</span>
          <h2 className="text-xl font-black text-charcoal mb-2">Tickets not available</h2>
          <p className="text-slate-600 mb-4 mx-auto w-full sm:w-4/5">
            Your account isn&apos;t eligible for conference passes right now. Please purchase an item from the Sponsorship Plans page and try again.
          </p>
          <Link
            href="/company/sponsorship-plans"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 transition-colors"
          >
            View Sponsorship Plans
          </Link>
        </div>
      ) : profile ? (
        <div className="">
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
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Company</p>
                    <p className="mt-1 text-lg font-bold text-charcoal">{companyName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Registration Type</p>
                    <p className="mt-1 text-lg font-bold text-charcoal">
                      Company/Exhibitor
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Company ID</p>
                    <p className="mt-1 text-lg font-bold text-secondary">{profile.slug}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</p>
                    <p className="mt-1 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                      CONFIRMED
                    </p>
                  </div>
                </div>
              </div>

              {profile.booth && (
                <div className="rounded-lg bg-slate-50 p-4 mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Booth Information</p>
                  <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <span className="text-slate-500">Booth:</span>
                      <span className="ml-2 font-semibold">{profile.booth.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Size:</span>
                      <span className="ml-2 font-semibold">{profile.booth.size || "—"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-black text-charcoal mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">qr_code_2</span>
                    Download Your Tickets
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadTicket(eventPasses?.conferencePass?.qrCodeUrl, `conference-ticket-${companyName}.png`)}
                      disabled={!eventPasses?.conferencePass?.qrCodeUrl || isGeneratingPasses}
                      className="flex w-full flex-col gap-3 p-4 bg-gradient-to-r from-secondary to-medical-green text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed sm:flex-row sm:items-center sm:justify-between"
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
                          onClick={() => handleDownloadTicket(eventPasses.hotelPass?.qrCodeUrl, `hotel-pass-${companyName}.png`)}
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
          </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">help</span>
          <h2 className="text-xl font-black text-charcoal mb-2">Profile Not Found</h2>
          <p className="text-slate-500 mb-4">
            We couldn&apos;t load your company profile. Please contact support for assistance.
          </p>
          <Link
            href="/company/support"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined">support</span>
            Contact Support
          </Link>
        </div>
      )}
    </main>
  );
}
