"use client";

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
  structureType: string;
  onStructureTypeChange: (type: string) => void;
  onChange: (config: ConfigSlidersProps["configuration"]) => void;
  onValidate: () => void;
  validating: boolean;
}

const STRUCTURE_TYPES = [
  { code: "flatdek", name: "Flatdek", description: "Clean look, full-depth roof" },
  { code: "insulated", name: "Insulated", description: "Premium insulated panels" },
];

export function ConfigSliders({
  configuration,
  limits,
  structureType,
  onStructureTypeChange,
  onChange,
  onValidate,
  validating,
}: ConfigSlidersProps) {
  const minWidth = 1.8;
  const maxWidth = limits.width_limit ? Math.min(8, limits.width_limit * 2) : 8;
  const minDepth = 1.2;
  const maxDepth = 9;
  const minHeight = 2.1;
  const maxHeight = limits.height_limit ?? 3.6;
  const minSetback = limits.setback_rear ?? 0;

  return (
    <div className="space-y-6">
      {/* Structure type */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Structure type</label>
        <div className="flex gap-2">
          {STRUCTURE_TYPES.map((t) => (
            <button
              key={t.code}
              type="button"
              onClick={() => onStructureTypeChange(t.code)}
              className={`flex-1 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                structureType === t.code
                  ? "border-teal-500 bg-teal-500/20 text-teal-300"
                  : "border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:bg-slate-800"
              }`}
            >
              <span className="font-medium">{t.name}</span>
              <span className="block text-xs mt-0.5 opacity-80">{t.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Width</span>
            <span className="font-medium text-slate-200">{configuration.width} m</span>
          </label>
          <input
            type="range"
            min={minWidth}
            max={maxWidth}
            step={0.1}
            value={configuration.width}
            onChange={(e) => onChange({ ...configuration, width: parseFloat(e.target.value) })}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-teal-500"
          />
        </div>
        <div>
          <label className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Depth</span>
            <span className="font-medium text-slate-200">{configuration.depth} m</span>
          </label>
          <input
            type="range"
            min={minDepth}
            max={maxDepth}
            step={0.1}
            value={configuration.depth}
            onChange={(e) => onChange({ ...configuration, depth: parseFloat(e.target.value) })}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-teal-500"
          />
        </div>
      </div>

      <div>
        <label className="flex justify-between text-sm text-slate-400 mb-1">
          <span>Height (max {maxHeight} m)</span>
          <span className="font-medium text-slate-200">{configuration.height} m</span>
        </label>
        <input
          type="range"
          min={minHeight}
          max={maxHeight}
          step={0.1}
          value={configuration.height}
          onChange={(e) => onChange({ ...configuration, height: parseFloat(e.target.value) })}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-teal-500"
        />
      </div>

      {minSetback > 0 && (
        <div>
          <label className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Rear setback (min {minSetback} m)</span>
            <span className="font-medium text-slate-200">{configuration.rear_setback_m ?? minSetback} m</span>
          </label>
          <input
            type="range"
            min={minSetback}
            max={5}
            step={0.1}
            value={configuration.rear_setback_m ?? minSetback}
            onChange={(e) => onChange({ ...configuration, rear_setback_m: parseFloat(e.target.value) })}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-teal-500"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Attachment</label>
          <select
            value={configuration.attachment_type}
            onChange={(e) => onChange({ ...configuration, attachment_type: e.target.value })}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="attached">Wall attached</option>
            <option value="flyover">Flyover</option>
            <option value="freestanding">Freestanding</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-2">Post size</label>
          <select
            value={configuration.post_size}
            onChange={(e) => onChange({ ...configuration, post_size: e.target.value })}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="90">90 mm</option>
            <option value="150">150 mm (heavy duty)</option>
          </select>
        </div>
      </div>

      <button
        onClick={onValidate}
        disabled={validating}
        className="w-full rounded-lg bg-teal-600 px-4 py-3 font-medium text-white hover:bg-teal-500 disabled:opacity-50 transition-colors"
      >
        {validating ? "Validating…" : "Validate & get quote estimate"}
      </button>
    </div>
  );
}
