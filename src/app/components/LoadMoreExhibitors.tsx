"use client";

import { useState } from "react";

const LOAD_DURATION_MS = 1500;

export default function LoadMoreExhibitors() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  function handleClick() {
    if (status !== "idle") return;
    setStatus("loading");
    setTimeout(() => setStatus("done"), LOAD_DURATION_MS);
  }

  if (status === "loading") {
    return (
      <div className="mt-12 flex justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="size-10 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary"
            aria-hidden
          />
          <span className="text-sm font-medium text-[#181112]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="mt-12 flex justify-center">
        <p className="text-sm font-medium text-[#896165]">
          No more sponsors to show.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 flex justify-center">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-red-50 hover:text-red-800"
      >
        <span>Load More Exhibitors</span>
        <span className="material-symbols-outlined text-lg">expand_more</span>
      </button>
    </div>
  );
}
