"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminCompanyReviewStatus, type CompanyReviewWithCompany, type ReviewStatus } from "@/lib/api";

interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: CompanyReviewWithCompany | null;
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const classes =
    status === "approved"
      ? "bg-secondary/15 text-secondary"
      : status === "rejected"
        ? "bg-red-50 text-red-700"
        : status === "needs_revision"
          ? "bg-orange-50 text-orange-700"
          : "bg-amber-50 text-amber-900";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${classes}`}>
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
}

export function ReviewDetailModal({ isOpen, onClose, review }: ReviewDetailModalProps) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [pendingAction, setPendingAction] = useState<ReviewStatus | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNote(review?.adminNote ?? "");
      setPendingAction(null);
    }
  }, [isOpen, review]);

  const mutation = useMutation({
    mutationFn: ({ status, note: reasonNote }: { status: ReviewStatus; note?: string }) => {
      if (!review) throw new Error("No review selected");
      return updateAdminCompanyReviewStatus(review.id, status, reasonNote);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      onClose();
    },
  });

  if (!isOpen || !review) return null;

  const handleApprove = () => mutation.mutate({ status: "approved" });
  const handleReject = () => {
    setPendingAction("rejected");
  };
  const handleRequestRevision = () => {
    setPendingAction("needs_revision");
  };
  const confirmWithReason = (status: ReviewStatus) => {
    mutation.mutate({ status, note: note.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[80%] md:max-w-[50%] flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <div>
            <h2 className="text-xl font-black text-charcoal">{review.company.companyName}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Submitted{" "}
              {new Date(review.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-lg text-amber-500">
              {"★".repeat(review.rating)}
              <span className="text-slate-300">{"★".repeat(5 - review.rating)}</span>
            </span>
            <StatusBadge status={review.status} />
          </div>

          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {review.comment}
          </p>

          {review.adminNote && pendingAction === null && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600">
              <p className="font-bold text-slate-700">Current admin note</p>
              <p className="mt-1">{review.adminNote}</p>
            </div>
          )}

          {pendingAction && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {pendingAction === "needs_revision"
                  ? "Explain what needs to change"
                  : "Reason for rejecting (optional)"}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                placeholder={
                  pendingAction === "needs_revision"
                    ? "e.g. Please avoid naming specific staff — keep it focused on your company's experience."
                    : "Shown to the company in their dashboard."
                }
              />
              {pendingAction === "needs_revision" && !note.trim() && (
                <p className="mt-1 text-xs text-amber-600">
                  A reason helps the company know what to change.
                </p>
              )}
            </div>
          )}

          {mutation.isError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              Failed to update review. Please try again.
            </div>
          )}
        </div>

        <div className="p-6 pt-4 flex flex-wrap justify-end gap-3 border-t border-slate-100">
          {pendingAction ? (
            <>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={
                  mutation.isPending || (pendingAction === "needs_revision" && !note.trim())
                }
                onClick={() => confirmWithReason(pendingAction)}
                className={`rounded-lg px-6 py-2 font-bold text-white transition-colors disabled:opacity-50 ${
                  pendingAction === "needs_revision"
                    ? "bg-orange-600 hover:brightness-110"
                    : "bg-red-600 hover:brightness-110"
                }`}
              >
                {mutation.isPending
                  ? "Saving..."
                  : pendingAction === "needs_revision"
                    ? "Send revision request"
                    : "Confirm rejection"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              {review.status !== "rejected" && (
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={handleReject}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-200 disabled:opacity-50"
                >
                  Reject
                </button>
              )}
              {review.status !== "needs_revision" && (
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={handleRequestRevision}
                  className="rounded-lg bg-orange-100 px-4 py-2 text-sm font-bold text-orange-800 transition-colors hover:bg-orange-200 disabled:opacity-50"
                >
                  Request Revision
                </button>
              )}
              {review.status !== "approved" && (
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={handleApprove}
                  className="rounded-lg bg-secondary px-6 py-2 font-bold text-white transition-colors hover:brightness-110 disabled:opacity-50"
                >
                  {mutation.isPending ? "Saving..." : "Approve"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
