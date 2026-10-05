/**
 * Photorealistic teamLab Wildlife Living Sanctuary Environment
 * Features undulating organic terrain, a meandering reflective sanctuary river,
 * branching 3D banyan & pine trees with multi-layered canopies, river stones, ferns,
 * and gently pulsing bioluminescent flora.
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Realistic Branching Sanctuary Tree with Organic Foliage Clumps
 */
function SanctuaryTree({ position, scale = 1, glowColor = '#10b981', type = 'deciduous' }) {
  return (
    <group position={position} scale={scale}>
      {/* Organic Textured Tree Trunk */}
      <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.75, 5.6, 10]} />
        <meshStandardMaterial
          color="#1e1b18"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Main Branches */}
      <mesh position={[-0.6, 4.4, 0.2]} rotation={[0.4, 0, 0.6]} castShadow>
        <cylinderGeometry args={[0.18, 0.32, 2.6, 8]} />
        <meshStandardMaterial color="#1e1b18" roughness={0.9} />
      </mesh>
      <mesh position={[0.7, 4.6, -0.3]} rotation={[-0.3, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.18, 0.32, 2.8, 8]} />
        <meshStandardMaterial color="#1e1b18" roughness={0.9} />
      </mesh>

      {/* Multi-Layered Volumetric Foliage Clumps */}
      <group position={[0, 5.8, 0]}>
        {/* Main Central Crown */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <sphereGeometry args={[2.2, 16, 14]} />
          <meshStandardMaterial
            color="#064e3b"
            emissive={glowColor}
            emissiveIntensity={0.18}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        {/* Upper Crown */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <sphereGeometry args={[1.6, 14, 12]} />
          <meshStandardMaterial
            color="#047857"
            emissive={glowColor}
            emissiveIntensity={0.22}
            roughness={0.65}
          />
        </mesh>
        {/* Side Foliage Clusters */}
        <mesh position={[-1.4, -0.2, 0.5]} castShadow>
          <sphereGeometry args={[1.35, 12, 10]} />
          <meshStandardMaterial color="#065f46" roughness={0.75} />
        </mesh>
        <mesh position={[1.5, 0.1, -0.6]} castShadow>
          <sphereGeometry args={[1.45, 12, 10]} />
          <meshStandardMaterial color="#065f46" roughness={0.75} />
        </mesh>
        <mesh position={[0.2, -0.3, 1.4]} castShadow>
          <sphereGeometry args={[1.25, 12, 10]} />
          <meshStandardMaterial color="#047857" roughness={0.75} />
        </mesh>
      </group>

      {/* NOTE: no per-tree point lights — 34 trees × point lights destroyed shader
          performance (62+ dynamic lights scene-wide). Emissive canopy + Bloom gives the glow. */}
    </group>
  );
}

/**
 * teamLab Bioluminescent Breathing Flora
 */
function BioluminescentFlora({ position, scale = 1, flowerColor = '#06b6d4' }) {
  const bulbRef = useRef();

  useFrame((state) => {
    if (bulbRef.current) {
      const breath = (Math.sin(state.clock.elapsedTime * 1.8 + position[0] * 2) + 1) * 0.5;
      bulbRef.current.material.emissiveIntensity = 0.4 + breath * 0.9;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Curved Stem */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.04, 0.08, 0.8, 8]} />
        <meshStandardMaterial color="#064e3b" roughness={0.6} />
      </mesh>
      {/* Glowing Bioluminescent Blossom */}
      <mesh ref={bulbRef} position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.24, 14, 14]} />
        <meshStandardMaterial
          color="#082f49"
          emissive={flowerColor}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      {/* NOTE: no per-flower point lights (28 flowers × lights = massive perf hit).
          The emissive blossom + Bloom pass produces the bioluminescent glow. */}
    </group>
  );
}

/**
 * Meandering Reflective Sanctuary River
 */
function SanctuaryRiver() {
  const waterRef = useRef();

  useFrame((state) => {
    if (waterRef.current) {
      // Subtle organic water wave ripple
      waterRef.current.position.y = 0.04 + Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
    }
  });

  return (
    <group>
      {/* River Bed Channel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[14, 60, 32, 32]} />
        <meshStandardMaterial
          color="#082f49"
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Water Surface with Specular Flow */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <planeGeometry args={[13.2, 58, 32, 32]} />
        <meshStandardMaterial
          color="#0369a1"
          emissive="#0284c7"
          emissiveIntensity={0.15}
          roughness={0.12}
          metalness={0.85}
          transparent
          opacity={0.82}
        />
      </mesh>

      {/* Riverbed Boulders along banks */}
      <mesh position={[-6.8, 0.3, -4]} castShadow>
        <dodecahedronGeometry args={[0.75]} />
        <meshStandardMaterial color="#334155" roughness={0.85} />
      </mesh>
      <mesh position={[6.6, 0.4, 6]} castShadow>
        <dodecahedronGeometry args={[0.9]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      <mesh position={[-6.5, 0.25, 12]} castShadow>
        <dodecahedronGeometry args={[0.6]} />
        <meshStandardMaterial color="#334155" roughness={0.85} />
      </mesh>
      <mesh position={[6.7, 0.35, -14]} castShadow>
        <dodecahedronGeometry args={[0.85]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Main teamLab Living Sanctuary Environment
 */
export function ForestEnvironment() {
  // Scatter realistic sanctuary trees around outer grove perimeter
  const trees = useMemo(() => {
    const list = [];
    const colors = ['#10b981', '#06b6d4', '#38bdf8', '#a855f7', '#f59e0b', '#059669'];
    const count = 34;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const radius = 13 + Math.random() * 12;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.85 + Math.random() * 0.65;
      const color = colors[i % colors.length];
      list.push({ x, z, scale, color });
    }
    return list;
  }, []);

  // Bioluminescent sanctuary flora
  const flora = useMemo(() => {
    const list = [];
    const colors = ['#06b6d4', '#10b981', '#38bdf8', '#8b5cf6', '#f59e0b'];
    for (let i = 0; i < 28; i++) {
      const x = (Math.random() - 0.5) * 36;
      const z = (Math.random() - 0.5) * 36;
      // Keep clear of direct river center [-5 to 5]
      if (Math.abs(x) < 5) continue;
      const scale = 0.6 + Math.random() * 0.7;
      const color = colors[i % colors.length];
      list.push({ x, z, scale, color });
    }
    return list;
  }, []);

  return (
    <group>
      {/* NOTE: scene fog is attached at the Canvas root in App.jsx (attaching "fog"
          to a nested <group> is ignored by three.js, so fog never rendered). */}

      {/* Atmospheric Daylight & Moonbeam Radiance */}
      <ambientLight color="#0f172a" intensity={0.65} />
      <hemisphereLight skyColor="#38bdf8" groundColor="#064e3b" intensity={0.5} />
      <directionalLight
        position={[18, 28, 12]}
        color="#bae6fd"
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* Organic Sanctuary Terrain Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[75, 75, 64, 64]} />
        <meshStandardMaterial
          color="#04121d"
          roughness={0.78}
          metalness={0.15}
        />
      </mesh>

      {/* Meandering Sanctuary River */}
      <SanctuaryRiver />

      {/* Sacred teamLab Wildlife Sanctuary Rings on Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[11, 11.25, 64]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[19, 19.3, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
      </mesh>

      {/* Realistic Branching Sanctuary Trees */}
      {trees.map((t, idx) => (
        <SanctuaryTree
          key={`tree_${idx}`}
          position={[t.x, 0, t.z]}
          scale={t.scale}
          glowColor={t.color}
        />
      ))}

      {/* Bioluminescent Flora */}
      {flora.map((f, idx) => (
        <BioluminescentFlora
          key={`flora_${idx}`}
          position={[f.x, 0, f.z]}
          scale={f.scale}
          flowerColor={f.color}
        />
      ))}
    </group>
  );
}
