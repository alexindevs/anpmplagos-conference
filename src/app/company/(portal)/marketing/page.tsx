import { redirect } from "next/navigation";

export default function CompanyMarketingRedirectPage() {
  redirect("/company/sponsorship-plans?tab=adverts");
}
