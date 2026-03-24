"use client";

import { CompanySessionSlotsPage } from "../../components/CompanySessionSlotsPage";

export default function PresentationsPage() {
  return (
    <CompanySessionSlotsPage
      sessionKind="presentation"
      heading="Presentations"
      lead="Browse available presentation slots, complete payment, and view confirmed bookings for your company."
      icon="co_present"
    />
  );
}
