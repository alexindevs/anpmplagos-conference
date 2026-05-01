"use client";

import { useAuthSession } from "@/hooks/use-auth-session";
import { getCompanyIdFromAuthUser } from "@/lib/auth-api";
import { CompanyPortalShell } from "../../components/CompanyPortalShell";
import { ReceiptListPage } from "@/app/components/ReceiptListPage";

export default function CompanyReceiptsPage() {
  const { data: user } = useAuthSession();
  const companyId = getCompanyIdFromAuthUser(user);

  return (
    <CompanyPortalShell companyId={companyId}>
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <ReceiptListPage accent="secondary" />
      </main>
    </CompanyPortalShell>
  );
}
