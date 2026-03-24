"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getCompanyNameFromAuthUser, isCompanyRegType } from "@/lib/auth-api";
import {
  ApiError,
  formatKoboToNaira,
  getAvailableSessionSlots,
  getCompanyMeSessions,
  initializeSessionPayment,
  type CompanyOwnedSessionSlot,
  type PendingSessionPayment,
  type SessionPaymentType,
  type SessionSlotCatalogItem,
} from "@/lib/api";

const Q_AVAIL = ["company", "session-slots", "available"] as const;
const Q_ME = ["company", "session-slots", "me"] as const;

function catalogForKind(
  kind: SessionPaymentType,
  data: Awaited<ReturnType<typeof getAvailableSessionSlots>> | undefined
): SessionSlotCatalogItem[] {
  if (!data) return [];
  if (kind === "masterclass") return data.masterclasses;
  if (kind === "panel") return data.panelSessions;
  return data.presentations;
}

function ownedForKind(
  kind: SessionPaymentType,
  data: Awaited<ReturnType<typeof getCompanyMeSessions>> | undefined
): CompanyOwnedSessionSlot[] {
  if (!data) return [];
  if (kind === "masterclass") return data.masterclasses;
  if (kind === "panel") return data.panelSessions;
  return data.presentations;
}

function CatalogCard({
  slot,
  paying,
  onPay,
}: {
  slot: SessionSlotCatalogItem;
  paying: boolean;
  onPay: () => void;
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
          disabled={paying}
          onClick={onPay}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {paying ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Starting…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">payments</span>
              Pay now
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
}: {
  sessionKind: SessionPaymentType;
  heading: string;
  lead: string;
  icon: string;
}) {
  const router = useRouter();
  const { data: user, isPending: userLoading } = useAuthSession();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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
      const res = await initializeSessionPayment({ type: sessionKind, sessionId });
      return res.authorizationUrl;
    },
    onSuccess: (url) => {
      window.location.href = url;
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
  const owned = useMemo(() => ownedForKind(sessionKind, meQuery.data), [sessionKind, meQuery.data]);
  const pending = useMemo(
    () =>
      (meQuery.data?.pendingSessionPayments ?? []).filter((p) => p.kind === sessionKind),
    [meQuery.data, sessionKind]
  );

  const handlePay = (sessionId: string) => {
    setCheckoutError(null);
    setPayingId(sessionId);
    payMutation.mutate(sessionId);
  };

  const handlePendingContinue = (p: PendingSessionPayment) => {
    setCheckoutError(null);
    setPayingId(p.sessionId);
    payMutation.mutate(p.sessionId);
  };

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
          <span className="text-slate-600">Loading…</span>
        </div>
      </div>
    );
  }

  const loadError =
    (availQuery.isError && availQuery.error instanceof Error ? availQuery.error.message : null) ||
    (meQuery.isError && meQuery.error instanceof Error ? meQuery.error.message : null);

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 border-l-4 border-secondary pl-4">
        <h1 className="text-2xl font-black text-[#181112]">{heading}</h1>
        <p className="text-sm text-slate-600 mt-2">{lead}</p>
      </div>

      {loadError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      )}

      {checkoutError && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {checkoutError}
        </div>
      )}

      <section className="mb-10">
        <h2 className="text-lg font-black text-[#181112] mb-1">Available to purchase</h2>
        <p className="text-sm text-slate-600 mb-4">
          Published slots you can buy for {companyName || "your company"}. You will be redirected to complete payment
          securely.
        </p>
        {availQuery.isPending ? (
          <div className="flex items-center gap-2 text-slate-600 text-sm py-8">
            <span className="size-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
            Loading offers…
          </div>
        ) : catalog.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-600">
            <span className={`material-symbols-outlined text-5xl text-slate-300 mb-3 block`}>{icon}</span>
            There are no open slots in this category right now.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {catalog.map((slot) => (
              <CatalogCard
                key={slot.id}
                slot={slot}
                paying={payingId === slot.id && payMutation.isPending}
                onPay={() => handlePay(slot.id)}
              />
            ))}
          </div>
        )}
      </section>

      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-black text-[#181112] mb-1">Incomplete payment</h2>
          <p className="text-sm text-slate-600 mb-4">
            If you started checkout but did not finish, you can try again from here.
          </p>
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
      )}

      <section>
        <h2 className="text-lg font-black text-[#181112] mb-1">Your bookings</h2>
        <p className="text-sm text-slate-600 mb-4">Slots confirmed for your company after successful payment.</p>
        {meQuery.isPending ? (
          <div className="flex items-center gap-2 text-slate-600 text-sm py-6">
            <span className="size-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
            Loading your bookings…
          </div>
        ) : owned.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600">
            You do not have any confirmed slots here yet.
          </div>
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
    </main>
  );
}
