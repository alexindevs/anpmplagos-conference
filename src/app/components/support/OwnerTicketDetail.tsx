"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ApiError, getMySupportTicket } from "@/lib/api";
import { supportCategoryLabel, supportStatusLabel } from "@/lib/support-ticket-labels";

export function OwnerTicketDetail({
  ticketId,
  listHref,
  listLabel = "Back to support",
}: {
  ticketId: string;
  listHref: string;
  listLabel?: string;
}) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["support", "my-ticket", ticketId],
    queryFn: () => getMySupportTicket(ticketId),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="size-10 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
      </div>
    );
  }

  if (isError || !data) {
    const msg =
      error instanceof ApiError && error.status === 404
        ? "This request could not be found, or you do not have access to it."
        : "Something went wrong while loading this request.";
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-700">{msg}</p>
        <Link
          href={listHref}
          className="mt-4 inline-block text-sm font-bold text-secondary hover:underline"
        >
          {listLabel}
        </Link>
      </div>
    );
  }

  const statusClass =
    data.status === "answered"
      ? "bg-secondary/15 text-secondary"
      : data.status === "open"
        ? "bg-amber-50 text-amber-900"
        : "bg-slate-100 text-slate-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={listHref}
            className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            {listLabel}
          </Link>
          <h1 className="text-2xl font-black text-charcoal">{data.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {supportCategoryLabel(data.category)} · Submitted{" "}
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

      <section className="rounded-xl border border-secondary/20 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Your message</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-charcoal">{data.description}</p>
      </section>

      {data.screenshotUrls.length > 0 ? (
        <section className="rounded-xl border border-secondary/20 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Attachments</h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.screenshotUrls.map((url) => (
              <li key={url} className="overflow-hidden rounded-lg border border-slate-200">
                <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                  <Image src={url} alt="" width={400} height={256} className="max-h-64 w-full object-contain bg-slate-50" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-secondary/20 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Responses</h2>
        {data.responses.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            The team has not replied yet. You will be notified by email when there is an update.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {data.responses.map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold text-secondary">{r.responderAdminName}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(r.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-charcoal">{r.responseText}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
