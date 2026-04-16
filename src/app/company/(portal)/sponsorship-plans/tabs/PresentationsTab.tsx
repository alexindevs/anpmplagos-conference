"use client";

import { CompanySessionSlotsPage } from "@/app/company/components/CompanySessionSlotsPage";

export function PresentationsTab() {
  return (
    <CompanySessionSlotsPage
      embedded
      sessionKind="presentation"
      heading="Presentations"
      icon="co_present"
    />
  );
}
