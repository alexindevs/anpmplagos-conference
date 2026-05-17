import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let refreshPromise: Promise<RefreshResponse> | null = null;

export interface AuthAdmin {
  name: string;
  adminType: string;
  avatar: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  /** When present (e.g. from `/auth/me`), used for hotel-room booking eligibility. */
  registrationStatus?: string;
  regType: "admin" | "member" | "attendee" | "company" | "exhibitor" | "sponsor";
  admin?: AuthAdmin;
  member?: { fullName: string };
  attendee?: { fullName: string };
  /** Unified company account (preferred). */
  company?: { id: string; companyName: string };
  /** @deprecated Prefer `company` — kept for transitional APIs. */
  exhibitor?: { id: string; companyName: string };
  /** @deprecated Prefer `company` — kept for transitional APIs. */
  sponsor?: { id: string; companyName: string };
}

/** Company id from JWT/session (new `company` or legacy exhibitor/sponsor). */
export function getCompanyIdFromAuthUser(user: AuthUser | null | undefined): string {
  if (!user) return "";
  return (
    user.company?.id?.trim() ||
    user.exhibitor?.id?.trim() ||
    user.sponsor?.id?.trim() ||
    ""
  );
}

export function getCompanyNameFromAuthUser(user: AuthUser | null | undefined): string {
  if (!user) return "";
  return (
    user.company?.companyName?.trim() ||
    user.exhibitor?.companyName?.trim() ||
    user.sponsor?.companyName?.trim() ||
    ""
  );
}

export function isCompanyRegType(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  return (
    user.regType === "company" ||
    user.regType === "exhibitor" ||
    user.regType === "sponsor"
  );
}

export function isModeratorUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  return user.regType === "admin" && user.admin?.adminType === "moderator";
}

export function isAdminUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  return user.regType === "admin" && user.admin?.adminType !== "moderator";
}

export interface LoginResponse {
  user: AuthUser;
}

export interface RefreshResponse {
  user: AuthUser;
}

export class AuthApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function authFetch<T>(
  path: string,
  options?: RequestInit & { skipContentType?: boolean; _isRetry?: boolean }
): Promise<T> {
  const { skipContentType, _isRetry, ...init } = options ?? {};
  const url = new URL(path.startsWith("/") ? path : `/${path}`, API_BASE);
  const headers = new Headers(init.headers);
  if (!skipContentType && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url.toString(), {
    ...init,
    credentials: "include",
    headers,
  });

  const isAuthEndpoint =
    path.includes("/api/auth/me") ||
    path.includes("/api/auth/refresh") ||
    path.includes("/api/auth/login") ||
    path.includes("/api/registrations");
  if (res.status === 401 && !_isRetry && !isAuthEndpoint) {
    try {
      await refresh();
      return authFetch<T>(path, { ...options, _isRetry: true });
    } catch {
      useAuthStore.getState().clearUser();
      if (typeof window !== "undefined") window.location.replace("/login");
      throw new AuthApiError(401, "Session expired");
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AuthApiError(res.status, (body?.message as string) ?? res.statusText, body);
  }
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return authFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<{ message: string }> {
  return authFetch<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function refresh(): Promise<RefreshResponse> {
  refreshPromise ??= authFetch<RefreshResponse>("/api/auth/refresh", { method: "POST" })
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function getMe(): Promise<AuthUser> {
  return authFetch<AuthUser>("/api/auth/me");
}

export async function logoutAll(): Promise<{ message: string }> {
  return authFetch<{ message: string }>("/api/auth/logout-all", {
    method: "POST",
  });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return authFetch<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function validateResetToken(
  token: string
): Promise<{ email: string }> {
  return authFetch<{ email: string }>(
    `/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`
  );
}

export async function resetPassword(
  token: string,
  password: string
): Promise<{ message: string }> {
  return authFetch<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export async function validateModeratorInvite(
  token: string
): Promise<{ email: string; expiresAt: string }> {
  return authFetch<{ email: string; expiresAt: string }>(
    `/api/auth/moderator/validate-invite?token=${encodeURIComponent(token)}`
  );
}

export async function registerModerator(
  token: string,
  password: string
): Promise<{ user: AuthUser }> {
  return authFetch<{ user: AuthUser }>("/api/auth/moderator/register", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export async function deleteAdminAccount(
  password: string,
  adminCode: string
): Promise<{ message: string }> {
  return authFetch<{ message: string }>("/api/admin/me", {
    method: "DELETE",
    body: JSON.stringify({ password, adminCode }),
  });
}
