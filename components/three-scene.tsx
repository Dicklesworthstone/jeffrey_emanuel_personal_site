"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react";
import * as THREE from "three";
import gsap from "gsap";

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------
const isMobileDevice = () => {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

const isSlowConnection = () => {
  if (typeof window === "undefined" || !("connection" in navigator)) return false;
  const conn = (navigator as any).connection;
  if (!conn) return false;
  return conn.effectiveType === "slow-2g" || conn.effectiveType === "2g" || conn.saveData === true;
};

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

const useHour = () => {
  const [hour, setHour] = useState(0);
  useEffect(() => {
    const update = () => setHour(new Date().getHours());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);
  return hour;
};

// Simple deterministic pseudo-random generator for repeatable layouts
const seededRandom = (seed: number) => {
  let x = Math.sin(seed) * 10000;
  return () => {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
};

// Starfield reused by multiple scenes
function StarField({ density = 420, color = "#38bdf8" }: { density?: number; color?: string }) {
  const ref = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    let numPoints = density;
    if (typeof window !== "undefined") {
      if (isSlowConnection()) numPoints = Math.min(120, density);
      else if (isMobileDevice()) numPoints = Math.min(220, density);
    }
    const pts = new Float32Array(numPoints * 3);
    for (let i = 0; i < numPoints; i++) {
      const r = 5 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      const idx = i * 3;
      pts[idx] = x;
      pts[idx + 1] = y;
      pts[idx + 2] = z;
    }
    return pts;
  });

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
      <pointsMaterial size={0.045} sizeAttenuation color={color} transparent opacity={0.7} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Variant: Orbital polyhedron (original)
// ---------------------------------------------------------------------------
function FloatingPolyhedron({ palette }: { palette: Palette }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
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
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
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

function SceneOrbits({ palette }: { palette: Palette }) {
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
  const dummyRef = useRef(new THREE.Object3D());
  const geom = useMemo(() => new THREE.SphereGeometry(0.04, 12, 12), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 0.8, metalness: 0.1, roughness: 0.4 }),
    [palette],
  );

  useEffect(() => () => {
    geom.dispose();
    mat.dispose();
  }, [geom, mat]);

  const rand = useMemo(() => seededRandom(seed), [seed]);
  const params = useMemo(() => ({
    ax: 1 + rand() * 2,
    ay: 1.5 + rand() * 2,
    az: 0.8 + rand() * 1.6,
    bx: 2 + rand() * 2,
    by: 2 + rand() * 2,
    bz: 1.5 + rand() * 1.5,
    phase: rand() * Math.PI,
  }), [rand]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.35;
    const dummy = dummyRef.current;
    for (let i = 0; i < count; i++) {
      const k = (i / count) * Math.PI * 2;
      const x = Math.sin(params.ax * k + t) * Math.cos(params.bx * k + params.phase) * 2.2;
      const y = Math.sin(params.ay * k + t * 1.1) * Math.sin(params.by * k + params.phase) * 2.2;
      const z = Math.cos(params.az * k + t * 0.8) * Math.cos(params.bz * k + params.phase) * 2.2;
      dummy.position.set(x, y, z);
      const s = 0.7 + Math.sin(k * 4 + t) * 0.25;
      dummy.scale.setScalar(s * 0.7);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  // gsap pulsing emissive
  useEffect(() => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(m, { emissiveIntensity: 1.6, duration: 2.8, ease: "sine.inOut" });
    return () => {
      tl.kill();
    };
  }, []);

  return <instancedMesh ref={ref} args={[geom, mat, count]} />;
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

  useEffect(() => () => { geom.dispose(); mat.dispose(); }, [geom, mat]);

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
      <lineBasicMaterial color={palette[1]} transparent opacity={0.7} linewidth={1.5} />
    </lineSegments>
  );
}

function SceneLorenz({ palette }: { palette: Palette }) {
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

function SceneHelix({ palette }: { palette: Palette }) {
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
  const geom = useMemo(() => new THREE.IcosahedronGeometry(0.09, 0), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: palette[1], emissive: palette[0], emissiveIntensity: 0.8, metalness: 0.5, roughness: 0.2 }), [palette]);
  useEffect(() => () => { geom.dispose(); mat.dispose(); }, [geom, mat]);

  const rand = useMemo(() => seededRandom(seed), [seed]);
  const seeds = useMemo(() => Array.from({ length: count }, () => ({
    phase: rand() * Math.PI * 2,
    radius: 0.8 + rand() * 2.4,
    speed: 0.4 + rand() * 0.7,
    height: 0.4 + rand() * 1.4,
  })), [count, rand]);

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

  return <instancedMesh ref={ref} args={[geom, mat, count]} />;
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
// Hourly schedule
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Variant: Clifford attractor ribbons
// ---------------------------------------------------------------------------
function Clifford({ palette, seed, count = 42000 }: { palette: Palette; seed: number; count?: number }) {
  const geom = useMemo(() => new THREE.BufferGeometry(), []);
  const mat = useMemo(
    () => new THREE.LineBasicMaterial({ color: palette[1], transparent: true, opacity: 0.7 }),
    [palette],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    const rand = seededRandom(seed);
    const a = -1.4 + rand() * 0.8;
    const b = 1.6 + rand() * 0.8;
    const c = 1.0 + rand() * 1.0;
    const d = -1.2 + rand() * 0.6;
    let x = 0.1, y = 0, z = 0;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const nx = Math.sin(a * y) + c * Math.cos(a * x);
      const ny = Math.sin(b * x) + d * Math.cos(b * y);
      const nz = Math.sin(b * z) - Math.cos(a * x);
      x = nx;
      y = ny;
      z = nz;
      const idx = i * 3;
      positions[idx] = x * 0.4;
      positions[idx + 1] = y * 0.4;
      positions[idx + 2] = z * 0.4;
    }
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.computeBoundingSphere();
    return () => geom.dispose();
  }, [geom, seed]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.12;
    group.current.rotation.x = Math.sin(t * 0.4) * 0.2;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={geom} material={mat} />
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
function IkedaCloud({ palette, seed, count = 4800 }: { palette: Palette; seed: number; count?: number }) {
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

  useEffect(() => () => { geom.dispose(); mat.dispose(); }, [geom, mat]);

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
function GyroidSurface({ palette, seed, resolution = 70 }: { palette: Palette; seed: number; resolution?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => new THREE.PlaneGeometry(4, 4, resolution, resolution), [resolution]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 0.5, roughness: 0.4, metalness: 0.35, side: THREE.DoubleSide }), [palette]);
  const rand = useMemo(() => seededRandom(seed), [seed]);
  const noisePhase = useMemo(() => rand() * Math.PI * 2, [rand]);

  useEffect(() => () => { geom.dispose(); mat.dispose(); }, [geom, mat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pos = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const g = Math.sin(x + t * 0.8) * Math.cos(y + t * 0.6) + Math.sin(y + t * 0.4) * Math.cos(x + noisePhase + t * 0.5);
      pos.setZ(i, g * 0.6);
    }
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
    stripMat.dispose();
    particleGeom.dispose();
    particleMat.dispose();
  }, [stripGeom, stripMat, particleGeom, particleMat]);

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

  useEffect(() => () => { geom.dispose(); mat.dispose(); }, [geom, mat]);

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
    tubeMat.dispose();
    particleGeom.dispose();
    particleMat.dispose();
  }, [tubeGeom, tubeMat, particleGeom, particleMat]);

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
  const geom = useMemo(() => new THREE.SphereGeometry(0.025, 6, 6), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 1.0, roughness: 0.4 }),
    [palette]
  );

  const rand = useMemo(() => seededRandom(seed), [seed]);

  // Initialize particle positions
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (rand() - 0.5) * 5,
        (rand() - 0.5) * 5,
        (rand() - 0.5) * 5
      ),
      vel: new THREE.Vector3(0, 0, 0),
      life: rand(),
    }));
  }, [count, rand]);

  // Simple 3D noise function
  const noise3D = (x: number, y: number, z: number, t: number) => {
    return Math.sin(x * 1.5 + t) * Math.cos(y * 1.3 + t * 0.7) * Math.sin(z * 1.1 + t * 0.5) +
           Math.sin(x * 0.7 - t * 0.5) * Math.cos(z * 0.9 + t * 0.3);
  };

  useEffect(() => () => { geom.dispose(); mat.dispose(); }, [geom, mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * 0.5;
    const dummy = dummyRef.current;

    particles.forEach((p, i) => {
      // Calculate flow field direction using noise
      const nx = noise3D(p.pos.x * 0.3, p.pos.y * 0.3, p.pos.z * 0.3, t);
      const ny = noise3D(p.pos.y * 0.3, p.pos.z * 0.3, p.pos.x * 0.3, t + 100);
      const nz = noise3D(p.pos.z * 0.3, p.pos.x * 0.3, p.pos.y * 0.3, t + 200);

      p.vel.set(nx, ny, nz).multiplyScalar(0.015);
      p.pos.add(p.vel);

      // Wrap around bounds
      const bound = 2.5;
      if (Math.abs(p.pos.x) > bound) p.pos.x *= -0.9;
      if (Math.abs(p.pos.y) > bound) p.pos.y *= -0.9;
      if (Math.abs(p.pos.z) > bound) p.pos.z *= -0.9;

      dummy.position.copy(p.pos);
      const speed = p.vel.length();
      dummy.scale.setScalar(0.8 + speed * 20);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geom, mat, count]} />;
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

  useEffect(() => () => {
    curves.forEach(c => c.geometry.dispose());
    materials.forEach(m => m.dispose());
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
// Variant: Phyllotaxis Fibonacci Sphere (sunflower seed pattern)
// ---------------------------------------------------------------------------
function PhyllotaxisSphere({ palette, seed, count = 800 }: { palette: Palette; seed: number; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const geom = useMemo(() => new THREE.DodecahedronGeometry(0.06, 0), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette[0], emissive: palette[1], emissiveIntensity: 0.7, metalness: 0.4, roughness: 0.3 }),
    [palette]
  );

  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees

  useEffect(() => () => { geom.dispose(); mat.dispose(); }, [geom, mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const dummy = dummyRef.current;

    for (let i = 0; i < count; i++) {
      // Fibonacci sphere distribution
      const theta = i * goldenAngle + t * 0.2;
      const y = 1 - (i / (count - 1)) * 2; // -1 to 1
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

  return <instancedMesh ref={meshRef} args={[geom, mat, count]} />;
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
function AizawaAttractor({ palette, seed }: { palette: Palette; seed: number }) {
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

  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color: palette[1], transparent: true, opacity: 0.85 }),
    [palette]
  );

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.3;
    material.opacity = 0.7 + Math.sin(t * 0.8) * 0.2;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry} material={material} />
    </group>
  );
}

function SceneAizawa({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 3, 3]} intensity={1.2} color={palette[0]} />
      <AizawaAttractor palette={palette} seed={seed} />
      <StarField density={300} color={palette[2]} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant: Reaction-Diffusion Waves on a Torus
// ---------------------------------------------------------------------------
function ReactionDiffusionTorus({ palette, seed }: { palette: Palette; seed: number }) {
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

  useEffect(() => () => { geom.dispose(); mat.dispose(); }, [geom, mat]);

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
    pos.needsUpdate = true;
    geom.computeVertexNormals();

    meshRef.current.rotation.y = t * 0.2;
    meshRef.current.rotation.x = t * 0.1;
  });

  return <mesh ref={meshRef} geometry={geom} material={mat} />;
}

function SceneReactionDiffusion({ palette, seed }: { palette: Palette; seed: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} color={palette[2]} />
      <pointLight position={[-2, -2, 3]} intensity={0.8} color={palette[0]} />
      <ReactionDiffusionTorus palette={palette} seed={seed} />
      <StarField density={280} color={palette[3]} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Variant map and hourly plan
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
  | "harmonics"
  | "trefoil"
  | "flowfield"
  | "spirograph"
  | "phyllotaxis"
  | "aizawa"
  | "reactiondiffusion";

const scenes: Record<VariantKey, (opts: { palette: Palette; seed: number }) => JSX.Element> = {
  orbits: ({ palette }) => <SceneOrbits palette={palette} />,
  lissajous: ({ palette, seed }) => <SceneLissajous palette={palette} seed={seed} />,
  wave: ({ palette, seed }) => <SceneWaveGrid palette={palette} seed={seed} />,
  lorenz: ({ palette }) => <SceneLorenz palette={palette} />,
  helix: ({ palette }) => <SceneHelix palette={palette} />,
  torus: ({ palette, seed }) => <SceneTorus palette={palette} seed={seed} />,
  flock: ({ palette, seed }) => <SceneFlock palette={palette} seed={seed} />,
  clifford: ({ palette, seed }) => <SceneClifford palette={palette} seed={seed} />,
  supershape: ({ palette, seed }) => <SceneSupershape palette={palette} seed={seed} />,
  hopf: ({ palette, seed }) => <SceneHopf palette={palette} seed={seed} />,
  ikeda: ({ palette, seed }) => <SceneIkeda palette={palette} seed={seed} />,
  gyroid: ({ palette, seed }) => <SceneGyroid palette={palette} seed={seed} />,
  mobius: ({ palette, seed }) => <SceneMobius palette={palette} seed={seed} />,
  harmonics: ({ palette, seed }) => <SceneHarmonics palette={palette} seed={seed} />,
  trefoil: ({ palette, seed }) => <SceneTrefoil palette={palette} seed={seed} />,
  flowfield: ({ palette, seed }) => <SceneFlowField palette={palette} seed={seed} />,
  spirograph: ({ palette, seed }) => <SceneSpirograph palette={palette} seed={seed} />,
  phyllotaxis: ({ palette, seed }) => <ScenePhyllotaxis palette={palette} seed={seed} />,
  aizawa: ({ palette, seed }) => <SceneAizawa palette={palette} seed={seed} />,
  reactiondiffusion: ({ palette, seed }) => <SceneReactionDiffusion palette={palette} seed={seed} />,
};

const hourlyPlan: { variant: VariantKey; palette: number; seed: number; background?: string }[] = [
  // Midnight - 5am: Mysterious & ethereal
  { variant: "aizawa", palette: 4, seed: 200 },           // 12am - Strange attractor
  { variant: "flowfield", palette: 5, seed: 201 },       // 1am - Mesmerizing particle flow
  { variant: "lorenz", palette: 4, seed: 5 },            // 2am - Chaotic butterfly
  { variant: "ikeda", palette: 3, seed: 133 },           // 3am - Ikeda map cloud
  { variant: "clifford", palette: 2, seed: 33 },         // 4am - Clifford ribbons
  { variant: "harmonics", palette: 1, seed: 202 },       // 5am - Spherical harmonics dawn

  // 6am - 11am: Morning energy & geometry
  { variant: "phyllotaxis", palette: 0, seed: 203 },     // 6am - Fibonacci sunrise
  { variant: "trefoil", palette: 5, seed: 204 },         // 7am - Knot energy
  { variant: "mobius", palette: 2, seed: 205 },          // 8am - Möbius topology
  { variant: "spirograph", palette: 1, seed: 206 },      // 9am - Complex curves
  { variant: "supershape", palette: 3, seed: 101 },      // 10am - Morphing forms
  { variant: "helix", palette: 0, seed: 6 },             // 11am - DNA ribbons

  // Noon - 5pm: Peak activity & vibrant
  { variant: "torus", palette: 3, seed: 4 },             // 12pm - Torus garden
  { variant: "wave", palette: 2, seed: 3 },              // 1pm - Interference patterns
  { variant: "lissajous", palette: 1, seed: 2 },         // 2pm - Lissajous swarm
  { variant: "reactiondiffusion", palette: 0, seed: 207 }, // 3pm - Turing patterns
  { variant: "hopf", palette: 5, seed: 55 },             // 4pm - Hopf fibration
  { variant: "orbits", palette: 0, seed: 1 },            // 5pm - Classic orbital

  // 6pm - 11pm: Evening elegance
  { variant: "gyroid", palette: 5, seed: 41 },           // 6pm - Minimal surface
  { variant: "flock", palette: 4, seed: 7 },             // 7pm - Boid swarm
  { variant: "harmonics", palette: 3, seed: 208 },       // 8pm - Evening harmonics
  { variant: "spirograph", palette: 2, seed: 209 },      // 9pm - Night curves
  { variant: "trefoil", palette: 1, seed: 210 },         // 10pm - Glowing knot
  { variant: "phyllotaxis", palette: 4, seed: 211 },     // 11pm - Golden spiral night
];

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------
export default function ThreeScene() {
  const isMobile = isMobileDevice();
  const isSlowNetwork = isSlowConnection();
  const hour = useHour();
  const plan = hourlyPlan[hour % 24];
  const palette = palettes[plan.palette % palettes.length];

  const quality = isSlowNetwork ? "low" : isMobile ? "medium" : "high";
  const dpr: [number, number] = isSlowNetwork ? [0.5, 1] : isMobile ? [1, 1.5] : [1, 2];
  const autoRotateSpeed = isSlowNetwork ? 0.08 : isMobile ? 0.18 : 0.28;

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 40 }}
      className="h-[280px] w-full touch-none sm:h-[380px] md:h-[420px] lg:h-[460px]"
      dpr={dpr}
      performance={{ min: 0.3 }}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={[plan.background ?? "#020617"]} />
      {scenes[plan.variant]({ palette, seed: plan.seed })}
      <OrbitControls
        enableZoom={false}
        autoRotate={quality !== "low"}
        autoRotateSpeed={autoRotateSpeed}
        enablePan={false}
        enableRotate={!isMobile}
        enableDamping={quality === "high"}
        makeDefault
      />
    </Canvas>
  );
}
