import type { Metadata } from "next";
import RequireAccount from "../components/RequireAccount";

/** Members-only section: never index, never follow. Mirrored in robots.ts and next.config.ts headers. */
export const metadata: Metadata = {
  // Self-referencing canonical; otherwise the root layout's canonical ("/") is inherited.
  alternates: { canonical: "/sponsors" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function SponsorsLayout({ children }: { children: React.ReactNode }) {
  return <RequireAccount title="Sign in to view our sponsors">{children}</RequireAccount>;
}
