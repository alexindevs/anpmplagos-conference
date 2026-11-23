"use client";

import Link from "next/link";
import { useAuthSession } from "@/hooks/use-auth-session";

/**
 * Renders `children` only for signed-in users (any account type).
 *
 * Auth cookies live on the API domain, so the session can only be checked in the browser.
 * Anything wrapped here must therefore fetch its own data client-side (after this gate opens)
 * rather than in a server component — otherwise the data would be in the HTML crawlers receive.
 */
export default function RequireAccount({
  title = "Sign in to continue",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const { data: user, isPending } = useAuthSession();

  if (isPending) {
    return (
      <main className="flex min-h-[60vh] w-full grow items-center justify-center">
        <div
          className="size-10 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary"
          role="status"
          aria-label="Loading"
        />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-[60vh] w-full grow items-center justify-center px-4 py-24">
        <div className="mx-auto max-w-md text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300">lock</span>
          <h1 className="mt-4 text-3xl font-serif font-bold text-charcoal">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#896165]">
            This page is only available to people with an account on the ANPMP Lagos platform.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="flex h-11 items-center justify-center rounded border-2 border-deep-forest px-6 text-sm font-bold text-deep-forest transition-all hover:bg-deep-forest/10"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="flex h-11 items-center justify-center rounded bg-primary px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-red-700"
            >
              Register Now
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
