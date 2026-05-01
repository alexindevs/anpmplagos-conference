"use client";

import { useAuthSession } from "@/hooks/use-auth-session";
import { MemberPortalShell } from "../../components/MemberPortalShell";
import { ReceiptListPage } from "@/app/components/ReceiptListPage";

export default function MemberReceiptsPage() {
  const { data: user } = useAuthSession();
  const fullName = user?.member?.fullName ?? user?.email ?? "Member";
  const userId = user?.id ?? "";

  return (
    <MemberPortalShell userId={userId} fullName={fullName}>
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <ReceiptListPage accent="primary" />
      </main>
    </MemberPortalShell>
  );
}
