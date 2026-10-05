import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useInstallationSocket } from './hooks/useSocket.js';
import { ForestEnvironment } from './components/ForestEnvironment.jsx';
import { AmbientFireflies } from './components/AmbientFireflies.jsx';
import { WildlifeManager } from './components/WildlifeManager.jsx';
import { LegendaryBanner } from './components/LegendaryBanner.jsx';
import { HUDOverlay } from './components/HUDOverlay.jsx';
import './index.css';

/* Full revolution takes this many seconds, on any display refresh rate. */
const ORBIT_SECONDS_PER_TURN = 60;

/**
 * Continuous clockwise auto-orbit around the OrbitControls target.
 *
 * OrbitControls' built-in `autoRotate` advances a fixed angle per rendered FRAME
 * (2*PI/60/60 * speed), so its speed scales with the monitor: at 144Hz the
 * sanctuary would complete a turn in 25s instead of 60s. Driving the orbit from
 * `delta` instead makes the turn time constant on every machine.
 *
 * Positive angle moves the camera toward +X, which reads as CLOCKWISE on screen
 * (verified by projecting a fixed world point: screen cross product is negative).
 * Note this is the OPPOSITE of OrbitControls' own autoRotate, which needs
 * `reverseOrbit` to look the same way.
 *
 * OrbitControls keeps ownership of the camera: it re-reads the camera position
 * each update, so it still works when the user drags, pans or zooms. We only skip
 * the auto-orbit while a drag is in progress so the view doesn't fight the user.
 */
function AutoOrbit({ controlsRef, secondsPerTurn = ORBIT_SECONDS_PER_TURN }) {
  const dragging = useRef(false);
  const controls = useThree((state) => state.controls);

  // OrbitControls keeps its interaction state in a closure, so the only public way
  // to know the user is steering the camera is the start/end events.
  useEffect(() => {
    const ctrl = controlsRef?.current || controls;
    if (!ctrl) return undefined;
    const onStart = () => { dragging.current = true; };
    const onEnd = () => { dragging.current = false; };
    ctrl.addEventListener('start', onStart);
    ctrl.addEventListener('end', onEnd);
    return () => {
      ctrl.removeEventListener('start', onStart);
      ctrl.removeEventListener('end', onEnd);
    };
  }, [controlsRef, controls]);

  // Priority -2 so this runs BEFORE OrbitControls' own useFrame (-1): we move the
  // camera first, then OrbitControls re-derives its spherical coords from the new
  // position and applies damping/clamps. Running after it would leave the camera
  // aimed one frame behind the orbit.
  useFrame((_, delta) => {
    const ctrl = controlsRef?.current || controls;
    if (!ctrl?.object || !ctrl.enabled) return;
    // Don't orbit out from under someone who is actively steering the camera.
    if (dragging.current) return;

    // Cap delta so a backgrounded tab doesn't jump a large angle on return.
    const step = Math.min(delta, 0.1) * ((Math.PI * 2) / secondsPerTurn);
    const camera = ctrl.object;
    const target = ctrl.target;
    const x = camera.position.x - target.x;
    const z = camera.position.z - target.z;
    const cos = Math.cos(step);
    const sin = Math.sin(step);
    camera.position.x = target.x + (x * cos + z * sin);
    camera.position.z = target.z + (z * cos - x * sin);
  }, -2);

  return null;
}

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
  const controlsRef = useRef(null);

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
          {/* Deep Sanctuary Volumetric Fog (must attach to the SCENE, not a nested group) */}
          <fogExp2 attach="fog" args={['#020617', 0.022]} />

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
            ref={controlsRef}
          />

          {/* Continuous clockwise auto-orbit (time-based, refresh-rate independent) */}
          <AutoOrbit controlsRef={controlsRef} />

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
