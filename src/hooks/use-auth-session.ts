import { useQuery } from "@tanstack/react-query";
import { getMe, refresh, type AuthUser } from "@/lib/auth-api";

/** Shared key — invalidate this after login/register/logout so the Header updates. */
export const authSessionQueryKey = ["auth", "me"] as const;

/** Resolves current user; tries refresh if access session expired. */
export async function fetchAuthSession(): Promise<AuthUser | null> {
  try {
    return await getMe();
  } catch {
    try {
      const { user } = await refresh();
      return user;
    } catch {
      return null;
    }
  }
}

export function useAuthSession() {
  return useQuery({
    queryKey: authSessionQueryKey,
    queryFn: fetchAuthSession,
    // Must stay fresh: Header stays mounted across routes; cached `null` would hide logged-in users.
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
