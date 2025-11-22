"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react";
import * as THREE from "three";

function FloatingPolyhedron(props: JSX.IntrinsicElements["mesh"]) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = t * 0.25;
    ref.current.rotation.y = t * 0.35;
    ref.current.position.y = Math.sin(t * 0.7) * 0.2;
  });
  return (
    <mesh ref={ref} {...props} castShadow>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial
        metalness={0.4}
        roughness={0.15}
        color={new THREE.Color("#38bdf8")}
        emissive={new THREE.Color("#6366f1")}
        emissiveIntensity={1.3}
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
      <meshBasicMaterial color={props.color} transparent opacity={0.7} />
    </mesh>
  );
}

function StarField() {
  const ref = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    const numPoints = 420;
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

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.015;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        sizeAttenuation
        color="#38bdf8"
        transparent
        opacity={0.7}
      />
    </points>
  );
}

export default function ThreeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 40 }}
      className="h-[280px] w-full sm:h-[380px] md:h-[420px] lg:h-[460px]"
    >
      <color attach="background" args={["#020617"]} />
      <StarField />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.3}
        color={"#e5e7eb"}
        castShadow
      />
      <FloatingPolyhedron position={[0, 0, 0]} />
      <group scale={1.4}>
        <OrbitalRing radius={1.9} tilt={0.4} color="#38bdf8" />
        <OrbitalRing radius={2.4} tilt={-0.2} color="#22c55e" />
        <OrbitalRing radius={2.9} tilt={0.9} color="#a855f7" />
      </group>
      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.3}
        enablePan={false}
      />
    </Canvas>
  );
}
