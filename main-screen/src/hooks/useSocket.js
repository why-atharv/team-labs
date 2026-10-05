import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { installationAudio } from '../utils/audio.js';
import { createRandomAnimalInstance } from '../utils/wildlifeCatalog.js';

export function useInstallationSocket(serverUrl) {
  const [isConnected, setIsConnected] = useState(false);
  const [animalList, setAnimalList] = useState([]);
  const [recentApex, setRecentApex] = useState(null);
  const [recentCapture, setRecentCapture] = useState(null);
  const [serverStats, setServerStats] = useState({ activeCount: 0, connectedPhones: 0 });
  const [serverInfo, setServerInfo] = useState({ lanIp: '', mobileUrl: '', allIps: [] });
  const socketRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const isAutonomousRef = useRef(false);
  const animalListRef = useRef([]); // Always-fresh list for cross-tab sync (avoids stale closures)
  // The server emits the same spawn as BOTH 'animal_spawned' and 'pokemon_spawned' (compat) —
  // dedupe so audio / apex banner side-effects only fire once per real spawn.
  const recentSpawnIdsRef = useRef(new Map());

  useEffect(() => {
    animalListRef.current = animalList;
  }, [animalList]);

  useEffect(() => {
    // 1. Cross-Tab / Cross-Window Broadcast Channel for instant standalone synchronization
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('teamlab_sanctuary_channel');
        broadcastChannelRef.current = channel;

        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'animal_captured' && payload) {
            const targetId = payload.animalId;
            const ranger = payload.rangerName || 'Field Ranger';
            const animal = payload.animal;

            console.log(`🎯 [Channel Capture] ${targetId} documented by ${ranger}`);
            installationAudio.playCaptureAbsorption();

            setRecentCapture({ animalId: targetId, rangerName: ranger, animal });
            setTimeout(() => setRecentCapture(null), 4000);

            setAnimalList((prev) =>
              prev.map((a) => (a.id === targetId ? { ...a, isCapturing: true, capturedBy: ranger } : a))
            );

            // Despawn after capture dissolve animation completes
            setTimeout(() => {
              setAnimalList((prev) => prev.filter((a) => a.id !== targetId));
            }, 2200);
          } else if (type === 'ranger_joined') {
            console.log(`📡 [Channel Ranger Joined] ${payload?.rangerName}`);
            // Sync current active animals to newly joined ranger (read fresh list, not stale closure)
            if (animalListRef.current.length > 0) {
              channel.postMessage({ type: 'sync_wildlife', payload: animalListRef.current });
            }
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    // 2. Determine backend URL (local or env override)
    const envBackend = import.meta.env?.VITE_BACKEND_URL;
    const backendUrl =
      serverUrl ||
      envBackend ||
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://${window.location.hostname}:4000`
        : null);

    let socket = null;

    if (backendUrl) {
      console.log(`🔌 [Connecting to Wildlife Server] ${backendUrl}`);
      socket = io(backendUrl, {
        reconnectionAttempts: 6,
        reconnectionDelay: 2000,
        transports: ['websocket', 'polling']
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Connected to backend installation server as Screen Display');
        setIsConnected(true);
        isAutonomousRef.current = false;
        socket.emit('register_role', { role: 'screen' });
      });

      socket.on('disconnect', () => {
        console.warn('⚠️ Disconnected from installation server');
        setIsConnected(false);
      });

      socket.on('init_sync', (data) => {
        const list = data.activeAnimals || data.activePokemon || [];
        console.log('📥 [Init Sync] Active wild animals from server:', list.length);
        setAnimalList(list);
        if (data.mobileUrl) {
          setServerInfo({
            lanIp: data.lanIp || '',
            mobileUrl: data.mobileUrl || '',
            allIps: data.allIps || []
          });
        }
      });

      const handleAnimalSpawn = (animal) => {
        if (!animal?.id) return;
        const seen = recentSpawnIdsRef.current;
        const now = Date.now();
        // Prune stale entries
        for (const [id, ts] of seen) {
          if (now - ts > 10000) seen.delete(id);
        }
        if (seen.has(animal.id)) return; // duplicate compat event — ignore
        seen.set(animal.id, now);

        console.log(`✨ [Wildlife Spawned] ${animal.name} [${animal.rarity}]`);
        setAnimalList((prev) => {
          if (prev.some((a) => a.id === animal.id)) return prev;
          return [...prev, animal];
        });

        if (animal.isApex || animal.isLegendary) {
          installationAudio.playApexArrival();
          setRecentApex(animal);
          setTimeout(() => setRecentApex(null), 6000);
        } else {
          installationAudio.playChime();
        }
      };

      socket.on('animal_spawned', handleAnimalSpawn);
      socket.on('pokemon_spawned', handleAnimalSpawn);

      socket.on('trigger_capture', (payload) => {
        const targetId = payload.animalId || payload.pokemonId;
        const ranger = payload.rangerName || payload.trainerName;
        const animal = payload.animal || payload.pokemon;

        console.log(`🎯 [Telemetry Lock Triggered] ${targetId} cataloged by Ranger ${ranger}`);
        installationAudio.playCaptureAbsorption();

        setRecentCapture({ animalId: targetId, rangerName: ranger, animal });
        setTimeout(() => setRecentCapture(null), 4000);

        setAnimalList((prev) =>
          prev.map((a) => (a.id === targetId ? { ...a, isCapturing: true, capturedBy: ranger } : a))
        );
      });

      const handleAnimalRemoved = (payload) => {
        const targetId = payload.animalId || payload.pokemonId;
        setAnimalList((prev) => prev.filter((a) => a.id !== targetId));
      };

      socket.on('animal_removed', handleAnimalRemoved);
      socket.on('pokemon_removed', handleAnimalRemoved);

      const handleAnimalDespawned = (payload) => {
        const targetId = payload.animalId || payload.pokemonId;
        setAnimalList((prev) => prev.filter((a) => a.id !== targetId));
      };

      socket.on('animal_despawned', handleAnimalDespawned);
      socket.on('pokemon_despawned', handleAnimalDespawned);

      socket.on('population_update', ({ count }) => {
        setServerStats((prev) => ({ ...prev, activeCount: count }));
      });
    }

    // =========================================================================
    // Autonomous Sanctuary Engine (Fallback when running on Vercel or offline)
    // =========================================================================
    const fallbackTimer = setTimeout(() => {
      if (!socket || !socket.connected) {
        console.log('🌿 [Autonomous Sanctuary Active] Running standalone living wildlife ecosystem.');
        isAutonomousRef.current = true;
        setIsConnected(true);

        // Seed initial sanctuary population (6 wild animals)
        setAnimalList((prev) => {
          if (prev.length > 0) return prev;
          const initial = [];
          for (let i = 0; i < 6; i++) {
            initial.push(createRandomAnimalInstance(i === 0));
          }
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({ type: 'sync_wildlife', payload: initial });
          }
          return initial;
        });
      }
    }, 1500);

    // Autonomous population maintenance loop
    const autoLoop = setInterval(() => {
      if (!isAutonomousRef.current) return;

      const now = Date.now();
      setAnimalList((prev) => {
        // Despawn expired
        let updated = prev.filter((a) => !a.expiresAt || a.expiresAt > now || a.isCapturing);

        // Spawn replacement if below 6
        if (updated.length < 6) {
          const newAnimal = createRandomAnimalInstance();
          updated.push(newAnimal);
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({ type: 'animal_spawned', payload: newAnimal });
          }
        }
        return updated;
      });
    }, 4500);

    return () => {
      clearTimeout(fallbackTimer);
      clearInterval(autoLoop);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      if (socket) socket.disconnect();
    };
  }, [serverUrl]);

  // Operator spawn function
  const spawnApex = useCallback(() => {
    if (socketRef.current?.connected) {
      // Server handles both legacy event names with the same handler — emit only ONE to avoid double spawns
      socketRef.current.emit('debug_spawn_apex');
    } else {
      // Local autonomous spawn
      const newApex = createRandomAnimalInstance(true);
      installationAudio.playApexArrival();
      setRecentApex(newApex);
      setTimeout(() => setRecentApex(null), 6000);

      setAnimalList((prev) => {
        const next = [newApex, ...prev];
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({ type: 'animal_spawned', payload: newApex });
        }
        return next;
      });
    }
  }, []);

  return {
    isConnected,
    animalList,
    pokemonList: animalList,
    recentApex,
    recentLegendary: recentApex,
    recentCapture,
    serverStats,
    serverInfo,
    spawnApex,
    spawnLegendary: spawnApex
  };
}
