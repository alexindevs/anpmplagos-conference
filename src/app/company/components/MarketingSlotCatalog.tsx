"use client";

import Image from "next/image";
import { apiAssetUrl, formatKoboToNaira, type CompanyMarketingSlot } from "@/lib/api";

export function MarketingCatalogCard({
  slot,
  busy,
  onAddToCart,
  unavailableLabel = "Unavailable",
}: {
  slot: CompanyMarketingSlot;
  busy: boolean;
  onAddToCart: () => void;
  unavailableLabel?: string;
}) {
  const img = apiAssetUrl(slot.image);
  const available = !slot.isTaken && !slot.isReserved;
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-secondary/20 border-t-2 border-t-secondary/60 bg-white shadow-sm">
      <div className="aspect-16/10 bg-slate-100 relative">
        {img ? (
          <Image src={img} alt="" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
            <span className="material-symbols-outlined text-5xl">image</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-bold text-charcoal line-clamp-2">{slot.title}</h4>
        <p className="text-lg font-black text-primary mt-2">{formatKoboToNaira(slot.price)}</p>
        {slot.description?.trim() ? (
          <p className="text-xs text-slate-600 mt-2 line-clamp-3">{slot.description}</p>
        ) : null}
        <div className="mt-auto pt-4">
          <button
            type="button"
            disabled={!available || busy}
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
                {available ? "Add to cart" : unavailableLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MarketingMySlotsTable({ rows, emptyLabel }: { rows: CompanyMarketingSlot[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600">
        {emptyLabel}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-secondary/20">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="py-2.5 px-3 text-xs font-bold uppercase text-slate-500 w-16" />
            <th className="py-2.5 px-3 text-xs font-bold uppercase text-slate-500">Title</th>
            <th className="py-2.5 px-3 text-xs font-bold uppercase text-slate-500 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((slot) => {
            const img = apiAssetUrl(slot.image);
            return (
              <tr key={slot.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2 px-3">
                  {img ? (
                    <Image src={img} alt="" width={40} height={40} className="size-10 rounded object-cover" />
                  ) : (
                    <div className="size-10 rounded bg-slate-100" />
                  )}
                </td>
                <td className="py-2.5 px-3 font-semibold text-charcoal">{slot.title}</td>
                <td className="py-2.5 px-3 text-right font-bold text-primary whitespace-nowrap">
                  {formatKoboToNaira(slot.price)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
