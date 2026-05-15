"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  formatKoboToNaira,
  getAdminDashboardSummary,
  type AdminDashboardSummaryBooth,
} from "@/lib/api";
import { adminRegistrationAvatarUrl } from "@/lib/company-branding";
import { ThemeToggle } from "./components/ThemeToggle";
import {
  BoothCompanyHoverPopover,
  useBoothCompanyPopover,
} from "./components/BoothCompanyHoverPopover";

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.floor((now - then) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-NG", { dateStyle: "medium" });
}

function boothSlotState(b: AdminDashboardSummaryBooth): "occupied" | "reserved" | "available" {
  if (b.isTaken) return "occupied";
  if (b.isReserved) return "reserved";
  return "available";
}

function boothHoverLabel(b: AdminDashboardSummaryBooth): string | undefined {
  if (!b.isTaken) return undefined;
  if (b.takenBy) {
    if (b.takenBy.kind === "exhibitor") return `Exhibitor: ${b.takenBy.name}`;
    if (b.takenBy.kind === "sponsor") return `Sponsor: ${b.takenBy.name}`;
    return `Company: ${b.takenBy.name}`;
  }
  return "Occupied";
}

/** Display order: headliner → platinum → gold → silver → bronze → other tier labels → no tier */
const BOOTH_TIER_ORDER = ["headliner", "platinum", "gold", "silver", "bronze"] as const;

function normalizedBoothTier(tier: string | null | undefined): string {
  return tier?.trim().toLowerCase() ?? "";
}

/** 0–4 = known tiers, 5 = non-empty unknown tier, 6 = missing tier */
function boothTierSortGroup(tier: string | null | undefined): number {
  const t = normalizedBoothTier(tier);
  if (!t) return 6;
  const idx = (BOOTH_TIER_ORDER as readonly string[]).indexOf(t);
  return idx >= 0 ? idx : 5;
}

function boothCreatedAtMs(b: AdminDashboardSummaryBooth): number {
  if (!b.createdAt?.trim()) return Number.POSITIVE_INFINITY;
  const ms = new Date(b.createdAt).getTime();
  return Number.isFinite(ms) ? ms : Number.POSITIVE_INFINITY;
}

function compareAdminDashboardBooths(a: AdminDashboardSummaryBooth, b: AdminDashboardSummaryBooth): number {
  const ga = boothTierSortGroup(a.tier);
  const gb = boothTierSortGroup(b.tier);
  if (ga !== gb) return ga - gb;
  if (ga === 5) {
    const tierCmp = normalizedBoothTier(a.tier).localeCompare(normalizedBoothTier(b.tier));
    if (tierCmp !== 0) return tierCmp;
  }
  const da = boothCreatedAtMs(a);
  const db = boothCreatedAtMs(b);
  if (da !== db) return da - db;
  return a.id.localeCompare(b.id);
}

type AdminDashboardStat = {
  label: string;
  value: string;
  trend?: string;
  sub?: string;
  icon: string;
  color: "primary" | "secondary";
};

function StatCard({
  label,
  value,
  trend,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  trend?: string;
  sub?: string;
  icon: string;
  color: "primary" | "secondary";
}) {
  const bgMap = {
    primary: "bg-primary/10",
    secondary: "bg-secondary/10",
  };
  const textMap = {
    primary: "text-primary",
    secondary: "text-secondary",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-lg p-2 ${bgMap[color]} ${textMap[color]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend && (
          <span className="flex items-center text-sm font-bold text-secondary">
            {trend}
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
          </span>
        )}
        {sub && <span className="text-sm font-medium text-slate-400 dark:text-white/40">{sub}</span>}
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-white/50">{label}</p>
      <h3 className="text-2xl font-bold text-charcoal dark:text-white">{value}</h3>
    </div>
  );
}

export default function AdminDashboardPage() {
  const boothPopover = useBoothCompanyPopover();

  const { data: summary, isPending } = useQuery({
    queryKey: ["admin", "dashboard", "summary"],
    queryFn: getAdminDashboardSummary,
  });

  const stats = useMemo((): AdminDashboardStat[] => {
    return [
      {
        label: "Member Tickets",
        value: String(summary?.registrations.members ?? 0),
        trend: undefined,
        icon: "confirmation_number",
        color: "primary",
      },
      {
        label: "Attendee Tickets",
        value: String(summary?.registrations.attendees ?? 0),
        trend: undefined,
        icon: "local_activity",
        color: "secondary",
      },
      {
        label: "Company signups",
        value: String(
          summary?.registrations.companies ??
            summary?.registrations.exhibitors ??
            summary?.registrations.sponsors ??
            0
        ),
        trend: undefined,
        icon: "partner_exchange",
        color: "secondary",
      },
      {
        label: "Sponsorship Bundles",
        value: formatKoboToNaira(
          summary?.sponsorships.recordedSponsorshipPaidTotalKobo ?? summary?.sponsorships.totalPledged
        ),
        icon: "payments",
        color: "primary",
      },
    ];
  }, [summary]);

  const recent = summary?.recentRegistrations ?? [];

  const boothSlots = useMemo(() => {
    const all = summary?.booths?.all ?? [];
    return [...all].sort(compareAdminDashboardBooths);
  }, [summary?.booths?.all]);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-charcoal dark:text-white sm:text-3xl">
              Conference Overview
            </h2>
            <p className="text-slate-500 dark:text-white/50">Overview of the exhibition floor and recent registrations.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <div className="relative hidden w-full sm:w-auto md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search…"
                className="w-full min-w-0 rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark-softer dark:text-white sm:w-64"
              />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="bg-background-light p-4 dark:bg-background-dark sm:p-6 lg:p-8">
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={isPending ? "—" : s.value}
              trend={s.trend}
              sub={s.sub}
              icon={s.icon}
              color={s.color}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-charcoal dark:text-white">Booth floor plan</h3>
              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-secondary" />
                  <span className="text-slate-500 dark:text-white/50">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-amber-500" />
                  <span className="text-slate-500 dark:text-white/50">Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-primary" />
                  <span className="text-slate-500 dark:text-white/50">Occupied</span>
                </div>
              </div>
            </div>
            <div className="relative min-h-[200px] rounded-lg bg-slate-50 p-6 dark:bg-background-dark-softer">
              {isPending ? (
                <p className="text-sm text-slate-500 dark:text-white/50">Loading booths…</p>
              ) : boothSlots.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-white/50">No booth slots yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {boothSlots.map((b) => {
                    const state = boothSlotState(b);
                    const borderBg =
                      state === "occupied"
                        ? "border-primary bg-primary/20 text-primary hover:bg-primary/30"
                        : state === "reserved"
                          ? "border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-200 hover:bg-amber-500/25"
                          : "border-dashed border-secondary bg-secondary/20 text-secondary hover:bg-secondary/30";
                    const hover = boothHoverLabel(b);
                    return (
                      <div
                        key={b.id}
                        title={state === "occupied" && b.takenBy ? `View ${b.takenBy.name}` : hover}
                        className={`group relative aspect-square overflow-visible flex flex-col items-center justify-center rounded-lg border-2 transition-colors ${borderBg} ${
                          state === "occupied" && b.takenBy ? "cursor-pointer" : "cursor-default"
                        }`}
                        onMouseEnter={(e) => {
                          if (state === "occupied" && b.takenBy) {
                            boothPopover.open(b, e.currentTarget.getBoundingClientRect());
                          }
                        }}
                        onMouseLeave={boothPopover.scheduleClose}
                      >
                        {b.boothImage ? (
                          <div className="relative mb-1 size-10 overflow-hidden rounded-md">
                            <Image
                              src={b.boothImage}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : null}
                        <span className="text-center text-[10px] font-bold leading-tight">{b.name}</span>
                        {b.tier ? (
                          <span className="mt-0.5 text-[8px] font-semibold uppercase text-slate-500 dark:text-white/50">
                            {b.tier}
                          </span>
                        ) : null}
                        <span className="material-symbols-outlined mt-0.5 text-[16px]">
                          {state === "occupied"
                            ? "verified"
                            : state === "reserved"
                              ? "bookmark"
                              : "add_circle"}
                        </span>
                        {state === "occupied" && hover ? (
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max max-w-[min(220px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg bg-[#181112] px-2.5 py-1.5 text-center text-[10px] font-medium leading-snug text-white shadow-lg group-hover:block dark:bg-white dark:text-charcoal">
                            {hover}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <h3 className="mb-6 text-lg font-bold text-charcoal dark:text-white">Recent Registrations</h3>
            <div className="flex-1 space-y-6">
              {isPending ? (
                <p className="text-sm text-slate-500 dark:text-white/50">Loading…</p>
              ) : recent.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-white/50">No recent sign-ups yet.</p>
              ) : (
                recent.map((r) => {
                  const avatarUrl = adminRegistrationAvatarUrl({
                    type: r.regType,
                    profileImage: r.profilePicture,
                    logo: r.logo,
                  });
                  return (
                  <div key={`${r.userId}-${r.createdAt}`} className="flex gap-4">
                    <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-background-dark-softer">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 dark:text-white/40">person</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-charcoal dark:text-white">{r.name}</p>
                      <p className="text-xs text-slate-500 dark:text-white/50">
                        {r.regTypeLabel} • {formatRelativeTime(r.createdAt)}
                      </p>
                    </div>
                    <span className="material-symbols-outlined shrink-0 text-[20px] text-secondary">check_circle</span>
                  </div>
                  );
                })
              )}
            </div>
            <Link
              href="/admin/dashboard/registrations"
              className="mt-6 w-full rounded-lg border border-slate-200 py-3 text-center text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-border-dark dark:text-white/50 dark:hover:bg-background-dark"
            >
              View All Activity
            </Link>
          </div>
        </div>
      </div>

      <BoothCompanyHoverPopover
        target={boothPopover.target}
        onPopoverEnter={boothPopover.cancelClose}
        onPopoverLeave={boothPopover.scheduleClose}
      />
    </>
  );
}
