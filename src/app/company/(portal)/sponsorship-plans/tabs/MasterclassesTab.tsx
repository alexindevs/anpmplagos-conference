"use client";

import { CompanySessionSlotsPage } from "@/app/company/components/CompanySessionSlotsPage";

export function MasterclassesTab() {
  return (
    <CompanySessionSlotsPage
      embedded
      sessionKind="masterclass"
      heading="Masterclasses"
      lead="Browse available masterclass slots and add them to your conference cart."
      icon="school"
    />
  );
}
