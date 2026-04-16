import type { PublicCompany } from "@/lib/api";

/** Tier fields shared by public list rows and full public profiles. */
export type PublicTierSource = {
  highestSponsorshipTier?: string | null;
  effectiveDisplayTier?: string | null;
  tier?: string | null;
};

/**
 * Canonical display tier key for grouping. Empty, missing, and `"default"` all map to `"default"`.
 */
export function normalizedPublicSponsorTierKey(e: PublicTierSource): string {
  const raw = (e.highestSponsorshipTier ?? e.effectiveDisplayTier ?? e.tier ?? "").trim().toLowerCase();
  if (!raw || raw === "default") return "default";
  return raw;
}

export function isDefaultPublicSponsorTier(e: PublicTierSource): boolean {
  return normalizedPublicSponsorTierKey(e) === "default";
}

export function hasAssignedPublicBooth(c: PublicCompany): boolean {
  return Boolean(c.booth?.id);
}

/**
 * “Our valued sponsors”: default directory tier, no assigned booth, no active sponsorship plan,
 * and a qualifying paid purchase (see `hasCompletedPaidPurchase` on `PublicCompany`).
 *
 * When `hasCompletedPaidPurchase` is omitted, rows are treated as eligible so older API payloads
 * still render; send `false` for companies that should not appear there.
 */
export function isOurValuedSponsorRow(c: PublicCompany): boolean {
  if (!isDefaultPublicSponsorTier(c)) return false;
  if (hasAssignedPublicBooth(c)) return false;
  if (c.hasActiveSponsorshipPlan === true) return false;
  if (c.hasCompletedPaidPurchase === false) return false;
  return true;
}

/** Short tier label for card badges; never surfaces `"Default"`. */
export function publicSponsorTierBadgeLabel(e: PublicTierSource): string {
  if (isDefaultPublicSponsorTier(e)) return "";
  const k = normalizedPublicSponsorTierKey(e);
  if (k === "headliner") return "Headliner";
  if (k === "platinum") return "Platinum";
  if (k === "gold") return "Gold";
  if (k === "silver") return "Silver";
  if (k === "bronze") return "Bronze";
  return k.charAt(0).toUpperCase() + k.slice(1);
}

/** Section title for a non-default tier group: `"{Name} Partners"`. */
export function publicSponsorTierSectionTitle(tierKey: string): string {
  const k = tierKey.trim().toLowerCase();
  if (!k || k === "default") return "Partners";
  const name = publicSponsorTierBadgeLabel({ tier: k, effectiveDisplayTier: null, highestSponsorshipTier: null });
  return `${name} Partners`;
}
