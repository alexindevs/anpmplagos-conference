import { redirect } from "next/navigation";

export default function SelectBoothRedirectPage() {
  redirect("/company/sponsorship-plans?tab=booths");
}
