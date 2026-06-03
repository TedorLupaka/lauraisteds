'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FONT = "'Cormorant Garamond', 'Georgia', serif";

// Sequence of texts shown on the single line.
// All but the last will be typed then erased before the next appears.
const SEQUENCE = [
  { text: "Hey babe", charDelay: 150, eraseDelay: 55, holdAfter: 3000 },
  { text: "It's... me", charDelay: 105, eraseDelay: 55, holdAfter: 2000 },
  { text: "Ted.", charDelay: 140, eraseDelay: 80, holdAfter: 2500 },
  { text: "Welcome to our universe", charDelay: 150, eraseDelay: 50, holdAfter: 2000 }, // last — no erase
  { text: "where every star holds a memory", charDelay: 150, eraseDelay: 20, holdAfter: 2000 },
];

// Extra pause after punctuation characters while typing
const PUNCTUATION_PAUSE: Record<string, number> = {
  '.': 380, ',': 160, '!': 320, '?': 300,
};

// How long the final line stays visible before the whole intro fades out
const HOLD_DURATION = 2400;

type Phase = 'tap' | 'typing' | 'done';

export default function IntroScreen() {
  const [phase, setPhase] = useState<Phase>('tap');
  const [visible, setVisible] = useState(true);
  const [displayed, setDisplayed] = useState('');   // single line
  const [showCursor, setShowCursor] = useState(false);
  const cancelRef = useRef(false);

  const startTyping = () => {
    if (phase !== 'tap') return;
    setPhase('typing');
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    cancelRef.current = true;
    setPhase('done');
    setVisible(false);
  };

  useEffect(() => {
    if (phase !== 'typing') return;

    cancelRef.current = false;
    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    async function run() {
      setShowCursor(true);

      for (let si = 0; si < SEQUENCE.length; si++) {
        const { text, charDelay, eraseDelay, holdAfter } = SEQUENCE[si];
        const isLast = si === SEQUENCE.length - 1;

        // ── TYPE ──
        for (let ci = 1; ci <= text.length; ci++) {
          if (cancelRef.current) return;
          setDisplayed(text.slice(0, ci));
          const ch = text[ci - 1];
          const extra = PUNCTUATION_PAUSE[ch] ?? 0;
          await sleep(charDelay + extra);
        }

        // Hold after fully typed
        if (holdAfter > 0) await sleep(holdAfter);
        if (cancelRef.current) return;

        if (!isLast) {
          // ── ERASE ──
          const len = text.length;
          for (let ci = len - 1; ci >= 0; ci--) {
            if (cancelRef.current) return;
            setDisplayed(text.slice(0, ci));
            await sleep(eraseDelay);
          }

          // Brief pause between sequences
          await sleep(350);
          if (cancelRef.current) return;
        }
      }

      // Hold final text then fade out
      setShowCursor(false);
      await sleep(HOLD_DURATION);
      if (!cancelRef.current) {
        setPhase('done');
        setVisible(false);
      }
    }

    run();
    return () => { cancelRef.current = true; };
  }, [phase]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          onClick={startTyping}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            pointerEvents: 'all',
            cursor: phase === 'tap' ? 'pointer' : 'default',
          }}
        >
          {/* Soft dark vignette behind text only */}
          <div style={{
            position: 'absolute',
            width: '560px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(2,2,14,0.70) 0%, transparent 75%)',
            filter: 'blur(18px)',
            pointerEvents: 'none',
          }} />

          {/* ── PHASE: tap prompt ── */}
          <AnimatePresence mode="wait">
            {phase === 'tap' && (
              <motion.div
                key="tap"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
              >
                {/* Pulsing ring */}
                <div style={{ position: 'relative', width: '72px', height: '72px' }}>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(200,180,255,0.6)' }}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.2, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                    style={{ position: 'absolute', inset: '12px', borderRadius: '50%', border: '1px solid rgba(200,180,255,0.5)' }}
                  />
                  <div style={{
                    position: 'absolute', inset: '24px', borderRadius: '50%',
                    background: 'rgba(200,180,255,0.25)',
                    boxShadow: '0 0 20px rgba(180,140,255,0.4)',
                  }} />
                </div>

                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    fontFamily: FONT,
                    fontSize: '0.95rem',
                    letterSpacing: '0.3em',
                    color: 'rgba(200,180,255,0.75)',
                    textTransform: 'uppercase',
                    margin: 0,
                  }}
                >
                  Tap to begin
                </motion.p>
              </motion.div>
            )}

            {/* ── PHASE: typing ── */}
            {phase === 'typing' && (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: 'center', padding: '0 32px' }}
              >
                <p style={{
                  fontFamily: FONT,
                  fontSize: '2.4rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.95)',
                  letterSpacing: '0.03em',
                  lineHeight: 1.6,
                  textShadow: '0 0 24px rgba(0,0,0,0.9), 0 0 48px rgba(180,140,255,0.5)',
                  margin: 0,
                  minHeight: '3rem',
                }}>
                  {displayed}
                  {showCursor && (
                    <span style={{
                      display: 'inline-block',
                      animation: 'introBlink 0.75s step-end infinite',
                      marginLeft: '2px',
                      color: 'rgba(200,180,255,0.9)',
                    }}>|</span>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── SKIP BUTTON ── */}
          <button
            onClick={handleSkip}
            style={{
              position: 'absolute',
              bottom: '40px',
              fontFamily: FONT,
              fontSize: '0.8rem',
              letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            Skip Intro
          </button>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
            @keyframes introBlink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
