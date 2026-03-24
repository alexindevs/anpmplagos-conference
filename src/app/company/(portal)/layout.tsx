"use client";

import { useAuthSession } from "@/hooks/use-auth-session";
import { getCompanyIdFromAuthUser } from "@/lib/auth-api";
import { CompanyPortalShell } from "../components/CompanyPortalShell";

export default function CompanyPortalLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useAuthSession();
  const companyId = getCompanyIdFromAuthUser(user ?? undefined);

  return <CompanyPortalShell companyId={companyId}>{children}</CompanyPortalShell>;
}
