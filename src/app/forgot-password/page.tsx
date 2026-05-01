"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { forgotPassword, AuthApiError } from "@/lib/auth-api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(err.message || "Something went wrong. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
            <span className="material-symbols-outlined text-4xl text-secondary">lock_reset</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-charcoal">
            <span className="text-primary">Forgot</span>
            <span className="text-secondary"> your password?</span>
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter your email and we&apos;ll send a reset link if an account exists.
          </p>
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

          {submitted ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100">
                <span className="material-symbols-outlined text-3xl text-green-600">mark_email_read</span>
              </div>
              <h2 className="text-lg font-black text-charcoal">Check your inbox</h2>
              <p className="mt-2 text-sm text-slate-600">
                If <span className="font-semibold text-charcoal">{email}</span> is registered, a
                password reset link has been sent. It expires in 1 hour.
              </p>
              <p className="mt-4 text-xs text-slate-500">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setEmail(""); }}
                  className="font-medium text-secondary underline decoration-secondary/40 underline-offset-2 hover:text-primary"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div
                  className="mb-6 rounded-xl border-2 border-primary/30 bg-red-50 px-4 py-3 text-sm font-medium text-primary"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary"
                  >
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-[#181112] placeholder:text-slate-400 outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-primary/25 transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
            Remembered it?{" "}
            <Link
              href="/login"
              className="font-bold text-secondary underline decoration-secondary/40 underline-offset-2 hover:text-primary"
            >
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
