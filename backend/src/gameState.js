/**
 * GameState Manager: Wildlife Living Sanctuary
 * Authoritative in-memory state engine for teamLab Wildlife Sanctuary.
 * Coordinates real-time active wild animals, atomic capture/tagging locks, and lifecycles.
 */

import crypto from 'crypto';
import {
  WILDLIFE_CATALOG,
  APEX_WILDLIFE,
  RARE_WILDLIFE,
  COMMON_WILDLIFE
} from './wildlifeData.js';

export class GameStateManager {
  constructor(io, networkInfo = {}) {
    this.io = io;
    this.lanIp = networkInfo.lanIp || 'localhost';
    this.mobileUrl = networkInfo.mobileUrl || `http://${this.lanIp}:5174`;
    this.allIps = networkInfo.allIps || [];
    this.activeAnimals = new Map(); // id -> AnimalInstance
    this.screenSockets = new Set(); // Set of screen socket IDs
    this.mobileSockets = new Map(); // socketId -> rangerData

    // Wildlife Sanctuary Parameters
    this.MIN_ANIMALS = 5;
    this.MAX_ANIMALS = 8;
    this.APEX_CHANCE = 0.08; // 8% chance for rare Apex beast spawns
    this.SPAWN_INTERVAL_MS = 4500;
    this.TICK_INTERVAL_MS = 1000;
    this.CAPTURE_ANIMATION_MS = 3500; // Particle dissolve before server purge

    // Sanctuary Bounds (matches 3D terrain dimensions in Three.js)
    this.BOUNDS = {
      minX: -22,
      maxX: 22,
      minZ: -22,
      maxZ: 22,
      groundY: 0
    };

    this.spawnTimer = null;
    this.tickTimer = null;
  }

  // Backward compatibility getter
  get activePokemon() {
    return this.activeAnimals;
  }

  start() {
    console.log('🌿 [Wildlife Sanctuary] Initializing Living Ecosystem & Animal Spawner...');

    // Seed initial sanctuary population
    for (let i = 0; i < this.MIN_ANIMALS; i++) {
      this.spawnRandomAnimal(i === 0 ? false : undefined);
    }

    // Regular population replenishment loop
    this.spawnTimer = setInterval(() => {
      if (this.activeAnimals.size < this.MAX_ANIMALS) {
        this.spawnRandomAnimal();
      }
    }, this.SPAWN_INTERVAL_MS);

    // Lifetime tick (checks expired lifespans and despawns gently into mist)
    this.tickTimer = setInterval(() => {
      this.checkExpirations();
    }, this.TICK_INTERVAL_MS);
  }

  stop() {
    if (this.spawnTimer) clearInterval(this.spawnTimer);
    if (this.tickTimer) clearInterval(this.tickTimer);
  }

  registerScreen(socket) {
    this.screenSockets.add(socket.id);
    socket.join('screen_room');
    console.log(`🖥️  [Screen Connected] Total Screens: ${this.screenSockets.size}`);

    const activeList = this.getActiveAnimalsList();

    // Send full current state to newly connected screen with LAN URL
    socket.emit('init_sync', {
      activeAnimals: activeList,
      activePokemon: activeList, // Backward compatibility
      lanIp: this.lanIp,
      mobileUrl: this.mobileUrl,
      allIps: this.allIps
    });
  }

  unregisterScreen(socket) {
    this.screenSockets.delete(socket.id);
    console.log(`🖥️  [Screen Disconnected] Remaining Screens: ${this.screenSockets.size}`);
  }

  registerMobile(socket, rangerData = {}) {
    const ranger = {
      socketId: socket.id,
      name: rangerData.name || rangerData.trainerName || `Ranger_${socket.id.substring(0, 4)}`,
      device: rangerData.device || 'Mobile',
      joinedAt: Date.now()
    };
    this.mobileSockets.set(socket.id, ranger);
    socket.join('mobile_room');
    console.log(`📱 [Mobile Ranger Connected] ${ranger.name} (${socket.id}). Active Rangers: ${this.mobileSockets.size}`);

    const activeList = this.getActiveAnimalsList();

    socket.emit('registered', {
      success: true,
      ranger,
      trainer: ranger, // Backward compatibility
      activeCount: this.activeAnimals.size,
      activeAnimals: activeList,
      activePokemon: activeList // Backward compatibility
    });
  }

  unregisterMobile(socket) {
    const ranger = this.mobileSockets.get(socket.id);
    this.mobileSockets.delete(socket.id);
    if (ranger) {
      console.log(`📱 [Mobile Ranger Disconnected] ${ranger.name}. Active Rangers: ${this.mobileSockets.size}`);
    }
  }

  /**
   * Spawns a Wild Animal entity into the 3D sanctuary.
   */
  spawnRandomAnimal(forceApex = false) {
    const isApex = forceApex || Math.random() < this.APEX_CHANCE;
    let template;

    if (isApex) {
      template = APEX_WILDLIFE[Math.floor(Math.random() * APEX_WILDLIFE.length)];
    } else {
      // 30% Rare Giants, 70% Wild Safari
      const isRare = Math.random() < 0.3;
      const pool = isRare ? RARE_WILDLIFE : COMMON_WILDLIFE;
      template = pool[Math.floor(Math.random() * pool.length)];
    }

    const uniqueId = `wild_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = Date.now();
    const lifespan = template.lifespanMs || (isApex ? 38000 : 50000);

    // Initial random position on forest floor
    const spawnPosition = {
      x: Number((Math.random() * (this.BOUNDS.maxX - this.BOUNDS.minX) + this.BOUNDS.minX).toFixed(2)),
      y: this.BOUNDS.groundY,
      z: Number((Math.random() * (this.BOUNDS.maxZ - this.BOUNDS.minZ) + this.BOUNDS.minZ).toFixed(2))
    };

    const instance = {
      id: uniqueId,
      ...template,
      isApex: template.rarity === 'legendary',
      isLegendary: template.rarity === 'legendary', // Compatibility
      isCapturing: false,
      capturedBy: null,
      spawnPosition,
      spawnTime: now,
      lifespanMs: lifespan,
      expiresAt: now + lifespan
    };

    this.activeAnimals.set(uniqueId, instance);

    console.log(`🐾 [Spawn] ${instance.isApex ? '👑 APEX BEAST ' : '🌿 '}${instance.name} (${instance.scientificName}) at [${spawnPosition.x}, ${spawnPosition.z}]. Active: ${this.activeAnimals.size}`);

    // Broadcast to Main Screen and mobile devices (emit dual events for full compatibility)
    this.io.to('screen_room').emit('animal_spawned', instance);
    this.io.to('screen_room').emit('pokemon_spawned', instance);

    this.io.emit('population_update', {
      count: this.activeAnimals.size,
      activeAnimals: this.getActiveAnimalsList(),
      activePokemon: this.getActiveAnimalsList()
    });

    return instance;
  }

  // Alias for backward compatibility
  spawnRandomPokemon(forceLegendary) {
    return this.spawnRandomAnimal(forceLegendary);
  }

  /**
   * Authoritative Capture/Documentation Handler
   * Concurrently processes mobile scans with atomic locking.
   */
  handleScanAttempt(socket, payload = {}) {
    const animalId = payload.animalId || payload.pokemonId;
    const rangerName = payload.rangerName || payload.trainerName || 'Field Ranger';

    const ranger = this.mobileSockets.get(socket.id) || {
      socketId: socket.id,
      name: rangerName
    };

    console.log(`🎯 [Telemetry Scan] Ranger ${ranger.name} targeting ${animalId}`);

    // 1. Validation: Does animal exist in the sanctuary?
    const target = this.activeAnimals.get(animalId);

    if (!target) {
      console.log(`❌ [Scan Failed] Animal ${animalId} not found (retreated into deep wild)`);
      socket.emit('capture_result', {
        success: false,
        reason: 'not_found',
        message: 'This wild creature retreated deep into the forest sanctuary canopy!'
      });
      return;
    }

    // 2. Race Condition Check: Is it already being documented by another ranger?
    if (target.isCapturing) {
      console.log(`⏳ [Scan Collision] Animal ${animalId} already locked by ${target.capturedBy?.name}`);
      socket.emit('capture_result', {
        success: false,
        reason: 'already_captured',
        message: `Telemetry lock contested! Ranger ${target.capturedBy?.name} is already cataloging this ${target.name}!`,
        capturedBy: target.capturedBy?.name
      });
      return;
    }

    // 3. ATOMIC LOCK: Claim the capture exclusively
    target.isCapturing = true;
    target.capturedBy = {
      name: ranger.name,
      socketId: socket.id,
      capturedAt: Date.now()
    };

    console.log(`🎉 [Documented] Ranger ${ranger.name} successfully cataloged ${target.name} (${target.scientificName})!`);

    // 4. Notify Main Screen to execute the high-end 3D dissolve and telemetry beam
    const capturePayload = {
      animalId: target.id,
      pokemonId: target.id, // Compatibility
      rangerName: ranger.name,
      trainerName: ranger.name, // Compatibility
      animal: target,
      pokemon: target // Compatibility
    };

    this.io.to('screen_room').emit('trigger_capture', capturePayload);

    // 5. Send complete biological card payload to the mobile device
    socket.emit('capture_result', {
      success: true,
      animal: target,
      pokemon: target, // Compatibility
      message: `Specimen Documented! ${target.name} cataloged in Wildlife Field Guide!`
    });

    // 6. Hard-remove from sanctuary after particle dissolve finishes
    setTimeout(() => {
      this.activeAnimals.delete(animalId);
      this.io.to('screen_room').emit('animal_removed', { animalId, pokemonId: animalId });
      this.io.to('screen_room').emit('pokemon_removed', { animalId, pokemonId: animalId });
      this.io.emit('population_update', {
        count: this.activeAnimals.size,
        activeAnimals: this.getActiveAnimalsList(),
        activePokemon: this.getActiveAnimalsList()
      });

      // Respawn replacement if below minimum
      if (this.activeAnimals.size < this.MIN_ANIMALS) {
        this.spawnRandomAnimal();
      }
    }, this.CAPTURE_ANIMATION_MS);
  }

  /**
   * Monitor animals that reach the end of their sanctuary visit duration.
   */
  checkExpirations() {
    const now = Date.now();
    for (const [id, animal] of this.activeAnimals.entries()) {
      if (!animal.isCapturing && animal.expiresAt && now > animal.expiresAt) {
        console.log(`🍃 [Despawn] ${animal.name} (${id}) retreated into the forest mist.`);
        this.activeAnimals.delete(id);
        this.io.to('screen_room').emit('animal_despawned', { animalId: id, pokemonId: id });
        this.io.to('screen_room').emit('pokemon_despawned', { animalId: id, pokemonId: id });
        this.io.emit('population_update', {
          count: this.activeAnimals.size,
          activeAnimals: this.getActiveAnimalsList(),
          activePokemon: this.getActiveAnimalsList()
        });
      }
    }
  }

  getActiveAnimalsList() {
    return Array.from(this.activeAnimals.values());
  }

  getActivePokemonList() {
    return this.getActiveAnimalsList();
  }
}
