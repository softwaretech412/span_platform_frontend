"use client";

export function Preloader() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 p-8">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
      <p className="text-sm font-medium text-slate-500">Loading dashboard...</p>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="whitespace-nowrap px-4 py-3">
          <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-slate-200" />
        </td>
      ))}
    </tr>
  );
}
