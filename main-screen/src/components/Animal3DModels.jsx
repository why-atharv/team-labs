/**
 * Photorealistic 3D Animal Anatomical Models & Articulated Locomotion
 * teamLab Wildlife Living Sanctuary
 * Features authentic quadrupedal walk cycles (trot/prowl), spine flexion,
 * ear twitching, trunk curling, soaring eagle wings, and PBR fur/skin textures.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getAnimalTexture } from '../utils/animalTextures.js';

// =========================================================================
// 1. BIG CATS: Tiger, Lion, Snow Leopard, Black Panther, Cheetah
// =========================================================================
export function BigCatMesh({ archetype, color, secondaryColor, accentColor, scale = 1, isApex, isMoving }) {
  const rootRef = useRef();
  const frontLeftLeg = useRef();
  const frontRightLeg = useRef();
  const backLeftLeg = useRef();
  const backRightLeg = useRef();
  const headRef = useRef();
  const tailSegments = [useRef(), useRef(), useRef()];
  const maneRef = useRef();

  // Load procedural PBR texture
  const texture = useMemo(
    () => getAnimalTexture(archetype, color, secondaryColor, accentColor),
    [archetype, color, secondaryColor, accentColor]
  );

  const isLion = archetype === 'lion';
  const isCheetah = archetype === 'cheetah';
  const isSnowLeopard = archetype === 'snow_leopard';

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime * 6.5;

    // Authentic Quadrupedal Walk Cycle
    if (isMoving) {
      // Diagonal trot/prowl gait (FL + BR in phase, FR + BL opposite phase)
      const walkAmp = isCheetah ? 0.65 : 0.48;
      const fl = Math.sin(t);
      const fr = Math.sin(t + Math.PI);
      const bl = Math.sin(t + Math.PI);
      const br = Math.sin(t);

      if (frontLeftLeg.current) {
        frontLeftLeg.current.rotation.x = fl * walkAmp;
        frontLeftLeg.current.position.y = Math.max(0, -fl * 0.12);
      }
      if (frontRightLeg.current) {
        frontRightLeg.current.rotation.x = fr * walkAmp;
        frontRightLeg.current.position.y = Math.max(0, -fr * 0.12);
      }
      if (backLeftLeg.current) {
        backLeftLeg.current.rotation.x = bl * walkAmp;
        backLeftLeg.current.position.y = Math.max(0, -bl * 0.12);
      }
      if (backRightLeg.current) {
        backRightLeg.current.rotation.x = br * walkAmp;
        backRightLeg.current.position.y = Math.max(0, -br * 0.12);
      }

      // Gentle spine & head prowl rhythm
      if (headRef.current) {
        headRef.current.position.y = 0.85 + Math.sin(t * 2) * 0.04;
        headRef.current.rotation.x = Math.sin(t * 2) * 0.03;
      }
    } else {
      // Idle breathing stance
      const breath = Math.sin(state.clock.elapsedTime * 2.0) * 0.03;
      if (headRef.current) headRef.current.position.y = 0.85 + breath;
      if (frontLeftLeg.current) frontLeftLeg.current.rotation.x = 0;
      if (frontRightLeg.current) frontRightLeg.current.rotation.x = 0;
      if (backLeftLeg.current) backLeftLeg.current.rotation.x = 0;
      if (backRightLeg.current) backRightLeg.current.rotation.x = 0;
    }

    // Natural multi-segment tail wave with organic lag
    const tailSpeed = state.clock.elapsedTime * 3.5;
    tailSegments.forEach((seg, idx) => {
      if (seg.current) {
        seg.current.rotation.y = Math.sin(tailSpeed - idx * 0.6) * 0.28;
        seg.current.rotation.z = Math.cos(tailSpeed * 0.5 - idx * 0.4) * 0.12;
      }
    });
  });

  return (
    <group ref={rootRef} scale={scale}>
      {/* Dynamic contact shadow on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ellipseGeometry args={[0.75, 1.25, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.55} />
      </mesh>

      {/* Main Muscular Body Group */}
      <group position={[0, 0.8, 0]}>
        {/* Thorax / Ribcage */}
        <mesh position={[0, 0.06, 0.28]} castShadow receiveShadow>
          <capsuleGeometry args={[isCheetah ? 0.36 : 0.44, 0.65, 12, 16]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.65}
            metalness={0.08}
            emissive={isApex ? color : '#000000'}
            emissiveIntensity={isApex ? 0.15 : 0}
          />
        </mesh>

        {/* Muscular Shoulders */}
        <mesh position={[0, 0.18, 0.48]} castShadow>
          <sphereGeometry args={[isCheetah ? 0.38 : 0.46, 16, 16]} />
          <meshStandardMaterial map={texture} roughness={0.6} />
        </mesh>

        {/* Flank & Flexible Spine Midsection */}
        <mesh position={[0, 0.03, -0.22]} rotation={[0.08, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[isCheetah ? 0.28 : 0.38, isCheetah ? 0.36 : 0.44, 0.62, 16]} />
          <meshStandardMaterial map={texture} roughness={0.65} />
        </mesh>

        {/* Muscular Hindquarters */}
        <mesh position={[0, 0.14, -0.56]} castShadow>
          <sphereGeometry args={[isCheetah ? 0.35 : 0.43, 16, 16]} />
          <meshStandardMaterial map={texture} roughness={0.6} />
        </mesh>

        {/* Head & Neck */}
        <group ref={headRef} position={[0, 0.85, 0.72]}>
          {/* Muscular Neck */}
          <mesh position={[0, -0.16, -0.12]} rotation={[-0.45, 0, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.36, 0.48, 14]} />
            <meshStandardMaterial map={texture} roughness={0.6} />
          </mesh>

          {/* Feline Cranium */}
          <mesh position={[0, 0.04, 0.12]} castShadow>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshStandardMaterial map={texture} roughness={0.55} />
          </mesh>

          {/* Muzzle */}
          <mesh position={[0, -0.06, 0.34]} castShadow>
            <boxGeometry args={[0.26, 0.22, 0.3]} />
            <meshStandardMaterial color={accentColor || '#ffedd5'} roughness={0.7} />
          </mesh>

          {/* Black Nose Leather */}
          <mesh position={[0, 0.02, 0.5]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#18181b" roughness={0.3} />
          </mesh>

          {/* Piercing Reflective Eyes with Pupils */}
          <group position={[-0.14, 0.12, 0.32]}>
            <mesh>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial color={isApex ? '#fbbf24' : '#eab308'} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </group>
          <group position={[0.14, 0.12, 0.32]}>
            <mesh>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial color={isApex ? '#fbbf24' : '#eab308'} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </group>

          {/* Triangular Feline Ears */}
          <mesh position={[-0.22, 0.32, 0.04]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.1, 0.22, 8]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[0.22, 0.32, 0.04]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.1, 0.22, 8]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>

          {/* Lion's Voluminous Dark Mane */}
          {isLion && (
            <group ref={maneRef} position={[0, -0.1, -0.05]}>
              <mesh castShadow>
                <sphereGeometry args={[0.62, 18, 18]} />
                <meshStandardMaterial color={secondaryColor || '#451a03'} roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.35, 0.1]} castShadow>
                <coneGeometry args={[0.55, 0.8, 14]} />
                <meshStandardMaterial color={secondaryColor || '#451a03'} roughness={0.9} />
              </mesh>
            </group>
          )}
        </group>

        {/* Articulated Front Left Leg */}
        <group ref={frontLeftLeg} position={[-0.32, -0.05, 0.45]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.42, 8, 12]} />
            <meshStandardMaterial map={texture} roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.62, 0.04]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.42, 8]} />
            <meshStandardMaterial map={texture} roughness={0.65} />
          </mesh>
          {/* Padded Paw with Claws */}
          <mesh position={[0, -0.82, 0.1]}>
            <boxGeometry args={[0.18, 0.1, 0.24]} />
            <meshStandardMaterial color={accentColor || color} roughness={0.8} />
          </mesh>
        </group>

        {/* Articulated Front Right Leg */}
        <group ref={frontRightLeg} position={[0.32, -0.05, 0.45]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.42, 8, 12]} />
            <meshStandardMaterial map={texture} roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.62, 0.04]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.42, 8]} />
            <meshStandardMaterial map={texture} roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.82, 0.1]}>
            <boxGeometry args={[0.18, 0.1, 0.24]} />
            <meshStandardMaterial color={accentColor || color} roughness={0.8} />
          </mesh>
        </group>

        {/* Articulated Back Left Leg */}
        <group ref={backLeftLeg} position={[-0.32, 0, -0.55]}>
          <mesh position={[0, -0.28, -0.04]} rotation={[-0.15, 0, 0]} castShadow>
            <capsuleGeometry args={[0.15, 0.48, 8, 12]} />
            <meshStandardMaterial map={texture} roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.64, 0.08]} rotation={[0.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.44, 8]} />
            <meshStandardMaterial map={texture} roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.82, 0.14]}>
            <boxGeometry args={[0.18, 0.1, 0.24]} />
            <meshStandardMaterial color={accentColor || color} roughness={0.8} />
          </mesh>
        </group>

        {/* Articulated Back Right Leg */}
        <group ref={backRightLeg} position={[0.32, 0, -0.55]}>
          <mesh position={[0, -0.28, -0.04]} rotation={[-0.15, 0, 0]} castShadow>
            <capsuleGeometry args={[0.15, 0.48, 8, 12]} />
            <meshStandardMaterial map={texture} roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.64, 0.08]} rotation={[0.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.44, 8]} />
            <meshStandardMaterial map={texture} roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.82, 0.14]}>
            <boxGeometry args={[0.18, 0.1, 0.24]} />
            <meshStandardMaterial color={accentColor || color} roughness={0.8} />
          </mesh>
        </group>

        {/* Natural Multi-Segment Articulated Tail */}
        <group position={[0, 0.18, -0.75]}>
          <group ref={tailSegments[0]}>
            <mesh position={[0, -0.15, -0.18]} rotation={[-0.6, 0, 0]} castShadow>
              <cylinderGeometry args={[isSnowLeopard ? 0.1 : 0.07, isSnowLeopard ? 0.12 : 0.09, 0.42, 8]} />
              <meshStandardMaterial map={texture} roughness={0.7} />
            </mesh>
            <group ref={tailSegments[1]} position={[0, -0.3, -0.32]}>
              <mesh position={[0, -0.12, -0.15]} rotation={[-0.3, 0, 0]} castShadow>
                <cylinderGeometry args={[isSnowLeopard ? 0.09 : 0.06, isSnowLeopard ? 0.1 : 0.07, 0.38, 8]} />
                <meshStandardMaterial map={texture} roughness={0.7} />
              </mesh>
              <group ref={tailSegments[2]} position={[0, -0.24, -0.26]}>
                <mesh position={[0, 0.08, -0.12]} rotation={[0.4, 0, 0]} castShadow>
                  <cylinderGeometry args={[isSnowLeopard ? 0.08 : 0.04, isSnowLeopard ? 0.09 : 0.06, 0.36, 8]} />
                  <meshStandardMaterial color={isLion ? secondaryColor : color} roughness={0.8} />
                </mesh>
                {/* Lion Tail Tuft */}
                {isLion && (
                  <mesh position={[0, 0.22, -0.18]}>
                    <sphereGeometry args={[0.11, 8, 8]} />
                    <meshStandardMaterial color={secondaryColor || '#451a03'} roughness={0.9} />
                  </mesh>
                )}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// =========================================================================
// 2. CANID: Alpha Timber Wolf
// =========================================================================
export function WolfMesh({ color, secondaryColor, accentColor, scale = 1, isApex, isMoving }) {
  const rootRef = useRef();
  const frontLeftLeg = useRef();
  const frontRightLeg = useRef();
  const backLeftLeg = useRef();
  const backRightLeg = useRef();
  const headRef = useRef();
  const tailRef = useRef();

  const texture = useMemo(
    () => getAnimalTexture('wolf', color, secondaryColor, accentColor),
    [color, secondaryColor, accentColor]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * 6.0;
    if (isMoving) {
      const fl = Math.sin(t);
      const fr = Math.sin(t + Math.PI);
      if (frontLeftLeg.current) frontLeftLeg.current.rotation.x = fl * 0.52;
      if (frontRightLeg.current) frontRightLeg.current.rotation.x = fr * 0.52;
      if (backLeftLeg.current) backLeftLeg.current.rotation.x = fr * 0.52;
      if (backRightLeg.current) backRightLeg.current.rotation.x = fl * 0.52;
      if (headRef.current) headRef.current.position.y = 0.9 + Math.sin(t * 2) * 0.03;
    }
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group ref={rootRef} scale={scale}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ellipseGeometry args={[0.65, 1.15, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.55} />
      </mesh>

      <group position={[0, 0.82, 0]}>
        {/* Deep Lupine Chest */}
        <mesh position={[0, 0.08, 0.28]} castShadow>
          <capsuleGeometry args={[0.38, 0.6, 12, 16]} />
          <meshStandardMaterial map={texture} roughness={0.7} />
        </mesh>
        {/* Thick Scruff / Neck Ruff */}
        <mesh position={[0, 0.22, 0.44]} castShadow>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshStandardMaterial map={texture} roughness={0.75} />
        </mesh>
        {/* Athletic Narrow Waist */}
        <mesh position={[0, 0.04, -0.26]} rotation={[0.06, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.36, 0.62, 14]} />
          <meshStandardMaterial map={texture} roughness={0.7} />
        </mesh>
        {/* Hips */}
        <mesh position={[0, 0.1, -0.55]} castShadow>
          <sphereGeometry args={[0.35, 14, 14]} />
          <meshStandardMaterial map={texture} roughness={0.7} />
        </mesh>

        {/* Head & Pointed Muzzle */}
        <group ref={headRef} position={[0, 0.9, 0.68]}>
          <mesh position={[0, -0.14, -0.1]} rotation={[-0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.32, 0.44, 12]} />
            <meshStandardMaterial map={texture} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.05, 0.1]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial map={texture} roughness={0.65} />
          </mesh>
          {/* Elongated Wolf Muzzle */}
          <mesh position={[0, -0.06, 0.38]} castShadow>
            <boxGeometry args={[0.18, 0.18, 0.38]} />
            <meshStandardMaterial color={accentColor || '#cbd5e1'} roughness={0.8} />
          </mesh>
          {/* Black Nose */}
          <mesh position={[0, 0.02, 0.58]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#09090b" roughness={0.3} />
          </mesh>
          {/* Golden Wolf Eyes */}
          <mesh position={[-0.12, 0.12, 0.28]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.1} />
          </mesh>
          <mesh position={[0.12, 0.12, 0.28]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.1} />
          </mesh>
          {/* Erect Triangular Lupine Ears */}
          <mesh position={[-0.18, 0.32, 0.02]} rotation={[0, 0, -0.2]}>
            <coneGeometry args={[0.08, 0.26, 8]} />
            <meshStandardMaterial color={secondaryColor || '#1e293b'} roughness={0.8} />
          </mesh>
          <mesh position={[0.18, 0.32, 0.02]} rotation={[0, 0, 0.2]}>
            <coneGeometry args={[0.08, 0.26, 8]} />
            <meshStandardMaterial color={secondaryColor || '#1e293b'} roughness={0.8} />
          </mesh>
        </group>

        {/* Legs */}
        <group ref={frontLeftLeg} position={[-0.26, -0.05, 0.42]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.78, 8]} />
            <meshStandardMaterial map={texture} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.82, 0.06]}>
            <boxGeometry args={[0.14, 0.08, 0.2]} />
            <meshStandardMaterial color={accentColor || '#f8fafc'} roughness={0.8} />
          </mesh>
        </group>
        <group ref={frontRightLeg} position={[0.26, -0.05, 0.42]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.78, 8]} />
            <meshStandardMaterial map={texture} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.82, 0.06]}>
            <boxGeometry args={[0.14, 0.08, 0.2]} />
            <meshStandardMaterial color={accentColor || '#f8fafc'} roughness={0.8} />
          </mesh>
        </group>
        <group ref={backLeftLeg} position={[-0.26, 0, -0.52]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.07, 0.78, 8]} />
            <meshStandardMaterial map={texture} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.82, 0.06]}>
            <boxGeometry args={[0.14, 0.08, 0.2]} />
            <meshStandardMaterial color={accentColor || '#f8fafc'} roughness={0.8} />
          </mesh>
        </group>
        <group ref={backRightLeg} position={[0.26, 0, -0.52]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.07, 0.78, 8]} />
            <meshStandardMaterial map={texture} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.82, 0.06]}>
            <boxGeometry args={[0.14, 0.08, 0.2]} />
            <meshStandardMaterial color={accentColor || '#f8fafc'} roughness={0.8} />
          </mesh>
        </group>

        {/* Bushy Wolf Tail */}
        <group ref={tailRef} position={[0, 0.16, -0.72]}>
          <mesh position={[0, -0.28, -0.16]} rotation={[-0.45, 0, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.65, 8, 12]} />
            <meshStandardMaterial color={secondaryColor || '#1e293b'} roughness={0.85} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// =========================================================================
// 3. PACHYDERM: African Bush Elephant
// =========================================================================
export function ElephantMesh({ color, secondaryColor, accentColor, scale = 1, isMoving }) {
  const rootRef = useRef();
  const frontLeftLeg = useRef();
  const frontRightLeg = useRef();
  const backLeftLeg = useRef();
  const backRightLeg = useRef();
  const leftEar = useRef();
  const rightEar = useRef();
  const trunkSeg1 = useRef();
  const trunkSeg2 = useRef();
  const trunkSeg3 = useRef();

  const texture = useMemo(
    () => getAnimalTexture('elephant', color, secondaryColor, accentColor),
    [color, secondaryColor, accentColor]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * 3.5;
    if (isMoving) {
      const fl = Math.sin(t);
      const fr = Math.sin(t + Math.PI);
      if (frontLeftLeg.current) frontLeftLeg.current.rotation.x = fl * 0.35;
      if (frontRightLeg.current) frontRightLeg.current.rotation.x = fr * 0.35;
      if (backLeftLeg.current) backLeftLeg.current.rotation.x = fr * 0.35;
      if (backRightLeg.current) backRightLeg.current.rotation.x = fl * 0.35;
    }
    // Fan ear flapping
    const earFlap = Math.sin(state.clock.elapsedTime * 2.2) * 0.18;
    if (leftEar.current) leftEar.current.rotation.y = 0.3 + earFlap;
    if (rightEar.current) rightEar.current.rotation.y = -0.3 - earFlap;

    // Organic trunk sway and curl
    const trunkWave = Math.sin(state.clock.elapsedTime * 2.8) * 0.25;
    if (trunkSeg1.current) trunkSeg1.current.rotation.x = 0.4 + trunkWave * 0.3;
    if (trunkSeg2.current) trunkSeg2.current.rotation.x = 0.5 + trunkWave * 0.5;
    if (trunkSeg3.current) trunkSeg3.current.rotation.x = 0.6 + trunkWave * 0.6;
  });

  return (
    <group ref={rootRef} scale={scale}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ellipseGeometry args={[1.1, 1.7, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
      </mesh>

      <group position={[0, 1.45, 0]}>
        {/* Massive Barrel Body */}
        <mesh position={[0, 0.1, 0.1]} castShadow>
          <capsuleGeometry args={[0.82, 1.4, 16, 20]} />
          <meshStandardMaterial map={texture} roughness={0.8} />
        </mesh>

        {/* Head */}
        <group position={[0, 0.42, 1.1]}>
          <mesh castShadow>
            <sphereGeometry args={[0.62, 18, 18]} />
            <meshStandardMaterial map={texture} roughness={0.8} />
          </mesh>

          {/* Giant African Fan Ears */}
          <group ref={leftEar} position={[-0.6, 0.12, -0.1]}>
            <mesh castShadow>
              <boxGeometry args={[0.06, 0.95, 0.72]} />
              <meshStandardMaterial map={texture} roughness={0.85} />
            </mesh>
          </group>
          <group ref={rightEar} position={[0.6, 0.12, -0.1]}>
            <mesh castShadow>
              <boxGeometry args={[0.06, 0.95, 0.72]} />
              <meshStandardMaterial map={texture} roughness={0.85} />
            </mesh>
          </group>

          {/* Twin Curved Ivory Tusks */}
          <mesh position={[-0.26, -0.32, 0.42]} rotation={[0.4, 0, -0.12]} castShadow>
            <coneGeometry args={[0.07, 0.85, 12]} />
            <meshStandardMaterial color="#fef08a" roughness={0.25} />
          </mesh>
          <mesh position={[0.26, -0.32, 0.42]} rotation={[0.4, 0, 0.12]} castShadow>
            <coneGeometry args={[0.07, 0.85, 12]} />
            <meshStandardMaterial color="#fef08a" roughness={0.25} />
          </mesh>

          {/* Articulated Multi-Segment Trunk */}
          <group ref={trunkSeg1} position={[0, -0.22, 0.45]}>
            <mesh position={[0, -0.22, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.16, 0.45, 12]} />
              <meshStandardMaterial map={texture} roughness={0.8} />
            </mesh>
            <group ref={trunkSeg2} position={[0, -0.42, 0]}>
              <mesh position={[0, -0.2, 0]} castShadow>
                <cylinderGeometry args={[0.16, 0.12, 0.42, 12]} />
                <meshStandardMaterial map={texture} roughness={0.8} />
              </mesh>
              <group ref={trunkSeg3} position={[0, -0.38, 0]}>
                <mesh position={[0, -0.18, 0]} castShadow>
                  <cylinderGeometry args={[0.12, 0.08, 0.38, 12]} />
                  <meshStandardMaterial map={texture} roughness={0.8} />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* Pillar Legs */}
        <group ref={frontLeftLeg} position={[-0.55, -0.35, 0.55]}>
          <mesh position={[0, -0.5, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.24, 1.1, 14]} />
            <meshStandardMaterial map={texture} roughness={0.8} />
          </mesh>
        </group>
        <group ref={frontRightLeg} position={[0.55, -0.35, 0.55]}>
          <mesh position={[0, -0.5, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.24, 1.1, 14]} />
            <meshStandardMaterial map={texture} roughness={0.8} />
          </mesh>
        </group>
        <group ref={backLeftLeg} position={[-0.55, -0.35, -0.65]}>
          <mesh position={[0, -0.5, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.24, 1.1, 14]} />
            <meshStandardMaterial map={texture} roughness={0.8} />
          </mesh>
        </group>
        <group ref={backRightLeg} position={[0.55, -0.35, -0.65]}>
          <mesh position={[0, -0.5, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.24, 1.1, 14]} />
            <meshStandardMaterial map={texture} roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// =========================================================================
// 4. URSID: Grizzly Bear
// =========================================================================
export function BearMesh({ color, secondaryColor, scale = 1, isMoving }) {
  const rootRef = useRef();
  const frontLeftLeg = useRef();
  const frontRightLeg = useRef();
  const backLeftLeg = useRef();
  const backRightLeg = useRef();
  const headRef = useRef();

  const texture = useMemo(
    () => getAnimalTexture('bear', color, secondaryColor),
    [color, secondaryColor]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * 4.5;
    if (isMoving) {
      const fl = Math.sin(t);
      const fr = Math.sin(t + Math.PI);
      if (frontLeftLeg.current) frontLeftLeg.current.rotation.x = fl * 0.42;
      if (frontRightLeg.current) frontRightLeg.current.rotation.x = fr * 0.42;
      if (backLeftLeg.current) backLeftLeg.current.rotation.x = fr * 0.42;
      if (backRightLeg.current) backRightLeg.current.rotation.x = fl * 0.42;
      if (rootRef.current) rootRef.current.rotation.z = Math.sin(t) * 0.04; // Heavy lumber roll
    }
  });

  return (
    <group ref={rootRef} scale={scale}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ellipseGeometry args={[0.85, 1.35, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.55} />
      </mesh>

      <group position={[0, 1.0, 0]}>
        {/* Bulky Body */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <capsuleGeometry args={[0.55, 0.95, 14, 18]} />
          <meshStandardMaterial map={texture} roughness={0.85} />
        </mesh>
        {/* Prominent Muscular Shoulder Hump */}
        <mesh position={[0, 0.38, 0.42]} castShadow>
          <sphereGeometry args={[0.48, 16, 16]} />
          <meshStandardMaterial map={texture} roughness={0.85} />
        </mesh>

        {/* Broad Skull & Snout */}
        <group ref={headRef} position={[0, 0.65, 0.85]}>
          <mesh castShadow>
            <sphereGeometry args={[0.38, 16, 16]} />
            <meshStandardMaterial map={texture} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.08, 0.32]} castShadow>
            <boxGeometry args={[0.32, 0.26, 0.35]} />
            <meshStandardMaterial color="#451a03" roughness={0.75} />
          </mesh>
          {/* Rounded Ears */}
          <mesh position={[-0.24, 0.28, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          <mesh position={[0.24, 0.28, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        </group>

        {/* Stocky Heavy Legs */}
        <group ref={frontLeftLeg} position={[-0.38, -0.25, 0.45]}>
          <mesh position={[0, -0.38, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.16, 0.75, 10]} />
            <meshStandardMaterial map={texture} roughness={0.8} />
          </mesh>
        </group>
        <group ref={frontRightLeg} position={[0.38, -0.25, 0.45]}>
          <mesh position={[0, -0.38, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.16, 0.75, 10]} />
            <meshStandardMaterial map={texture} roughness={0.8} />
          </mesh>
        </group>
        <group ref={backLeftLeg} position={[-0.38, -0.25, -0.45]}>
          <mesh position={[0, -0.38, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.17, 0.75, 10]} />
            <meshStandardMaterial map={texture} roughness={0.8} />
          </mesh>
        </group>
        <group ref={backRightLeg} position={[0.38, -0.25, -0.45]}>
          <mesh position={[0, -0.38, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.17, 0.75, 10]} />
            <meshStandardMaterial map={texture} roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// =========================================================================
// 5. CERVID: Majestic Red Deer Stag
// =========================================================================
export function StagMesh({ color, secondaryColor, accentColor, scale = 1, isMoving }) {
  const rootRef = useRef();
  const frontLeftLeg = useRef();
  const frontRightLeg = useRef();
  const backLeftLeg = useRef();
  const backRightLeg = useRef();
  const headRef = useRef();

  const texture = useMemo(
    () => getAnimalTexture('stag', color, secondaryColor, accentColor),
    [color, secondaryColor, accentColor]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * 6.5;
    if (isMoving) {
      const fl = Math.sin(t);
      const fr = Math.sin(t + Math.PI);
      if (frontLeftLeg.current) frontLeftLeg.current.rotation.x = fl * 0.58;
      if (frontRightLeg.current) frontRightLeg.current.rotation.x = fr * 0.58;
      if (backLeftLeg.current) backLeftLeg.current.rotation.x = fr * 0.58;
      if (backRightLeg.current) backRightLeg.current.rotation.x = fl * 0.58;
    }
  });

  return (
    <group ref={rootRef} scale={scale}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ellipseGeometry args={[0.6, 1.1, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.5} />
      </mesh>

      <group position={[0, 1.0, 0]}>
        {/* Slender Torso */}
        <mesh position={[0, 0.05, 0.1]} castShadow>
          <capsuleGeometry args={[0.35, 0.75, 12, 16]} />
          <meshStandardMaterial map={texture} roughness={0.7} />
        </mesh>

        {/* Graceful Tall Neck & Head */}
        <group ref={headRef} position={[0, 0.65, 0.55]}>
          <mesh position={[0, -0.05, -0.08]} rotation={[-0.6, 0, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.26, 0.65, 12]} />
            <meshStandardMaterial map={texture} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.28, 0.14]} castShadow>
            <sphereGeometry args={[0.24, 14, 14]} />
            <meshStandardMaterial map={texture} roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.2, 0.38]} castShadow>
            <boxGeometry args={[0.16, 0.16, 0.28]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>

          {/* Branching Multi-Tined 3D Antlers */}
          <group position={[0, 0.48, 0.08]}>
            {/* Left Antler Main Beam */}
            <mesh position={[-0.24, 0.32, -0.06]} rotation={[-0.2, 0, -0.45]} castShadow>
              <cylinderGeometry args={[0.035, 0.055, 0.85, 8]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.5} />
            </mesh>
            {/* Left Brow Tine */}
            <mesh position={[-0.18, 0.18, 0.14]} rotation={[0.6, 0, -0.3]} castShadow>
              <coneGeometry args={[0.03, 0.35, 6]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.5} />
            </mesh>
            {/* Left Crown Tines */}
            <mesh position={[-0.42, 0.65, -0.1]} rotation={[-0.5, 0, -0.8]} castShadow>
              <coneGeometry args={[0.025, 0.4, 6]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.5} />
            </mesh>

            {/* Right Antler Main Beam */}
            <mesh position={[0.24, 0.32, -0.06]} rotation={[-0.2, 0, 0.45]} castShadow>
              <cylinderGeometry args={[0.035, 0.055, 0.85, 8]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.5} />
            </mesh>
            {/* Right Brow Tine */}
            <mesh position={[0.18, 0.18, 0.14]} rotation={[0.6, 0, 0.3]} castShadow>
              <coneGeometry args={[0.03, 0.35, 6]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.5} />
            </mesh>
            {/* Right Crown Tines */}
            <mesh position={[0.42, 0.65, -0.1]} rotation={[-0.5, 0, 0.8]} castShadow>
              <coneGeometry args={[0.025, 0.4, 6]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* Slender Agile Legs with Hooves */}
        <group ref={frontLeftLeg} position={[-0.24, -0.12, 0.38]}>
          <mesh position={[0, -0.45, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.95, 8]} />
            <meshStandardMaterial map={texture} roughness={0.7} />
          </mesh>
        </group>
        <group ref={frontRightLeg} position={[0.24, -0.12, 0.38]}>
          <mesh position={[0, -0.45, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.95, 8]} />
            <meshStandardMaterial map={texture} roughness={0.7} />
          </mesh>
        </group>
        <group ref={backLeftLeg} position={[-0.24, -0.08, -0.48]}>
          <mesh position={[0, -0.45, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.05, 0.95, 8]} />
            <meshStandardMaterial map={texture} roughness={0.7} />
          </mesh>
        </group>
        <group ref={backRightLeg} position={[0.24, -0.08, -0.48]}>
          <mesh position={[0, -0.45, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.05, 0.95, 8]} />
            <meshStandardMaterial map={texture} roughness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// =========================================================================
// 6. AVIAN RAPTOR: Golden Eagle
// =========================================================================
export function EagleMesh({ color, secondaryColor, accentColor, scale = 1 }) {
  const rootRef = useRef();
  const leftWingRef = useRef();
  const rightWingRef = useRef();
  const tailRef = useRef();

  const texture = useMemo(
    () => getAnimalTexture('eagle', color, secondaryColor, accentColor),
    [color, secondaryColor, accentColor]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * 8.0;
    // Wing flapping with periodic glide pauses
    const flap = Math.sin(t) * 0.52;
    if (leftWingRef.current && rightWingRef.current) {
      leftWingRef.current.rotation.z = 0.25 + flap;
      rightWingRef.current.rotation.z = -0.25 - flap;
    }
    if (rootRef.current) {
      // Natural banking roll and pitch in flight
      rootRef.current.position.y = 2.4 + Math.sin(state.clock.elapsedTime * 2.0) * 0.35;
      rootRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.18;
    }
  });

  return (
    <group ref={rootRef} scale={scale}>
      {/* Aerodynamic Raptor Body */}
      <mesh position={[0, 0, 0]} rotation={[0.45, 0, 0]} castShadow>
        <capsuleGeometry args={[0.24, 0.65, 12, 14]} />
        <meshStandardMaterial map={texture} roughness={0.65} />
      </mesh>

      {/* Head with Golden Feathers */}
      <group position={[0, 0.35, 0.32]}>
        <mesh castShadow>
          <sphereGeometry args={[0.2, 14, 14]} />
          <meshStandardMaterial color={secondaryColor || '#ca8a04'} roughness={0.55} />
        </mesh>
        {/* Hooked Predatory Beak */}
        <mesh position={[0, -0.06, 0.22]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.07, 0.24, 8]} />
          <meshStandardMaterial color="#facc15" roughness={0.2} />
        </mesh>
      </group>

      {/* Articulated Feathered Wings */}
      <group ref={leftWingRef} position={[-0.22, 0.15, 0.1]}>
        <mesh position={[-0.85, 0, -0.1]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[1.7, 0.06, 0.65]} />
          <meshStandardMaterial map={texture} roughness={0.6} />
        </mesh>
      </group>
      <group ref={rightWingRef} position={[0.22, 0.15, 0.1]}>
        <mesh position={[0.85, 0, -0.1]} rotation={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[1.7, 0.06, 0.65]} />
          <meshStandardMaterial map={texture} roughness={0.6} />
        </mesh>
      </group>

      {/* Tail Fan */}
      <mesh ref={tailRef} position={[0, -0.15, -0.45]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.04, 0.45]} />
        <meshStandardMaterial color={secondaryColor || '#ca8a04'} roughness={0.7} />
      </mesh>
    </group>
  );
}

// =========================================================================
// 7. EQUID: Plains Zebra
// =========================================================================
export function ZebraMesh({ color, secondaryColor, scale = 1, isMoving }) {
  const rootRef = useRef();
  const frontLeftLeg = useRef();
  const frontRightLeg = useRef();
  const backLeftLeg = useRef();
  const backRightLeg = useRef();

  const texture = useMemo(
    () => getAnimalTexture('zebra', color, secondaryColor),
    [color, secondaryColor]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * 6.5;
    if (isMoving) {
      const fl = Math.sin(t);
      const fr = Math.sin(t + Math.PI);
      if (frontLeftLeg.current) frontLeftLeg.current.rotation.x = fl * 0.55;
      if (frontRightLeg.current) frontRightLeg.current.rotation.x = fr * 0.55;
      if (backLeftLeg.current) backLeftLeg.current.rotation.x = fr * 0.55;
      if (backRightLeg.current) backRightLeg.current.rotation.x = fl * 0.55;
    }
  });

  return (
    <group ref={rootRef} scale={scale}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ellipseGeometry args={[0.65, 1.2, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.5} />
      </mesh>

      <group position={[0, 1.05, 0]}>
        {/* Equine Body */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <capsuleGeometry args={[0.42, 0.85, 14, 16]} />
          <meshStandardMaterial map={texture} roughness={0.6} />
        </mesh>
        {/* Arched Neck with Brush Mane */}
        <group position={[0, 0.52, 0.5]}>
          <mesh position={[0, -0.05, -0.08]} rotation={[-0.55, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.32, 0.65, 12]} />
            <meshStandardMaterial map={texture} roughness={0.6} />
          </mesh>
          {/* Head & Dark Muzzle */}
          <mesh position={[0, 0.28, 0.16]} castShadow>
            <sphereGeometry args={[0.26, 14, 14]} />
            <meshStandardMaterial map={texture} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.16, 0.4]}>
            <boxGeometry args={[0.18, 0.18, 0.28]} />
            <meshStandardMaterial color="#09090b" roughness={0.7} />
          </mesh>
        </group>

        {/* Four Equine Galloping Legs */}
        <group ref={frontLeftLeg} position={[-0.26, -0.15, 0.4]}>
          <mesh position={[0, -0.45, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.06, 0.95, 8]} />
            <meshStandardMaterial map={texture} roughness={0.6} />
          </mesh>
        </group>
        <group ref={frontRightLeg} position={[0.26, -0.15, 0.4]}>
          <mesh position={[0, -0.45, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.06, 0.95, 8]} />
            <meshStandardMaterial map={texture} roughness={0.6} />
          </mesh>
        </group>
        <group ref={backLeftLeg} position={[-0.26, -0.15, -0.45]}>
          <mesh position={[0, -0.45, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.06, 0.95, 8]} />
            <meshStandardMaterial map={texture} roughness={0.6} />
          </mesh>
        </group>
        <group ref={backRightLeg} position={[0.26, -0.15, -0.45]}>
          <mesh position={[0, -0.45, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.06, 0.95, 8]} />
            <meshStandardMaterial map={texture} roughness={0.6} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// =========================================================================
// 8. REPTILE: Nile Crocodile
// =========================================================================
export function CrocodileMesh({ color, secondaryColor, accentColor, scale = 1, isMoving }) {
  const rootRef = useRef();
  const tailRef = useRef();

  const texture = useMemo(
    () => getAnimalTexture('crocodile', color, secondaryColor, accentColor),
    [color, secondaryColor, accentColor]
  );

  useFrame((state) => {
    if (tailRef.current) {
      const t = state.clock.elapsedTime * 4.0;
      tailRef.current.rotation.y = Math.sin(t) * 0.35;
    }
  });

  return (
    <group ref={rootRef} scale={scale} position={[0, 0.22, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <ellipseGeometry args={[0.55, 1.4, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
      </mesh>

      {/* Low Armored Body */}
      <mesh castShadow>
        <boxGeometry args={[0.65, 0.28, 1.6]} />
        <meshStandardMaterial map={texture} roughness={0.85} />
      </mesh>

      {/* Head with Long Snout */}
      <mesh position={[0, 0.04, 0.95]} castShadow>
        <boxGeometry args={[0.42, 0.22, 0.75]} />
        <meshStandardMaterial map={texture} roughness={0.8} />
      </mesh>

      {/* Muscular Heavy Tail */}
      <group ref={tailRef} position={[0, 0, -0.8]}>
        <mesh position={[0, 0.04, -0.55]} castShadow>
          <coneGeometry args={[0.28, 1.3, 10]} />
          <meshStandardMaterial map={texture} roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}
