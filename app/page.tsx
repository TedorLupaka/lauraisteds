import Scene from '../components/Scene';
import OverlayUI from '../components/OverlayUI';
import MemoryPanel from '../components/MemoryPanel';
import AudioPlayer from '../components/AudioPlayer';
import IntroScreen from '../components/IntroScreen';

export default function Home() {
  return (
    <main className="relative w-full h-full bg-black overflow-hidden">
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
