import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Portal - ANPMP Lagos Conference 2026",
  description: "Member portal for ANPMP Lagos Conference 2026",
};

export default function MemberPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
