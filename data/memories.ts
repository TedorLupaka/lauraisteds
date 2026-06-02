import { Memory, Constellation } from '../hooks/useMemoryStore';

export const constellations: Constellation[] = [
  { id: 'beginning', title: 'The Beginning' },
  { id: 'adventures', title: 'Adventures Together' },
  { id: 'quiet_moments', title: 'Quiet Moments' },
  { id: 'the_cluster', title: 'The Cluster' }
];

const manualMemories: Memory[] = [
  // The Beginning Constellation
  {
    id: 'first_meet',
    title: 'The First Time We Met',
    date: 'Placeholder Date',
    description: 'We met and everything changed. The air felt different, and I knew right then that this was the start of something truly special.',
    position: [0, 2, -8], // Front
    constellationId: 'beginning'
  },
  {
    id: 'first_date',
    title: 'Our First Date',
    date: 'Placeholder Date',
    description: 'Nervous laughter, shared smiles, and hours that felt like minutes. We talked until the place closed and still didn\'t want to leave.',
    position: [6, 1, -5], // Front Right
    constellationId: 'beginning'
  },
  {
    id: 'first_kiss',
    title: 'The First Kiss',
    date: 'Placeholder Date',
    description: 'A quiet moment that stopped time. It was perfect.',
    position: [-5, 3, -6], // Front Left
    constellationId: 'beginning'
  },

  // Adventures Constellation
  {
    id: 'road_trip',
    title: 'That Crazy Road Trip',
    date: 'Placeholder Date',
    description: 'Singing at the top of our lungs with the windows down. Getting lost but not caring because we were together.',
    position: [-8, 0, 4], // Back Left
    constellationId: 'adventures'
  },
  {
    id: 'the_concert',
    title: 'Dancing in the Rain',
    date: 'Placeholder Date',
    description: 'We were completely soaked, but we kept dancing. You were radiant.',
    position: [-4, -4, 7], // Back Left Bottom
    constellationId: 'adventures'
  },

  // Quiet Moments
  {
    id: 'sunday_morning',
    title: 'Sunday Mornings',
    date: 'Placeholder Date',
    description: 'Coffee, messy hair, and the gentle sunlight pouring through the window. These are the moments I treasure the most.',
    position: [7, -2, 5], // Back Right
    constellationId: 'quiet_moments'
  },
  {
    id: 'movie_night',
    title: 'Falling Asleep on the Couch',
    date: 'Placeholder Date',
    description: 'We tried to finish the movie, but the comfort of being next to you was too peaceful.',
    position: [3, 5, 6], // Back Right Top
    constellationId: 'quiet_moments'
  }
];

import { reasonsList } from './reasons';

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate a deterministic cluster of 200 memory stars
const clusterMemories: Memory[] = Array.from({ length: 200 }).map((_, i) => {
  const minRadius = 15;
  const maxRadius = 90;
  const rand1 = seededRandom(i * 3 + 1);
  const rand2 = seededRandom(i * 3 + 2);
  const rand3 = seededRandom(i * 3 + 3);
  
  const theta = rand1 * 2 * Math.PI;
  const phi = Math.acos(2 * rand2 - 1);
  const r = minRadius + (maxRadius - minRadius) * Math.cbrt(rand3);

  // Spread around the universe (centered at origin, avoiding the immediate center)
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);

  return {
    id: `cluster_memory_${i}`,
    title: `Reason #${i + 1}`,
    date: '200 Things I Love About You',
    description: reasonsList[i] || 'I love you.',
    position: [x, y, z] as [number, number, number],
    constellationId: 'the_cluster'
  };
});

export const memories: Memory[] = [
  ...manualMemories,
  ...clusterMemories
];

export const finalMemory: Memory = {
  id: 'final_star',
  title: 'Our Constellation',
  description: 'Every star, every memory, has led us here. Our universe is beautiful because you are in it. I love you.',
  position: [0, -8, 0], // Directly below, hidden at first
};
