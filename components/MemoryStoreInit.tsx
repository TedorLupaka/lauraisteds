"use client";

import { useEffect, useRef } from "react";
import { useMemoryStore, Memory } from "../hooks/useMemoryStore";
import { createClient } from "../utils/supabase/client";

export default function MemoryStoreInit({ dbMemories }: { dbMemories: Memory[] }) {
  const initialized = useRef(false);
  const supabase = createClient();
  const addDbMemory = useMemoryStore(state => state.addDbMemory);
  const updateDbMemory = useMemoryStore(state => state.updateDbMemory);
  const removeDbMemory = useMemoryStore(state => state.removeDbMemory);
  
  // Hydrate store exactly once on mount
  if (!initialized.current) {
    useMemoryStore.setState({ dbMemories });
    initialized.current = true;
  }

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'memory_stars',
        },
        (payload) => {
          const star = payload.new;
          addDbMemory({
            id: star.id,
            title: star.title,
            date: star.date,
            description: star.description,
            position: [star.position_x, star.position_y, star.position_z],
            constellationId: star.constellation_id,
            image: star.image_url ?? undefined,
            isNew: true, // Give realtime inserts the spark effect too!
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'memory_stars',
        },
        (payload) => {
          const star = payload.new;
          updateDbMemory(star.id, {
            title: star.title,
            date: star.date,
            description: star.description,
            position: [star.position_x, star.position_y, star.position_z],
            constellationId: star.constellation_id,
            image: star.image_url ?? undefined,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'memory_stars',
        },
        (payload) => {
          removeDbMemory(payload.old.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, addDbMemory, updateDbMemory, removeDbMemory]);

  return null;
}
