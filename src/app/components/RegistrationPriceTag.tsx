"use client";

import { useQuery } from "@tanstack/react-query";
import { getConferenceRegistrationPricing, formatKoboToNaira } from "@/lib/api";

export function RegistrationPriceTag({ type }: { type: "member" | "nonMember" }) {
  const { data: pricing } = useQuery({
    queryKey: ["conference-registration-pricing"],
    queryFn: getConferenceRegistrationPricing,
    staleTime: 5 * 60 * 1000,
  });

  const price = type === "member" ? pricing?.memberPriceKobo : pricing?.nonMemberPriceKobo;
  return <>{price != null ? formatKoboToNaira(price) : "..."}</>;
}
