import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { mobileAudio } from '../utils/hapticsAndAudio.js';
import { WILDLIFE_CATALOG, findAnimalById } from '../utils/wildlifeCatalog.js';

export function useMobileSocket(rangerName = 'Ranger') {
  const [isConnected, setIsConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureResult, setCaptureResult] = useState(null);
  const [activeAnimals, setActiveAnimals] = useState(() => {
    // Default catalog sample so mobile scanner is never empty when deployed standalone on Vercel
    return WILDLIFE_CATALOG.slice(0, 8).map((w, idx) => ({
      ...w,
      id: `animal_${w.id_template}_${idx + 1}`
    }));
  });
  const [fieldGuide, setFieldGuide] = useState(() => {
    try {
      const saved = localStorage.getItem('teamlab_field_guide') || localStorage.getItem('teamlab_pokedex');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const socketRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const activeAnimalsRef = useRef(activeAnimals);

  useEffect(() => {
    activeAnimalsRef.current = activeAnimals;
  }, [activeAnimals]);

  // Cloud deployments (Vercel etc.) run the autonomous engine with no backend — treat as connected.
  // Local/LAN deployments report the REAL socket state so a dead backend is visible.
  const isCloudDeployment =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('vercel.app') ||
      (window.location.port === '' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1'));

  useEffect(() => {
    // 1. Setup Cross-Tab Broadcast Channel (synchronizes desktop screen & mobile scanner on same origin)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('teamlab_sanctuary_channel');
        broadcastChannelRef.current = channel;

        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'sync_wildlife' && Array.isArray(payload)) {
            setActiveAnimals(payload);
          } else if (type === 'animal_spawned' && payload) {
            setActiveAnimals((prev) => {
              if (prev.some((a) => a.id === payload.id)) return prev;
              return [...prev, payload];
            });
          } else if (type === 'animal_despawned' && payload?.id) {
            setActiveAnimals((prev) => prev.filter((a) => a.id !== payload.id));
          }
        };

        // Announce ranger presence
        channel.postMessage({ type: 'ranger_joined', rangerName });
      } catch (err) {
        console.warn('BroadcastChannel not available:', err);
      }
    }

    // 2. Connect to WebSocket if running locally or backend URL is configured
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isVercelOrCloud = window.location.hostname.includes('vercel.app') || (window.location.port === '' && !isLocalhost);
    const backendUrl = (isLocalhost || isVercelOrCloud) ? window.location.origin : `http://${window.location.hostname}:4000`;
    console.log(`📱 [Mobile Connecting] ${backendUrl} as ${rangerName}`);

    const socket = io(backendUrl, {
      reconnectionAttempts: 8,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Mobile scanner connected to Wildlife Sanctuary server');
      setIsConnected(true);
      socket.emit('register_role', {
        role: 'mobile',
        rangerName,
        trainerName: rangerName
      });
    });

    socket.on('disconnect', () => {
      console.warn('⚠️ Disconnected from Wildlife Sanctuary server');
      setIsConnected(false);
    });

    socket.on('registered', (data) => {
      const list = data.activeAnimals || data.activePokemon || [];
      if (list.length > 0) {
        setActiveAnimals(list);
      }
    });

    socket.on('population_update', (data) => {
      const list = data.activeAnimals || data.activePokemon || [];
      setActiveAnimals(list);
    });

    const handleAnimalSpawn = (animal) => {
      setActiveAnimals((prev) => {
        if (prev.some((a) => a.id === animal.id)) return prev;
        return [...prev, animal];
      });
    };

    socket.on('animal_spawned', handleAnimalSpawn);
    socket.on('pokemon_spawned', handleAnimalSpawn);

    const handleAnimalRemoved = (payload) => {
      const targetId = payload.animalId || payload.pokemonId;
      setActiveAnimals((prev) => prev.filter((a) => a.id !== targetId));
    };

    socket.on('animal_removed', handleAnimalRemoved);
    socket.on('pokemon_removed', handleAnimalRemoved);

    const handleAnimalDespawned = (payload) => {
      const targetId = payload.animalId || payload.pokemonId;
      setActiveAnimals((prev) => prev.filter((a) => a.id !== targetId));
    };

    socket.on('animal_despawned', handleAnimalDespawned);
    socket.on('pokemon_despawned', handleAnimalDespawned);

    socket.on('capture_result', (result) => {
      console.log('📥 [Telemetry Result Received]', result);
      setIsCapturing(false);
      setCaptureResult(result);

      const animal = result.animal || result.pokemon;

      if (result.success && animal) {
        if (animal.isApex || animal.isLegendary) {
          mobileAudio.playPredatorRoar();
        }
        mobileAudio.playWildlifeSuccess();

        setFieldGuide((prev) => {
          const updated = [animal, ...prev.filter((item) => item.id !== animal.id)];
          try {
            localStorage.setItem('teamlab_field_guide', JSON.stringify(updated));
            localStorage.setItem('teamlab_pokedex', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else {
        mobileAudio.playBuzzer();
      }
    });

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      socket.disconnect();
    };
  }, [rangerName]);

  const sendScan = useCallback(
    (scannedCode) => {
      console.log('📡 [Initiating Biometric Telemetry Lock]', scannedCode);
      setIsCapturing(true);
      mobileAudio.playScanBeep();

      if (socketRef.current?.connected) {
        // Live server mode: atomic mutex lock through backend
        socketRef.current.emit('qr_scanned', {
          animalId: scannedCode,
          pokemonId: scannedCode,
          rangerName,
          trainerName: rangerName
        });
      } else {
        // Autonomous / Vercel Standalone Mode:
        // Match target in activeAnimals or look up in catalog (read from ref, not stale closure)
        setTimeout(() => {
          let matched = activeAnimalsRef.current.find((a) => a.id === scannedCode);
          if (!matched) {
            matched = findAnimalById(scannedCode);
          }

          const resolvedAnimal = matched ? { ...matched, id: scannedCode } : WILDLIFE_CATALOG[0];

          // Broadcast to 3D main screen via BroadcastChannel
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
              type: 'animal_captured',
              payload: {
                animalId: scannedCode,
                rangerName,
                animal: resolvedAnimal
              }
            });
          }

          setIsCapturing(false);
          const result = {
            success: true,
            animal: resolvedAnimal,
            rangerName,
            isAutonomous: true
          };

          setCaptureResult(result);

          if (resolvedAnimal.isApex || resolvedAnimal.isLegendary) {
            mobileAudio.playPredatorRoar();
          }
          mobileAudio.playWildlifeSuccess();

          setFieldGuide((prev) => {
            const updated = [resolvedAnimal, ...prev.filter((item) => item.id !== resolvedAnimal.id)];
            try {
              localStorage.setItem('teamlab_field_guide', JSON.stringify(updated));
              localStorage.setItem('teamlab_pokedex', JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }, 600);
      }
    },
    [rangerName]
  );

  const clearCaptureResult = useCallback(() => {
    setCaptureResult(null);
  }, []);

  return {
    isConnected: isConnected || isCloudDeployment, // Real state locally, standalone-ready in the cloud
    isCapturing,
    captureResult,
    activeAnimals,
    activePokemon: activeAnimals,
    fieldGuide,
    pokedex: fieldGuide,
    sendScan,
    clearCaptureResult
  };
}
