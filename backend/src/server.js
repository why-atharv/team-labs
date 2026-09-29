/**
 * Backend Installation Server (Node.js + Express + Socket.io)
 * teamLab Wildlife Living Sanctuary
 * Coordinates real-time communication between the Main Screen Display
 * and 10-12 concurrent mobile field ranger devices across the local network.
 */

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import qrcodeTerminal from 'qrcode-terminal';
import { GameStateManager } from './gameState.js';

const PORT = process.env.PORT || 4000;
const MOBILE_PORT = process.env.MOBILE_PORT || 5174;
const SCREEN_PORT = process.env.SCREEN_PORT || 5173;

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

/**
 * Helper: Detect Local Area Network (LAN) IPv4 Addresses
 * Prioritizes active Wi-Fi adapters over virtual/hotspot adapters
 */
function getNetworkIps() {
  const interfaces = os.networkInterfaces();
  const list = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const lower = name.toLowerCase();
        let priority = 5;

        // Prioritize actual Wi-Fi adapter (common in homes/venues)
        if (lower.includes('wi-fi') || lower.includes('wireless') || lower.includes('wlan')) {
          priority = 10;
        } else if (lower.includes('ethernet') || lower.includes('eth')) {
          priority = 8;
        } else if (lower.includes('local area') || iface.address.startsWith('192.168.137.')) {
          priority = 2; // Windows Mobile Hotspot adapter
        }

        list.push({
          name,
          address: iface.address,
          priority
        });
      }
    }
  }

  list.sort((a, b) => b.priority - a.priority);
  return list;
}

const networkList = getNetworkIps();
const lanIp = networkList[0]?.address || 'localhost';
const allIps = networkList.map((item) => ({ name: item.name, ip: item.address }));
const mobileLanUrl = process.env.MOBILE_SCANNER_URL || `http://${lanIp}:${MOBILE_PORT}`;
const screenUrl = process.env.MAIN_SCREEN_URL || `http://localhost:${SCREEN_PORT}`;

// Initialize State Engine with network awareness
const gameState = new GameStateManager(io, {
  lanIp,
  mobileUrl: mobileLanUrl,
  allIps
});
gameState.start();

// ===================== REST API =====================

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    theme: 'teamLab Wildlife Living Sanctuary',
    lanIp,
    allIps,
    mobileUrl: mobileLanUrl,
    activeAnimalsCount: gameState.activeAnimals.size,
    activePokemonCount: gameState.activeAnimals.size, // Compatibility
    connectedScreens: gameState.screenSockets.size,
    connectedMobiles: gameState.mobileSockets.size,
    activeAnimals: gameState.getActiveAnimalsList(),
    activePokemon: gameState.getActiveAnimalsList() // Compatibility
  });
});

// Operator / Demo trigger: Force spawn an Apex Beast (Legendary)
app.post(['/api/spawn/apex', '/api/spawn/legendary'], (req, res) => {
  const spawned = gameState.spawnRandomAnimal(true);
  res.json({ success: true, message: 'Apex Beast spawned!', animal: spawned, pokemon: spawned });
});

// Operator / Demo trigger: Force spawn a Standard Wild Animal
app.post(['/api/spawn/animal', '/api/spawn/standard'], (req, res) => {
  const spawned = gameState.spawnRandomAnimal(false);
  res.json({ success: true, message: 'Wild Animal spawned!', animal: spawned, pokemon: spawned });
});

// ===================== SOCKET.IO DISPATCHER =====================

io.on('connection', (socket) => {
  console.log(`⚡ [Socket Connected] ID: ${socket.id} (IP: ${socket.handshake.address})`);

  // Client registration based on role ('screen' | 'mobile')
  socket.on('register_role', (data = {}) => {
    const { role, rangerName, trainerName } = data;

    if (role === 'screen') {
      gameState.registerScreen(socket);
    } else if (role === 'mobile') {
      gameState.registerMobile(socket, { name: rangerName || trainerName });
    } else {
      console.warn(`⚠️ [Unknown Role] from socket ${socket.id}:`, role);
    }
  });

  // Mobile scans a QR code off the big screen
  socket.on('qr_scanned', (payload) => {
    if (!payload || (!payload.animalId && !payload.pokemonId)) {
      socket.emit('capture_result', { success: false, reason: 'invalid_payload' });
      return;
    }
    gameState.handleScanAttempt(socket, payload);
  });

  // Operator debug socket event to trigger an Apex spawn from screen controls
  const handleDebugApexSpawn = () => {
    console.log(`🕹️ [Debug Trigger] Force-spawning Apex Beast in Sanctuary`);
    gameState.spawnRandomAnimal(true);
  };
  socket.on('debug_spawn_apex', handleDebugApexSpawn);
  socket.on('debug_spawn_legendary', handleDebugApexSpawn);

  socket.on('disconnect', (reason) => {
    if (gameState.screenSockets.has(socket.id)) {
      gameState.unregisterScreen(socket);
    } else {
      gameState.unregisterMobile(socket);
    }
    console.log(`🔌 [Socket Disconnected] ID: ${socket.id} (${reason})`);
  });
});

// ===================== SERVER STARTUP =====================

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n=============================================================');
  console.log('🐾 teamLab 3D WILDLIFE LIVING SANCTUARY Server RUNNING');
  console.log('=============================================================');
  console.log(`📡 Backend Socket.io:          http://0.0.0.0:${PORT}`);
  console.log(`🖥️  Main Screen Display:        ${screenUrl}`);
  console.log(`📱 Mobile Field Guide (Local): http://localhost:${MOBILE_PORT}`);
  console.log(`📲 Mobile Field Guide (LAN):   ${mobileLanUrl}`);
  if (allIps.length > 1) {
    console.log('🌐 Additional Network Interfaces:');
    allIps.slice(1).forEach((item) => {
      console.log(`   - ${item.name}: http://${item.ip}:${MOBILE_PORT}`);
    });
  }
  console.log('-------------------------------------------------------------');
  console.log('📷 SCAN TO OPEN FIELD SCANNER ON LOCAL PHONES:');
  qrcodeTerminal.generate(mobileLanUrl, { small: true });
  console.log('=============================================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Wildlife Sanctuary server...');
  gameState.stop();
  server.close(() => {
    console.log('✅ Server gracefully terminated.');
    process.exit(0);
  });
});

export { app, server };
export default app;
