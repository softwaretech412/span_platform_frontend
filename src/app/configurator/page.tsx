"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { AddressSearch } from "@/components/configurator/AddressSearch";
import { MapView } from "@/components/configurator/MapView";
import { ConfigSliders } from "@/components/configurator/ConfigSliders";
import { Structure3D } from "@/components/configurator/Structure3D";
import { ValidationBadge } from "@/components/configurator/ValidationBadge";
import { BOMQuote } from "@/components/configurator/BOMQuote";
import { getLocationRules, validateFull, type LocationRulesData } from "@/lib/api";

export type LocationData = LocationRulesData;

export interface StructuralData {
  beam_size: string;
  has_mid_beam: boolean;
  mid_beam_position_m: number | null;
  front_posts: number;
  rear_posts: number;
  post_size_mm: number;
  rafter_count: number;
  rafter_spacing_mm: number;
  flyover_brackets: number;
  flyover_spacing_mm: number;
  attachment_type: string;
  labels: { width_m: number; depth_m: number; area_sqm: number };
}

const DEFAULT_LIMITS: Record<string, number> = {
  width_limit: 8,
  height_limit: 3.6,
  setback_rear: 0,
};

export default function ConfiguratorPage() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [configuration, setConfiguration] = useState({
    width: 5,
    depth: 4,
    height: 2.4,
    attachment_type: "attached",
    post_size: "90",
    rear_setback_m: 1.5,
  });
  const [structureType, setStructureType] = useState("flatdek");
  const [validation, setValidation] = useState<{
    complies: boolean;
    redFlags: Array<{ message: string }>;
    structural: StructuralData | null;
    bom: { lineItems: unknown[]; totalCost: number } | null;
    suppliers: unknown[];
  } | null>(null);
  const [validating, setValidating] = useState(false);
  const validateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onAddressFound = useCallback((data: LocationData) => {
    setLocationData(data);
    if (data.limits.setback_rear != null) {
      setConfiguration((c) => ({ ...c, rear_setback_m: data.limits.setback_rear }));
    }
    if (data.limits.height_limit != null) {
      setConfiguration((c) => ({ ...c, height: Math.min(c.height, data.limits.height_limit) }));
    }
    setValidation(null);
  }, []);

  const runValidation = useCallback(async () => {
    setValidating(true);
    try {
      const res = await validateFull({
        structure_type: structureType,
        configuration,
        addressData: locationData
          ? {
              lat: locationData.lat,
              lng: locationData.lng,
              limits: locationData.limits,
              councilId: locationData.councilId,
            }
          : undefined,
      });
      setValidation(res);
    } catch (e) {
      console.error("Validation failed:", e);
      setValidation({
        complies: false,
        redFlags: [{ message: "Validation failed. Check address or try again." }],
        structural: null,
        bom: null,
        suppliers: [],
      });
    } finally {
      setValidating(false);
    }
  }, [structureType, configuration, locationData]);

  // Debounced auto-validate when address is set and config changes
  useEffect(() => {
    if (!locationData) return;
    if (validateTimeoutRef.current) clearTimeout(validateTimeoutRef.current);
    validateTimeoutRef.current = setTimeout(runValidation, 1500);
    return () => {
      if (validateTimeoutRef.current) clearTimeout(validateTimeoutRef.current);
    };
  }, [locationData, structureType, configuration, runValidation]);

  const limits = locationData?.limits ?? DEFAULT_LIMITS;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">3D Configurator</h1>
            <p className="text-sm text-slate-400">Design your outdoor structure — real-time preview</p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Address — always first */}
        <section className="mb-8">
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-500">1. Address</h2>
          <AddressSearch onFound={onAddressFound} />
          {!locationData && (
            <p className="mt-2 text-sm text-slate-500">
              Enter an Australian address for council-specific limits and quote. You can still adjust dimensions and see the 3D preview below.
            </p>
          )}
        </section>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left column: config, map, compliance, BOM */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-8">
            {locationData && (
              <section>
                <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-500">2. Property</h2>
                <MapView
                  center={locationData.mapCenter}
                  boundary={locationData.boundaryGeoJSON}
                  className="h-56 rounded-xl overflow-hidden border border-slate-700"
                />
                <p className="mt-2 text-sm text-slate-400">{locationData.fullAddress}</p>
                <p className="text-xs text-slate-500">Council: {locationData.councilId}</p>
              </section>
            )}

            <section>
              <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-500">3. Dimensions & options</h2>
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
                <ConfigSliders
                  configuration={configuration}
                  limits={limits}
                  structureType={structureType}
                  onStructureTypeChange={setStructureType}
                  onChange={setConfiguration}
                  onValidate={runValidation}
                  validating={validating}
                />
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-500">4. Compliance</h2>
              <ValidationBadge validation={validation} />
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-500">5. BOM & quote</h2>
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
                <BOMQuote
                  validation={validation}
                  configuration={configuration}
                  structureType={structureType}
                  addressData={locationData}
                />
              </div>
            </section>
          </div>

          {/* Right column: sticky 3D */}
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="lg:sticky lg:top-24">
              <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-500">Live 3D preview</h2>
              <Structure3D
                structural={validation?.structural ?? null}
                configuration={configuration}
              />
              <p className="mt-2 text-xs text-slate-500">
                Drag to rotate · Scroll to zoom · {configuration.width} m × {configuration.depth} m × {configuration.height} m
                {configuration.attachment_type === "freestanding" && " · Freestanding"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
