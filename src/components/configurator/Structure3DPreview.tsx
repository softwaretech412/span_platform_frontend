"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface Structural {
  beam_size?: string;
  has_mid_beam?: boolean;
  mid_beam_position_m?: number | null;
  front_posts?: number;
  rear_posts?: number;
  rafter_count?: number;
  labels?: { width_m?: number; depth_m?: number; area_sqm?: number };
}

interface Structure3DPreviewProps {
  structural?: Structural | null;
  width?: number;
  depth?: number;
  height?: number;
  attachment_type?: string;
  className?: string;
}

function buildStructuralFromConfig(
  width: number,
  depth: number,
  height: number,
  attachment: string
): Structural {
  const rearPosts = attachment === "freestanding" ? 3 : 0;
  const rafterCount = Math.min(12, Math.max(3, Math.ceil((width * 1000) / 900) + 1));
  return {
    front_posts: 3,
    rear_posts: rearPosts,
    has_mid_beam: depth > 4,
    mid_beam_position_m: depth > 4 ? 4 : null,
    rafter_count: rafterCount,
    labels: {
      width_m: width,
      depth_m: depth,
      area_sqm: Math.round(width * depth * 10) / 10,
    },
  };
}

function PergolaModel({
  structural,
  height: configHeight,
}: {
  structural: Structural;
  height?: number;
}) {
  const w = structural.labels?.width_m ?? 5;
  const d = structural.labels?.depth_m ?? 4;
  const postH = configHeight ?? 2.4;
  const scale = 0.5;
  const postW = 0.09;
  const frontPosts = structural.front_posts ?? 3;
  const rearPosts = structural.rear_posts ?? 0;
  const rafterCount = Math.min(12, structural.rafter_count ?? 6);
  const hasMidBeam = structural.has_mid_beam && (structural.mid_beam_position_m ?? 4) > 0;

  return (
    <group scale={[scale, scale, scale]}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[Math.max(w * 2, 6), Math.max(d * 2, 6)]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Front posts */}
      {[...Array(frontPosts)].map((_, i) => {
        const x = -w / 2 + (w / (frontPosts - 1 || 1)) * i;
        return (
          <mesh key={`f-${i}`} position={[x, postH / 2, -d / 2]} castShadow>
            <boxGeometry args={[postW, postH, postW]} />
            <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Rear posts (freestanding) */}
      {rearPosts > 0 &&
        [...Array(rearPosts)].map((_, i) => {
          const x = -w / 2 + (w / (rearPosts - 1 || 1)) * i;
          return (
            <mesh key={`r-${i}`} position={[x, postH / 2, d / 2]} castShadow>
              <boxGeometry args={[postW, postH, postW]} />
              <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
            </mesh>
          );
        })}

      {/* Front beam */}
      <mesh position={[0, postH, -d / 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <boxGeometry args={[w, 0.05, 0.17]} />
        <meshStandardMaterial color="#4b5563" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Rear beam */}
      <mesh position={[0, postH, d / 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <boxGeometry args={[w, 0.05, 0.17]} />
        <meshStandardMaterial color="#4b5563" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Mid beam (when depth > 4m) */}
      {hasMidBeam && (
        <mesh
          position={[0, postH, (structural.mid_beam_position_m ?? 2) - d / 2]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <boxGeometry args={[w, 0.05, 0.17]} />
          <meshStandardMaterial color="#4b5563" metalness={0.5} roughness={0.5} />
        </mesh>
      )}

      {/* Rafters (roof) */}
      {rafterCount > 0 &&
        [...Array(rafterCount)].map((_, i) => {
          const x = -w / 2 + (w / (rafterCount - 1 || 1)) * i;
          return (
            <mesh
              key={`raf-${i}`}
              position={[x, postH + 0.03, 0]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <boxGeometry args={[d, 0.04, 0.09]} />
              <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.4} />
            </mesh>
          );
        })}

      {/* Roof plane (subtle) */}
      <mesh
        position={[0, postH + 0.05, 0]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[w + 0.2, d + 0.2]} />
        <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.6} transparent opacity={0.95} />
      </mesh>
    </group>
  );
}

export function Structure3DPreview({
  structural,
  width = 5,
  depth = 4,
  height = 2.4,
  attachment_type = "attached",
  className = "",
}: Structure3DPreviewProps) {
  const effectiveStructural = structural?.labels
    ? structural
    : buildStructuralFromConfig(width, depth, height, attachment_type);

  return (
    <div
      className={`rounded-xl overflow-hidden bg-slate-900 border border-slate-700 ${className}`}
      style={{ minHeight: 280 }}
    >
      <Canvas
        camera={{ position: [7, 5, 7], fov: 45 }}
        shadows
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 12, 6]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.3} />
        <PergolaModel structural={effectiveStructural} height={height} />
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
