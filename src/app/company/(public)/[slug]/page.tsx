import CompanyProfile from "./components/CompanyProfile";

/** Generic on purpose: no company data may appear in server-rendered HTML or metadata. */
export const metadata = {
  title: "Partner - ANPMP Lagos Conference",
};

/** Shell only — the profile is fetched client-side after sign-in (see ../layout.tsx). */
export default async function PublicCompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CompanyProfile slug={slug} />;
}
