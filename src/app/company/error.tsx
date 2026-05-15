"use client";

import { useEffect } from "react";

export default function CompanyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="material-symbols-outlined text-5xl text-red-500">error</span>
      <h2 className="text-xl font-bold text-charcoal dark:text-white">Something went wrong</h2>
      <p className="text-sm text-slate-500 dark:text-white/50">
        An unexpected error occurred. You can try again or return to the dashboard.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
