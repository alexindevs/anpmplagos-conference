"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getMyRegistration, formatKoboToNaira, getConferenceRegistrationPricing, type MemberProfile, type AttendeeProfile } from "@/lib/api";
import { MemberPortalShell } from "../../components/MemberPortalShell";
import Image from "next/image";

export default function MemberDashboardPage() {
  const { data: user } = useAuthSession();

  const { data: registration, isLoading } = useQuery({
    queryKey: ["member", "registration"],
    queryFn: getMyRegistration,
    enabled: !!user,
  });

  const { data: pricing } = useQuery({
    queryKey: ["conference-registration-pricing"],
    queryFn: getConferenceRegistrationPricing,
    staleTime: 5 * 60 * 1000,
  });

  const profile = registration?.member || registration?.attendee;
  const isMember = registration?.user?.regType === "member";
  const memberProfile = profile as MemberProfile | undefined;
  const attendeeProfile = profile as AttendeeProfile | undefined;

  const displayFullName = profile?.fullName || user?.member?.fullName || user?.attendee?.fullName || "Member";
  const memberTitle =
    isMember && memberProfile?.title?.trim() ? `${memberProfile.title.trim()} ` : "";
  const fullName = `${memberTitle}${displayFullName}`.trim() || displayFullName;
  const userId = user?.id || "";

  const ticketPrice = isMember ? pricing?.memberPriceKobo : pricing?.nonMemberPriceKobo;
  const registrationDueKobo = ticketPrice;
  const isPaid = registration?.payment?.status === "success" || registration?.user?.registrationStatus === "registered";
  const isPending = registration?.user?.registrationStatus === "pending_payment";

  const avatarUrl = profile?.avatar
    ? profile.avatar.startsWith("http")
      ? profile.avatar
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${profile.avatar}`
    : null;

  return (
    <MemberPortalShell userId={userId} fullName={fullName}>
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 border-l-4 border-primary pl-4">
          <h1 className="text-2xl font-black text-charcoal">Welcome, {fullName}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isMember ? "ANPMP Member" : "Conference Attendee"} · {registration?.user?.email}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Registration Status */}
            <div className="lg:col-span-2 space-y-6">
              <section className="rounded-xl border border-primary/20 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-black text-charcoal mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">badge</span>
                  Registration Status
                </h2>

                <div className="flex items-center gap-4 mb-6">
                  <div className={`rounded-full p-3 ${isPaid ? "bg-secondary/10" : isPending ? "bg-mint-whisper" : "bg-slate-100"}`}>
                    <span className={`material-symbols-outlined text-2xl ${isPaid ? "text-secondary" : isPending ? "text-secondary" : "text-slate-500"}`}>
                      {isPaid ? "check_circle" : isPending ? "pending" : "hourglass_empty"}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-charcoal">
                      {isPaid ? "Registration Complete" : isPending ? "Payment Pending" : "Processing"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {isPaid
                        ? "Your registration is confirmed. View your ticket below."
                        : isPending
                        ? "Complete payment to confirm your registration."
                        : "Your registration is being processed."}
                    </p>
                  </div>
                </div>

                {!isPaid && (
                  <div className="rounded-lg bg-mint-whisper border border-secondary/20 p-4 mb-4">
                    <p className="text-sm text-secondary">
                      <span className="font-bold">Payment required.</span> Your registration will be confirmed after payment.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Registration Type</p>
                    <p className="mt-1 text-lg font-black text-charcoal">{isMember ? "Member" : "Non-Member"}</p>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Ticket Price</p>
                    <p className="mt-1 text-lg font-black text-primary tabular-nums">{ticketPrice != null ? formatKoboToNaira(ticketPrice) : "—"}</p>
                  </div>
                </div>
              </section>

              {/* Profile Information */}
              <section className="rounded-xl border border-primary/20 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-black text-charcoal flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    Profile Information
                  </h2>
                  <a
                    href="/member/profile/edit"
                    className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    Edit
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isMember && memberProfile?.title?.trim() ? (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Title</p>
                      <p className="mt-1 text-sm font-semibold text-charcoal">{memberProfile.title.trim()}</p>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</p>
                    <p className="mt-1 text-sm font-semibold text-charcoal">{profile?.fullName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</p>
                    <p className="mt-1 text-sm font-semibold text-charcoal">{profile?.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</p>
                    <p className="mt-1 text-sm font-semibold text-charcoal">{registration?.user?.email || "—"}</p>
                  </div>
                  {isMember && memberProfile && (
                    <>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">ANPMP ID</p>
                        <p className="mt-1 text-sm font-semibold text-charcoal">{memberProfile.anpmpId || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Dues Payment</p>
                        <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${memberProfile.duesPaid ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                          <span className="material-symbols-outlined text-[13px]">{memberProfile.duesPaid ? "check_circle" : "cancel"}</span>
                          {memberProfile.duesPaid ? "Paid" : "Unpaid"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Specialty</p>
                        <p className="mt-1 text-sm font-semibold text-charcoal">{memberProfile.primarySpecialty ? memberProfile.primarySpecialty.charAt(0).toUpperCase() + memberProfile.primarySpecialty.slice(1) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Organization</p>
                        <p className="mt-1 text-sm font-semibold text-charcoal">{memberProfile.hospitalOrg || "—"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Organization address</p>
                        <p className="mt-1 text-sm font-semibold text-charcoal whitespace-pre-wrap">
                          {memberProfile.organizationAddress?.trim() || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Zone</p>
                        <p className="mt-1 text-sm font-semibold text-charcoal">{memberProfile.zone?.trim() || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">State</p>
                        <p className="mt-1 text-sm font-semibold text-charcoal">{memberProfile.state?.trim() || "—"}</p>
                      </div>
                    </>
                  )}
                  {!isMember && attendeeProfile && (
                    <>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Medical Field</p>
                        <p className="mt-1 text-sm font-semibold text-charcoal">
                          {attendeeProfile.inMedicalField ? "Yes" : "No"}
                        </p>
                      </div>
                      {attendeeProfile.inMedicalField && (
                        <>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Specialty</p>
                            <p className="mt-1 text-sm font-semibold text-charcoal">{attendeeProfile.primarySpecialty || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Hospital/Organization</p>
                            <p className="mt-1 text-sm font-semibold text-charcoal">{attendeeProfile.hospitalOrg || "—"}</p>
                          </div>
                        </>
                      )}
                      {!attendeeProfile.inMedicalField && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Occupation</p>
                          <p className="mt-1 text-sm font-semibold text-charcoal">{attendeeProfile.occupation || "—"}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {profile?.bio && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Bio</p>
                    <p className="mt-1 text-sm text-slate-600">{profile.bio}</p>
                  </div>
                )}
              </section>

              {/* Spouse Information (Members only) */}
              {isMember && memberProfile?.hasSpouse && (
                <section className="rounded-xl border border-primary/20 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-black text-charcoal mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">group</span>
                    Spouse Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</p>
                      <p className="mt-1 text-sm font-semibold text-charcoal">{memberProfile.spouseName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</p>
                      <p className="mt-1 text-sm font-semibold text-charcoal">{memberProfile.spouseEmail || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</p>
                      <p className="mt-1 text-sm font-semibold text-charcoal">{memberProfile.spousePhone || "—"}</p>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Profile Photo */}
              <section className="rounded-xl border border-primary/20 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-black text-charcoal mb-4">Profile Photo</h2>
                {avatarUrl ? (
                  <div className="flex justify-center">
                    <Image
                      src={avatarUrl}
                      alt={fullName}
                      width={150}
                      height={150}
                      className="rounded-xl object-cover border border-slate-200"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="flex size-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                      <span className="material-symbols-outlined text-4xl text-slate-300">person</span>
                    </div>
                  </div>
                )}
              </section>

              {/* Quick Actions */}
              <section className="rounded-xl border border-primary/20 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-black text-charcoal mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <a
                    href="/member/tickets"
                    className="flex w-full items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10"
                  >
                    <span className="flex items-center gap-2 font-bold text-primary">
                      <span className="material-symbols-outlined">confirmation_number</span>
                      View Ticket
                    </span>
                    <span className="material-symbols-outlined text-primary">chevron_right</span>
                  </a>
                  <a
                    href="/hotel-rooms"
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2 font-bold text-slate-700">
                      <span className="material-symbols-outlined text-slate-500">hotel</span>
                      Book Hotel
                    </span>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                  </a>
                </div>
              </section>
            </aside>
          </div>
        )}
      </main>
    </MemberPortalShell>
  );
}
