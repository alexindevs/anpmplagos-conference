"use client";

import { usePathname } from "next/navigation";
import { AdminPortalShell } from "./components/AdminPortalShell";

function isAdminLoginPath(pathname: string): boolean {
  return pathname === "/admin" || pathname === "/admin/";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  /** Login/claim/register lives at /admin only — no portal chrome. */
  if (isAdminLoginPath(pathname)) {
    return <>{children}</>;
  }

  /** Single shell for dashboard routes (sidebar + auth). Other /admin/* fall through without the portal. */
  if (pathname.startsWith("/admin/dashboard")) {
    return <AdminPortalShell>{children}</AdminPortalShell>;
  }

  return <>{children}</>;
}
