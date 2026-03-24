import { cache } from "react";
import { notFound } from "next/navigation";
import ConferenceProfilePublicPage from "@/app/components/ConferenceProfilePublicPage";
import { getPublicSpecialGuestBySlug } from "@/lib/api";

export const dynamic = "force-dynamic";

const getProfile = cache(async (slug: string) => getPublicSpecialGuestBySlug(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProfile(slug);
  if (!p) return { title: "Special guest - ANPMP Conference" };
  return {
    title: `${p.name} | Special guests - ANPMP Conference`,
    description: p.byline?.trim() || p.role || `Special guest: ${p.name}`,
  };
}

export default async function PublicSpecialGuestProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) notFound();

  return (
    <ConferenceProfilePublicPage
      profile={profile}
      listHref="/speakers#special-guests"
      listLabel="Speakers"
      roleLabel="Special guest"
    />
  );
}
