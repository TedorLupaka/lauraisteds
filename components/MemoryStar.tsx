"use client";

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Memory, useMemoryStore } from '../hooks/useMemoryStore';

interface MemoryStarProps {
  memory: Memory;
}

// Reusable vector to avoid per-frame allocations (which can cause micro-stutters)
const _targetScale = new THREE.Vector3();

export default function MemoryStar({ memory }: MemoryStarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  const sparkRef = useRef(memory.isNew ? 15 : 0);
  const [hovered, setHovered] = useState(false);
  const isDiscovered = useMemoryStore(state => state.isMemoryDiscovered(memory.id));
  const setActiveMemory = useMemoryStore(state => state.setActiveMemory);
  const activeMemoryId = useMemoryStore(state => state.activeMemoryId);
  const discoverMemory = useMemoryStore(state => state.discoverMemory);

  const isActive = activeMemoryId === memory.id;
  const starColor = isDiscovered ? "#ffd700" : "#aaccff";

  useFrame((state) => {
    if (sparkRef.current > 0.01) {
      sparkRef.current *= 0.95; // smooth exponential decay
    } else {
      sparkRef.current = 0;
    }

    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      // Gentle floating — set Y directly, no lerp needed here as sin is already smooth
      groupRef.current.position.y = memory.position[1] + Math.sin(time * 0.8 + memory.position[0]) * 0.08;
      
      // Smooth pulsing scale using reusable vector
      const pulse = Math.sin(time * 1.5 + memory.position[2]) * 0.04;
      const target = hovered || isActive ? 1.25 : 1 + pulse + (sparkRef.current * 0.15);
      _targetScale.set(target, target, target);
      groupRef.current.scale.lerp(_targetScale, 0.08); // slower lerp = smoother
    }

    if (haloRef.current) {
      const material = haloRef.current.material as THREE.MeshBasicMaterial;
      // Lerp opacity smoothly
      const targetOpacity = hovered || isActive ? 0.55 : 0.25 + (sparkRef.current * 0.05);
      material.opacity += (targetOpacity - material.opacity) * 0.06;
    }

    if (lightRef.current) {
      // Smooth intensity transition — no abrupt jump on hover
      const targetIntensity = hovered || isActive ? 2.5 : 0.8 + sparkRef.current;
      lightRef.current.intensity += (targetIntensity - lightRef.current.intensity) * 0.06;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    discoverMemory(memory.id);
    setActiveMemory(memory.id);
  };

  return (
    <group 
      ref={groupRef}
      position={memory.position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Bright core — always at full white, drives bloom */}
      <mesh>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* Soft colour halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial 
          color={starColor} 
          transparent 
          opacity={0.25} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Smooth point light — intensity lerped every frame */}
      <pointLight 
        ref={lightRef}
        color={starColor} 
        intensity={0.8} 
        distance={5}
        decay={2}
      />
      
      {/* Tooltip on hover */}
      {hovered && !isActive && (
        <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-black/60 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-sm font-medium tracking-wide whitespace-nowrap border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {isDiscovered ? memory.title : "Undiscovered Memory"}
          </div>
        </Html>
      )}
    </group>
  );
}
