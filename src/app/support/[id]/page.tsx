"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/use-auth-session";
import { OwnerTicketDetail } from "@/app/components/support/OwnerTicketDetail";

export default function SupportTicketPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const { data: user, isPending: userLoading } = useAuthSession();

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [user, userLoading, router]);

  if (userLoading || !user || !id) {
    return (
      <div className="flex min-h-screen items-center justify-center py-24">
        <div className="size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <header className="border-b border-primary/15 bg-background-light/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8 lg:py-4" />
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <OwnerTicketDetail ticketId={id} listHref="/support" />
      </div>
    </div>
  );
}
