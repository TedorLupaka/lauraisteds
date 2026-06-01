"use client";

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useMemoryStore } from '../hooks/useMemoryStore';
import { memories, constellations } from '../data/memories';

export default function Constellation() {
  const isConstellationComplete = useMemoryStore(state => state.isConstellationComplete);
  
  // Create an array of lines to draw for completed constellations
  const linesToDraw = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    
    constellations.forEach(constellation => {
      if (isConstellationComplete(constellation.id, memories)) {
        // Get all memories in this constellation
        const constellationMemories = memories.filter(m => m.constellationId === constellation.id);
        
        // Simple way: connect them in order
        if (constellationMemories.length > 1) {
          const points = constellationMemories.map(m => new THREE.Vector3(...m.position));
          // Connect the last to the first to make a closed shape if desired, or just a path
          // For now, just a path through them
          lines.push(points);
        }
      }
    });
    
    return lines;
  }, [isConstellationComplete]);

  // Group to handle gentle animation of the lines
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Very subtle breathing effect for the constellation lines
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {linesToDraw.map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#aaccff"
          lineWidth={2}
          transparent
          opacity={0.3}
          dashed={false}
        />
      ))}
    </group>
  );
}
