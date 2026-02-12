"use client";

import { useState, useEffect, useRef, useMemo, useLayoutEffect, type ElementRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, AlertTriangle, CheckCircle2, Info, Target, Minimize2, Maximize2, 
  ChevronRight, RotateCcw, Layers, Microscope, LayoutTemplate, MousePointer2
} from "lucide-react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { 
  Float, PerspectiveCamera, Stars, MeshTransmissionMaterial, 
  Text, Html, Trail, CameraControls, Environment, Grid
} from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

// ============================================================
// SHARED UTILS & SHADERS
// ============================================================

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

function ManifoldMesh({ level }: { level: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.Material>(null);
  
  // Define clipping planes
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
    const t = state.clock.getElapsedTime();
    
    // Rotate the manifold
    meshRef.current.rotation.x = t * 0.1;
    meshRef.current.rotation.y = t * 0.15;

    // Animate planes based on level
    planes.forEach((plane, i) => {
      const isActive = i < level;
      const targetDist = isActive ? 0.4 + Math.sin(t + i)*0.05 : 3.0;
      
      // Lerp current constant to target
      plane.constant += (targetDist - plane.constant) * 0.1;
    });
  });

  return (
    <group>
      {/* The Creative Manifold */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <icosahedronGeometry args={[1.5, 8]} />
        <MeshTransmissionMaterial
          ref={materialRef}
          backside
          samples={4}
          resolution={512}
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
        <PlaneVisualizer key={i} plane={plane} isActive={i < level} index={i} />
      ))}
    </group>
  );
}

function PlaneVisualizer({ plane, isActive, index }: { plane: THREE.Plane; isActive: boolean; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (!meshRef.current) return;
    const pos = plane.normal.clone().multiplyScalar(-plane.constant);
    meshRef.current.position.copy(pos);
    meshRef.current.lookAt(pos.clone().add(plane.normal));
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
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(4, 4)]} />
          <lineBasicMaterial color="#f43f5e" opacity={0.8} transparent toneMapped={false} />
        </lineSegments>
      )}
    </mesh>
  );
}

export function ConstraintViz() {
  const [level, setLevel] = useState(0);
  const percent = Math.max(1, Math.round(100 * Math.pow(0.4, level)));

  return (
    <div className="relative overflow-hidden group">
      <div className="op-viz-header">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight m-0 flex items-center gap-2">
              <Minimize2 className="w-5 h-5 text-amber-400" />
              The Manifold Slicer
            </h3>
            <p className="text-sm text-slate-400 m-0 mt-1">
              Constraints act as hyperplanes, slicing away valid creative solutions.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end">
             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Search Volume</span>
             <span className="text-xl font-mono font-bold text-amber-400 tabular-nums">{percent}%</span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-8">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl bg-[#050508] border border-white/5 overflow-hidden shadow-2xl">
          <Canvas shadows gl={{ localClippingEnabled: true }} camera={{ position: [0, 0, 5], fov: 45 }}>
            <color attach="background" args={['#050508']} />
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f43f5e" />
            <Environment preset="city" />
            
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
              <ManifoldMesh level={level} />
            </Float>
            
            <EffectGlitch trigger={level >= 5} />
            
            <EffectComposer enableNormalPass={false}>
              <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.6} />
              <Noise opacity={0.05} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
            
            <CameraControls minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} />
          </Canvas>

          {/* HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="h-px w-8 md:w-12 bg-amber-500/50" />
                <span className="text-[9px] md:text-[10px] font-mono text-amber-500/50 uppercase tracking-tighter">Hyperplane Analysis</span>
              </div>
              
              {/* Mobile Interaction Hint */}
              <div className="md:hidden flex items-center gap-1 text-white/20">
                <MousePointer2 className="w-3 h-3" />
                <span className="text-[9px] uppercase tracking-widest">Drag</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[9px] md:text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">Active Cuts</div>
              <AnimatePresence>
                {level === 0 ? (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-slate-500 italic text-xs">&gt; Unconstrained...</motion.div>
                ) : (
                  SLICE_LABELS.slice(0, level).map((label, i) => (
                    <motion.div 
                      key={label}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-rose-400"
                    >
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-sm shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                      {label}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 p-1 bg-white/5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-6 pr-2 pl-6 py-2">
          <div className="w-full flex items-center gap-4 py-2 md:py-0">
            <span className="text-xs font-mono text-slate-400 shrink-0 uppercase tracking-wider">Solution Space</span>
            <div className="h-1.5 flex-grow rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                animate={{ width: `${percent}%` }}
              />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setLevel(l => Math.min(l + 1, 6))}
              disabled={level >= 6}
              className="op-btn-action flex items-center justify-center gap-2 px-6 flex-grow md:flex-grow-0"
            >
              <Minimize2 className="w-3 h-3" /> SLICE
            </button>
            <button
              onClick={() => setLevel(0)}
              disabled={level === 0}
              className="op-btn-secondary w-12 flex items-center justify-center flex-grow md:flex-grow-0"
              aria-label="Reset"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EffectGlitch({ trigger }: { trigger: boolean }) {
  useFrame((state) => {
    if (trigger) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.05;
    } else {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, 0.1);
    }
  });
  return null;
}


// ============================================================
// 2. HOLOGRAPHIC TUNER (Quality Curve)
// ============================================================

function HologramMesh({ specificity }: { specificity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  useFrame((state) => {
    if (!shaderRef.current || !meshRef.current) return;
    const t = state.clock.elapsedTime;
    
    meshRef.current.rotation.y = t * 0.2;
    
    // Pass uniforms
    shaderRef.current.uniforms.uTime.value = t;
    
    let distortion = 0;
    let opacity = 0.3;
    const color = new THREE.Color("#f59e0b"); // Default Amber
    
    if (specificity < 0.3) {
      // Vague State
      distortion = (0.3 - specificity) * 2.0;
      opacity = 0.2 + specificity; 
      color.set("#f59e0b");
    } else if (specificity < 0.65) {
      // Sweet Spot
      distortion = 0;
      opacity = 0.9;
      color.set("#10b981"); // Emerald
    } else {
      // Overprompted
      const intensity = (specificity - 0.65) / 0.35;
      distortion = intensity * 1.5; // High distortion
      opacity = 0.8;
      color.set("#f43f5e"); // Rose
      
      // Shake mesh
      meshRef.current.position.x = Math.sin(t * 50) * 0.02 * intensity;
    }
    
    shaderRef.current.uniforms.uDistortion.value = THREE.MathUtils.lerp(
      shaderRef.current.uniforms.uDistortion.value, 
      distortion, 
      0.1
    );
    shaderRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      shaderRef.current.uniforms.uOpacity.value,
      opacity,
      0.1
    );
    shaderRef.current.uniforms.uColor.value.lerp(color, 0.1);
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
        uniforms={{
          uTime: { value: 0 },
          uDistortion: { value: 0 },
          uOpacity: { value: 0.5 },
          uColor: { value: new THREE.Color("#f59e0b") }
        }}
        toneMapped={false} // Important for bloom
      />
    </mesh>
  );
}

export function QualityCurveViz() {
  const [specificity, setSpecificity] = useState(0.1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const zone = specificity < 0.3 ? "vague" : specificity < 0.65 ? "sweet" : "over";
  const labels = {
    vague: { text: "UNDERSPECIFIED", color: "text-amber-400", desc: "Model hallucinates to fill gaps." },
    sweet: { text: "RESONANT", color: "text-emerald-400", desc: "Perfect signal-to-noise ratio." },
    over: { text: "OVERCONSTRAINED", color: "text-rose-400", desc: "Conflicting constraints cause failure." }
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden group">
      <div className="op-viz-header">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight m-0 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              The Holographic Tuner
            </h3>
            <p className="text-sm text-slate-400 m-0 mt-1">
              Tune the prompt specificity to find the resonance frequency.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-8">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl bg-[#050508] border border-white/5 overflow-hidden shadow-2xl">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
          
          <Canvas gl={{ alpha: true }} camera={{ position: [0, 0, 4] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
              <HologramMesh specificity={specificity} />
            </Float>
            <EffectGlitch trigger={zone === "over"} />
            
            <EffectComposer enableNormalPass={false}>
              <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.2} radius={0.5} />
              <Noise opacity={0.1} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
          </Canvas>

          {/* Overlay Stats */}
          <div className="absolute top-6 left-6 font-mono text-[10px] md:text-xs space-y-1">
            <div className="text-slate-500">SIGNAL_INTEGRITY</div>
            <div className={`text-xl font-bold ${labels[zone].color}`}>
              {Math.round((zone === "sweet" ? 1 : zone === "vague" ? specificity/0.3 : (1-specificity)/0.35) * 100)}%
            </div>
          </div>

          <div className="absolute top-6 right-6 font-mono text-[10px] md:text-xs text-right space-y-1">
            <div className="text-slate-500">MODE</div>
            <div className={`text-lg font-bold tracking-widest ${labels[zone].color}`}>
              {labels[zone].text}
            </div>
          </div>
          
          {/* Central Message */}
          <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none px-4 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={zone}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10"
              >
                <span className={`text-xs md:text-sm font-medium ${labels[zone].color}`}>
                  {labels[zone].desc}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Synth Knob Control (Slider) */}
        <div className="mt-8 px-4">
          <div className="relative h-12 flex items-center touch-none">
            {/* Track */}
            <div className="absolute left-0 right-0 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[30%] bg-amber-500/20" />
              <div className="absolute left-[30%] top-0 bottom-0 w-[35%] bg-emerald-500/20" />
              <div className="absolute left-[65%] top-0 bottom-0 w-[35%] bg-rose-500/20" />
            </div>
            
            {/* Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={specificity}
              onChange={(e) => setSpecificity(parseFloat(e.target.value))}
              className="relative z-10 w-full h-full opacity-0 cursor-pointer"
              aria-label="Adjust prompt specificity"
            />
            
            {/* Visual Thumb */}
            <motion.div 
              className="absolute h-6 w-6 rounded-full bg-white border-2 border-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.5)] pointer-events-none"
              style={{ left: `calc(${specificity * 100}% - 12px)` }}
            />
          </div>
          
          <div className="flex justify-between text-[9px] md:text-[10px] font-mono text-slate-500 uppercase mt-2">
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

function NodeNetwork({ mode }: { mode: "plan" | "execute" }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
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
        {[
          [-3, 2, -2], [3, 1, -3], [-2, -2, -1], [2, -3, -2],
          [0, 4, -4], [0, -4, -4]
        ].map((pos, i) => (
          <group key={i} position={pos as [number, number, number]}>
            <mesh>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial 
                color="#64748b" 
                transparent 
                opacity={mode === "plan" ? 0.8 : 0.1} 
              />
            </mesh>
            {/* Connection Line */}
            <ConnectionLine start={new THREE.Vector3(...(pos as [number, number, number]))} end={new THREE.Vector3(0,0,0)} opacity={mode === "plan" ? 0.2 : 0} />
          </group>
        ))}
      </group>
    </group>
  );
}

function ConnectionLine({ start, end, opacity }: { start: THREE.Vector3, end: THREE.Vector3, opacity: number }) {
  const lineRef = useRef<THREE.Line>(null);
  useLayoutEffect(() => {
    if (lineRef.current) {
      lineRef.current.geometry.setFromPoints([start, end]);
    }
  }, [start, end]);
  const lineObj = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ color: "white", transparent: true, opacity });
    return new THREE.Line(geometry, material);
  }, [opacity]);
  return <primitive ref={lineRef} object={lineObj} />;
}

export function PlanExecuteViz() {
  const [mode, setMode] = useState<"plan" | "execute">("plan");
  const controlsRef = useRef<CameraControls>(null);

  useEffect(() => {
    if (controlsRef.current) {
      if (mode === "plan") {
        // Wide view
        controlsRef.current.setLookAt(0, 0, 12, 0, 0, 0, true);
      } else {
        // Macro view (zoom inside)
        controlsRef.current.setLookAt(0, 0, 2.5, 0, 0, 0, true);
      }
    }
  }, [mode]);

  return (
    <div>
      <div className="op-viz-header">
        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight m-0 flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-amber-400" />
          The Macro-Micro Lens
        </h3>
        <p className="text-sm text-slate-400 m-0">
          Zoom out for planning context, zoom in for execution precision.
        </p>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-8">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl bg-[#050508] border border-white/5 overflow-hidden shadow-2xl">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={40} />
            <CameraControls ref={controlsRef} minDistance={2} maxDistance={20} enabled={false} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Environment preset="city" />
            
            <NodeNetwork mode={mode} />
            
            {/* Grid floor for depth reference */}
            <Grid 
              position={[0, -5, 0]} 
              args={[20, 20]} 
              cellColor="#334155" 
              sectionColor="#1e293b" 
              fadeDistance={15} 
            />
            
            <EffectComposer enableNormalPass={false}>
              <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.0} radius={0.4} />
              <Noise opacity={0.05} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
          </Canvas>

          {/* Mode Switcher HUD */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 pointer-events-none">
            <button
              onClick={() => setMode("plan")}
              className={`pointer-events-auto px-6 py-3 rounded-xl border flex items-center gap-2 transition-all duration-500 ${
                mode === "plan" 
                  ? "bg-amber-500 text-white border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                  : "bg-black/40 text-slate-400 border-white/10 hover:bg-white/5"
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Plan (Macro)</span>
            </button>
            
            <button
              onClick={() => setMode("execute")}
              className={`pointer-events-auto px-6 py-3 rounded-xl border flex items-center gap-2 transition-all duration-500 ${
                mode === "execute" 
                  ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]" 
                  : "bg-black/40 text-slate-400 border-white/10 hover:bg-white/5"
              }`}
            >
              <Microscope className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Execute (Micro)</span>
            </button>
          </div>
        </div>
        
        {/* Helper Text */}
        <div className="mt-6 flex justify-between text-xs text-slate-500 font-mono uppercase tracking-widest px-2">
          <span>Current Context: {mode === "plan" ? "Global Graph" : "Local Node"}</span>
          <span>Zoom: {mode === "plan" ? "1x" : "10x"}</span>
        </div>
      </div>
    </div>
  );
}
