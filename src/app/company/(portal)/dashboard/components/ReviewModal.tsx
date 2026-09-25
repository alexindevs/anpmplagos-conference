"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExhibitorReview, updateExhibitorReview, type CompanyReview } from "@/lib/api";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review?: CompanyReview | null;
}

const REVIEW_PLACEHOLDER =
  "Tell us about your experience: Did you get leads from your booth? What did you enjoy about the conference and the onboarding process? How did sponsoring help your visibility? Will you be returning next year?";

export function ReviewModal({ isOpen, onClose, review }: ReviewModalProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (review) {
        setRating(review.rating);
        setComment(review.comment);
      } else {
        setRating(0);
        setComment("");
      }
      setHoverRating(0);
    }
  }, [isOpen, review]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (review) {
        return updateExhibitorReview(review.id, { rating, comment });
      }
      return createExhibitorReview({ rating, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", "reviews"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return;
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[80%] md:max-w-[50%] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-secondary/20">
          <h2 className="text-xl font-black text-charcoal">
            {review ? "Edit Review" : "Leave a Review"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {review?.status === "needs_revision" && review.adminNote && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
              <p className="font-bold">Our team requested a revision:</p>
              <p className="mt-1">{review.adminNote}</p>
            </div>
          )}
          {review?.status === "rejected" && review.adminNote && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              <p className="font-bold">This review was not published:</p>
              <p className="mt-1">{review.adminNote}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl leading-none transition-colors"
                  aria-label={`Rate ${star} out of 5`}
                >
                  <span
                    className={`material-symbols-outlined ${
                      (hoverRating || rating) >= star ? "text-yellow-400" : "text-slate-300"
                    }`}
                    style={{
                      fontVariationSettings: (hoverRating || rating) >= star ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            {rating < 1 && (
              <p className="mt-1 text-xs text-slate-500">Tap a star to rate your experience.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={REVIEW_PLACEHOLDER}
              rows={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              required
            />
          </div>

          {mutation.isError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              Failed to save review. Please try again.
            </div>
          )}

          <p className="text-xs text-slate-500">
            {review
              ? "Saving will send this review back through moderation before it appears publicly again."
              : "Your review will be shown publicly once approved by our team."}
          </p>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || rating < 1}
              className="rounded-lg bg-secondary px-6 py-2 font-bold text-white transition-colors hover:brightness-110 disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : review ? "Save Changes" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
