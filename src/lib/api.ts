// Support full URL (e.g. http://localhost:3000) or port only (e.g. 8001) so relative fetch doesn't break
function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";
  const trimmed = String(raw).trim();
  if (/^\d+$/.test(trimmed)) {
    const port = trimmed;
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:${port}`;
    }
    return `http://localhost:${port}`;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return `http://${trimmed}`;
  }
  return trimmed;
}
const API_URL = getApiBaseUrl();

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("span28_token");
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Request failed");
  }
  return json.data ?? json;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAuth<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message ?? "Request failed";
    throw new ApiError(msg, res.status, json?.error?.code, json?.error?.details);
  }
  return json.data ?? json;
}

export interface LocationRulesData {
  fullAddress: string;
  boundaryGeoJSON: object | null;
  limits: Record<string, number>;
  windRegion: string | null;
  balRating: string | null;
  soilClass: string | null;
  mapCenter: [number, number];
  lat: number;
  lng: number;
  councilId: string;
  postcode?: string;
}

export async function getLocationRules(address: string): Promise<LocationRulesData> {
  const res = await fetchApi<{ success: boolean; data: LocationRulesData }>(
    "/api/location/rules",
    {
      method: "POST",
      body: JSON.stringify({ address }),
    }
  );
  return (res as { data: LocationRulesData }).data ?? (res as unknown as LocationRulesData);
}

export interface ValidateFullConfig {
  structure_type: string;
  configuration: {
    width: number;
    depth: number;
    height?: number;
    attachment_type?: string;
    post_size?: string;
    rear_setback_m?: number;
  };
  addressData?: {
    lat: number;
    lng: number;
    limits: Record<string, number>;
    councilId?: string;
  };
}

export interface ValidateFullResult {
  complies: boolean;
  bom: { lineItems: Array<{ sku: string; qty: number; unit: string; cost: number }>; totalCost: number } | null;
  suppliers: Array<{ branchId: string; supplierName: string; distance: number; freight: number }>;
  redFlags: Array<{ message: string }>;
  structural: Record<string, unknown> | null;
}

export async function validateFull(
  config: ValidateFullConfig
): Promise<ValidateFullResult> {
  const res = await fetchApi<ValidateFullResult>("/api/configurator/validate-full", {
    method: "POST",
    body: JSON.stringify(config),
  });
  return res as ValidateFullResult;
}

export async function getProducts() {
  return fetchApi<unknown[]>("/api/configurator/products");
}

export async function createQuote(data: {
  structure_type: string;
  configuration: Record<string, unknown>;
  addons?: string[];
  customer: { name: string; email: string; phone?: string };
  installation?: { address?: string; suburb?: string; state?: string; postcode?: string };
  notes?: string;
}) {
  return fetchApi<{ quote_id: string; quote_number: string; total: number }>(
    "/api/configurator/quote",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// Auth-required API (Admin, Builder) — use localStorage span28_token when logged in
export async function getAdminDashboard() {
  const data = await fetchWithAuth<Record<string, unknown>>("/api/admin/dashboard");
  return { success: true, data };
}

export async function getQuote(idOrQuoteNumber: string) {
  const data = await fetchApi<Record<string, unknown>>(
    `/api/configurator/quote/${encodeURIComponent(idOrQuoteNumber)}`
  );
  return { success: true, data };
}

export async function getBuilderQuotes(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(
    `${API_URL}/api/builder/quotes?page=${page}&limit=${limit}`,
    { headers }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
  const list = json.data ?? [];
  const meta = json.meta ?? {};
  return { success: true, data: list, total: meta.total ?? list.length, page: meta.page ?? page, limit: meta.limit ?? limit };
}

export async function getBuilderQuote(id: string) {
  const data = await fetchWithAuth<Record<string, unknown>>(`/api/builder/quotes/${id}`);
  return { success: true, data };
}

export type AuthUser = { id: string; email: string; name: string };

export async function login(email: string, password: string): Promise<{ user: AuthUser; accessToken: string }> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Login failed");
  const data = json.data ?? json;
  const token = data.accessToken;
  if (token && typeof window !== "undefined") localStorage.setItem("span28_token", token);
  return { user: data.user, accessToken: token };
}

export async function register(name: string, email: string, password: string): Promise<{ user: AuthUser; accessToken: string }> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Registration failed");
  const data = json.data ?? json;
  const token = data.accessToken;
  if (token && typeof window !== "undefined") localStorage.setItem("span28_token", token);
  return { user: data.user, accessToken: token };
}

export function logout(): void {
  if (typeof window !== "undefined") localStorage.removeItem("span28_token");
}

export async function getMe(): Promise<AuthUser | null> {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const data = await fetchWithAuth<AuthUser>("/api/users/me");
    return data;
  } catch {
    return null;
  }
}

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  status: string;
  createdAt: string;
  roles: Array<{ id: string; name: string; description: string | null }>;
};

export type AdminRole = { id: string; name: string; description: string | null; isSystem?: boolean };

export async function getAdminUsers(params?: { page?: number; limit?: number; search?: string }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const search = params?.search ?? "";
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) q.set("search", search);
  const res = await fetch(`${API_URL}/api/admin/users?${q}`, {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
  const list = json.data ?? [];
  const meta = json.meta ?? {};
  return { success: true, data: list as AdminUser[], total: meta.total ?? list.length, page: meta.page ?? page, limit: meta.limit ?? limit };
}

export async function getAdminRoles() {
  const data = await fetchWithAuth<AdminRole[]>("/api/admin/roles");
  return { success: true, data: Array.isArray(data) ? data : [] };
}

export async function assignUserRole(userId: string, roleId: string) {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}/roles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
    },
    body: JSON.stringify({ roleId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Failed to assign role");
  return json.data ?? { roleId };
}

export async function removeUserRole(userId: string, roleId: string) {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}/roles/${roleId}`, {
    method: "DELETE",
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Failed to remove role");
  return json.data ?? {};
}

export const api = {
  getLocationRules,
  validateFull,
  getProducts,
  createQuote,
  getAdminDashboard,
  getQuote,
  getBuilderQuotes,
  getBuilderQuote,
  login,
  register,
  logout,
  getMe,
  getAdminUsers,
  getAdminRoles,
  assignUserRole,
  removeUserRole,
};
