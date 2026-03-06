"use client";

import { useState, useCallback } from "react";
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

  const onAddressFound = useCallback((data: LocationData) => {
    setLocationData(data);
    if (data.limits.setback_rear) {
      setConfiguration((c) => ({ ...c, rear_setback_m: data.limits.setback_rear }));
    }
    if (data.limits.height_limit) {
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
      setValidation({ complies: false, redFlags: [{ message: "Validation failed" }], structural: null, bom: null, suppliers: [] });
    } finally {
      setValidating(false);
    }
  }, [structureType, configuration, locationData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-semibold">Span28 Configurator</h1>
        <p className="text-sm text-slate-400">Design your outdoor structure with council-specific compliance</p>
      </header>

      <main className="p-6 space-y-6">
        <section>
          <h2 className="text-lg font-medium mb-3">1. Enter your address</h2>
          <AddressSearch onFound={onAddressFound} />
        </section>

        {locationData && (
          <>
            <section>
              <h2 className="text-lg font-medium mb-3">2. Your property</h2>
              <MapView
                center={locationData.mapCenter}
                boundary={locationData.boundaryGeoJSON}
                className="h-64 rounded-lg overflow-hidden border border-slate-700"
              />
              <p className="text-sm text-slate-400 mt-2">{locationData.fullAddress}</p>
              <p className="text-sm text-slate-500">Council: {locationData.councilId}</p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3">3. Configure structure</h2>
              <ConfigSliders
                configuration={configuration}
                limits={locationData.limits}
                onChange={setConfiguration}
                onValidate={runValidation}
                validating={validating}
              />
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3">4. Compliance</h2>
              <ValidationBadge validation={validation} />
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3">5. 3D Preview</h2>
              <div className="h-80 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                <Structure3D structural={validation?.structural} configuration={configuration} />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3">6. BOM & Quote</h2>
              <BOMQuote validation={validation} configuration={configuration} structureType={structureType} addressData={locationData} />
            </section>
          </>
        )}

        {!locationData && (
          <div className="rounded-lg border border-slate-700 border-dashed p-12 text-center text-slate-500">
            Enter an Australian address above to see council-specific limits and configure your structure.
          </div>
        )}
      </main>
    </div>
  );
}
