"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { deleteAdminAccount, logout } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ─── Export helpers ─────────────────────────────────────────────────────────

type ExportDataset =
  | "payments"
  | "companies"
  | "hotel-rooms"
  | "members"
  | "attendees";

const EXPORT_OPTIONS: {
  id: ExportDataset;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "payments",
    label: "Payments",
    description: "All payment records with status and amounts",
    icon: "payments",
  },
  {
    id: "companies",
    label: "Companies",
    description: "Registered companies with contact and sponsorship info",
    icon: "business",
  },
  {
    id: "hotel-rooms",
    label: "Hotel Bookings",
    description: "Booked rooms grouped by hotel with guest emails",
    icon: "hotel",
  },
  {
    id: "members",
    label: "Paid Members",
    description: "Registered members with ANPMP IDs and contact details",
    icon: "badge",
  },
  {
    id: "attendees",
    label: "Paid Attendees",
    description: "Registered attendees with specialty and occupation",
    icon: "person",
  },
];

async function downloadExport(
  dataset: ExportDataset,
  format: "pdf" | "csv"
): Promise<void> {
  const url = `${API_BASE}/api/admin/export/${dataset}/${format}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Export failed (${res.status})`
    );
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const ts = new Date().toISOString().slice(0, 16).replace("T", "-").replace(/:/g, "-");
  a.download = `${dataset}-${ts}.${format}`;
  a.href = objectUrl;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

// ─── Export Modal ────────────────────────────────────────────────────────────

function ExportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<ExportDataset | null>(null);
  const [downloading, setDownloading] = useState<"pdf" | "csv" | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setDownloading(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !downloading) {
        if (selected) setSelected(null);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, downloading, selected, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (downloading) return;
    if (e.target === overlayRef.current) onClose();
  };

  const handleDownload = async (format: "pdf" | "csv") => {
    if (!selected || downloading) return;
    setDownloading(format);
    try {
      await downloadExport(selected, format);
      toast.success(`${format.toUpperCase()} downloaded.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed.";
      toast.error(msg);
    } finally {
      setDownloading(null);
    }
  };

  if (!open) return null;

  const selectedOption = EXPORT_OPTIONS.find((o) => o.id === selected);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-[80%] rounded-2xl bg-white shadow-xl dark:bg-background-dark-soft md:max-w-[50%]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            {selected && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                disabled={!!downloading}
                className="mr-1 flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-charcoal disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
              </button>
            )}
            <h3 className="text-base font-bold text-charcoal dark:text-white">
              {selected ? "Choose format" : "Export data"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!!downloading}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-charcoal disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!selected ? (
            /* Step 1 — pick dataset */
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {EXPORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelected(opt.id)}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 dark:border-white/10 dark:bg-white/5 dark:hover:border-primary/40 dark:hover:bg-primary/10"
                >
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-[22px] text-primary">
                    {opt.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-charcoal dark:text-white">
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
                      {opt.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Step 2 — pick format */
            <div>
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
                <span className="material-symbols-outlined text-[22px] text-primary">
                  {selectedOption!.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-charcoal dark:text-white">
                    {selectedOption!.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-white/50">
                    {selectedOption!.description}
                  </p>
                </div>
              </div>

              <p className="mb-3 text-sm text-slate-500 dark:text-white/60">
                Choose a format to download:
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDownload("pdf")}
                  disabled={!!downloading}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:hover:border-primary/40 dark:hover:bg-primary/10"
                >
                  <span className="material-symbols-outlined text-[32px] text-red-500">
                    {downloading === "pdf" ? "hourglass_empty" : "picture_as_pdf"}
                  </span>
                  <span className="text-sm font-semibold text-charcoal dark:text-white">
                    {downloading === "pdf" ? "Downloading…" : "PDF"}
                  </span>
                  <span className="text-center text-xs text-slate-400 dark:text-white/40">
                    Formatted report, print-ready
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  disabled={!!downloading}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:hover:border-primary/40 dark:hover:bg-primary/10"
                >
                  <span className="material-symbols-outlined text-[32px] text-green-600">
                    {downloading === "csv" ? "hourglass_empty" : "table"}
                  </span>
                  <span className="text-sm font-semibold text-charcoal dark:text-white">
                    {downloading === "csv" ? "Downloading…" : "CSV"}
                  </span>
                  <span className="text-center text-xs text-slate-400 dark:text-white/40">
                    Spreadsheet, for filtering
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Delete Account Modal ────────────────────────────────────────────────────

function DeleteAccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { clearUser } = useAuthStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, loading, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (loading) return;
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !adminCode) {
      toast.error("Both fields are required.");
      return;
    }
    setLoading(true);
    try {
      await deleteAdminAccount(password, adminCode);
      toast.success("Account deleted. Redirecting…");
      try {
        await logout();
      } catch {
        // best-effort
      }
      clearUser();
      window.location.href = "/admin";
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete account.";
      toast.error(msg);
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="w-full rounded-2xl bg-white p-6 shadow-xl dark:bg-background-dark-soft">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <span className="material-symbols-outlined text-[20px] text-red-600 dark:text-red-400">
              warning
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-charcoal dark:text-white">
              Delete admin account
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/60">
              This is permanent and cannot be undone. You will be logged out
              immediately.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal dark:text-white">
              Current password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal dark:text-white">
              Admin master code
            </label>
            <input
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Enter the master admin code"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [exportOpen, setExportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="min-h-full bg-background-light p-4 dark:bg-background-dark sm:p-6 lg:p-8">
      <h2 className="text-2xl font-black text-charcoal dark:text-white">
        Settings
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-white/60">
        Manage your admin account.
      </p>

      {/* Export Data */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-background-dark-soft">
        <h3 className="text-sm font-bold text-charcoal dark:text-white">
          Export data
        </h3>
        <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-charcoal dark:text-white">
              Download conference data
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
              Export payments, companies, hotel bookings, members, or attendees
              as PDF or CSV.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="mt-3 flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:mt-0"
          >
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Export data
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-950/20">
        <h3 className="text-sm font-bold text-red-700 dark:text-red-400">
          Danger zone
        </h3>
        <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-charcoal dark:text-white">
              Delete this admin account
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
              Permanently removes your account. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="mt-3 shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:mt-0"
          >
            Delete account
          </button>
        </div>
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <DeleteAccountModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
