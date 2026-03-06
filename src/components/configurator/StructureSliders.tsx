"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Limits {
  setback_rear?: number;
  setback_side?: number;
  height_limit?: number;
  site_coverage?: number;
}

interface StructureSlidersProps {
  structureType: string;
  addressData?: {
    lat: number;
    lng: number;
    limits: Limits;
    councilId?: string;
  };
  onValidationChange?: (result: {
    complies: boolean;
    redFlags: Array<{ message: string }>;
    structural: unknown;
    bom?: { lineItems: unknown[]; totalCost: number };
    suppliers?: unknown[];
  }) => void;
}

const defaultConfig = {
  width: 5,
  depth: 4,
  height: 2.4,
  attachment_type: "attached",
  post_size: "90",
  rear_setback_m: 1.5,
};

export function StructureSliders({
  structureType,
  addressData,
  onValidationChange,
}: StructureSlidersProps) {
  const [config, setConfig] = useState(defaultConfig);
  const [validation, setValidation] = useState<{
    complies: boolean;
    redFlags: Array<{ message: string }>;
    structural: unknown;
    bom?: { lineItems: unknown[]; totalCost: number };
    suppliers?: unknown[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.validateFull({
        structure_type: structureType,
        configuration: {
          width: config.width,
          depth: config.depth,
          height: config.height,
          attachment_type: config.attachment_type,
          post_size: config.post_size,
          rear_setback_m: config.rear_setback_m,
        },
        addressData: addressData
          ? {
              lat: addressData.lat,
              lng: addressData.lng,
              limits: addressData.limits,
              councilId: addressData.councilId,
            }
          : undefined,
      });
      setValidation(res);
      onValidationChange?.(res);
    } catch {
      setValidation(null);
    } finally {
      setLoading(false);
    }
  }, [structureType, config, addressData, onValidationChange]);

  useEffect(() => {
    const t = setTimeout(validate, 300);
    return () => clearTimeout(t);
  }, [validate]);

  const limits = addressData?.limits ?? {};
  const maxHeight = limits.height_limit ?? 4;
  const minSetback = limits.setback_rear ?? 1;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Structure dimensions</h3>

      <div>
        <label className="block text-sm text-gray-600">Width (m)</label>
        <input
          type="range"
          min={1.8}
          max={8}
          step={0.1}
          value={config.width}
          onChange={(e) => setConfig((c) => ({ ...c, width: parseFloat(e.target.value) }))}
          className="w-full"
        />
        <span className="text-sm">{config.width}m</span>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Depth (m)</label>
        <input
          type="range"
          min={1.2}
          max={9}
          step={0.1}
          value={config.depth}
          onChange={(e) => setConfig((c) => ({ ...c, depth: parseFloat(e.target.value) }))}
          className="w-full"
        />
        <span className="text-sm">{config.depth}m</span>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Height (m) — max {maxHeight}m</label>
        <input
          type="range"
          min={2.1}
          max={maxHeight}
          step={0.1}
          value={config.height}
          onChange={(e) => setConfig((c) => ({ ...c, height: parseFloat(e.target.value) }))}
          className="w-full"
        />
        <span className="text-sm">{config.height}m</span>
      </div>

      {addressData && (
        <div>
          <label className="block text-sm text-gray-600">Rear setback (m) — min {minSetback}m</label>
          <input
            type="range"
            min={0}
            max={5}
            step={0.1}
            value={config.rear_setback_m}
            onChange={(e) => setConfig((c) => ({ ...c, rear_setback_m: parseFloat(e.target.value) }))}
            className="w-full"
          />
          <span className="text-sm">{config.rear_setback_m}m</span>
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-600">Attachment</label>
        <select
          value={config.attachment_type}
          onChange={(e) => setConfig((c) => ({ ...c, attachment_type: e.target.value }))}
          className="w-full border rounded px-2 py-1"
        >
          <option value="attached">Wall attached</option>
          <option value="flyover">Flyover</option>
          <option value="freestanding">Freestanding</option>
        </select>
      </div>

      {loading && <p className="text-sm text-gray-500">Validating...</p>}
      {validation && (
        <div
          className={`p-3 rounded ${
            validation.complies ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {validation.complies ? (
            <span className="font-medium">Fully complies</span>
          ) : (
            <ul className="list-disc list-inside">
              {validation.redFlags.map((f, i) => (
                <li key={i}>{f.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="pt-2">
        <p className="text-xs text-gray-500">
          Config: {config.width}m × {config.depth}m × {config.height}m
        </p>
      </div>
    </div>
  );
}
