"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Star, MapPin } from 'lucide-react';
import { useMemoryStore } from '../hooks/useMemoryStore';
import { useMemo } from 'react';

export default function MemorySidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const dbMemories = useMemoryStore(state => state.dbMemories);
  const setActiveMemory = useMemoryStore(state => state.setActiveMemory);
  const discoveredMemories = useMemoryStore(state => state.discoveredMemories);

  // Optionally reverse the memories to show the newest at the top, or keep them as fetched.
  const sortedMemories = useMemo(() => {
    return [...dbMemories].reverse(); // Simple reverse to show latest added first
  }, [dbMemories]);

  const handleSelectMemory = (id: string) => {
    setActiveMemory(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="memory-sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex justify-end pointer-events-auto"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0" 
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-sm h-full border-l border-white/[0.08] flex flex-col"
            style={{
              background: 'rgba(8, 6, 18, 0.82)',
              backdropFilter: 'blur(28px)',
              boxShadow: '-32px 0 80px rgba(0,0,0,0.6), -10px 0 60px rgba(120,60,200,0.08)',
            }}
          >
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 p-6 flex items-center justify-between border-b border-white/[0.06]">
              <div>
                <h2 className="text-xl font-serif text-white tracking-wide">Memory Atlas</h2>
                <p className="text-[10px] text-white/30 mt-1 tracking-widest uppercase font-mono">
                  {dbMemories.length} Stars Discovered
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 transition-all duration-150 hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
              {sortedMemories.length === 0 ? (
                <div className="text-center p-8 mt-10">
                  <Star className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-xs text-white/40 font-mono uppercase tracking-widest leading-relaxed">
                    The sky is empty.<br/>Create your first memory star.
                  </p>
                </div>
              ) : (
                sortedMemories.map((memory, index) => {
                  const isDiscovered = discoveredMemories.includes(memory.id);
                  return (
                    <button
                      key={memory.id}
                      onClick={() => handleSelectMemory(memory.id)}
                      className="w-full text-left flex gap-4 px-6 py-4 border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.03] transition-colors duration-200 group"
                    >
                      <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                        {memory.image ? (
                          <img src={memory.image} alt={memory.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <Star size={18} className="text-white/30 group-hover:text-white/60 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-sm font-semibold text-white/90 truncate group-hover:text-white transition-colors">
                          {memory.title}
                        </h3>
                        {memory.date ? (
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-white/40 tracking-wider">
                            <Calendar size={10} />
                            <span className="truncate">{memory.date}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-white/40 tracking-wider">
                            <MapPin size={10} />
                            <span className="truncate">Deep Space</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </AnimatePresence>
  );
}
