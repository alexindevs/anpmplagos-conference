import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendee Portal - ANPMP Lagos Conference 2026",
  description: "Attendee portal for ANPMP Lagos Conference 2026",
};

export default function AttendeePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
