"use client";

import type { LocationData } from "@/app/configurator/page";

interface ConfigSlidersProps {
  configuration: {
    width: number;
    depth: number;
    height: number;
    attachment_type: string;
    post_size: string;
    rear_setback_m?: number;
  };
  limits: Record<string, number>;
  onChange: (config: ConfigSlidersProps["configuration"]) => void;
  onValidate: () => void;
  validating: boolean;
}

export function ConfigSliders({ configuration, limits, onChange, onValidate, validating }: ConfigSlidersProps) {
  const minWidth = 1.8;
  const maxWidth = limits.width_limit ? Math.min(8, limits.width_limit * 2) : 8;
  const minDepth = 1.2;
  const maxDepth = 9;
  const minHeight = 2.1;
  const maxHeight = limits.height_limit ?? 3.6;
  const minSetback = limits.setback_rear ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-slate-400 mb-1">Width (m)</label>
        <input
          type="range"
          min={minWidth}
          max={maxWidth}
          step={0.1}
          value={configuration.width}
          onChange={(e) => onChange({ ...configuration, width: parseFloat(e.target.value) })}
          className="w-full"
        />
        <span className="text-sm">{configuration.width}m</span>
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">Depth (m)</label>
        <input
          type="range"
          min={minDepth}
          max={maxDepth}
          step={0.1}
          value={configuration.depth}
          onChange={(e) => onChange({ ...configuration, depth: parseFloat(e.target.value) })}
          className="w-full"
        />
        <span className="text-sm">{configuration.depth}m</span>
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">Height (m) — max {maxHeight}m</label>
        <input
          type="range"
          min={minHeight}
          max={maxHeight}
          step={0.1}
          value={configuration.height}
          onChange={(e) => onChange({ ...configuration, height: parseFloat(e.target.value) })}
          className="w-full"
        />
        <span className="text-sm">{configuration.height}m</span>
      </div>
      {minSetback > 0 && (
        <div>
          <label className="block text-sm text-slate-400 mb-1">Rear setback (m) — min {minSetback}m</label>
          <input
            type="range"
            min={minSetback}
            max={5}
            step={0.1}
            value={configuration.rear_setback_m ?? minSetback}
            onChange={(e) => onChange({ ...configuration, rear_setback_m: parseFloat(e.target.value) })}
            className="w-full"
          />
          <span className="text-sm">{configuration.rear_setback_m ?? minSetback}m</span>
        </div>
      )}
      <div>
        <label className="block text-sm text-slate-400 mb-1">Attachment</label>
        <select
          value={configuration.attachment_type}
          onChange={(e) => onChange({ ...configuration, attachment_type: e.target.value })}
          className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
        >
          <option value="attached">Wall Attached</option>
          <option value="flyover">Flyover</option>
          <option value="freestanding">Freestanding</option>
        </select>
      </div>
      <button
        onClick={onValidate}
        disabled={validating}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded text-sm font-medium"
      >
        {validating ? "Validating…" : "Validate"}
      </button>
    </div>
  );
}
