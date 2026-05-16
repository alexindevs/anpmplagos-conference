"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PortalSidebarHeaderLogo } from "@/app/components/PortalSidebarHeaderLogo";
import { ResponsivePortalShell } from "@/app/components/ResponsivePortalShell";
import { authSessionQueryKey } from "@/hooks/use-auth-session";
import { logout, getMe, refresh, isAdminUser, isModeratorUser, isCompanyRegType, type AuthUser } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

function redirectForWrongRole(u: AuthUser): string {
  if (isAdminUser(u)) return "/admin/dashboard";
  if (isModeratorUser(u)) return "/moderator/dashboard";
  if (u.regType === "member") return "/member/dashboard";
  if (u.regType === "attendee") return "/attendee/dashboard";
  return "/";
}

function navActive(pathname: string, href: string): boolean {
  if (href === "/hotel-rooms") {
    return (
      pathname === "/hotel-rooms" ||
      pathname.startsWith("/hotel-rooms/") ||
      pathname.startsWith("/company/hotel-room")
    );
  }
  if (href === "/company/sponsorship-plans") {
    return pathname === "/company/sponsorship-plans" || pathname.startsWith("/company/sponsorship-plans/");
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
  const { setUser, clearUser } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      let u: AuthUser;
      try {
        u = await getMe();
      } catch {
        try {
          const { user: refreshed } = await refresh();
          u = refreshed;
        } catch {
          if (!cancelled) { clearUser(); window.location.replace("/login"); }
          return;
        }
      }
      if (cancelled) return;
      setUser(u);
      if (!isCompanyRegType(u)) {
        window.location.replace(redirectForWrongRole(u));
        return;
      }
      setLoading(false);
      setAuthorized(true);
    }
    void run();
    return () => { cancelled = true; };
  }, [setUser, clearUser]);

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

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><p className="text-charcoal/60">Loading...</p></div>;
  }
  if (!authorized) {
    return <div className="flex h-screen items-center justify-center"><p className="text-charcoal/60">Redirecting…</p></div>;
  }

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
              <PortalSidebarHeaderLogo />
              <div className="min-w-0">
                <p className="text-sm font-bold text-charcoal leading-tight">ANPMP Lagos Company Portal</p>
                <p className="text-xs text-slate-500 truncate">ANPMP Lagos Conference 2026</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-4">
            <Link href="/company/dashboard" className={itemClass("/company/dashboard")}>
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>

            <Link href="/company/floor-plan" className={itemClass("/company/floor-plan")}>
              <span className="material-symbols-outlined">map</span>
              Floor plan
            </Link>

            <Link href="/company/sponsorship-plans" className={itemClass("/company/sponsorship-plans")}>
              <span className="material-symbols-outlined">workspace_premium</span>
              Sponsorship plans
            </Link>

            <Link href="/hotel-rooms" className={itemClass("/hotel-rooms")}>
              <span className="material-symbols-outlined">hotel</span>
              Hotel rooms
            </Link>

            <Link href="/company/tickets" className={itemClass("/company/tickets")}>
              <span className="material-symbols-outlined">confirmation_number</span>
              Tickets
            </Link>

            <Link href="/company/receipts" className={itemClass("/company/receipts")}>
              <span className="material-symbols-outlined">receipt_long</span>
              Receipts
            </Link>

            <Link href="/company/support" className={itemClass("/company/support")}>
              <span className="material-symbols-outlined">help</span>
              Support
            </Link>
          </nav>

          <div className="space-y-3 border-t border-secondary/10 px-4 py-5">
            <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">Company ID</p>
              <p className="text-xs font-mono text-charcoal mt-1">{companyId ? `${companyId}` : "—"}</p>
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
