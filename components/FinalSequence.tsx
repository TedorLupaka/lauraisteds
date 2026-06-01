"use client";

import { useMemo } from 'react';
import { useMemoryStore } from '../hooks/useMemoryStore';
import { memories, finalMemory } from '../data/memories';
import MemoryStar from './MemoryStar';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';

export default function FinalSequence() {
  const discoveredMemories = useMemoryStore(state => state.discoveredMemories);
  const hasSeenFinalSequence = useMemoryStore(state => state.hasSeenFinalSequence);
  const setHasSeenFinalSequence = useMemoryStore(state => state.setHasSeenFinalSequence);

  const isUnlocked = useMemo(() => {
    // Check if all regular memories are discovered
    return memories.every(m => discoveredMemories.includes(m.id));
  }, [discoveredMemories]);

  if (!isUnlocked) return null;

  return (
    <>
      <MemoryStar memory={finalMemory} />
      
      {!hasSeenFinalSequence && (
        <Html position={[0, 4, -8]} center>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, delay: 1 }}
            className="text-white text-center pointer-events-none"
            onAnimationComplete={() => setHasSeenFinalSequence(true)}
          >
            <h2 className="text-3xl font-serif text-yellow-200 tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              A New Star Has Appeared
            </h2>
          </motion.div>
        </Html>
      )}
    </>
  );
}
