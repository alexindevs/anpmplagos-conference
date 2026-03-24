/**
 * Shared booth labels for exhibitor UI (matches API: name, optional size/tier).
 */

export function boothPrimaryName(booth: {
  name?: string | null;
  hall?: string | null;
}): string {
  return booth.name?.trim() || booth.hall?.trim() || "Booth";
}

/** Size and tier only; join with middle dot when both exist. Null if neither. */
export function boothSizeTierLine(booth: {
  size?: string | null;
  tier?: string | null;
}): string | null {
  const size = booth.size?.trim() || "";
  const tier = booth.tier?.trim() || "";
  if (!size && !tier) return null;
  if (size && tier) return `${size} · ${tier}`;
  return size || tier;
}
