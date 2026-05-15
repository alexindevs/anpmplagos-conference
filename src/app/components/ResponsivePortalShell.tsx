"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState, type ReactNode } from "react";

type ResponsivePortalShellProps = {
  mobileTitle: string;
  sidebar: ReactNode;
  children: ReactNode;
  /** Applied to the main content column (e.g. gradient background). */
  mainClassName?: string;
  /** Applied to the mobile top bar (e.g. border accent). */
  mobileBarClassName?: string;
  /** Merged onto the sidebar panel (borders, background). */
  sidebarClassName?: string;
};

export function ResponsivePortalShell({
  mobileTitle,
  sidebar,
  children,
  mainClassName = "",
  mobileBarClassName = "border-b border-slate-200 bg-white",
  sidebarClassName = "",
}: ResponsivePortalShellProps) {
  const pathname = usePathname();
  const navId = useId();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setNavOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!navOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  const closeNav = useCallback(() => setNavOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col bg-background-light md:flex-row">
      <div
        className={`sticky top-0 z-30 flex shrink-0 items-center gap-3 px-4 py-3 md:hidden ${mobileBarClassName}`}
      >
        <button
          type="button"
          onClick={() => setNavOpen((o) => !o)}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-charcoal transition-colors hover:bg-slate-100"
          aria-expanded={navOpen}
          aria-controls={navId}
          aria-label={navOpen ? "Close menu" : "Open menu"}
        >
          <span className="material-symbols-outlined text-[28px]">{navOpen ? "close" : "menu"}</span>
        </button>
        <span className="min-w-0 truncate text-sm font-bold text-charcoal">{mobileTitle}</span>
      </div>

      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={closeNav}
        />
      ) : null}

      <aside
        id={navId}
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] max-w-[85vw] min-h-0 flex-col overflow-y-auto transition-transform duration-200 ease-out md:relative md:z-auto md:max-w-none md:shrink-0 md:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${sidebarClassName}`}
      >
        {sidebar}
      </aside>

      <div className={`flex min-w-0 flex-1 flex-col ${mainClassName}`}>{children}</div>
    </div>
  );
}
