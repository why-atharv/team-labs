import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useInstallationSocket } from './hooks/useSocket.js';
import { ForestEnvironment } from './components/ForestEnvironment.jsx';
import { AmbientFireflies } from './components/AmbientFireflies.jsx';
import { WildlifeManager } from './components/WildlifeManager.jsx';
import { LegendaryBanner } from './components/LegendaryBanner.jsx';
import { HUDOverlay } from './components/HUDOverlay.jsx';
import './index.css';

export default function App() {
  const {
    isConnected,
    animalList,
    pokemonList,
    recentApex,
    recentLegendary,
    recentCapture,
    serverInfo,
    spawnApex,
    spawnLegendary
  } = useInstallationSocket();

  const activeAnimals = animalList?.length > 0 ? animalList : (pokemonList || []);
  const activeApex = recentApex || recentLegendary;
  const triggerSpawn = spawnApex || spawnLegendary;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#020617' }}>
      {/* 2D HUD Overlays */}
      <HUDOverlay
        isConnected={isConnected}
        animalCount={activeAnimals.length}
        recentCapture={recentCapture}
        serverInfo={serverInfo}
        onSpawnApex={triggerSpawn}
      />

      <LegendaryBanner animal={activeApex} />

      {/* 3D React Three Fiber Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 16, 26], fov: 48 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false
        }}
        style={{ width: '100%', height: '100%', background: '#020617' }}
      >
        <Suspense fallback={null}>
          {/* teamLab Camera Controls (smooth panning with soft ground limits) */}
          <OrbitControls
            makeDefault
            enablePan={true}
            enableZoom={true}
            minDistance={8}
            maxDistance={42}
            maxPolarAngle={Math.PI / 2.06} // Prevent dipping below ground
            minPolarAngle={Math.PI / 6}
            dampingFactor={0.05}
          />

          {/* 3D Photorealistic Living Sanctuary Environment */}
          <ForestEnvironment />

          {/* Drifting Fireflies & Golden Pollen Spores */}
          <AmbientFireflies count={1000} />

          {/* Active Roaming 3D Wild Animals with Holographic Telemetry QR Codes */}
          <WildlifeManager animalList={activeAnimals} />

          {/* Post-Processing Pipeline: Bloom & Cinematic Vignette */}
          <EffectComposer multisampling={4}>
            <Bloom
              luminanceThreshold={0.55}
              luminanceSmoothing={0.8}
              height={300}
              intensity={1.15}
            />
            <Vignette eskil={false} offset={0.12} darkness={0.78} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
