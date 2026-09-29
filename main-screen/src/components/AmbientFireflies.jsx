import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Ambient Bioluminescent Spores / Fireflies
 * teamLab signature floating light particles drifting through the forest volume.
 */
export function AmbientFireflies({ count = 900 }) {
  const pointsRef = useRef();

  const [positions, phases, speeds, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const sp = new Float32Array(count);
    const sc = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = Math.random() * 12 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;

      ph[i] = Math.random() * Math.PI * 2;
      sp[i] = 0.3 + Math.random() * 0.7;
      sc[i] = Math.random() * 0.8 + 0.6;
    }
    return [pos, ph, sp, sc];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Gentle floating sine/curl motion
      positionsAttr.array[idx + 1] += Math.sin(time * speeds[i] + phases[i]) * 0.008;
      positionsAttr.array[idx] += Math.cos(time * 0.4 * speeds[i] + phases[i]) * 0.005;
      positionsAttr.array[idx + 2] += Math.sin(time * 0.3 * speeds[i] + phases[i]) * 0.005;

      // Wrap boundaries gently
      if (positionsAttr.array[idx + 1] > 14) positionsAttr.array[idx + 1] = 0.5;
      if (positionsAttr.array[idx + 1] < 0.2) positionsAttr.array[idx + 1] = 13.5;
    }
    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color="#70e000"
        emissive="#ccff33"
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
