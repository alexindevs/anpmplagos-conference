"use client";

import { CompanySessionSlotsPage } from "@/app/company/components/CompanySessionSlotsPage";

export function MasterclassesTab() {
  return (
    <CompanySessionSlotsPage
      embedded
      sessionKind="masterclass"
      heading="Masterclasses"
      icon="school"
    />
  );
}
