import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Capture Dissolve & Absorption Vortex
 * Dissolves the 3D entity into 2,000 swirling luminescent particles
 * spiraling into a celestial Pokeball capture beam.
 */
export function DissolveEffect({
  color = '#4cc9f0',
  auraColor = '#ffffff',
  scale = 1.0,
  onComplete
}) {
  const pointsRef = useRef();
  const beamRef = useRef();
  const flashRef = useRef();
  const progressRef = useRef(0);

  const PARTICLE_COUNT = 1800;

  // Initialize particles around the entity volume
  const [initialPositions, velocities, spirals] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const sp = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random distribution within entity body
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 0.9 * scale;

      const sinPhi = Math.sin(phi);
      pos[i * 3] = r * sinPhi * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) + 0.8 * scale;
      pos[i * 3 + 2] = r * sinPhi * Math.sin(theta);

      // Unique upward float rate and spin rate
      vel[i * 3 + 1] = 1.8 + Math.random() * 2.2;
      sp[i] = (Math.random() - 0.5) * 8.0;
    }
    return [pos, vel, sp];
  }, [scale]);

  const currentPositions = useMemo(() => new Float32Array(initialPositions), [initialPositions]);

  useFrame((state, delta) => {
    progressRef.current += delta / 3.0; // 3 seconds duration
    const progress = Math.min(1.0, progressRef.current);

    if (pointsRef.current) {
      const positionsAttr = pointsRef.current.geometry.attributes.position;
      const arr = positionsAttr.array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;

        // Upward vortex motion
        const initX = initialPositions[idx];
        const initY = initialPositions[idx + 1];
        const initZ = initialPositions[idx + 2];

        // Height increases with progress
        const currentY = initY + progress * 5.5 * (velocities[idx + 1] / 2.0);

        // Vortex funnel: radius compresses as height increases
        const funnelFactor = Math.max(0.05, 1.0 - (currentY / 8.0));
        const angle = progress * spirals[i] * 6.0;

        const rotatedX = Math.cos(angle) * initX - Math.sin(angle) * initZ;
        const rotatedZ = Math.sin(angle) * initX + Math.cos(angle) * initZ;

        arr[idx] = rotatedX * funnelFactor;
        arr[idx + 1] = currentY;
        arr[idx + 2] = rotatedZ * funnelFactor;
      }
      positionsAttr.needsUpdate = true;
    }

    // Capture Beam Cylinder animation
    if (beamRef.current) {
      const beamProgress = Math.sin(progress * Math.PI);
      beamRef.current.scale.set(beamProgress * 1.8, 1, beamProgress * 1.8);
      beamRef.current.material.opacity = beamProgress * 0.85;
    }

    // Final Flash at apex
    if (flashRef.current) {
      if (progress > 0.75) {
        const flashProgress = (progress - 0.75) / 0.25;
        const s = Math.sin(flashProgress * Math.PI) * 3.5;
        flashRef.current.scale.set(s, s, s);
        flashRef.current.material.opacity = (1 - flashProgress) * 0.9;
      } else {
        flashRef.current.scale.set(0, 0, 0);
      }
    }

    if (progress >= 1.0 && onComplete) {
      onComplete();
    }
  });

  return (
    <group>
      {/* Central Absorption Energy Cylinder */}
      <mesh ref={beamRef} position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.5, 1.2, 7, 32, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 2,000 Swirling Vortex Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={currentPositions.length / 3}
            array={currentPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          color={auraColor || color}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Convergent Flash Sphere */}
      <mesh ref={flashRef} position={[0, 6.0, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
