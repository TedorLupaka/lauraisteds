"use client";

import { useRef, useState } from 'react';
import { Line, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Anatomical anchor points (all at z=50, facing left, cute cartoon style) ───

// Head & Outline
const HEAD_TOP: [number, number, number] = [-4, 45, 50];
const HEAD_BACK: [number, number, number] = [2, 42, 50];
const NECK_BACK: [number, number, number] = [6, 32, 50];
const MID_BACK: [number, number, number] = [8, 22, 50];
const RUMP: [number, number, number] = [12, 12, 50];
const TAIL_TOP: [number, number, number] = [20, 8, 50];
const TAIL_TIP: [number, number, number] = [28, 6, 50];
const TAIL_BOTTOM: [number, number, number] = [16, -2, 50];
const BACK_LEG_BACK: [number, number, number] = [10, -6, 50];
const BACK_HEEL: [number, number, number] = [10, -14, 50];
const BACK_TOE: [number, number, number] = [4, -14, 50];
const BACK_LEG_FRONT: [number, number, number] = [6, -4, 50];
const BELLY_BOTTOM: [number, number, number] = [0, 0, 50];
const FRONT_LEG_BACK: [number, number, number] = [-2, -6, 50];
const FRONT_HEEL: [number, number, number] = [-1, -14, 50];
const FRONT_TOE: [number, number, number] = [-7, -14, 50];
const FRONT_LEG_FRONT: [number, number, number] = [-8, -6, 50];
const BELLY_MID: [number, number, number] = [-10, 6, 50];
const CHEST: [number, number, number] = [-9, 20, 50];
const THROAT: [number, number, number] = [-7, 28, 50];
const JAW_BOTTOM: [number, number, number] = [-12, 28, 50];
const SNOUT_FRONT: [number, number, number] = [-16, 34, 50];
const SNOUT_TOP: [number, number, number] = [-14, 42, 50];

// Mouth smile line
const MOUTH_CORNER: [number, number, number] = [-8, 30, 50];

// Arms
const ARM1_BASE: [number, number, number] = [-8, 24, 50];
const ARM1_ELBOW: [number, number, number] = [-13, 24, 50];
const ARM1_HAND: [number, number, number] = [-15, 21, 50];

const ARM2_BASE: [number, number, number] = [-9, 14, 50];
const ARM2_ELBOW: [number, number, number] = [-14, 14, 50];
const ARM2_HAND: [number, number, number] = [-16, 11, 50];

// Eye
const EYE: [number, number, number] = [-9, 36, 50];

// Belly Stripes & Inner Belly Line
const BELLY_LINE_TOP: [number, number, number] = [-2, 28, 50];
const BELLY_LINE_MID: [number, number, number] = [-1, 14, 50];
const STRIPE_1: [number, number, number] = [-3, 20, 50];
const STRIPE_2: [number, number, number] = [-4, 6, 50];

// Spikes (Zig-zags along the back)
const SPIKE_1: [number, number, number] = [-1, 49, 50];
const SPIKE_2: [number, number, number] = [6, 42, 50];
const SPIKE_3: [number, number, number] = [11, 31, 50];
const SPIKE_4: [number, number, number] = [13, 19, 50];
const SPIKE_5: [number, number, number] = [18, 12, 50];
const SPIKE_6: [number, number, number] = [25, 9, 50];

// ─── Line segment groups ─────────────────────────────────────────────────────

const OUTLINE = [
  HEAD_TOP, HEAD_BACK, NECK_BACK, MID_BACK, RUMP, TAIL_TOP, TAIL_TIP, TAIL_BOTTOM,
  BACK_LEG_BACK, BACK_HEEL, BACK_TOE, BACK_LEG_FRONT, BELLY_BOTTOM,
  FRONT_LEG_BACK, FRONT_HEEL, FRONT_TOE, FRONT_LEG_FRONT, BELLY_MID, CHEST,
  THROAT, JAW_BOTTOM, SNOUT_FRONT, SNOUT_TOP, HEAD_TOP
];

const SMILE = [SNOUT_FRONT, MOUTH_CORNER];
const ARM_1 = [ARM1_BASE, ARM1_ELBOW, ARM1_HAND];
const ARM_2 = [ARM2_BASE, ARM2_ELBOW, ARM2_HAND];
const BELLY_INNER = [THROAT, BELLY_LINE_TOP, BELLY_LINE_MID, BELLY_BOTTOM];
const BELLY_STRIPE_1 = [CHEST, STRIPE_1];
const BELLY_STRIPE_2 = [BELLY_MID, STRIPE_2];

const SPIKE_LINE_1 = [HEAD_TOP, SPIKE_1, HEAD_BACK];
const SPIKE_LINE_2 = [HEAD_BACK, SPIKE_2, NECK_BACK];
const SPIKE_LINE_3 = [NECK_BACK, SPIKE_3, MID_BACK];
const SPIKE_LINE_4 = [MID_BACK, SPIKE_4, RUMP];
const SPIKE_LINE_5 = [RUMP, SPIKE_5, TAIL_TOP];
const SPIKE_LINE_6 = [TAIL_TOP, SPIKE_6, TAIL_TIP];

// Unique stars array
const ALL_STARS = Array.from(new Set([
  ...OUTLINE, ...SMILE, ...ARM_1, ...ARM_2, ...BELLY_INNER, ...BELLY_STRIPE_1, ...BELLY_STRIPE_2,
  SPIKE_1, SPIKE_2, SPIKE_3, SPIKE_4, SPIKE_5, SPIKE_6, EYE
]));

// ─── Sub-components ──────────────────────────────────────────────────────────

import { useMemoryStore } from '../hooks/useMemoryStore';

const _targetScale = new THREE.Vector3();

function TrexStar({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  
  const setFocusTarget = useMemoryStore(state => state.setFocusTarget);

  const starColor = discovered ? "#ffd700" : "#aaccff";

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      const pulse = Math.sin(t * 1.6 + position[0] * 0.4) * 0.04;
      const target = hovered || discovered ? 1.25 : 1 + pulse;
      _targetScale.set(target, target, target);
      groupRef.current.scale.lerp(_targetScale, 0.08);
    }
    if (haloRef.current) {
      const material = haloRef.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = hovered || discovered ? 0.55 : 0.25;
      material.opacity += (targetOpacity - material.opacity) * 0.06;
    }
    if (lightRef.current) {
      const targetIntensity = hovered || discovered ? 2.5 : 0.8;
      lightRef.current.intensity += (targetIntensity - lightRef.current.intensity) * 0.06;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setDiscovered(true);
        if (groupRef.current) {
          const worldPos = new THREE.Vector3();
          groupRef.current.getWorldPosition(worldPos);
          setFocusTarget([worldPos.x, worldPos.y, worldPos.z]);
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Invisible enlarged hit target for easy clicking from far away */}
      <mesh visible={false}>
        <sphereGeometry args={[3, 8, 8]} />
      </mesh>

      {/* Bright core */}
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      
      {/* Soft color halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshBasicMaterial 
          color={starColor} 
          transparent 
          opacity={0.25} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      
      {/* Smooth point light */}
      <pointLight 
        ref={lightRef}
        color={starColor} 
        intensity={0.8} 
        distance={5}
        decay={2}
      />

      {/* Tooltip */}
      {(hovered || discovered) && (
        <Html position={[0, 0.6, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-black/60 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-sm font-medium tracking-wide whitespace-nowrap border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {discovered ? "Rawr! 🦖 I love you!" : "Undiscovered Dinosaur"}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const lineProps = {
  transparent: true,
  dashed: false,
};

export default function TrexConstellation() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.12) * 0.012;
    }
  });

  return (
    // Outer group handles position, scale, and facing the center (0,0,0)
    <group
      position={[650, 50, -150]}
      scale={2}
      ref={(node) => {
        if (node) node.lookAt(0, 0, 0);
      }}
    >
      {/* Inner group handles the subtle breathing animation */}
      <group ref={groupRef}>
        {/* === Lines === */}
        <Line points={OUTLINE} color="#bb88ff" lineWidth={1.5} opacity={0.35} {...lineProps} />
        <Line points={SMILE} color="#aa77ee" lineWidth={1.2} opacity={0.30} {...lineProps} />
        <Line points={ARM_1} color="#cc99ff" lineWidth={1.0} opacity={0.28} {...lineProps} />
        <Line points={ARM_2} color="#cc99ff" lineWidth={1.0} opacity={0.28} {...lineProps} />
        <Line points={BELLY_INNER} color="#9966dd" lineWidth={1.0} opacity={0.25} {...lineProps} />
        <Line points={BELLY_STRIPE_1} color="#9966dd" lineWidth={0.8} opacity={0.22} {...lineProps} />
        <Line points={BELLY_STRIPE_2} color="#9966dd" lineWidth={0.8} opacity={0.22} {...lineProps} />
        <Line points={SPIKE_LINE_1} color="#aa77ee" lineWidth={1.2} opacity={0.30} {...lineProps} />
        <Line points={SPIKE_LINE_2} color="#aa77ee" lineWidth={1.2} opacity={0.30} {...lineProps} />
        <Line points={SPIKE_LINE_3} color="#aa77ee" lineWidth={1.2} opacity={0.30} {...lineProps} />
        <Line points={SPIKE_LINE_4} color="#aa77ee" lineWidth={1.2} opacity={0.30} {...lineProps} />
        <Line points={SPIKE_LINE_5} color="#aa77ee" lineWidth={1.2} opacity={0.30} {...lineProps} />
        <Line points={SPIKE_LINE_6} color="#aa77ee" lineWidth={1.2} opacity={0.30} {...lineProps} />

        {/* === Stars at each node === */}
        {ALL_STARS.map((pos, i) => (
          <TrexStar key={i} position={pos} />
        ))}
      </group>
    </group>
  );
}
