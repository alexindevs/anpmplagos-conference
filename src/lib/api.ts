const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string> }
): Promise<T> {
  const { params, ...init } = options ?? {};
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
  headerImage?: string;
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
  totalLeads: number;
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
  hotelBookingUrl?: string;
  headerImage?: string;
  profileImage?: string;
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
  return apiFetch<ExhibitorProfile>("/api/companies/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
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

export type AdminCreateBoothInput = {
  /** Display title for the booth (maps to `name` on the API). */
  name: string;
  description?: string | null;
  /** Free-text size label, e.g. "3m × 3m". */
  size: string;
  /** Price in kobo (e.g. ₦50,000 → 5_000_000). Sent as form field `price`. */
  price: number;
  isReserved?: boolean;
  /** Optional image file; sent as multipart field `boothImage` (matches backend). */
  boothImageFile?: File | null;
};

const ADMIN_BOOTH_IMAGE_FIELD = "boothImage";

/** GET /api/admin/booths — list booths for admin dashboard. */
export async function getAdminBooths(): Promise<Booth[]> {
  return apiFetch<Booth[]>("/api/admin/booths");
}

export type AdminPatchBoothInput = {
  isReserved?: boolean;
};

/** PATCH /api/admin/booths/:id — update booth (e.g. reserve). */
export async function adminPatchBooth(id: string, input: AdminPatchBoothInput): Promise<Booth> {
  return apiFetch<Booth>(`/api/admin/booths/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/**
 * POST /api/admin/booths — multipart/form-data with field `boothImage` when a file is provided.
 * Text fields are always sent as form fields so multer-style handlers work consistently.
 */
export async function adminCreateBooth(input: AdminCreateBoothInput): Promise<Booth> {
  const fd = new FormData();
  fd.append("name", input.name);
  fd.append("description", input.description ?? "");
  fd.append("size", input.size);
  fd.append("price", String(Math.round(input.price)));
  fd.append("isReserved", input.isReserved ? "true" : "false");
  if (input.boothImageFile) {
    fd.append(ADMIN_BOOTH_IMAGE_FIELD, input.boothImageFile);
  }
  return apiFetch<Booth>("/api/admin/booths", {
    method: "POST",
    body: fd,
  });
}

/** Parse user-entered naira (e.g. "50000" or "50,000") into kobo. */
export function parseNairaInputToKobo(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const naira = parseFloat(cleaned);
  if (Number.isNaN(naira) || naira < 0) return null;
  return Math.round(naira * 100);
}

export interface RegistrationResponse {
  id: string;
  status: string;
  createdAt: string;
  message: string;
}

export type SponsorStatus = "pending_pledge" | "pending_payment" | "active" | "cancelled";
export type SponsorTier = "platinum" | "gold" | "silver" | "bronze" | "custom";
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
  profileImage?: string;
  logo?: string;
  tier?: SponsorTier | string;
  sponsorAmount?: number;
  status?: string;
  user?: { email: string; registrationStatus: string };
  booth?: Booth | null;
  representatives?: { id?: string; name: string; title: string; phone: string }[];
  createdAt: string;
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
      amount: Number(o.amount) || 0,
      baseAmount: Number(o.baseAmount) || 0,
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
      amount: Number(payment.amount) || 0,
      baseAmount: Number(payment.baseAmount) || 0,
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
    /** @deprecated Legacy pledge metrics */
    totalSponsors?: number;
    activeSponsors?: number;
    totalPledged?: number;
    totalActive?: number;
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

export async function getAdminCompanies(
  query: AdminCompaniesQuery = {}
): Promise<PaginatedResponse<CompanySummary>> {
  const params: Record<string, string> = {};
  if (query.page) params.page = String(query.page);
  if (query.pageSize) params.pageSize = String(query.pageSize);
  if (query.status) params.status = String(query.status);
  if (query.tier) params.tier = String(query.tier);
  if (query.search) params.search = query.search;
  return apiFetch<PaginatedResponse<CompanySummary>>("/api/admin/companies", { params });
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
  return apiFetch<SponsorDetail>(`/api/admin/companies/${id}`);
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
  return apiFetch<SponsorDetail>(`/api/admin/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function postSponsorBooth(sponsorId: string, boothId: string | null): Promise<SponsorDetail> {
  return apiFetch<SponsorDetail>(`/api/admin/companies/${sponsorId}/booth`, {
    method: "POST",
    body: JSON.stringify({ boothId }),
  });
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
  return apiFetch<ExhibitorDetail>(`/api/admin/companies/${companyId}/booth`, {
    method: "POST",
    body: JSON.stringify({ boothId }),
  });
}

/** @deprecated Use `postAdminCompanyBooth` */
export async function putExhibitorBooth(
  exhibitorId: string,
  boothId: string | null
): Promise<ExhibitorDetail> {
  return postAdminCompanyBooth(exhibitorId, boothId);
}

export async function getAdminExhibitor(id: string): Promise<ExhibitorDetail> {
  return apiFetch<ExhibitorDetail>(`/api/admin/companies/${id}`);
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
  }>
): Promise<ExhibitorDetail> {
  return apiFetch<ExhibitorDetail>(`/api/admin/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/** Admin create body for masterclass / panel / presentation slots (SESSIONS-API.md). */
export interface CreateAdminSessionSlotInput {
  title: string;
  description: string;
  priceInKobo: number;
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
  return apiFetch<AvailableSessionSlotsResponse>("/api/companies/session-slots/available");
}

export async function getCompanyMeSessions(): Promise<CompanyMeSessionsResponse> {
  const raw = await apiFetch<Record<string, unknown>>("/api/companies/me/sessions");
  return {
    masterclasses: (Array.isArray(raw.masterclasses) ? raw.masterclasses : []) as CompanyOwnedSessionSlot[],
    panelSessions: (Array.isArray(raw.panelSessions) ? raw.panelSessions : []) as CompanyOwnedSessionSlot[],
    presentations: (Array.isArray(raw.presentations) ? raw.presentations : []) as CompanyOwnedSessionSlot[],
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
  /** RegType, e.g. `member`, `attendee`, `company`, `speaker`, `special_guest` */
  type: string;
  registeredAt: string;
  /** `pending_payment`, `registered`, `cancelled` */
  status: string;
  profileUrl: string | null;
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
  website?: string;
  headerImage?: string;
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
  return companies.map((c) => ({
    id: c.id,
    slug: c.slug,
    companyName: c.companyName,
    tagline: c.tagline,
    website: c.website,
    tier: (c.tier ?? c.effectiveDisplayTier ?? "custom") as SponsorTier,
    logo: c.profileImage,
    headerImage: c.headerImage,
    booth: c.booth ?? undefined,
  }));
}

export interface SponsorshipPlanCatalogItem {
  id: string;
  name: string;
  priceInKobo: number;
  tier: string;
  perks?: string[];
}

export async function getSponsorshipPlans(): Promise<SponsorshipPlanCatalogItem[]> {
  return apiFetch<SponsorshipPlanCatalogItem[]>("/api/companies/sponsorship-plans");
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

/** Full list including booked / reserved (admin only). */
export async function getAdminHotelRooms(): Promise<HotelRoom[]> {
  const res = await apiFetch<HotelRoom[] | { items?: HotelRoom[] }>("/api/admin/hotel-rooms");
  return Array.isArray(res) ? res : (res.items ?? []);
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

export interface MarketingSlotTakenBy {
  id: string;
  name: string;
  slug: string | null;
}

/** Admin list: includes `takenBy` summary when occupied. */
export interface AdminAdvertSlot {
  id: string;
  title: string;
  image: string | null;
  price: number;
  description: string | null;
  isTaken: boolean;
  isReserved: boolean;
  takenBy?: MarketingSlotTakenBy | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminBrandingSlot {
  id: string;
  title: string;
  image: string | null;
  price: number;
  description: string | null;
  isTaken: boolean;
  isReserved: boolean;
  takenBy?: MarketingSlotTakenBy | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Public catalog + `/me` sanitized shape. */
export type CompanyMarketingSlot = Pick<
  AdminAdvertSlot,
  "id" | "title" | "image" | "price" | "description" | "isReserved" | "isTaken" | "createdAt" | "updatedAt"
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
  advertSlotImage: File;
}

export async function postAdminAdvertSlot(input: CreateAdminAdvertSlotInput): Promise<AdminAdvertSlot> {
  const fd = new FormData();
  fd.append("title", input.title.trim());
  fd.append("price", String(Math.round(input.price)));
  fd.append("description", input.description?.trim() ?? "");
  fd.append("isReserved", input.isReserved ? "true" : "false");
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
  brandingSlotImage: File;
}

export async function postAdminBrandingSlot(input: CreateAdminBrandingSlotInput): Promise<AdminBrandingSlot> {
  const fd = new FormData();
  fd.append("title", input.title.trim());
  fd.append("price", String(Math.round(input.price)));
  fd.append("description", input.description?.trim() ?? "");
  fd.append("isReserved", input.isReserved ? "true" : "false");
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
  | "branding_slot";

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
  createdAt: string;
  updatedAt: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  payment: Payment;
  paystackData: Record<string, unknown>;
}

export async function initializeBoothPayment(
  request: InitializeBoothPaymentRequest
): Promise<PaymentInitializeResponse> {
  const body: Record<string, string> = { boothId: request.boothId };
  if (request.companyId) body.companyId = request.companyId;
  return apiFetch<PaymentInitializeResponse>("/api/payments/booth", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function initializeSessionPayment(
  request: InitializeSessionPaymentRequest
): Promise<PaymentInitializeResponse> {
  const body: Record<string, string> = {
    type: request.type,
    sessionId: request.sessionId,
  };
  if (request.companyId) body.companyId = request.companyId;
  return apiFetch<PaymentInitializeResponse>("/api/payments/session", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function initializeSponsorshipPlanPayment(
  request: InitializeSponsorshipPlanPaymentRequest
): Promise<PaymentInitializeResponse> {
  const body: Record<string, string> = { sponsorshipPlanId: request.sponsorshipPlanId };
  if (request.companyId) body.companyId = request.companyId;
  return apiFetch<PaymentInitializeResponse>("/api/payments/sponsorship-plan", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function initializeHotelRoomPayment(
  request: InitializeHotelRoomPaymentRequest
): Promise<PaymentInitializeResponse> {
  return apiFetch<PaymentInitializeResponse>("/api/payments/hotel-room", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function initializeAdvertSlotPayment(
  request: InitializeAdvertSlotPaymentRequest
): Promise<PaymentInitializeResponse> {
  const body: Record<string, string> = { advertSlotId: request.advertSlotId };
  if (request.companyId) body.companyId = request.companyId;
  return apiFetch<PaymentInitializeResponse>("/api/payments/advert-slot", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function initializeBrandingSlotPayment(
  request: InitializeBrandingSlotPaymentRequest
): Promise<PaymentInitializeResponse> {
  const body: Record<string, string> = { brandingSlotId: request.brandingSlotId };
  if (request.companyId) body.companyId = request.companyId;
  return apiFetch<PaymentInitializeResponse>("/api/payments/branding-slot", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
  return apiFetch<VerifyPaymentResponse>(`/api/payments/paystack/verify/${reference}`);
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
