import { redirect } from "next/navigation";

/** Legacy Paystack callback path — forwards query string to the canonical booth callback. */
export default async function LegacyExhibitorPaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) q.append(key, v);
    } else {
      q.set(key, value);
    }
  }
  const suffix = q.toString();
  redirect(`/company/booth/payment-callback${suffix ? `?${suffix}` : ""}`);
}
