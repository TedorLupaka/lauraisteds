"use client";

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemoryStore } from '../hooks/useMemoryStore';
import { memories } from '../data/memories';

export default function OverlayUI() {
  const discoveredMemories = useMemoryStore(state => state.discoveredMemories);
  const activeMemoryId = useMemoryStore(state => state.activeMemoryId);
  const hasSeenFinalSequence = useMemoryStore(state => state.hasSeenFinalSequence);
  const zoomSpeedMultiplier = useMemoryStore(state => state.zoomSpeedMultiplier);
  const setZoomSpeedMultiplier = useMemoryStore(state => state.setZoomSpeedMultiplier);
  const autoRotateEnabled = useMemoryStore(state => state.autoRotateEnabled);
  const toggleAutoRotate = useMemoryStore(state => state.toggleAutoRotate);

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

      {/* Bottom Section */}
      <div className="flex justify-between items-end w-full mt-auto">
        {/* Bottom Left: Controls */}
        <AnimatePresence>
          {!isHidden && !hasSeenFinalSequence && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 1 }}
              className="pointer-events-auto flex flex-col gap-2"
            >
              <div className="flex flex-col gap-1">
                <label htmlFor="zoomSpeed" className="text-white/60 text-xs font-mono tracking-widest uppercase">
                  Zoom Speed: {zoomSpeedMultiplier.toFixed(1)}x
                </label>
                <input
                  id="zoomSpeed"
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={zoomSpeedMultiplier}
                  onChange={(e) => setZoomSpeedMultiplier(parseFloat(e.target.value))}
                  className="w-32 accent-white/80 cursor-pointer h-1 bg-white/20 rounded-lg appearance-none"
                  style={{ WebkitAppearance: 'none' }}
                />
              </div>

              <div className="flex items-center gap-3 mt-4 cursor-pointer" onClick={toggleAutoRotate}>
                <div
                  className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ease-in-out flex ${autoRotateEnabled ? 'bg-white/40' : 'bg-white/10'}`}
                >
                  <motion.div
                    className="w-3 h-3 bg-white rounded-full shadow-md"
                    layout
                    initial={false}
                    animate={{
                      x: autoRotateEnabled ? 16 : 0
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                </div>
                <span className="text-white/60 text-xs font-mono tracking-widest uppercase select-none">
                  Auto Rotate
                </span>
              </div>
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
              className="text-right"
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

    </div>
  );
}
