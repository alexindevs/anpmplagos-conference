"use client";

import Image from "next/image";
import { Fragment, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  getAdminRegistrations,
  getAdminRegistrationsSummary,
  getAllAdminRegistrationsMerged,
  uploadBulkImport,
  getBulkImportJob,
  type AdminRegistrationRow,
  type AdminRegistrationsListResponse,
  type BulkImportJob,
} from "@/lib/api";
import { adminRegistrationAvatarUrl } from "@/lib/company-branding";

const PAGE_SIZE = 20;

const TYPE_FILTER_VALUES = [
  { value: "", label: "All types" },
  { value: "member", label: "Member" },
  { value: "attendee", label: "Attendee" },
  { value: "company", label: "Company" },
  { value: "speaker", label: "Speaker" },
  { value: "special_guest", label: "Special guest" },
] as const;

const STATUS_FILTER_VALUES = [
  { value: "", label: "All statuses" },
  { value: "registered", label: "Registered" },
  { value: "pending_payment", label: "Pending payment" },
  { value: "cancelled", label: "Cancelled" },
] as const;

function formatRegistrationType(type: string): string {
  const map: Record<string, string> = {
    member: "Member",
    attendee: "Attendee",
    company: "Company",
    speaker: "Speaker",
    special_guest: "Special guest",
  };
  if (map[type]) return map[type];
  return type
    .replaceAll("_", " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
}

function registrationStatusDisplay(status: string): { label: string; className: string } {
  switch (status) {
    case "registered":
      return {
        label: "Registered",
        className:
          "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary",
      };
    case "pending_payment":
      return {
        label: "Pending payment",
        className: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-slate-100 text-slate-700 dark:bg-background-dark-softer dark:text-white/80",
      };
    default:
      return {
        label: status.replaceAll("_", " ") || status,
        className: "bg-slate-100 text-slate-600 dark:bg-background-dark-softer dark:text-white/70",
      };
  }
}

function isProbablySameOriginOrAllowedForNextImage(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "res.cloudinary.com" || u.hostname === "lh3.googleusercontent.com";
  } catch {
    return false;
  }
}

export default function RegistrationsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const q = deferredSearch.trim().toLowerCase();
  const hasFilters = Boolean(typeFilter || statusFilter || q);

  // ── Bulk import modal state ──────────────────────────────────────────────
  const [showImport, setShowImport] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter, deferredSearch]);

  const { data: summary, isPending: summaryPending, isError: summaryError } = useQuery({
    queryKey: ["admin", "registrations", "summary"],
    queryFn: getAdminRegistrationsSummary,
  });

  const listQuery = useQuery({
    queryKey: hasFilters
      ? ["admin", "registrations", "filtered", typeFilter, statusFilter, q, page, PAGE_SIZE]
      : ["admin", "registrations", "list", page, PAGE_SIZE],
    queryFn: async (): Promise<AdminRegistrationsListResponse> => {
      if (!hasFilters) {
        return getAdminRegistrations({ page, limit: PAGE_SIZE });
      }
      const all = await getAllAdminRegistrationsMerged();
      const filtered = all.filter((row) => {
        if (typeFilter && row.type !== typeFilter) return false;
        if (statusFilter && row.status !== statusFilter) return false;
        if (q) {
          const hay = `${row.name} ${row.email}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);
      const safePage = Math.min(page, totalPages);
      const start = (safePage - 1) * PAGE_SIZE;
      return {
        items: filtered.slice(start, start + PAGE_SIZE),
        page: safePage,
        limit: PAGE_SIZE,
        total,
        totalPages,
      };
    },
  });

  const data = listQuery.data;
  const isLoading = listQuery.isPending;
  const isFetching = listQuery.isFetching;
  const isError = listQuery.isError;
  const listErr =
    listQuery.error instanceof ApiError
      ? (listQuery.error.body?.message as string) || listQuery.error.message
      : listQuery.error instanceof Error
        ? listQuery.error.message
        : null;

  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const displayPage = data?.page ?? Math.min(page, totalPages);

  const reportPage = data?.page;

  /** When the API clamps an out-of-range page, align local state after the request settles. */
  useEffect(() => {
    if (isFetching) return;
    if (reportPage != null && reportPage !== page) setPage(reportPage);
  }, [isFetching, reportPage, page]);

  const stats: { label: string; value: number; valueClass?: string }[] = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "Total registrations", value: summary.totalRegistrations },
      { label: "Members", value: summary.members, valueClass: "text-primary" },
      { label: "Attendees", value: summary.attendees, valueClass: "text-secondary" },
      { label: "Companies", value: summary.companies, valueClass: "text-secondary" },
      { label: "Speakers", value: summary.speakers },
      { label: "Special guests", value: summary.specialGuests },
    ];
  }, [summary]);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-slate-800 dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-charcoal dark:text-slate-100">
              Registrations
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View conference registrations — members, attendees, companies, and other non-admin accounts
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-secondary/90"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Import CSV
          </button>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        {summaryError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            Unable to load registration summary.
          </div>
        )}
        {isError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {listErr || "Unable to load registrations."}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 w-full flex-1 sm:min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border-none bg-background-light py-2 pl-10 pr-4 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white"
            />
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full min-w-0 cursor-pointer rounded-lg border-none bg-background-light px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white sm:w-auto"
            >
              {TYPE_FILTER_VALUES.map((o) => (
                <option key={o.value || "all-types"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full min-w-0 cursor-pointer rounded-lg border-none bg-background-light px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white sm:w-auto"
            >
              {STATUS_FILTER_VALUES.map((o) => (
                <option key={o.value || "all-statuses"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <p className="mb-4 text-xs text-slate-500 dark:text-white/45">
            Search and type/status filters load the full list in the browser, then narrow results. Use clear filters for
            faster paging on large datasets.
          </p>
        )}

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {summaryPending
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft"
                >
                  <div className="mb-2 h-3 w-24 rounded bg-slate-200 dark:bg-white/10" />
                  <div className="h-8 w-16 rounded bg-slate-200 dark:bg-white/10" />
                </div>
              ))
            : stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
                    {s.label}
                  </p>
                  <p
                    className={`mt-1 text-2xl font-black text-charcoal dark:text-white ${s.valueClass ?? ""}`}
                  >
                    {s.value.toLocaleString("en-NG")}
                  </p>
                </div>
              ))}
        </div>

        {showImport && (
          <BulkImportModal
            onClose={() => {
              setShowImport(false);
              // Refresh list + summary after a completed import
              void queryClient.invalidateQueries({ queryKey: ["admin", "registrations"] });
            }}
          />
        )}

        <div className="overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 dark:border-border-dark dark:bg-background-dark-softer">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Registrant
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Profile
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 dark:divide-border-dark">
                {isLoading && (
                  <tr>
                    <td className="px-6 py-8 text-sm text-slate-500 dark:text-white/50" colSpan={5}>
                      Loading registrations…
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && (data?.items?.length ?? 0) === 0 && (
                  <tr>
                    <td className="px-6 py-10 text-center text-sm text-slate-500 dark:text-white/50" colSpan={5}>
                      No registrations match the current filters.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !isError &&
                  (data?.items ?? []).map((row: AdminRegistrationRow) => (
                    <RegistrationTableRow key={row.userId} row={row} />
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 bg-primary/5 px-6 py-4 dark:bg-background-dark-softer sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-white/50">
              {data && data.total > 0 ? (
                <>
                  Showing{" "}
                  <span className="font-bold text-slate-700 dark:text-white/70">
                    {(displayPage - 1) * PAGE_SIZE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-slate-700 dark:text-white/70">
                    {Math.min(displayPage * PAGE_SIZE, data.total)}
                  </span>{" "}
                  of <span className="font-bold text-slate-700 dark:text-white/70">{data.total}</span> entries
                </>
              ) : (
                <>No entries</>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded p-1 transition-colors hover:bg-white disabled:opacity-50 dark:hover:bg-background-dark-soft dark:disabled:opacity-30"
                disabled={displayPage <= 1 || isLoading || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="text-sm font-medium text-slate-600 dark:text-white/60">
                Page {displayPage} of {totalPages}
              </span>
              <button
                type="button"
                className="rounded p-1 transition-colors hover:bg-white disabled:opacity-50 dark:hover:bg-background-dark-soft dark:disabled:opacity-30"
                disabled={displayPage >= totalPages || isLoading || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RegistrationTableRow({ row }: { row: AdminRegistrationRow }) {
  const [expanded, setExpanded] = useState(false);
  const status = registrationStatusDisplay(row.status);
  const registered = new Date(row.registeredAt);
  const dateStr = Number.isFinite(registered.getTime())
    ? registered.toLocaleDateString("en-NG", { dateStyle: "medium" })
    : "—";
  const avatarUrl = adminRegistrationAvatarUrl(row);
  const hasMemberDetails = row.type === "member" && row.memberDetails != null;
  const hasAttendeeDetails = row.type === "attendee" && row.attendeeDetails != null;
  const hasDetails = hasMemberDetails || hasAttendeeDetails;

  return (
    <Fragment>
      <tr className="transition-colors hover:bg-primary/5 dark:hover:bg-background-dark-softer">
        <td className="px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="relative mt-0.5 size-10 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-background-dark-softer">
              {avatarUrl ? (
                isProbablySameOriginOrAllowedForNextImage(avatarUrl) ? (
                  <Image src={avatarUrl} alt="" fill className="object-cover" sizes="40px" unoptimized={false} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="size-full object-cover" />
                )
              ) : (
                <span className="flex size-full items-center justify-center text-slate-400 dark:text-white/40">
                  <span className="material-symbols-outlined text-[22px]">person</span>
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-charcoal dark:text-white">{row.name}</p>
              <p className="text-xs text-slate-500 dark:text-white/50">{row.email}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-charcoal dark:text-white/90">{formatRegistrationType(row.type)}</td>
        <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/70">{dateStr}</td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          {hasDetails ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-background-dark-softer dark:text-white/90 dark:hover:bg-background-dark"
            >
              View
            </button>
          ) : row.profileUrl ? (
            <a
              href={row.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-background-dark-softer dark:text-white/90 dark:hover:bg-background-dark"
            >
              View
            </a>
          ) : (
            <span
              className="inline-block rounded-lg bg-slate-50 px-3 py-1 text-xs font-bold text-slate-400 dark:bg-background-dark-softer dark:text-white/35"
              title="No public profile URL for this registration"
            >
              —
            </span>
          )}
        </td>
      </tr>
      {hasMemberDetails && expanded && row.memberDetails && (
        <tr className="bg-primary/3 dark:bg-background-dark-softer/60">
          <td colSpan={5} className="px-6 py-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
              <MemberDetailCell label="Phone" value={row.memberDetails.phone} />
              <MemberDetailCell label="Hospital / Org" value={row.memberDetails.hospitalOrg} />
              <MemberDetailCell label="Specialty" value={row.memberDetails.primarySpecialty} />
              <MemberDetailCell label="Org Address" value={row.memberDetails.organizationAddress} />
              <MemberDetailCell label="Zone" value={row.memberDetails.zone || "—"} />
              <MemberDetailCell label="State" value={row.memberDetails.state || "—"} />
              <MemberDetailCell label="ANPMP ID" value={row.memberDetails.anpmpId || "—"} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-white/35">Dues Paid</p>
                <span className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${row.memberDetails.duesPaid ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-500 dark:bg-background-dark-softer dark:text-white/40"}`}>
                  <span className="material-symbols-outlined text-[13px]">{row.memberDetails.duesPaid ? "check_circle" : "cancel"}</span>
                  {row.memberDetails.duesPaid ? "Paid" : "Unpaid"}
                </span>
              </div>
              <MemberDetailCell
                label="Spouse"
                value={
                  row.memberDetails.hasSpouse
                    ? [row.memberDetails.spouseName, row.memberDetails.spouseEmail, row.memberDetails.spousePhone]
                        .filter(Boolean)
                        .join(" · ") || "Yes"
                    : "No"
                }
              />
            </div>
          </td>
        </tr>
      )}
      {hasAttendeeDetails && expanded && row.attendeeDetails && (
        <tr className="bg-primary/3 dark:bg-background-dark-softer/60">
          <td colSpan={5} className="px-6 py-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
              <MemberDetailCell label="Phone" value={row.attendeeDetails.phone} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-white/35">Medical Field</p>
                <p className="mt-0.5 text-sm text-charcoal dark:text-white/80">
                  {row.attendeeDetails.inMedicalField ? "Yes" : "No"}
                </p>
              </div>
              {row.attendeeDetails.primarySpecialty && (
                <MemberDetailCell label="Specialty" value={row.attendeeDetails.primarySpecialty} />
              )}
              {row.attendeeDetails.hospitalOrg && (
                <MemberDetailCell label="Hospital / Org" value={row.attendeeDetails.hospitalOrg} />
              )}
              {row.attendeeDetails.occupation && (
                <MemberDetailCell label="Occupation" value={row.attendeeDetails.occupation} />
              )}
              {row.attendeeDetails.bio && (
                <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-white/35">Bio</p>
                  <p className="mt-0.5 text-sm text-charcoal dark:text-white/80">{row.attendeeDetails.bio}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}

function MemberDetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-white/35">{label}</p>
      <p className="mt-0.5 text-sm text-charcoal dark:text-white/80">{value || "—"}</p>
    </div>
  );
}

// ─── Bulk Import Modal ───────────────────────────────────────────────────────

function BulkImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [job, setJob] = useState<BulkImportJob | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDone = job?.status === "done" || job?.status === "failed";

  // Poll for job status
  useEffect(() => {
    if (!job || isDone) return;
    pollRef.current = setInterval(async () => {
      try {
        const updated = await getBulkImportJob(job.id);
        setJob(updated);
        if (updated.status === "done" || updated.status === "failed") {
          clearInterval(pollRef.current!);
        }
      } catch {
        // swallow — keep polling
      }
    }, 2000);
    return () => clearInterval(pollRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, isDone]);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { jobId } = await uploadBulkImport(file);
      const initialJob = await getBulkImportJob(jobId);
      setJob(initialJob);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setUploadError(null);
    }
  }

  const statusLabel: Record<string, string> = {
    pending: "Queued…",
    processing: "Processing…",
    done: "Complete",
    failed: "Failed",
  };

  const progressPct =
    job && job.total > 0
      ? Math.round(((job.created + job.skipped) / job.total) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[80%] md:max-w-[50%] rounded-2xl bg-white shadow-2xl dark:bg-background-dark-soft">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-border-dark">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-secondary">upload_file</span>
            <h2 className="text-base font-bold text-charcoal dark:text-white">Bulk Member Import</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-background-dark-softer dark:hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {!job && (
            <>
              <p className="text-sm text-slate-600 dark:text-white/70">
                Upload a CSV exported from your zone&apos;s registration sheet. The platform will create
                member accounts and email each person a link to set their password.
              </p>

              {/* File picker */}
              <div
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 transition-colors hover:border-secondary/50 hover:bg-secondary/5 dark:border-border-dark dark:bg-background-dark-softer dark:hover:border-secondary/40"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined text-[36px] text-slate-300 dark:text-white/20">
                  description
                </span>
                {file ? (
                  <p className="text-sm font-medium text-slatecoal dark:text-white">{file.name}</p>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-white/50">
                    Click to select a <span className="font-bold">.csv</span> file
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {uploadError && (
                <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  {uploadError}
                </p>
              )}
            </>
          )}

          {/* Job progress */}
          {job && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-charcoal dark:text-white">{job.filename}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    job.status === "done"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : job.status === "failed"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {statusLabel[job.status] ?? job.status}
                </span>
              </div>

              {/* Progress bar */}
              {!isDone && (
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-background-dark-softer">
                  <div
                    className="h-full rounded-full bg-secondary transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}

              {/* Counts */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-slate-50 py-3 dark:bg-background-dark-softer">
                  <p className="text-2xl font-black text-charcoal dark:text-white">{job.total}</p>
                  <p className="text-xs text-slate-400 dark:text-white/35">Total rows</p>
                </div>
                <div className="rounded-lg bg-green-50 py-3 dark:bg-green-900/20">
                  <p className="text-2xl font-black text-green-700 dark:text-green-400">{job.created}</p>
                  <p className="text-xs text-green-600 dark:text-green-500/70">Created</p>
                </div>
                <div className="rounded-lg bg-slate-50 py-3 dark:bg-background-dark-softer">
                  <p className="text-2xl font-black text-slate-500 dark:text-white/60">{job.skipped}</p>
                  <p className="text-xs text-slate-400 dark:text-white/35">Skipped</p>
                </div>
              </div>

              {/* Errors */}
              {job.errors.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowErrors((v) => !v)}
                    className="flex items-center gap-1 text-xs font-medium text-amber-600 underline dark:text-amber-400"
                  >
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    {job.errors.length} warning{job.errors.length !== 1 ? "s" : ""}
                    <span className="material-symbols-outlined text-[14px]">
                      {showErrors ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  {showErrors && (
                    <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
                      {job.errors.map((e, i) => (
                        <li key={i} className="text-xs text-amber-800 dark:text-amber-300">
                          {e}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {!isDone && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Please keep this dialog open until the import finishes.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-border-dark">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-border-dark dark:bg-background-dark-softer dark:text-white/80 dark:hover:bg-background-dark"
          >
            {isDone ? "Close" : "Cancel"}
          </button>
          {!job && (
            <button
              type="button"
              disabled={!file || uploading}
              onClick={handleUpload}
              className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-secondary/90 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Uploading…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Upload &amp; Import
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
