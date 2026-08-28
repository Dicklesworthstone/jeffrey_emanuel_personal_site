"use client";

import { useState, useEffect, useRef, useMemo, type ComponentRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minimize2, RotateCcw, Layers, Microscope, LayoutTemplate, Rotate3d, Move3d
} from "lucide-react";
import { useFrame } from "@react-three/fiber";
// Visibility-gated Canvas: pauses each scene's render loop while offscreen
import Canvas from "@/components/gated-canvas";
import {
  Float, PerspectiveCamera, Stars, MeshTransmissionMaterial,
  CameraControls, Environment, Lightformer, Grid
} from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useDeviceCapabilities } from "@/hooks/use-mobile-optimizations";
import { cn } from "@/lib/utils";
import { OverpromptingMathTooltip } from "./overprompting-math-tooltip";

// ============================================================
// SHARED UTILS & SHADERS
// ============================================================

/** True on touch-first devices, where a one-finger drag must keep scrolling the page. */
function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return coarse;
}

/**
 * Device tiering for the heavy scenes: post-processing, transmission samples,
 * shadows and star counts all step down below the "high" tier; reduced motion
 * freezes every time-based animation and switches the loop to on-demand frames.
 */
function useSceneQuality() {
  const { capabilities, quality } = useDeviceCapabilities();
  return {
    high: quality.enablePostProcessing,
    shadows: quality.enableShadows,
    maxDpr: quality.maxDpr,
    particles: quality.particleMultiplier,
    frozen: capabilities.prefersReducedMotion,
  };
}

function RotateToggle({ on, onToggle, className }: { on: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-2 min-h-10 px-3 rounded-full border text-xs font-black uppercase tracking-widest backdrop-blur-md transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
        on ? "bg-amber-500 text-black border-amber-400" : "bg-black/60 text-slate-200 border-white/20 hover:bg-black/80",
        className
      )}
    >
      <Rotate3d className="w-3.5 h-3.5" aria-hidden="true" />
      {on ? "Rotate: on" : "Rotate"}
    </button>
  );
}

/**
 * Local studio lighting rendered once into a small environment map. Replaces
 * `<Environment preset="city" />`, which fetched an HDR from a third-party CDN
 * at runtime and left the scene black until the download finished.
 */
function StudioEnvironment() {
  return (
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={2} color="#fff7ed" position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
      <Lightformer form="rect" intensity={1.4} color="#f59e0b" position={[-6, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 3, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#f43f5e" position={[6, -1, -2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 3, 1]} />
      <Lightformer form="rect" intensity={0.8} color="#e2e8f0" position={[0, 0, -8]} scale={[8, 8, 1]} />
    </Environment>
  );
}

/** Shakes a wrapper group instead of fighting the camera controls for `camera.position`. */
function ShakeGroup({ active, frozen, children }: { active: boolean; frozen: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (frozen) {
      ref.current.position.x = 0;
      return;
    }
    ref.current.position.x = active
      ? Math.sin(clock.elapsedTime * 50) * 0.05
      : THREE.MathUtils.lerp(ref.current.position.x, 0, 0.1);
  });
  return <group ref={ref}>{children}</group>;
}

const GLITCH_SHADER = {
  vertex: `
    uniform float uTime;
    uniform float uDistortion;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPos;
    
    // Simplex noise (simplified)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
      vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
      i = mod289(i);
      vec4 p = permute( permute( permute( 
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857; // 1.0/7.0
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      vNormal = normal;
      vPos = position;
      
      vec3 pos = position;
      // Glitch displacement based on distortion param
      float noise = snoise(vec3(pos.x * 2.0, pos.y * 2.0, uTime * 2.0));
      pos += normal * noise * uDistortion;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragment: `
    uniform float uTime;
    uniform float uDistortion;
    uniform float uOpacity;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPos;

    void main() {
      // Interference pattern
      float scanline = sin(vPos.y * 50.0 + uTime * 10.0) * 0.1;
      float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
      
      vec3 color = uColor;
      
      // Add "heat" based on distortion
      if (uDistortion > 0.5) {
        color = mix(color, vec3(1.0, 0.2, 0.5), (uDistortion - 0.5) * 2.0);
        // Add static
        if (noise > 0.8) color += vec3(0.2);
      }
      
      // Wireframe-ish effect
      float edge = smoothstep(0.4, 0.5, abs(fract(vPos.y * 5.0) - 0.5));
      color += edge * 0.2 * uColor;

      gl_FragColor = vec4(color, uOpacity);
    }
  `
};

// ============================================================
// 1. MANIFOLD SLICER (Constraint Paradox)
// ============================================================

const SLICE_LABELS = [
  "LIKENESS_LOCK", "POSE_RIGIDITY", "CLOTHING_MATCH",
  "BEARD_LOGIC", "LIGHTING_FIX", "BG_STRICT"
];

const MAX_SLICES = SLICE_LABELS.length;
// Each cut keeps 40% of the remaining volume (illustrative).
const VOLUME_KEPT_PER_CUT = 0.4;

function ManifoldMesh({ level, frozen, high, shadows }: { level: number; frozen: boolean; high: boolean; shadows: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<ComponentRef<typeof MeshTransmissionMaterial>>(null);

  // Define clipping planes (the material holds the same array; the frame loop mutates it through the ref)
  const planes = useMemo(() => {
    return [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), 1.2),  // Right crop
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1.2), // Left crop
      new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.2),  // Top crop
      new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.2), // Bottom crop
      new THREE.Plane(new THREE.Vector3(0, 0, 1), 1.2),  // Front crop
      new THREE.Plane(new THREE.Vector3(1, 1, 1).normalize(), 1.2), // Diagonal crop
    ];
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    const t = frozen ? 0 : state.clock.getElapsedTime();

    // Rotate the manifold
    meshRef.current.rotation.x = t * 0.1;
    meshRef.current.rotation.y = t * 0.15;

    // Animate planes based on level
    const livePlanes = materialRef.current.clippingPlanes;
    if (!livePlanes) return;
    for (let i = 0; i < livePlanes.length; i++) {
      const plane = livePlanes[i];
      const isActive = i < level;
      const targetDist = isActive ? 0.4 + Math.sin(t + i) * 0.05 : 3.0;
      // Reduced motion: jump straight to the target instead of easing over frames.
      plane.constant = frozen ? targetDist : plane.constant + (targetDist - plane.constant) * 0.1;
    }
  });

  return (
    <group>
      {/* The Creative Manifold */}
      <mesh ref={meshRef} castShadow={shadows} receiveShadow={shadows}>
        <icosahedronGeometry args={[1.5, 8]} />
        <MeshTransmissionMaterial
          ref={materialRef}
          backside={high}
          samples={high ? 4 : 1}
          resolution={high ? 512 : 256}
          thickness={0.5}
          roughness={0.2}
          anisotropy={0.3}
          chromaticAberration={0.1}
          color="#f59e0b"
          clippingPlanes={planes}
          clipIntersection={false}
        />
      </mesh>

      {/* Visualizing the Slicers (Laser Planes) */}
      {planes.map((plane, i) => (
        <PlaneVisualizer key={i} plane={plane} isActive={i < level} />
      ))}
    </group>
  );
}

// Hoisted: one shared edge geometry for every laser plane, and scratch vectors for the frame loop.
let planeEdgesGeometry: THREE.EdgesGeometry | null = null;
function getPlaneEdges() {
  if (!planeEdgesGeometry) planeEdgesGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(4, 4));
  return planeEdgesGeometry;
}
const _planePos = new THREE.Vector3();
const _planeLook = new THREE.Vector3();

function PlaneVisualizer({ plane, isActive }: { plane: THREE.Plane; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    _planePos.copy(plane.normal).multiplyScalar(-plane.constant);
    meshRef.current.position.copy(_planePos);
    _planeLook.copy(_planePos).add(plane.normal);
    meshRef.current.lookAt(_planeLook);
  });

  return (
    <mesh ref={meshRef} visible={true}>
      <planeGeometry args={[4, 4]} />
      {/* Emissive material for Bloom effect */}
      <meshBasicMaterial
        color="#f43f5e"
        transparent
        opacity={isActive ? 0.15 : 0}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
      {isActive && (
        <lineSegments geometry={getPlaneEdges()}>
          <lineBasicMaterial color="#f43f5e" opacity={0.8} transparent toneMapped={false} />
        </lineSegments>
      )}
    </mesh>
  );
}

function ActiveCutsList({ level }: { level: number }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">Active Cuts</div>
      <AnimatePresence>
        {level === 0 ? (
          <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-500 italic text-xs">&gt; Unconstrained...</motion.div>
        ) : (
          SLICE_LABELS.slice(0, level).map((label) => (
            <motion.div
              key={label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-2 text-xs font-mono text-rose-400"
            >
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-sm shadow-[0_0_8px_rgba(244,63,94,0.8)]" aria-hidden="true" />
              {label}
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}

export function ConstraintViz() {
  const [level, setLevel] = useState(0);
  const { high, shadows, maxDpr, particles, frozen } = useSceneQuality();
  const coarse = useCoarsePointer();
  const [rotateOn, setRotateOn] = useState(false);
  const rotateAllowed = !coarse || rotateOn;

  // One decimal so the fifth and sixth cuts read as different numbers (1.0% vs 0.4%).
  const remaining = 100 * Math.pow(VOLUME_KEPT_PER_CUT, level);
  const remainingLabel = remaining.toFixed(1);
  const barWidth = Math.max(1.5, remaining);

  return (
    <div className="relative overflow-hidden group">
      <div className="op-viz-header">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight m-0 flex items-center gap-2">
              <Minimize2 className="w-5 h-5 text-amber-400" aria-hidden="true" />
              The Manifold Slicer
            </h3>
            <p className="text-sm text-slate-400 m-0 mt-1">
              Constraints act as <OverpromptingMathTooltip mathKey="constraint-hyperplane">hyperplanes</OverpromptingMathTooltip>, slicing away valid creative solutions.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-8">
        <div className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-2xl bg-[#050508] border border-white/5 overflow-hidden shadow-2xl">
          <div className="absolute inset-0" aria-hidden="true">
            <Canvas
              shadows={shadows}
              gl={{ localClippingEnabled: true }}
              camera={{ position: [0, 0, 5], fov: 45 }}
              dpr={[1, maxDpr]}
              frameloop={frozen ? "demand" : undefined}
            >
              <color attach="background" args={['#050508']} />
              <Stars radius={100} depth={50} count={Math.max(300, Math.round(2000 * particles))} factor={4} saturation={0} fade speed={frozen ? 0 : 1} />
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow={shadows} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f43f5e" />
              <StudioEnvironment />

              <ShakeGroup active={level >= 5} frozen={frozen}>
                <Float speed={frozen ? 0 : 2} rotationIntensity={0.2} floatIntensity={0.5}>
                  <ManifoldMesh level={level} frozen={frozen} high={high} shadows={shadows} />
                </Float>
              </ShakeGroup>

              {high && (
                <EffectComposer enableNormalPass={false}>
                  <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.6} />
                  <Noise opacity={0.05} />
                  <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
              )}

              <CameraControls minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} enabled={rotateAllowed} />
            </Canvas>
          </div>

          {/* HUD Overlay (desktop only; on phones the same readouts sit below the canvas) */}
          <div className="absolute inset-0 pointer-events-none p-4 md:p-6 hidden md:flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="h-px w-8 md:w-12 bg-amber-500/50" />
                <span className="text-xs font-mono text-amber-500/60 uppercase tracking-tighter">Hyperplane Analysis</span>
              </div>
              {!coarse && (
                <div className="flex items-center gap-1.5 text-white/60">
                  <Move3d className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="text-xs uppercase tracking-widest">Drag to orbit</span>
                </div>
              )}
            </div>
            <ActiveCutsList level={level} />
          </div>

          {coarse && (
            <RotateToggle on={rotateOn} onToggle={() => setRotateOn((v) => !v)} className="absolute top-3 right-3 z-10" />
          )}
        </div>

        {/* Mobile readouts: outside the canvas so they never bury the manifold */}
        <div className="md:hidden mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
          <ActiveCutsList level={level} />
        </div>

        {/* Controls */}
        <div className="mt-6 p-1 bg-white/5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-6 pr-2 pl-6 py-2">
          <div className="w-full flex items-center gap-4 py-2 md:py-0">
            <span className="text-xs font-mono text-slate-400 shrink-0 uppercase tracking-wider">
              <OverpromptingMathTooltip mathKey="search-volume">Solution Space</OverpromptingMathTooltip>
            </span>
            <div className="h-1.5 flex-grow rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                animate={{ width: `${barWidth}%` }}
              />
            </div>
            <span className="text-sm font-mono font-bold text-amber-400 tabular-nums shrink-0" aria-live="polite">
              {remainingLabel}%
            </span>
          </div>
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setLevel(l => Math.min(l + 1, MAX_SLICES))}
            disabled={level >= MAX_SLICES}
            className="op-btn-action min-h-11 flex items-center justify-center gap-2 px-6 flex-grow md:flex-grow-0"
            >
              <Minimize2 className="w-3 h-3" aria-hidden="true" /> SLICE
            </button>
          <button
            type="button"
            onClick={() => setLevel(0)}
            disabled={level === 0}
            className="op-btn-secondary min-h-11 w-12 flex items-center justify-center flex-grow md:flex-grow-0"
              aria-label="Reset"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3 mb-0">
          Illustrative: each cut keeps 40% of the remaining volume. The percentage is a metaphor for how quickly stacked constraints empty the space, not a measurement.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// 2. HOLOGRAPHIC TUNER (Quality Curve)
// ============================================================

// Hoisted colour presets: no per-frame allocations.
const HOLO_AMBER = new THREE.Color("#f59e0b");
const HOLO_EMERALD = new THREE.Color("#10b981");
const HOLO_ROSE = new THREE.Color("#f43f5e");

function HologramMesh({ specificity, frozen }: { specificity: number; frozen: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDistortion: { value: 0 },
      uOpacity: { value: 0.5 },
      uColor: { value: new THREE.Color("#f59e0b") },
    }),
    []
  );

  useFrame((state) => {
    if (!shaderRef.current || !meshRef.current) return;
    const t = frozen ? 0 : state.clock.elapsedTime;

    meshRef.current.rotation.y = t * 0.2;
    shaderRef.current.uniforms.uTime.value = t;

    let distortion = 0;
    let opacity = 0.3;
    let color = HOLO_AMBER;
    let shake = 0;

    if (specificity < 0.3) {
      // Vague State
      distortion = (0.3 - specificity) * 2.0;
      opacity = 0.2 + specificity;
    } else if (specificity < 0.65) {
      // Sweet Spot
      distortion = 0;
      opacity = 0.9;
      color = HOLO_EMERALD;
    } else {
      // Overprompted
      const intensity = (specificity - 0.65) / 0.35;
      distortion = intensity * 1.5; // High distortion
      opacity = 0.8;
      color = HOLO_ROSE;
      shake = frozen ? 0 : Math.sin(t * 50) * 0.02 * intensity;
    }
    meshRef.current.position.x = shake;

    const u = shaderRef.current.uniforms;
    if (frozen) {
      // Reduced motion: no easing across frames, just the resting state for this slider value.
      u.uDistortion.value = distortion;
      u.uOpacity.value = opacity;
      u.uColor.value.copy(color);
      return;
    }
    u.uDistortion.value = THREE.MathUtils.lerp(u.uDistortion.value, distortion, 0.1);
    u.uOpacity.value = THREE.MathUtils.lerp(u.uOpacity.value, opacity, 0.1);
    u.uColor.value.lerp(color, 0.1);
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={GLITCH_SHADER.vertex}
        fragmentShader={GLITCH_SHADER.fragment}
        transparent
        side={THREE.DoubleSide}
        uniforms={uniforms}
        toneMapped={false} // Important for bloom
      />
    </mesh>
  );
}

const ZONE_LABELS = {
  vague: { text: "UNDERSPECIFIED", color: "text-amber-400", desc: "Model hallucinates to fill gaps." },
  sweet: { text: "RESONANT", color: "text-emerald-400", desc: "Perfect signal-to-noise ratio." },
  over: { text: "OVERCONSTRAINED", color: "text-rose-400", desc: "Conflicting constraints cause failure." },
} as const;

export function QualityCurveViz() {
  const [specificity, setSpecificity] = useState(0.1);
  const { high, maxDpr, frozen } = useSceneQuality();

  const zone = specificity < 0.3 ? "vague" : specificity < 0.65 ? "sweet" : "over";
  const label = ZONE_LABELS[zone];
  const integrity = Math.round((zone === "sweet" ? 1 : zone === "vague" ? specificity / 0.3 : (1 - specificity) / 0.35) * 100);

  return (
    <div className="relative overflow-hidden group">
      <div className="op-viz-header">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight m-0 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" aria-hidden="true" />
              The Holographic Tuner
            </h3>
            <p className="text-sm text-slate-400 m-0 mt-1">
              Tune the prompt specificity to find the <OverpromptingMathTooltip mathKey="gaussian-quality">resonance frequency</OverpromptingMathTooltip>.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-8">
        <div className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-2xl bg-[#050508] border border-white/5 overflow-hidden shadow-2xl">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" aria-hidden="true" />

          <div className="absolute inset-0" aria-hidden="true">
            <Canvas gl={{ alpha: true }} camera={{ position: [0, 0, 4] }} dpr={[1, maxDpr]} frameloop={frozen ? "demand" : undefined}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <ShakeGroup active={zone === "over"} frozen={frozen}>
                <Float speed={frozen ? 0 : 2} rotationIntensity={0.2} floatIntensity={0.2}>
                  <HologramMesh specificity={specificity} frozen={frozen} />
                </Float>
              </ShakeGroup>

              {high && (
                <EffectComposer enableNormalPass={false}>
                  <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.2} radius={0.5} />
                  <Noise opacity={0.1} />
                  <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
              )}
            </Canvas>
          </div>

          {/* Overlay Stats (desktop only; phones get the row below the canvas) */}
          <div className="absolute top-6 left-6 font-mono text-xs space-y-1 hidden md:block pointer-events-none">
            <div className="text-slate-500">SIGNAL_INTEGRITY</div>
            <div className={cn("text-xl font-bold tabular-nums", label.color)}>{integrity}%</div>
          </div>

          <div className="absolute top-6 right-6 font-mono text-xs text-right space-y-1 hidden md:block pointer-events-none">
            <div className="text-slate-500">MODE</div>
            <div className={cn("text-lg font-bold tracking-widest", label.color)}>{label.text}</div>
          </div>

          {/* Central Message */}
          <div className="absolute bottom-6 left-0 right-0 hidden md:flex justify-center pointer-events-none px-4 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={zone}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10"
              >
                <span className={cn("text-xs md:text-sm font-medium", label.color)}>{label.desc}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile readouts */}
        <div className="md:hidden mt-4 grid grid-cols-2 gap-3 font-mono text-xs" aria-live="polite">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-slate-500">SIGNAL_INTEGRITY</div>
            <div className={cn("text-lg font-bold tabular-nums", label.color)}>{integrity}%</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-right">
            <div className="text-slate-500">MODE</div>
            <div className={cn("text-sm font-bold tracking-widest break-words", label.color)}>{label.text}</div>
          </div>
          <div className={cn("col-span-2 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center font-sans", label.color)}>
            {label.desc}
          </div>
        </div>

        {/* Synth Knob Control (Slider) */}
        <div className="mt-8 px-4">
          <div className="relative h-12 flex items-center touch-none">
            {/* Track */}
            <div className="absolute left-0 right-0 h-2 bg-white/10 rounded-full overflow-hidden" aria-hidden="true">
              <div className="absolute left-0 top-0 bottom-0 w-[30%] bg-amber-500/20" />
              <div className="absolute left-[30%] top-0 bottom-0 w-[35%] bg-emerald-500/20" />
              <div className="absolute left-[65%] top-0 bottom-0 w-[35%] bg-rose-500/20" />
            </div>

            {/* Slider (visually hidden; the thumb below mirrors it and shows keyboard focus) */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={specificity}
              onChange={(e) => setSpecificity(parseFloat(e.target.value))}
              className="peer relative z-10 w-full h-full opacity-0 cursor-pointer"
              aria-label="Adjust prompt specificity"
              aria-valuetext={`${Math.round(specificity * 100)} percent, ${label.text.toLowerCase()}`}
            />

            {/* Visual Thumb */}
            <motion.div
              aria-hidden="true"
              className="absolute h-6 w-6 rounded-full bg-white border-2 border-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.5)] pointer-events-none peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#020204]"
              style={{ left: `calc(${specificity * 100}% - 12px)` }}
            />
          </div>

          <div className="flex justify-between text-xs font-mono text-slate-500 uppercase mt-2" aria-hidden="true">
            <span>Vague</span>
            <span>Specific</span>
            <span>Overfit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 3. MACRO/MICRO LENS (Plan vs Execute)
// ============================================================

// Hoisted node layout; lines run from each node to the origin.
const NODE_POSITIONS: THREE.Vector3[] = [
  [-3, 2, -2], [3, 1, -3], [-2, -2, -1], [2, -3, -2],
  [0, 4, -4], [0, -4, -4],
].map(([x, y, z]) => new THREE.Vector3(x, y, z));
const NETWORK_ORIGIN = new THREE.Vector3(0, 0, 0);

const PLAN_DISTANCE = 12;
const EXECUTE_DISTANCE = 2.5;

function NodeNetwork({ mode, frozen }: { mode: "plan" | "execute"; frozen: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (frozen) {
      groupRef.current.rotation.y = 0;
      return;
    }
    const t = state.clock.elapsedTime;
    // Gentle drift in plan mode
    if (mode === "plan") {
      groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Node (Execution Target) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshTransmissionMaterial
          color={mode === "plan" ? "#f59e0b" : "#f43f5e"}
          emissive={mode === "plan" ? "#f59e0b" : "#f43f5e"}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.5}
          transmission={0.9}
          thickness={2}
          toneMapped={false}
        />
        {/* Internal Clockwork (Visible when close) */}
        <group scale={0.5}>
           <mesh rotation-z={Math.PI/2}>
             <torusGeometry args={[1.2, 0.1, 16, 32]} />
             <meshStandardMaterial color="white" emissive="white" emissiveIntensity={4} toneMapped={false} />
           </mesh>
           <mesh rotation-x={Math.PI/2}>
             <torusGeometry args={[0.8, 0.1, 16, 32]} />
             <meshStandardMaterial color="white" toneMapped={false} />
           </mesh>
        </group>
      </mesh>

      {/* Surrounding Nodes (Planning Context) */}
      <group>
        {NODE_POSITIONS.map((pos, i) => (
          <group key={i}>
            <mesh position={pos}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial
                color="#64748b"
                transparent
                opacity={mode === "plan" ? 0.8 : 0.1}
              />
            </mesh>
            {/* Connection Line: node → central target */}
            <ConnectionLine start={pos} opacity={mode === "plan" ? 0.2 : 0} />
          </group>
        ))}
      </group>
    </group>
  );
}

/** One Line per node, created once; opacity is applied declaratively instead of rebuilding the object. */
function ConnectionLine({ start, opacity }: { start: THREE.Vector3; opacity: number }) {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, NETWORK_ORIGIN]);
    const material = new THREE.LineBasicMaterial({ color: "white", transparent: true, opacity: 0 });
    return new THREE.Line(geometry, material);
  }, [start]);

  useEffect(() => {
    return () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    };
  }, [line]);

  return <primitive object={line} material-opacity={opacity} />;
}

export function PlanExecuteViz() {
  const [mode, setMode] = useState<"plan" | "execute">("plan");
  const controlsRef = useRef<CameraControls>(null);
  const { high, maxDpr, particles, frozen } = useSceneQuality();

  useEffect(() => {
    if (controlsRef.current) {
      const distance = mode === "plan" ? PLAN_DISTANCE : EXECUTE_DISTANCE;
      // Reduced motion: cut instead of dollying.
      controlsRef.current.setLookAt(0, 0, distance, 0, 0, 0, !frozen);
    }
  }, [mode, frozen]);

  const zoomLabel = mode === "plan" ? "1x" : `${(PLAN_DISTANCE / EXECUTE_DISTANCE).toFixed(1)}x`;

  return (
    <div>
      <div className="op-viz-header">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight m-0 flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-amber-400" aria-hidden="true" />
          The Macro-Micro Lens
        </h3>
        <p className="text-sm text-slate-400 m-0">
          Zoom out for planning context, zoom in for execution precision.
        </p>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-8">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl bg-[#050508] border border-white/5 overflow-hidden shadow-2xl">
          <div className="absolute inset-0" aria-hidden="true">
            <Canvas dpr={[1, maxDpr]} frameloop={frozen ? "demand" : undefined}>
              <PerspectiveCamera makeDefault position={[0, 0, PLAN_DISTANCE]} fov={40} />
              <CameraControls ref={controlsRef} minDistance={2} maxDistance={20} enabled={false} />
              <Stars radius={100} depth={50} count={Math.max(500, Math.round(5000 * particles))} factor={4} saturation={0} fade speed={frozen ? 0 : 1} />
              <ambientLight intensity={0.2} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <StudioEnvironment />

              <NodeNetwork mode={mode} frozen={frozen} />

              {/* Grid floor for depth reference */}
              <Grid
                position={[0, -5, 0]}
                args={[20, 20]}
                cellColor="#334155"
                sectionColor="#1e293b"
                fadeDistance={15}
              />

              {high && (
                <EffectComposer enableNormalPass={false}>
                  <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.0} radius={0.4} />
                  <Noise opacity={0.05} />
                  <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
              )}
            </Canvas>
          </div>

          {/* Mode Switcher HUD */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex flex-wrap justify-center gap-3 md:gap-4 px-3 pointer-events-none" role="group" aria-label="Lens mode">
          <button
            type="button"
            onClick={() => setMode("plan")}
            aria-pressed={mode === "plan"}
            className={cn(
              "pointer-events-auto min-h-11 px-5 md:px-6 py-3 rounded-xl border flex items-center gap-2 transition-colors duration-500",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300",
              mode === "plan"
                ? "bg-amber-500 text-white border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                : "bg-black/40 text-slate-400 border-white/10 hover:bg-white/5"
            )}
            >
              <LayoutTemplate className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-widest">Plan (Macro)</span>
            </button>

          <button
            type="button"
            onClick={() => setMode("execute")}
            aria-pressed={mode === "execute"}
            className={cn(
              "pointer-events-auto min-h-11 px-5 md:px-6 py-3 rounded-xl border flex items-center gap-2 transition-colors duration-500",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300",
              mode === "execute"
                ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                : "bg-black/40 text-slate-400 border-white/10 hover:bg-white/5"
            )}
            >
              <Microscope className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-widest">Execute (Micro)</span>
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-6 flex flex-wrap justify-between gap-2 text-xs text-slate-500 font-mono uppercase tracking-widest px-2">
          <span>Current Context: {mode === "plan" ? "Global Graph" : "Local Node"}</span>
          <span>Zoom: {zoomLabel}</span>
        </div>
      </div>
    </div>
  );
}
