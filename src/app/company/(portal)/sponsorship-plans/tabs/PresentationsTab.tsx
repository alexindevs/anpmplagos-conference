"use client";

import { CompanySessionSlotsPage } from "@/app/company/components/CompanySessionSlotsPage";

export function PresentationsTab() {
  return (
    <CompanySessionSlotsPage
      embedded
      sessionKind="presentation"
      heading="Presentations"
      lead="Browse available presentation slots and add them to your conference cart."
      icon="co_present"
    />
  );
}
