"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, Suspense, Component, type ReactNode } from "react";
import * as THREE from "three";
import { Sparkles } from "lucide-react";

// ---------------------------------------------------------------------------
// Error Boundary for 3D content
// ---------------------------------------------------------------------------
interface ErrorBoundaryState {
  hasError: boolean;
}

class ThreeErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Hour-based animation selector (24 different micro-animations)
// ---------------------------------------------------------------------------
const useHour = () => {
  // Initialize with current hour since this is client-side only
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const update = () => setHour(new Date().getHours());
    
    // Calculate ms until next hour to sync properly
    const now = new Date();
    const msUntilNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;

    // Track the interval ID so we can clean it up
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // Initial timeout to sync to hour boundary, then hourly interval
    const timeoutId = setTimeout(() => {
      update();
      intervalId = setInterval(update, 60 * 60 * 1000); // Check every hour
    }, msUntilNextHour);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, []);
  return hour;
};

// Color palette matching the site gradient: sky-500 → violet-500 → emerald-400
const colors = {
  sky: "#38bdf8",
  violet: "#8b5cf6",
  emerald: "#34d399",
  white: "#ffffff",
};

// ---------------------------------------------------------------------------
// Micro-animations (24 variations for each hour)
// ---------------------------------------------------------------------------

// 0: Rotating Icosahedron
function MicroIcosahedron() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.5;
    ref.current.rotation.y = clock.getElapsedTime() * 0.7;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color={colors.sky} emissive={colors.violet} emissiveIntensity={0.4} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

// 1: Torus Knot
function MicroTorusKnot() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.4;
    ref.current.rotation.y = clock.getElapsedTime() * 0.6;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.3, 0.1, 64, 8, 2, 3]} />
      <meshStandardMaterial color={colors.violet} emissive={colors.sky} emissiveIntensity={0.3} metalness={0.4} roughness={0.3} />
    </mesh>
  );
}

// 2: Octahedron
function MicroOctahedron() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.6;
    ref.current.rotation.z = clock.getElapsedTime() * 0.4;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color={colors.emerald} emissive={colors.sky} emissiveIntensity={0.4} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

// 3: Dodecahedron
function MicroDodecahedron() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.5;
    ref.current.rotation.z = clock.getElapsedTime() * 0.3;
  });
  return (
    <mesh ref={ref}>
      <dodecahedronGeometry args={[0.45, 0]} />
      <meshStandardMaterial color={colors.sky} emissive={colors.emerald} emissiveIntensity={0.4} metalness={0.35} roughness={0.35} />
    </mesh>
  );
}

// 4: Tetrahedron
function MicroTetrahedron() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.7;
    ref.current.rotation.y = clock.getElapsedTime() * 0.5;
  });
  return (
    <mesh ref={ref}>
      <tetrahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial color={colors.violet} emissive={colors.emerald} emissiveIntensity={0.35} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

// 5: Torus
function MicroTorus() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.4;
    ref.current.rotation.y = clock.getElapsedTime() * 0.6;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[0.35, 0.15, 16, 32]} />
      <meshStandardMaterial color={colors.emerald} emissive={colors.violet} emissiveIntensity={0.4} metalness={0.4} roughness={0.3} />
    </mesh>
  );
}

// 6: Cone
function MicroCone() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.3;
    ref.current.rotation.y = clock.getElapsedTime() * 0.6;
  });
  return (
    <mesh ref={ref}>
      <coneGeometry args={[0.4, 0.7, 6]} />
      <meshStandardMaterial color={colors.sky} emissive={colors.violet} emissiveIntensity={0.35} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

// 7: Cylinder
function MicroCylinder() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.5;
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.7) * 0.4;
  });
  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.3, 0.3, 0.6, 8]} />
      <meshStandardMaterial color={colors.violet} emissive={colors.emerald} emissiveIntensity={0.35} metalness={0.35} roughness={0.35} />
    </mesh>
  );
}

// 8: Double Torus (interlocked rings)
function MicroDoubleRing() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.x = clock.getElapsedTime() * 0.4;
    group.current.rotation.y = clock.getElapsedTime() * 0.5;
  });
  return (
    <group ref={group}>
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.35, 0.08, 12, 24]} />
        <meshStandardMaterial color={colors.sky} emissive={colors.violet} emissiveIntensity={0.4} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.08, 12, 24]} />
        <meshStandardMaterial color={colors.emerald} emissive={colors.sky} emissiveIntensity={0.4} metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

// 9: Sphere with wireframe
function MicroWireSphere() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.4;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={colors.violet} emissive={colors.sky} emissiveIntensity={0.3} transparent opacity={0.6} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.42, 12, 12]} />
        <meshBasicMaterial color={colors.sky} wireframe />
      </mesh>
    </group>
  );
}

// 10: Cube with edges
function MicroCubeEdges() {
  const ref = useRef<THREE.Group>(null);
  const edgesGeom = useMemo(() => {
    const boxGeom = new THREE.BoxGeometry(0.56, 0.56, 0.56);
    const edges = new THREE.EdgesGeometry(boxGeom);
    boxGeom.dispose(); // dispose the source geometry immediately
    return edges;
  }, []);

  useEffect(() => () => edgesGeom.dispose(), [edgesGeom]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.5;
    ref.current.rotation.y = clock.getElapsedTime() * 0.6;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color={colors.emerald} emissive={colors.violet} emissiveIntensity={0.4} transparent opacity={0.7} />
      </mesh>
      <lineSegments geometry={edgesGeom}>
        <lineBasicMaterial color={colors.white} />
      </lineSegments>
    </group>
  );
}

// 11: Trefoil Knot (tube along curve)
function MicroTrefoil() {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 2;
      const x = Math.sin(t) + 2 * Math.sin(2 * t);
      const y = Math.cos(t) - 2 * Math.cos(2 * t);
      const z = -Math.sin(3 * t);
      points.push(new THREE.Vector3(x * 0.15, y * 0.15, z * 0.15));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    return new THREE.TubeGeometry(curve, 64, 0.05, 8, true);
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.3;
    ref.current.rotation.y = clock.getElapsedTime() * 0.5;
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshStandardMaterial color={colors.sky} emissive={colors.emerald} emissiveIntensity={0.4} metalness={0.4} roughness={0.3} />
    </mesh>
  );
}

// 12: Lissajous figure (using mesh tube for better visuals)
function MicroLissajous() {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * Math.PI * 2;
      const x = Math.sin(3 * t) * 0.45;
      const y = Math.sin(4 * t) * 0.45;
      const z = Math.sin(5 * t) * 0.25;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    return new THREE.TubeGeometry(curve, 100, 0.025, 6, true);
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.4;
    ref.current.rotation.z = clock.getElapsedTime() * 0.2;
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshStandardMaterial color={colors.violet} emissive={colors.sky} emissiveIntensity={0.3} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

// 13: Star shape
function MicroStar() {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerR = 0.5, innerR = 0.25, points = 5;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: false });
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.5;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.4) * 0.3;
  });

  return (
    <mesh ref={ref} geometry={geometry} position={[0, 0, -0.075]}>
      <meshStandardMaterial color={colors.emerald} emissive={colors.sky} emissiveIntensity={0.4} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

// 14: Spiral (using tube geometry)
function MicroSpiral() {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 150; i++) {
      const t = (i / 150) * Math.PI * 6;
      const r = 0.1 + (i / 150) * 0.35;
      points.push(new THREE.Vector3(Math.cos(t) * r, (i / 150 - 0.5) * 0.8, Math.sin(t) * r));
    }
    const curve = new THREE.CatmullRomCurve3(points, false);
    return new THREE.TubeGeometry(curve, 80, 0.025, 6, false);
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.6;
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshStandardMaterial color={colors.sky} emissive={colors.violet} emissiveIntensity={0.3} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

// 15: DNA helix (using tube geometry)
function MicroHelix() {
  const ref = useRef<THREE.Group>(null);

  const [geom1, geom2] = useMemo(() => {
    const points1: THREE.Vector3[] = [];
    const points2: THREE.Vector3[] = [];
    for (let i = 0; i <= 50; i++) {
      const t = (i / 50) * Math.PI * 4;
      const y = (i / 50 - 0.5) * 0.9;
      points1.push(new THREE.Vector3(Math.cos(t) * 0.25, y, Math.sin(t) * 0.25));
      points2.push(new THREE.Vector3(Math.cos(t + Math.PI) * 0.25, y, Math.sin(t + Math.PI) * 0.25));
    }
    const curve1 = new THREE.CatmullRomCurve3(points1, false);
    const curve2 = new THREE.CatmullRomCurve3(points2, false);
    return [
      new THREE.TubeGeometry(curve1, 50, 0.025, 6, false),
      new THREE.TubeGeometry(curve2, 50, 0.025, 6, false),
    ];
  }, []);

  useEffect(() => () => {
    geom1.dispose();
    geom2.dispose();
  }, [geom1, geom2]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.5;
  });

  return (
    <group ref={ref}>
      <mesh geometry={geom1}>
        <meshStandardMaterial color={colors.violet} emissive={colors.sky} emissiveIntensity={0.3} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh geometry={geom2}>
        <meshStandardMaterial color={colors.emerald} emissive={colors.violet} emissiveIntensity={0.3} metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

// 16: Gyroscope rings
function MicroGyroscope() {
  const ref = useRef<THREE.Group>(null);
  
  const geometries = useMemo(() => [
    new THREE.TorusGeometry(0.45, 0.03, 8, 32),
    new THREE.TorusGeometry(0.35, 0.03, 8, 32),
    new THREE.TorusGeometry(0.25, 0.03, 8, 32)
  ], []);

  const materials = useMemo(() => [
    new THREE.MeshBasicMaterial({ color: colors.sky }),
    new THREE.MeshBasicMaterial({ color: colors.violet }),
    new THREE.MeshBasicMaterial({ color: colors.emerald })
  ], []);

  useEffect(() => () => {
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
  }, [geometries, materials]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children[0].rotation.x = clock.getElapsedTime() * 0.8;
    ref.current.children[1].rotation.y = clock.getElapsedTime() * 0.6;
    ref.current.children[2].rotation.z = clock.getElapsedTime() * 0.7;
  });

  return (
    <group ref={ref}>
      <mesh geometry={geometries[0]} material={materials[0]} />
      <mesh geometry={geometries[1]} material={materials[1]} />
      <mesh geometry={geometries[2]} material={materials[2]} />
    </group>
  );
}

// 17: Morphing sphere (breathing)
function MicroBreathingSphere() {
  const ref = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => new THREE.SphereGeometry(0.4, 24, 24), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: colors.violet, emissive: colors.sky, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.2 }), []);

  useEffect(() => () => {
    geom.dispose();
    mat.dispose();
  }, [geom, mat]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
    ref.current.scale.setScalar(scale);
    ref.current.rotation.y = clock.getElapsedTime() * 0.3;
  });

  return <mesh ref={ref} geometry={geom} material={mat} />;
}

// 18: Pyramid
function MicroPyramid() {
  const ref = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => new THREE.ConeGeometry(0.45, 0.7, 4), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: colors.sky, emissive: colors.emerald, emissiveIntensity: 0.4, metalness: 0.3, roughness: 0.4 }), []);

  useEffect(() => () => {
    geom.dispose();
    mat.dispose();
  }, [geom, mat]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.5;
    ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.1;
  });

  return <mesh ref={ref} geometry={geom} material={mat} />;
}

// 19: Atom model
function MicroAtom() {
  const ref = useRef<THREE.Group>(null);

  const sphereGeom = useMemo(() => new THREE.SphereGeometry(0.15, 16, 16), []);
  const torusGeom = useMemo(() => new THREE.TorusGeometry(0.4, 0.02, 8, 32), []);
  const sphereMat = useMemo(() => new THREE.MeshStandardMaterial({ color: colors.violet, emissive: colors.sky, emissiveIntensity: 0.6 }), []);
  const skyMat = useMemo(() => new THREE.MeshBasicMaterial({ color: colors.sky }), []);
  const emeraldMat = useMemo(() => new THREE.MeshBasicMaterial({ color: colors.emerald }), []);
  const violetMat = useMemo(() => new THREE.MeshBasicMaterial({ color: colors.violet }), []);

  useEffect(() => () => {
    sphereGeom.dispose();
    torusGeom.dispose();
    sphereMat.dispose();
    skyMat.dispose();
    emeraldMat.dispose();
    violetMat.dispose();
  }, [sphereGeom, torusGeom, sphereMat, skyMat, emeraldMat, violetMat]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.5;
    ref.current.rotation.x = clock.getElapsedTime() * 0.3;
  });

  return (
    <group ref={ref}>
      <mesh geometry={sphereGeom} material={sphereMat} />
      <mesh rotation={[0, 0, 0]} geometry={torusGeom} material={skyMat} />
      <mesh rotation={[Math.PI / 3, 0, 0]} geometry={torusGeom} material={emeraldMat} />
      <mesh rotation={[-Math.PI / 3, 0, 0]} geometry={torusGeom} material={violetMat} />
    </group>
  );
}

// 20: Mobius strip
function MicroMobius() {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions: number[] = [];
    const indices: number[] = [];
    const segments = 60;
    const width = 0.15;

    for (let i = 0; i <= segments; i++) {
      const u = (i / segments) * Math.PI * 2;
      for (let j = 0; j <= 1; j++) {
        const v = (j - 0.5) * width;
        const x = (0.35 + v * Math.cos(u / 2)) * Math.cos(u);
        const y = (0.35 + v * Math.cos(u / 2)) * Math.sin(u);
        const z = v * Math.sin(u / 2);
        positions.push(x, y, z);
      }
    }

    for (let i = 0; i < segments; i++) {
      const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1;
      indices.push(a, b, c, b, d, c);
    }

    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, []);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: colors.emerald, emissive: colors.violet, emissiveIntensity: 0.4, side: THREE.DoubleSide, metalness: 0.3, roughness: 0.4 }), []);

  useEffect(() => () => {
    geometry.dispose();
    mat.dispose();
  }, [geometry, mat]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.3;
    ref.current.rotation.y = clock.getElapsedTime() * 0.5;
  });

  return <mesh ref={ref} geometry={geometry} material={mat} />;
}

// 21: Klein bottle approximation
function MicroKlein() {
  const ref = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => new THREE.TorusKnotGeometry(0.28, 0.12, 64, 8, 3, 2), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: colors.sky, emissive: colors.violet, emissiveIntensity: 0.4, metalness: 0.4, roughness: 0.3 }), []);

  useEffect(() => () => {
    geom.dispose();
    mat.dispose();
  }, [geom, mat]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.4;
    ref.current.rotation.y = clock.getElapsedTime() * 0.5;
  });

  return <mesh ref={ref} geometry={geom} material={mat} />;
}

// 22: Flower of life pattern
function MicroFlower() {
  const ref = useRef<THREE.Group>(null);
  const r = 0.18;

  const torusGeom = useMemo(() => new THREE.TorusGeometry(r, 0.02, 8, 32), [r]);
  const skyMat = useMemo(() => new THREE.MeshBasicMaterial({ color: colors.sky }), []);
  const violetMat = useMemo(() => new THREE.MeshBasicMaterial({ color: colors.violet }), []);
  const emeraldMat = useMemo(() => new THREE.MeshBasicMaterial({ color: colors.emerald }), []);

  useEffect(() => () => {
    torusGeom.dispose();
    skyMat.dispose();
    violetMat.dispose();
    emeraldMat.dispose();
  }, [torusGeom, skyMat, violetMat, emeraldMat]);

  // Memoize circle positions
  const circleData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return {
        key: i,
        position: [Math.cos(angle) * r, Math.sin(angle) * r, 0] as [number, number, number],
        material: i % 2 === 0 ? skyMat : violetMat,
      };
    });
  }, [r, skyMat, violetMat]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * 0.3;
  });

  return (
    <group ref={ref}>
      <mesh geometry={torusGeom} material={emeraldMat} />
      {circleData.map(({ key, position, material }) => (
        <mesh key={key} position={position} geometry={torusGeom} material={material} />
      ))}
    </group>
  );
}

// 23: Spherical harmonics blob
function MicroHarmonics() {
  const ref = useRef<THREE.Mesh>(null);
  const originalPositions = useRef<Float32Array | null>(null);
  
  const geom = useMemo(() => new THREE.SphereGeometry(0.4, 24, 24), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: colors.violet, 
    emissive: colors.emerald, 
    emissiveIntensity: 0.4, 
    metalness: 0.4, 
    roughness: 0.3 
  }), []);

  useEffect(() => {
    const pos = geom.attributes.position as THREE.BufferAttribute;
    originalPositions.current = new Float32Array(pos.array);
    
    return () => {
      geom.dispose();
      mat.dispose();
    };
  }, [geom, mat]);

  useFrame(({ clock }) => {
    if (!ref.current || !originalPositions.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.3;

    const pos = geom.attributes.position as THREE.BufferAttribute;
    const orig = originalPositions.current;
    const t = clock.getElapsedTime();

    for (let i = 0; i < pos.count; i++) {
      const x = orig[i * 3];
      const y = orig[i * 3 + 1];
      const z = orig[i * 3 + 2];
      const theta = Math.atan2(Math.sqrt(x * x + z * z), y);
      const phi = Math.atan2(z, x);
      const harmonic = 1 + 0.15 * Math.sin(2 * theta) * Math.cos(3 * phi + t * 2);
      pos.setXYZ(i, x * harmonic, y * harmonic, z * harmonic);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  });

  return <mesh ref={ref} geometry={geom} material={mat} />;
}

// ---------------------------------------------------------------------------
// Animation selector based on hour
// ---------------------------------------------------------------------------
const animations = [
  MicroIcosahedron,    // 0 (midnight)
  MicroTorusKnot,      // 1
  MicroOctahedron,     // 2
  MicroDodecahedron,   // 3
  MicroTetrahedron,    // 4
  MicroTorus,          // 5
  MicroCone,           // 6
  MicroCylinder,       // 7
  MicroDoubleRing,     // 8
  MicroWireSphere,     // 9
  MicroCubeEdges,      // 10
  MicroTrefoil,        // 11
  MicroLissajous,      // 12 (noon)
  MicroStar,           // 13
  MicroSpiral,         // 14
  MicroHelix,          // 15
  MicroGyroscope,      // 16
  MicroBreathingSphere,// 17
  MicroPyramid,        // 18
  MicroAtom,           // 19
  MicroMobius,         // 20
  MicroKlein,          // 21
  MicroFlower,         // 22
  MicroHarmonics,      // 23
];

function HourlyAnimation() {
  const hour = useHour();
  const Animation = animations[hour % 24];
  return <Animation />;
}

// ---------------------------------------------------------------------------
// Main 3D Icon Component
// ---------------------------------------------------------------------------
function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[2, 2, 2]} intensity={0.8} color="#ffffff" />
      <HourlyAnimation />
    </>
  );
}

// Static fallback (original Sparkles icon)
function StaticFallback() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-violet-500 to-emerald-400 shadow-lg shadow-sky-500/20">
      <Sparkles className="h-5 w-5 text-white" />
      <div className="absolute inset-0 rounded-xl bg-white/20 mix-blend-overlay" />
    </div>
  );
}

export default function HeaderIcon3D() {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration detection for client-only 3D rendering
    setMounted(true);
    // Check reduced motion preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, []);

  // Show static fallback if not mounted, error, or reduced motion preferred
  if (!mounted || hasError || prefersReducedMotion) {
    return <StaticFallback />;
  }

  return (
    <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-lg shadow-sky-500/20">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 via-violet-500 to-emerald-400" />

      {/* 3D Canvas with error boundary */}
      <ThreeErrorBoundary fallback={<StaticFallback />}>
        <Suspense fallback={<StaticFallback />}>
          <Canvas
            camera={{ position: [0, 0, 2], fov: 45 }}
            dpr={1}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: "low-power",
            }}
            style={{ background: "transparent" }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
            onError={() => setHasError(true)}
          >
            <Scene />
          </Canvas>
        </Suspense>
      </ThreeErrorBoundary>

      {/* Glass overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-white/10 mix-blend-overlay" />
    </div>
  );
}
