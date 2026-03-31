"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ResponsivePortalShell } from "@/app/components/ResponsivePortalShell";
import { authSessionQueryKey } from "@/hooks/use-auth-session";
import { logout } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

/** Sidebar for members / attendees booking hotel rooms (no company portal). */
export function AttendeeHotelRoomsShell({
  children,
  userEmail,
  fullName,
  regType,
}: {
  children: React.ReactNode;
  userEmail?: string;
  fullName?: string;
  regType?: "member" | "attendee";
}) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((s) => s.clearUser);
  const [loggingOut, setLoggingOut] = useState(false);

  const isMember = regType === "member";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // ignore
    } finally {
      clearUser();
      void queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
      window.location.href = "/login";
    }
  };

  const itemClass = (href: string) => {
    const active =
      href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
    return active
      ? "w-full flex items-center gap-3 rounded-lg bg-primary px-3 py-2 text-white font-bold"
      : "w-full flex items-center gap-3 rounded-lg hover:bg-primary/5 px-3 py-2 text-slate-700 font-semibold";
  };

  return (
    <ResponsivePortalShell
      mobileTitle={isMember ? "Member Portal" : "Attendee Portal"}
      sidebarClassName="border-r border-primary/10 bg-white"
      sidebar={
        <>
          <div className="border-b border-primary/10 px-4 py-5">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">hotel</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-charcoal leading-tight">Hotel booking</p>
                <p className="text-xs text-slate-500 truncate">ANPMP Lagos Conference 2026</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-4">
            {isMember ? (
              <>
                <Link href="/member/dashboard" className={itemClass("/member/dashboard")}>
                  <span className="material-symbols-outlined">account_circle</span>
                  Profile
                </Link>
                <Link href="/member/tickets" className={itemClass("/member/tickets")}>
                  <span className="material-symbols-outlined">confirmation_number</span>
                  My Ticket
                </Link>
                <Link href="/hotel-rooms" className={itemClass("/hotel-rooms")}>
                  <span className="material-symbols-outlined">bed</span>
                  Hotel rooms
                </Link>
                <Link href="/support" className={itemClass("/support")}>
                  <span className="material-symbols-outlined">support</span>
                  Support
                </Link>
              </>
            ) : (
              <>
                <Link href="/attendee/dashboard" className={itemClass("/attendee/dashboard")}>
                  <span className="material-symbols-outlined">account_circle</span>
                  Profile
                </Link>
                <Link href="/attendee/tickets" className={itemClass("/attendee/tickets")}>
                  <span className="material-symbols-outlined">confirmation_number</span>
                  My Ticket
                </Link>
                <Link href="/hotel-rooms" className={itemClass("/hotel-rooms")}>
                  <span className="material-symbols-outlined">bed</span>
                  Hotel rooms
                </Link>
                <Link href="/support" className={itemClass("/support")}>
                  <span className="material-symbols-outlined">support</span>
                  Support
                </Link>
              </>
            )}
          </nav>

          <div className="space-y-3 border-t border-primary/10 px-4 py-5">
            <div className="px-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</p>
              <p className="text-sm font-medium text-charcoal mt-1">{fullName || userEmail || "User"}</p>
              {isMember && <p className="text-xs text-slate-500">ANPMP Member</p>}
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              {loggingOut ? "Signing out…" : "Log out"}
            </button>
          </div>
        </>
      }
    >
      {children}
    </ResponsivePortalShell>
  );
}
