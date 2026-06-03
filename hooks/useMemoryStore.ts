import { create } from 'zustand';

export interface Memory {
  id: string;
  title: string;
  date?: string;
  description: string;
  image?: string;
  audio?: string;
  position: [number, number, number];
  constellationId?: string;
  isNew?: boolean;
}

export interface Constellation {
  id: string;
  title: string;
}

interface MemoryState {
  discoveredMemories: string[];
  activeMemoryId: string | null;
  focusTarget: [number, number, number] | null;
  hasSeenFinalSequence: boolean;
  zoomSpeedMultiplier: number;
  autoRotateEnabled: boolean;
  dbMemories: Memory[];
  
  discoverMemory: (id: string) => void;
  setActiveMemory: (id: string | null) => void;
  setFocusTarget: (target: [number, number, number] | null) => void;
  setHasSeenFinalSequence: (seen: boolean) => void;
  setZoomSpeedMultiplier: (speed: number) => void;
  toggleAutoRotate: () => void;
  setDbMemories: (memories: Memory[]) => void;
  addDbMemory: (memory: Memory) => void;
  updateDbMemory: (id: string, updates: Partial<Memory>) => void;
  removeDbMemory: (id: string) => void;
  isMemoryDiscovered: (id: string) => boolean;
  isConstellationComplete: (constellationId: string, allMemories: Memory[]) => boolean;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  discoveredMemories: [],
  activeMemoryId: null,
  focusTarget: null,
  hasSeenFinalSequence: false,
  zoomSpeedMultiplier: 0.1,
  autoRotateEnabled: true,
  dbMemories: [],

  discoverMemory: (id) => set((state) => ({
    discoveredMemories: state.discoveredMemories.includes(id) 
      ? state.discoveredMemories 
      : [...state.discoveredMemories, id]
  })),

  setActiveMemory: (id) => set({ activeMemoryId: id }),

  setFocusTarget: (target) => set({ focusTarget: target }),

  setHasSeenFinalSequence: (seen) => set({ hasSeenFinalSequence: seen }),

  setZoomSpeedMultiplier: (speed) => set({ zoomSpeedMultiplier: speed }),

  toggleAutoRotate: () => set((state) => ({ autoRotateEnabled: !state.autoRotateEnabled })),

  setDbMemories: (memories) => set({ dbMemories: memories }),

  addDbMemory: (memory) => set((state) => {
    if (state.dbMemories.some(m => m.id === memory.id)) return state;
    return { dbMemories: [...state.dbMemories, memory] };
  }),

  updateDbMemory: (id, updates) => set((state) => ({
    dbMemories: state.dbMemories.map(m => m.id === id ? { ...m, ...updates } : m)
  })),

  removeDbMemory: (id) => set((state) => ({
    dbMemories: state.dbMemories.filter(m => m.id !== id)
  })),

  isMemoryDiscovered: (id) => get().discoveredMemories.includes(id),

  isConstellationComplete: (constellationId, allMemories) => {
    const memoriesInConstellation = allMemories.filter(m => m.constellationId === constellationId);
    if (memoriesInConstellation.length === 0) return false;
    
    return memoriesInConstellation.every(m => get().discoveredMemories.includes(m.id));
  }
}));
