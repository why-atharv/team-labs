/**
 * Master Wildlife Entity Component
 * teamLab Wildlife Living Sanctuary
 * Orchestrates 3D anatomical model selection, roaming AI, holographic telemetry QR beacon,
 * and biometric capture dissolve sequences.
 */

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRoamingAI } from '../hooks/useRoamingAI.js';
import { DynamicQRCode } from './DynamicQRCode.jsx';
import { LegendaryAura } from './LegendaryAura.jsx';
import { DissolveEffect } from './DissolveEffect.jsx';
import {
  BigCatMesh,
  WolfMesh,
  ElephantMesh,
  BearMesh,
  StagMesh,
  EagleMesh,
  ZebraMesh,
  CrocodileMesh
} from './Animal3DModels.jsx';

export function WildlifeEntity({ animal, pokemon }) {
  // Support both animal and legacy pokemon props
  const target = animal || pokemon;
  const groupRef = useRef();
  const [dissolved, setDissolved] = useState(false);

  // Initialize smooth autonomous roaming AI
  const { update } = useRoamingAI(
    target.spawnPosition,
    target.baseStats?.speedKmH ? target.baseStats.speedKmH * 0.9 : 60,
    target.isCapturing,
    target.archetype === 'eagle' // Eagle has aerial soaring roaming bounds
  );

  const [isMoving, setIsMoving] = useState(true);
  const isMovingRef = useRef(true);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const { position, rotationY, isMoving: moving } = update(delta);

    // Only trigger a re-render when the moving/idle phase actually changes.
    // (Calling setState every frame caused constant 60fps re-renders per animal.)
    if (moving !== isMovingRef.current) {
      isMovingRef.current = moving;
      setIsMoving(moving);
    }

    // Apply roaming position and heading to 3D group
    groupRef.current.position.copy(position);
    groupRef.current.rotation.y = rotationY;
  });

  if (dissolved) return null;

  const isApex = target.isApex || target.isLegendary;
  const scale = target.scale || 1.0;
  const archetype = target.archetype || 'tiger';

  // Height offset for holographic tracking QR beacon above head
  let qrHeight = scale * 2.5;
  if (archetype === 'elephant') qrHeight = 3.6;
  if (archetype === 'eagle') qrHeight = 4.2;
  if (archetype === 'bear') qrHeight = 2.8;

  return (
    <group ref={groupRef}>
      {/* 1. Realistic 3D Anatomical Animal Model */}
      {!target.isCapturing && (
        <>
          {(archetype === 'tiger' ||
            archetype === 'lion' ||
            archetype === 'snow_leopard' ||
            archetype === 'panther' ||
            archetype === 'cheetah') && (
            <BigCatMesh
              archetype={archetype}
              color={target.color}
              secondaryColor={target.secondaryColor}
              accentColor={target.accentColor}
              scale={scale}
              isApex={isApex}
              isMoving={isMoving}
            />
          )}

          {archetype === 'wolf' && (
            <WolfMesh
              color={target.color}
              secondaryColor={target.secondaryColor}
              accentColor={target.accentColor}
              scale={scale}
              isApex={isApex}
              isMoving={isMoving}
            />
          )}

          {archetype === 'elephant' && (
            <ElephantMesh
              color={target.color}
              secondaryColor={target.secondaryColor}
              accentColor={target.accentColor}
              scale={scale}
              isMoving={isMoving}
            />
          )}

          {archetype === 'bear' && (
            <BearMesh
              color={target.color}
              secondaryColor={target.secondaryColor}
              scale={scale}
              isMoving={isMoving}
            />
          )}

          {archetype === 'stag' && (
            <StagMesh
              color={target.color}
              secondaryColor={target.secondaryColor}
              accentColor={target.accentColor}
              scale={scale}
              isMoving={isMoving}
            />
          )}

          {archetype === 'eagle' && (
            <EagleMesh
              color={target.color}
              secondaryColor={target.secondaryColor}
              accentColor={target.accentColor}
              scale={scale}
            />
          )}

          {archetype === 'zebra' && (
            <ZebraMesh
              color={target.color}
              secondaryColor={target.secondaryColor}
              scale={scale}
              isMoving={isMoving}
            />
          )}

          {archetype === 'crocodile' && (
            <CrocodileMesh
              color={target.color}
              secondaryColor={target.secondaryColor}
              accentColor={target.accentColor}
              scale={scale}
              isMoving={isMoving}
            />
          )}
        </>
      )}

      {/* 2. Holographic Dynamic QR Telemetry Beacon Tracking Above Head */}
      <DynamicQRCode
        pokemonId={target.id}
        name={target.name}
        scientificName={target.scientificName}
        conservationStatus={target.conservationStatus}
        category={target.category}
        rarity={target.rarity}
        color={target.color}
        heightOffset={qrHeight}
        isCapturing={target.isCapturing}
      />

      {/* 3. Radiant Sanctuary Aura for Apex Beasts */}
      {isApex && !target.isCapturing && (
        <LegendaryAura
          auraColor={target.auraColor || target.color}
          lifespanMs={target.lifespanMs}
          spawnTime={target.spawnTime}
        />
      )}

      {/* 4. Biometric Telemetry & Particle Return Dissolve Effect */}
      {target.isCapturing && (
        <DissolveEffect
          color={target.color}
          auraColor={target.auraColor || '#10b981'}
          scale={scale}
          onComplete={() => setDissolved(true)}
        />
      )}
    </group>
  );
}

// Backward compatibility alias
export const PokemonEntity = WildlifeEntity;
