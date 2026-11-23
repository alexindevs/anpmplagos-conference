"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getPublicReviews } from "@/lib/api";
import { ReviewCard } from "./ReviewCard";

const PAGE_SIZE = 12;

/** Rendered only after sign-in (see ../layout.tsx), so this query never runs for guests or crawlers. */
export default function SponsorReviewsList({ page }: { page: number }) {
  const reviewsQuery = useQuery({
    queryKey: ["sponsors", "reviews", page],
    queryFn: () => getPublicReviews({ page, pageSize: PAGE_SIZE }, { cache: "no-store" }),
  });

  const items = reviewsQuery.data?.items ?? [];
  const total = reviewsQuery.data?.total ?? 0;
  const isLoading = reviewsQuery.isPending;
  const loadError: string | null = reviewsQuery.isError
    ? reviewsQuery.error instanceof Error
      ? reviewsQuery.error.message
      : "Unable to load reviews. Please try again later."
    : null;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="flex min-h-screen w-full grow flex-col">
      <section className="bg-medical-green py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/sponsors"
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Sponsors
          </Link>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
            Sponsor Reviews
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            What our sponsors say about exhibiting at and sponsoring ANPMP Lagos.
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="flex w-full justify-center py-20">
          <div
            className="size-10 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary"
            role="status"
            aria-label="Loading reviews"
          />
        </div>
      ) : null}

      {loadError ? (
        <section className="w-full px-4 py-12 sm:px-10">
          <div className="mx-auto max-w-[1280px] rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-800">
            <p className="font-semibold">Could not load reviews</p>
            <p className="mt-2 text-sm">{loadError}</p>
          </div>
        </section>
      ) : null}

      {!loadError && items.length > 0 ? (
        <section className="w-full px-4 py-16 sm:px-10">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="mt-10 flex items-center justify-center gap-3">
                <Link
                  href={`/sponsors/reviews?page=${Math.max(1, page - 1)}`}
                  aria-disabled={page <= 1}
                  className={`inline-flex items-center gap-1 rounded-lg border border-secondary/30 px-4 py-2 text-sm font-bold text-secondary transition-colors ${
                    page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-secondary/10"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  Previous
                </Link>
                <span className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <Link
                  href={`/sponsors/reviews?page=${Math.min(totalPages, page + 1)}`}
                  aria-disabled={page >= totalPages}
                  className={`inline-flex items-center gap-1 rounded-lg border border-secondary/30 px-4 py-2 text-sm font-bold text-secondary transition-colors ${
                    page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-secondary/10"
                  }`}
                >
                  Next
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {!isLoading && !loadError && items.length === 0 ? (
        <section className="w-full px-4 pb-16 sm:px-10">
          <div className="mx-auto max-w-[1280px] rounded-xl border border-dashed border-primary/25 bg-background-light px-6 py-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">rate_review</span>
            <p className="mt-4 text-lg font-bold text-charcoal">No reviews yet</p>
            <p className="mt-2 text-sm text-[#896165]">
              Check back soon — sponsor reviews will appear here once approved.
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
