import { redirect } from "next/navigation";

export default function PresentationsRedirectPage() {
  redirect("/company/sponsorship-plans?tab=presentations");
}
