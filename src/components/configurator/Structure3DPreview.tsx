"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface Structural {
  beam_size?: string;
  has_mid_beam?: boolean;
  front_posts?: number;
  rear_posts?: number;
  rafter_count?: number;
  labels?: { width_m?: number; depth_m?: number; area_sqm?: number };
}

interface Structure3DPreviewProps {
  structural?: Structural | null;
  className?: string;
}

function PergolaModel({ structural }: { structural: Structural }) {
  const w = structural.labels?.width_m ?? 5;
  const d = structural.labels?.depth_m ?? 4;
  const scale = 0.5;
  const postH = 2.4;
  const postW = 0.09;
  const frontPosts = structural.front_posts ?? 3;
  const rearPosts = structural.rear_posts ?? 0;

  return (
    <group scale={[scale, scale, scale]}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[w * 2, d * 2]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>

      {/* Posts */}
      {[...Array(frontPosts)].map((_, i) => {
        const x = -w / 2 + (w / (frontPosts - 1 || 1)) * i;
        return (
          <mesh key={`f-${i}`} position={[x, postH / 2, -d / 2]} castShadow>
            <boxGeometry args={[postW, postH, postW]} />
            <meshStandardMaterial color="#718096" metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}

      {rearPosts > 0 &&
        [...Array(rearPosts)].map((_, i) => {
          const x = -w / 2 + (w / (rearPosts - 1 || 1)) * i;
          return (
            <mesh key={`r-${i}`} position={[x, postH / 2, d / 2]} castShadow>
              <boxGeometry args={[postW, postH, postW]} />
              <meshStandardMaterial color="#718096" metalness={0.6} roughness={0.4} />
            </mesh>
          );
        })}

      {/* Beams */}
      <mesh position={[0, postH, -d / 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <boxGeometry args={[w, 0.05, 0.17]} />
        <meshStandardMaterial color="#4a5568" metalness={0.5} roughness={0.5} />
      </mesh>

      <mesh position={[0, postH, d / 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <boxGeometry args={[w, 0.05, 0.17]} />
        <meshStandardMaterial color="#4a5568" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Rafters */}
      {(structural.rafter_count ?? 6) > 0 &&
        [...Array(Math.min(structural.rafter_count ?? 6, 12))].map((_, i) => {
          const x = -w / 2 + (w / ((structural.rafter_count ?? 6) - 1 || 1)) * i;
          return (
            <mesh
              key={`raf-${i}`}
              position={[x, postH + 0.02, 0]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <boxGeometry args={[d, 0.04, 0.09]} />
              <meshStandardMaterial color="#718096" metalness={0.6} roughness={0.4} />
            </mesh>
          );
        })}
    </group>
  );
}

export function Structure3DPreview({ structural, className = "" }: Structure3DPreviewProps) {
  if (!structural?.labels) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded ${className}`}
        style={{ minHeight: 300 }}
      >
        <p className="text-gray-500">Configure dimensions to see 3D preview</p>
      </div>
    );
  }

  return (
    <div className={`rounded overflow-hidden bg-gray-900 ${className}`} style={{ minHeight: 300 }}>
      <Canvas camera={{ position: [8, 6, 8], fov: 45 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
        <PergolaModel structural={structural} />
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
