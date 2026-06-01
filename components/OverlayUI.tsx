"use client";

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemoryStore } from '../hooks/useMemoryStore';
import { memories } from '../data/memories';

export default function OverlayUI() {
  const discoveredMemories = useMemoryStore(state => state.discoveredMemories);
  const activeMemoryId = useMemoryStore(state => state.activeMemoryId);
  const hasSeenFinalSequence = useMemoryStore(state => state.hasSeenFinalSequence);

  const totalMemories = memories.length;
  const discoveredCount = useMemo(() => {
    // Only count regular memories, not the final one
    return discoveredMemories.filter(id => id !== 'final_star').length;
  }, [discoveredMemories]);

  // Hide the main UI if a memory is actively being viewed to keep it clean
  const isHidden = activeMemoryId !== null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-8">

      {/* Top Left: Title */}
      <AnimatePresence>
        {!isHidden && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
            className=''

          >
            <h1 className="text-white/80 font-serif text-2xl tracking-widest drop-shadow-md">
              Constellations in our stars
            </h1>
            <p className="text-white/40 text-sm mt-1 tracking-wide">
              Every star holds a memory.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Right: Progress Tracker */}
      <AnimatePresence>
        {!isHidden && !hasSeenFinalSequence && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 1 }}
            className="self-end text-right"
          >
            <div className="text-white/60 text-sm font-mono tracking-widest mb-2">
              {discoveredCount} / {totalMemories} DISCOVERED
            </div>

            {/* Minimal Progress Bar */}
            <div className="w-32 h-[1px] bg-white/10 ml-auto relative">
              <motion.div
                className="absolute top-0 left-0 h-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                initial={{ width: 0 }}
                animate={{ width: `${(discoveredCount / totalMemories) * 100}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
