import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moderator Portal - ANPMP Lagos Conference 2026",
  description: "Attendance moderator portal for ANPMP Lagos Conference 2026",
};

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
