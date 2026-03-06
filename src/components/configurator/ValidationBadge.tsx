"use client";

interface ValidationBadgeProps {
  validation: {
    complies: boolean;
    redFlags: Array<{ message: string }>;
    structural: unknown;
    bom: unknown;
    suppliers: unknown[];
  } | null;
}

export function ValidationBadge({ validation }: ValidationBadgeProps) {
  if (!validation) {
    return (
      <div className="rounded-lg border border-slate-600 bg-slate-900/50 p-4 text-slate-500">
        Adjust sliders and click Validate to check compliance
      </div>
    );
  }

  if (validation.complies) {
    return (
      <div className="rounded-lg border border-green-600 bg-green-900/20 p-4 text-green-400">
        <span className="font-semibold">Fully Complies</span> — Your structure meets council requirements
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-red-600 bg-red-900/20 p-4">
      <p className="font-semibold text-red-400">Compliance issues</p>
      <ul className="mt-2 list-inside list-disc text-red-300">
        {validation.redFlags.map((f, i) => (
          <li key={i}>{f.message}</li>
        ))}
      </ul>
    </div>
  );
}
