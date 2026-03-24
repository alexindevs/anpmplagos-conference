const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
  options?: RequestInit & { skipContentType?: boolean }
): Promise<T> {
  const { skipContentType, ...init } = options ?? {};
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
  return authFetch<RefreshResponse>("/api/auth/refresh", {
    method: "POST",
  });
}

export async function getMe(): Promise<AuthUser> {
  return authFetch<AuthUser>("/api/auth/me");
}

export async function logoutAll(): Promise<{ message: string }> {
  return authFetch<{ message: string }>("/api/auth/logout-all", {
    method: "POST",
  });
}
