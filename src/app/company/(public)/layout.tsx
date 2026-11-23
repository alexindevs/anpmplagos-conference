import type { Metadata } from "next";
import RequireAccount from "@/app/components/RequireAccount";

/** Members-only profiles: never index, never follow. Also sent as X-Robots-Tag (next.config.ts). */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function PublicCompanyLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccount title="Sign in to view this partner">{children}</RequireAccount>;
}
