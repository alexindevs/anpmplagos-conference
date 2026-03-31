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
  if (href === "/hotel-rooms") {
    return (
      pathname === "/hotel-rooms" ||
      pathname.startsWith("/hotel-rooms/") ||
      pathname.startsWith("/company/hotel-room")
    );
  }
  if (href === "/company/marketing") {
    return pathname === "/company/marketing" || pathname.startsWith("/company/marketing/");
  }
  if (href === "/company/support") {
    return pathname === "/company/support" || pathname.startsWith("/company/support/");
  }
  return pathname === href;
}

export function CompanyPortalShell({
  children,
  companyId,
}: {
  children: React.ReactNode;
  companyId: string;
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
      : "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 font-semibold hover:bg-secondary/10 hover:text-secondary";

  return (
    <ResponsivePortalShell
      mobileTitle="Company Portal"
      mobileBarClassName="border-b border-secondary/20 bg-white"
      sidebarClassName="border-r border-secondary/15 border-l-4 border-l-secondary bg-white"
      mainClassName="bg-linear-to-br from-secondary/6 via-background-light to-background-light"
      sidebar={
        <>
          <div className="border-b border-secondary/10 px-4 py-5">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-secondary">medical_services</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#181112] leading-tight">ANPMP Lagos Company Portal</p>
                <p className="text-xs text-slate-500 truncate">ANPMP Lagos Conference 2026</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-4">
            <Link href="/company/dashboard" className={itemClass("/company/dashboard")}>
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>

            <Link href="/company/select-booth" className={itemClass("/company/select-booth")}>
              <span className="material-symbols-outlined">store</span>
              Booth Selection
            </Link>

            <Link href="/company/masterclasses" className={itemClass("/company/masterclasses")}>
              <span className="material-symbols-outlined">school</span>
              Masterclasses
            </Link>

            <Link href="/company/panels" className={itemClass("/company/panels")}>
              <span className="material-symbols-outlined">groups</span>
              Panel Sessions
            </Link>

            <Link href="/company/presentations" className={itemClass("/company/presentations")}>
              <span className="material-symbols-outlined">co_present</span>
              Presentations
            </Link>

            <Link href="/hotel-rooms" className={itemClass("/hotel-rooms")}>
              <span className="material-symbols-outlined">hotel</span>
              Hotel rooms
            </Link>

            <Link href="/company/marketing" className={itemClass("/company/marketing")}>
              <span className="material-symbols-outlined">campaign</span>
              Marketing
            </Link>

            <Link href="/company/sponsorship-plans" className={itemClass("/company/sponsorship-plans")}>
              <span className="material-symbols-outlined">workspace_premium</span>
              Sponsorship Plans
            </Link>

            <button
              type="button"
              disabled
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 font-semibold cursor-not-allowed opacity-60"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              Tickets
            </button>

            <Link href="/company/support" className={itemClass("/company/support")}>
              <span className="material-symbols-outlined">help</span>
              Support
            </Link>
          </nav>

          <div className="space-y-3 border-t border-secondary/10 px-4 py-5">
            <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">Company ID</p>
              <p className="text-sm font-mono text-[#181112] mt-1">{companyId ? `#${companyId}` : "—"}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-secondary/40 hover:bg-secondary/5 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-60"
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
