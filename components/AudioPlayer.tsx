'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  // Try to start playback; browsers may block until a user gesture occurs
  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || started) return;
    try {
      await audio.play();
      setStarted(true);
    } catch {
      // Autoplay blocked — will retry on first user interaction
    }
  }, [started]);

  useEffect(() => {
    const audio = new Audio('/LOVE - Soaking worship instrumental  Prayer and Devotional.mp3');
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    // Attempt immediate autoplay
    tryPlay();

    // Fallback: start on the very first user interaction anywhere on the page
    const startOnInteraction = () => {
      tryPlay();
      window.removeEventListener('click', startOnInteraction);
      window.removeEventListener('keydown', startOnInteraction);
      window.removeEventListener('touchstart', startOnInteraction);
    };

    window.addEventListener('click', startOnInteraction);
    window.addEventListener('keydown', startOnInteraction);
    window.addEventListener('touchstart', startOnInteraction);

    return () => {
      audio.pause();
      audio.src = '';
      window.removeEventListener('click', startOnInteraction);
      window.removeEventListener('keydown', startOnInteraction);
      window.removeEventListener('touchstart', startOnInteraction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);

    // If audio hasn't started yet, kick it off on this click
    if (!started) tryPlay();
  };

  return (
    <button
      onClick={toggleMute}
      aria-label={muted ? 'Unmute background music' : 'Mute background music'}
      title={muted ? 'Unmute music' : 'Mute music'}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.85)',
        fontSize: '18px',
        transition: 'background 0.2s, transform 0.15s',
        boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
    >
      {muted ? '🔇' : '🎵'}
    </button>
  );
}
