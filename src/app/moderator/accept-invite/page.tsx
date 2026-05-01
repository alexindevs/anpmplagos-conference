"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { validateModeratorInvite, registerModerator, AuthApiError } from "@/lib/auth-api";
import { useQueryClient } from "@tanstack/react-query";
import { authSessionQueryKey } from "@/hooks/use-auth-session";
import { useAuthStore } from "@/stores/auth-store";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setTokenError("No invite token provided.");
      setValidating(false);
      return;
    }
    validateModeratorInvite(token)
      .then((data) => {
        setEmail(data.email);
        setValidating(false);
      })
      .catch((err) => {
        const msg =
          err instanceof AuthApiError
            ? err.message || "Invalid or expired invite link."
            : "Failed to validate invite.";
        setTokenError(msg);
        setValidating(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await registerModerator(token, password);
      setUser(res.user);
      await queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
      router.replace("/moderator/dashboard");
    } catch (err) {
      const msg =
        err instanceof AuthApiError
          ? err.message || "Registration failed."
          : "Something went wrong. Please try again.";
      setFormError(msg);
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-[80%] md:max-w-[50%] ">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border-2 border-secondary/30 bg-secondary/10 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-secondary">badge</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-charcoal">
            <span className="text-primary">Attendance</span>{" "}
            <span className="text-secondary">Moderator</span>
          </h1>
          <p className="mt-2 text-sm text-slate-600">Set up your moderator account</p>
        </div>

        <div className="rounded-2xl border-2 border-secondary/20 bg-white p-8 shadow-xl shadow-secondary/10">
          <div className="mb-6 flex items-center justify-center gap-2 border-b border-slate-100 pb-6">
            <Image
              src="/anpmp-logo.jpeg"
              alt="ANPMP"
              width={40}
              height={40}
              className="size-10 rounded-lg object-contain"
            />
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">ANPMP Lagos</p>
              <p className="text-sm font-black text-primary">Conference 2026</p>
            </div>
          </div>

          {validating && (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
              <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
              <span>Validating invite…</span>
            </div>
          )}

          {!validating && tokenError && (
            <div className="rounded-xl border-2 border-primary/30 bg-red-50 px-4 py-6 text-center">
              <span className="material-symbols-outlined mb-2 block text-3xl text-primary">error</span>
              <p className="font-semibold text-primary">{tokenError}</p>
              <p className="mt-2 text-sm text-slate-600">
                Please contact the conference admin for a new invite link.
              </p>
            </div>
          )}

          {!validating && email && (
            <>
              <div className="mb-6 rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">Account email</p>
                <p className="mt-1 font-semibold text-charcoal">{email}</p>
              </div>

              {formError && (
                <div className="mb-4 rounded-xl border-2 border-primary/30 bg-red-50 px-4 py-3 text-sm font-medium text-primary">
                  {formError}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-charcoal outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-charcoal outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="Re-enter password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-primary/25 transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Creating account…" : "Activate My Account"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
