"use client";

import { useParams } from "next/navigation";
import { OwnerTicketDetail } from "@/app/components/support/OwnerTicketDetail";

export default function AttendeeSupportTicketPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  if (!id) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-primary/15 bg-background-light/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8 lg:py-4" />
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <OwnerTicketDetail ticketId={id} listHref="/attendee/support" />
      </div>
    </>
  );
}
