"use client";

import { CompanySessionSlotsPage } from "../../components/CompanySessionSlotsPage";

export default function PanelsPage() {
  return (
    <CompanySessionSlotsPage
      sessionKind="panel"
      heading="Panel sessions"
      lead="Browse available panel session slots, complete payment, and view confirmed bookings for your company."
      icon="groups"
    />
  );
}
