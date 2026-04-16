import { redirect } from "next/navigation";

export default function CompanyPanelsRemovedPage() {
  redirect("/company/sponsorship-plans?tab=bundles");
}
