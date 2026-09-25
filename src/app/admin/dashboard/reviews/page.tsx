"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminCompanyReviews,
  updateAdminCompanyReviewStatus,
  type CompanyReviewWithCompany,
  type ReviewStatus,
} from "@/lib/api";
import { ReviewDetailModal } from "./components/ReviewDetailModal";

const STATUS_TABS: { key: ReviewStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "needs_revision", label: "Needs Revision" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

function StatusBadge({ status }: { status: ReviewStatus }) {
  const classes =
    status === "approved"
      ? "bg-secondary/15 text-secondary dark:bg-secondary/25"
      : status === "rejected"
        ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200"
        : status === "needs_revision"
          ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200"
          : "bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${classes}`}>
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<ReviewStatus | "all">("pending");
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<CompanyReviewWithCompany | null>(null);
  const pageSize = 20;
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "reviews", tab, page, pageSize],
    queryFn: () =>
      getAdminCompanyReviews({
        page,
        pageSize,
        status: tab === "all" ? undefined : tab,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReviewStatus }) =>
      updateAdminCompanyReviewStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-charcoal dark:text-white">
            Sponsor reviews
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
            Approve reviews to publish them on the public sponsors page. Rejected reviews stay hidden.
          </p>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        <div className="mb-4 flex gap-2">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                tab === t.key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-primary/5 dark:bg-background-dark-soft dark:text-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 dark:border-border-dark dark:bg-background-dark-softer">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Company
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Review
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 dark:divide-border-dark">
                {isLoading && (
                  <tr>
                    <td className="px-4 py-8 text-slate-500 dark:text-white/50" colSpan={6}>
                      Loading reviews…
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className="px-4 py-8 text-primary" colSpan={6}>
                      Unable to load reviews.
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && (data?.items?.length ?? 0) === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-500 dark:text-white/50" colSpan={6}>
                      No reviews in this category.
                    </td>
                  </tr>
                )}
                {(data?.items ?? []).map((review) => (
                  <tr
                    key={review.id}
                    className="transition-colors hover:bg-primary/5 dark:hover:bg-background-dark-softer"
                  >
                    <td className="px-4 py-3 font-semibold text-charcoal dark:text-white">
                      {review.company.companyName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-amber-500">
                        {"★".repeat(review.rating)}
                        <span className="text-slate-300 dark:text-white/20">
                          {"★".repeat(5 - review.rating)}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-md text-slate-600 dark:text-white/70">
                      <p className="line-clamp-3 whitespace-pre-wrap">{review.comment}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={review.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                      {new Date(review.createdAt).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedReview(review)}
                          className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200 dark:bg-background-dark-softer dark:text-white"
                        >
                          View
                        </button>
                        {review.status !== "approved" && (
                          <button
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => statusMutation.mutate({ id: review.id, status: "approved" })}
                            className="rounded-lg bg-secondary px-3 py-1 text-xs font-bold text-white transition-colors hover:brightness-110 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(data?.total ?? 0) > pageSize && (
            <div className="flex items-center justify-between bg-primary/5 px-4 py-3 dark:bg-background-dark-softer">
              <p className="text-sm text-slate-500 dark:text-white/50">
                Page <span className="font-bold text-slate-700 dark:text-white/70">{page}</span> of{" "}
                <span className="font-bold text-slate-700 dark:text-white/70">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded p-1 transition-colors hover:bg-white disabled:opacity-50 dark:hover:bg-background-dark-soft"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  type="button"
                  className="rounded p-1 transition-colors hover:bg-white disabled:opacity-50 dark:hover:bg-background-dark-soft"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReviewDetailModal
        isOpen={selectedReview !== null}
        onClose={() => setSelectedReview(null)}
        review={selectedReview}
      />
    </>
  );
}
