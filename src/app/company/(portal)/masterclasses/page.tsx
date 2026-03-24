"use client";

import { CompanySessionSlotsPage } from "../../components/CompanySessionSlotsPage";

export default function MasterclassesPage() {
  return (
    <CompanySessionSlotsPage
      sessionKind="masterclass"
      heading="Masterclasses"
      lead="Browse available masterclass slots, complete payment, and view confirmed bookings for your company."
      icon="school"
    />
  );
}
