"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { getMe, refresh, type AuthUser } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";
import { AdminSidebar } from "./AdminSidebar";

function redirectPathForNonAdmin(regType: AuthUser["regType"]): string {
  if (regType === "company" || regType === "exhibitor" || regType === "sponsor")
    return "/company/dashboard";
  return "/";
}

/** Backend may set `regType: "admin"` and/or nest `admin` on the user. */
function isAdminUser(u: AuthUser): boolean {
  return u.regType === "admin" || u.admin != null;
}

function useMdUp(): boolean {
  const [mdUp, setMdUp] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setMdUp(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return mdUp;
}

/**
 * Single shell for /admin/dashboard/* — sidebar + auth gate.
 * Kept separate from `admin/layout.tsx` so the login route (/admin) stays unwrapped.
 */
export function AdminPortalShell({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useAuthStore();
  const pathname = usePathname();
  const sidebarId = useId();
  const mdUp = useMdUp();
  const [navOpen, setNavOpen] = useState(false);

  /** Gate UI on this — not on Zustand `user`, which can lag one frame behind `setUser`. */
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
          if (!cancelled) {
            clearUser();
            setLoading(false);
            window.location.replace("/admin");
          }
          return;
        }
      }
      if (cancelled) return;

      setUser(u);

      if (!isAdminUser(u)) {
        // Full navigation; keep loading until the page unloads (avoids a stuck "Redirecting" state).
        window.location.replace(redirectPathForNonAdmin(u.regType));
        return;
      }

      setLoading(false);
      setAuthorized(true);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [setUser, clearUser]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mdUp) setNavOpen(false);
  }, [mdUp]);

  useEffect(() => {
    if (mdUp || !navOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen, mdUp]);

  useEffect(() => {
    if (!navOpen || mdUp) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen, mdUp]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-[#181112]/60 dark:text-white/60">Loading...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-[#181112]/60 dark:text-white/60">Redirecting…</p>
      </div>
    );
  }

  const sidebarPositionClass = mdUp
    ? "relative h-full min-h-0"
    : `fixed inset-y-0 left-0 z-50 max-h-[100dvh] transition-transform duration-200 ease-out ${
        navOpen ? "translate-x-0" : "-translate-x-full"
      }`;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-background-light md:flex-row md:overflow-hidden dark:bg-background-dark">
      <div className="sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-primary/10 bg-white px-4 py-3 dark:border-border-dark dark:bg-background-dark-soft md:hidden">
        <button
          type="button"
          onClick={() => setNavOpen((o) => !o)}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[#181112] transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
          aria-expanded={navOpen}
          aria-controls={sidebarId}
          aria-label={navOpen ? "Close menu" : "Open menu"}
        >
          <span className="material-symbols-outlined text-[28px]">{navOpen ? "close" : "menu"}</span>
        </button>
        <span className="min-w-0 truncate text-sm font-bold text-[#181112] dark:text-white">Admin</span>
      </div>

      {navOpen && !mdUp ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <AdminSidebar
        id={sidebarId}
        variant={mdUp ? "desktop" : "drawer"}
        onNavigate={() => setNavOpen(false)}
        className={sidebarPositionClass}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
