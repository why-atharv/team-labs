import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Legendary Aura & Sacred Geometry Halo
 * High-intensity emissive rings, orbiting motes, and dynamic ground glow for 5% Legendary spawns.
 */
export function LegendaryAura({ auraColor = '#ffd60a', lifespanMs = 35000, spawnTime }) {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const motesRef = useRef();
  const groundTimerRingRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Sacred geometry counter-rotations
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.sin(time * 0.8) * 0.4;
      ring1Ref.current.rotation.y += delta * 1.6;
      ring1Ref.current.rotation.z += delta * 0.8;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x += delta * 1.2;
      ring2Ref.current.rotation.y = Math.cos(time * 0.6) * 0.5;
      ring2Ref.current.rotation.z -= delta * 1.8;
    }

    // Orbiting particle motes
    if (motesRef.current) {
      motesRef.current.rotation.y += delta * 2.2;
    }

    // Ground despawn countdown ring (shrinks as time elapses)
    if (groundTimerRingRef.current && spawnTime) {
      const elapsed = Date.now() - spawnTime;
      const progress = Math.max(0, 1 - elapsed / lifespanMs);
      groundTimerRingRef.current.scale.set(progress, progress, 1);
    }
  });

  return (
    <group position={[0, 0.8, 0]}>
      {/* Intense Center Point Light for UnrealBloom */}
      <pointLight color={auraColor} intensity={5.0} distance={12} />

      {/* Inner Sacred Geometry Ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.6, 0.035, 16, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={auraColor}
          emissiveIntensity={3.5}
          roughness={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Sacred Geometry Ring */}
      <mesh ref={ring2Ref} scale={1.25}>
        <torusGeometry args={[1.6, 0.03, 16, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={auraColor}
          emissiveIntensity={3.0}
          roughness={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbiting Energy Motes */}
      <group ref={motesRef}>
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2;
          const r = 2.0;
          return (
            <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle * 2) * 0.6, Math.sin(angle) * r]}>
              <sphereGeometry args={[0.09, 8, 8]} />
              <meshBasicMaterial color={auraColor} />
            </mesh>
          );
        })}
      </group>

      {/* Ground Countdown Timer Ring */}
      <mesh
        ref={groundTimerRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.78, 0]}
      >
        <ringGeometry args={[2.0, 2.15, 64]} />
        <meshBasicMaterial
          color={auraColor}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
