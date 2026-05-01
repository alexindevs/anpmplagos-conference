"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getCompanyNameFromAuthUser, isCompanyRegType } from "@/lib/auth-api";
import { conferenceCartQueryKey, useAddConferenceCartItem } from "@/hooks/use-conference-cart";
import { useClientPagination } from "@/hooks/use-shop-client-pagination";
import {
  ApiError,
  formatKoboToNaira,
  getAvailableSessionSlots,
  getCompanyMeSessions,
  initializeSessionPayment,
  type CompanyOwnedSessionSlot,
  type PendingSessionPayment,
  type SessionSlotCatalogItem,
} from "@/lib/api";

const Q_AVAIL = ["company", "session-slots", "available"] as const;
const Q_ME = ["company", "session-slots", "me"] as const;

export type CompanyShopSessionKind = "masterclass" | "presentation";

function catalogForKind(
  kind: CompanyShopSessionKind,
  data: Awaited<ReturnType<typeof getAvailableSessionSlots>> | undefined
): SessionSlotCatalogItem[] {
  if (!data) return [];
  if (kind === "masterclass") return data.masterclasses;
  return data.presentations;
}

function ownedForKind(
  kind: CompanyShopSessionKind,
  data: Awaited<ReturnType<typeof getCompanyMeSessions>> | undefined
): CompanyOwnedSessionSlot[] {
  if (!data) return [];
  if (kind === "masterclass") return data.masterclasses;
  return data.presentations;
}

function CatalogCard({
  slot,
  busy,
  onAddToCart,
}: {
  slot: SessionSlotCatalogItem;
  busy: boolean;
  onAddToCart: () => void;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-secondary/20 border-t-2 border-t-secondary/60 bg-white p-5 shadow-sm">
      <h4 className="font-bold text-[#181112] line-clamp-2">{slot.title}</h4>
      <p className="text-lg font-black text-primary mt-2">{formatKoboToNaira(slot.priceInKobo)}</p>
      {slot.description?.trim() ? (
        <p className="text-sm text-slate-600 mt-2 line-clamp-4 whitespace-pre-wrap">{slot.description}</p>
      ) : null}
      <div className="mt-auto pt-4">
        <button
          type="button"
          disabled={busy}
          onClick={onAddToCart}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Adding…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              Add to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function CompanySessionSlotsPage({
  sessionKind,
  heading,
  lead,
  icon,
  embedded = false,
}: {
  sessionKind: CompanyShopSessionKind;
  heading: string;
  /** Shown only when not embedded (standalone layout). Tabs use built-in intro copy. */
  lead?: string;
  icon: string;
  /** When true, omit outer `<main>` and page-scale padding (used inside shop tabs). */
  embedded?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isPending: userLoading } = useAuthSession();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const addCartMutation = useAddConferenceCartItem();

  useEffect(() => {
    if (!userLoading && (!user || !isCompanyRegType(user))) {
      router.push("/");
    }
  }, [user, userLoading, router]);

  const companyName = getCompanyNameFromAuthUser(user ?? undefined);

  const availQuery = useQuery({
    queryKey: Q_AVAIL,
    queryFn: getAvailableSessionSlots,
    enabled: !!user && isCompanyRegType(user ?? undefined),
  });

  const meQuery = useQuery({
    queryKey: Q_ME,
    queryFn: getCompanyMeSessions,
    enabled: !!user && isCompanyRegType(user ?? undefined),
  });

  const payMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return initializeSessionPayment({ type: sessionKind, sessionId });
    },
    onSuccess: (res) => {
      if (res.manualMode) {
        router.push(`/payment/manual-pending?reference=${encodeURIComponent(res.reference)}`);
      } else {
        window.location.href = res.authorizationUrl;
      }
    },
    onError: (e) => {
      setCheckoutError(e instanceof ApiError ? e.message : "Payment could not be started.");
      setPayingId(null);
    },
  });

  const catalog = useMemo(
    () => catalogForKind(sessionKind, availQuery.data),
    [sessionKind, availQuery.data]
  );
  const { page, setPage, totalPages, pageItems: catalogPage } = useClientPagination(catalog);
  const owned = useMemo(() => ownedForKind(sessionKind, meQuery.data), [sessionKind, meQuery.data]);
  const pending = useMemo(
    () =>
      (meQuery.data?.pendingSessionPayments ?? []).filter((p) => p.kind === sessionKind),
    [meQuery.data, sessionKind]
  );

  const handleAddToCart = (sessionId: string) => {
    setCheckoutError(null);
    setAddingId(sessionId);
    const body =
      sessionKind === "masterclass"
        ? { type: "masterclass" as const, masterclassId: sessionId }
        : { type: "presentation" as const, presentationId: sessionId };
    addCartMutation.mutate(body, {
      onSettled: () => setAddingId(null),
      onError: (e) => {
        setCheckoutError(e instanceof ApiError ? e.message : "Could not add to cart.");
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: Q_AVAIL });
        void queryClient.invalidateQueries({ queryKey: Q_ME });
        void queryClient.invalidateQueries({ queryKey: conferenceCartQueryKey });
      },
    });
  };

  const handlePendingContinue = (p: PendingSessionPayment) => {
    setCheckoutError(null);
    setPayingId(p.sessionId);
    payMutation.mutate(p.sessionId);
  };

  if (userLoading || !user) {
    const loader = (
      <div className={embedded ? "py-16 flex justify-center" : "min-h-screen bg-background-light flex items-center justify-center"}>
        <div className="flex items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
          <span className="text-slate-600">Loading…</span>
        </div>
      </div>
    );
    return loader;
  }

  const loadError =
    (availQuery.isError && availQuery.error instanceof Error ? availQuery.error.message : null) ||
    (meQuery.isError && meQuery.error instanceof Error ? meQuery.error.message : null);

  const shellClass = embedded ? "space-y-8" : "flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8";
  const titleClass = embedded ? "text-xl font-black text-[#181112]" : "text-2xl font-black text-[#181112]";
  const kindNoun = sessionKind === "masterclass" ? "masterclass" : "presentation";
  const yourSlotsHeading = embedded ? `Your ${kindNoun} slots` : "Your bookings";
  const availSlotsHeading = embedded ? `Available ${kindNoun} slots` : "Available to purchase";
  const availSlotsLead = embedded
    ? null
    : `Published slots you can buy for ${companyName || "your company"}. You will be redirected to complete payment securely.`;

  const yourSlotsSection = (
    <section className={embedded ? undefined : "mb-10"}>
      <h3
        className={
          embedded
            ? "text-sm font-bold uppercase tracking-wider text-slate-500 mb-3"
            : "text-lg font-black text-[#181112] mb-1"
        }
      >
        {yourSlotsHeading}
      </h3>
      {!embedded ? (
        <p className="text-sm text-slate-600 mb-4">Slots confirmed for your company after successful payment.</p>
      ) : null}
      {meQuery.isError && embedded ? (
        <p className="text-sm text-red-600 mb-2">
          {meQuery.error instanceof Error ? meQuery.error.message : "Could not load your slots."}
        </p>
      ) : null}
      {meQuery.isPending ? (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="size-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
          {embedded ? "Loading…" : "Loading your bookings…"}
        </div>
      ) : owned.length === 0 ? (
        embedded ? (
          <p className="text-sm text-slate-600">
            No {kindNoun} slots purchased yet. Add from the catalog below.
          </p>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600">
            You do not have any confirmed slots here yet.
          </div>
        )
      ) : (
        <div className="overflow-x-auto rounded-lg border border-secondary/20">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-2.5 px-3 text-xs font-bold uppercase text-slate-500">Title</th>
                <th className="py-2.5 px-3 text-xs font-bold uppercase text-slate-500 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {owned.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2.5 px-3 font-semibold text-[#181112]">{row.title}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary whitespace-nowrap">
                    {formatKoboToNaira(row.priceInKobo)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const pendingSection =
    pending.length > 0 ? (
      <section className={embedded ? undefined : "mb-10"}>
        <h3
          className={
            embedded
              ? "text-sm font-bold uppercase tracking-wider text-slate-500 mb-3"
              : "text-lg font-black text-[#181112] mb-1"
          }
        >
          Incomplete payment
        </h3>
        {!embedded ? (
          <p className="text-sm text-slate-600 mb-4">
            If you started checkout but did not finish, you can try again from here.
          </p>
        ) : null}
        <ul className="space-y-3">
          {pending.map((p) => (
            <li
              key={p.reference}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-[#181112]">Awaiting payment</p>
                <p className="text-sm text-primary font-bold">{formatKoboToNaira(p.amount || p.baseAmount)}</p>
              </div>
              <button
                type="button"
                disabled={payMutation.isPending}
                onClick={() => handlePendingContinue(p)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {payingId === p.sessionId && payMutation.isPending ? "Starting…" : "Continue to pay"}
              </button>
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  const availableSection = (
    <section className={embedded ? undefined : "mb-10"}>
      <h3
        className={
          embedded
            ? "text-sm font-bold uppercase tracking-wider text-slate-500 mb-3"
            : "text-lg font-black text-[#181112] mb-1"
        }
      >
        {availSlotsHeading}
      </h3>
      {!embedded && availSlotsLead ? <p className="text-sm text-slate-600 mb-4">{availSlotsLead}</p> : null}
      {availQuery.isError && embedded ? (
        <p className="text-sm text-red-600 mb-2">
          {availQuery.error instanceof Error ? availQuery.error.message : "Could not load catalog."}
        </p>
      ) : null}
      {availQuery.isPending ? (
        <div className="flex items-center gap-2 text-sm text-slate-600 py-8">
          <span className="size-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
          {embedded ? "Loading catalog…" : "Loading offers…"}
        </div>
      ) : catalog.length === 0 ? (
        embedded ? (
          <p className="text-sm text-slate-600 py-6">No {kindNoun} slots available right now.</p>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-600">
            <span className={`material-symbols-outlined text-5xl text-slate-300 mr-3 block`}>{icon}</span>
            There are no open slots in this category right now.
          </div>
        )
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {catalogPage.map((slot) => (
              <CatalogCard
                key={slot.id}
                slot={slot}
                busy={addingId === slot.id && addCartMutation.isPending}
                onAddToCart={() => handleAddToCart(slot.id)}
              />
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );

  const introEmbedded =
    sessionKind === "masterclass"
      ? "Expert-led add-on sessions"
      : "Conference presentation slots";

  const inner = (
    <>
      {embedded ? (
        <div>
          <h2 className="text-xl font-black text-[#181112] flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">{icon}</span>
            {heading}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {introEmbedded} for {companyName || "your company"}. Add catalog items to your{" "}
            <Link href="/company/cart" className="font-bold text-secondary hover:underline">
              conference cart
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mb-6 border-l-4 border-secondary pl-4">
          <h1 className={titleClass}>{heading}</h1>
          <p className="text-sm text-slate-600 mt-2">{lead ?? ""}</p>
        </div>
      )}

      {loadError && !embedded ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</div>
      ) : null}

      {checkoutError && (
        <div
          className={
            embedded
              ? "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              : "mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          }
        >
          {checkoutError}
        </div>
      )}

      {embedded ? (
        <>
          {yourSlotsSection}
          {pendingSection}
          {availableSection}
        </>
      ) : (
        <>
          {availableSection}
          {pendingSection}
          {yourSlotsSection}
        </>
      )}
    </>
  );

  if (embedded) {
    return <div className={shellClass}>{inner}</div>;
  }
  return <main className={shellClass}>{inner}</main>;
}
