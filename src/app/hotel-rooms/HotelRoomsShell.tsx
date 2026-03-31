"use client";

import { useAuthSession } from "@/hooks/use-auth-session";
import { CompanyPortalShell } from "@/app/company/components/CompanyPortalShell";
import { AttendeeHotelRoomsShell } from "./AttendeeHotelRoomsShell";
import { getCompanyIdFromAuthUser, isCompanyRegType } from "@/lib/auth-api";

export function HotelRoomsShell({ children }: { children: React.ReactNode }) {
  const { data: user, isPending } = useAuthSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          Loading…
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen bg-background-light flex flex-col">{children}</div>;
  }

  if (isCompanyRegType(user)) {
    const companyId = getCompanyIdFromAuthUser(user);
    return <CompanyPortalShell companyId={companyId}>{children}</CompanyPortalShell>;
  }

  const fullName = user.member?.fullName || user.attendee?.fullName || user.email;
  const regType = user.regType === "member" ? "member" : "attendee";

  return (
    <AttendeeHotelRoomsShell 
      userEmail={user.email} 
      fullName={fullName}
      regType={regType}
    >
      {children}
    </AttendeeHotelRoomsShell>
  );
}
