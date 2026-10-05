/**
 * Automated Verification Script for teamLab Wildlife Sanctuary Installation
 * Validates:
 * 1. Server initialization and REST health endpoints
 * 2. Role-based client registration ('screen' vs 'mobile')
 * 3. Race condition prevention among concurrent mobile scans
 * 4. Apex Beast spawn pipeline and events
 */

import { io } from 'socket.io-client';

const BACKEND_URL = 'http://127.0.0.1:4000';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runVerification() {
  console.log('🧪 Starting Automated System Verification...');

  // 1. Health check via REST
  console.log('\n--- 1. Testing REST API Health ---');
  const res = await fetch(`${BACKEND_URL}/api/status`);
  const statusData = await res.json();
  console.log('✅ Server Status:', statusData.status);
  console.log(`✅ Active Animals in Sanctuary: ${statusData.activeAnimalsCount || statusData.activePokemonCount}`);
  if ((statusData.activeAnimalsCount || statusData.activePokemonCount) < 1) {
    throw new Error('Initial spawn count is 0');
  }

  // 2. Connect Screen Socket
  console.log('\n--- 2. Testing Screen Socket Connection & Sync ---');
  const screenSocket = io(BACKEND_URL, { transports: ['websocket'] });
  let screenReceivedInit = false;
  let screenActiveList = [];

  await new Promise((resolve) => {
    screenSocket.on('connect', () => {
      console.log('✅ Screen socket connected. Registering role...');
      screenSocket.emit('register_role', { role: 'screen' });
    });

    screenSocket.on('init_sync', (data) => {
      screenReceivedInit = true;
      screenActiveList = data.activeAnimals || data.activePokemon;
      console.log(`✅ Screen received init_sync with ${screenActiveList.length} wild animals.`);
      resolve();
    });
  });

  if (!screenReceivedInit || screenActiveList.length === 0) {
    throw new Error('Screen did not receive initial sync!');
  }

  // Pick target animal to document
  const targetAnimal = screenActiveList[0];
  console.log(`🎯 Selected Target: ${targetAnimal.name} (${targetAnimal.id})`);

  // 3. Connect 3 Mobile Sockets (Simulating 3 field rangers in the room)
  console.log('\n--- 3. Testing 3 Concurrent Mobile Sockets ---');
  const ranger1 = io(BACKEND_URL, { transports: ['websocket'] });
  const ranger2 = io(BACKEND_URL, { transports: ['websocket'] });
  const ranger3 = io(BACKEND_URL, { transports: ['websocket'] });

  await Promise.all([
    new Promise((resolve) => ranger1.on('connect', () => { ranger1.emit('register_role', { role: 'mobile', rangerName: 'Ranger_Sarah' }); resolve(); })),
    new Promise((resolve) => ranger2.on('connect', () => { ranger2.emit('register_role', { role: 'mobile', rangerName: 'Ranger_Marcus' }); resolve(); })),
    new Promise((resolve) => ranger3.on('connect', () => { ranger3.emit('register_role', { role: 'mobile', rangerName: 'Ranger_Leo' }); resolve(); }))
  ]);
  console.log('✅ All 3 mobile rangers connected & registered.');

  // Listen on screen for trigger_capture
  let screenCaptureTriggered = null;
  screenSocket.on('trigger_capture', (data) => {
    screenCaptureTriggered = data;
    const name = data.rangerName || data.trainerName;
    const animalName = data.animal?.name || data.pokemon?.name;
    console.log(`🖥️  [Screen Capture Event Verified] ${name} cataloged ${animalName}`);
  });

  // 4. Test Concurrency: All 3 rangers scan the EXACT SAME animal simultaneously!
  console.log('\n--- 4. Concurrency Test: 3 Rangers Scan Same Animal at Once ---');
  const results = [];

  const p1 = new Promise((resolve) => ranger1.once('capture_result', (r) => resolve({ ranger: 'Sarah', ...r })));
  const p2 = new Promise((resolve) => ranger2.once('capture_result', (r) => resolve({ ranger: 'Marcus', ...r })));
  const p3 = new Promise((resolve) => ranger3.once('capture_result', (r) => resolve({ ranger: 'Leo', ...r })));

  // Send simultaneous scan requests
  ranger1.emit('qr_scanned', { animalId: targetAnimal.id, rangerName: 'Ranger_Sarah' });
  ranger2.emit('qr_scanned', { animalId: targetAnimal.id, rangerName: 'Ranger_Marcus' });
  ranger3.emit('qr_scanned', { animalId: targetAnimal.id, rangerName: 'Ranger_Leo' });

  const [res1, res2, res3] = await Promise.all([p1, p2, p3]);
  results.push(res1, res2, res3);

  const winners = results.filter((r) => r.success === true);
  const losers = results.filter((r) => r.success === false && r.reason === 'already_captured');

  console.log(`🏆 Winners count: ${winners.length} (Expected: 1) -> Cataloged by ${winners[0]?.ranger}`);
  console.log(`❌ Collision rejection count: ${losers.length} (Expected: 2)`);

  if (winners.length !== 1 || losers.length !== 2) {
    throw new Error(`Race condition validation failed! Winners: ${winners.length}, Losers: ${losers.length}`);
  }
  console.log('✅ Race condition test PASSED flawlessly: exactly 1 winner, 2 blocked with already_captured.');

  if (!screenCaptureTriggered || (screenCaptureTriggered.animalId !== targetAnimal.id && screenCaptureTriggered.pokemonId !== targetAnimal.id)) {
    throw new Error('Screen did not receive the trigger_capture event!');
  }
  console.log('✅ Main Screen trigger_capture event verification PASSED.');

  // 5. Test Apex Beast Spawn Mechanism
  console.log('\n--- 5. Testing Apex Beast Spawn Pipeline ---');
  let apexSpawnReceived = null;
  const apexPromise = new Promise((resolve) => {
    screenSocket.on('animal_spawned', (a) => {
      if (a.isApex || a.isLegendary) {
        apexSpawnReceived = a;
        resolve(a);
      }
    });
  });

  // Trigger apex spawn
  screenSocket.emit('debug_spawn_apex');
  const spawnedApex = await apexPromise;
  console.log(`🌟 Apex Beast Spawned: ${spawnedApex.name} (${spawnedApex.scientificName})`);
  console.log(`✨ Category: ${spawnedApex.category}, Aura: ${spawnedApex.auraColor}`);

  if (!spawnedApex.isApex && !spawnedApex.isLegendary) {
    throw new Error('Spawned animal is not an apex beast!');
  }
  console.log('✅ Apex beast spawn verification PASSED.');

  // Cleanup
  screenSocket.disconnect();
  ranger1.disconnect();
  ranger2.disconnect();
  ranger3.disconnect();

  console.log('\n=============================================================');
  console.log('🎉 ALL SYSTEM TESTS PASSED SUCCESSFULLY! (100% OPERATIONAL)');
  console.log('=============================================================\n');
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
