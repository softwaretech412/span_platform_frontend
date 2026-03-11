"use client";

import dynamic from "next/dynamic";
import type { StructuralData } from "@/app/configurator/page";

const Structure3DPreview = dynamic(
  () => import("./Structure3DPreview").then((m) => m.Structure3DPreview),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[280px] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-700 text-slate-500">
        Loading 3D…
      </div>
    ),
  }
);

interface Structure3DProps {
  structural: StructuralData | null;
  configuration: {
    width: number;
    depth: number;
    height: number;
    attachment_type?: string;
  };
}

export function Structure3D({ structural, configuration }: Structure3DProps) {
  return (
    <Structure3DPreview
      structural={structural}
      width={configuration.width}
      depth={configuration.depth}
      height={configuration.height}
      attachment_type={configuration.attachment_type ?? "attached"}
    />
  );
}
