"use client";

import { useMemo, useRef, useState } from 'react';
import { Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Subtle purple nebula dust cloud
function NebulaDust() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Scatter randomly within a sphere of radius ~15 (covers the constellation area)
      const r = Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Subtle purple-violet palette
      const shade = 0.4 + Math.random() * 0.6;
      colors[i * 3]     = 0.35 * shade; // R
      colors[i * 3 + 1] = 0.1 * shade;  // G
      colors[i * 3 + 2] = 0.9 * shade;  // B
    }

    return [positions, colors];
  }, []);

  // Very slow, smooth drift
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.007) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// Occasional shooting stars zipping across the sky
function ShootingStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isActive, setIsActive] = useState(false);
  
  const pos = useRef(new THREE.Vector3());
  const velocity = useRef(new THREE.Vector3());
  // Initial random delay between 5s and 45s so they don't all fire at once
  const timer = useRef(5 + Math.random() * 40);

  useFrame((state, delta) => {
    if (!isActive) {
      timer.current -= delta;
      if (timer.current <= 0) {
        setIsActive(true);
        // Start high up and far out
        pos.current.set(
          (Math.random() - 0.5) * 200,
          60 + Math.random() * 40,
          (Math.random() - 0.5) * 200
        );
        // Fast velocity downwards and across
        velocity.current.set(
          (Math.random() - 0.5) * 150,
          -60 - Math.random() * 60,
          (Math.random() - 0.5) * 150
        );

        if (meshRef.current) {
          meshRef.current.position.copy(pos.current);
          const direction = velocity.current.clone().normalize();
          // Cone tip (+Y) points backwards from velocity to create a trailing tail
          meshRef.current.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.negate()
          );
        }

        // Schedule next shot (between 1 and 3 minutes)
        timer.current = 60 + Math.random() * 120;
      }
    } else {
      // Move star
      pos.current.addScaledVector(velocity.current, delta);
      if (meshRef.current) {
        meshRef.current.position.copy(pos.current);
      }
      
      // Deactivate when it falls far below the scene
      if (pos.current.y < -100) {
        setIsActive(false);
      }
    }
  });

  return (
    <mesh ref={meshRef} visible={isActive}>
      {/* A cone creates a perfect bright head tapering into a tail */}
      <coneGeometry args={[0.08, 12, 8]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function ShootingStars() {
  return (
    <group>
      <ShootingStar />
      <ShootingStar />
      <ShootingStar />
    </group>
  );
}

export default function Universe() {
  return (
    <>
      {/* Deep space ambient light */}
      <ambientLight intensity={0.15} color="#080820" />
      
      {/* Main starfield — let Drei handle its own slow drift internally */}
      <Stars 
        radius={120} 
        depth={60} 
        count={6000} 
        factor={3} 
        saturation={0} 
        fade 
        speed={0.3} 
      />

      {/* Subtle purple nebula dust filling the constellation area */}
      <NebulaDust />

      {/* Occasional shooting stars */}
      <ShootingStars />
    </>
  );
}
