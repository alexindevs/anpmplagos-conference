/** Routes that use a full-page portal shell (no marketing header/footer). */
export function isPortalRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/company") ||
    pathname.startsWith("/hotel-rooms")
  );
}
