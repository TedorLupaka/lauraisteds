"use client";

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Star } from 'lucide-react';
import { useMemoryStore } from '../hooks/useMemoryStore';

export default function MemoryPanel() {
  const activeMemoryId = useMemoryStore(state => state.activeMemoryId);
  const setActiveMemory = useMemoryStore(state => state.setActiveMemory);
  const dbMemories = useMemoryStore(state => state.dbMemories);

  const activeMemory = useMemo(() => {
    if (!activeMemoryId) return null;
    return dbMemories.find(m => m.id === activeMemoryId) || null;
  }, [activeMemoryId, dbMemories]);

  return (
    <AnimatePresence>
      {activeMemory && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-80 max-w-[90vw] z-50"
        >
          {/* Glassmorphism Panel */}
          <div className="relative overflow-hidden rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
            
            {/* Ambient glow — gradient instead of blur for mobile performance */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-2xl pointer-events-none" />

            {/* Image — full-bleed at the top if present */}
            {activeMemory.image && (
              <div className="relative w-full h-52 overflow-hidden">
                <img
                  src={activeMemory.image}
                  alt={activeMemory.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient fade into the panel below */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
              </div>
            )}

            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h2 className={`text-2xl font-serif text-white leading-tight pr-4 ${activeMemory.image ? 'mt-0' : ''}`}>
                  {activeMemory.title}
                </h2>
                <button 
                  onClick={() => setActiveMemory(null)}
                  className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Metadata */}
              {activeMemory.date && (
                <div className="flex items-center text-white/50 text-sm mb-4 relative z-10">
                  <Calendar size={14} className="mr-2" />
                  <span>{activeMemory.date}</span>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10">
                <p className="text-white/80 leading-relaxed text-sm whitespace-pre-wrap">
                  {activeMemory.description}
                </p>
              </div>

              {/* Footer / Status */}
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40 relative z-10">
                <span className="flex items-center">
                  <Star size={12} className="mr-1 text-yellow-500/50" />
                  Memory Recovered
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
