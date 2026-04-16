import { redirect } from "next/navigation";

export default function MasterclassesRedirectPage() {
  redirect("/company/sponsorship-plans?tab=masterclasses");
}
