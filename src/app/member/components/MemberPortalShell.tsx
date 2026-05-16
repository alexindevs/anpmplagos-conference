"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { PortalSidebarHeaderLogo } from "@/app/components/PortalSidebarHeaderLogo";
import { ResponsivePortalShell } from "@/app/components/ResponsivePortalShell";
import { authSessionQueryKey } from "@/hooks/use-auth-session";
import { logout, getMe, refresh, isAdminUser, isModeratorUser, isCompanyRegType, type AuthUser } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";
import { getElectionsStatus } from "@/lib/api";

function redirectForWrongRole(u: AuthUser): string {
  if (isAdminUser(u)) return "/admin/dashboard";
  if (isModeratorUser(u)) return "/moderator/dashboard";
  if (isCompanyRegType(u)) return "/company/dashboard";
  if (u.regType === "attendee") return "/attendee/dashboard";
  return "/";
}

function navActive(pathname: string, href: string): boolean {
  if (href === "/hotel-rooms") return pathname === "/hotel-rooms" || pathname.startsWith("/hotel-rooms/");
  if (href === "/member/support") return pathname === "/member/support" || pathname.startsWith("/member/support/");
  if (href === "/member/elections") return pathname === "/member/elections";
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
      if (u.regType !== "member") {
        window.location.replace(redirectForWrongRole(u));
        return;
      }
      setLoading(false);
      setAuthorized(true);
    }
    void run();
    return () => { cancelled = true; };
  }, [setUser, clearUser]);

  const { data: electionsStatus } = useQuery({
    queryKey: ["elections", "status"],
    queryFn: getElectionsStatus,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const votingActive = electionsStatus?.isActive ?? false;

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

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><p className="text-charcoal/60">Loading...</p></div>;
  }
  if (!authorized) {
    return <div className="flex h-screen items-center justify-center"><p className="text-charcoal/60">Redirecting…</p></div>;
  }

  return (
    <ResponsivePortalShell
      mobileTitle="Member Portal"
      sidebarClassName="border-r border-primary/10 bg-white"
      sidebar={
        <>
          <div className="border-b border-primary/10 px-4 py-5">
            <div className="flex items-center gap-3">
              <PortalSidebarHeaderLogo />
              <div className="min-w-0">
                <p className="text-sm font-bold text-charcoal leading-tight">ANPMP Lagos Member Portal</p>
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

            <Link href="/member/receipts" className={itemClass("/member/receipts")}>
              <span className="material-symbols-outlined">receipt_long</span>
              Receipts
            </Link>

            <Link href="/hotel-rooms" className={itemClass("/hotel-rooms")}>
              <span className="material-symbols-outlined">hotel</span>
              Hotel rooms
            </Link>

            {votingActive && (
              <Link href="/member/elections" className={itemClass("/member/elections")}>
                <span className="material-symbols-outlined">how_to_vote</span>
                Elections
              </Link>
            )}

            <Link href="/member/support" className={itemClass("/member/support")}>
              <span className="material-symbols-outlined">help</span>
              Support
            </Link>
          </nav>

          <div className="space-y-3 border-t border-primary/10 px-4 py-5">
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Member</p>
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
