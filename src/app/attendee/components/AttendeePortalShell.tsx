"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/auth-api";
import { ResponsivePortalShell } from "@/app/components/ResponsivePortalShell";

interface AttendeePortalShellProps {
  children: React.ReactNode;
  userId: string;
  fullName: string;
}

export function AttendeePortalShell({ children, userId, fullName }: AttendeePortalShellProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-1">
        <Link
          href="/attendee/dashboard"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">account_circle</span>
          Profile
        </Link>
        <Link
          href="/attendee/tickets"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
          My Ticket
        </Link>
        <Link
          href="/attendee/support"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">support</span>
          Support
        </Link>
      </div>

      <div className="border-t border-slate-200 pt-4 mt-4">
        <div className="px-3 py-2 mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</p>
          <p className="text-sm font-medium text-charcoal mt-1">{fullName}</p>
          <p className="text-xs text-slate-500">Conference Attendee</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {isLoggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </div>
  );

  return (
    <ResponsivePortalShell
      mobileTitle="Attendee Portal"
      sidebar={sidebarContent}
    >
      {children}
    </ResponsivePortalShell>
  );
}
