"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { OwnerTicketDetail } from "@/app/components/support/OwnerTicketDetail";

export default function SupportTicketDeepLinkPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const { data: user, isPending: userLoading } = useAuthSession();

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [user, userLoading, router, id]);

  if (userLoading || !user || !id) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-background-light px-4">
        <div className="size-10 animate-spin rounded-full border-4 border-secondary/30 border-t-secondary" />
      </main>
    );
  }

  const listHref =
    user.regType === "company" || user.regType === "exhibitor" || user.regType === "sponsor"
      ? "/company/support"
      : "/";

  const listLabel =
    user.regType === "company" || user.regType === "exhibitor" || user.regType === "sponsor"
      ? "Back to support"
      : "Home";

  return (
    <main className="min-h-screen bg-background-light px-4 py-10 sm:px-8">
      <div className="mx-auto mb-8 flex max-w-3xl items-center justify-between gap-4">
        <Link href="/" className="text-sm font-bold text-secondary hover:underline">
          ANPMP Conference
        </Link>
      </div>
      <div className="mx-auto max-w-3xl">
        <OwnerTicketDetail ticketId={id} listHref={listHref} listLabel={listLabel} />
      </div>
    </main>
  );
}
