/**
 * Autonomous Animal Roaming & Steering AI
 * teamLab Wildlife Living Sanctuary
 * Features smooth organic wandering, avoidance steering, natural pauses,
 * grounded quadruped strides, and 3D soaring flight for eagles.
 */

import { useRef } from 'react';
import * as THREE from 'three';

const SANCTUARY_BOUNDS = {
  minX: -19,
  maxX: 19,
  minZ: -19,
  maxZ: 19
};

export function useRoamingAI(initialPos, speed = 60, isCapturing = false, isAerial = false) {
  const currentPos = useRef(
    new THREE.Vector3(
      initialPos?.x ?? (Math.random() * 26 - 13),
      isAerial ? 3.8 : (initialPos?.y ?? 0),
      initialPos?.z ?? (Math.random() * 26 - 13)
    )
  );

  const targetPos = useRef(new THREE.Vector3().copy(currentPos.current));
  const rotationY = useRef(Math.random() * Math.PI * 2);
  const targetRotationY = useRef(rotationY.current);

  const state = useRef({
    isPaused: false,
    pauseTimer: 0,
    stridePhase: Math.random() * Math.PI * 2,
    baseSpeed: 0.9 + (speed / 100) * 1.1
  });

  const pickNewTarget = () => {
    // Pick target well within safe sanctuary clearing
    const tx = THREE.MathUtils.randFloat(SANCTUARY_BOUNDS.minX + 3, SANCTUARY_BOUNDS.maxX - 3);
    const tz = THREE.MathUtils.randFloat(SANCTUARY_BOUNDS.minZ + 3, SANCTUARY_BOUNDS.maxZ - 3);
    const ty = isAerial ? THREE.MathUtils.randFloat(3.2, 5.8) : 0;
    targetPos.current.set(tx, ty, tz);

    // Calculate heading direction
    const dirX = tx - currentPos.current.x;
    const dirZ = tz - currentPos.current.z;
    targetRotationY.current = Math.atan2(dirX, dirZ);
  };

  const update = (delta) => {
    // If being captured/documented, freeze roaming and elevate into biometric beam
    if (isCapturing) {
      currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, 2.0, delta * 3.0);
      return {
        position: currentPos.current,
        rotationY: rotationY.current,
        isMoving: false
      };
    }

    const s = state.current;

    // Natural pause behavior (grazing, sniffing, observing)
    if (s.isPaused) {
      s.pauseTimer -= delta;
      if (s.pauseTimer <= 0) {
        s.isPaused = false;
        pickNewTarget();
      }
      return {
        position: currentPos.current,
        rotationY: rotationY.current,
        isMoving: false
      };
    }

    // Distance to target
    const toTarget = new THREE.Vector3().subVectors(targetPos.current, currentPos.current);
    if (!isAerial) toTarget.y = 0;
    const dist = toTarget.length();

    if (dist < 0.8) {
      // Reached destination -> enter natural pause
      s.isPaused = true;
      s.pauseTimer = isAerial ? 0.2 : THREE.MathUtils.randFloat(2.0, 5.0);
      return {
        position: currentPos.current,
        rotationY: rotationY.current,
        isMoving: false
      };
    }

    // Smooth boundary steering
    const margin = 4.0;
    const steer = new THREE.Vector3();
    if (currentPos.current.x < SANCTUARY_BOUNDS.minX + margin) steer.x += 2.0;
    if (currentPos.current.x > SANCTUARY_BOUNDS.maxX - margin) steer.x -= 2.0;
    if (currentPos.current.z < SANCTUARY_BOUNDS.minZ + margin) steer.z += 2.0;
    if (currentPos.current.z > SANCTUARY_BOUNDS.maxZ - margin) steer.z -= 2.0;

    // Combine direction with steering
    toTarget.normalize();
    if (steer.lengthSq() > 0) {
      toTarget.add(steer.multiplyScalar(0.4)).normalize();
      targetRotationY.current = Math.atan2(toTarget.x, toTarget.z);
    }

    // Advance position smoothly
    const step = s.baseSpeed * delta;
    currentPos.current.x += toTarget.x * step;
    currentPos.current.z += toTarget.z * step;

    if (isAerial) {
      // Smooth soaring altitude adjustment
      currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, targetPos.current.y, delta * 1.5);
    } else {
      // Natural grounded stride (zero hopping glitch, smooth contact with floor)
      currentPos.current.y = 0;
    }

    // Shortest angular turn interpolation
    let diff = targetRotationY.current - rotationY.current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    rotationY.current += diff * Math.min(delta * 3.5, 1.0);

    return {
      position: currentPos.current,
      rotationY: rotationY.current,
      isMoving: true
    };
  };

  return { update, currentPos, pickNewTarget };
}
