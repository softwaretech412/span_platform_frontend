"use client";

interface ValidationBadgeProps {
  validation: {
    complies: boolean;
    redFlags: Array<{ message: string }>;
    structural: Record<string, unknown> | null;
    bom: unknown;
    suppliers: unknown[];
  } | null;
}

export function ValidationBadge({ validation }: ValidationBadgeProps) {
  if (!validation) {
    return (
      <div className="rounded-xl border border-slate-600 bg-slate-900/50 p-4 text-slate-500">
        <p className="text-sm">Adjust dimensions and click <strong>Validate & get quote estimate</strong> to check compliance and see BOM.</p>
      </div>
    );
  }

  if (validation.complies) {
    const labels = (validation.structural?.labels as
      | { width_m?: number; depth_m?: number; area_sqm?: number }
      | undefined);
    return (
      <div className="rounded-xl border border-emerald-600/50 bg-emerald-900/20 p-4">
        <p className="font-semibold text-emerald-400">Fully compliant</p>
        <p className="mt-1 text-sm text-emerald-300/90">Your structure meets council requirements for this address.</p>
        {labels && (
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
            <div><dt className="inline font-medium text-slate-500">Dimensions: </dt><dd className="inline">{labels.width_m} m × {labels.depth_m} m</dd></div>
            <div><dt className="inline font-medium text-slate-500">Area: </dt><dd className="inline">{labels.area_sqm} m²</dd></div>
          </dl>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-600/50 bg-red-900/20 p-4">
      <p className="font-semibold text-red-400">Compliance issues</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-300">
        {validation.redFlags.map((f, i) => (
          <li key={i}>{f.message}</li>
        ))}
      </ul>
    </div>
  );
}
