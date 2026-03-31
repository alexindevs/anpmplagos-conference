/**
 * Company logo URL: prefer API `logo`, fall back to legacy `profileImage` (pre–logo column).
 */
export function companyLogoImageUrl(row: {
  logo?: string | null | undefined;
  profileImage?: string | null | undefined;
}): string {
  return (row.logo?.trim() || row.profileImage?.trim() || "").trim();
}

/** Admin registrations list: company rows use `logo`; other types use `profileImage`. */
export function adminRegistrationAvatarUrl(row: {
  type: string;
  profileImage: string | null;
  logo?: string | null;
}): string {
  if (row.type?.toLowerCase() === "company") {
    return companyLogoImageUrl(row);
  }
  return row.profileImage?.trim() || "";
}
