import Scene from '../components/Scene';
import OverlayUI from '../components/OverlayUI';
import MemoryPanel from '../components/MemoryPanel';
import AudioPlayer from '../components/AudioPlayer';
import IntroScreen from '../components/IntroScreen';
import MemoryStoreInit from '../components/MemoryStoreInit';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Memory } from '@/hooks/useMemoryStore';

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: memoryStars } = await supabase.from('memory_stars').select();

  const dbMemories: Memory[] = (memoryStars || []).map((star: any) => ({
    id: star.id,
    title: star.title,
    date: star.date,
    description: star.description,
    position: [star.position_x, star.position_y, star.position_z],
    constellationId: star.constellation_id,
    image: star.image_url ?? undefined,
  }));

  return (
    <main className="relative w-full h-full bg-black overflow-hidden">
      <MemoryStoreInit dbMemories={dbMemories} />

      {/* Intro overlay — shown once on first visit */}
      <IntroScreen />

      {/* 3D Canvas Layer */}
      <Scene />
      
      {/* UI Layers */}
      <OverlayUI />
      <MemoryPanel />

      {/* Background Music */}
      <AudioPlayer />
    </main>
  );
}
