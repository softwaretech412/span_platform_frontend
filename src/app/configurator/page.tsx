"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ── Config types & defaults ───────────────────────────────────────────────────
interface Config {
  width: number; depth: number; height: number;
  roofStyle: string; frameColor: string; roofColor: string; material: string;
}

const DEFAULTS: Config = {
  width: 5, depth: 4, height: 2.7,
  roofStyle: "flat", frameColor: "#475569", roofColor: "#94A3B8", material: "steel",
};

const COMPLIANCE = { maxWidth: 8, maxDepth: 7, maxHeight: 3.6, maxCoverage: 0.5, lotSize: 612 };

const ROOF_STYLES = [
  { id: "flat",     label: "Flat" },
  { id: "gable",    label: "Gable" },
  { id: "skillion", label: "Skillion" },
];

const MATERIALS = [
  { id: "steel",     label: "Steel frame",   badge: "Most popular" },
  { id: "aluminium", label: "Aluminium",     badge: "Lightweight" },
  { id: "timber",    label: "Timber",        badge: "Natural look" },
];

const FRAME_COLORS = [
  { id: "slate",    hex: "#475569", label: "Slate" },
  { id: "navy",     hex: "#1E3A5F", label: "Navy" },
  { id: "charcoal", hex: "#1E293B", label: "Charcoal" },
  { id: "white",    hex: "#F1F5F9", label: "Arctic white" },
];

const ROOF_COLORS = [
  { id: "steel",    hex: "#94A3B8", label: "Colorbond® Steel" },
  { id: "ironstone",hex: "#334155", label: "Ironstone" },
  { id: "surfmist", hex: "#CBD5E1", label: "Surfmist" },
  { id: "paperbark",hex: "#C8B99A", label: "Paperbark" },
];

// ── Pricing ───────────────────────────────────────────────────────────────────
function calculatePrice(config: Config) {
  const area     = config.width * config.depth;
  const baseRate = config.material === "timber" ? 380 : config.material === "aluminium" ? 420 : 350;
  const roofMult = config.roofStyle === "gable" ? 1.18 : config.roofStyle === "skillion" ? 1.08 : 1;
  const kit      = Math.round(area * baseRate * roofMult / 10) * 10;
  const install  = Math.round(kit * 0.65 / 10) * 10;
  return { kit, fullBuild: kit + install, area };
}

// ── Three.js scene ────────────────────────────────────────────────────────────
function useThreeScene(canvasRef: React.RefObject<HTMLCanvasElement | null>, config: Config) {
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rafRef      = useRef<number | null>(null);

  // Build once
  const buildScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || rendererRef.current) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0A0F1E");
    scene.fog = new THREE.FogExp2(0x0A0F1E, 0.022);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(9, 6, 10);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.06;
    controls.maxPolarAngle  = Math.PI / 2.05;
    controls.minDistance    = 4;
    controls.maxDistance    = 24;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // Lights — blue-tinted for navy theme
    scene.add(new THREE.AmbientLight(0xCDD9F0, 0.6));
    const sun = new THREE.DirectionalLight(0xE8F0FF, 2.0);
    sun.position.set(10, 14, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { near:0.1, far:50, left:-12, right:12, top:12, bottom:-12 });
    sun.shadow.bias = -0.001;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x90B4E8, 0.45);
    fill.position.set(-6, 5, -4);
    scene.add(fill);
    scene.add(new THREE.HemisphereLight(0x4A6FA5, 0x1E293B, 0.4));

    // Ground — dark concrete
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshLambertMaterial({ color: 0x0F172A })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid — subtle blue lines
    const grid = new THREE.GridHelper(40, 40, 0x1E3A5F, 0x1E293B);
    (grid.material as THREE.Material).opacity = 0.6;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!canvas) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [canvasRef]);

  // Rebuild structure whenever config changes
  const updateStructure = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old structure
    const toRemove: THREE.Object3D[] = [];
    scene.children.forEach(c => { if (c.userData.isStructure) toRemove.push(c); });
    toRemove.forEach(c => scene.remove(c));

    const group = new THREE.Group();
    group.userData.isStructure = true;

    const w = config.width;
    const d = config.depth;
    const h = config.height;
    const postR = 0.055;

    const frameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.frameColor),
      roughness: 0.45,
      metalness: config.material === "steel" ? 0.65 : config.material === "aluminium" ? 0.55 : 0.05,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.roofColor),
      roughness: 0.4,
      metalness: 0.35,
    });

    // Posts
    const postPos: [number, number, number][] = [
      [-w/2, 0, -d/2], [w/2, 0, -d/2], [w/2, 0, d/2], [-w/2, 0, d/2],
    ];
    if (w > 4) postPos.push([0, 0, -d/2], [0, 0, d/2]);
    postPos.forEach(([x, , z]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(postR, postR, h, 8), frameMat);
      post.position.set(x, h / 2, z);
      post.castShadow = true;
      group.add(post);
    });

    // Perimeter beams
    [
      { pos: [0, h, -d/2] as [number,number,number], len: w + 0.1, axis: "x" as const },
      { pos: [0, h,  d/2] as [number,number,number], len: w + 0.1, axis: "x" as const },
      { pos: [-w/2, h, 0] as [number,number,number], len: d + 0.1, axis: "z" as const },
      { pos: [ w/2, h, 0] as [number,number,number], len: d + 0.1, axis: "z" as const },
    ].forEach(({ pos, len, axis }) => {
      const geo = axis === "x"
        ? new THREE.BoxGeometry(len, 0.09, 0.09)
        : new THREE.BoxGeometry(0.09, 0.09, len);
      const beam = new THREE.Mesh(geo, frameMat);
      beam.position.set(...pos);
      beam.castShadow = true;
      group.add(beam);
    });

    // Rafters
    const rafterCount = Math.max(3, Math.ceil(w / 0.75));
    for (let i = 0; i <= rafterCount; i++) {
      const x = -w / 2 + (w / rafterCount) * i;
      const rafter = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, d + 0.1), frameMat);
      rafter.position.set(x, h + 0.045, 0);
      rafter.castShadow = true;
      group.add(rafter);
    }

    // Roof panels
    if (config.roofStyle === "flat") {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.045, d + 0.12), roofMat);
      roof.position.set(0, h + 0.1, 0);
      roof.castShadow = true; roof.receiveShadow = true;
      group.add(roof);
    } else if (config.roofStyle === "gable") {
      const ridgeH = 0.65;
      const panelDepth = Math.sqrt((d / 2) ** 2 + ridgeH ** 2) + 0.06;
      const angle = Math.atan2(ridgeH, d / 2);
      [-1, 1].forEach(side => {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.045, panelDepth), roofMat);
        panel.rotation.x = -angle * side;
        panel.position.set(0, h + 0.13 + ridgeH / 2, side * (d / 4 - 0.06));
        panel.castShadow = true;
        group.add(panel);
      });
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.075, 0.075), frameMat);
      ridge.position.set(0, h + ridgeH + 0.13, 0);
      group.add(ridge);
    } else if (config.roofStyle === "skillion") {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.045, d + 0.12), roofMat);
      roof.rotation.x = 0.13;
      roof.position.set(0, h + 0.1, 0);
      roof.castShadow = true;
      group.add(roof);
    }

    // Footings
    postPos.forEach(([x, , z]) => {
      const f = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.20, 0.14, 8),
        new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.9 })
      );
      f.position.set(x, 0.07, z);
      group.add(f);
    });

    scene.add(group);
  }, [config]);

  useEffect(() => { return buildScene() ?? undefined; }, [buildScene]);
  useEffect(() => { updateStructure(); }, [updateStructure]);
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ConfigurePage() {
  const router    = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig]         = useState<Config>(DEFAULTS);
  const [activePanel, setActivePanel] = useState("dimensions");
  const [pricing, setPricing]       = useState(() => calculatePrice(DEFAULTS));
  const [violations, setViolations] = useState<string[]>([]);
  const [mobileTab, setMobileTab]   = useState("view");

  useThreeScene(canvasRef, config);

  const update = useCallback((key: keyof Config, value: string | number) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value };
      const v: string[] = [];
      if (next.width  > COMPLIANCE.maxWidth)   v.push(`Width exceeds max ${COMPLIANCE.maxWidth}m for this zone`);
      if (next.depth  > COMPLIANCE.maxDepth)   v.push(`Depth exceeds max ${COMPLIANCE.maxDepth}m`);
      if (next.height > COMPLIANCE.maxHeight)  v.push(`Height exceeds max ${COMPLIANCE.maxHeight}m`);
      const cov = (next.width * next.depth) / COMPLIANCE.lotSize;
      if (cov > COMPLIANCE.maxCoverage) v.push(`Site coverage ${(cov*100).toFixed(1)}% exceeds 50% limit`);
      setViolations(v);
      setPricing(calculatePrice(next));
      return next;
    });
  }, []);

  const coveragePct = ((config.width * config.depth) / COMPLIANCE.lotSize * 100).toFixed(1);
  const coverageNum = (config.width * config.depth) / COMPLIANCE.lotSize;

  return (
    <div className="h-screen flex flex-col bg-[#060C1A] text-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap');
        body{font-family:'Inter',sans-serif}
        .font-display{font-family:'Sora',sans-serif}
        input[type='range']{-webkit-appearance:none;width:100%;height:5px;border-radius:9999px;background:rgba(255,255,255,.1);outline:none;cursor:pointer}
        input[type='range']::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,.3);cursor:pointer;transition:transform 0.15s ease}
        input[type='range']::-webkit-slider-thumb:hover{transform:scale(1.2)}
        .panel-scroll::-webkit-scrollbar{width:3px}
        .panel-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}
        @keyframes pulseBadge{0%,100%{opacity:1}50%{opacity:0.5}}
        .pulse-badge{animation:pulseBadge 1.8s ease infinite}
        .color-swatch{transition:transform 0.15s ease}
        .color-swatch:hover{transform:scale(1.1)}
        .color-swatch.selected{box-shadow:0 0 0 2.5px #0F172A,0 0 0 5px #3B82F6}
        .canvas-wrap canvas{display:block;width:100%!important;height:100%!important}
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <header className="bg-[#0A0F1E]/95 backdrop-blur-md border-b border-white/8 flex-shrink-0 z-30">
        <div className="px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 20 20" fill="white" className="w-3.5 h-3.5"><path d="M3 10l7-7 7 7v8H13v-5H7v5H3z"/></svg>
              </div>
              <span className="font-display font-bold text-white text-base">Span<span className="text-blue-400">28</span></span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              {["Address","Compliance","Design","Checkout"].map((s,i)=>(
                <span key={s} className="flex items-center gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 font-semibold ${i<=2?"bg-blue-500 text-white":"bg-white/8 text-slate-500"}`}>{s}</span>
                  {i<3&&<svg className="w-3 h-3 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {violations.length > 0 ? (
              <span className="pulse-badge hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-full px-3 py-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd"/></svg>
                {violations.length} violation{violations.length>1?"s":""}
              </span>
            ) : (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>Compliant
              </span>
            )}
            <button onClick={()=>router.push("/checkout")} disabled={violations.length>0}
              className="bg-gradient-to-r from-blue-500 to-blue-600 disabled:opacity-30 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/25">
              Continue to checkout
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile tab switcher */}
      <div className="lg:hidden flex bg-[#0A0F1E] border-b border-white/8 flex-shrink-0">
        {["view","edit"].map(tab=>(
          <button key={tab} onClick={()=>setMobileTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${mobileTab===tab?"text-blue-400 border-b-2 border-blue-400":"text-slate-500"}`}>
            {tab==="view"?"3D Preview":"Edit design"}
          </button>
        ))}
      </div>

      {/* ── MAIN LAYOUT ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* 3D Canvas */}
        <div className={`canvas-wrap relative flex-1 ${mobileTab==="edit"?"hidden lg:block":"block"}`}>
          <canvas ref={canvasRef} className="w-full h-full" />

          {/* Size overlay — top left */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="bg-[#0A0F1E]/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500 mb-0.5">Structure size</p>
              <p className="font-display text-base font-bold text-white">{config.width}m × {config.depth}m × {config.height}m</p>
            </div>
            <div className={`bg-[#0A0F1E]/90 backdrop-blur-md border rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs ${violations.length>0?"border-red-500/30":"border-emerald-500/25"}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${violations.length>0?"bg-red-400":"bg-emerald-400"}`}/>
              <span className={violations.length>0?"text-red-300":"text-emerald-300"}>
                {violations.length>0?violations[0]:"All council rules met"}
              </span>
            </div>
          </div>

          {/* Live price badge — top right */}
          <div className="absolute top-4 right-4 bg-[#0A0F1E]/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-right">
            <p className="text-xs text-slate-500 mb-0.5">Full build from</p>
            <p className="font-display text-xl font-bold text-blue-400">${pricing.fullBuild.toLocaleString()}</p>
          </div>

          {/* Orbit hint */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-[#0A0F1E]/75 backdrop-blur-sm border border-white/8 rounded-full px-5 py-2 text-xs text-slate-500 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"/></svg>
              Drag to orbit · Scroll to zoom
            </div>
          </div>
        </div>

        {/* ── SIDE PANEL ──────────────────────────────────────────────────── */}
        <div className={`w-full lg:w-80 xl:w-[340px] bg-[#0A0F1E] border-l border-white/8 flex flex-col flex-shrink-0 ${mobileTab==="view"?"hidden lg:flex":"flex"}`}>

          {/* Panel tabs */}
          <div className="flex border-b border-white/8 flex-shrink-0">
            {[
              { id:"dimensions", label:"Dimensions" },
              { id:"roof",       label:"Roof" },
              { id:"materials",  label:"Materials" },
            ].map(p=>(
              <button key={p.id} onClick={()=>setActivePanel(p.id)}
                className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  activePanel===p.id
                    ?"text-blue-400 border-b-2 border-blue-400 -mb-px bg-blue-500/5"
                    :"text-slate-500 hover:text-slate-300"
                }`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto panel-scroll">

            {/* DIMENSIONS */}
            {activePanel === "dimensions" && (
              <div className="p-5 space-y-6">
                {([
                  { key:"width",  label:"Width",       unit:"m", min:2, max:COMPLIANCE.maxWidth,  step:0.5 },
                  { key:"depth",  label:"Depth",       unit:"m", min:2, max:COMPLIANCE.maxDepth,  step:0.5 },
                  { key:"height", label:"Post height", unit:"m", min:2, max:COMPLIANCE.maxHeight, step:0.1 },
                ] as const).map(({ key, label, unit, min, max, step }) => {
                  const val = config[key] as number;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-white">{label}</label>
                        <div className="flex items-center gap-1.5 bg-white/6 border border-white/10 rounded-lg px-3 py-1">
                          <span className="font-display text-base font-bold text-white">{val}</span>
                          <span className="text-xs text-slate-500">{unit}</span>
                        </div>
                      </div>
                      <input type="range" min={min} max={max} step={step} value={val}
                        onChange={(e:React.ChangeEvent<HTMLInputElement>)=>update(key, parseFloat(e.target.value))}
                      />
                      <div className="flex justify-between text-xs text-slate-600 mt-1.5">
                        <span>{min}{unit}</span>
                        <span className="text-blue-500">Max {max}{unit}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Coverage bar */}
                <div className="bg-white/4 border border-white/8 rounded-xl p-4">
                  <div className="flex justify-between text-xs mb-2.5">
                    <span className="text-slate-400 font-semibold">Site coverage</span>
                    <span className={`font-bold ${coverageNum > 0.45 ? "text-amber-400" : "text-emerald-400"}`}>
                      {coveragePct}% of 50% max
                    </span>
                  </div>
                  <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      coverageNum > 0.5 ? "bg-red-500" : coverageNum > 0.45 ? "bg-amber-400" : "bg-emerald-400"
                    }`} style={{ width:`${Math.min(coverageNum/0.5*100,100)}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* ROOF */}
            {activePanel === "roof" && (
              <div className="p-5 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Roof style</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {ROOF_STYLES.map(r=>(
                      <button key={r.id} onClick={()=>update("roofStyle",r.id)}
                        className={`border rounded-xl p-3 text-center transition-all ${
                          config.roofStyle===r.id
                            ?"border-blue-500 bg-blue-500/10"
                            :"border-white/8 bg-white/3 hover:border-white/20"
                        }`}>
                        <div className="flex justify-center mb-2">
                          {r.id==="flat" && <svg viewBox="0 0 40 28" className="w-8 h-6">
                            <rect x="2" y="14" width="36" height="3" fill="#3B82F6" rx="1"/>
                            <rect x="2" y="17" width="4" height="9" fill="#475569"/>
                            <rect x="34" y="17" width="4" height="9" fill="#475569"/>
                          </svg>}
                          {r.id==="gable" && <svg viewBox="0 0 40 28" className="w-8 h-6">
                            <polygon points="20,2 36,14 4,14" fill="#3B82F6" opacity="0.8"/>
                            <rect x="4" y="14" width="4" height="12" fill="#475569"/>
                            <rect x="32" y="14" width="4" height="12" fill="#475569"/>
                          </svg>}
                          {r.id==="skillion" && <svg viewBox="0 0 40 28" className="w-8 h-6">
                            <polygon points="4,8 36,14 36,17 4,17" fill="#3B82F6" opacity="0.8"/>
                            <rect x="4" y="17" width="4" height="9" fill="#475569"/>
                            <rect x="32" y="17" width="4" height="9" fill="#475569"/>
                          </svg>}
                        </div>
                        <p className={`text-xs font-semibold ${config.roofStyle===r.id?"text-blue-400":"text-slate-400"}`}>{r.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Roof colour</p>
                  <div className="grid grid-cols-4 gap-3">
                    {ROOF_COLORS.map(c=>(
                      <div key={c.id} className="text-center">
                        <button onClick={()=>update("roofColor",c.hex)}
                          className={`color-swatch w-10 h-10 rounded-full mx-auto block border border-white/12 ${config.roofColor===c.hex?"selected":""}`}
                          style={{backgroundColor:c.hex}} title={c.label}/>
                        <p className="text-xs text-slate-500 mt-1.5 leading-tight">{c.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MATERIALS */}
            {activePanel === "materials" && (
              <div className="p-5 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Frame material</p>
                  <div className="space-y-2">
                    {MATERIALS.map(m=>(
                      <button key={m.id} onClick={()=>update("material",m.id)}
                        className={`w-full flex items-center justify-between border rounded-xl px-4 py-3.5 transition-all ${
                          config.material===m.id
                            ?"border-blue-500 bg-blue-500/10"
                            :"border-white/8 bg-white/3 hover:border-white/20"
                        }`}>
                        <span className={`text-sm font-semibold ${config.material===m.id?"text-blue-400":"text-white"}`}>{m.label}</span>
                        <span className={`text-xs rounded-full px-2.5 py-0.5 border ${
                          config.material===m.id
                            ?"bg-blue-500/15 text-blue-400 border-blue-500/25"
                            :"bg-white/5 text-slate-500 border-white/8"
                        }`}>{m.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Frame colour</p>
                  <div className="grid grid-cols-4 gap-3">
                    {FRAME_COLORS.map(c=>(
                      <div key={c.id} className="text-center">
                        <button onClick={()=>update("frameColor",c.hex)}
                          className={`color-swatch w-10 h-10 rounded-full mx-auto block border border-white/12 ${config.frameColor===c.hex?"selected":""}`}
                          style={{backgroundColor:c.hex}} title={c.label}/>
                        <p className="text-xs text-slate-500 mt-1.5 leading-tight">{c.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── PRICING FOOTER ───────────────────────────────────────────── */}
          <div className="border-t border-white/8 p-5 flex-shrink-0 bg-[#060C1A]">
            {violations.length > 0 && (
              <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 mb-4 space-y-1.5">
                {violations.map((v,i)=>(
                  <p key={i} className="text-xs text-red-400 flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd"/></svg>
                    {v}
                  </p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/4 border border-white/8 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-0.5">Kit only</p>
                <p className="font-display text-lg font-bold text-white">${pricing.kit.toLocaleString()}</p>
              </div>
              <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-3">
                <p className="text-xs text-blue-400 mb-0.5">Full build</p>
                <p className="font-display text-lg font-bold text-blue-400">${pricing.fullBuild.toLocaleString()}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              {pricing.area.toFixed(1)} m² · {config.roofStyle} roof · {config.material} frame · inc. GST
            </p>

            <button onClick={()=>router.push("/checkout")} disabled={violations.length>0}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 disabled:opacity-30 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3.5 rounded-full text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20">
              Continue to checkout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}