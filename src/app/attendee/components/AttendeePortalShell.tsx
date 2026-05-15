"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PortalSidebarHeaderLogo } from "@/app/components/PortalSidebarHeaderLogo";
import { ResponsivePortalShell } from "@/app/components/ResponsivePortalShell";
import { authSessionQueryKey } from "@/hooks/use-auth-session";
import { logout } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

function navActive(pathname: string, href: string): boolean {
  if (href === "/attendee/support") return pathname === "/attendee/support" || pathname.startsWith("/attendee/support/");
  return pathname === href;
}

export function AttendeePortalShell({
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
      mobileTitle="Attendee Portal"
      sidebarClassName="border-r border-primary/10 bg-white"
      sidebar={
        <>
          <div className="border-b border-primary/10 px-4 py-5">
            <div className="flex items-center gap-3">
              <PortalSidebarHeaderLogo />
              <div className="min-w-0">
                <p className="text-sm font-bold text-charcoal leading-tight">ANPMP Lagos Attendee Portal</p>
                <p className="text-xs text-slate-500 truncate">ANPMP Lagos Conference 2026</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-4">
            <Link href="/attendee/dashboard" className={itemClass("/attendee/dashboard")}>
              <span className="material-symbols-outlined">dashboard</span>
              Profile
            </Link>

            <Link href="/attendee/tickets" className={itemClass("/attendee/tickets")}>
              <span className="material-symbols-outlined">confirmation_number</span>
              My Ticket
            </Link>

            <Link href="/attendee/receipts" className={itemClass("/attendee/receipts")}>
              <span className="material-symbols-outlined">receipt_long</span>
              Receipts
            </Link>

            <Link href="/attendee/support" className={itemClass("/attendee/support")}>
              <span className="material-symbols-outlined">help</span>
              Support
            </Link>
          </nav>

          <div className="space-y-3 border-t border-primary/10 px-4 py-5">
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Attendee</p>
              <p className="text-sm font-mono text-charcoal mt-1 truncate">{fullName || "—"}</p>
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
