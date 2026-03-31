"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/dashboard/booths", label: "Booth Management", icon: "storefront" },
  { href: "/admin/dashboard/registrations", label: "Registrations", icon: "group" },
  { href: "/admin/dashboard/guests", label: "Guests", icon: "record_voice_over" },
  { href: "/admin/dashboard/hotel-bookings", label: "Hotel Bookings", icon: "night_shelter" },
  { href: "/admin/dashboard/companies", label: "Companies", icon: "business" },
  { href: "/admin/dashboard/sponsorship-plans", label: "Sponsorship Plans", icon: "workspace_premium" },
  { href: "/admin/dashboard/marketing", label: "Marketing", icon: "campaign" },
  { href: "/admin/dashboard/media", label: "Media", icon: "perm_media" },
  { href: "/admin/dashboard/masterclasses", label: "Masterclasses", icon: "school" },
  { href: "/admin/dashboard/panels", label: "Panel Sessions", icon: "groups" },
  { href: "/admin/dashboard/presentations", label: "Presentations", icon: "co_present" },
  { href: "/admin/dashboard/support", label: "Support", icon: "support_agent" },
  { href: "/admin/dashboard/settings", label: "Settings", icon: "settings" },
];

export function AdminSidebar({
  variant = "desktop",
  className = "",
  onNavigate,
  id: sidebarId,
}: {
  variant?: "desktop" | "drawer";
  className?: string;
  /** Called when a nav link is activated (e.g. close mobile drawer). */
  onNavigate?: () => void;
  id?: string;
}) {
  const pathname = usePathname();
  const { user, clearUser } = useAuthStore();
  const [collapsed, setCollapsed] = useState(true);

  const expanded = variant === "drawer" ? true : !collapsed;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearUser();
      window.location.href = "/admin";
    }
  };

  const hoverHandlers =
    variant === "desktop"
      ? {
          onMouseEnter: () => setCollapsed(false),
          onMouseLeave: () => setCollapsed(true),
        }
      : {};

  return (
    <aside
      {...hoverHandlers}
      id={sidebarId}
      className={`flex min-h-0 shrink-0 flex-col overflow-x-hidden overflow-y-auto border-r border-primary/10 bg-white transition-[width] duration-200 dark:bg-background-dark-soft ${
        variant === "desktop" ? (collapsed ? "w-[72px]" : "w-64") : "w-[260px] max-w-[85vw]"
      } ${className}`}
    >
      <div className="flex min-w-0 items-center gap-3 p-4">
        <div className="shrink-0 rounded-full bg-primary/10 p-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-white">
            <span className="material-symbols-outlined text-[20px]">event_seat</span>
          </div>
        </div>
        {expanded ? (
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold leading-tight text-[#181112] dark:text-white">ANPMP Lagos Admin</h1>
            <p className="truncate text-xs font-medium text-primary">Conference 2026</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/admin/dashboard/support" && pathname.startsWith("/admin/dashboard/support/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-primary/5 hover:text-primary dark:text-white/50 dark:hover:bg-primary/10 dark:hover:text-primary"
              } ${expanded ? "" : "justify-center"}`}
              title={!expanded ? item.label : undefined}
            >
              <span
                className={`material-symbols-outlined shrink-0 text-[20px] ${isActive ? "text-white" : "text-slate-400 dark:text-white/40"}`}
              >
                {item.icon}
              </span>
              {expanded ? <span className="truncate text-sm font-medium">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-primary/10 p-4">
        {expanded ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/20">
              {user?.admin?.avatar ? (
                <Image
                  src={user.admin.avatar}
                  alt=""
                  width={32}
                  height={32}
                  className="size-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-[20px] text-primary">person</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#181112] dark:text-white">
                {user?.admin?.name ?? user?.email ?? "Admin"}
              </p>
              <p className="truncate text-[10px] text-slate-500 dark:text-white/50">
                {user?.admin?.adminType ?? "Admin"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1 text-slate-400 transition-colors hover:text-primary dark:text-white/40"
              title="Log out"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/20">
              {user?.admin?.avatar ? (
                <Image
                  src={user.admin.avatar}
                  alt=""
                  width={32}
                  height={32}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-[18px] text-primary">person</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1 text-slate-400 transition-colors hover:text-primary dark:text-white/40"
              title="Log out"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
