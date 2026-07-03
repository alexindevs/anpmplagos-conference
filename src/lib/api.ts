import { refresh } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string>; _isRetry?: boolean }
): Promise<T> {
  const { params, _isRetry, ...init } = options ?? {};
  const url = new URL(path.startsWith("/") ? path : `/${path}`, API_BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url.toString(), {
    ...init,
    credentials: "include",
    headers,
  });

  if (res.status === 401 && !_isRetry) {
    try {
      await refresh();
      return apiFetch<T>(path, { ...options, _isRetry: true });
    } catch {
      useAuthStore.getState().clearUser();
      if (typeof window !== "undefined") window.location.replace("/login");
      throw new ApiError(401, "Session expired");
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.message ?? res.statusText, body);
  }
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface Booth {
  id: string;
  name?: string;
  code?: string;
  /** Legacy location fields; newer API payloads may omit these. */
  hall?: string;
  floorSection?: string;
  description: string | null;
  size?: string;
  /** When present (e.g. on assigned booth), sponsor / booth tier label. */
  tier?: string | null;
  /** Amount in kobo (1 ₦ = 100). */
  price?: number;
  isReserved?: boolean;
  isTaken: boolean;
  /** When occupied, admin list may include company id for unassign (new API). */
  companyId?: string | null;
  /** @deprecated Prefer `companyId` */
  exhibitorId?: string | null;
  /** Public URL when admin uploaded a booth image (backend may return as boothImage or imageUrl). */
  boothImage?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getAvailableBooths(): Promise<Booth[]> {
  const booths = await apiFetch<Booth[]>("/api/companies/booths/available");
  return booths.filter((b) => !b.isTaken);
}

// ==================== Exhibitor Portal Types & APIs ====================

/** Representative for an exhibitor booth */
export interface ExhibitorRepresentative {
  id: string;
  name: string;
  title: string;
  phone: string;
  createdAt?: string;
}

/** Product/service line item for an exhibitor profile */
export interface ExhibitorProduct {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  sortOrder?: number;
  whatsappClickCount?: number;
  createdAt?: string;
}

/** Exhibitor profile (full detail from GET /me) */
export interface ExhibitorProfile {
  id: string;
  slug?: string;
  companyName: string;
  tagline?: string;
  description?: string;
  website?: string;
  contactEmail: string;
  primaryContactName: string;
  primaryContactPhone: string;
  boothPreference?: string;
  hotelBookingUrl?: string;
  tier?: string;
  highestSponsorshipTier?: string | null;
  effectiveDisplayTier?: string | null;
  headerImage?: string;
  /** Company logo (Cloudinary URL). */
  logo?: string;
  /** @deprecated Prefer `logo`; may still be present on older API payloads */
  profileImage?: string;
  profileViews?: number;
  representatives?: ExhibitorRepresentative[];
  products?: ExhibitorProduct[];
  booth?: Booth | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Dashboard aggregated stats */
export interface ExhibitorDashboardStats {
  profileViews: number;
  totalMembers: number;
  inquiryRatePercent: number;
  whatsappProductClicks: number;
}

/** Booth status for dashboard */
export interface ExhibitorBoothStatus {
  status: "none" | "pending_payment" | "assigned";
  assignedBooth?: Booth | null;
  pendingPayment?: {
    id: string;
    reference: string;
    amount: number;
    status: string;
  } | null;
}

/** Dashboard overview response */
export interface ExhibitorDashboard {
  companyName: string;
  slug?: string;
  stats: ExhibitorDashboardStats;
  booth: ExhibitorBoothStatus;
  hotelBookingUrl?: string;
}

/** Update profile payload (PATCH /me) */
export interface UpdateExhibitorProfileInput {
  companyName?: string;
  tagline?: string;
  description?: string;
  boothPreference?: string;
  website?: string;
  contactEmail?: string;
  primaryContactName?: string;
  primaryContactPhone?: string;
  whatsappNumber?: string;
  logo?: File | null;
  headerImage?: File | null;
}

/** Create representative */
export interface CreateRepresentativeInput {
  name: string;
  title: string;
  phone: string;
}

/** Update representative */
export interface UpdateRepresentativeInput {
  name?: string;
  title?: string;
  phone?: string;
}

/** Create product */
export interface CreateProductInput {
  name: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  sortOrder?: number;
}

/** Update product */
export interface UpdateProductInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  sortOrder?: number;
}

/** GET /api/companies/public/{slug}/products/{productId}/whatsapp */
export async function getProductWhatsAppContact(slug: string, productId: string): Promise<{ redirectUrl: string }> {
  return apiFetch<{ redirectUrl: string }>(`/api/companies/public/${slug}/products/${productId}/whatsapp`);
}

// ==================== Exhibitor Portal API Functions ====================

/** GET /api/companies/me/dashboard - stats + booth status */
export async function getExhibitorDashboard(): Promise<ExhibitorDashboard> {
  return apiFetch<ExhibitorDashboard>("/api/companies/me/dashboard");
}

/** GET /api/companies/me - full profile */
export async function getExhibitorProfile(): Promise<ExhibitorProfile> {
  return apiFetch<ExhibitorProfile>("/api/companies/me");
}

/** PATCH /api/companies/me - update profile */
export async function updateExhibitorProfile(input: UpdateExhibitorProfileInput): Promise<ExhibitorProfile> {
  const fd = new FormData();
  const textFields = ["companyName","tagline","description","boothPreference","website","contactEmail","primaryContactName","primaryContactPhone","whatsappNumber"] as const;
  for (const k of textFields) {
    if (input[k] !== undefined) fd.append(k, input[k] as string);
  }
  if (input.logo instanceof File) fd.append("logo", input.logo);
  if (input.headerImage instanceof File) fd.append("headerImage", input.headerImage);
  return apiFetch<ExhibitorProfile>("/api/companies/me", { method: "PATCH", body: fd });
}

/** GET /api/companies/me/booth - booth status */
export async function getExhibitorBooth(): Promise<ExhibitorBoothStatus> {
  return apiFetch<ExhibitorBoothStatus>("/api/companies/me/booth");
}

/** GET /api/companies/me/representatives */
export async function getExhibitorRepresentatives(): Promise<ExhibitorRepresentative[]> {
  return apiFetch<ExhibitorRepresentative[]>("/api/companies/me/representatives");
}

/** POST /api/companies/me/representatives */
export async function createExhibitorRepresentative(
  input: CreateRepresentativeInput
): Promise<ExhibitorRepresentative> {
  return apiFetch<ExhibitorRepresentative>("/api/companies/me/representatives", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** PATCH /api/companies/me/representatives/:id */
export async function updateExhibitorRepresentative(
  id: string,
  input: UpdateRepresentativeInput
): Promise<ExhibitorRepresentative> {
  return apiFetch<ExhibitorRepresentative>(`/api/companies/me/representatives/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** DELETE /api/companies/me/representatives/:id */
export async function deleteExhibitorRepresentative(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/companies/me/representatives/${id}`, {
    method: "DELETE",
  });
}

/** GET /api/companies/me/products */
export async function getExhibitorMyProducts(): Promise<ExhibitorProduct[]> {
  return apiFetch<ExhibitorProduct[]>("/api/companies/me/products");
}

/** Multipart field name for product image (must match backend). */
const EXHIBITOR_PRODUCT_IMAGE_FIELD = "productImage";

function appendProductFormFields(fd: FormData, input: CreateProductInput | UpdateProductInput) {
  if (input.name !== undefined) fd.append("name", input.name);
  if (input.description !== undefined && input.description !== null) {
    fd.append("description", input.description);
  }
  if (input.linkUrl !== undefined && input.linkUrl !== null) {
    fd.append("linkUrl", input.linkUrl);
  }
  if (input.sortOrder !== undefined && input.sortOrder !== null) {
    fd.append("sortOrder", String(input.sortOrder));
  }
}

/** POST /api/companies/me/products — JSON, or multipart when `imageFile` is set (`productImage` field). */
export async function createExhibitorProduct(
  input: CreateProductInput,
  imageFile?: File | null
): Promise<ExhibitorProduct> {
  if (imageFile) {
    const fd = new FormData();
    appendProductFormFields(fd, input);
    fd.append(EXHIBITOR_PRODUCT_IMAGE_FIELD, imageFile);
    return apiFetch<ExhibitorProduct>("/api/companies/me/products", {
      method: "POST",
      body: fd,
    });
  }
  return apiFetch<ExhibitorProduct>("/api/companies/me/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** PATCH /api/companies/me/products/:id — JSON, or multipart when replacing the image. */
export async function updateExhibitorProduct(
  id: string,
  input: UpdateProductInput,
  imageFile?: File | null
): Promise<ExhibitorProduct> {
  if (imageFile) {
    const fd = new FormData();
    appendProductFormFields(fd, input);
    fd.append(EXHIBITOR_PRODUCT_IMAGE_FIELD, imageFile);
    return apiFetch<ExhibitorProduct>(`/api/companies/me/products/${id}`, {
      method: "PATCH",
      body: fd,
    });
  }
  return apiFetch<ExhibitorProduct>(`/api/companies/me/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** DELETE /api/companies/me/products/:id */
export async function deleteExhibitorProduct(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/companies/me/products/${id}`, {
    method: "DELETE",
  });
}

/** Floor / sponsorship tier for a booth slot (admin create). Matches backend enum casing. */
export type BoothTier = "headliner" | "platinum" | "gold" | "silver" | "bronze";

export const BOOTH_TIER_OPTIONS: readonly BoothTier[] = [
  "headliner",
  "platinum",
  "gold",
  "silver",
  "bronze",
] as const;

export type AdminCreateBoothInput = {
  /** Display title for the booth (maps to `name` on the API). */
  name: string;
  description?: string | null;
  /** Free-text size label, e.g. "3m × 3m". */
  size: string;
  /** Price in kobo (e.g. ₦50,000 → 5_000_000). Sent as form field `price`. */
  price: number;
  /** Sent as form field `tier`. */
  tier: BoothTier;
  isReserved?: boolean;
  /** Optional image file; sent as multipart field `boothImage` (matches backend). */
  boothImageFile?: File | null;
  /** Number of identical slots to create (1–500). Defaults to 1. */
  quantity?: number;
};

const ADMIN_BOOTH_IMAGE_FIELD = "boothImage";

/** GET /api/admin/booths — list booths for admin dashboard. */
export async function getAdminBooths(): Promise<Booth[]> {
  return apiFetch<Booth[]>("/api/admin/booths");
}

export async function adminReserveBooth(id: string): Promise<Booth> {
  return apiFetch<Booth>(`/api/admin/booths/${id}/reserve`, { method: "PATCH" });
}

export async function adminUnreserveBooth(id: string): Promise<Booth> {
  return apiFetch<Booth>(`/api/admin/booths/${id}/unreserve`, { method: "PATCH" });
}

/**
 * POST /api/admin/booths — multipart/form-data with field `boothImage` when a file is provided.
 * Text fields are always sent as form fields so multer-style handlers work consistently.
 */
export async function adminCreateBooth(input: AdminCreateBoothInput): Promise<Booth | { created: number }> {
  const fd = new FormData();
  fd.append("name", input.name);
  fd.append("description", input.description ?? "");
  fd.append("size", input.size);
  fd.append("tier", input.tier);
  fd.append("price", String(Math.round(input.price)));
  fd.append("isReserved", input.isReserved ? "true" : "false");
  if (input.quantity && input.quantity > 1) {
    fd.append("quantity", String(input.quantity));
  }
  if (input.boothImageFile) {
    fd.append(ADMIN_BOOTH_IMAGE_FIELD, input.boothImageFile);
  }
  return apiFetch<Booth | { created: number }>("/api/admin/booths", {
    method: "POST",
    body: fd,
  }) as Promise<Booth | { created: number }>;
}

/** Parse user-entered naira (e.g. "50000" or "50,000") into kobo. */
export function parseNairaInputToKobo(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const naira = parseFloat(cleaned);
  if (Number.isNaN(naira) || naira < 0) return null;
  return Math.round(naira * 100);
}

/**
 * Coerce kobo amounts from the API: JSON number or integer string (safe for large totals).
 * Clamps to `Number.MAX_SAFE_INTEGER` / `MIN_SAFE_INTEGER` when the string exceeds JS safe range.
 */
export function parseKoboField(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "bigint") {
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  }
  const s = String(value).trim().replace(/,/g, "");
  if (!s) return 0;
  if (!/^-?\d+$/.test(s)) {
    const n = Number(s);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  }
  try {
    const bi = BigInt(s);
    const hi = BigInt(Number.MAX_SAFE_INTEGER);
    const lo = BigInt(Number.MIN_SAFE_INTEGER);
    if (bi > hi) return Number.MAX_SAFE_INTEGER;
    if (bi < lo) return Number.MIN_SAFE_INTEGER;
    return Number(bi);
  } catch {
    const n = Number(s);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  }
}

export interface RegistrationResponse {
  id: string;
  status: string;
  createdAt: string;
  message: string;
}

export interface MdcnLookupResult {
  name: string;
  hospitalName: string;
  zone: string;
  telephone: string;
  email: string;
}

export async function lookupMdcnMember(mdcnNo: string): Promise<MdcnLookupResult> {
  return apiFetch<MdcnLookupResult>('/api/registrations/lookup-member', {
    params: { mdcnNo },
  });
}

export type SponsorStatus = "pending_pledge" | "pending_payment" | "active" | "cancelled";
export type SponsorTier = "headliner" | "platinum" | "gold" | "silver" | "custom";
export type SessionStatus = "draft" | "published" | "cancelled";

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface SponsorSummary {
  id: string;
  slug?: string;
  companyName: string;
  tagline?: string;
  website?: string;
  contactEmail: string;
  primaryContactName: string;
  primaryContactPhone: string;
  sponsorAmount?: number;
  status: SponsorStatus;
  tier?: SponsorTier;
  highestSponsorshipTier?: string | null;
  logo?: string;
  headerImage?: string;
  booth?: Booth | null;
  createdAt: string;
  updatedAt?: string;
}

export interface SponsorDetail extends SponsorSummary {
  userId?: string;
  boothId?: string | null;
  user?: { email: string; registrationStatus: string };
  masterclasses?: MasterclassSession[];
  panels?: PanelSession[];
}

/** Unified admin company row (`GET /api/admin/companies`). */
export interface ExhibitorSummary {
  id: string;
  slug?: string;
  companyName: string;
  tagline?: string;
  website?: string;
  contactEmail: string;
  primaryContactName: string;
  primaryContactPhone: string;
  boothPreference?: string;
  headerImage?: string;
  /** Company logo */
  logo?: string;
  /** @deprecated Prefer `logo` */
  profileImage?: string;
  highestSponsorshipTier?: string | null;
  tier?: SponsorTier | string;
  sponsorAmount?: number;
  status?: string;
  user?: { email: string; registrationStatus: string };
  booth?: Booth | null;
  representatives?: { id?: string; name: string; title: string; phone: string }[];
  createdAt: string;
  /** Running total of sponsorship-related payments (kobo); may be a string on the wire. */
  sponsorshipPaidTotalKobo?: number;
}

export type CompanySummary = ExhibitorSummary;

export interface ExhibitorDetail extends ExhibitorSummary {
  updatedAt?: string;
}

export interface MasterclassSession {
  id: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  /** Slot shape for inventory / bundles (API: `slotDuration` + `conferenceDay`). */
  slotDuration?: SessionSlotDuration;
  conferenceDay?: ConferenceDay;
  priceInKobo?: number;
  companyId?: string | null;
  company?: { id: string; companyName: string };
  /** @deprecated Use `company` */
  sponsorId?: string | null;
  /** @deprecated Use `company` */
  sponsor?: { id: string; companyName: string };
  speaker?: string;
  duration?: string;
  status: SessionStatus;
  /** Slot inventory (SESSIONS-API.md) */
  isTaken?: boolean;
  isReserved?: boolean;
  takenById?: string | null;
  takenBy?: { id: string; companyName: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PanelSession {
  id: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  slotDuration?: SessionSlotDuration;
  conferenceDay?: ConferenceDay;
  companyId?: string | null;
  company?: { id: string; companyName: string };
  /** @deprecated Use `company` */
  sponsorId?: string | null;
  /** @deprecated Use `company` */
  sponsor?: { id: string; companyName: string };
  moderator?: string;
  slots?: string;
  status: SessionStatus;
  priceInKobo?: number;
  isTaken?: boolean;
  isReserved?: boolean;
  takenById?: string | null;
  takenBy?: { id: string; companyName: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Presentation slots — same inventory shape as masterclasses / panels (SESSIONS-API.md). */
export interface PresentationSession {
  id: string;
  title: string;
  description?: string;
  slotDuration?: SessionSlotDuration;
  conferenceDay?: ConferenceDay;
  priceInKobo: number;
  status: SessionStatus;
  isTaken?: boolean;
  isReserved?: boolean;
  takenById?: string | null;
  takenBy?: { id: string; companyName: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export type SessionPaymentType = "masterclass" | "panel" | "presentation";

export interface SessionSlotCatalogItem {
  id: string;
  title: string;
  description: string;
  priceInKobo: number;
  createdAt?: string;
}

function normalizeSessionSlotCatalogItemFromWire(raw: unknown): SessionSlotCatalogItem {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid session slot payload");
  }
  const o = raw as Record<string, unknown>;
  const s = { ...(raw as object) } as SessionSlotCatalogItem;
  s.priceInKobo = parseKoboField(o.priceInKobo);
  return s;
}

export interface AvailableSessionSlotsResponse {
  masterclasses: SessionSlotCatalogItem[];
  panelSessions: SessionSlotCatalogItem[];
  presentations: SessionSlotCatalogItem[];
}

export interface CompanyOwnedSessionSlot {
  id: string;
  title: string;
  description?: string;
  priceInKobo: number;
  status: SessionStatus;
  isTaken?: boolean;
  isReserved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PendingSessionPayment {
  reference: string;
  kind: SessionPaymentType;
  sessionId: string;
  amount: number;
  baseAmount: number;
  createdAt: string;
}

export interface CompanyMeSessionsResponse {
  masterclasses: CompanyOwnedSessionSlot[];
  panelSessions: CompanyOwnedSessionSlot[];
  presentations: CompanyOwnedSessionSlot[];
  pendingSessionPayments: PendingSessionPayment[];
}

function normalizePendingSessionPayment(item: unknown): PendingSessionPayment | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  if (
    typeof o.reference === "string" &&
    typeof o.kind === "string" &&
    typeof o.sessionId === "string"
  ) {
    return {
      reference: o.reference,
      kind: o.kind as SessionPaymentType,
      sessionId: o.sessionId,
      amount: parseKoboField(o.amount),
      baseAmount: parseKoboField(o.baseAmount),
      createdAt: typeof o.createdAt === "string" ? o.createdAt : "",
    };
  }
  const payment = o.payment as Record<string, unknown> | undefined;
  const sessionType = o.sessionType as string | undefined;
  const session = o.session as Record<string, unknown> | undefined;
  if (payment && typeof payment.reference === "string" && session && typeof session.id === "string") {
    const st = sessionType ?? "";
    const kind: SessionPaymentType =
      st === "panel" ? "panel" : st === "presentation" ? "presentation" : "masterclass";
    return {
      reference: payment.reference,
      kind,
      sessionId: String(session.id),
      amount: parseKoboField(payment.amount),
      baseAmount: parseKoboField(payment.baseAmount),
      createdAt: typeof payment.createdAt === "string" ? payment.createdAt : "",
    };
  }
  return null;
}

function normalizePendingSessionPaymentsList(value: unknown): PendingSessionPayment[] {
  if (!Array.isArray(value)) return [];
  const out: PendingSessionPayment[] = [];
  for (const item of value) {
    const p = normalizePendingSessionPayment(item);
    if (p) out.push(p);
  }
  return out;
}

/** Booth row from GET /api/admin/dashboard/summary → booths.all */
export interface AdminDashboardSummaryBoothTakenBy {
  id: string;
  name: string;
  slug?: string;
  /** @deprecated Removed in company API; optional for older backends */
  kind?: "exhibitor" | "sponsor" | "company";
}

export interface AdminDashboardSummaryBooth {
  id: string;
  name: string;
  size: string;
  /** Amount in kobo */
  price: number;
  boothImage?: string | null;
  description: string | null;
  tier?: string | null;
  /** When present, used for ordering within tier / untiered booths (oldest first). */
  createdAt?: string | null;
  isTaken: boolean;
  isReserved?: boolean;
  takenBy: AdminDashboardSummaryBoothTakenBy | null;
}

export interface AdminDashboardRecentRegistration {
  userId: string;
  name: string;
  profilePicture: string | null;
  /** Company logo when API returns it separately from `profilePicture`. */
  logo?: string | null;
  regType: string;
  regTypeLabel: string;
  createdAt: string;
}

export interface AdminDashboardSummary {
  recentRegistrations?: AdminDashboardRecentRegistration[];
  registrations: {
    total: number;
    members: number;
    attendees: number;
    companies?: number;
    /** @deprecated Use `companies` */
    exhibitors?: number;
    /** @deprecated Use `companies` */
    sponsors?: number;
  };
  booths: {
    total: number;
    available: number;
    reserved: number;
    occupied: number;
    all?: AdminDashboardSummaryBooth[];
  };
  sessions: {
    masterclasses: number;
    panels: number;
  };
  sponsorships: {
    companyAccounts?: number;
    paidPlanRevenueKobo?: number;
    recordedSponsorshipPaidTotalKobo?: number;
    /** Count of distinct companies with at least one successful sponsorship plan payment */
    totalSponsors?: number;
    /** @deprecated Legacy pledge metrics */
    activeSponsors?: number;
    totalPledged?: number;
    totalActive?: number;
  };
  revenue?: {
    /** Total revenue from all successful payments (reconciled-aware), in kobo */
    totalRevenueKobo?: number;
  };
}

export interface AdminSponsorsQuery {
  page?: number;
  pageSize?: number;
  status?: SponsorStatus;
  tier?: SponsorTier;
  search?: string;
}

export function formatKoboToNaira(valueInKobo?: number): string {
  const naira = (valueInKobo ?? 0) / 100;
  return `₦${naira.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export interface AdminCompaniesQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: SponsorStatus | string;
  tier?: SponsorTier | string;
}

function normalizeExhibitorSummaryFromWire(raw: unknown): ExhibitorSummary {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid company summary payload");
  }
  const o = raw as Record<string, unknown>;
  const row = { ...(raw as object) } as ExhibitorSummary;
  if ("sponsorshipPaidTotalKobo" in o) row.sponsorshipPaidTotalKobo = parseKoboField(o.sponsorshipPaidTotalKobo);
  if ("sponsorAmount" in o) row.sponsorAmount = parseKoboField(o.sponsorAmount);
  if (row.booth != null) row.booth = normalizeBoothMoneyFields(row.booth) ?? null;
  return row;
}

function normalizeExhibitorDetailFromWire(raw: unknown): ExhibitorDetail {
  return normalizeExhibitorSummaryFromWire(raw) as ExhibitorDetail;
}

export async function getAdminCompanies(
  query: AdminCompaniesQuery = {}
): Promise<PaginatedResponse<CompanySummary>> {
  const params: Record<string, string> = {};
  if (query.page) params.page = String(query.page);
  if (query.pageSize) params.pageSize = String(query.pageSize);
  if (query.status) params.status = String(query.status);
  if (query.tier) params.tier = String(query.tier);
  if (query.search) params.search = query.search;
  const raw = await apiFetch<PaginatedResponse<Record<string, unknown>>>("/api/admin/companies", { params });
  return {
    ...raw,
    items: raw.items.map((item) => normalizeExhibitorSummaryFromWire(item)),
  } as PaginatedResponse<CompanySummary>;
}

export async function getAdminSponsors(query: AdminSponsorsQuery = {}): Promise<PaginatedResponse<SponsorSummary>> {
  const res = await getAdminCompanies({
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    status: query.status,
    tier: query.tier,
  });
  return res as PaginatedResponse<SponsorSummary>;
}

export async function getAdminSponsor(id: string): Promise<SponsorDetail> {
  const raw = await apiFetch<unknown>(`/api/admin/companies/${id}`);
  return normalizeExhibitorDetailFromWire(raw) as SponsorDetail;
}

export async function patchAdminSponsor(
  id: string,
  payload: Partial<{
    companyName: string;
    tagline: string;
    website: string;
    contactEmail: string;
    primaryContactName: string;
    primaryContactPhone: string;
    sponsorAmount: number;
    status: SponsorStatus;
    tier: SponsorTier;
    logo: string;
    headerImage: string;
  }>
): Promise<SponsorDetail> {
  const raw = await apiFetch<unknown>(`/api/admin/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeExhibitorDetailFromWire(raw) as SponsorDetail;
}

export async function postSponsorBooth(sponsorId: string, boothId: string | null): Promise<SponsorDetail> {
  const raw = await apiFetch<unknown>(`/api/admin/companies/${sponsorId}/booth`, {
    method: "POST",
    body: JSON.stringify({ boothId }),
  });
  return normalizeExhibitorDetailFromWire(raw) as SponsorDetail;
}

export interface AdminExhibitorsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function getAdminExhibitors(query: AdminExhibitorsQuery = {}): Promise<PaginatedResponse<ExhibitorSummary>> {
  return getAdminCompanies({
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
  });
}

/**
 * POST /api/admin/companies/:id/booth — assign or unassign booth (`boothId` or `null`).
 * Requires admin auth.
 */
export async function postAdminCompanyBooth(
  companyId: string,
  boothId: string | null
): Promise<ExhibitorDetail> {
  const raw = await apiFetch<unknown>(`/api/admin/companies/${companyId}/booth`, {
    method: "POST",
    body: JSON.stringify({ boothId }),
  });
  return normalizeExhibitorDetailFromWire(raw);
}

/** @deprecated Use `postAdminCompanyBooth` */
export async function putExhibitorBooth(
  exhibitorId: string,
  boothId: string | null
): Promise<ExhibitorDetail> {
  return postAdminCompanyBooth(exhibitorId, boothId);
}

export async function getAdminExhibitor(id: string): Promise<ExhibitorDetail> {
  const raw = await apiFetch<unknown>(`/api/admin/companies/${id}`);
  return normalizeExhibitorDetailFromWire(raw);
}

export async function patchAdminExhibitor(
  id: string,
  payload: Partial<{
    companyName: string;
    tagline: string;
    website: string;
    contactEmail: string;
    primaryContactName: string;
    primaryContactPhone: string;
    boothPreference: string;
    status: string;
    highestSponsorshipTier: string;
  }>
): Promise<ExhibitorDetail> {
  const raw = await apiFetch<unknown>(`/api/admin/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeExhibitorDetailFromWire(raw);
}

export async function patchAdminCompanyImages(
  id: string,
  logo?: File,
  headerImage?: File,
): Promise<ExhibitorDetail> {
  const form = new FormData();
  if (logo) form.append("logo", logo);
  if (headerImage) form.append("headerImage", headerImage);
  const res = await fetch(`${API_BASE}/api/admin/companies/${id}/images`, {
    method: "PATCH",
    credentials: "include",
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as { message?: string }).message ?? "Image upload failed");
  }
  return normalizeExhibitorDetailFromWire(await res.json());
}

/** Admin create body for masterclass / panel / presentation slots (SESSIONS-API.md). */
export interface CreateAdminSessionSlotInput {
  title: string;
  description: string;
  priceInKobo: number;
  /** Required by API for masterclasses and presentations; omit for panel slots if unused. */
  slotDuration?: SessionSlotDuration;
  conferenceDay?: ConferenceDay;
  /** Number of identical slots to create (1–500). Defaults to 1. */
  quantity?: number;
}

export type PatchAdminSessionSlotPayload = Partial<
  CreateAdminSessionSlotInput & {
    status: SessionStatus;
    isReserved: boolean;
    startTime: string;
    endTime: string;
    location: string;
    companyId: string;
    sponsorId: string;
  }
>;

export async function getAdminMasterclasses(): Promise<MasterclassSession[]> {
  return apiFetch<MasterclassSession[]>("/api/admin/masterclasses");
}

export async function postAdminMasterclass(
  payload: CreateAdminSessionSlotInput
): Promise<MasterclassSession> {
  return apiFetch<MasterclassSession>("/api/admin/masterclasses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patchAdminMasterclass(
  id: string,
  payload: PatchAdminSessionSlotPayload
): Promise<MasterclassSession> {
  const body = { ...payload } as Record<string, unknown>;
  if (body.sponsorId && !body.companyId) body.companyId = body.sponsorId;
  delete body.sponsorId;
  return apiFetch<MasterclassSession>(`/api/admin/masterclasses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminMasterclass(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/masterclasses/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminPanels(): Promise<PanelSession[]> {
  return apiFetch<PanelSession[]>("/api/admin/panels");
}

export async function postAdminPanel(payload: CreateAdminSessionSlotInput): Promise<PanelSession> {
  return apiFetch<PanelSession>("/api/admin/panels", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patchAdminPanel(
  id: string,
  payload: PatchAdminSessionSlotPayload
): Promise<PanelSession> {
  const body = { ...payload } as Record<string, unknown>;
  if (body.sponsorId && !body.companyId) body.companyId = body.sponsorId;
  delete body.sponsorId;
  return apiFetch<PanelSession>(`/api/admin/panels/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminPanel(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/panels/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminPresentations(): Promise<PresentationSession[]> {
  return apiFetch<PresentationSession[]>("/api/admin/presentations");
}

export async function postAdminPresentation(
  payload: CreateAdminSessionSlotInput
): Promise<PresentationSession> {
  return apiFetch<PresentationSession>("/api/admin/presentations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patchAdminPresentation(
  id: string,
  payload: PatchAdminSessionSlotPayload
): Promise<PresentationSession> {
  return apiFetch<PresentationSession>(`/api/admin/presentations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminPresentation(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/presentations/${id}`, {
    method: "DELETE",
  });
}

export async function getAvailableSessionSlots(): Promise<AvailableSessionSlotsResponse> {
  const raw = await apiFetch<Record<string, unknown>>("/api/companies/session-slots/available");
  const mapList = (v: unknown) =>
    (Array.isArray(v) ? v : []).map((row) => normalizeSessionSlotCatalogItemFromWire(row));
  return {
    masterclasses: mapList(raw.masterclasses),
    panelSessions: mapList(raw.panelSessions),
    presentations: mapList(raw.presentations),
  };
}

function normalizeCompanyOwnedSessionSlotFromWire(raw: unknown): CompanyOwnedSessionSlot {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid owned session slot payload");
  }
  const o = raw as Record<string, unknown>;
  return { ...(raw as object) as CompanyOwnedSessionSlot, priceInKobo: parseKoboField(o.priceInKobo) };
}

export async function getCompanyMeSessions(): Promise<CompanyMeSessionsResponse> {
  const raw = await apiFetch<Record<string, unknown>>("/api/companies/me/sessions");
  const mapOwned = (v: unknown) =>
    (Array.isArray(v) ? v : []).map((row) => normalizeCompanyOwnedSessionSlotFromWire(row));
  return {
    masterclasses: mapOwned(raw.masterclasses),
    panelSessions: mapOwned(raw.panelSessions),
    presentations: mapOwned(raw.presentations),
    pendingSessionPayments: normalizePendingSessionPaymentsList(raw.pendingSessionPayments),
  };
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  return apiFetch<AdminDashboardSummary>("/api/admin/dashboard/summary");
}

/** `GET /api/admin/registrations/summary` — see ADMIN-REGISTRATIONS-API.md */
export interface AdminRegistrationsSummary {
  members: number;
  attendees: number;
  companies: number;
  speakers: number;
  specialGuests: number;
  totalRegistrations: number;
}

/** Row from `GET /api/admin/registrations` */
export interface AdminRegistrationRow {
  userId: string;
  name: string;
  email: string;
  profileImage: string | null;
  /** Set for `company` rows when API returns it separately from `profileImage`. */
  logo?: string | null;
  /** RegType, e.g. `member`, `attendee`, `company`, `speaker`, `special_guest` */
  type: string;
  registeredAt: string;
  /** `pending_payment`, `registered`, `cancelled` */
  status: string;
  profileUrl: string | null;
  memberDetails?: {
    zone: string;
    state: string;
    hospitalOrg: string;
    primarySpecialty: string;
    organizationAddress: string;
    phone: string;
    anpmpId: string | null;
    hasSpouse: boolean;
    spouseName: string | null;
    spouseEmail: string | null;
    spousePhone: string | null;
    duesPaid: boolean;
  };
  attendeeDetails?: {
    phone: string;
    bio: string | null;
    inMedicalField: boolean;
    primarySpecialty: string | null;
    hospitalOrg: string | null;
    occupation: string | null;
  };
}

/** `GET /api/admin/registrations` paginated response (`limit` not `pageSize`). */
export interface AdminRegistrationsListResponse {
  items: AdminRegistrationRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function getAdminRegistrationsSummary(): Promise<AdminRegistrationsSummary> {
  return apiFetch<AdminRegistrationsSummary>("/api/admin/registrations/summary");
}

export async function getAdminRegistrations(
  query: { page?: number; limit?: number } = {}
): Promise<AdminRegistrationsListResponse> {
  const params: Record<string, string> = {};
  if (query.page != null) params.page = String(query.page);
  if (query.limit != null) params.limit = String(query.limit);
  return apiFetch<AdminRegistrationsListResponse>("/api/admin/registrations", { params });
}

/**
 * Fetches every page (max 100 per request) for client-side search / type / status filters.
 * Avoid for very large directories; prefer server-side filters when the API adds them.
 */
export async function getAllAdminRegistrationsMerged(maxPages = 100): Promise<AdminRegistrationRow[]> {
  const out: AdminRegistrationRow[] = [];
  let page = 1;
  const limit = 100;
  for (;;) {
    const res = await getAdminRegistrations({ page, limit });
    out.push(...res.items);
    if (page >= res.totalPages || res.items.length === 0) break;
    page += 1;
    if (page > maxPages) break;
  }
  return out;
}

export interface BulkImportJob {
  id: string;
  filename: string;
  /** `pending` | `processing` | `done` | `failed` */
  status: string;
  total: number;
  created: number;
  skipped: number;
  errors: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Upload a CSV file for bulk member import.
 * Returns immediately with a `jobId`; poll `getBulkImportJob` for progress.
 */
export async function uploadBulkImport(file: File): Promise<{ jobId: string }> {
  const fd = new FormData();
  fd.append("file", file);
  return apiFetch<{ jobId: string }>("/api/admin/registrations/bulk-import", {
    method: "POST",
    body: fd,
  });
}

export async function getBulkImportJob(jobId: string): Promise<BulkImportJob> {
  return apiFetch<BulkImportJob>(`/api/admin/registrations/bulk-import/${jobId}`);
}

/** `GET /api/gallery` / admin list — see GALLERY-API.md */
export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeGalleryList(value: unknown): GalleryItem[] {
  if (!Array.isArray(value)) return [];
  return value as GalleryItem[];
}

/** Public: list all gallery items, newest first. */
export async function getGallery(): Promise<GalleryItem[]> {
  const raw = await apiFetch<unknown>("/api/gallery");
  return normalizeGalleryList(raw);
}

/** Public: single item; throws `ApiError` with status 404 if missing. */
export async function getGalleryItem(id: string): Promise<GalleryItem> {
  return apiFetch<GalleryItem>(`/api/gallery/${encodeURIComponent(id)}`);
}

/** Admin: same list as public (convenience). */
export async function getAdminGallery(): Promise<GalleryItem[]> {
  const raw = await apiFetch<unknown>("/api/admin/gallery");
  return normalizeGalleryList(raw);
}

export async function getAdminGalleryItem(id: string): Promise<GalleryItem> {
  return apiFetch<GalleryItem>(`/api/admin/gallery/${encodeURIComponent(id)}`);
}

/** `POST /api/admin/gallery` — multipart field `image` (JPEG/PNG, max 5MB), optional `caption`. */
export async function postAdminGallery(input: { image: File; caption?: string }): Promise<GalleryItem> {
  const fd = new FormData();
  fd.append("image", input.image);
  if (input.caption != null && input.caption.trim() !== "") {
    fd.append("caption", input.caption.trim());
  }
  return apiFetch<GalleryItem>("/api/admin/gallery", {
    method: "POST",
    body: fd,
  });
}

export async function deleteAdminGalleryItem(
  id: string
): Promise<{ message: string; id: string }> {
  return apiFetch<{ message: string; id: string }>(`/api/admin/gallery/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ==================== Conference profiles (speakers / special guests) — SPEAKERS-API.md ====================

export type ConferenceProfileKind = "speaker" | "special_guest";

export type ConferenceHighlightType = "keynote" | "featured";

/** Public list/detail and admin list row — see SPEAKERS-API.md */
export interface ConferenceProfile {
  id: string;
  kind: ConferenceProfileKind;
  slug: string;
  name: string;
  profilePicture: string;
  role: string;
  // Admin-only pass fields
  passCode?: string | null;
  qrCodeUrl?: string | null;
  qualifications: string;
  byline: string;
  highlightType: string;
  description: string;
  websiteLink: string | null;
  facebookLink: string | null;
  xLink: string | null;
  instagramLink: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getPublicSpeakers(): Promise<ConferenceProfile[]> {
  return apiFetch<ConferenceProfile[]>("/api/speakers");
}

export async function getPublicSpeakerBySlug(slug: string): Promise<ConferenceProfile | null> {
  try {
    return await apiFetch<ConferenceProfile>(`/api/speakers/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function getPublicSpecialGuests(): Promise<ConferenceProfile[]> {
  return apiFetch<ConferenceProfile[]>("/api/special-guests");
}

export async function getPublicSpecialGuestBySlug(slug: string): Promise<ConferenceProfile | null> {
  try {
    return await apiFetch<ConferenceProfile>(`/api/special-guests/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export interface AdminConferenceProfileCreateInput {
  image: File;
  name: string;
  role: string;
  qualifications: string;
  byline: string;
  highlightType: ConferenceHighlightType;
  description: string;
  websiteLink?: string;
  facebookLink?: string;
  xLink?: string;
  instagramLink?: string;
}

function appendConferenceProfileCreateFields(fd: FormData, input: AdminConferenceProfileCreateInput) {
  fd.append("name", input.name.trim());
  fd.append("role", input.role.trim());
  fd.append("qualifications", input.qualifications.trim());
  fd.append("byline", input.byline.trim());
  fd.append("highlightType", input.highlightType);
  fd.append("description", input.description.trim());
  const opt = (v: string | undefined) => (v ?? "").trim();
  fd.append("websiteLink", opt(input.websiteLink));
  fd.append("facebookLink", opt(input.facebookLink));
  fd.append("xLink", opt(input.xLink));
  fd.append("instagramLink", opt(input.instagramLink));
}

export async function postAdminSpeaker(input: AdminConferenceProfileCreateInput): Promise<ConferenceProfile> {
  const fd = new FormData();
  fd.append("image", input.image);
  appendConferenceProfileCreateFields(fd, input);
  return apiFetch<ConferenceProfile>("/api/admin/speakers", {
    method: "POST",
    body: fd,
  });
}

export async function postAdminSpecialGuest(
  input: AdminConferenceProfileCreateInput
): Promise<ConferenceProfile> {
  const fd = new FormData();
  fd.append("image", input.image);
  appendConferenceProfileCreateFields(fd, input);
  return apiFetch<ConferenceProfile>("/api/admin/special-guests", {
    method: "POST",
    body: fd,
  });
}

/** Partial update; optional `image` replaces photo. Empty string on link fields clears (per API). */
export type AdminConferenceProfilePatchInput = Partial<{
  name: string;
  role: string;
  qualifications: string;
  byline: string;
  highlightType: ConferenceHighlightType;
  description: string;
  websiteLink: string;
  facebookLink: string;
  xLink: string;
  instagramLink: string;
  image: File;
}>;

function appendDefinedPatchFields(fd: FormData, patch: AdminConferenceProfilePatchInput) {
  const entries: [keyof AdminConferenceProfilePatchInput, string | File | undefined][] = [
    ["name", patch.name],
    ["role", patch.role],
    ["qualifications", patch.qualifications],
    ["byline", patch.byline],
    ["highlightType", patch.highlightType],
    ["description", patch.description],
    ["websiteLink", patch.websiteLink],
    ["facebookLink", patch.facebookLink],
    ["xLink", patch.xLink],
    ["instagramLink", patch.instagramLink],
  ];
  for (const [key, val] of entries) {
    if (val === undefined) continue;
    if (key === "image") continue;
    fd.append(key, typeof val === "string" ? val : String(val));
  }
  if (patch.image) fd.append("image", patch.image);
}

export async function patchAdminSpeaker(
  id: string,
  patch: AdminConferenceProfilePatchInput
): Promise<ConferenceProfile> {
  const fd = new FormData();
  appendDefinedPatchFields(fd, patch);
  return apiFetch<ConferenceProfile>(`/api/admin/speakers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: fd,
  });
}

export async function patchAdminSpecialGuest(
  id: string,
  patch: AdminConferenceProfilePatchInput
): Promise<ConferenceProfile> {
  const fd = new FormData();
  appendDefinedPatchFields(fd, patch);
  return apiFetch<ConferenceProfile>(`/api/admin/special-guests/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: fd,
  });
}

export async function deleteAdminSpeaker(id: string): Promise<{ message: string; id: string }> {
  return apiFetch<{ message: string; id: string }>(`/api/admin/speakers/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function deleteAdminSpecialGuest(id: string): Promise<{ message: string; id: string }> {
  return apiFetch<{ message: string; id: string }>(`/api/admin/special-guests/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getAdminSpeakers(): Promise<ConferenceProfile[]> {
  return apiFetch<ConferenceProfile[]>("/api/admin/speakers");
}

export async function getAdminSpecialGuests(): Promise<ConferenceProfile[]> {
  return apiFetch<ConferenceProfile[]>("/api/admin/special-guests");
}

export async function getAdminSpeakerById(id: string): Promise<ConferenceProfile> {
  return apiFetch<ConferenceProfile>(`/api/admin/speakers/${encodeURIComponent(id)}`);
}

export async function getAdminSpecialGuestById(id: string): Promise<ConferenceProfile> {
  return apiFetch<ConferenceProfile>(`/api/admin/special-guests/${encodeURIComponent(id)}`);
}

export async function generateSpeakerPass(id: string, kind: ConferenceProfileKind): Promise<ConferenceProfile> {
  const base = kind === "speaker" ? "speakers" : "special-guests";
  return apiFetch<ConferenceProfile>(`/api/admin/${base}/${encodeURIComponent(id)}/generate-pass`, {
    method: "POST",
  });
}

export async function downloadPrintableBadge(params: {
  name: string;
  role: string;
  qualifications: string;
  kind: ConferenceProfileKind;
  imageFile?: File | null;
}): Promise<void> {
  const fd = new FormData();
  fd.append("name", params.name);
  fd.append("role", params.role);
  fd.append("qualifications", params.qualifications);
  fd.append("kind", params.kind);
  if (params.imageFile) fd.append("image", params.imageFile);

  const res = await fetch(`${API_BASE}/api/admin/badges/print-adhoc`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  if (!res.ok) throw new ApiError(res.status, "Badge generation failed");
  const blob = await res.blob();
  const safeName = params.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `badge-${safeName}.png`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Summary row from `GET /api/companies/public` (directory index). */
export interface PublicExhibitor {
  id: string;
  slug?: string;
  companyName: string;
  tagline?: string;
  /** When API includes them (public list / directory). */
  primaryContactName?: string;
  primaryContactPhone?: string;
  /** Sponsor / booth tier when provided (e.g. gold, silver). */
  tier?: string | null;
  effectiveDisplayTier?: string | null;
  highestSponsorshipTier?: string | null;
  /**
   * When true, company has an active paid sponsorship plan (distinct from booth-only / add-ons).
   * Used with `GET /api/companies/public` for “Our valued sponsors” grouping.
   */
  hasActiveSponsorshipPlan?: boolean;
  /**
   * When true, at least one completed paid order qualifies the company for the valued-sponsors list.
   * Send `false` for default-tier directory rows that should not appear under “Our valued sponsors”.
   */
  hasCompletedPaidPurchase?: boolean;
  website?: string;
  headerImage?: string;
  logo?: string;
  /** @deprecated Prefer `logo` */
  profileImage?: string;
  booth?: Booth | null;
}

export type PublicCompany = PublicExhibitor;

export interface PublicSponsor {
  id: string;
  slug?: string;
  companyName: string;
  tagline?: string;
  website?: string;
  tier?: SponsorTier;
  logo?: string;
  headerImage?: string;
  booth?: Booth | null;
}

export async function getPublicCompanies(): Promise<PublicCompany[]> {
  return apiFetch<PublicCompany[]>("/api/companies/public");
}

/** @deprecated Use `getPublicCompanies` */
export async function getPublicExhibitors(): Promise<PublicExhibitor[]> {
  return getPublicCompanies();
}

/** Full public profile — `GET /api/companies/public/:slug`. */
export interface PublicExhibitorProfileBooth {
  id: string;
  name: string;
  size: string;
  price: number;
  description?: string | null;
}

export interface PublicExhibitorProfileRep {
  id: string;
  name: string;
  title: string;
  phone: string;
}

export interface PublicExhibitorProfileProduct {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  sortOrder: number;
}

export interface PublicExhibitorProfile {
  id: string;
  slug: string;
  companyName: string;
  tagline: string | null;
  tier: string | null;
  effectiveDisplayTier?: string | null;
  highestSponsorshipTier?: string | null;
  boothPreference: string | null;
  website: string | null;
  contactEmail: string;
  primaryContactName: string;
  primaryContactPhone: string;
  description: string;
  headerImage: string | null;
  logo: string | null;
  /** @deprecated Prefer `logo` */
  profileImage: string | null;
  booth: PublicExhibitorProfileBooth | null;
  /** Normalized from API `representatives` (companies) or legacy `boothReps`. */
  boothReps: PublicExhibitorProfileRep[];
  products: PublicExhibitorProfileProduct[];
  masterclasses?: unknown[];
  panelSessions?: unknown[];
}

/** Raw `GET /api/companies/public/:slug` — may use `representatives` instead of `boothReps`. */
type RawPublicCompanyProfileResponse = Omit<
  PublicExhibitorProfile,
  "boothReps" | "products" | "description"
> & {
  description?: string | null;
  boothReps?: PublicExhibitorProfileRep[];
  representatives?: PublicExhibitorProfileRep[];
  products?: PublicExhibitorProfileProduct[];
};

export async function getPublicExhibitorBySlug(
  slug: string
): Promise<PublicExhibitorProfile | null> {
  try {
    const raw = await apiFetch<RawPublicCompanyProfileResponse>(
      `/api/companies/public/${encodeURIComponent(slug)}`
    );
    const {
      boothReps: rawBoothReps,
      representatives,
      products: rawProducts,
      description: rawDescription,
      ...rest
    } = raw;
    return {
      ...rest,
      description: rawDescription ?? "",
      boothReps: rawBoothReps ?? representatives ?? [],
      products: rawProducts ?? [],
      logo: rest.logo ?? null,
      profileImage: rest.profileImage ?? null,
    };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Call once per session when the public profile is shown (debounced client-side). */
export async function trackPublicExhibitorProfileView(slug: string): Promise<void> {
  await apiFetch<{ success: boolean }>(
    `/api/companies/public/${encodeURIComponent(slug)}/track-view`,
    { method: "POST", body: JSON.stringify({}) }
  );
}

/** @deprecated `GET /api/sponsors/public` removed — use `getPublicCompanies`. */
export async function getPublicSponsors(): Promise<PublicSponsor[]> {
  const companies = await getPublicCompanies();
  return companies.map((c) => {
    const raw = (c.highestSponsorshipTier ?? c.effectiveDisplayTier ?? c.tier ?? "").trim().toLowerCase();
    const tierKey =
      !raw || raw === "default"
        ? ("custom" as SponsorTier)
        : raw === "headliner" || raw === "platinum" || raw === "gold" || raw === "silver"
          ? (raw as SponsorTier)
          : ("custom" as SponsorTier);
    return {
      id: c.id,
      slug: c.slug,
      companyName: c.companyName,
      tagline: c.tagline,
      website: c.website,
      tier: tierKey,
      logo: c.logo?.trim() || c.profileImage?.trim() || undefined,
      headerImage: c.headerImage,
      booth: c.booth ?? undefined,
    };
  });
}

/** Bundle session shape (must be paired on create/update). See ADMIN-SPONSORSHIP-BUNDLES.md */
export type SessionSlotDuration = "m10" | "m15" | "m20" | "m30" | "m45" | "h1" | "h2";
export type ConferenceDay = "day_1" | "day_2";
/** Booth tier assigned at checkout when plan is purchased — not the same as display `tier`. */
export type SponsorshipBundleBoothTier = "gold" | "platinum" | "headliner";

export interface SponsorshipPlanAdvertJoin {
  advertSlot?: { id: string; title?: string } | null;
}

export interface SponsorshipPlanBrandingJoin {
  brandingSlot?: { id: string; title?: string } | null;
}

export interface SponsorshipPlanCatalogItem {
  id: string;
  name: string;
  priceInKobo: number;
  tier: string;
  perks?: string[];
  manualPerks?: string[];
  isActive?: boolean;
  /** Default 1 when omitted. */
  ticketAdmits?: number;
  bundleBoothTier?: SponsorshipBundleBoothTier | null;
  bundleMasterclassDuration?: SessionSlotDuration | null;
  bundleMasterclassDay?: ConferenceDay | null;
  bundlePresentationDuration?: SessionSlotDuration | null;
  bundlePresentationDay?: ConferenceDay | null;
  /** Join rows from admin/detail responses */
  advertSlots?: SponsorshipPlanAdvertJoin[];
  brandingSlots?: SponsorshipPlanBrandingJoin[];
  /** Stock fields returned by admin list endpoint */
  purchaseCount?: number;
  remainingPurchases?: number | null;
  isPurchasable?: boolean;
}

export interface PlanAnalyticsConstraint {
  label: string;
  total: number;
  available: number;
}

export interface PlanAnalytics {
  purchaseCount: number;
  remainingPurchases: number | null;
  isPurchasable: boolean;
  constraints: PlanAnalyticsConstraint[];
}

function normalizeSponsorshipPlanCatalogItemFromWire(raw: unknown): SponsorshipPlanCatalogItem {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid sponsorship plan payload");
  }
  const o = raw as Record<string, unknown>;
  const p = { ...(raw as object) } as SponsorshipPlanCatalogItem;
  p.priceInKobo = parseKoboField(o.priceInKobo);
  return p;
}

export async function getSponsorshipPlans(): Promise<SponsorshipPlanCatalogItem[]> {
  const rows = await apiFetch<unknown[]>("/api/companies/sponsorship-plans");
  return rows.map((row) => normalizeSponsorshipPlanCatalogItemFromWire(row));
}

/** Admin list/detail — includes `advertSlots` / `brandingSlots` joins when returned by API. */
export async function getAdminSponsorshipPlans(options?: {
  tier?: string;
  isActive?: boolean;
}): Promise<SponsorshipPlanCatalogItem[]> {
  const params: Record<string, string> = {};
  if (options?.tier) params.tier = options.tier;
  if (options?.isActive !== undefined) params.isActive = options.isActive ? "true" : "false";
  const rows = await apiFetch<unknown[]>(
    "/api/admin/sponsorship-plans",
    Object.keys(params).length ? { params } : undefined
  );
  return rows.map((row) => normalizeSponsorshipPlanCatalogItemFromWire(row));
}

export async function postAdminSponsorshipPlan(
  payload: Record<string, unknown>
): Promise<SponsorshipPlanCatalogItem> {
  const raw = await apiFetch<unknown>("/api/admin/sponsorship-plans", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeSponsorshipPlanCatalogItemFromWire(raw);
}

export async function patchAdminSponsorshipPlan(
  id: string,
  payload: Record<string, unknown>
): Promise<SponsorshipPlanCatalogItem> {
  const raw = await apiFetch<unknown>(`/api/admin/sponsorship-plans/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeSponsorshipPlanCatalogItemFromWire(raw);
}

export async function deleteAdminSponsorshipPlan(id: string): Promise<void> {
  const url = new URL(`/api/admin/sponsorship-plans/${encodeURIComponent(id)}`, API_BASE);
  const res = await fetch(url.toString(), {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new ApiError(
      res.status,
      (typeof body.message === "string" ? body.message : null) ?? res.statusText,
      body
    );
  }
}

export async function getPlanAnalytics(id: string): Promise<PlanAnalytics> {
  return apiFetch<PlanAnalytics>(`/api/admin/sponsorship-plans/${encodeURIComponent(id)}/analytics`);
}

export async function downloadPlanBuyers(
  id: string,
  format: "pdf" | "csv",
  planName: string
): Promise<void> {
  const ts = new Date().toISOString().slice(0, 16).replace("T", "-").replace(/:/g, "-");
  const filename = `plan-buyers-${planName.replace(/\s+/g, "-").toLowerCase()}-${ts}.${format}`;
  const url = new URL(
    `/api/admin/export/sponsorship-plans/${encodeURIComponent(id)}/${format}`,
    API_BASE
  );
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) throw new ApiError(res.status, "Export failed");
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Hotel rooms (public inventory) — see HOTEL-ROOMS.md
export interface HotelRoom {
  id: string;
  hotelName: string;
  roomType: string;
  description?: string | null;
  price: number;
  isBooked: boolean;
  isReserved: boolean;
  bookedById?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Slots available for purchase (`isBooked` and `isReserved` false). */
export async function getAvailableHotelRooms(): Promise<HotelRoom[]> {
  return apiFetch<HotelRoom[]>("/api/hotel-rooms/available");
}

/**
 * Your booked hotel-room slots only (`isBooked: true`, `bookedById` = current user).
 * Pending hotel-room payments are not included. Requires JWT.
 */
export async function getMyBookedHotelRooms(): Promise<HotelRoom[]> {
  const res = await apiFetch<HotelRoom[] | { items?: HotelRoom[] }>("/api/hotel-rooms/me");
  return Array.isArray(res) ? res : (res.items ?? []);
}

// —— Admin hotel inventory (JWT + admin) — see HOTEL-ROOMS.md

export interface AdminHotelRoomsResponse {
  items: HotelRoom[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminHotelRoomStats {
  total: number;
  available: number;
  reserved: number;
  booked: number;
  revenueKobo?: number;
}

export async function getAdminHotelRooms(params?: {
  page?: number;
  pageSize?: number;
  hotelName?: string;
  roomType?: string;
  status?: "available" | "reserved" | "booked" | "";
}): Promise<AdminHotelRoomsResponse> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("pageSize", String(params.pageSize));
  if (params?.hotelName?.trim()) q.set("hotelName", params.hotelName.trim());
  if (params?.roomType?.trim()) q.set("roomType", params.roomType.trim());
  if (params?.status) q.set("status", params.status);
  return apiFetch<AdminHotelRoomsResponse>(`/api/admin/hotel-rooms?${q}`);
}

export async function getAdminHotelRoomsStats(): Promise<AdminHotelRoomStats> {
  return apiFetch<AdminHotelRoomStats>("/api/admin/hotel-rooms/stats");
}

export interface CreateAdminHotelRoomInput {
  hotelName: string;
  roomType: string;
  /** Amount in kobo */
  price: number;
  description?: string | null;
}

export async function postAdminHotelRoom(payload: CreateAdminHotelRoomInput): Promise<HotelRoom> {
  return apiFetch<HotelRoom>("/api/admin/hotel-rooms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface BulkCreateAdminHotelRoomsInput {
  hotelName: string;
  roomType: string;
  quantity: number;
  /** Amount in kobo per slot */
  price: number;
  description?: string | null;
}

/** Creates many identical slots. Backend may return created rows or a summary. */
export async function postAdminHotelRoomsBulk(
  payload: BulkCreateAdminHotelRoomsInput
): Promise<unknown> {
  return apiFetch<unknown>("/api/admin/hotel-rooms/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patchAdminHotelRoomReserve(id: string): Promise<HotelRoom> {
  return apiFetch<HotelRoom>(`/api/admin/hotel-rooms/${encodeURIComponent(id)}/reserve`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export async function patchAdminHotelRoomUnreserve(id: string): Promise<HotelRoom> {
  return apiFetch<HotelRoom>(`/api/admin/hotel-rooms/${encodeURIComponent(id)}/unreserve`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export async function deleteAdminHotelRoom(id: string): Promise<void> {
  const url = new URL(`/api/admin/hotel-rooms/${encodeURIComponent(id)}`, API_BASE);
  const res = await fetch(url.toString(), {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new ApiError(
      res.status,
      (typeof body.message === "string" ? body.message : null) ?? res.statusText,
      body
    );
  }
}

// —— Marketing: advert & branding slots — see FRONTEND-ADVERT-BRANDING-SLOTS.md

/** Admin list: includes slot counters. */
export type AdvertSlotType = "digital" | "brochure";

export interface AdminAdvertSlot {
  id: string;
  title: string;
  image: string | null;
  price: number;
  description: string | null;
  type: AdvertSlotType;
  totalSlots: number;
  availableSlots: number;
  isReserved: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminBrandingSlot {
  id: string;
  title: string;
  image: string | null;
  price: number;
  description: string | null;
  totalSlots: number;
  availableSlots: number;
  isReserved: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Public catalog + `/me` sanitized shape. */
export type CompanyMarketingSlot = Pick<
  AdminAdvertSlot,
  | "id"
  | "title"
  | "image"
  | "price"
  | "description"
  | "type"
  | "isReserved"
  | "totalSlots"
  | "availableSlots"
  | "createdAt"
  | "updatedAt"
>;

function normalizeList<T>(res: T[] | { items?: T[] }): T[] {
  return Array.isArray(res) ? res : (res.items ?? []);
}

async function deleteAdminSlot(path: string): Promise<void> {
  const url = new URL(path, API_BASE);
  const res = await fetch(url.toString(), {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new ApiError(
      res.status,
      (typeof body.message === "string" ? body.message : null) ?? res.statusText,
      body
    );
  }
}

/** Resolve relative upload paths or absolute URLs for `<img src>`. */
export function apiAssetUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) return null;
  const p = path.trim();
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const base = API_BASE.replace(/\/$/, "");
  return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
}

// —— Admin advert slots

export async function getAdminAdvertSlots(): Promise<AdminAdvertSlot[]> {
  const res = await apiFetch<AdminAdvertSlot[] | { items?: AdminAdvertSlot[] }>("/api/admin/advert-slots");
  return normalizeList(res);
}

export interface CreateAdminAdvertSlotInput {
  title: string;
  /** kobo */
  price: number;
  description?: string | null;
  isReserved?: boolean;
  /** Number of identical copies for sale. Defaults to 1. */
  totalSlots?: number;
  type: AdvertSlotType;
  advertSlotImage: File;
}

export async function postAdminAdvertSlot(input: CreateAdminAdvertSlotInput): Promise<AdminAdvertSlot> {
  const fd = new FormData();
  fd.append("title", input.title.trim());
  fd.append("price", String(Math.round(input.price)));
  fd.append("description", input.description?.trim() ?? "");
  fd.append("isReserved", input.isReserved ? "true" : "false");
  fd.append("totalSlots", String(Math.max(1, Math.round(input.totalSlots ?? 1))));
  fd.append("type", input.type);
  fd.append("advertSlotImage", input.advertSlotImage);
  return apiFetch<AdminAdvertSlot>("/api/admin/advert-slots", {
    method: "POST",
    body: fd,
  });
}

export async function patchAdminAdvertSlotReserve(id: string): Promise<AdminAdvertSlot> {
  return apiFetch<AdminAdvertSlot>(`/api/admin/advert-slots/${encodeURIComponent(id)}/reserve`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export async function patchAdminAdvertSlotUnreserve(id: string): Promise<AdminAdvertSlot> {
  return apiFetch<AdminAdvertSlot>(`/api/admin/advert-slots/${encodeURIComponent(id)}/unreserve`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export async function deleteAdminAdvertSlot(id: string): Promise<void> {
  await deleteAdminSlot(`/api/admin/advert-slots/${encodeURIComponent(id)}`);
}

export async function patchAdminAdvertSlotTotalSlots(
  id: string,
  totalSlots: number
): Promise<AdminAdvertSlot> {
  return apiFetch<AdminAdvertSlot>(
    `/api/admin/advert-slots/${encodeURIComponent(id)}/total-slots`,
    {
      method: "PATCH",
      body: JSON.stringify({ totalSlots }),
    }
  );
}

// —— Admin branding slots

export async function getAdminBrandingSlots(): Promise<AdminBrandingSlot[]> {
  const res = await apiFetch<AdminBrandingSlot[] | { items?: AdminBrandingSlot[] }>(
    "/api/admin/branding-slots"
  );
  return normalizeList(res);
}

export interface CreateAdminBrandingSlotInput {
  title: string;
  price: number;
  description?: string | null;
  isReserved?: boolean;
  /** Number of identical copies for sale. Defaults to 1. */
  totalSlots?: number;
  brandingSlotImage: File;
}

export async function postAdminBrandingSlot(input: CreateAdminBrandingSlotInput): Promise<AdminBrandingSlot> {
  const fd = new FormData();
  fd.append("title", input.title.trim());
  fd.append("price", String(Math.round(input.price)));
  fd.append("description", input.description?.trim() ?? "");
  fd.append("isReserved", input.isReserved ? "true" : "false");
  fd.append("totalSlots", String(Math.max(1, Math.round(input.totalSlots ?? 1))));
  fd.append("brandingSlotImage", input.brandingSlotImage);
  return apiFetch<AdminBrandingSlot>("/api/admin/branding-slots", {
    method: "POST",
    body: fd,
  });
}

export async function patchAdminBrandingSlotReserve(id: string): Promise<AdminBrandingSlot> {
  return apiFetch<AdminBrandingSlot>(`/api/admin/branding-slots/${encodeURIComponent(id)}/reserve`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export async function patchAdminBrandingSlotUnreserve(id: string): Promise<AdminBrandingSlot> {
  return apiFetch<AdminBrandingSlot>(`/api/admin/branding-slots/${encodeURIComponent(id)}/unreserve`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export async function deleteAdminBrandingSlot(id: string): Promise<void> {
  await deleteAdminSlot(`/api/admin/branding-slots/${encodeURIComponent(id)}`);
}

export async function patchAdminBrandingSlotTotalSlots(
  id: string,
  totalSlots: number
): Promise<AdminBrandingSlot> {
  return apiFetch<AdminBrandingSlot>(
    `/api/admin/branding-slots/${encodeURIComponent(id)}/total-slots`,
    {
      method: "PATCH",
      body: JSON.stringify({ totalSlots }),
    }
  );
}

async function postJsonAllowEmpty(path: string, body: Record<string, string>): Promise<void> {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, API_BASE);
  const res = await fetch(url.toString(), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new ApiError(
      res.status,
      (typeof errBody.message === "string" ? errBody.message : null) ?? res.statusText,
      errBody
    );
  }
  const text = await res.text();
  if (text.trim()) void JSON.parse(text);
}

/** Assign advert slot to a company (admin). Slot must not be reserved; no other occupant. */
export async function adminAssignAdvertSlot(companyId: string, advertSlotId: string): Promise<void> {
  await postJsonAllowEmpty(`/api/admin/companies/${encodeURIComponent(companyId)}/advert-slots`, {
    advertSlotId,
  });
}

export async function adminUnassignAdvertSlot(companyId: string, advertSlotId: string): Promise<void> {
  await deleteAdminSlot(
    `/api/admin/companies/${encodeURIComponent(companyId)}/advert-slots/${encodeURIComponent(advertSlotId)}`
  );
}

export async function adminAssignBrandingSlot(companyId: string, brandingSlotId: string): Promise<void> {
  await postJsonAllowEmpty(`/api/admin/companies/${encodeURIComponent(companyId)}/branding-slots`, {
    brandingSlotId,
  });
}

export async function adminUnassignBrandingSlot(companyId: string, brandingSlotId: string): Promise<void> {
  await deleteAdminSlot(
    `/api/admin/companies/${encodeURIComponent(companyId)}/branding-slots/${encodeURIComponent(brandingSlotId)}`
  );
}

// —— Public catalog (no auth)

export async function getAvailableAdvertSlots(): Promise<CompanyMarketingSlot[]> {
  const res = await apiFetch<CompanyMarketingSlot[] | { items?: CompanyMarketingSlot[] }>(
    "/api/advert-slots/available"
  );
  return normalizeList(res);
}

export async function getAvailableBrandingSlots(): Promise<CompanyMarketingSlot[]> {
  const res = await apiFetch<CompanyMarketingSlot[] | { items?: CompanyMarketingSlot[] }>(
    "/api/branding-slots/available"
  );
  return normalizeList(res);
}

// —— Company “my slots” (JWT, company only)

export async function getMyAdvertSlots(): Promise<CompanyMarketingSlot[]> {
  const res = await apiFetch<CompanyMarketingSlot[] | { items?: CompanyMarketingSlot[] }>(
    "/api/advert-slots/me"
  );
  return normalizeList(res);
}

export async function getMyBrandingSlots(): Promise<CompanyMarketingSlot[]> {
  const res = await apiFetch<CompanyMarketingSlot[] | { items?: CompanyMarketingSlot[] }>(
    "/api/branding-slots/me"
  );
  return normalizeList(res);
}

export interface InitializeAdvertSlotPaymentRequest {
  advertSlotId: string;
  /** Admin paying on behalf of a company */
  companyId?: string;
}

export interface InitializeBrandingSlotPaymentRequest {
  brandingSlotId: string;
  companyId?: string;
}

// Payment types and endpoints
/** Company JWT: send `boothId` only. Admin paying for a company: include `companyId`. */
export interface InitializeBoothPaymentRequest {
  boothId: string;
  companyId?: string;
}

/** Company JWT: `type` + `sessionId` only. Admin: include `companyId`. */
export interface InitializeSessionPaymentRequest {
  type: SessionPaymentType;
  sessionId: string;
  companyId?: string;
}

export interface InitializeSponsorshipPlanPaymentRequest {
  sponsorshipPlanId: string;
  companyId?: string;
}

export interface InitializeHotelRoomPaymentRequest {
  hotelRoomId: string;
}

export interface PaymentInitializeResponse {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: number;
  baseAmount: number;
  manualMode?: boolean;
}

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";
export type PaymentKind =
  | "booth"
  | "masterclass"
  | "panel"
  | "presentation"
  | "hotel_room"
  | "sponsorship_plan"
  | "advert_slot"
  | "branding_slot"
  | "order";

export interface Payment {
  id: string;
  reference: string;
  kind: PaymentKind;
  baseAmount: number;
  amount: number;
  status: PaymentStatus;
  provider: string;
  userId: string;
  companyId?: string | null;
  exhibitorId?: string | null;
  boothId?: string | null;
  sponsorId?: string | null;
  masterclassId?: string | null;
  panelSessionId?: string | null;
  presentationId?: string | null;
  hotelRoomId?: string | null;
  sponsorshipPlanId?: string | null;
  advertSlotId?: string | null;
  brandingSlotId?: string | null;
  paidAt?: string | null;
  claimedPaidAt?: string | null;
  reconciledAmount?: number | null;
  reconciledPaidAt?: string | null;
  reconciledNote?: string | null;
  reconciledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

function normalizePaymentFromWire(raw: unknown): Payment {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid payment payload");
  }
  const o = raw as Record<string, unknown>;
  const p = { ...(raw as object) } as Payment;
  p.baseAmount = parseKoboField(o.baseAmount);
  p.amount = parseKoboField(o.amount);
  if (o.reconciledAmount != null) {
    p.reconciledAmount = parseKoboField(o.reconciledAmount);
  }
  return p;
}

export interface VerifyPaymentResponse {
  success: boolean;
  payment: Payment;
  paystackData: Record<string, unknown>;
}

function normalizePaymentInitializeResponseFromWire(raw: unknown): PaymentInitializeResponse {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid payment initialize payload");
  }
  const o = raw as Record<string, unknown>;
  return {
    reference: String(o.reference ?? ""),
    authorizationUrl: String(o.authorizationUrl ?? ""),
    accessCode: String(o.accessCode ?? ""),
    amount: parseKoboField(o.amount),
    baseAmount: parseKoboField(o.baseAmount),
    ...(o.manualMode === true ? { manualMode: true } : {}),
  };
}

function normalizeOrderCheckoutResponseFromWire(raw: unknown): OrderCheckoutResponse {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid order checkout payload");
  }
  const o = raw as Record<string, unknown>;
  return {
    orderId: String(o.orderId ?? ""),
    reference: String(o.reference ?? ""),
    authorizationUrl: String(o.authorizationUrl ?? ""),
    accessCode: String(o.accessCode ?? ""),
    amount: parseKoboField(o.amount),
    baseAmount: parseKoboField(o.baseAmount),
    ...(o.manualMode === true ? { manualMode: true } : {}),
  };
}

export async function initializeBoothPayment(
  request: InitializeBoothPaymentRequest
): Promise<PaymentInitializeResponse> {
  const body: Record<string, string> = { boothId: request.boothId };
  if (request.companyId) body.companyId = request.companyId;
  const raw = await apiFetch<unknown>("/api/payments/booth", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalizePaymentInitializeResponseFromWire(raw);
}

export async function initializeSessionPayment(
  request: InitializeSessionPaymentRequest
): Promise<PaymentInitializeResponse> {
  const body: Record<string, string> = {
    type: request.type,
    sessionId: request.sessionId,
  };
  if (request.companyId) body.companyId = request.companyId;
  const raw = await apiFetch<unknown>("/api/payments/session", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalizePaymentInitializeResponseFromWire(raw);
}

export async function initializeSponsorshipPlanPayment(
  request: InitializeSponsorshipPlanPaymentRequest
): Promise<PaymentInitializeResponse> {
  const body: Record<string, string> = { sponsorshipPlanId: request.sponsorshipPlanId };
  if (request.companyId) body.companyId = request.companyId;
  const raw = await apiFetch<unknown>("/api/payments/sponsorship-plan", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalizePaymentInitializeResponseFromWire(raw);
}

export async function initializeHotelRoomPayment(
  request: InitializeHotelRoomPaymentRequest
): Promise<PaymentInitializeResponse> {
  const raw = await apiFetch<unknown>("/api/payments/hotel-room", {
    method: "POST",
    body: JSON.stringify(request),
  });
  return normalizePaymentInitializeResponseFromWire(raw);
}

export async function initializeAdvertSlotPayment(
  request: InitializeAdvertSlotPaymentRequest
): Promise<PaymentInitializeResponse> {
  const body: Record<string, string> = { advertSlotId: request.advertSlotId };
  if (request.companyId) body.companyId = request.companyId;
  const raw = await apiFetch<unknown>("/api/payments/advert-slot", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalizePaymentInitializeResponseFromWire(raw);
}

export async function initializeBrandingSlotPayment(
  request: InitializeBrandingSlotPaymentRequest
): Promise<PaymentInitializeResponse> {
  const body: Record<string, string> = { brandingSlotId: request.brandingSlotId };
  if (request.companyId) body.companyId = request.companyId;
  const raw = await apiFetch<unknown>("/api/payments/branding-slot", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalizePaymentInitializeResponseFromWire(raw);
}

export async function verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/payments/paystack/verify/${encodeURIComponent(reference)}`
  );
  return {
    success: Boolean(raw.success),
    payment: normalizePaymentFromWire(raw.payment),
    paystackData:
      raw.paystackData && typeof raw.paystackData === "object"
        ? (raw.paystackData as Record<string, unknown>)
        : {},
  };
}

// ==================== Cart & order checkout (FRONTEND-CART-AND-CHECKOUT.md) ====================

export type CartKind = "conference" | "hotel";

export type CartItemType =
  | "booth"
  | "masterclass"
  | "panel"
  | "presentation"
  | "sponsorship_plan"
  | "advert_slot"
  | "branding_slot"
  | "hotel_room";

/** Line from GET /api/carts/current — nested catalog keys vary by `type`. */
export interface CartItem {
  id: string;
  type: CartItemType;
  quantity: number;
  boothId?: string | null;
  masterclassId?: string | null;
  panelSessionId?: string | null;
  presentationId?: string | null;
  sponsorshipPlanId?: string | null;
  advertSlotId?: string | null;
  brandingSlotId?: string | null;
  hotelRoomId?: string | null;
  /** Joined catalog for display (shape depends on backend). */
  booth?: Booth | null;
  masterclass?: SessionSlotCatalogItem | null;
  panelSession?: SessionSlotCatalogItem | null;
  presentation?: SessionSlotCatalogItem | null;
  sponsorshipPlan?: SponsorshipPlanCatalogItem | null;
  advertSlot?: CompanyMarketingSlot | null;
  brandingSlot?: CompanyMarketingSlot | null;
  hotelRoom?: HotelRoom | null;
  /** Unit price in kobo when returned by API */
  unitPriceInKobo?: number;
  lineTotalKobo?: number;
  /** Checkout snapshot: unit base in kobo (may be a string on the wire). */
  unitBaseAmountKobo?: number;
  [key: string]: unknown;
}

/** Checkout / order snapshot line — same kobo string coercion as `CartItem` when returned by the API. */
export type OrderItem = CartItem;

export interface Cart {
  id: string | null;
  userId: string;
  kind: CartKind;
  items: CartItem[];
}

function normalizeBoothMoneyFields(raw: unknown): Booth | null | undefined {
  if (raw == null) return raw as null | undefined;
  if (typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const b = { ...(raw as object) } as Booth;
  if ("price" in o && o.price != null) b.price = parseKoboField(o.price);
  return b;
}

function normalizeHotelRoomMoneyFields(raw: unknown): HotelRoom | null | undefined {
  if (raw == null) return raw as null | undefined;
  if (typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const h = { ...(raw as object) } as HotelRoom;
  if ("price" in o && o.price != null) h.price = parseKoboField(o.price);
  return h;
}

function normalizeMarketingSlotMoneyFields(raw: unknown): CompanyMarketingSlot | null | undefined {
  if (raw == null) return raw as null | undefined;
  if (typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const m = { ...(raw as object) } as CompanyMarketingSlot;
  if ("price" in o && o.price != null) m.price = parseKoboField(o.price);
  return m;
}

function normalizeCartItemFromWire(raw: unknown): CartItem {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid cart item payload");
  }
  const o = raw as Record<string, unknown>;
  const item = { ...(raw as object) } as CartItem;
  if ("unitPriceInKobo" in o) item.unitPriceInKobo = parseKoboField(o.unitPriceInKobo);
  if ("lineTotalKobo" in o) item.lineTotalKobo = parseKoboField(o.lineTotalKobo);
  if ("unitBaseAmountKobo" in o) item.unitBaseAmountKobo = parseKoboField(o.unitBaseAmountKobo);
  if (o.sponsorshipPlan != null) item.sponsorshipPlan = normalizeSponsorshipPlanCatalogItemFromWire(o.sponsorshipPlan);
  if (o.booth != null) item.booth = normalizeBoothMoneyFields(o.booth) ?? null;
  if (o.masterclass != null) item.masterclass = normalizeSessionSlotCatalogItemFromWire(o.masterclass);
  if (o.panelSession != null)
    item.panelSession = normalizeSessionSlotCatalogItemFromWire(o.panelSession) as SessionSlotCatalogItem;
  if (o.presentation != null) item.presentation = normalizeSessionSlotCatalogItemFromWire(o.presentation);
  if (o.advertSlot != null) item.advertSlot = normalizeMarketingSlotMoneyFields(o.advertSlot) ?? null;
  if (o.brandingSlot != null) item.brandingSlot = normalizeMarketingSlotMoneyFields(o.brandingSlot) ?? null;
  if (o.hotelRoom != null) item.hotelRoom = normalizeHotelRoomMoneyFields(o.hotelRoom) ?? null;
  return item;
}

function normalizeCartFromWire(raw: unknown): Cart {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid cart payload");
  }
  const o = raw as Record<string, unknown>;
  const items = Array.isArray(o.items) ? o.items.map((row) => normalizeCartItemFromWire(row)) : [];
  return { ...(raw as object) as Cart, items };
}

export async function getCurrentCart(cartKind: CartKind): Promise<Cart> {
  const raw = await apiFetch<unknown>("/api/carts/current", { params: { cartKind } });
  return normalizeCartFromWire(raw);
}

export interface AddCartItemBody {
  cartKind: CartKind;
  type: CartItemType;
  quantity?: number;
  boothId?: string;
  masterclassId?: string;
  panelSessionId?: string;
  presentationId?: string;
  sponsorshipPlanId?: string;
  advertSlotId?: string;
  brandingSlotId?: string;
  hotelRoomId?: string;
}

export async function addCartItem(body: AddCartItemBody): Promise<Cart> {
  const raw = await apiFetch<unknown>("/api/carts/items", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalizeCartFromWire(raw);
}

export async function removeCartItem(itemId: string): Promise<{ removed: boolean; id: string }> {
  return apiFetch<{ removed: boolean; id: string }>(`/api/carts/items/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
  });
}

export interface OrderCheckoutResponse {
  orderId: string;
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: number;
  baseAmount: number;
  manualMode?: boolean;
}

export async function checkoutOrder(cartKind: CartKind): Promise<OrderCheckoutResponse> {
  const raw = await apiFetch<unknown>("/api/orders/checkout", {
    method: "POST",
    body: JSON.stringify({ cartKind }),
  });
  return normalizeOrderCheckoutResponseFromWire(raw);
}

export async function cancelPayment(reference: string): Promise<void> {
  await apiFetch<unknown>(`/api/payments/${encodeURIComponent(reference)}`, {
    method: "DELETE",
  });
}

export async function claimPaymentMade(reference: string): Promise<void> {
  await apiFetch<unknown>(`/api/payments/${encodeURIComponent(reference)}/claim-paid`, {
    method: "POST",
  });
}

export async function adminCreateDirectPayment(params: {
  userEmail: string;
  amountKobo: number;
  paidAt: string;
  note?: string;
}): Promise<{ reference: string }> {
  return apiFetch<{ reference: string }>("/api/payments/admin/create", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export interface ExternalPaymentRecord {
  id: string;
  payerName: string;
  payerEmail: string | null;
  kind: string;
  amountKobo: number;
  paidAt: string;
  reference: string | null;
  note: string | null;
  createdAt: string;
  createdBy: { name: string };
}

export async function adminCreateExternalPayment(params: {
  payerName: string;
  payerEmail?: string;
  kind: string;
  amountKobo: number;
  paidAt: string;
  reference?: string;
  note?: string;
}): Promise<{ id: string }> {
  return apiFetch<{ id: string }>("/api/payments/admin/external", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getExternalPayments(params?: {
  page?: number;
  pageSize?: number;
}): Promise<{
  data: ExternalPaymentRecord[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}> {
  return apiFetch("/api/payments/admin/external", {
    params: {
      page: String(params?.page ?? 1),
      pageSize: String(params?.pageSize ?? 20),
    },
  });
}

export async function adminVerifyManualPayment(reference: string): Promise<void> {
  await apiFetch<unknown>(`/api/payments/admin/${encodeURIComponent(reference)}/verify`, {
    method: "POST",
  });
}

export async function adminFailManualPayment(reference: string): Promise<void> {
  await apiFetch<unknown>(`/api/payments/admin/${encodeURIComponent(reference)}/fail`, {
    method: "POST",
  });
}

export type AdminRefundResult = {
  refunded: boolean;
  paystackRefunded: boolean | null;
  errors: string[];
};

export async function adminRefundPayment(reference: string): Promise<AdminRefundResult> {
  return apiFetch<AdminRefundResult>(`/api/payments/admin/${encodeURIComponent(reference)}/refund`, {
    method: "POST",
  });
}

export interface ReconcilePaymentRequest {
  /** Actual received amount in kobo */
  reconciledAmountKobo: number;
  /** ISO-8601 date string; defaults to now on the server if omitted */
  reconciledPaidAt?: string;
  note?: string;
}

export async function adminReconcilePayment(
  reference: string,
  body: ReconcilePaymentRequest,
): Promise<void> {
  await apiFetch<unknown>(`/api/payments/admin/${encodeURIComponent(reference)}/reconcile`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ==================== Support tickets ====================

export type SupportTicketCategory =
  | "booth"
  | "masterclass"
  | "panel"
  | "hotel_room"
  | "directory"
  | "registrations"
  | "sponsorship"
  | "marketing_slots"
  | "company_profile"
  | "payments"
  | "other";

export type SupportTicketStatus = "open" | "answered" | "closed";

export interface SupportTicketSummary {
  id: string;
  title: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  createdAt: string;
}

export interface SupportTicketResponseItem {
  id: string;
  responseText: string;
  createdAt: string;
  responderAdminId: string;
  responderAdminName: string;
}

export interface MySupportTicketDetail extends SupportTicketSummary {
  description: string;
  screenshotUrls: string[];
  responses: SupportTicketResponseItem[];
}

export interface AdminSupportTicketListItem extends SupportTicketSummary {
  userId: string;
  submitterDisplayName: string;
  submitterEmail: string;
  submitterRegType: "member" | "attendee" | "company" | "admin";
}

export interface AdminSupportTicketUser {
  id: string;
  email: string;
  regType: string;
  submitterDisplayName: string;
  profileUrl: string | null;
}

export interface AdminSupportTicketDetail extends Omit<MySupportTicketDetail, "responses"> {
  user: AdminSupportTicketUser;
  responses: SupportTicketResponseItem[];
  ticketUrl: string;
}

export async function createSupportTicket(input: {
  title: string;
  category: SupportTicketCategory;
  description: string;
  images?: File[];
}): Promise<{ id: string; status: SupportTicketStatus }> {
  const fd = new FormData();
  fd.append("title", input.title.trim());
  fd.append("category", input.category);
  fd.append("description", input.description.trim());
  for (const file of input.images ?? []) {
    fd.append("images", file);
  }
  return apiFetch<{ id: string; status: SupportTicketStatus }>("/api/support/tickets", {
    method: "POST",
    body: fd,
  });
}

export async function getMySupportTickets(query: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<SupportTicketSummary>> {
  const params: Record<string, string> = {};
  if (query.page != null) params.page = String(query.page);
  if (query.pageSize != null) params.pageSize = String(query.pageSize);
  return apiFetch<PaginatedResponse<SupportTicketSummary>>("/api/support/my-tickets", { params });
}

export async function getMySupportTicket(id: string): Promise<MySupportTicketDetail> {
  return apiFetch<MySupportTicketDetail>(`/api/support/my-tickets/${encodeURIComponent(id)}`);
}

export async function getAdminSupportTickets(query: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<AdminSupportTicketListItem>> {
  const params: Record<string, string> = {};
  if (query.page != null) params.page = String(query.page);
  if (query.pageSize != null) params.pageSize = String(query.pageSize);
  return apiFetch<PaginatedResponse<AdminSupportTicketListItem>>("/api/admin/support/tickets", { params });
}

export async function getAdminSupportTicket(id: string): Promise<AdminSupportTicketDetail> {
  return apiFetch<AdminSupportTicketDetail>(`/api/admin/support/tickets/${encodeURIComponent(id)}`);
}

export async function respondToSupportTicket(
  id: string,
  responseText: string
): Promise<{ id: string; status: SupportTicketStatus }> {
  return apiFetch<{ id: string; status: SupportTicketStatus }>(
    `/api/admin/support/tickets/${encodeURIComponent(id)}/respond`,
    {
      method: "POST",
      body: JSON.stringify({ responseText: responseText.trim() }),
    }
  );
}

// ==================== Member/Attendee Registration APIs ====================

export interface MemberRegistrationInput {
  regType: "member";
  email: string;
  password: string;
  fullName: string;
  phone: string;
  /** Honorific (e.g. Dr); omit or empty → stored as null server-side. */
  title?: string;
  anpmpId: string;
  bio?: string;
  hasSpouse: boolean;
  spouseName?: string;
  spouseEmail?: string;
  spousePhone?: string;
  primarySpecialty: string;
  hospitalOrg: string;
  organizationAddress: string;
  zone: string;
  avatar?: File | null;
}

export interface NonMemberRegistrationInput {
  regType: "non-member";
  email: string;
  password: string;
  fullName: string;
  phone: string;
  bio?: string;
  inMedicalField: boolean;
  primarySpecialty?: string;
  hospitalOrg?: string;
  occupation?: string;
  avatar?: File | null;
}

export type IndividualRegistrationInput = MemberRegistrationInput | NonMemberRegistrationInput;

export interface IndividualRegistrationResponse {
  id: string;
  status: string;
  createdAt: string;
  message: string;
}

export interface MemberProfile {
  id: string;
  userId: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  phone: string;
  title?: string | null;
  anpmpId: string;
  bio?: string | null;
  hasSpouse: boolean;
  spouseName?: string | null;
  spouseEmail?: string | null;
  spousePhone?: string | null;
  primarySpecialty: string;
  hospitalOrg: string;
  organizationAddress?: string | null;
  zone?: string | null;
  state?: string | null;
  avatar?: string | null;
  duesPaid?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendeeProfile {
  id: string;
  userId: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  phone: string;
  bio?: string | null;
  inMedicalField: boolean;
  primarySpecialty?: string | null;
  hospitalOrg?: string | null;
  occupation?: string | null;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type IndividualProfile = MemberProfile | AttendeeProfile;

export interface RegistrationPaymentInitializeResponse {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: number;
  baseAmount: number;
  manualMode?: boolean;
}

export async function createIndividualRegistration(
  input: IndividualRegistrationInput
): Promise<IndividualRegistrationResponse> {
  const fd = new FormData();
  fd.append("regType", input.regType);
  fd.append("email", input.email);
  fd.append("password", input.password);
  fd.append("fullName", input.fullName);
  fd.append("phone", input.phone);
  if (input.bio) fd.append("bio", input.bio);

  if (input.regType === "member") {
    if (input.title?.trim()) fd.append("title", input.title.trim());
    fd.append("anpmpId", input.anpmpId);
    fd.append("hasSpouse", input.hasSpouse ? "true" : "false");
    if (input.hasSpouse) {
      if (input.spouseName) fd.append("spouseName", input.spouseName);
      if (input.spouseEmail) fd.append("spouseEmail", input.spouseEmail);
      if (input.spousePhone) fd.append("spousePhone", input.spousePhone);
    }
    fd.append("primarySpecialty", input.primarySpecialty);
    fd.append("hospitalOrg", input.hospitalOrg);
    fd.append("organizationAddress", input.organizationAddress);
    fd.append("zone", input.zone);
  } else {
    fd.append("inMedicalField", input.inMedicalField ? "true" : "false");
    if (input.inMedicalField) {
      if (input.primarySpecialty) fd.append("primarySpecialty", input.primarySpecialty);
      if (input.hospitalOrg) fd.append("hospitalOrg", input.hospitalOrg);
    }
    if (input.occupation) fd.append("occupation", input.occupation);
  }

  if (input.avatar) {
    fd.append("avatar", input.avatar);
  }

  return apiFetch<IndividualRegistrationResponse>("/api/registrations", {
    method: "POST",
    body: fd,
  });
}

export async function initializeRegistrationPayment(userId: string): Promise<RegistrationPaymentInitializeResponse> {
  const raw = await apiFetch<unknown>("/api/payments/registration", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
  return normalizePaymentInitializeResponseFromWire(raw) as RegistrationPaymentInitializeResponse;
}

export async function getMyRegistration(): Promise<{
  id: string;
  status: string;
  user: {
    id: string;
    email: string;
    regType: "member" | "attendee" | "non-member";
    registrationStatus: string;
  };
  member?: MemberProfile;
  attendee?: AttendeeProfile;
  payment?: {
    reference: string;
    status: string;
    paidAt: string | null;
  };
}> {
  return apiFetch("/api/registrations/me");
}

export interface ConferenceRegistrationPricing {
  memberPriceKobo: number;
  nonMemberPriceKobo: number;
}

export async function getConferenceRegistrationPricing(): Promise<ConferenceRegistrationPricing> {
  return apiFetch<ConferenceRegistrationPricing>("/api/registrations/pricing");
}

export interface UpdateMemberProfileInput {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  title?: string;
  bio?: string;
  primarySpecialty?: string;
  hospitalOrg?: string;
  organizationAddress?: string;
  zone?: string;
  state?: string;
  hasSpouse?: boolean;
  spouseName?: string;
  spouseEmail?: string;
  spousePhone?: string;
  avatar?: File | null;
}

export async function updateMemberProfile(input: UpdateMemberProfileInput): Promise<MemberProfile> {
  const fd = new FormData();
  if (input.firstName !== undefined) fd.append("firstName", input.firstName);
  if (input.lastName !== undefined) fd.append("lastName", input.lastName);
  if (input.fullName !== undefined) fd.append("fullName", input.fullName);
  if (input.phone !== undefined) fd.append("phone", input.phone);
  if (input.title !== undefined) fd.append("title", input.title);
  if (input.bio !== undefined) fd.append("bio", input.bio);
  if (input.primarySpecialty !== undefined) fd.append("primarySpecialty", input.primarySpecialty);
  if (input.hospitalOrg !== undefined) fd.append("hospitalOrg", input.hospitalOrg);
  if (input.organizationAddress !== undefined) fd.append("organizationAddress", input.organizationAddress);
  if (input.zone !== undefined) fd.append("zone", input.zone);
  if (input.state !== undefined) fd.append("state", input.state);
  if (input.hasSpouse !== undefined) fd.append("hasSpouse", String(input.hasSpouse));
  if (input.spouseName !== undefined) fd.append("spouseName", input.spouseName);
  if (input.spouseEmail !== undefined) fd.append("spouseEmail", input.spouseEmail);
  if (input.spousePhone !== undefined) fd.append("spousePhone", input.spousePhone);
  if (input.avatar) fd.append("avatar", input.avatar);
  return apiFetch<MemberProfile>("/api/registrations/me", { method: "PATCH", body: fd });
}

export async function verifyRegistrationPayment(reference: string): Promise<{
  success: boolean;
  payment: Payment;
  paystackData: Record<string, unknown>;
}> {
  const raw = await apiFetch<Record<string, unknown>>(
    `/api/payments/paystack/verify/${encodeURIComponent(reference)}`
  );
  return {
    success: Boolean(raw.success),
    payment: normalizePaymentFromWire(raw.payment),
    paystackData:
      raw.paystackData && typeof raw.paystackData === "object"
        ? (raw.paystackData as Record<string, unknown>)
        : {},
  };
}

// ==================== Event Pass API ====================

export interface ConferencePassData {
  avatar: string;
  name: string;
  ticketType: "member" | "attendee" | "company";
  bio: string;
  qrCodeUrl: string;
  viewCount: number;
}

export interface HotelBooking {
  hotelName: string;
  rooms: { roomType: string }[];
}

export interface HotelPassData {
  name: string;
  avatar: string;
  hotels: HotelBooking[];
  qrCodeUrl: string;
}

export interface EventPassSummary {
  conferencePass: {
    qrCodeUrl: string;
    viewCount: number;
    createdAt: string;
  } | null;
  hotelPass: {
    qrCodeUrl: string;
    createdAt: string;
  } | null;
}

export async function generateConferencePass(userId: string): Promise<{ qrCodeUrl: string }> {
  return apiFetch<{ qrCodeUrl: string }>(`/api/event-pass/conference/${userId}`, {
    method: "POST",
  });
}

export async function getConferencePassData(userId: string): Promise<ConferencePassData> {
  return apiFetch<ConferencePassData>(`/api/event-pass/conference/${userId}`);
}

export async function generateHotelPass(userId: string): Promise<{ qrCodeUrl: string }> {
  return apiFetch<{ qrCodeUrl: string }>(`/api/event-pass/hotel/${userId}`, {
    method: "POST",
  });
}

export async function getHotelPassData(userId: string): Promise<HotelPassData> {
  return apiFetch<HotelPassData>(`/api/event-pass/hotel/${userId}`);
}

export async function getMyEventPasses(): Promise<EventPassSummary> {
  return apiFetch<EventPassSummary>("/api/event-pass");
}

/** GET /api/event-pass/company/pass-purchase-eligibility — JWT; any authenticated portal user. */
export async function getPassPurchaseEligibility(): Promise<{ isEligible: boolean }> {
  return apiFetch<{ isEligible: boolean }>("/api/event-pass/company/pass-purchase-eligibility");
}

// ==================== Attendance Moderator APIs ====================

export interface EventDay {
  id: string;
  label: string;
  date: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { attendances: number };
}

export interface AttendanceEntry {
  entryIndex: number;
  markedAt: string;
  guestName?: string | null;
  guestPhone?: string | null;
}

export interface ScanResult {
  regType: "member" | "attendee" | "company";
  userId: string;
  name: string;
  avatar: string | null;
  // member only
  hasSpouse?: boolean;
  spouseName?: string | null;
  spouseEmail?: string | null;
  spousePhone?: string | null;
  // company only
  tier?: string;
  maxEntries?: number;
  // all
  todayEntries: AttendanceEntry[];
  alreadyFull: boolean;
}

export interface SpeakerScanResult {
  profileId: string;
  kind: ConferenceProfileKind;
  name: string;
  role: string;
  qualifications: string;
  avatar: string | null;
  admitted: boolean;
  markedAt: string | null;
}

export interface AttendanceSummary {
  members: { uniqueCheckedIn: number; memberEntries: number; spouseEntries: number };
  attendees: { uniqueCheckedIn: number };
  companies: { uniqueCompanies: number; totalEntries: number };
}

export interface ModeratorSummary {
  id: string;
  name: string;
  email: string;
  userId: string;
  avatar: string | null;
  status: string;
  createdAt: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  expiresAt: string;
  status: string;
  createdAt: string;
}

// ── Moderator portal endpoints ──────────────────────────────────────────────

export async function getActiveDays(): Promise<EventDay[]> {
  return apiFetch<EventDay[]>("/api/attendance/days/active");
}

export async function getAllDaysForModerator(): Promise<EventDay[]> {
  return apiFetch<EventDay[]>("/api/attendance/days/all");
}

export async function getScanDetails(userId: string, eventDayId?: string): Promise<ScanResult> {
  const params: Record<string, string> = {};
  if (eventDayId) params.eventDayId = eventDayId;
  return apiFetch<ScanResult>(`/api/attendance/scan/${encodeURIComponent(userId)}`, { params });
}

export async function markAttendance(
  userId: string,
  eventDayId: string,
  opts?: { guestName?: string; guestPhone?: string }
): Promise<{ entryIndex: number; markedAt: string; message: string }> {
  return apiFetch<{ entryIndex: number; markedAt: string; message: string }>("/api/attendance/mark", {
    method: "POST",
    body: JSON.stringify({ userId, eventDayId, ...opts }),
  });
}

export async function getSpeakerScanDetails(passCode: string, eventDayId?: string): Promise<SpeakerScanResult> {
  const params: Record<string, string> = {};
  if (eventDayId) params.eventDayId = eventDayId;
  return apiFetch<SpeakerScanResult>(`/api/attendance/speaker/scan/${encodeURIComponent(passCode)}`, { params });
}

export async function markSpeakerAttendance(
  passCode: string,
  eventDayId: string
): Promise<{ markedAt: string; message: string }> {
  return apiFetch<{ markedAt: string; message: string }>("/api/attendance/speaker/mark", {
    method: "POST",
    body: JSON.stringify({ passCode, eventDayId }),
  });
}

export interface CheckinRecord {
  id: string;
  userId: string;
  entryIndex: number;
  markedAt: string;
  guestName?: string | null;
  guestPhone?: string | null;
  user: {
    id: string;
    regType: string;
    email: string;
    member?: { fullName: string; avatar?: string | null } | null;
    attendee?: { fullName: string; avatar?: string | null } | null;
    company?: { companyName: string; logo?: string | null } | null;
  };
  markedBy: {
    id: string;
    email: string;
    admin?: { name: string } | null;
  };
}

export interface DayCheckinsResponse {
  items: CheckinRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function getDayCheckins(
  dayId: string,
  page = 1,
  limit = 100,
): Promise<DayCheckinsResponse> {
  return apiFetch<DayCheckinsResponse>(
    `/api/attendance/days/${encodeURIComponent(dayId)}/checkins`,
    { params: { page: String(page), limit: String(limit) } },
  );
}

// ── Admin: conference days ───────────────────────────────────────────────────

export async function getAdminConferenceDays(): Promise<EventDay[]> {
  return apiFetch<EventDay[]>("/api/admin/conference-days");
}

export async function createAdminConferenceDay(data: {
  label: string;
  date: string;
  isActive?: boolean;
}): Promise<EventDay> {
  return apiFetch<EventDay>("/api/admin/conference-days", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminConferenceDay(
  id: string,
  data: Partial<{ label: string; date: string; isActive: boolean }>
): Promise<EventDay> {
  return apiFetch<EventDay>(`/api/admin/conference-days/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAdminConferenceDay(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/conference-days/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getAdminDayAttendance(
  dayId: string,
  query: { page?: number; limit?: number } = {}
): Promise<{ items: unknown[]; page: number; limit: number; total: number; totalPages: number }> {
  const params: Record<string, string> = {};
  if (query.page) params.page = String(query.page);
  if (query.limit) params.limit = String(query.limit);
  return apiFetch(`/api/admin/conference-days/${encodeURIComponent(dayId)}/attendance`, { params });
}

export async function getAdminDayAttendanceSummary(dayId: string): Promise<AttendanceSummary> {
  return apiFetch<AttendanceSummary>(
    `/api/admin/conference-days/${encodeURIComponent(dayId)}/attendance/summary`
  );
}

// ── Admin: moderators ────────────────────────────────────────────────────────

export async function inviteModeratorAdmin(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/admin/moderators/invite", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function listModeratorsAdmin(): Promise<{
  moderators: ModeratorSummary[];
  pendingInvites: PendingInvite[];
}> {
  return apiFetch("/api/admin/moderators");
}

export async function deactivateModeratorAdmin(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/moderators/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function revokeModeratorInvite(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/moderators/invites/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * Downloads an attendance PDF report and triggers a browser save dialog.
 * @param eventDayId  - specific day ID, or undefined for all days
 * @param isAdmin     - true → uses admin endpoint; false → uses moderator endpoint
 */
export async function downloadAttendancePdf(
  eventDayId?: string,
  isAdmin = true,
): Promise<void> {
  const basePath = isAdmin
    ? "/api/admin/conference-days/report/pdf"
    : "/api/attendance/report/pdf";
  const url = new URL(basePath, API_BASE);
  if (eventDayId) url.searchParams.set("eventDayId", eventDayId);

  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as Record<string, string>)?.message ?? "Failed to download report");
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const cd = res.headers.get("content-disposition") ?? "";
  const match = cd.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? "attendance-report.pdf";

  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

// ─── Receipts ──────────────────────────────────────────────────────────────

export interface ReceiptLineItem {
  type: string;
  title: string;
  quantity: number;
  unitPriceKobo: number;
  totalKobo: number;
  bundlePerks?: string[];
  bundleAllocations?: {
    booth?: { name: string; tier: string };
    masterclass?: { title: string; duration: string; day: string };
    presentation?: { title: string; duration: string; day: string };
    advertSlots?: Array<{ title: string }>;
    brandingSlots?: Array<{ title: string }>;
  };
}

export interface ReceiptData {
  id: string;
  reference: string;
  kind: PaymentKind | "registration";
  status: PaymentStatus;
  baseAmountKobo: number;
  totalAmountKobo: number;
  provider: string;
  paidAt: string | null;
  createdAt: string;
  /** Set when an admin has manually reconciled this payment. */
  reconciledAmountKobo?: number | null;
  reconciledPaidAt?: string | null;
  reconciledNote?: string | null;
  isReconciled?: boolean;
  user: { id: string; email: string; regType: string; name?: string };
  company?: { id: string; companyName: string };
  items: ReceiptLineItem[];
}

export interface ReceiptListResponse {
  data: ReceiptData[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export async function getMyReceipts(params?: {
  page?: number;
  pageSize?: number;
  kind?: string;
  status?: string;
}): Promise<ReceiptListResponse> {
  const p: Record<string, string> = {};
  if (params?.page) p.page = String(params.page);
  if (params?.pageSize) p.pageSize = String(params.pageSize);
  if (params?.kind) p.kind = params.kind;
  if (params?.status) p.status = params.status;
  return apiFetch<ReceiptListResponse>("/api/receipts", { params: p });
}

export async function getAllReceiptsAdmin(params?: {
  page?: number;
  pageSize?: number;
  kind?: string;
  status?: string;
}): Promise<ReceiptListResponse> {
  const p: Record<string, string> = {};
  if (params?.page) p.page = String(params.page);
  if (params?.pageSize) p.pageSize = String(params.pageSize);
  if (params?.kind) p.kind = params.kind;
  if (params?.status) p.status = params.status;
  return apiFetch<ReceiptListResponse>("/api/receipts/admin", { params: p });
}

export async function getReceiptById(id: string): Promise<ReceiptData> {
  return apiFetch<ReceiptData>(`/api/receipts/${encodeURIComponent(id)}`);
}

/** Fetches the HTML receipt and opens it in a new window for printing. */
export async function printReceiptById(id: string): Promise<void> {
  const url = new URL(`/api/receipts/${encodeURIComponent(id)}/html`, API_BASE);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) throw new ApiError(res.status, "Failed to load receipt for printing");
  const html = await res.text();
  const win = window.open("", "_blank", "width=820,height=700");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
    };
  }
}

// ─── Elections ────────────────────────────────────────────────────────────────

export interface VotingSettings {
  id: string;
  isActive: boolean;
  activatedAt: string | null;
  deactivatedAt: string | null;
  updatedAt: string;
  updatedById: string | null;
}

export interface ElectionPosition {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  positionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ElectionPositionWithCandidates extends ElectionPosition {
  candidates: Pick<Candidate, "id" | "name" | "bio" | "avatar" | "positionId">[];
}

export interface AdminPositionWithCounts extends ElectionPosition {
  _count: { candidates: number; votes: number };
}

export interface CandidateWithVoteCount extends Candidate {
  _count: { votes: number };
}

export interface CandidateResult {
  id: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  voteCount: number;
  percentage: number;
}

export interface PositionResult {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isActive: boolean;
  totalVotes: number;
  candidates: CandidateResult[];
}

export interface ElectionsStats {
  isActive: boolean;
  activatedAt: string | null;
  totalPositions: number;
  totalVotes: number;
  uniqueVoters: number;
  completedVoters: number;
}

export interface MyVote {
  positionId: string;
  candidateId: string;
  createdAt: string;
  position: { title: string };
  candidate: { name: string; avatar: string | null };
}

export interface AuditVote {
  id: string;
  votedAt: string;
  voterEmail: string;
  voterName: string;
  positionTitle: string;
  candidateName: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AuditPage {
  data: AuditVote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CastVoteInput {
  positionId: string;
  candidateId: string;
}

export interface CreatePositionInput {
  title: string;
  description?: string;
  order?: number;
}

export interface UpdatePositionInput {
  title?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

// ── Member / public ──────────────────────────────────────────────────────────

export async function getElectionsStatus(): Promise<{
  isActive: boolean;
  activatedAt: string | null;
}> {
  return apiFetch("/api/elections/status");
}

export async function getElectionsPositions(): Promise<
  ElectionPositionWithCandidates[]
> {
  return apiFetch("/api/elections/positions");
}

export async function castVote(body: CastVoteInput): Promise<{
  id: string;
  positionId: string;
  candidateId: string;
  createdAt: string;
  position: { title: string };
  candidate: { name: string };
}> {
  return apiFetch("/api/elections/vote", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getMyVotes(): Promise<MyVote[]> {
  return apiFetch("/api/elections/my-votes");
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function getAdminElectionsSettings(): Promise<VotingSettings> {
  return apiFetch("/api/admin/elections/settings");
}

export async function toggleVoting(isActive: boolean): Promise<VotingSettings> {
  return apiFetch("/api/admin/elections/settings", {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export async function getElectionsStats(): Promise<ElectionsStats> {
  return apiFetch("/api/admin/elections/stats");
}

export async function getElectionsResults(): Promise<PositionResult[]> {
  return apiFetch("/api/admin/elections/results");
}

export async function getAdminElectionsAudit(params: {
  page: number;
  limit: number;
}): Promise<AuditPage> {
  return apiFetch("/api/admin/elections/audit", {
    params: { page: String(params.page), limit: String(params.limit) },
  });
}

export function downloadElectionsAuditCsv() {
  const url = new URL(
    "/api/admin/elections/audit/export",
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
  );
  window.open(url.toString(), "_blank");
}

export async function listAdminPositions(): Promise<AdminPositionWithCounts[]> {
  return apiFetch("/api/admin/elections/positions");
}

export async function createPosition(
  body: CreatePositionInput
): Promise<ElectionPosition> {
  return apiFetch("/api/admin/elections/positions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updatePosition(
  id: string,
  body: UpdatePositionInput
): Promise<ElectionPosition> {
  return apiFetch(`/api/admin/elections/positions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deletePosition(id: string): Promise<void> {
  return apiFetch(`/api/admin/elections/positions/${id}`, {
    method: "DELETE",
  });
}

export async function listCandidates(
  positionId: string
): Promise<CandidateWithVoteCount[]> {
  return apiFetch(`/api/admin/elections/positions/${positionId}/candidates`);
}

export async function createCandidate(
  positionId: string,
  body: FormData
): Promise<Candidate> {
  return apiFetch(`/api/admin/elections/positions/${positionId}/candidates`, {
    method: "POST",
    body,
  });
}

export async function updateCandidate(
  id: string,
  body: FormData
): Promise<Candidate> {
  return apiFetch(`/api/admin/elections/candidates/${id}`, {
    method: "PATCH",
    body,
  });
}

export async function deleteCandidate(id: string): Promise<void> {
  return apiFetch(`/api/admin/elections/candidates/${id}`, {
    method: "DELETE",
  });
}
