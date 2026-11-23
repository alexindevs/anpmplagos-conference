import type { Metadata } from "next";
import CompanyProfile from "./components/CompanyProfile";

type Params = { params: Promise<{ slug: string }> };

/**
 * Generic on purpose: no company data may appear in server-rendered HTML or metadata.
 * Only the slug (already in the URL) is used, for a self-referencing canonical — otherwise the
 * root layout's canonical ("/") is inherited.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "Partner - ANPMP Lagos Conference",
    alternates: { canonical: `/company/${encodeURIComponent(slug)}` },
  };
}

/** Shell only — the profile is fetched client-side after sign-in (see ../layout.tsx). */
export default async function PublicCompanyProfilePage({ params }: Params) {
  const { slug } = await params;
  return <CompanyProfile slug={slug} />;
}
