import { cache } from "react";
import { notFound } from "next/navigation";
import ConferenceProfilePublicPage from "@/app/components/ConferenceProfilePublicPage";
import { getPublicSpeakerBySlug } from "@/lib/api";

export const dynamic = "force-dynamic";

const getProfile = cache(async (slug: string) => getPublicSpeakerBySlug(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProfile(slug);
  if (!p) return { title: "Speaker - ANPMP Conference" };
  return {
    title: `${p.name} | Speakers - ANPMP Conference`,
    description: p.byline?.trim() || p.role || `Speaker: ${p.name}`,
  };
}

export default async function PublicSpeakerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) notFound();

  return (
    <ConferenceProfilePublicPage
      profile={profile}
      listHref="/speakers"
      listLabel="Speakers"
      roleLabel="Speaker"
    />
  );
}
