"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  formatKoboToNaira,
  getAdminExhibitor,
  type AdminDashboardSummaryBooth,
} from "@/lib/api";

const LEAVE_MS = 220;

export function useBoothCompanyPopover() {
  const [target, setTarget] = useState<{
    booth: AdminDashboardSummaryBooth;
    rect: DOMRect;
  } | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const open = useCallback(
    (booth: AdminDashboardSummaryBooth, rect: DOMRect) => {
      cancelClose();
      setTarget({ booth, rect });
    },
    [cancelClose]
  );

  const scheduleClose = useCallback(() => {
    cancelClose();
    leaveTimer.current = setTimeout(() => setTarget(null), LEAVE_MS);
  }, [cancelClose]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  return { target, open, scheduleClose, cancelClose };
}

function companyKindLabel(kind?: string): string {
  if (kind === "exhibitor") return "Exhibitor";
  if (kind === "sponsor") return "Sponsor";
  if (kind === "company") return "Company";
  return "Company";
}

export function BoothCompanyHoverPopover({
  target,
  onPopoverEnter,
  onPopoverLeave,
}: {
  target: { booth: AdminDashboardSummaryBooth; rect: DOMRect } | null;
  onPopoverEnter: () => void;
  onPopoverLeave: () => void;
}) {
  const companyId = target?.booth.takenBy?.id ?? null;

  const { data, isPending, isError } = useQuery({
    queryKey: ["admin", "company", "hover-detail", companyId],
    queryFn: () => getAdminExhibitor(companyId!),
    enabled: Boolean(companyId),
    staleTime: 60_000,
  });

  if (!target?.booth.takenBy || typeof document === "undefined") {
    return null;
  }

  const { rect, booth } = target;
  const tb = booth.takenBy!;
  const cardWidth = 320;
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - cardWidth - 8));
  const topBelow = rect.bottom + 8;
  const spaceBelow = window.innerHeight - topBelow - 16;
  const showAbove = spaceBelow < 160 && rect.top > 200;
  const top = showAbove ? Math.max(8, rect.top - 8 - 320) : topBelow;
  const maxH = Math.min(420, Math.max(120, window.innerHeight - top - 16));

  const name = data?.companyName ?? tb.name;
  const slug = (data?.slug ?? tb.slug)?.trim() || null;

  const panel = (
    <div
      role="dialog"
      aria-label="Company details"
      className="fixed z-[300] w-[min(320px,calc(100vw-16px))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-left shadow-2xl dark:border-border-dark dark:bg-background-dark-soft"
      style={{
        left,
        top,
        maxHeight: maxH,
      }}
      onMouseEnter={onPopoverEnter}
      onMouseLeave={onPopoverLeave}
    >
      <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-100 pb-2 dark:border-border-dark">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Booth {booth.name}
            {booth.size ? ` · ${booth.size}` : ""}
          </p>
          <h4 className="mt-1 text-sm font-black leading-tight text-[#181112] dark:text-white">{name}</h4>
          <p className="text-[10px] text-slate-500 dark:text-white/50">
            {companyKindLabel(tb.kind)} · ID <span className="font-mono">{tb.id.slice(0, 8)}…</span>
          </p>
        </div>
        {slug ? (
          <Link
            href={`/company/${encodeURIComponent(slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/20"
          >
            Public profile
          </Link>
        ) : null}
      </div>

      {isPending && (
        <div className="space-y-2 py-2">
          <div className="h-3 w-[75%] animate-pulse rounded bg-slate-200 dark:bg-background-dark-softer" />
          <div className="h-3 w-[50%] animate-pulse rounded bg-slate-200 dark:bg-background-dark-softer" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-background-dark-softer" />
        </div>
      )}

      {isError && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Could not load full profile. Summary: <strong>{tb.name}</strong>
          {tb.slug?.trim() ? (
            <>
              {" "}
              ·{" "}
              <Link
                href={`/company/${encodeURIComponent(tb.slug.trim())}`}
                className="underline"
                target="_blank"
              >
                View listing
              </Link>
            </>
          ) : null}
        </p>
      )}

      {!isPending && !isError && data && (
        <dl className="space-y-2 text-xs">
          {data.tagline?.trim() ? (
            <div>
              <dt className="font-bold text-slate-500 dark:text-white/50">Tagline</dt>
              <dd className="text-[#181112] dark:text-white/90">{data.tagline}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-bold text-slate-500 dark:text-white/50">Contact email</dt>
            <dd className="break-all text-[#181112] dark:text-white/90">{data.contactEmail || "—"}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-500 dark:text-white/50">Primary contact</dt>
            <dd className="text-[#181112] dark:text-white/90">
              {data.primaryContactName || "—"}
              {data.primaryContactPhone?.trim() ? (
                <span className="block text-slate-600 dark:text-white/70">{data.primaryContactPhone}</span>
              ) : null}
            </dd>
          </div>
          {data.website?.trim() ? (
            <div>
              <dt className="font-bold text-slate-500 dark:text-white/50">Website</dt>
              <dd className="break-all text-primary">
                <a href={data.website.startsWith("http") ? data.website : `https://${data.website}`} target="_blank" rel="noopener noreferrer">
                  {data.website}
                </a>
              </dd>
            </div>
          ) : null}
          {data.tier ? (
            <div>
              <dt className="font-bold text-slate-500 dark:text-white/50">Tier</dt>
              <dd className="text-[#181112] dark:text-white/90">{String(data.tier)}</dd>
            </div>
          ) : null}
          {data.status ? (
            <div>
              <dt className="font-bold text-slate-500 dark:text-white/50">Status</dt>
              <dd className="text-[#181112] dark:text-white/90">{data.status}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-bold text-slate-500 dark:text-white/50">Booth price (slot)</dt>
            <dd className="font-semibold text-[#181112] dark:text-white">{formatKoboToNaira(booth.price)}</dd>
          </div>
          {data.user?.email ? (
            <div>
              <dt className="font-bold text-slate-500 dark:text-white/50">Account email</dt>
              <dd className="break-all text-[#181112] dark:text-white/90">{data.user.email}</dd>
            </div>
          ) : null}
        </dl>
      )}

      <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-border-dark dark:text-white/40">
        Hover away to close · Data from admin company profile
      </p>
    </div>
  );

  return createPortal(panel, document.body);
}
