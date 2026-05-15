"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { validateResetToken, resetPassword, AuthApiError } from "@/lib/auth-api";

type PageState = "validating" | "invalid" | "form" | "submitting" | "success";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-16">
          <div className="relative w-[80%] md:w-[50%] max-w-137.5">
            <div className="rounded-2xl border-2 border-secondary/20 bg-white p-8 shadow-xl shadow-secondary/10">
              <div className="flex items-center justify-center gap-3 py-8 text-slate-500">
                <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                <span className="text-sm">Loading…</span>
              </div>
            </div>
          </div>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [pageState, setPageState] = useState<PageState>("validating");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setPageState("invalid");
      return;
    }
    validateResetToken(token)
      .then(({ email: e }) => {
        setEmail(e);
        setPageState("form");
      })
      .catch(() => setPageState("invalid"));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError(null);
    setPageState("submitting");
    try {
      await resetPassword(token, password);
      setPageState("success");
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message || "Reset failed. The link may have expired."
          : "Something went wrong. Please try again."
      );
      setPageState("form");
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(30,77,43,0.12),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 size-105 rounded-full bg-primary/6 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 size-80 rounded-full bg-secondary/8 blur-3xl"
        aria-hidden
      />

      <div className="relative w-[80%] md:w-[50%] max-w-137.5">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border-2 border-secondary/30 bg-secondary/10 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-secondary">
              {pageState === "success" ? "check_circle" : "lock_reset"}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-charcoal">
            {pageState === "success" ? (
              <>
                <span className="text-primary">Password</span>
                <span className="text-secondary"> updated</span>
              </>
            ) : (
              <>
                <span className="text-primary">Reset</span>
                <span className="text-secondary"> your password</span>
              </>
            )}
          </h1>
        </div>

        <div className="rounded-2xl border-2 border-secondary/20 bg-white p-8 shadow-xl shadow-secondary/10">
          <div className="mb-6 flex items-center justify-center gap-2 border-b border-slate-100 pb-6">
            <Image
              src="/anpmp-logo.jpeg"
              alt="ANPMP"
              width={48}
              height={48}
              className="size-12 rounded-lg object-contain"
            />
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">ANPMP Lagos</p>
              <p className="text-sm font-black text-primary">Conference 2026</p>
            </div>
          </div>

          {/* Validating */}
          {pageState === "validating" && (
            <div className="flex items-center justify-center gap-3 py-8 text-slate-500">
              <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
              <span className="text-sm">Verifying your link…</span>
            </div>
          )}

          {/* Invalid / expired */}
          {pageState === "invalid" && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-red-100">
                <span className="material-symbols-outlined text-3xl text-primary">link_off</span>
              </div>
              <h2 className="text-lg font-black text-charcoal">Link invalid or expired</h2>
              <p className="mt-2 text-sm text-slate-600">
                This password reset link has expired or has already been used. Reset links are valid
                for 1 hour.
              </p>
              <Link
                href="/forgot-password"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-primary/25 hover:bg-red-700 transition-colors"
              >
                Request a new link
              </Link>
            </div>
          )}

          {/* Success */}
          {pageState === "success" && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100">
                <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
              </div>
              <h2 className="text-lg font-black text-charcoal">All done!</h2>
              <p className="mt-2 text-sm text-slate-600">
                Your password has been updated. You can now log in with your new password.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-primary/25 hover:bg-red-700 transition-colors"
              >
                Go to log in
              </Link>
            </div>
          )}

          {/* Form */}
          {(pageState === "form" || pageState === "submitting") && (
            <>
              {email && (
                <p className="mb-5 rounded-lg bg-slate-50 px-4 py-2.5 text-sm text-slate-600">
                  Setting new password for{" "}
                  <span className="font-semibold text-charcoal">{email}</span>
                </p>
              )}

              {error && (
                <div
                  className="mb-5 rounded-xl border-2 border-primary/30 bg-red-50 px-4 py-3 text-sm font-medium text-primary"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary"
                  >
                    New password
                  </label>
                  <input
                    id="new-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-charcoal placeholder:text-slate-400 outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-charcoal placeholder:text-slate-400 outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pageState === "submitting"}
                  className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-primary/25 transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {pageState === "submitting" ? "Updating…" : "Set new password"}
                </button>
              </form>
            </>
          )}

          {pageState !== "success" && (
            <p className="mt-6 text-center text-sm text-slate-600">
              <Link href="/login" className="font-medium text-slate-500 hover:text-primary">
                ← Back to log in
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
