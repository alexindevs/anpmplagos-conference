"use client";

import { ReceiptListPage } from "@/app/components/ReceiptListPage";

export default function CompanyReceiptsPage() {
  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <ReceiptListPage accent="secondary" />
    </main>
  );
}
