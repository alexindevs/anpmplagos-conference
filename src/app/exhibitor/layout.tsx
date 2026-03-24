"use client";

import { useAuthSession } from "@/hooks/use-auth-session";
import { ExhibitorPortalShell } from "./components/ExhibitorPortalShell";

export default function ExhibitorLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useAuthSession();
  const exhibitorId = user?.exhibitor?.id ?? "";

  return <ExhibitorPortalShell exhibitorId={exhibitorId}>{children}</ExhibitorPortalShell>;
}
