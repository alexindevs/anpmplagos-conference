import SponsorsDirectory from "./components/SponsorsDirectory";

export const metadata = {
  title: "Our Sponsors - ANPMP Lagos Conference",
};

/** Shell only — sponsor data is fetched client-side after sign-in (see ./layout.tsx). */
export default function SponsorsPage() {
  return <SponsorsDirectory />;
}
