"use client";

import { ReceiptListPage } from "@/app/components/ReceiptListPage";

export default function AdminReceiptsPage() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#181112] dark:text-white">Receipts</h2>
            <p className="text-sm text-slate-500 dark:text-white/50">View all payment receipts and transaction history</p>
          </div>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        <ReceiptListPage isAdmin accent="primary" hideHeader />
      </div>
    </>
  );
}
