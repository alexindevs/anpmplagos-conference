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
  if (isCompanyRegType(u)) return "/company/dashboard";
  if (u.regType === "member") return "/member/dashboard";
  if (u.regType === "attendee") return "/attendee/dashboard";
  return "/";
}

function navActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function ModeratorPortalShell({
  children,
  moderatorName,
}: {
  children: React.ReactNode;
  moderatorName: string;
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
      if (!isModeratorUser(u)) {
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
      ? "w-full flex items-center gap-3 rounded-lg bg-secondary px-3 py-2 text-white font-bold"
      : "w-full flex items-center gap-3 rounded-lg hover:bg-secondary/5 px-3 py-2 text-slate-700 font-semibold";

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><p className="text-charcoal/60">Loading...</p></div>;
  }
  if (!authorized) {
    return <div className="flex h-screen items-center justify-center"><p className="text-charcoal/60">Redirecting…</p></div>;
  }

  return (
    <ResponsivePortalShell
      mobileTitle="Moderator Portal"
      sidebarClassName="border-r border-secondary/10 bg-white"
      sidebar={
        <>
          <div className="border-b border-secondary/10 px-4 py-5">
            <div className="flex items-center gap-3">
              <PortalSidebarHeaderLogo />
              <div className="min-w-0">
                <p className="text-sm font-bold text-charcoal leading-tight">Moderator Portal</p>
                <p className="text-xs text-slate-500 truncate">ANPMP Lagos Conference 2026</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-4">
            <Link href="/moderator/dashboard" className={itemClass("/moderator/dashboard")}>
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
          </nav>

          <div className="space-y-3 border-t border-secondary/10 px-4 py-5">
            <div className="rounded-xl border border-secondary/10 bg-secondary/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">Moderator</p>
              <p className="text-sm font-mono text-charcoal mt-1 truncate">{moderatorName || "—"}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-secondary/30 hover:bg-secondary/5 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-60"
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
