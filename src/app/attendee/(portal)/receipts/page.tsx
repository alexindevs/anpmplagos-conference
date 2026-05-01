"use client";

import { useAuthSession } from "@/hooks/use-auth-session";
import { AttendeePortalShell } from "../../components/AttendeePortalShell";
import { ReceiptListPage } from "@/app/components/ReceiptListPage";

export default function AttendeeReceiptsPage() {
  const { data: user } = useAuthSession();
  const fullName = user?.attendee?.fullName ?? user?.email ?? "Attendee";
  const userId = user?.id ?? "";

  return (
    <AttendeePortalShell userId={userId} fullName={fullName}>
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <ReceiptListPage accent="primary" />
      </main>
    </AttendeePortalShell>
  );
}
