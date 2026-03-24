"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, getAdminSupportTicket, respondToSupportTicket } from "@/lib/api";
import { supportCategoryLabel, supportStatusLabel } from "@/lib/support-ticket-labels";

export default function AdminSupportTicketDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const queryClient = useQueryClient();
  const [responseText, setResponseText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "support", "ticket", id],
    queryFn: () => getAdminSupportTicket(id),
    enabled: Boolean(id),
    retry: false,
  });

  const respond = useMutation({
    mutationFn: () => respondToSupportTicket(id, responseText),
    onSuccess: () => {
      setResponseText("");
      setFormError(null);
      void queryClient.invalidateQueries({ queryKey: ["admin", "support", "ticket", id] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "support", "tickets"] });
    },
    onError: (e: unknown) => {
      if (e instanceof ApiError) {
        setFormError(
          typeof e.body?.message === "string" ? e.body.message : e.message || "Could not send the reply."
        );
      } else {
        setFormError("Could not send the reply.");
      }
    },
  });

  if (!id) {
    return (
      <div className="p-8">
        <p className="text-slate-600 dark:text-white/70">Invalid request.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <div className="size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (isError || !data) {
    const msg =
      error instanceof ApiError && error.status === 404
        ? "This request was not found."
        : "Unable to load this request.";
    return (
      <div className="p-8">
        <p className="text-red-700 dark:text-red-300">{msg}</p>
        <Link
          href="/admin/dashboard/support"
          className="mt-4 inline-block text-sm font-bold text-primary hover:underline"
        >
          Back to support requests
        </Link>
      </div>
    );
  }

  const statusClass =
    data.status === "answered"
      ? "bg-secondary/15 text-secondary dark:bg-secondary/25"
      : data.status === "open"
        ? "bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
        : "bg-slate-100 text-slate-700 dark:bg-background-dark-softer dark:text-white/80";

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-3 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 lg:px-8 lg:py-4">
        <Link
          href="/admin/dashboard/support"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline dark:text-primary"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          All requests
        </Link>
      </header>

      <div className="space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#181112] dark:text-white">{data.title}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
              {supportCategoryLabel(data.category)} ·{" "}
              {new Date(data.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}>
            {supportStatusLabel(data.status)}
          </span>
        </div>

        <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Submitter</h2>
          <p className="mt-2 font-bold text-[#181112] dark:text-white">{data.user.submitterDisplayName}</p>
          <p className="text-sm text-slate-600 dark:text-white/70">{data.user.email}</p>
          {data.user.profileUrl ? (
            <a
              href={data.user.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm font-bold text-primary hover:underline"
            >
              Open public profile
            </a>
          ) : null}
        </section>

        <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Message</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#181112] dark:text-white/90">
            {data.description}
          </p>
        </section>

        {data.screenshotUrls.length > 0 ? (
          <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
              Attachments
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.screenshotUrls.map((url) => (
                <li key={url} className="overflow-hidden rounded-lg border border-slate-200 dark:border-border-dark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={url} alt="" className="max-h-64 w-full bg-slate-50 object-contain dark:bg-background-dark" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
            Previous replies
          </h2>
          {data.responses.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600 dark:text-white/60">No replies yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {data.responses.map((r) => (
                <li key={r.id} className="rounded-lg border border-slate-100 bg-slate-50/90 p-4 dark:border-border-dark dark:bg-background-dark">
                  <p className="text-xs font-semibold text-primary">{r.responderAdminName}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                    {new Date(r.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-[#181112] dark:text-white/90">{r.responseText}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
            Send a reply
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
            Your reply is emailed to the submitter and saved on this request.
          </p>
          {formError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {formError}
            </div>
          ) : null}
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={5}
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white"
            placeholder="Write your reply…"
          />
          <button
            type="button"
            disabled={respond.isPending || !responseText.trim()}
            onClick={() => respond.mutate()}
            className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {respond.isPending ? "Sending…" : "Send reply"}
          </button>
        </section>

        <p className="text-xs text-slate-400 dark:text-white/40">
          <span className="font-semibold text-slate-500 dark:text-white/50">Link shared with the customer: </span>
          <a href={data.ticketUrl} className="break-all text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            {data.ticketUrl}
          </a>
        </p>
      </div>
    </>
  );
}
