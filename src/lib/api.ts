const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Request failed");
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
