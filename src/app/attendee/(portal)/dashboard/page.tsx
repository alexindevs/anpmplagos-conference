"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getMyRegistration, formatKoboToNaira, type AttendeeProfile } from "@/lib/api";
import { AttendeePortalShell } from "../../components/AttendeePortalShell";
import Image from "next/image";

const PRICE_NON_MEMBER = 5500000; // 55,000 NGN in kobo

export default function AttendeeDashboardPage() {
  const { data: user } = useAuthSession();

  const { data: registration, isLoading } = useQuery({
    queryKey: ["attendee", "registration"],
    queryFn: getMyRegistration,
    enabled: !!user,
  });

  const profile = registration?.attendee;
  const attendeeProfile = profile as AttendeeProfile | undefined;

  const fullName = profile?.fullName || user?.attendee?.fullName || "Attendee";
  const userId = user?.id || "";

  const isPaid = registration?.payment?.status === "success";
  const isPending = registration?.user?.registrationStatus === "pending_payment";

  const avatarUrl = profile?.avatar
    ? profile.avatar.startsWith("http")
      ? profile.avatar
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${profile.avatar}`
    : null;

  return (
    <AttendeePortalShell userId={userId} fullName={fullName}>
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 border-l-4 border-primary pl-4">
          <h1 className="text-2xl font-black text-charcoal">Welcome, {fullName}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Conference Attendee · {registration?.user?.email}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-48 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Registration Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-charcoal mb-4">Registration Status</h2>
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-3 ${isPaid ? 'bg-secondary/10' : isPending ? 'bg-mint-whisper' : 'bg-slate-100'}`}>
                  <span className={`material-symbols-outlined text-2xl ${isPaid ? 'text-secondary' : isPending ? 'text-secondary' : 'text-slate-400'}`}>
                    {isPaid ? 'check_circle' : isPending ? 'pending' : 'help'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-charcoal">
                    {isPaid ? 'Registration Confirmed' : isPending ? 'Payment Pending' : 'Registration Incomplete'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {isPaid 
                      ? 'Your conference registration is confirmed and paid.'
                      : isPending 
                        ? `Complete your payment of ${formatKoboToNaira(PRICE_NON_MEMBER)} to confirm registration.`
                        : 'Please complete your registration process.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-charcoal mb-4">Profile Information</h2>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={fullName}
                      width={80}
                      height={80}
                      className="size-20 rounded-full object-cover border-2 border-slate-200"
                    />
                  ) : (
                    <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                      <span className="material-symbols-outlined text-2xl text-slate-400">person</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</p>
                    <p className="text-charcoal font-medium">{profile?.fullName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</p>
                    <p className="text-charcoal">{profile?.phone || "—"}</p>
                  </div>
                  {profile?.bio && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bio</p>
                      <p className="text-charcoal text-sm">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            {/* {attendeeProfile && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-charcoal mb-4">Professional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medical Field</p>
                    <p className="text-charcoal">
                      {attendeeProfile.inMedicalField === true ? "Yes" : attendeeProfile.inMedicalField === false ? "No" : "—"}
                    </p>
                  </div>
                  {attendeeProfile.inMedicalField === true ? (
                    <>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Specialty</p>
                        <p className="text-charcoal">{attendeeProfile.primarySpecialty || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospital/Organization</p>
                        <p className="text-charcoal">{attendeeProfile.hospitalOrg || "—"}</p>
                      </div>
                    </>
                  ) : attendeeProfile.inMedicalField === false ? (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupation</p>
                      <p className="text-charcoal">{attendeeProfile.occupation || "—"}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )} */}

            {/* Quick Actions */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-charcoal mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="/attendee/tickets"
                  className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">confirmation_number</span>
                  <div>
                    <p className="font-medium text-charcoal">View My Ticket</p>
                    <p className="text-sm text-slate-500">Conference registration ticket</p>
                  </div>
                </a>
                <a
                  href="/attendee/support"
                  className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">support</span>
                  <div>
                    <p className="font-medium text-charcoal">Get Support</p>
                    <p className="text-sm text-slate-500">Contact our support team</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </AttendeePortalShell>
  );
}
