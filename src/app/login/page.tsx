"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { login, AuthApiError, type AuthUser } from "@/lib/auth-api";
import { authSessionQueryKey } from "@/hooks/use-auth-session";
import { useAuthStore } from "@/stores/auth-store";

function isAdminUser(u: AuthUser): boolean {
  return u.regType === "admin" || u.admin != null;
}

function redirectAfterLogin(u: AuthUser): string {
  if (isAdminUser(u)) return "/admin/dashboard";
  if (u.regType === "company" || u.regType === "exhibitor" || u.regType === "sponsor")
    return "/company/dashboard";
  if (u.regType === "member") {
    return "/member/dashboard";
  }
  if (u.regType === "attendee") {
    return "/attendee/dashboard";
  }
  return "/register";
}

export default function LoginPage() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await login(email, password);
      setUser(res.user);
      await queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
      window.location.href = redirectAfterLogin(res.user);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(err.status === 401 ? "Invalid email or password." : err.message || "Login failed.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      {/* Brand accents: green wash + red glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(30,77,43,0.12),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 size-[420px] rounded-full bg-primary/6 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 size-80 rounded-full bg-secondary/8 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-[50%]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border-2 border-secondary/30 bg-secondary/10 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-secondary">lock</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-charcoal">
            <span className="text-primary">Log in</span>
            <span className="text-secondary"> to your account</span>
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Use the email and password from your conference registration or admin access.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-secondary/20 bg-white p-8 shadow-xl shadow-secondary/10">
          <div className="mb-6 flex items-center justify-center gap-2 border-b border-slate-100 pb-6">
            <Image
              src="/anpmp-logo.jpg"
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
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                Email
              </label>
              <input
                id="login-email"
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
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-secondary">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-[#181112] placeholder:text-slate-400 outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-primary/25 transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-secondary underline decoration-secondary/40 underline-offset-2 hover:text-primary">
              Register for the conference
            </Link>
          </p>
          <p className="mt-3 text-center text-sm">
            <Link href="/admin" className="font-medium text-slate-500 hover:text-primary">
              Admin access →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
