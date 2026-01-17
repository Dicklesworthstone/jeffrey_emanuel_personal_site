"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, useCallback, createContext, useContext } from "react";
import type { JSX } from "react";
import * as THREE from "three";
import gsap from "gsap";
import {
  useDeviceCapabilities,
  type QualitySettings,
} from "@/hooks/use-mobile-optimizations";

// ---------------------------------------------------------------------------
// Quality context for child components
// ---------------------------------------------------------------------------
interface QualityContextValue {
  quality: QualitySettings;
  tier: "low" | "medium" | "high";
}

const QualityContext = createContext<QualityContextValue | null>(null);

function useQuality() {
  const context = useContext(QualityContext);
  if (!context) {
    throw new Error("useQuality must be used within a QualityProvider");
  }
  return context;
}

// ---------------------------------------------------------------------------
// Helper to scale counts based on quality
// ---------------------------------------------------------------------------
function scaleCount(baseCount: number, q: QualitySettings): number {
  return Math.max(10, Math.floor(baseCount * q.particleMultiplier));
}

function scaleSegments(baseSegments: number, q: QualitySettings): number {
  return Math.max(8, Math.floor(baseSegments * q.geometryDetail));
}

function makeLineMaterial(color: string, opacity = 0.6) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------
type Palette = [string, string, string, string];

const palettes: Palette[] = [
  ["#38bdf8", "#6366f1", "#22c55e", "#e2e8f0"],
  ["#f97316", "#fb7185", "#a855f7", "#fef9c3"],
  ["#22c55e", "#10b981", "#67e8f9", "#f0f9ff"],
  ["#f43f5e", "#ec4899", "#c084fc", "#e2e8f0"],
  ["#f59e0b", "#84cc16", "#22d3ee", "#e0f2fe"],
  ["#0ea5e9", "#7c3aed", "#f472b6", "#c7d2fe"],
];

const SLOT_MINUTES = 20;

const useTimeSlot = (intervalMinutes = SLOT_MINUTES) => {
  const getSlot = useCallback(() => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    return Math.floor(totalMinutes / intervalMinutes);
  }, [intervalMinutes]);

  // Initialize with current slot since this is a client-side only component (ssr: false)
  const [slot, setSlot] = useState(() => getSlot());
  useEffect(() => {
    const update = () => setSlot(getSlot());
    // Update every minute
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [getSlot]);
  return slot;
};

// ---------------------------------------------------------------------------
// Subtle mathematical halo overlay (lightweight)
// ---------------------------------------------------------------------------
function MathematicalHalo({ palette }: { palette: Palette }) {
  const groupRef = useRef<THREE.Group>(null);
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const { quality, tier } = useQuality();
  const enabled = tier !== "low";
  const pointCount = enabled ? Math.max(12, Math.floor(72 * quality.particleMultiplier)) : 0;
  const segments = scaleSegments(6, quality);

  const baseGeom = useMemo(() => new THREE.IcosahedronGeometry(2.2, 1), []);
  const wireGeom = useMemo(() => new THREE.WireframeGeometry(baseGeom), [baseGeom]);
  const wireMat = useMemo(() => makeLineMaterial(palette[3], 0.32), [palette]);
  const pointGeom = useMemo(() => new THREE.SphereGeometry(0.035, segments, segments), [segments]);
  const pointMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: palette[1],
      emissive: palette[0],
      emissiveIntensity: 0.9,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.95,
    }),
    [palette],
  );

  const seeds = useMemo(
    () =>
      Array.from({ length: pointCount }, (_, i) => {
        const t = (i + 0.5) / pointCount;
        const phi = Math.acos(1 - 2 * t);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
        return { phi, theta, offset: (i % 9) * 0.35 };
      }),
    [pointCount],
  );

  useEffect(() => () => baseGeom.dispose(), [baseGeom]);
  useEffect(() => () => wireGeom.dispose(), [wireGeom]);
  useEffect(() => () => wireMat.dispose(), [wireMat]);
  useEffect(() => () => pointGeom.dispose(), [pointGeom]);
  useEffect(() => () => pointMat.dispose(), [pointMat]);

  useFrame(({ clock }) => {
    if (!enabled) return;
    const instanced = instancedRef.current;
    if (!instanced) return;
    const t = clock.getElapsedTime();
    const dummy = dummyRef.current;
    const orbit = 0.12 * t;

    for (let i = 0; i < seeds.length; i++) {
      const { phi, theta, offset } = seeds[i];
      const wobble = 0.18 * Math.sin(t * 0.6 + offset);
      const r = 2.2 + wobble;
      const ang = theta + orbit + offset * 0.2;
      const x = Math.cos(ang) * Math.sin(phi) * r;
      const y = Math.cos(phi) * r;
      const z = Math.sin(ang) * Math.sin(phi) * r;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.9 + 0.2 * Math.sin(t * 0.9 + offset));
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
  });

  if (!enabled) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <lineSegments geometry={wireGeom} material={wireMat} />
      <instancedMesh ref={instancedRef} args={[pointGeom, pointMat, pointCount]} />
    </group>
  );
}

// Simple deterministic pseudo-random generator for repeatable layouts
// Uses Mulberry32 for better statistical properties than sine-based PRNGs
export const seededRandom = (seed: number) => {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Starfield reused by multiple scenes - now quality-aware
function StarField({ density = 420, color = "#38bdf8" }: { density?: number; color?: string }) {
  const ref = useRef<THREE.Points>(null);
  const { quality } = useQuality();

  const positions = useMemo(() => {
    // Scale density based on quality settings
    const numPoints = scaleCount(density, quality);
    const pts = new Float32Array(numPoints * 3);
    // Use seeded random for deterministic, pure positioning
    const rand = seededRandom(42);
    for (let i = 0; i < numPoints; i++) {
      const r = 5 + rand() * 4;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      const idx = i * 3;
      pts[idx] = x;
      pts[idx + 1] = y;
      pts[idx + 2] = z;
    }
    return pts;
  }, [density, quality]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.015;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        color={color}
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Variant: Orbital polyhedron (original)
// ---------------------------------------------------------------------------
function FloatingPolyhedron({ palette }: { palette: Palette }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = t * 0.25;
    ref.current.rotation.y = t * 0.35;
    ref.current.position.y = Math.sin(t * 0.7) * 0.2;
  });
  return (
    <mesh ref={ref} castShadow>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial
        metalness={0.35}
        roughness={0.18}
        color={new THREE.Color(palette[0])}
        emissive={new THREE.Color(palette[1])}
        emissiveIntensity={1.35}
      />
    </mesh>
  );
}

function OrbitalRing(props: { radius: number; tilt: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.z = props.tilt;
    ref.current.rotation.y = t * 0.15;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[props.radius, 0.015, 16, 128]} />
      <meshBasicMaterial color={props.color} transparent opacity={0.65} />
    </mesh>
  );
}

function SceneOrbits({ palette, seed: _ }: { palette: Palette; seed: number }) {
  return (
    <>
      <StarField color={palette[0]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 6, 4]} intensity={1.3} color={"#e5e7eb"} />
      <FloatingPolyhedron palette={palette} />
      <group scale={1.4}>
        <OrbitalRing radius={1.9} tilt={0.4} color={palette[0]} />
        <OrbitalRing radius={2.4} tilt={-0.2} color={palette[2]} />
        <OrbitalRing radius={2.9} tilt={0.9} color={palette[1]} />
      </group>
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Lissajous particle swarm
// ---------------------------------------------------------------------------
function LissajousSwarm({ palette, seed, count = 550 }: { palette: Palette; seed: number; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const { quality } = useQuality();
  const actualCount = scaleCount(count, quality);
  const sphereSegments = scaleSegments(12, quality);
  const geom = useMemo(() => new THREE.SphereGeometry(0.04, sphereSegments, sphereSegments), [sphereSegments]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 0.8, metalness: 0.1, roughness: 0.4 }),
    [palette],
  );

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  const rand = useMemo(() => seededRandom(seed), [seed]);
  const params = useMemo(() => ({
    ax: 1 + rand() * 2,
    ay: 1.5 + rand() * 2,
    az: 0.8 + rand() * 1.6,
    bx: 2 + rand() * 2,
    by: 2 + rand() * 2,
    bz: 1.5 + rand() * 1.5,
    phase: rand() * Math.PI,
    ax2: 0.6 + rand() * 1.4,
    by2: 0.6 + rand() * 1.4,
    cz2: 0.4 + rand() * 1.0,
    wobble: 0.2 + rand() * 0.4,
  }), [rand]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.35;
    const dummy = dummyRef.current;
    const drift = Math.sin(t * 0.6) * params.wobble;
    for (let i = 0; i < actualCount; i++) {
      const k = (i / actualCount) * Math.PI * 2;
      const x = Math.sin((params.ax + drift) * k + t) * Math.cos(params.bx * k + params.phase) * 2.1
        + 0.35 * Math.sin(params.ax2 * k - t * 0.7);
      const y = Math.sin((params.ay - drift) * k + t * 1.1) * Math.sin(params.by * k + params.phase) * 2.1
        + 0.35 * Math.cos(params.by2 * k + t * 0.5);
      const z = Math.cos((params.az + drift * 0.5) * k + t * 0.8) * Math.cos(params.bz * k + params.phase) * 2.1
        + 0.25 * Math.sin(params.cz2 * k - t * 0.4);
      dummy.position.set(x, y, z);
      const s = 0.7 + Math.sin(k * 4 + t) * 0.25;
      dummy.scale.setScalar(s * 0.7);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.4;
      groupRef.current.rotation.x = Math.sin(t * 0.6) * 0.2;
    }
  });

  // gsap pulsing emissive
  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(mat, { emissiveIntensity: 1.6, duration: 2.8, ease: "sine.inOut" });
    return () => {
      tl.kill();
    };
  }, [mat]);

  return (
    <group ref={groupRef}>
      <instancedMesh ref={ref} args={[geom, mat, actualCount]} />
    </group>
  );
}

function SceneLissajous({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <StarField density={300} color={palette[3]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 2, 3]} intensity={1.2} color={palette[1]} />
      <LissajousSwarm palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Wave grid (interference patterns)
// ---------------------------------------------------------------------------
function WaveGrid({ palette, seed, size = 15 }: { palette: Palette; seed: number; size?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const geom = useMemo(() => new THREE.BoxGeometry(0.18, 0.18, 0.18), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[2], metalness: 0.2, roughness: 0.5 }), [palette]);

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  const rand = useMemo(() => seededRandom(seed), [seed]);
  const frequencies = useMemo(() => [0.6 + rand() * 0.4, 0.8 + rand() * 0.4, 0.9 + rand() * 0.3], [rand]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const dummy = dummyRef.current;
    const t = clock.getElapsedTime();
    let i = 0;
    for (let x = -size; x <= size; x++) {
      for (let z = -size; z <= size; z++) {
        const dist = Math.sqrt(x * x + z * z) * 0.3;
        const y = Math.sin(dist * frequencies[0] + t) + Math.cos(dist * frequencies[1] - t * 1.3) + Math.sin((x + z) * 0.3 + t * frequencies[2]);
        dummy.position.set(x * 0.18, y * 0.12, z * 0.18);
        const s = 0.6 + (y + 2) * 0.08;
        dummy.scale.setScalar(s);
        dummy.rotation.y = (x + z) * 0.05 + t * 0.2;
        dummy.updateMatrix();
        ref.current.setMatrixAt(i++, dummy.matrix);
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geom, mat, (size * 2 + 1) ** 2]} />;
}

function SceneWaveGrid({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 2]} intensity={1.1} color={palette[1]} />
      <WaveGrid palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Lorenz ribbons (chaotic attractor)
// ---------------------------------------------------------------------------
function LorenzRibbons({ palette }: { palette: Palette }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    let x = 0.1, y = 0, z = 0;
    const dt = 0.007;
    const sigma = 10, rho = 28, beta = 8 / 3;
    for (let i = 0; i < 12000; i++) {
      const dx = sigma * (y - x) * dt;
      const dy = (x * (rho - z) - y) * dt;
      const dz = (x * y - beta * z) * dt;
      x += dx; y += dy; z += dz;
      if (i % 2 === 0) pts.push(new THREE.Vector3(x * 0.06, y * 0.06, z * 0.06));
    }
    const g = new THREE.BufferGeometry();
    g.setFromPoints(pts);
    return g;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const m = lineRef.current.material as THREE.LineBasicMaterial;
    m.opacity = 0.6 + Math.sin(clock.getElapsedTime() * 0.8) * 0.25;
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={palette[1]}
        transparent
        opacity={0.78}
        linewidth={1.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function SceneLorenz({ palette, seed: _ }: { palette: Palette; seed: number }) {
  return (
    <>
      <StarField density={260} color={palette[2]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 4, 3]} intensity={1.3} color={palette[0]} />
      <LorenzRibbons palette={palette} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Helix ribbons
// ---------------------------------------------------------------------------
function HelixLines({ palette, turns = 5, strands = 4 }: { palette: Palette; turns?: number; strands?: number }) {
  const group = useRef<THREE.Group>(null);
  const curves = useMemo(() => {
    const arr: THREE.CatmullRomCurve3[] = [];
    for (let s = 0; s < strands; s++) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 240; i++) {
        const t = (i / 240) * Math.PI * 2 * turns;
        const phase = (s / strands) * Math.PI * 2;
        const r = 1.2 + 0.25 * Math.sin(t * 0.5 + phase);
        pts.push(new THREE.Vector3(Math.cos(t + phase) * r, (i / 240 - 0.5) * 4, Math.sin(t + phase) * r));
      }
      arr.push(new THREE.CatmullRomCurve3(pts));
    }
    return arr;
  }, [turns, strands]);

  const geometries = useMemo(() => curves.map((c) => new THREE.TubeGeometry(c, 200, 0.04, 12, false)), [curves]);
  const materials = useMemo(
    () => [palette[0], palette[1], palette[2], palette[3]].map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.5, roughness: 0.25 })),
    [palette],
  );

  useEffect(() => () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  }, [geometries, materials]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.getElapsedTime() * 0.25;
  });

  return (
    <group ref={group}>
      {geometries.map((g, i) => (
        <mesh key={i} geometry={g} material={materials[i % materials.length]} />
      ))}
    </group>
  );
}

function SceneHelix({ palette, seed: _ }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-3, 4, 2]} intensity={1.2} color={palette[0]} />
      <HelixLines palette={palette} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Torus garden
// ---------------------------------------------------------------------------
function TorusGarden({ palette, seed }: { palette: Palette; seed: number }) {
  const ref = useRef<THREE.Group>(null);
  const torii = useMemo(() => {
    const rand = seededRandom(seed);
    return Array.from({ length: 16 }).map((_, i) => ({
      radius: 0.6 + rand() * 1.6,
      tube: 0.08 + rand() * 0.12,
      tilt: rand() * Math.PI,
      wobble: 0.4 + rand() * 0.4,
      color: palette[i % palette.length],
    }));
  }, [palette, seed]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((child, idx) => {
      child.rotation.x = (idx % 2 === 0 ? 1 : -1) * t * 0.2;
      child.rotation.y = Math.sin(t * 0.6 + idx) * 0.4;
      child.position.y = Math.sin(t * 0.7 + idx) * 0.4;
    });
  });

  return (
    <group ref={ref}>
      {torii.map((t, i) => (
        <mesh key={i} rotation={[0, 0, t.tilt]}>
          <torusKnotGeometry args={[t.radius, t.tube, 120, 32, 2 + i % 5, 3 + (i % 3)]} />
          <meshStandardMaterial color={t.color} emissive={t.color} emissiveIntensity={0.4} metalness={0.25} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function SceneTorus({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 2, 4]} intensity={1.25} color={palette[0]} />
      <TorusGarden palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Icosa flock (boids-like ribbon)
// ---------------------------------------------------------------------------
function IcosaFlock({ palette, seed, count = 140 }: { palette: Palette; seed: number; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const { quality } = useQuality();
  const actualCount = scaleCount(count, quality);
  const geom = useMemo(() => new THREE.IcosahedronGeometry(0.09, 0), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[1], emissive: palette[2], emissiveIntensity: 0.6, roughness: 0.3 }),
    [palette]
  );
  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  const rand = useMemo(() => seededRandom(seed), [seed]);
  const seeds = useMemo(() => Array.from({ length: actualCount }, () => ({
    phase: rand() * Math.PI * 2,
    radius: 0.8 + rand() * 2.4,
    speed: 0.4 + rand() * 0.7,
    height: 0.4 + rand() * 1.4,
  })), [actualCount, rand]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const dummy = dummyRef.current;
    seeds.forEach((s, i) => {
      const angle = t * s.speed + s.phase;
      dummy.position.set(Math.cos(angle) * s.radius, Math.sin(t * 0.7 + s.phase) * s.height, Math.sin(angle) * s.radius);
      dummy.rotation.set(Math.sin(angle) * 0.4, angle, Math.cos(angle) * 0.3);
      const scale = 0.6 + 0.4 * Math.sin(t * 1.5 + i * 0.2);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geom, mat, actualCount]} />;
}

function SceneFlock({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight intensity={0.4} color={palette[2]} groundColor="#0f172a" />
      <IcosaFlock palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Clifford attractor ribbons
// ---------------------------------------------------------------------------
function Clifford({ palette, seed, count = 42000 }: { palette: Palette; seed: number; count?: number }) {
  const { quality, tier } = useQuality();
  const group = useRef<THREE.Group>(null);
  const emberRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const actualCount = useMemo(() => {
    if (tier === "high") return count;
    if (tier === "medium") return Math.max(18000, Math.floor(count * 0.6));
    return Math.max(12000, Math.floor(count * 0.4));
  }, [count, tier]);

  const positions = useMemo(() => {
    const rand = seededRandom(seed);
    const a = -1.4 + rand() * 0.8;
    const b = 1.6 + rand() * 0.8;
    const c = 1.0 + rand() * 1.0;
    const d = -1.2 + rand() * 0.6;
    let x = 0.1, y = 0, z = 0;
    const pts = new Float32Array(actualCount * 3);
    for (let i = 0; i < actualCount; i++) {
      const nx = Math.sin(a * y) + c * Math.cos(a * x);
      const ny = Math.sin(b * x) + d * Math.cos(b * y);
      const nz = Math.sin(b * z) - Math.cos(a * x);
      x = nx;
      y = ny;
      z = nz;
      const idx = i * 3;
      pts[idx] = x * 0.4;
      pts[idx + 1] = y * 0.4;
      pts[idx + 2] = z * 0.4;
    }
    return pts;
  }, [seed, actualCount]);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.computeBoundingSphere();
    return g;
  }, [positions]);

  const mat = useMemo(() => makeLineMaterial(palette[1], 0.78), [palette]);

  const emberCount = Math.max(16, Math.floor(140 * quality.particleMultiplier));
  const emberSegments = scaleSegments(6, quality);
  const emberGeom = useMemo(() => new THREE.SphereGeometry(0.035, emberSegments, emberSegments), [emberSegments]);
  const emberMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[2], emissiveIntensity: 1.1, roughness: 0.35 }),
    [palette],
  );
  const pointCount = Math.max(1, positions.length / 3);
  const emberSeeds = useMemo(() => {
    const rand = seededRandom(seed + 17);
    return Array.from({ length: emberCount }).map(() => ({
      idx: Math.floor(rand() * pointCount),
      speed: 0.35 + rand() * 1.1,
      phase: rand() * Math.PI * 2,
      scale: 0.5 + rand() * 0.8,
    }));
  }, [emberCount, seed, pointCount]);

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);
  useEffect(() => () => emberGeom.dispose(), [emberGeom]);
  useEffect(() => () => emberMat.dispose(), [emberMat]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.12;
    group.current.rotation.x = Math.sin(t * 0.4) * 0.2;

    if (emberRef.current) {
      const dummy = dummyRef.current;
      for (let i = 0; i < emberSeeds.length; i++) {
        const ember = emberSeeds[i];
        const advance = Math.floor((t * 60 * ember.speed) % pointCount);
        const idx = (ember.idx + advance) % pointCount;
        const px = positions[idx * 3];
        const py = positions[idx * 3 + 1];
        const pz = positions[idx * 3 + 2];
        const wobble = 0.08 * Math.sin(t * 1.2 + ember.phase);
        dummy.position.set(px + wobble, py + wobble * 0.6, pz - wobble * 0.4);
        dummy.scale.setScalar(ember.scale * (0.8 + 0.2 * Math.sin(t * 1.4 + ember.phase)));
        dummy.updateMatrix();
        emberRef.current.setMatrixAt(i, dummy.matrix);
      }
      emberRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={geom} material={mat} />
      <instancedMesh ref={emberRef} args={[emberGeom, emberMat, emberCount]} />
    </group>
  );
}

function SceneClifford({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[2, 2, 2]} intensity={1} color={palette[0]} />
      <Clifford palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Supershape morphing sphere
// ---------------------------------------------------------------------------
function supershape(theta: number, m: number, n1: number, n2: number, n3: number, a = 1, b = 1) {
  const t1 = Math.pow(Math.abs(Math.cos((m * theta) / 4) / a), n2);
  const t2 = Math.pow(Math.abs(Math.sin((m * theta) / 4) / b), n3);
  return Math.pow(t1 + t2, -1 / n1);
}

function SuperShapeBlob({ palette, seed }: { palette: Palette; seed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tempVec = useRef(new THREE.Vector3());
  const geom = useMemo(() => new THREE.IcosahedronGeometry(1.1, 4), []);
  useEffect(() => () => geom.dispose(), [geom]);
  const rand = useMemo(() => seededRandom(seed), [seed]);
  const params = useMemo(
    () => ({ m1: 3 + Math.floor(rand() * 8), m2: 4 + Math.floor(rand() * 6), n1: 0.2 + rand() * 1.8, n2: 0.2 + rand() * 1.8, n3: 0.2 + rand() * 1.8 }),
    [rand],
  );

  // Store original positions for stable calculations
  const originalPositions = useMemo(() => {
    const pos = geom.attributes.position as THREE.BufferAttribute;
    return new Float32Array(pos.array);
  }, [geom]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const pos = geom.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    const v = tempVec.current;
    for (let i = 0; i < pos.count; i++) {
      // Read from original positions to avoid drift
      v.set(originalPositions[i * 3], originalPositions[i * 3 + 1], originalPositions[i * 3 + 2]).normalize();
      const r1 = supershape(Math.atan2(v.y, v.x), params.m1, params.n1, params.n2, params.n3);
      const r2 = supershape(Math.acos(v.z), params.m2, params.n1, params.n2, params.n3);
      const r = 1 + 0.55 * r1 * r2 + 0.15 * Math.sin(t * 1.2 + i * 0.3);
      v.multiplyScalar(r);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    // eslint-disable-next-line react-hooks/immutability
    pos.needsUpdate = true;
    geom.computeVertexNormals();
    meshRef.current.rotation.y = t * 0.25;
    meshRef.current.rotation.x = Math.sin(t * 0.6) * 0.2;
  });

  return (
    <mesh ref={meshRef} geometry={geom}>
      <meshStandardMaterial color={palette[0]} emissive={palette[1]} emissiveIntensity={1.1} roughness={0.35} metalness={0.45} wireframe={false} />
    </mesh>
  );
}

function SceneSupershape({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 4, 2]} intensity={1.2} color={palette[2]} />
      <SuperShapeBlob palette={palette} seed={seed} />
      <StarField density={320} color={palette[3]} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Hopf fiber circles
// ---------------------------------------------------------------------------
function HopfFibers({ palette, seed, circles = 48 }: { palette: Palette; seed: number; circles?: number }) {
  const group = useRef<THREE.Group>(null);
  const rand = useMemo(() => seededRandom(seed), [seed]);
  const fibers = useMemo(() => {
    return Array.from({ length: circles }).map((_, i) => {
      const phase = (i / circles) * Math.PI * 2;
      const radius = 0.9 + 0.6 * rand();
      return { phase, radius, tilt: rand() * Math.PI * 2 };
    });
  }, [circles, rand]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.2;
    group.current.rotation.x = Math.sin(t * 0.4) * 0.3;
    group.current.children.forEach((child, idx) => {
      child.rotation.y = t * 0.6 + idx * 0.1;
    });
  });

  return (
    <group ref={group}>
      {fibers.map((f, i) => (
        <mesh key={i} rotation={[0, f.phase, f.tilt]}>
          <torusGeometry args={[f.radius, 0.03 + (i % 3) * 0.01, 12, 90]} />
          <meshStandardMaterial color={palette[i % palette.length]} emissive={palette[(i + 1) % palette.length]} emissiveIntensity={0.9} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function SceneHopf({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 3, 3]} intensity={1.2} color={palette[0]} />
      <HopfFibers palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Ikeda cloud
// ---------------------------------------------------------------------------
function IkedaCloud({ palette, seed: _, count = 4800 }: { palette: Palette; seed: number; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const yAxisRef = useRef(new THREE.Vector3(0, 1, 0));
  const geom = useMemo(() => new THREE.SphereGeometry(0.05, 10, 10), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 0.7, roughness: 0.35 }), [palette]);
  const points = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    let x = 0.1, y = 0, z = 0;
    for (let i = 0; i < count; i++) {
      const t = 0.4 - 6 / (1 + x * x + y * y);
      x = 1 + y * Math.sin(t);
      y = 0.7 * y + Math.sin(x);
      z = Math.cos(x + y);
      arr.push(new THREE.Vector3((x - 1.2) * 0.6, y * 0.6, z * 0.6));
    }
    return arr;
  }, [count]);

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const dummy = dummyRef.current;
    const yAxis = yAxisRef.current;
    const t = clock.getElapsedTime();
    points.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.position.applyAxisAngle(yAxis, t * 0.2);
      dummy.scale.setScalar(0.6 + 0.3 * Math.sin(t + i * 0.1));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geom, mat, points.length]} />;
}

function SceneIkeda({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <hemisphereLight intensity={0.6} color={palette[2]} groundColor="#0b1224" />
      <IkedaCloud palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Gyroid displacement surface
// ---------------------------------------------------------------------------
function GyroidSurface({ palette, seed: _, resolution = 70 }: { palette: Palette; seed: number; resolution?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => new THREE.PlaneGeometry(4, 4, resolution, resolution), [resolution]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 0.5, roughness: 0.4, metalness: 0.35, side: THREE.DoubleSide }), [palette]);
  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pos = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const g = Math.sin(x + t * 0.8) * Math.cos(y + t * 0.6) + Math.sin(y + t * 0.4) * Math.cos(x + t * 0.5);
      pos.setZ(i, g * 0.6);
    }
    // eslint-disable-next-line react-hooks/immutability
    pos.needsUpdate = true;
    geom.computeVertexNormals();
    if (meshRef.current) {
      meshRef.current.rotation.x = -Math.PI / 2.4;
      meshRef.current.rotation.z = t * 0.08;
    }
  });

  return <mesh ref={meshRef} geometry={geom} material={mat} />;
}

function SceneGyroid({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 3]} intensity={1.25} color={palette[2]} />
      <GyroidSurface palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Möbius Strip with flowing particles
// ---------------------------------------------------------------------------
function MobiusStrip({ palette, seed }: { palette: Palette; seed: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const rand = useMemo(() => seededRandom(seed), [seed]);

  // Create the Möbius strip geometry
  const stripGeom = useMemo(() => {
    const segments = 200;
    const width = 0.4;
    const positions: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const u = (i / segments) * Math.PI * 2;
      for (let j = 0; j <= 1; j++) {
        const v = (j - 0.5) * width;
        // Möbius parametric equations
        const x = (1 + v * Math.cos(u / 2)) * Math.cos(u);
        const y = (1 + v * Math.cos(u / 2)) * Math.sin(u);
        const z = v * Math.sin(u / 2);
        positions.push(x * 1.5, y * 1.5, z * 1.5);
      }
    }

    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = i * 2 + 2;
      const d = i * 2 + 3;
      indices.push(a, b, c, b, d, c);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, []);

  const stripMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: palette[0],
      emissive: palette[1],
      emissiveIntensity: 0.6,
      metalness: 0.4,
      roughness: 0.3,
      side: THREE.DoubleSide,
    }),
    [palette]
  );

  const particleGeom = useMemo(() => new THREE.SphereGeometry(0.06, 8, 8), []);
  const particleMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[2], emissive: palette[3], emissiveIntensity: 1.2 }),
    [palette]
  );

  const particleCount = 80;
  const particlePhases = useMemo(() =>
    Array.from({ length: particleCount }, () => rand() * Math.PI * 2),
    [rand]
  );

  useEffect(() => () => {
    stripGeom.dispose();
    particleGeom.dispose();
  }, [stripGeom, particleGeom]);

  useEffect(() => () => {
    stripMat.dispose();
    particleMat.dispose();
  }, [stripMat, particleMat]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !particlesRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;

    const dummy = dummyRef.current;
    particlePhases.forEach((phase, i) => {
      const u = ((t * 0.4 + phase) % (Math.PI * 2));
      const v = Math.sin(t * 2 + i) * 0.15;
      const x = (1 + v * Math.cos(u / 2)) * Math.cos(u);
      const y = (1 + v * Math.cos(u / 2)) * Math.sin(u);
      const z = v * Math.sin(u / 2);
      dummy.position.set(x * 1.5, y * 1.5, z * 1.5);
      dummy.scale.setScalar(0.8 + Math.sin(t * 3 + i) * 0.3);
      dummy.updateMatrix();
      particlesRef.current!.setMatrixAt(i, dummy.matrix);
    });
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={stripGeom} material={stripMat} />
      <instancedMesh ref={particlesRef} args={[particleGeom, particleMat, particleCount]} />
    </group>
  );
}

function SceneMobius({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={1.2} color={palette[0]} />
      <pointLight position={[-3, -3, 3]} intensity={0.8} color={palette[2]} />
      <MobiusStrip palette={palette} seed={seed} />
      <StarField density={280} color={palette[3]} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Möbius Loom (multi-band weave)
// ---------------------------------------------------------------------------
function mobiusPoint(u: number, v: number, radius: number, width: number, twist: number, target?: THREE.Vector3) {
  const half = (twist * u) / 2;
  const cosHalf = Math.cos(half);
  const sinHalf = Math.sin(half);
  const r = radius + v * width * cosHalf;
  const x = r * Math.cos(u);
  const y = r * Math.sin(u);
  const z = v * width * sinHalf;
  if (target) {
    target.set(x, y, z);
    return target;
  }
  return new THREE.Vector3(x, y, z);
}

function MobiusLoom({ palette, seed, bands = 3, points = 420 }: { palette: Palette; seed: number; bands?: number; points?: number }) {
  const { quality } = useQuality();
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const pointRef = useRef(new THREE.Vector3());
  const rand = useMemo(() => seededRandom(seed), [seed]);

  const bandDefs = useMemo(
    () =>
      Array.from({ length: bands }).map((_, i) => ({
        radius: 0.95 + i * 0.35 + rand() * 0.08,
        width: 0.55 + rand() * 0.25,
        twist: i % 2 === 0 ? 1 : -1,
        phase: rand() * Math.PI * 2,
      })),
    [bands, rand],
  );

  const lineGeoms = useMemo(() => {
    const segments = 220;
    return bandDefs.map((band) => {
      const positions: number[] = [];
      for (let i = 0; i < segments; i++) {
        const u0 = (i / segments) * Math.PI * 2 + band.phase;
        const u1 = ((i + 1) / segments) * Math.PI * 2 + band.phase;
        const p0 = mobiusPoint(u0, 0, band.radius, band.width, band.twist);
        const p1 = mobiusPoint(u1, 0, band.radius, band.width, band.twist);
        positions.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      return g;
    });
  }, [bandDefs]);

  const lineMats = useMemo(
    () => bandDefs.map((_, i) => makeLineMaterial(palette[i % palette.length], 0.62)),
    [bandDefs, palette],
  );

  const particleCount = Math.max(24, Math.floor(points * quality.particleMultiplier));
  const particleGeom = useMemo(() => new THREE.SphereGeometry(0.035, scaleSegments(6, quality), scaleSegments(6, quality)), [quality]);
  const particleMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[1], emissive: palette[0], emissiveIntensity: 1.1, roughness: 0.35 }),
    [palette],
  );

  const particleSeeds = useMemo(() => {
    const rand = seededRandom(seed + 99);
    return Array.from({ length: particleCount }).map(() => ({
      band: Math.floor(rand() * bandDefs.length),
      u: rand() * Math.PI * 2,
      v: (rand() - 0.5) * 1.6,
      speed: 0.2 + rand() * 0.6,
      phase: rand() * Math.PI * 2,
      scale: 0.6 + rand() * 0.7,
    }));
  }, [particleCount, bandDefs.length, seed]);

  useEffect(() => () => {
    lineGeoms.forEach((g) => g.dispose());
    particleGeom.dispose();
  }, [lineGeoms, particleGeom]);

  useEffect(() => () => {
    lineMats.forEach((m) => m.dispose());
    particleMat.dispose();
  }, [lineMats, particleMat]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !particlesRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.12;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.12;

    const dummy = dummyRef.current;
    for (let i = 0; i < particleSeeds.length; i++) {
      const seed = particleSeeds[i];
      const band = bandDefs[seed.band % bandDefs.length];
      const u = seed.u + t * seed.speed + band.phase;
      const v = seed.v * Math.sin(t * 0.6 + seed.phase);
      mobiusPoint(u, v, band.radius, band.width, band.twist, pointRef.current);
      dummy.position.copy(pointRef.current);
      dummy.scale.setScalar(seed.scale * (0.8 + 0.2 * Math.sin(t * 1.6 + seed.phase)));
      dummy.updateMatrix();
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    }
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      {lineGeoms.map((geom, i) => (
        <lineSegments key={`mobius-line-${i}`} geometry={geom} material={lineMats[i]} />
      ))}
      <instancedMesh ref={particlesRef} args={[particleGeom, particleMat, particleCount]} />
    </group>
  );
}

function SceneMobiusLoom({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 3]} intensity={1.2} color={palette[2]} />
      <pointLight position={[-2, -3, 2]} intensity={0.8} color={palette[0]} />
      <MobiusLoom palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Hyperbolic Weave (geodesic arc lattice)
// ---------------------------------------------------------------------------
function HyperbolicWeave({ palette, seed, arcCount = 18, segments = 64 }: { palette: Palette; seed: number; arcCount?: number; segments?: number }) {
  const { quality } = useQuality();
  const groupRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const rand = useMemo(() => seededRandom(seed), [seed]);

  const arcs = useMemo(() => {
    const list: Array<{ cx: number; cy: number; r: number; start: number; delta: number; lift: number; speed: number }> = [];
    for (let i = 0; i < arcCount; i++) {
      const theta1 = rand() * Math.PI * 2;
      const delta = (0.4 + rand() * 0.9) * Math.PI;
      const theta2 = theta1 + delta;
      const ux = Math.cos(theta1);
      const uy = Math.sin(theta1);
      const vx = Math.cos(theta2);
      const vy = Math.sin(theta2);
      const dot = ux * vx + uy * vy;
      const cross = ux * vy - uy * vx;
      if (Math.abs(cross) < 1e-3) continue;
      const t = (1 - dot) / cross;
      const cx = ux - uy * t;
      const cy = uy + ux * t;
      const r = Math.sqrt(Math.max(0.0001, cx * cx + cy * cy - 1));
      const start = Math.atan2(uy - cy, ux - cx);
      const end = Math.atan2(vy - cy, vx - cx);
      let deltaAng = end - start;
      if (deltaAng > Math.PI) deltaAng -= Math.PI * 2;
      if (deltaAng < -Math.PI) deltaAng += Math.PI * 2;
      list.push({
        cx,
        cy,
        r,
        start,
        delta: deltaAng,
        lift: 0.25 + rand() * 0.25,
        speed: 0.15 + rand() * 0.35,
      });
    }
    if (list.length === 0) {
      list.push({
        cx: 0,
        cy: 1.6,
        r: 1.2,
        start: -Math.PI * 0.6,
        delta: Math.PI * 1.2,
        lift: 0.3,
        speed: 0.25,
      });
    }
    return list;
  }, [arcCount, rand]);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const scale = 2.1;
    arcs.forEach((arc) => {
      for (let i = 0; i < segments; i++) {
        const t0 = i / segments;
        const t1 = (i + 1) / segments;
        const a0 = arc.start + arc.delta * t0;
        const a1 = arc.start + arc.delta * t1;
        const x0 = (arc.cx + arc.r * Math.cos(a0)) * scale;
        const y0 = (arc.cy + arc.r * Math.sin(a0)) * scale;
        const x1 = (arc.cx + arc.r * Math.cos(a1)) * scale;
        const y1 = (arc.cy + arc.r * Math.sin(a1)) * scale;
        const z0 = arc.lift * Math.sin(t0 * Math.PI * 2);
        const z1 = arc.lift * Math.sin(t1 * Math.PI * 2);
        positions.push(x0, y0, z0, x1, y1, z1);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [arcs, segments]);

  const material = useMemo(() => makeLineMaterial(palette[1], 0.72), [palette]);

  const nodeCount = Math.max(16, Math.floor(90 * quality.particleMultiplier));
  const nodeGeom = useMemo(() => new THREE.SphereGeometry(0.045, scaleSegments(6, quality), scaleSegments(6, quality)), [quality]);
  const nodeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[2], emissiveIntensity: 1.0, roughness: 0.3 }),
    [palette],
  );
  const nodeSeeds = useMemo(() => {
    const rand = seededRandom(seed + 77);
    return Array.from({ length: nodeCount }).map(() => ({
      arc: Math.floor(rand() * Math.max(1, arcs.length)),
      offset: rand(),
      speed: 0.2 + rand() * 0.5,
      phase: rand() * Math.PI * 2,
      scale: 0.6 + rand() * 0.6,
    }));
  }, [nodeCount, arcs.length, seed]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => nodeGeom.dispose(), [nodeGeom]);
  useEffect(() => () => nodeMat.dispose(), [nodeMat]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.1;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;

    if (nodesRef.current && arcs.length > 0) {
      const scale = 2.1;
      const dummy = dummyRef.current;
      for (let i = 0; i < nodeSeeds.length; i++) {
        const seed = nodeSeeds[i];
        const arc = arcs[seed.arc % arcs.length];
        const tt = (seed.offset + t * seed.speed) % 1;
        const angle = arc.start + arc.delta * tt;
        const x = (arc.cx + arc.r * Math.cos(angle)) * scale;
        const y = (arc.cy + arc.r * Math.sin(angle)) * scale;
        const z = arc.lift * Math.sin(tt * Math.PI * 2 + seed.phase);
        dummy.position.set(x, y, z);
        dummy.scale.setScalar(seed.scale * (0.85 + 0.15 * Math.sin(t * 1.4 + seed.phase)));
        dummy.updateMatrix();
        nodesRef.current.setMatrixAt(i, dummy.matrix);
      }
      nodesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry} material={material} />
      <instancedMesh ref={nodesRef} args={[nodeGeom, nodeMat, nodeCount]} />
    </group>
  );
}

function SceneHyperbolic({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 3]} intensity={1.1} color={palette[0]} />
      <directionalLight position={[-3, -2, 4]} intensity={0.9} color={palette[2]} />
      <HyperbolicWeave palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Spherical Harmonics - beautiful deformed spheres
// ---------------------------------------------------------------------------
function SphericalHarmonics({ palette, seed }: { palette: Palette; seed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => new THREE.SphereGeometry(1.3, 64, 64), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: palette[0],
      emissive: palette[1],
      emissiveIntensity: 0.7,
      metalness: 0.5,
      roughness: 0.25,
    }),
    [palette]
  );
  const rand = useMemo(() => seededRandom(seed), [seed]);

  // Spherical harmonic coefficients
  const coeffs = useMemo(() => ({
    l: Math.floor(rand() * 4) + 2,
    m: Math.floor(rand() * 5),
    amplitude: 0.3 + rand() * 0.4,
  }), [rand]);

  // Store original positions
  const originalPositions = useMemo(() => {
    const pos = geom.attributes.position as THREE.BufferAttribute;
    return new Float32Array(pos.array);
  }, [geom]);

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = geom.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const ox = originalPositions[i * 3];
      const oy = originalPositions[i * 3 + 1];
      const oz = originalPositions[i * 3 + 2];

      // Convert to spherical coordinates
      const r = Math.sqrt(ox * ox + oy * oy + oz * oz);
      const theta = Math.acos(oy / r);
      const phi = Math.atan2(oz, ox);

      // Simplified spherical harmonic Y_l^m
      const harmonic = Math.cos(coeffs.m * phi + t * 0.5) *
                       Math.pow(Math.sin(theta), coeffs.m) *
                       Math.cos(coeffs.l * theta + t * 0.3);

      const displacement = 1 + coeffs.amplitude * harmonic * Math.sin(t * 0.8 + i * 0.01);

      pos.setXYZ(i, ox * displacement, oy * displacement, oz * displacement);
    }
    // eslint-disable-next-line react-hooks/immutability
    pos.needsUpdate = true;
    geom.computeVertexNormals();

    meshRef.current.rotation.y = t * 0.2;
    meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.15;
  });

  return <mesh ref={meshRef} geometry={geom} material={mat} />;
}

function SceneHarmonics({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 4, 2]} intensity={1.3} color={palette[2]} />
      <pointLight position={[-3, 2, 3]} intensity={0.8} color={palette[0]} />
      <SphericalHarmonics palette={palette} seed={seed} />
      <StarField density={350} color={palette[3]} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Trefoil Knot with energy flow
// ---------------------------------------------------------------------------
function TrefoilKnot({ palette, seed }: { palette: Palette; seed: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const tempVec = useRef(new THREE.Vector3());
  const rand = useMemo(() => seededRandom(seed), [seed]);

  // Trefoil parametric curve - reuses tempVec to avoid GC pressure
  const trefoilPoint = (t: number, scale = 1.2, out: THREE.Vector3) => {
    const x = Math.sin(t) + 2 * Math.sin(2 * t);
    const y = Math.cos(t) - 2 * Math.cos(2 * t);
    const z = -Math.sin(3 * t);
    return out.set(x * scale * 0.5, y * scale * 0.5, z * scale * 0.5);
  };

  const tubeGeom = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const temp = new THREE.Vector3();
    for (let i = 0; i <= 200; i++) {
      trefoilPoint((i / 200) * Math.PI * 2, 1.2, temp);
      points.push(temp.clone());
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    return new THREE.TubeGeometry(curve, 200, 0.08, 16, true);
  }, []);

  const tubeMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: palette[0],
      emissive: palette[1],
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.2,
    }),
    [palette]
  );

  const particleGeom = useMemo(() => new THREE.OctahedronGeometry(0.08, 0), []);
  const particleMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[2], emissive: palette[3], emissiveIntensity: 1.5 }),
    [palette]
  );

  const particleCount = 60;
  const particleOffsets = useMemo(() =>
    Array.from({ length: particleCount }, () => rand() * Math.PI * 2),
    [rand]
  );

  useEffect(() => () => {
    tubeGeom.dispose();
    particleGeom.dispose();
  }, [tubeGeom, particleGeom]);

  useEffect(() => () => {
    tubeMat.dispose();
    particleMat.dispose();
  }, [tubeMat, particleMat]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !particlesRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.2;
    groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.3;

    const dummy = dummyRef.current;
    const temp = tempVec.current;
    particleOffsets.forEach((offset, i) => {
      const param = ((t * 0.6 + offset) % (Math.PI * 2));
      trefoilPoint(param, 1.2, temp);
      dummy.position.copy(temp);
      dummy.rotation.set(t * 2 + i, t * 3 + i * 0.5, 0);
      dummy.scale.setScalar(0.7 + Math.sin(t * 4 + i * 0.3) * 0.4);
      dummy.updateMatrix();
      particlesRef.current!.setMatrixAt(i, dummy.matrix);
    });
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={tubeGeom} material={tubeMat} />
      <instancedMesh ref={particlesRef} args={[particleGeom, particleMat, particleCount]} />
    </group>
  );
}

function SceneTrefoil({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[2, 3, 3]} intensity={1.3} color={palette[0]} />
      <pointLight position={[-2, -2, 2]} intensity={0.7} color={palette[2]} />
      <TrefoilKnot palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Perlin Flow Field - mesmerizing 3D particle flow
// ---------------------------------------------------------------------------
function PerlinFlowField({ palette, seed, count = 2000 }: { palette: Palette; seed: number; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const { quality } = useQuality();
  // Heavy limit on particles for this scene
  const actualCount = Math.min(scaleCount(count, quality), quality.maxParticles);
  const sphereSegments = scaleSegments(6, quality);
  const geom = useMemo(() => new THREE.SphereGeometry(0.025, sphereSegments, sphereSegments), [sphereSegments]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: palette[0],
      emissive: palette[1],
      emissiveIntensity: 1.1,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.95,
    }),
    [palette],
  );

  const rand = useMemo(() => seededRandom(seed), [seed]);

  // Initialize particle positions
  const particles = useMemo(() => {
    return Array.from({ length: actualCount }, () => ({
      pos: new THREE.Vector3(
        (rand() - 0.5) * 5,
        (rand() - 0.5) * 5,
        (rand() - 0.5) * 5
      ),
      vel: new THREE.Vector3(0, 0, 0),
      life: rand(),
    }));
  }, [actualCount, rand]);

  // Simple 3D noise function (phase-shifted to add curl-like variation)
  const noise3D = (x: number, y: number, z: number, t: number) => {
    const n1 = Math.sin(x * 1.5 + t) * Math.cos(y * 1.3 + t * 0.7) * Math.sin(z * 1.1 + t * 0.5);
    const n2 = Math.sin(x * 0.7 - t * 0.5) * Math.cos(z * 0.9 + t * 0.3);
    const n3 = Math.cos(y * 0.8 + z * 0.6 - t * 0.4) * Math.sin(x * 0.6 + t * 0.2);
    return n1 + n2 + 0.6 * n3;
  };

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * 0.5;
    const dummy = dummyRef.current;

    particles.forEach((p, i) => {
      // Calculate flow field direction using noise + swirl (Hodge-like curl bias)
      const nx = noise3D(p.pos.x * 0.3, p.pos.y * 0.3, p.pos.z * 0.3, t);
      const ny = noise3D(p.pos.y * 0.3, p.pos.z * 0.3, p.pos.x * 0.3, t + 100);
      const nz = noise3D(p.pos.z * 0.3, p.pos.x * 0.3, p.pos.y * 0.3, t + 200);
      const swirlX = -p.pos.y * 0.6 + Math.sin(p.pos.y * 0.6 + t * 0.7) * 0.4;
      const swirlY = p.pos.x * 0.6 + Math.cos(p.pos.x * 0.6 - t * 0.6) * 0.4;
      const swirlZ = Math.sin((p.pos.x + p.pos.y) * 0.35 + t * 0.5) * 0.5;

      const flowX = nx + swirlX;
      const flowY = ny + swirlY;
      const flowZ = nz + swirlZ;

      p.vel.x = p.vel.x * 0.65 + flowX * 0.02;
      p.vel.y = p.vel.y * 0.65 + flowY * 0.02;
      p.vel.z = p.vel.z * 0.65 + flowZ * 0.02;
      p.pos.add(p.vel);

      // Wrap around bounds
      const bound = 2.5;
      if (Math.abs(p.pos.x) > bound) p.pos.x *= -0.9;
      if (Math.abs(p.pos.y) > bound) p.pos.y *= -0.9;
      if (Math.abs(p.pos.z) > bound) p.pos.z *= -0.9;

      dummy.position.copy(p.pos);
      const speed = p.vel.length();
      dummy.scale.setScalar(0.75 + speed * 16);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geom, mat, actualCount]} />;
}

function SceneFlowField({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 4]} intensity={1.5} color={palette[2]} />
      <PerlinFlowField palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Quasicrystal field (interference lattice)
// ---------------------------------------------------------------------------
function QuasicrystalField({ palette, seed, count = 900 }: { palette: Palette; seed: number; count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { quality } = useQuality();
  const actualCount = Math.min(scaleCount(count, quality), quality.maxParticles);

  const { positions, radius } = useMemo(() => {
    const rand = seededRandom(seed);
    const waveCount = 6;
    const vectors = Array.from({ length: waveCount }, (_, i) => {
      const angle = (i / waveCount) * Math.PI * 2 + rand() * 0.4;
      const tilt = (rand() - 0.5) * 0.8;
      const v = new THREE.Vector3(
        Math.cos(angle),
        Math.sin(angle),
        Math.sin(angle * 1.7) * 0.6 + tilt,
      );
      return v.normalize();
    });
    const phases = vectors.map(() => rand() * Math.PI * 2);
    const frequency = 2.0 + rand() * 1.4;
    const threshold = 1.15 + rand() * 0.2;

    const maxRadius = 2.35;
    const pts = new Float32Array(actualCount * 3);
    let filled = 0;
    let attempts = 0;
    const maxAttempts = actualCount * 40;

    while (filled < actualCount && attempts < maxAttempts) {
      attempts += 1;
      // Sample inside sphere with bias toward center
      const u = rand();
      const v = rand();
      const w = rand();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = Math.cbrt(w) * maxRadius;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      let sum = 0;
      for (let i = 0; i < vectors.length; i++) {
        sum += Math.cos(vectors[i].x * x * frequency + vectors[i].y * y * frequency + vectors[i].z * z * frequency + phases[i]);
      }

      if (sum > threshold) {
        const idx = filled * 3;
        pts[idx] = x;
        pts[idx + 1] = y;
        pts[idx + 2] = z;
        filled += 1;
      }
    }

    // Fill any remaining points with random positions to avoid empty buffers
    while (filled < actualCount) {
      const idx = filled * 3;
      pts[idx] = (rand() - 0.5) * maxRadius * 2;
      pts[idx + 1] = (rand() - 0.5) * maxRadius * 2;
      pts[idx + 2] = (rand() - 0.5) * maxRadius * 2;
      filled += 1;
    }

    return { positions: pts, radius: maxRadius };
  }, [actualCount, seed]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.12;
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.1;
    groupRef.current.scale.setScalar(1 + 0.03 * Math.sin(t * 0.8));
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <pointsMaterial
          size={0.045}
          sizeAttenuation
          color={palette[0]}
          transparent
          opacity={0.75}
        />
      </points>
      <mesh>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial color={palette[2]} transparent opacity={0.06} wireframe />
      </mesh>
    </group>
  );
}

function SceneQuasicrystal({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 2.5, 3]} intensity={1.1} color={palette[1]} />
      <QuasicrystalField palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: 3D Spirograph (Epitrochoid)
// ---------------------------------------------------------------------------
function Spirograph3D({ palette, seed }: { palette: Palette; seed: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const rand = useMemo(() => seededRandom(seed), [seed]);

  // Generate multiple spirograph curves with different parameters
  const curves = useMemo(() => {
    const result: { geometry: THREE.BufferGeometry; color: string }[] = [];

    for (let c = 0; c < 4; c++) {
      const R = 1.0 + rand() * 0.5;
      const r = 0.3 + rand() * 0.4;
      const d = 0.5 + rand() * 0.8;
      const zFreq = 2 + Math.floor(rand() * 4);
      const zAmp = 0.3 + rand() * 0.5;
      const rotations = Math.floor(rand() * 5) + 3; // Full rotations for this curve

      const points: THREE.Vector3[] = [];
      const steps = 800;

      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2 * rotations;
        // Epitrochoid equations with z oscillation
        const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
        const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
        const z = zAmp * Math.sin(zFreq * t);
        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 600, 0.02, 8, false);
      result.push({ geometry, color: palette[c % palette.length] });
    }

    return result;
  }, [palette, rand]);

  const materials = useMemo(
    () => curves.map(c => new THREE.MeshStandardMaterial({
      color: c.color,
      emissive: c.color,
      emissiveIntensity: 0.8,
      metalness: 0.3,
      roughness: 0.4,
    })),
    [curves]
  );

  useEffect(() => {
    return () => {
      curves.forEach(c => c.geometry.dispose());
      materials.forEach(m => m.dispose());
    };
  }, [curves, materials]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    groupRef.current.rotation.z = Math.cos(t * 0.2) * 0.1;
  });

  return (
    <group ref={groupRef} scale={0.9}>
      {curves.map((c, i) => (
        <mesh key={i} geometry={c.geometry} material={materials[i]} />
      ))}
    </group>
  );
}

function SceneSpirograph({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 3]} intensity={1.2} color={palette[0]} />
      <Spirograph3D palette={palette} seed={seed} />
      <StarField density={250} color={palette[3]} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Phase-shear lattice (phase field + shear advection)
// ---------------------------------------------------------------------------
function PhaseShearField({ palette, seed, grid = 26 }: { palette: Palette; seed: number; grid?: number }) {
  const { quality } = useQuality();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());

  const size = Math.max(16, Math.floor(grid * Math.sqrt(quality.particleMultiplier)));
  const count = Math.min(size * size, quality.maxParticles);
  const points = useMemo(() => {
    const coords: Array<{ x: number; y: number; phase: number; spin: number; bias: number }> = [];
    const rand = seededRandom(seed);
    const half = (size - 1) / 2;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (coords.length >= count) break;
        const x = (i - half) / half;
        const y = (j - half) / half;
        coords.push({
          x,
          y,
          phase: rand() * Math.PI * 2,
          spin: (rand() - 0.5) * 1.4,
          bias: rand() * 2.0 - 1.0,
        });
      }
    }
    return coords;
  }, [size, count, seed]);

  const geom = useMemo(() => new THREE.SphereGeometry(0.035, scaleSegments(6, quality), scaleSegments(6, quality)), [quality]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: palette[0],
      emissive: palette[1],
      emissiveIntensity: 1.0,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.95,
    }),
    [palette],
  );

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const shear = Math.sin(t * 0.35) * 0.35;
    const dummy = dummyRef.current;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const phi1 = (p.x * 2.8 + p.y * 1.9) * 1.1 + t * 0.6 + p.phase;
      const phi2 = (p.x * -2.1 + p.y * 2.6) * 1.2 - t * 0.5 + p.spin;
      const phi3 = (p.x * 1.5 - p.y * 3.1) * 1.0 + t * 0.8 + p.phase * 0.5;
      const sx = Math.cos(phi1) + Math.cos(phi2) + Math.cos(phi3);
      const sy = Math.sin(phi1) + Math.sin(phi2) + Math.sin(phi3);
      const coherence = Math.min(1, Math.sqrt(sx * sx + sy * sy) / 3);
      const phase = Math.atan2(sy, sx);

      const drift = Math.sin(t * 0.3 + p.bias) * 0.08;
      const x = p.x + shear * p.y + drift;
      const y = p.y + Math.cos(t * 0.25 + p.spin) * 0.08 + Math.sin(t * 0.2 + p.phase) * 0.05;
      const z = Math.sin(phase + t * 0.6) * 0.25 + (coherence - 0.5) * 0.6;
      dummy.position.set(x * 1.6, y * 1.6, z);
      dummy.scale.setScalar(0.55 + coherence * 0.6 + 0.15 * Math.sin(phase + t));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geom, mat, points.length]} />;
}

function ScenePhaseShear({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2, 3]} intensity={1.2} color={palette[2]} />
      <PhaseShearField palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Orbital Möbius field (orbital sampler + Möbius drift)
// ---------------------------------------------------------------------------
function MobiusOrbitField({ palette, seed, count = 520 }: { palette: Palette; seed: number; count?: number }) {
  const { quality } = useQuality();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const actualCount = Math.min(scaleCount(count, quality), quality.maxParticles);
  const segments = scaleSegments(6, quality);

  const seeds = useMemo(() => {
    const rand = seededRandom(seed);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const ringCount = Math.max(4, Math.floor(6 * quality.geometryDetail));
    return Array.from({ length: actualCount }).map((_, i) => {
      const ring = Math.floor((i / actualCount) * ringCount);
      return {
        radius: 0.22 + ring * 0.12 + rand() * 0.06,
        angle: i * golden + rand() * 0.4,
        phase: rand() * Math.PI * 2,
        speed: 0.15 + rand() * 0.5,
        lift: 0.12 + rand() * 0.35,
        scale: 0.5 + rand() * 0.7,
      };
    });
  }, [actualCount, seed, quality.geometryDetail]);

  const geom = useMemo(() => new THREE.SphereGeometry(0.03, segments, segments), [segments]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: palette[1],
      emissive: palette[0],
      emissiveIntensity: 1.2,
      roughness: 0.28,
      metalness: 0.2,
      transparent: true,
      opacity: 0.95,
    }),
    [palette],
  );

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const aMag = 0.18 + 0.08 * Math.sin(t * 0.4);
    const aAng = t * 0.2;
    const ax = aMag * Math.cos(aAng);
    const ay = aMag * Math.sin(aAng);
    const dummy = dummyRef.current;

    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const theta = s.angle + t * s.speed;
      const r = s.radius * (0.85 + 0.2 * Math.sin(t * 0.7 + s.phase));
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);

      // Möbius transform on the unit disk: (z + a) / (1 + conj(a) z)
      const u = 1 + ax * x + ay * y;
      const v = ax * y - ay * x;
      const denom = u * u + v * v + 1e-6;
      const rx = ((x + ax) * u + (y + ay) * v) / denom;
      const ry = ((y + ay) * u - (x + ax) * v) / denom;
      const z = Math.sin(theta * 2 + t + s.phase) * s.lift;

      dummy.position.set(rx * 2.2, ry * 2.2, z);
      dummy.scale.setScalar(s.scale * (0.75 + 0.25 * Math.sin(theta + s.phase)));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geom, mat, actualCount]} />;
}

function SceneMobiusOrbit({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[2, 2, 3]} intensity={1.1} color={palette[0]} />
      <MobiusOrbitField palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Tensor morph lattice (structure-tensor inspired)
// ---------------------------------------------------------------------------
function TensorMorphLattice({ palette, seed, grid = 20 }: { palette: Palette; seed: number; grid?: number }) {
  const { quality } = useQuality();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const size = Math.max(12, Math.floor(grid * Math.sqrt(quality.particleMultiplier)));
  const count = Math.min(size * size, quality.maxParticles);
  const radialSegments = Math.max(4, Math.floor(6 * quality.geometryDetail));

  const points = useMemo(() => {
    const coords: Array<{ x: number; y: number; phase: number; bias: number }> = [];
    const rand = seededRandom(seed);
    const half = (size - 1) / 2;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (coords.length >= count) break;
        const x = (i - half) / half;
        const y = (j - half) / half;
        coords.push({
          x,
          y,
          phase: rand() * Math.PI * 2,
          bias: rand() * 2.0 - 1.0,
        });
      }
    }
    return coords;
  }, [size, count, seed]);

  const geom = useMemo(
    () => new THREE.CylinderGeometry(0.018, 0.018, 0.6, radialSegments, 1, true),
    [radialSegments],
  );
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: palette[2],
      emissive: palette[1],
      emissiveIntensity: 1.0,
      roughness: 0.3,
      metalness: 0.15,
      transparent: true,
      opacity: 0.95,
    }),
    [palette],
  );

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const shear = Math.sin(t * 0.25) * 0.22;
    const dummy = dummyRef.current;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const s1 = Math.sin(p.x * 2.6 + t * 0.35 + p.phase) + Math.cos(p.y * 2.2 - t * 0.3 + p.bias);
      const s2 = Math.cos(p.x * 1.8 - t * 0.4 + p.bias) - Math.sin(p.y * 2.7 + t * 0.25 + p.phase);
      const theta = Math.atan2(s2, s1);
      const coherence = Math.min(1, Math.hypot(s1, s2) * 0.35 + 0.15);

      const x = p.x + shear * p.y;
      const y = p.y + Math.sin(t * 0.3 + p.phase) * 0.08;
      const z = (coherence - 0.5) * 0.8 + Math.sin(theta + t * 0.4) * 0.15;
      const length = 0.35 + coherence * 0.7;

      dummy.position.set(x * 1.6, y * 1.6, z);
      dummy.scale.set(1, length, 1);
      dummy.rotation.set(Math.sin(p.bias + t * 0.2) * 0.25, 0, theta);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geom, mat, points.length]} />;
}

function SceneTensorMorph({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 2, 3]} intensity={1.1} color={palette[0]} />
      <TensorMorphLattice palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Hodge flow streamlines (curl + divergence-free hints)
// ---------------------------------------------------------------------------
function HodgeFlowStreamlines({ palette, seed, lines = 14, steps = 120 }: { palette: Palette; seed: number; lines?: number; steps?: number }) {
  const { quality } = useQuality();
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  const geometry = useMemo(() => {
    const rand = seededRandom(seed);
    const lineCount = Math.max(8, Math.floor(lines * quality.geometryDetail));
    const positions: number[] = [];
    const bound = 2.6;
    for (let l = 0; l < lineCount; l++) {
      let x = (rand() - 0.5) * bound * 2;
      let y = (rand() - 0.5) * bound * 2;
      let px = x;
      let py = y;
      let pz = 0;
      for (let s = 0; s < steps; s++) {
        const vx = -y + 0.6 * Math.sin(y * 1.3 + seed * 0.01 + l);
        const vy = x + 0.6 * Math.cos(x * 1.1 - seed * 0.02 - l);
        const speed = Math.sqrt(vx * vx + vy * vy) + 0.001;
        x += (vx / speed) * 0.08;
        y += (vy / speed) * 0.08;
        const z = Math.sin((x * x + y * y) * 0.8 + l) * 0.25;
        positions.push(px, py, pz, x, y, z);
        px = x;
        py = y;
        pz = z;
        if (x * x + y * y > bound * bound) {
          x *= 0.4;
          y *= 0.4;
          px = x;
          py = y;
          pz = z;
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [lines, steps, seed, quality.geometryDetail]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
      groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.12;
      groupRef.current.rotation.z = Math.cos(t * 0.2) * 0.08;
    }
    if (materialRef.current) {
      materialRef.current.opacity = 0.45 + Math.sin(t * 0.6) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial
          ref={materialRef}
          color={palette[3]}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

function SceneHodgeFlow({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[2, 2, 3]} intensity={1.1} color={palette[1]} />
      <HodgeFlowStreamlines palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Transport bridge (entropic transport / bridge dynamics)
// ---------------------------------------------------------------------------
function TransportBridge({ palette, seed, count = 320 }: { palette: Palette; seed: number; count?: number }) {
  const { quality } = useQuality();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const actualCount = Math.min(scaleCount(count, quality), quality.maxParticles);
  const segments = scaleSegments(6, quality);

  const seeds = useMemo(() => {
    const rand = seededRandom(seed);
    return Array.from({ length: actualCount }).map(() => ({
      u: rand(),
      speed: 0.25 + rand() * 0.6,
      phase: rand() * Math.PI * 2,
      radius: 0.06 + rand() * 0.16,
      scale: 0.5 + rand() * 0.6,
    }));
  }, [actualCount, seed]);

  const geom = useMemo(() => new THREE.SphereGeometry(0.035, segments, segments), [segments]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: palette[0],
      emissive: palette[2],
      emissiveIntensity: 1.0,
      roughness: 0.32,
      metalness: 0.12,
      transparent: true,
      opacity: 0.95,
    }),
    [palette],
  );

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const ax = -1.6;
    const ay = 0.0;
    const az = 0.2;
    const bx = 1.6;
    const by = 0.0;
    const bz = -0.2;
    const c1x = -0.6;
    const c1y = 0.9 * Math.sin(t * 0.4);
    const c1z = 0.6 * Math.cos(t * 0.3);
    const c2x = 0.6;
    const c2y = -0.9 * Math.sin(t * 0.42);
    const c2z = -0.6 * Math.cos(t * 0.28);

    const dummy = dummyRef.current;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const u = (s.u + t * 0.08 * s.speed) % 1;
      const inv = 1 - u;
      const b0 = inv * inv * inv;
      const b1 = 3 * inv * inv * u;
      const b2 = 3 * inv * u * u;
      const b3 = u * u * u;
      const px = b0 * ax + b1 * c1x + b2 * c2x + b3 * bx;
      const py = b0 * ay + b1 * c1y + b2 * c2y + b3 * by;
      const pz = b0 * az + b1 * c1z + b2 * c2z + b3 * bz;

      const wobble = Math.sin(u * Math.PI * 2 + s.phase + t) * s.radius;
      const nx = Math.cos(s.phase + t * 0.3);
      const ny = Math.sin(s.phase + t * 0.3);
      const x = px + nx * wobble;
      const y = py + ny * wobble;
      const z = pz + Math.cos(u * Math.PI * 2 + s.phase) * s.radius * 0.6;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(s.scale * (0.7 + 0.3 * Math.sin(u * Math.PI * 2 + t)));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geom, mat, actualCount]} />;
}

function SceneTransportBridge({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 2, 3]} intensity={1.0} color={palette[1]} />
      <TransportBridge palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Torus-knot lattice (topology + orbital swarm)
// ---------------------------------------------------------------------------
function TorusKnotLattice({ palette, seed, loops = 3 }: { palette: Palette; seed: number; loops?: number }) {
  const { quality } = useQuality();
  const groupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const rand = useMemo(() => seededRandom(seed), [seed]);

  const curve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = Math.max(220, Math.floor(320 * quality.geometryDetail));
    const p = 2 + Math.floor(rand() * 2);
    const q = 3 + Math.floor(rand() * 2);
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2 * loops;
      const r = 1.1 + 0.25 * Math.cos(q * t);
      const x = r * Math.cos(p * t);
      const y = r * Math.sin(p * t);
      const z = 0.5 * Math.sin(q * t);
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points, true);
  }, [quality.geometryDetail, rand, loops]);

  const tubeSegments = Math.max(200, Math.floor(320 * quality.geometryDetail));
  const tubeRadius = 0.05 + 0.02 * quality.geometryDetail;
  const tubeGeometry = useMemo(() => new THREE.TubeGeometry(curve, tubeSegments, tubeRadius, scaleSegments(10, quality), true), [curve, tubeSegments, tubeRadius, quality]);
  const tubeMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 0.9, roughness: 0.3, metalness: 0.4 }),
    [palette],
  );

  const orbitCount = Math.max(24, Math.floor(140 * quality.particleMultiplier));
  const orbitGeom = useMemo(() => new THREE.SphereGeometry(0.035, scaleSegments(6, quality), scaleSegments(6, quality)), [quality]);
  const orbitMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[2], emissive: palette[3], emissiveIntensity: 1.1, roughness: 0.35 }),
    [palette],
  );
  const orbitSeeds = useMemo(() => {
    const rand = seededRandom(seed + 71);
    return Array.from({ length: orbitCount }).map(() => ({
      offset: rand(),
      speed: 0.2 + rand() * 0.7,
      phase: rand() * Math.PI * 2,
      scale: 0.5 + rand() * 0.6,
    }));
  }, [orbitCount, seed]);

  const orbitPoints = useMemo(() => {
    const total = 420;
    return Array.from({ length: total }, (_, i) => curve.getPointAt(i / total));
  }, [curve]);

  useEffect(() => () => tubeGeometry.dispose(), [tubeGeometry]);
  useEffect(() => () => tubeMaterial.dispose(), [tubeMaterial]);
  useEffect(() => () => orbitGeom.dispose(), [orbitGeom]);
  useEffect(() => () => orbitMat.dispose(), [orbitMat]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.18;
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.2;

    if (orbitRef.current) {
      const dummy = dummyRef.current;
      const total = orbitPoints.length;
      for (let i = 0; i < orbitSeeds.length; i++) {
        const seed = orbitSeeds[i];
        const idx = Math.floor((seed.offset + t * seed.speed) * total) % total;
        const p = orbitPoints[idx];
        dummy.position.set(p.x, p.y, p.z + 0.08 * Math.sin(t * 1.6 + seed.phase));
        dummy.scale.setScalar(seed.scale * (0.8 + 0.2 * Math.sin(t * 1.4 + seed.phase)));
        dummy.updateMatrix();
        orbitRef.current.setMatrixAt(i, dummy.matrix);
      }
      orbitRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={tubeGeometry} material={tubeMaterial} />
      <instancedMesh ref={orbitRef} args={[orbitGeom, orbitMat, orbitCount]} />
    </group>
  );
}

function SceneTorusKnot({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 3]} intensity={1.2} color={palette[2]} />
      <pointLight position={[-2, -2, 2]} intensity={0.8} color={palette[0]} />
      <TorusKnotLattice palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Phyllotaxis Fibonacci Sphere (sunflower seed pattern)
// ---------------------------------------------------------------------------
function PhyllotaxisSphere({ palette, seed: _, count = 800 }: { palette: Palette; seed: number; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const { quality } = useQuality();
  const actualCount = scaleCount(count, quality);
  const geom = useMemo(() => new THREE.DodecahedronGeometry(0.06, 0), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 0.7, metalness: 0.4, roughness: 0.3 }),
    [palette]
  );

  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const dummy = dummyRef.current;

    for (let i = 0; i < actualCount; i++) {
      // Fibonacci sphere distribution
      const theta = i * goldenAngle + t * 0.2;
      const y = 1 - (i / (actualCount - 1)) * 2; // -1 to 1
      const radius = Math.sqrt(1 - y * y);

      // Animated pulsing radius
      const pulseRadius = 1.8 + 0.2 * Math.sin(t * 1.5 + i * 0.02);

      const x = Math.cos(theta) * radius * pulseRadius;
      const z = Math.sin(theta) * radius * pulseRadius;

      dummy.position.set(x, y * pulseRadius, z);
      dummy.lookAt(0, 0, 0);

      // Size varies based on position
      const scale = 0.6 + 0.5 * Math.sin(t * 2 + i * 0.05);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.rotation.y = t * 0.1;
  });

  return <instancedMesh ref={meshRef} args={[geom, mat, actualCount]} />;
}

function ScenePhyllotaxis({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3, 3]} intensity={1.3} color={palette[2]} />
      <pointLight position={[0, -3, -3]} intensity={0.7} color={palette[0]} />
      <PhyllotaxisSphere palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Aizawa Attractor (beautiful strange attractor)
// ---------------------------------------------------------------------------
function AizawaAttractor({ palette, seed: _ }: { palette: Palette; seed: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    let x = 0.1, y = 0, z = 0;
    const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1;
    const dt = 0.005;

    for (let i = 0; i < 25000; i++) {
      const dx = ((z - b) * x - d * y) * dt;
      const dy = (d * x + (z - b) * y) * dt;
      const dz = (c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x) * dt;
      x += dx;
      y += dy;
      z += dz;
      if (i % 2 === 0) {
        points.push(new THREE.Vector3(x * 0.8, y * 0.8, z * 0.8));
      }
    }

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, []);

  const material = useMemo(() => makeLineMaterial(palette[1], 0.85), [palette]);

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.3;
    // eslint-disable-next-line react-hooks/immutability
    material.opacity = 0.7 + Math.sin(t * 0.8) * 0.2;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry} material={material} />
    </group>
  );
}

function SceneAizawa({ palette, seed: _ }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 3, 3]} intensity={1.2} color={palette[0]} />
      <AizawaAttractor palette={palette} seed={0} />
      <StarField density={300} color={palette[2]} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Rössler attractor with embers
// ---------------------------------------------------------------------------
function RosslerAttractor({ palette, seed, count = 18000 }: { palette: Palette; seed: number; count?: number }) {
  const { quality, tier } = useQuality();
  const groupRef = useRef<THREE.Group>(null);
  const emberRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const actualCount = useMemo(() => {
    if (tier === "high") return count;
    if (tier === "medium") return Math.max(12000, Math.floor(count * 0.7));
    return Math.max(8000, Math.floor(count * 0.45));
  }, [count, tier]);

  const positions = useMemo(() => {
    const pts = new Float32Array(actualCount * 3);
    let x = 0.1, y = 0, z = 0;
    const a = 0.2, b = 0.2, c = 5.7;
    const dt = 0.01;
    for (let i = 0; i < actualCount; i++) {
      const dx = (-y - z) * dt;
      const dy = (x + a * y) * dt;
      const dz = (b + z * (x - c)) * dt;
      x += dx;
      y += dy;
      z += dz;
      const idx = i * 3;
      pts[idx] = x * 0.18;
      pts[idx + 1] = y * 0.18;
      pts[idx + 2] = z * 0.18;
    }
    return pts;
  }, [actualCount]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const emberCount = Math.max(18, Math.floor(120 * quality.particleMultiplier));
  const emberGeom = useMemo(() => new THREE.SphereGeometry(0.04, scaleSegments(6, quality), scaleSegments(6, quality)), [quality]);
  const emberMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[2], emissiveIntensity: 1.1, roughness: 0.35 }),
    [palette],
  );
  const pointCount = Math.max(1, positions.length / 3);
  const emberSeeds = useMemo(() => {
    const rand = seededRandom(seed + 42);
    return Array.from({ length: emberCount }).map(() => ({
      idx: Math.floor(rand() * pointCount),
      speed: 0.25 + rand() * 0.9,
      phase: rand() * Math.PI * 2,
      scale: 0.5 + rand() * 0.8,
    }));
  }, [emberCount, seed, pointCount]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => emberGeom.dispose(), [emberGeom]);
  useEffect(() => () => emberMat.dispose(), [emberMat]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.12;
    groupRef.current.rotation.x = Math.sin(t * 0.35) * 0.2;
    if (materialRef.current) {
      materialRef.current.opacity = 0.6 + Math.sin(t * 0.8) * 0.2;
    }

    if (emberRef.current) {
      const dummy = dummyRef.current;
      for (let i = 0; i < emberSeeds.length; i++) {
        const ember = emberSeeds[i];
        const advance = Math.floor((t * 60 * ember.speed) % pointCount);
        const idx = (ember.idx + advance) % pointCount;
        const px = positions[idx * 3];
        const py = positions[idx * 3 + 1];
        const pz = positions[idx * 3 + 2];
        const wobble = 0.06 * Math.sin(t * 1.5 + ember.phase);
        dummy.position.set(px + wobble, py - wobble * 0.4, pz + wobble * 0.3);
        dummy.scale.setScalar(ember.scale * (0.8 + 0.2 * Math.sin(t * 1.4 + ember.phase)));
        dummy.updateMatrix();
        emberRef.current.setMatrixAt(i, dummy.matrix);
      }
      emberRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial
          ref={materialRef}
          color={palette[1]}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      <instancedMesh ref={emberRef} args={[emberGeom, emberMat, emberCount]} />
    </group>
  );
}

function SceneRossler({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 3]} intensity={1.1} color={palette[0]} />
      <RosslerAttractor palette={palette} seed={seed} />
      <StarField density={280} color={palette[3]} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Reaction-Diffusion Impostor (low-res mesh sim)
// ---------------------------------------------------------------------------
function ReactionDiffusionImpostor({ palette, seed, size = 34 }: { palette: Palette; seed: number; size?: number }) {
  const { quality } = useQuality();
  const groupRef = useRef<THREE.Group>(null);
  const grid = Math.max(24, Math.floor(size * quality.geometryDetail));
  const total = grid * grid;

  const uRef = useRef<Float32Array | null>(null);
  const vRef = useRef<Float32Array | null>(null);
  const uNextRef = useRef<Float32Array | null>(null);
  const vNextRef = useRef<Float32Array | null>(null);

  if (!uRef.current || uRef.current.length !== total) {
    const rand = seededRandom(seed);
    const u = new Float32Array(total);
    const v = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      u[i] = 1;
      v[i] = 0;
    }
    // Seed a few random hotspots
    for (let k = 0; k < 6; k++) {
      const cx = Math.floor(rand() * grid);
      const cy = Math.floor(rand() * grid);
      const radius = 3 + Math.floor(rand() * 4);
      for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
          const nx = (cx + x + grid) % grid;
          const ny = (cy + y + grid) % grid;
          const idx = nx + ny * grid;
          u[idx] = 0.4 + rand() * 0.3;
          v[idx] = 0.5 + rand() * 0.4;
        }
      }
    }
    uRef.current = u;
    vRef.current = v;
    uNextRef.current = new Float32Array(total);
    vNextRef.current = new Float32Array(total);
  }

  const geometry = useMemo(() => new THREE.PlaneGeometry(3.1, 3.1, grid - 1, grid - 1), [grid]);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 0.7, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide }),
    [palette],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    const u = uRef.current!;
    const v = vRef.current!;
    const uNext = uNextRef.current!;
    const vNext = vNextRef.current!;

    const feed = 0.034;
    const kill = 0.061;
    const du = 0.2;
    const dv = 0.1;
    const dt = 1.0;

    // Two lightweight iterations per frame for smoother motion
    for (let iter = 0; iter < 2; iter++) {
      for (let y = 0; y < grid; y++) {
        const yPrev = (y - 1 + grid) % grid;
        const yNext = (y + 1) % grid;
        for (let x = 0; x < grid; x++) {
          const xPrev = (x - 1 + grid) % grid;
          const xNext = (x + 1) % grid;
          const idx = x + y * grid;

          const up = u[x + yPrev * grid];
          const down = u[x + yNext * grid];
          const left = u[xPrev + y * grid];
          const right = u[xNext + y * grid];
          const lapU = up + down + left + right - 4 * u[idx];

          const upV = v[x + yPrev * grid];
          const downV = v[x + yNext * grid];
          const leftV = v[xPrev + y * grid];
          const rightV = v[xNext + y * grid];
          const lapV = upV + downV + leftV + rightV - 4 * v[idx];

          const uvv = u[idx] * v[idx] * v[idx];
          uNext[idx] = u[idx] + (du * lapU - uvv + feed * (1 - u[idx])) * dt;
          vNext[idx] = v[idx] + (dv * lapV + uvv - (kill + feed) * v[idx]) * dt;
        }
      }
      // swap buffers
      u.set(uNext);
      v.set(vNext);
    }

    // Update mesh z displacement
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < total; i++) {
      const height = (u[i] - v[i]) * 0.35;
      pos.setZ(i, height);
    }
    // eslint-disable-next-line react-hooks/immutability
    pos.needsUpdate = true;
    geometry.computeVertexNormals();

    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.rotation.x = -Math.PI / 2.5;
      groupRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} material={material} />
    </group>
  );
}

function SceneReactionImpostor({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} color={palette[2]} />
      <ReactionDiffusionImpostor palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Fibration lattice (Hopf + geodesic arcs)
// ---------------------------------------------------------------------------
function FibrationLattice({ palette, seed, loops = 16, segments = 80 }: { palette: Palette; seed: number; loops?: number; segments?: number }) {
  const { quality } = useQuality();
  const groupRef = useRef<THREE.Group>(null);
  const beadsRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());

  const loopPoints = useMemo(() => {
    const rand = seededRandom(seed);
    const rings: THREE.Vector3[][] = [];
    for (let i = 0; i < loops; i++) {
      const radius = 1.1 + rand() * 0.6;
      const tilt = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI),
      );
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= segments; j++) {
        const t = (j / segments) * Math.PI * 2;
        const p = new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0);
        p.applyQuaternion(tilt);
        pts.push(p);
      }
      rings.push(pts);
    }
    return rings;
  }, [loops, segments, seed]);

  const lineGeometry = useMemo(() => {
    const positions: number[] = [];
    loopPoints.forEach((ring) => {
      for (let i = 0; i < ring.length - 1; i++) {
        const a = ring[i];
        const b = ring[i + 1];
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [loopPoints]);

  const lineMaterial = useMemo(() => makeLineMaterial(palette[1], 0.68), [palette]);

  const arcGeometry = useMemo(() => {
    const rand = seededRandom(seed + 37);
    const positions: number[] = [];
    const arcCount = Math.max(8, Math.floor(12 * quality.geometryDetail));
    for (let i = 0; i < arcCount; i++) {
      const a0 = rand() * Math.PI * 2;
      const a1 = a0 + (0.5 + rand() * 0.8) * Math.PI;
      const lift = 0.4 + rand() * 0.3;
      const radius = 1.6 + rand() * 0.4;
      const steps = 36;
      for (let s = 0; s < steps; s++) {
        const t0 = s / steps;
        const t1 = (s + 1) / steps;
        const ang0 = a0 + (a1 - a0) * t0;
        const ang1 = a0 + (a1 - a0) * t1;
        positions.push(
          Math.cos(ang0) * radius, Math.sin(ang0) * radius, Math.sin(t0 * Math.PI) * lift,
          Math.cos(ang1) * radius, Math.sin(ang1) * radius, Math.sin(t1 * Math.PI) * lift,
        );
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [seed, quality.geometryDetail]);

  const arcMaterial = useMemo(() => makeLineMaterial(palette[3], 0.42), [palette]);

  const beadCount = Math.max(16, Math.floor(90 * quality.particleMultiplier));
  const beadGeom = useMemo(() => new THREE.SphereGeometry(0.045, scaleSegments(6, quality), scaleSegments(6, quality)), [quality]);
  const beadMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[2], emissiveIntensity: 1.1, roughness: 0.3 }),
    [palette],
  );
  const beadSeeds = useMemo(() => {
    const rand = seededRandom(seed + 93);
    return Array.from({ length: beadCount }).map(() => ({
      ring: Math.floor(rand() * loopPoints.length),
      offset: rand(),
      speed: 0.2 + rand() * 0.6,
      phase: rand() * Math.PI * 2,
      scale: 0.5 + rand() * 0.7,
    }));
  }, [beadCount, seed, loopPoints.length]);

  useEffect(() => () => lineGeometry.dispose(), [lineGeometry]);
  useEffect(() => () => lineMaterial.dispose(), [lineMaterial]);
  useEffect(() => () => arcGeometry.dispose(), [arcGeometry]);
  useEffect(() => () => arcMaterial.dispose(), [arcMaterial]);
  useEffect(() => () => beadGeom.dispose(), [beadGeom]);
  useEffect(() => () => beadMat.dispose(), [beadMat]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.12;
    groupRef.current.rotation.x = Math.sin(t * 0.35) * 0.18;

    if (beadsRef.current) {
      const dummy = dummyRef.current;
      for (let i = 0; i < beadSeeds.length; i++) {
        const seed = beadSeeds[i];
        const ring = loopPoints[seed.ring % loopPoints.length];
        const idx = Math.floor(((seed.offset + t * seed.speed) % 1) * (ring.length - 1));
        const p = ring[idx];
        dummy.position.set(p.x, p.y, p.z + 0.08 * Math.sin(t * 1.4 + seed.phase));
        dummy.scale.setScalar(seed.scale * (0.8 + 0.2 * Math.sin(t * 1.3 + seed.phase)));
        dummy.updateMatrix();
        beadsRef.current.setMatrixAt(i, dummy.matrix);
      }
      beadsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry} material={lineMaterial} />
      <lineSegments geometry={arcGeometry} material={arcMaterial} />
      <instancedMesh ref={beadsRef} args={[beadGeom, beadMat, beadCount]} />
    </group>
  );
}

function SceneFibration({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 3, 3]} intensity={1.1} color={palette[0]} />
      <directionalLight position={[-2, -3, 3]} intensity={0.9} color={palette[2]} />
      <FibrationLattice palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Filigree orbitals (quasi-fractal epicycles)
// ---------------------------------------------------------------------------
function FiligreeOrbitals({ palette, seed, count = 260 }: { palette: Palette; seed: number; count?: number }) {
  const { quality } = useQuality();
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const actualCount = Math.max(40, Math.floor(count * quality.particleMultiplier));

  const seeds = useMemo(() => {
    const rand = seededRandom(seed);
    return Array.from({ length: actualCount }).map(() => ({
      a: 0.6 + rand() * 1.6,
      b: 0.6 + rand() * 1.8,
      c: 0.4 + rand() * 1.4,
      d: 1.2 + rand() * 2.4,
      phase: rand() * Math.PI * 2,
      phase2: rand() * Math.PI * 2,
      radius: 1.1 + rand() * 0.8,
      lift: 0.2 + rand() * 0.5,
      scale: 0.5 + rand() * 0.6,
    }));
  }, [actualCount, seed]);

  const geom = useMemo(() => new THREE.SphereGeometry(0.035, scaleSegments(6, quality), scaleSegments(6, quality)), [quality]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 1.0, roughness: 0.35 }),
    [palette],
  );

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.12;
    const dummy = dummyRef.current;

    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const tt = t * 0.6 + s.phase;
      const x = (Math.cos(s.a * tt) + 0.35 * Math.cos(s.d * tt + s.phase2)) * s.radius;
      const y = (Math.sin(s.b * tt) + 0.35 * Math.sin(s.d * tt + s.phase2)) * s.radius;
      const z = Math.sin(s.c * tt + s.phase2) * s.lift + 0.15 * Math.sin(tt * 2.1);
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(s.scale * (0.8 + 0.2 * Math.sin(tt + s.phase2)));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[geom, mat, actualCount]} />
    </group>
  );
}

function SceneFiligree({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[2, 2, 3]} intensity={1.1} color={palette[2]} />
      <FiligreeOrbitals palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Lemniscate weave (figure-eight orbitals)
// ---------------------------------------------------------------------------
function LemniscateWeave({ palette, seed, count = 180 }: { palette: Palette; seed: number; count?: number }) {
  const { quality } = useQuality();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const actualCount = Math.max(24, Math.floor(count * quality.particleMultiplier));

  const seeds = useMemo(() => {
    const rand = seededRandom(seed);
    return Array.from({ length: actualCount }).map(() => ({
      phase: rand() * Math.PI * 2,
      speed: 0.25 + rand() * 0.7,
      scale: 0.5 + rand() * 0.7,
      a: 0.9 + rand() * 0.8,
      lift: 0.15 + rand() * 0.35,
    }));
  }, [actualCount, seed]);

  const geom = useMemo(() => new THREE.SphereGeometry(0.035, scaleSegments(6, quality), scaleSegments(6, quality)), [quality]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 1.0, roughness: 0.35 }),
    [palette],
  );

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const dummy = dummyRef.current;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const tt = t * s.speed + s.phase;
      const denom = 1 + Math.sin(tt) * Math.sin(tt);
      const x = (s.a * Math.cos(tt)) / denom;
      const y = (s.a * Math.sin(tt) * Math.cos(tt)) / denom;
      const z = Math.sin(tt * 2) * s.lift;
      dummy.position.set(x * 1.6, y * 1.6, z);
      dummy.scale.setScalar(s.scale * (0.8 + 0.2 * Math.sin(tt)));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geom, mat, actualCount]} />;
}

function SceneLemniscate({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[2, 2, 3]} intensity={1.1} color={palette[2]} />
      <LemniscateWeave palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Logarithmic spiral field
// ---------------------------------------------------------------------------
function LogSpiralField({ palette, seed, spirals = 5 }: { palette: Palette; seed: number; spirals?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const rand = useMemo(() => seededRandom(seed), [seed]);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const steps = 200;
    for (let s = 0; s < spirals; s++) {
      const a = 0.12 + rand() * 0.18;
      const b = 0.18 + rand() * 0.12;
      const phase = rand() * Math.PI * 2;
      const tilt = (rand() - 0.5) * 0.6;
      for (let i = 0; i < steps; i++) {
        const t0 = (i / steps) * Math.PI * 4;
        const t1 = ((i + 1) / steps) * Math.PI * 4;
        const r0 = a * Math.exp(b * t0);
        const r1 = a * Math.exp(b * t1);
        const x0 = Math.cos(t0 + phase) * r0;
        const y0 = Math.sin(t0 + phase) * r0;
        const x1 = Math.cos(t1 + phase) * r1;
        const y1 = Math.sin(t1 + phase) * r1;
        const z0 = Math.sin(t0 * 0.5 + phase) * tilt;
        const z1 = Math.sin(t1 * 0.5 + phase) * tilt;
        positions.push(x0, y0, z0, x1, y1, z1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [rand, spirals]);

  const material = useMemo(() => makeLineMaterial(palette[1], 0.72), [palette]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.z = t * 0.08;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry} material={material} />
    </group>
  );
}

function SceneLogSpiral({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 3]} intensity={1.1} color={palette[0]} />
      <LogSpiralField palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Epicycle rosettes
// ---------------------------------------------------------------------------
function EpicycleRosettes({ palette, seed, curves = 4 }: { palette: Palette; seed: number; curves?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const rand = useMemo(() => seededRandom(seed), [seed]);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const steps = 240;
    for (let c = 0; c < curves; c++) {
      const R = 1.2 + rand() * 0.6;
      const r = 0.3 + rand() * 0.5;
      const d = 0.4 + rand() * 0.6;
      const phase = rand() * Math.PI * 2;
      for (let i = 0; i < steps; i++) {
        const t0 = (i / steps) * Math.PI * 2 * 3;
        const t1 = ((i + 1) / steps) * Math.PI * 2 * 3;
        const x0 = (R + r) * Math.cos(t0 + phase) - d * Math.cos(((R + r) / r) * t0 + phase);
        const y0 = (R + r) * Math.sin(t0 + phase) - d * Math.sin(((R + r) / r) * t0 + phase);
        const x1 = (R + r) * Math.cos(t1 + phase) - d * Math.cos(((R + r) / r) * t1 + phase);
        const y1 = (R + r) * Math.sin(t1 + phase) - d * Math.sin(((R + r) / r) * t1 + phase);
        const z0 = Math.sin(t0 * 0.3 + phase) * 0.3;
        const z1 = Math.sin(t1 * 0.3 + phase) * 0.3;
        positions.push(x0, y0, z0, x1, y1, z1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [curves, rand]);

  const material = useMemo(() => makeLineMaterial(palette[2], 0.7), [palette]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.1;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry} material={material} />
    </group>
  );
}

function SceneEpicycle({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 3]} intensity={1.1} color={palette[1]} />
      <EpicycleRosettes palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Vortex grid (sheared wave lattice)
// ---------------------------------------------------------------------------
function VortexGrid({ palette, seed, size = 24 }: { palette: Palette; seed: number; size?: number }) {
  const { quality } = useQuality();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const grid = Math.max(16, Math.floor(size * Math.sqrt(quality.particleMultiplier)));

  const points = useMemo(() => {
    const coords: Array<{ x: number; y: number; phase: number }> = [];
    const rand = seededRandom(seed);
    const half = (grid - 1) / 2;
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        coords.push({
          x: (i - half) / half,
          y: (j - half) / half,
          phase: rand() * Math.PI * 2,
        });
      }
    }
    return coords;
  }, [grid, seed]);

  const geom = useMemo(() => new THREE.SphereGeometry(0.03, scaleSegments(6, quality), scaleSegments(6, quality)), [quality]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 0.8, roughness: 0.35 }),
    [palette],
  );

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const dummy = dummyRef.current;
    const shear = Math.sin(t * 0.4) * 0.25;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const wave = Math.sin((p.x + p.y) * 3.0 + t + p.phase) + Math.cos((p.x - p.y) * 2.6 - t);
      const x = p.x + shear * p.y;
      const y = p.y + Math.cos(t * 0.3 + p.phase) * 0.06;
      const z = wave * 0.12;
      dummy.position.set(x * 1.6, y * 1.6, z);
      dummy.scale.setScalar(0.7 + 0.2 * Math.sin(t + p.phase));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geom, mat, points.length]} />;
}

function SceneVortexGrid({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2, 3]} intensity={1.1} color={palette[2]} />
      <VortexGrid palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Orbital swarm (elliptical mechanics)
// ---------------------------------------------------------------------------
function OrbitalSwarm({ palette, seed, count = 140 }: { palette: Palette; seed: number; count?: number }) {
  const { quality } = useQuality();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const actualCount = Math.max(20, Math.floor(count * quality.particleMultiplier));

  const seeds = useMemo(() => {
    const rand = seededRandom(seed);
    return Array.from({ length: actualCount }).map(() => ({
      a: 1.2 + rand() * 1.2,
      e: rand() * 0.35,
      inc: rand() * Math.PI * 0.6,
      node: rand() * Math.PI * 2,
      phase: rand() * Math.PI * 2,
      speed: 0.25 + rand() * 0.6,
      scale: 0.5 + rand() * 0.6,
    }));
  }, [actualCount, seed]);

  const geom = useMemo(() => new THREE.SphereGeometry(0.035, scaleSegments(6, quality), scaleSegments(6, quality)), [quality]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 0.9, roughness: 0.35 }),
    [palette],
  );

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const dummy = dummyRef.current;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const theta = t * s.speed + s.phase;
      const r = (s.a * (1 - s.e * s.e)) / (1 + s.e * Math.cos(theta));
      const xOrb = r * Math.cos(theta);
      const yOrb = r * Math.sin(theta);

      const cosNode = Math.cos(s.node);
      const sinNode = Math.sin(s.node);
      const cosInc = Math.cos(s.inc);
      const sinInc = Math.sin(s.inc);
      const x = xOrb * cosNode - yOrb * sinNode * cosInc;
      const y = xOrb * sinNode + yOrb * cosNode * cosInc;
      const z = yOrb * sinInc;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(s.scale * (0.85 + 0.15 * Math.sin(theta + s.phase)));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geom, mat, actualCount]} />;
}

function SceneOrbitals({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[2, 2, 3]} intensity={1.1} color={palette[2]} />
      <OrbitalSwarm palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Torus phyllotaxis
// ---------------------------------------------------------------------------
function TorusPhyllotaxis({ palette, seed, count = 700 }: { palette: Palette; seed: number; count?: number }) {
  const { quality } = useQuality();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const actualCount = Math.min(scaleCount(count, quality), quality.maxParticles);
  const golden = Math.PI * (3 - Math.sqrt(5));

  const points = useMemo(() => {
    const rand = seededRandom(seed);
    const R = 1.4 + rand() * 0.2;
    const r = 0.35 + rand() * 0.15;
    return { R, r };
  }, [seed]);

  const geom = useMemo(() => new THREE.SphereGeometry(0.03, scaleSegments(6, quality), scaleSegments(6, quality)), [quality]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[1], emissive: palette[2], emissiveIntensity: 0.9, roughness: 0.35 }),
    [palette],
  );

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const dummy = dummyRef.current;
    for (let i = 0; i < actualCount; i++) {
      const u = i * golden + t * 0.12;
      const v = (i / actualCount) * Math.PI * 2 + t * 0.05;
      const x = (points.R + points.r * Math.cos(v)) * Math.cos(u);
      const y = (points.R + points.r * Math.cos(v)) * Math.sin(u);
      const z = points.r * Math.sin(v);
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.6 + 0.3 * Math.sin(u + v));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geom, mat, actualCount]} />;
}

function SceneTorusPhyllo({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 2, 3]} intensity={1.1} color={palette[0]} />
      <TorusPhyllotaxis palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Sine weave ribbons
// ---------------------------------------------------------------------------
function SineWeave({ palette, seed, bands = 6 }: { palette: Palette; seed: number; bands?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const rand = useMemo(() => seededRandom(seed), [seed]);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const steps = 120;
    for (let b = 0; b < bands; b++) {
      const offset = (b - (bands - 1) / 2) * 0.35;
      const phase = rand() * Math.PI * 2;
      for (let i = 0; i < steps; i++) {
        const t0 = (i / steps) * 3.2 - 1.6;
        const t1 = ((i + 1) / steps) * 3.2 - 1.6;
        const y0 = Math.sin(t0 * 2 + phase + offset) * 0.4 + offset;
        const y1 = Math.sin(t1 * 2 + phase + offset) * 0.4 + offset;
        const z0 = Math.cos(t0 * 1.4 + phase) * 0.25;
        const z1 = Math.cos(t1 * 1.4 + phase) * 0.25;
        positions.push(t0 * 1.2, y0, z0, t1 * 1.2, y1, z1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [bands, rand]);

  const material = useMemo(() => makeLineMaterial(palette[2], 0.62), [palette]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.12;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.12;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry} material={material} />
    </group>
  );
}

function SceneSineWeave({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 3]} intensity={1.0} color={palette[1]} />
      <SineWeave palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Harmonic ribbons (latitude waves)
// ---------------------------------------------------------------------------
function HarmonicRibbons({ palette, seed, rings = 7 }: { palette: Palette; seed: number; rings?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const rand = useMemo(() => seededRandom(seed), [seed]);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const steps = 160;
    const ringCount = Math.max(2, rings);
    for (let r = 0; r < ringCount; r++) {
      const lat = (r / (ringCount - 1) - 0.5) * Math.PI * 0.8;
      const phase = rand() * Math.PI * 2;
      const amp = 0.15 + rand() * 0.2;
      for (let i = 0; i < steps; i++) {
        const t0 = (i / steps) * Math.PI * 2;
        const t1 = ((i + 1) / steps) * Math.PI * 2;
        const radius0 = 1.6 + amp * Math.sin(t0 * 3 + phase);
        const radius1 = 1.6 + amp * Math.sin(t1 * 3 + phase);
        const x0 = Math.cos(t0) * radius0;
        const y0 = Math.sin(lat) * 1.2;
        const z0 = Math.sin(t0) * radius0;
        const x1 = Math.cos(t1) * radius1;
        const y1 = Math.sin(lat) * 1.2;
        const z1 = Math.sin(t1) * radius1;
        positions.push(x0, y0, z0, x1, y1, z1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [rings, rand]);

  const material = useMemo(() => makeLineMaterial(palette[3], 0.62), [palette]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.1;
    groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry} material={material} />
    </group>
  );
}

function SceneHarmonicRibbons({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 3]} intensity={1.0} color={palette[0]} />
      <HarmonicRibbons palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: De Jong point cloud
// ---------------------------------------------------------------------------
function DeJongCloud({ palette, seed, count = 18000 }: { palette: Palette; seed: number; count?: number }) {
  const { tier } = useQuality();
  const groupRef = useRef<THREE.Group>(null);
  const actualCount = useMemo(() => {
    if (tier === "high") return count;
    if (tier === "medium") return Math.max(12000, Math.floor(count * 0.7));
    return Math.max(8000, Math.floor(count * 0.45));
  }, [count, tier]);

  const geometry = useMemo(() => {
    const rand = seededRandom(seed);
    const a = -2 + rand() * 4;
    const b = -2 + rand() * 4;
    const c = -2 + rand() * 4;
    const d = -2 + rand() * 4;
    let x = 0.1, y = 0.1;
    const positions = new Float32Array(actualCount * 3);
    for (let i = 0; i < actualCount; i++) {
      const nx = Math.sin(a * y) - Math.cos(b * x);
      const ny = Math.sin(c * x) - Math.cos(d * y);
      x = nx;
      y = ny;
      const idx = i * 3;
      positions[idx] = x * 0.7;
      positions[idx + 1] = y * 0.7;
      positions[idx + 2] = Math.sin(x * y) * 0.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [actualCount, seed]);

  const material = useMemo(
    () => new THREE.PointsMaterial({
      color: palette[1],
      size: 0.032,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    [palette],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.12;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

function SceneDeJong({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 2, 3]} intensity={1.0} color={palette[0]} />
      <DeJongCloud palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Polygon bloom
// ---------------------------------------------------------------------------
function PolygonBloom({ palette, seed, petals = 12 }: { palette: Palette; seed: number; petals?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const rand = useMemo(() => seededRandom(seed), [seed]);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const radius = 1.8;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const inner = 0.4 + rand() * 0.2;
      const outer = radius + rand() * 0.4;
      const x0 = Math.cos(angle) * inner;
      const y0 = Math.sin(angle) * inner;
      const x1 = Math.cos(angle) * outer;
      const y1 = Math.sin(angle) * outer;
      const z = Math.sin(angle * 3 + rand() * Math.PI) * 0.25;
      positions.push(x0, y0, 0, x1, y1, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [petals, rand]);

  const material = useMemo(() => makeLineMaterial(palette[2], 0.72), [palette]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.z = t * 0.2;
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry} material={material} />
    </group>
  );
}

function ScenePolygonBloom({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[2, 2, 3]} intensity={1.0} color={palette[1]} />
      <PolygonBloom palette={palette} seed={seed} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Reaction-Diffusion Waves on a Torus
// ---------------------------------------------------------------------------
function ReactionDiffusionTorus({ palette }: { palette: Palette; seed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => new THREE.TorusGeometry(1.2, 0.5, 64, 128), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: palette[0],
      emissive: palette[1],
      emissiveIntensity: 0.6,
      metalness: 0.5,
      roughness: 0.3,
    }),
    [palette]
  );

  const originalPositions = useMemo(() => {
    const pos = geom.attributes.position as THREE.BufferAttribute;
    return new Float32Array(pos.array);
  }, [geom]);

  useEffect(() => () => geom.dispose(), [geom]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = geom.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const ox = originalPositions[i * 3];
      const oy = originalPositions[i * 3 + 1];
      const oz = originalPositions[i * 3 + 2];

      // Create reaction-diffusion-like patterns
      const angle1 = Math.atan2(oy, ox);
      const angle2 = Math.atan2(oz, Math.sqrt(ox * ox + oy * oy) - 1.2);

      const wave1 = Math.sin(angle1 * 8 + t * 2) * Math.cos(angle2 * 6 - t * 1.5);
      const wave2 = Math.cos(angle1 * 5 - t * 1.2) * Math.sin(angle2 * 7 + t * 0.8);
      const displacement = 1 + 0.08 * (wave1 + wave2);

      pos.setXYZ(i, ox * displacement, oy * displacement, oz * displacement);
    }
    // eslint-disable-next-line react-hooks/immutability
    pos.needsUpdate = true;
    geom.computeVertexNormals();

    meshRef.current.rotation.y = t * 0.2;
    meshRef.current.rotation.x = t * 0.1;
  });

  return <mesh ref={meshRef} geometry={geom} material={mat} />;
}

function SceneReactionDiffusion({ palette, seed: _ }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} color={palette[2]} />
      <pointLight position={[-2, -2, 3]} intensity={0.8} color={palette[0]} />
      <ReactionDiffusionTorus palette={palette} seed={0} />
      <StarField density={280} color={palette[3]} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant map and rotation plan
// ---------------------------------------------------------------------------
type VariantKey =
  | "orbits"
  | "lissajous"
  | "wave"
  | "lorenz"
  | "helix"
  | "torus"
  | "flock"
  | "clifford"
  | "supershape"
  | "hopf"
  | "ikeda"
  | "gyroid"
  | "mobius"
  | "mobiusloom"
  | "hyperbolic"
  | "harmonics"
  | "trefoil"
  | "flowfield"
  | "quasicrystal"
  | "phaseshear"
  | "spirograph"
  | "phyllotaxis"
  | "aizawa"
  | "rossler"
  | "torusknot"
  | "mobiusorbit"
  | "tensormorph"
  | "hodgeflow"
  | "transportbridge"
  | "reactionimpostor"
  | "fibration"
  | "filigree"
  | "lemniscate"
  | "logspiral"
  | "epicycle"
  | "vortexgrid"
  | "orbitals"
  | "torusphyllo"
  | "sineweave"
  | "harmonicribbons"
  | "dejong"
  | "polygonbloom"
  | "reactiondiffusion";

const scenes: Record<VariantKey, (opts: { palette: Palette; seed: number }) => JSX.Element> = {
  orbits: ({ palette, seed }) => <SceneOrbits palette={palette} seed={seed} />,
  lissajous: ({ palette, seed }) => <SceneLissajous palette={palette} seed={seed} />,
  wave: ({ palette, seed }) => <SceneWaveGrid palette={palette} seed={seed} />,
  lorenz: ({ palette, seed }) => <SceneLorenz palette={palette} seed={seed} />,
  helix: ({ palette, seed }) => <SceneHelix palette={palette} seed={seed} />,
  torus: ({ palette, seed }) => <SceneTorus palette={palette} seed={seed} />,
  flock: ({ palette, seed }) => <SceneFlock palette={palette} seed={seed} />,
  clifford: ({ palette, seed }) => <SceneClifford palette={palette} seed={seed} />,
  supershape: ({ palette, seed }) => <SceneSupershape palette={palette} seed={seed} />,
  hopf: ({ palette, seed }) => <SceneHopf palette={palette} seed={seed} />,
  ikeda: ({ palette, seed }) => <SceneIkeda palette={palette} seed={seed} />,
  gyroid: ({ palette, seed }) => <SceneGyroid palette={palette} seed={seed} />,
  mobius: ({ palette, seed }) => <SceneMobius palette={palette} seed={seed} />,
  mobiusloom: ({ palette, seed }) => <SceneMobiusLoom palette={palette} seed={seed} />,
  hyperbolic: ({ palette, seed }) => <SceneHyperbolic palette={palette} seed={seed} />,
  harmonics: ({ palette, seed }) => <SceneHarmonics palette={palette} seed={seed} />,
  trefoil: ({ palette, seed }) => <SceneTrefoil palette={palette} seed={seed} />,
  flowfield: ({ palette, seed }) => <SceneFlowField palette={palette} seed={seed} />,
  quasicrystal: ({ palette, seed }) => <SceneQuasicrystal palette={palette} seed={seed} />,
  phaseshear: ({ palette, seed }) => <ScenePhaseShear palette={palette} seed={seed} />,
  spirograph: ({ palette, seed }) => <SceneSpirograph palette={palette} seed={seed} />,
  phyllotaxis: ({ palette, seed }) => <ScenePhyllotaxis palette={palette} seed={seed} />,
  aizawa: ({ palette, seed }) => <SceneAizawa palette={palette} seed={seed} />,
  rossler: ({ palette, seed }) => <SceneRossler palette={palette} seed={seed} />,
  torusknot: ({ palette, seed }) => <SceneTorusKnot palette={palette} seed={seed} />,
  mobiusorbit: ({ palette, seed }) => <SceneMobiusOrbit palette={palette} seed={seed} />,
  tensormorph: ({ palette, seed }) => <SceneTensorMorph palette={palette} seed={seed} />,
  hodgeflow: ({ palette, seed }) => <SceneHodgeFlow palette={palette} seed={seed} />,
  transportbridge: ({ palette, seed }) => <SceneTransportBridge palette={palette} seed={seed} />,
  reactionimpostor: ({ palette, seed }) => <SceneReactionImpostor palette={palette} seed={seed} />,
  fibration: ({ palette, seed }) => <SceneFibration palette={palette} seed={seed} />,
  filigree: ({ palette, seed }) => <SceneFiligree palette={palette} seed={seed} />,
  lemniscate: ({ palette, seed }) => <SceneLemniscate palette={palette} seed={seed} />,
  logspiral: ({ palette, seed }) => <SceneLogSpiral palette={palette} seed={seed} />,
  epicycle: ({ palette, seed }) => <SceneEpicycle palette={palette} seed={seed} />,
  vortexgrid: ({ palette, seed }) => <SceneVortexGrid palette={palette} seed={seed} />,
  orbitals: ({ palette, seed }) => <SceneOrbitals palette={palette} seed={seed} />,
  torusphyllo: ({ palette, seed }) => <SceneTorusPhyllo palette={palette} seed={seed} />,
  sineweave: ({ palette, seed }) => <SceneSineWeave palette={palette} seed={seed} />,
  harmonicribbons: ({ palette, seed }) => <SceneHarmonicRibbons palette={palette} seed={seed} />,
  dejong: ({ palette, seed }) => <SceneDeJong palette={palette} seed={seed} />,
  polygonbloom: ({ palette, seed }) => <ScenePolygonBloom palette={palette} seed={seed} />,
  reactiondiffusion: ({ palette, seed }) => <SceneReactionDiffusion palette={palette} seed={seed} />,
};

const lightVariants: VariantKey[] = [
  "orbits",
  "wave",
  "lissajous",
  "helix",
  "torus",
  "phyllotaxis",
  "spirograph",
  "mobius",
  "quasicrystal",
  "phaseshear",
  "logspiral",
  "epicycle",
  "sineweave",
  "polygonbloom",
  "torusphyllo",
  "hodgeflow",
  "tensormorph",
  "transportbridge",
];

const mediumVariants: VariantKey[] = [
  "orbits",
  "wave",
  "lissajous",
  "helix",
  "torus",
  "flock",
  "phyllotaxis",
  "spirograph",
  "mobius",
  "mobiusloom",
  "hyperbolic",
  "quasicrystal",
  "phaseshear",
  "harmonics",
  "trefoil",
  "clifford",
  "rossler",
  "torusknot",
  "mobiusorbit",
  "tensormorph",
  "hodgeflow",
  "transportbridge",
  "lemniscate",
  "logspiral",
  "epicycle",
  "vortexgrid",
  "orbitals",
  "torusphyllo",
  "sineweave",
  "harmonicribbons",
  "dejong",
  "polygonbloom",
];

const rotationPlan: { variant: VariantKey; palette: number; seed: number; background?: string }[] = [
  // Phase 1: Mysterious & ethereal
  { variant: "aizawa", palette: 4, seed: 200 },           // Strange attractor
  { variant: "hyperbolic", palette: 5, seed: 201 },      // Hyperbolic weave
  { variant: "filigree", palette: 4, seed: 5 },          // Filigree orbitals
  { variant: "ikeda", palette: 3, seed: 133 },           // Ikeda map cloud
  { variant: "clifford", palette: 2, seed: 33 },         // Clifford ribbons
  { variant: "harmonics", palette: 1, seed: 202 },       // Spherical harmonics

  // Phase 2: Geometry & structure
  { variant: "phyllotaxis", palette: 0, seed: 203 },     // Fibonacci phyllotaxis
  { variant: "trefoil", palette: 5, seed: 204 },         // Knot energy
  { variant: "torusknot", palette: 2, seed: 205 },       // Torus knot lattice
  { variant: "mobiusloom", palette: 1, seed: 206 },      // Möbius loom
  { variant: "fibration", palette: 3, seed: 101 },       // Fibration lattice
  { variant: "helix", palette: 0, seed: 6 },             // DNA ribbons

  // Phase 3: Peak activity & vibrant
  { variant: "torus", palette: 3, seed: 4 },             // Torus garden
  { variant: "wave", palette: 2, seed: 3 },              // Interference patterns
  { variant: "lissajous", palette: 1, seed: 2 },         // Lissajous swarm
  { variant: "reactionimpostor", palette: 0, seed: 207 }, // RD impostor
  { variant: "hopf", palette: 5, seed: 55 },             // Hopf fibration
  { variant: "orbits", palette: 0, seed: 1 },            // Classic orbital

  // Phase 4: Evening elegance
  { variant: "gyroid", palette: 5, seed: 41 },           // Minimal surface
  { variant: "phaseshear", palette: 4, seed: 7 },        // Phase-shear lattice
  { variant: "quasicrystal", palette: 3, seed: 208 },    // Quasicrystal lattice
  { variant: "flowfield", palette: 2, seed: 209 },       // Flow field
  { variant: "trefoil", palette: 1, seed: 210 },         // Glowing knot
  { variant: "rossler", palette: 4, seed: 211 },         // Rossler attractor
  // Bonus rotation - additional mathematical variants
  { variant: "lemniscate", palette: 0, seed: 300 },      // Lemniscate weave
  { variant: "logspiral", palette: 1, seed: 301 },       // Logarithmic spirals
  { variant: "epicycle", palette: 2, seed: 302 },        // Epicycle rosettes
  { variant: "vortexgrid", palette: 3, seed: 303 },      // Vortex grid
  { variant: "orbitals", palette: 4, seed: 304 },        // Orbital swarm
  { variant: "torusphyllo", palette: 5, seed: 305 },     // Torus phyllotaxis
  { variant: "sineweave", palette: 0, seed: 306 },       // Sine weave
  { variant: "harmonicribbons", palette: 2, seed: 307 }, // Harmonic ribbons
  { variant: "dejong", palette: 4, seed: 308 },          // De Jong cloud
  { variant: "polygonbloom", palette: 3, seed: 309 },    // Polygon bloom
  { variant: "mobiusorbit", palette: 1, seed: 310 },     // Orbital Möbius field
  { variant: "tensormorph", palette: 5, seed: 311 },     // Tensor morph lattice
  { variant: "hodgeflow", palette: 2, seed: 312 },       // Hodge flow streamlines
  { variant: "transportbridge", palette: 0, seed: 313 }, // Transport bridge
];

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------
export default function ThreeScene({ isActive = true }: { isActive?: boolean }) {
  const { capabilities, quality } = useDeviceCapabilities();
  const { isMobile, tier } = capabilities;
  const prefersReducedMotion = capabilities.prefersReducedMotion;
  const slot = useTimeSlot(SLOT_MINUTES);
  const plan = rotationPlan[slot % rotationPlan.length];
  const palette = palettes[plan.palette % palettes.length];

  // Dynamic DPR state for performance scaling
  const [currentDpr, setCurrentDpr] = useState<number>(quality.maxDpr);
  const [perfMode, setPerfMode] = useState<"normal" | "safe">("normal");
  const declineStreakRef = useRef(0);
  const inclineStreakRef = useRef(0);

  // Sync currentDpr with quality changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing state with prop changes for adaptive quality
    setCurrentDpr(quality.maxDpr);
  }, [quality.maxDpr]);

  // Performance regression handler - lower DPR when FPS drops
  const handleDecline = useCallback(() => {
    setCurrentDpr((prev) => Math.max(0.5, prev - 0.25));
    declineStreakRef.current += 1;
    inclineStreakRef.current = 0;
    if (declineStreakRef.current >= 3) {
      setPerfMode("safe");
    }
  }, []);

  // Performance improvement handler - raise DPR when FPS is good
  const handleIncline = useCallback(() => {
    setCurrentDpr((prev) => Math.min(quality.maxDpr, prev + 0.25));
    inclineStreakRef.current += 1;
    if (inclineStreakRef.current >= 3) {
      declineStreakRef.current = 0;
      setPerfMode("normal");
    }
  }, [quality.maxDpr]);

  const autoRotateSpeed = tier === "low" ? 0.08 : tier === "medium" ? 0.18 : 0.28;
  const allowAnimation = isActive && !prefersReducedMotion;
  const targetFps = quality.targetFps;

  const variant = useMemo(() => {
    if (perfMode === "safe" || tier === "low") {
      return lightVariants[slot % lightVariants.length];
    }
    if (tier === "medium") {
      return mediumVariants.includes(plan.variant)
        ? plan.variant
        : mediumVariants[slot % mediumVariants.length];
    }
    return plan.variant;
  }, [perfMode, tier, slot, plan.variant]);

  // Context value
  const contextValue: QualityContextValue = useMemo(() => ({
    quality,
    tier
  }), [quality, tier]);

  // Render the variant as a component to ensure hooks are isolated and
  // properly reset when the variant changes (via the key prop).
  const SceneComponent = scenes[variant];

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 40 }}
      className="h-[280px] w-full touch-none sm:h-[380px] md:h-[420px] lg:h-[460px]"
      dpr={currentDpr}
      performance={{ min: 0.3 }}
      style={{ touchAction: "none" }}
      frameloop={allowAnimation ? "always" : "demand"}
    >
      {/* Performance monitoring - automatically scales DPR based on FPS */}
      {allowAnimation && (
        <PerformanceMonitor
          onDecline={handleDecline}
          onIncline={handleIncline}
          flipflops={3}
          bounds={() => {
            if (tier === "high") return [targetFps - 5, targetFps];
            if (tier === "medium") return [targetFps - 10, targetFps];
            return [targetFps - 15, targetFps];
          }}
        />
      )}
      <QualityContext.Provider value={contextValue}>
        <color attach="background" args={[plan.background ?? "#020617"]} />
        <ambientLight intensity={0.18} />
        <hemisphereLight intensity={0.2} color="#dbeafe" groundColor="#0b1120" />
        <MathematicalHalo palette={palette} />
        <SceneComponent key={variant} palette={palette} seed={plan.seed} />
        <OrbitControls
          enableZoom={false}
          autoRotate={allowAnimation}
          autoRotateSpeed={autoRotateSpeed}
          enablePan={false}
          enableRotate={!isMobile && !prefersReducedMotion}
          enableDamping={tier === "high"}
          makeDefault
        />
      </QualityContext.Provider>
    </Canvas>
  );
}
