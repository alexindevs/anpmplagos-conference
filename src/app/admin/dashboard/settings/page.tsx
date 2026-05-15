"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { deleteAdminAccount, logout } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

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
      const msg = err instanceof Error ? err.message : "Failed to delete account.";
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
              This is permanent and cannot be undone. You will be logged out immediately.
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

export default function SettingsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-full bg-background-light p-4 dark:bg-background-dark sm:p-6 lg:p-8">
      <h2 className="text-2xl font-black text-charcoal dark:text-white">Settings</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-white/60">
        Manage your admin account.
      </p>

      <div className="mt-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-950/20">
          <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Danger zone</h3>
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
              onClick={() => setModalOpen(true)}
              className="mt-3 shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:mt-0"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      <DeleteAccountModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
