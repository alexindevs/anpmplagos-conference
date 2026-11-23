import SponsorReviewsList from "../components/SponsorReviewsList";

export const metadata = {
  title: "Sponsor Reviews - ANPMP Lagos Conference",
  alternates: { canonical: "/sponsors/reviews" },
};

function pageNumber(searchParams: { [key: string]: string | string[] | undefined }): number {
  const raw = searchParams.page;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = value ? Number(value) : 1;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

/** Shell only — reviews are fetched client-side after sign-in (see ../layout.tsx). */
export default async function SponsorReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const page = pageNumber(await searchParams);
  return <SponsorReviewsList page={page} />;
}
