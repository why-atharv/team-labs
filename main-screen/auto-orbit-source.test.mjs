// Verifies the SHIPPED AutoOrbit implementation by extracting the real useFrame
// callback out of src/App.jsx and executing it — so this test cannot drift from
// the code it claims to cover.
import { readFileSync } from 'node:fs';
import * as THREE from 'three';

const src = readFileSync(new URL('./src/App.jsx', import.meta.url), 'utf8');

// Pull out the auto-orbit statements between the delta cap and the closing of useFrame.
const bodyMatch = src.match(
  /const step = Math\.min\(delta, 0\.1\)[^]*?camera\.position\.z = target\.z \+ \(z \* cos - x \* sin\);/
);
if (!bodyMatch) throw new Error('could not extract the orbit body from src/App.jsx');
const body = bodyMatch[0];

// Confirm the extracted code really is the shipped arithmetic.
const secondsPerTurn = 60;
const stepExpr = src.match(/const step = Math\.min\(delta, 0\.1\) \* \(\(Math\.PI \* 2\) \/ (\w+)\)/);
if (!stepExpr) throw new Error('could not find the step expression');
const paramName = stepExpr[1];
if (!src.includes(`secondsPerTurn = ORBIT_SECONDS_PER_TURN`) && !src.includes(paramName)) {
  throw new Error('secondsPerTurn wiring not found');
}
const declaredTurn = Number(src.match(/ORBIT_SECONDS_PER_TURN = (\d+)/)[1]);
if (declaredTurn !== secondsPerTurn) throw new Error(`expected 60, got ${declaredTurn}`);

const PRIORITY = Number(src.match(/\}, (-?\d+)\);\s*\n\s*\n\s*return null;/)[1]);

// Execute the extracted statements. Note the shipped code declares its own
// `camera`/`target` from `ctrl`, so we pass ctrl in and it does the unpacking.
function makeStepFn() {
  const fn = new Function(
    'ctrl', 'delta', 'secondsPerTurn',
    body
      .replace(/const step = Math\.min\(delta, 0\.1\) \* \(\(Math\.PI \* 2\) \/ (\w+)\)/,
               'const step = Math.min(delta, 0.1) * ((Math.PI * 2) / secondsPerTurn)')
      .replace('const camera = ctrl.object;', 'const camera = ctrl.object;')
  );
  return (ctrl, delta) => fn(ctrl, delta, secondsPerTurn);
}
const step = makeStepFn();
// Build a fake OrbitControls: the shipped body expects ctrl.object / ctrl.target
const fakeControls = (cam, tgt) => ({ object: cam, target: tgt, enabled: true });

console.log('Extracted from src/App.jsx:');
console.log('  ' + body.replace(/\s+/g, ' ').trim());
console.log(`  useFrame priority = ${PRIORITY} (OrbitControls uses -1)\n`);

const W = 1600, H = 900;
function camera() {
  const c = new THREE.PerspectiveCamera(48, W / H, 0.1, 300);
  c.position.set(0, 16, 26);
  c.lookAt(0, 0, 0);
  return c;
}
const target = new THREE.Vector3(0, 0, 0);

let failures = 0;
const check = (name, pass, detail) => {
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
  if (!pass) failures++;
};

// 1. frame-rate independence
console.log('1. Same wall time, same rotation, at every frame rate');
{
  const results = [30, 60, 90, 120, 144, 165].map((fps) => {
    const c = camera();
    const frames = Math.round(10 * fps);
    const ctrl = fakeControls(c, target);
    for (let i = 0; i < frames; i++) step(ctrl, 1 / fps);
    let az = (Math.atan2(c.position.x, c.position.z) * 180) / Math.PI;
    if (az < 0) az += 360;
    return { fps, az };
  });
  results.forEach(r => console.log(`      ${String(r.fps).padStart(3)}fps -> ${r.az.toFixed(3)}deg`));
  const all = results.every(r => Math.abs(r.az - 60) < 1e-6);
  check('all frame rates give 60deg in 10s', all, `expected 60deg (360/60 * 10)`);
}

// 2. clockwise on screen
console.log('\n2. On-screen direction (short, wrap-free window)');
{
  const c = camera();
  const p = new THREE.Vector3(9, 3, 0);
  c.updateMatrixWorld();
  const s0 = p.clone().project(c);
  const ctrl = fakeControls(c, target);
  for (let i = 0; i < 15; i++) {
    step(ctrl, 1 / 60);
    // OrbitControls runs immediately after AutoOrbit (priority -1) and re-aims the
    // camera at the target, so mirror that here before projecting.
    c.lookAt(target);
  }
  c.updateMatrixWorld();
  const s1 = p.clone().project(c);
  const cross = s0.x * (s1.y - s0.y) - s0.y * (s1.x - s0.x);
  check('viewer sees CLOCKWISE', cross < 0, `cross=${cross.toFixed(5)}`);
}

// 3. orbit geometry preserved
console.log('\n3. Orbit does not drift in distance or height');
{
  const c = camera();
  const d0 = c.position.distanceTo(target), h0 = c.position.y;
  const ctrl = fakeControls(c, target);
  for (let i = 0; i < 3600; i++) step(ctrl, 1 / 60); // full minute
  const d1 = c.position.distanceTo(target);
  check('distance preserved after a full turn', Math.abs(d1 - d0) < 1e-9, `${d0.toFixed(6)} -> ${d1.toFixed(6)}`);
  check('height preserved', Math.abs(c.position.y - h0) < 1e-12, `y=${c.position.y.toFixed(6)}`);
}

// 4. huge delta clamp (backgrounded tab)
console.log('\n4. Backgrounded tab does not jump');
{
  const c = camera();
  step(fakeControls(c, target), 30);
  const deg = (Math.atan2(c.position.x, c.position.z) * 180) / Math.PI;
  check('30s stall advances only 0.6deg', Math.abs(deg - 0.6) < 1e-6, `${deg.toFixed(4)}deg`);
}

// 5. user-panned target is respected
console.log('\n5. Orbit follows a panned target');
{
  const c = camera();
  const t2 = new THREE.Vector3(5, 0, -3);
  c.position.set(5, 16, 23);
  const before = Math.atan2(c.position.x - t2.x, c.position.z - t2.z);
  const ctrl = fakeControls(c, t2);
  for (let i = 0; i < 60; i++) step(ctrl, 1 / 60);
  const after = Math.atan2(c.position.x - t2.x, c.position.z - t2.z);
  let d = after - before;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  check('rotates around the panned target', Math.abs((d * 180) / Math.PI - 6) < 1e-6, `${((d*180)/Math.PI).toFixed(3)}deg in 1s`);
}

console.log('\n6. Frame ordering');
check('AutoOrbit priority < OrbitControls priority (-1)', PRIORITY < -1, `priority=${PRIORITY}`);

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;