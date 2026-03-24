import type { Metadata } from "next";
import { HotelRoomsShell } from "./HotelRoomsShell";

export const metadata: Metadata = {
  title: "Conference Hotel Rooms | ANPMP Lagos",
  description:
    "Browse partner hotel room slots for ANPMP Lagos Conference 2026 and book with your conference account.",
};

export default function HotelRoomsLayout({ children }: { children: React.ReactNode }) {
  return <HotelRoomsShell>{children}</HotelRoomsShell>;
}
