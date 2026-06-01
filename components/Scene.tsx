"use client";

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Universe from './Universe';
import MemoryStar from './MemoryStar';
import Constellation from './Constellation';
import CameraRig from './CameraRig';
import FinalSequence from './FinalSequence';
import TrexConstellation from './TrexConstellation';
import { memories } from '../data/memories';

export default function Scene() {
  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <Canvas
        camera={{ position: [0, 0, 28], fov: 60 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#020208']} />

        <Suspense fallback={null}>
          <Universe />

          <group>
            {memories.map(memory => (
              <MemoryStar key={memory.id} memory={memory} />
            ))}
          </group>

          <Constellation />
          <FinalSequence />
          <CameraRig />

          {/* Post-processing effects — milder settings to eliminate flash */}
          <EffectComposer enableNormalPass={false}>
            <Bloom
              luminanceThreshold={0.9}
              luminanceSmoothing={0.3}
              mipmapBlur
              intensity={0.8}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
