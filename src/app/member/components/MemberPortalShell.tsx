"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ResponsivePortalShell } from "@/app/components/ResponsivePortalShell";
import { authSessionQueryKey } from "@/hooks/use-auth-session";
import { logout } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

function navActive(pathname: string, href: string): boolean {
  if (href === "/hotel-rooms") return pathname === "/hotel-rooms" || pathname.startsWith("/hotel-rooms/");
  if (href === "/member/support") return pathname === "/member/support" || pathname.startsWith("/member/support/");
  return pathname === href;
}

export function MemberPortalShell({
  children,
  userId,
  fullName,
}: {
  children: React.ReactNode;
  userId: string;
  fullName: string;
}) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((s) => s.clearUser);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // Cookie may already be invalid; still clear client state and leave the portal.
    } finally {
      clearUser();
      void queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
      window.location.href = "/login";
    }
  };

  const itemClass = (href: string) =>
    navActive(pathname, href)
      ? "w-full flex items-center gap-3 rounded-lg bg-primary px-3 py-2 text-white font-bold"
      : "w-full flex items-center gap-3 rounded-lg hover:bg-primary/5 px-3 py-2 text-slate-700 font-semibold";

  return (
    <ResponsivePortalShell
      mobileTitle="Member Portal"
      sidebarClassName="border-r border-primary/10 bg-white"
      sidebar={
        <>
          <div className="border-b border-primary/10 px-4 py-5">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">medical_services</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#181112] leading-tight">ANPMP Member Portal</p>
                <p className="text-xs text-slate-500 truncate">ANPMP Lagos Conference 2026</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-4">
            <Link href="/member/dashboard" className={itemClass("/member/dashboard")}>
              <span className="material-symbols-outlined">dashboard</span>
              Profile
            </Link>

            <Link href="/member/tickets" className={itemClass("/member/tickets")}>
              <span className="material-symbols-outlined">confirmation_number</span>
              My Ticket
            </Link>

            <Link href="/hotel-rooms" className={itemClass("/hotel-rooms")}>
              <span className="material-symbols-outlined">hotel</span>
              Hotel rooms
            </Link>

            <Link href="/member/support" className={itemClass("/member/support")}>
              <span className="material-symbols-outlined">help</span>
              Support
            </Link>
          </nav>

          <div className="space-y-3 border-t border-primary/10 px-4 py-5">
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Member</p>
              <p className="text-sm font-mono text-[#181112] mt-1 truncate">{fullName || "—"}</p>
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
