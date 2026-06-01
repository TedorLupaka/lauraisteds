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
  
  discoverMemory: (id: string) => void;
  setActiveMemory: (id: string | null) => void;
  setFocusTarget: (target: [number, number, number] | null) => void;
  setHasSeenFinalSequence: (seen: boolean) => void;
  isMemoryDiscovered: (id: string) => boolean;
  isConstellationComplete: (constellationId: string, allMemories: Memory[]) => boolean;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  discoveredMemories: [],
  activeMemoryId: null,
  focusTarget: null,
  hasSeenFinalSequence: false,

  discoverMemory: (id) => set((state) => ({
    discoveredMemories: state.discoveredMemories.includes(id) 
      ? state.discoveredMemories 
      : [...state.discoveredMemories, id]
  })),

  setActiveMemory: (id) => set({ activeMemoryId: id }),

  setFocusTarget: (target) => set({ focusTarget: target }),

  setHasSeenFinalSequence: (seen) => set({ hasSeenFinalSequence: seen }),

  isMemoryDiscovered: (id) => get().discoveredMemories.includes(id),

  isConstellationComplete: (constellationId, allMemories) => {
    const memoriesInConstellation = allMemories.filter(m => m.constellationId === constellationId);
    if (memoriesInConstellation.length === 0) return false;
    
    return memoriesInConstellation.every(m => get().discoveredMemories.includes(m.id));
  }
}));
