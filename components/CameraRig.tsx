"use client";

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useMemoryStore } from '../hooks/useMemoryStore';
import { memories, finalMemory } from '../data/memories';

export default function CameraRig() {
  const { camera, gl } = useThree();
  const focusTarget = useMemoryStore(state => state.focusTarget);
  const activeMemoryId = useMemoryStore(state => state.activeMemoryId);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const zoomVelocityRef = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (zoomVelocityRef.current.lengthSq() > 0.0001) {
      camera.position.add(zoomVelocityRef.current);
      if (controlsRef.current) {
        controlsRef.current.target.add(zoomVelocityRef.current);
        controlsRef.current.update();
      }
      // Apply friction for smooth momentum deceleration
      const friction = Math.exp(-6 * delta);
      zoomVelocityRef.current.multiplyScalar(friction);
    }
  });

  useEffect(() => {
    if (!controlsRef.current) return;

    let targetPosition: THREE.Vector3 | null = null;

    if (focusTarget) {
      targetPosition = new THREE.Vector3(...focusTarget);
    } else if (activeMemoryId) {
      const targetMemory = [...memories, finalMemory].find(m => m.id === activeMemoryId);
      if (targetMemory) {
        targetPosition = new THREE.Vector3(...targetMemory.position);
      }
    }

    if (targetPosition) {
      // Calculate direction from origin (0,0,0) to target
      const dir = targetPosition.clone().normalize();

      // Place camera a bit closer to center than the target, and slightly up
      const dist = Math.max(8, targetPosition.length() * 0.05);

      const targetCameraPosition = targetPosition.clone()
        .sub(dir.multiplyScalar(dist))
        .add(new THREE.Vector3(0, dist * 0.15, 0));

      // Animate camera position
      gsap.to(camera.position, {
        x: targetCameraPosition.x,
        y: targetCameraPosition.y,
        z: targetCameraPosition.z,
        duration: 2.5,
        ease: "power3.inOut"
      });

      // Animate OrbitControls target
      gsap.to(controlsRef.current.target, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 2.5,
        ease: "power3.inOut"
      });
    }
  }, [activeMemoryId, focusTarget, camera]);

  // Custom Zoom-to-Cursor & Infinite Movement logic
  useEffect(() => {
    // If focused on a memory, let OrbitControls handle standard zooming
    if (activeMemoryId || focusTarget) return;

    const domElement = gl.domElement;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!controlsRef.current) return;

      const controls = controlsRef.current;

      // Get mouse NDC coordinates
      const rect = domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Create a ray from the camera through the mouse pointer
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      // Calculate zoom amount
      const delta = Math.max(-100, Math.min(100, e.deltaY));
      const speed = 0.8; // Significantly increased speed for faster zooming
      const amount = delta * speed;

      const dir = raycaster.ray.direction;

      // Add to velocity for momentum effect instead of direct position change
      zoomVelocityRef.current.addScaledVector(dir, -amount);
    };

    domElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => domElement.removeEventListener('wheel', handleWheel);
  }, [camera, gl, activeMemoryId, focusTarget]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxDistance={Infinity}
      minDistance={1}
      enablePan={true}
      panSpeed={0.8}
      enableZoom={!!(activeMemoryId || focusTarget)}
      zoomSpeed={0.4}
      enableRotate={true}
      rotateSpeed={0.6}
      maxPolarAngle={Math.PI}
      autoRotate
      autoRotateSpeed={0.3}
    />
  );
}
