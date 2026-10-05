# teamLab: 3D Wildlife Living Sanctuary
### Interactive Physical Digital Installation & Web App (Three.js + React Three Fiber + Mobile Wildlife Field Scanner)

A photorealistic real-time physical digital installation inspired by **teamLab Borderless/Planets**, built entirely on modern web standards to run both across a Local Area Network (LAN) and as a live cloud deployment on **Vercel**. Exclusively populated by realistic, majestic **Wild Animals**.

---

## 🌐 Live Cloud Deployment & Direct Link (Vercel)

This project is fully architected for instant deployment to **Vercel** with a direct web link:
- **3D Main Living Sanctuary**: `https://<your-project>.vercel.app/`
- **Mobile Field Scanner**: `https://<your-project>.vercel.app/scanner/`

> **Note on Cloud Standalone Mode**: When deployed on Vercel without a persistent WebSocket backend, the sanctuary activates its built-in **Autonomous Ecosystem Engine** and browser **BroadcastChannel API**. The 3D wild animals roam, spawn, and can be scanned and documented live on mobile phones and across browser tabs!

### Deploying to Vercel in 1 Click:
1. Push this repository to your GitHub account (see [GitHub Instructions](#-uploading-to-github)).
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your GitHub repository `3D-Wildlife-Sanctuary`.
4. Leave the settings at default (Vercel will detect `vercel.json` and run `npm run build` which bundles both the 3D sanctuary and mobile scanner).
5. Click **Deploy**!
6. Open your live direct link (e.g., `https://teamlab-wildlife-sanctuary.vercel.app`).

---

## 🐙 Uploading to GitHub

Follow these steps in your terminal to publish to your GitHub:

```bash
# 1. Initialize and stage all files (if not already done)
git add .

# 2. Commit the changes
git commit -m "feat: complete teamLab 3D Wildlife Living Sanctuary with realistic animals and Vercel support"

# 3. Create a new repository on https://github.com/new (e.g., named '3d-wildlife-sanctuary')

# 4. Link your remote repository and push (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/3d-wildlife-sanctuary.git
git branch -M main
git push -u origin main
```

*(Or use the GitHub CLI: `gh repo create 3d-wildlife-sanctuary --public --source=. --push`)*

---

## 🏛️ System Architecture

```
                       +-------------------------------------------------------+
                       |              Network Layer (LAN or Cloud)             |
                       +-------------------------------------------------------+
                                                   |
              +------------------------------------+-----------------------------------+
              |                                    |                                   |
              v                                    v                                   v
   +-----------------------+           +-----------------------+           +-----------------------+
   |   MAIN SCREEN DISPLAY |           |   AUTHORITATIVE       |           |   MOBILE FIELD RANGER |
   |   (/ or Port 5173)    |           |   BACKEND SERVER      |           |   (/scanner/ or 5174) |
   |                       |           |   (Port 4000)         |           |   (Mobile Phones)     |
   | - React Three Fiber   | <=======> | - Node.js + Express   | <=======> | - html5-qrcode camera |
   | - 3D Living Sanctuary | WebSockets| - Socket.io engine    | WebSockets| - Biometric Radar Lock|
   |   River & Forest      | or Cloud  | - Atomic capture lock | or Cloud  | - Tactile Haptics/SFX |
   | - Realistic 3D Animals| Broadcast | - Apex Beast Spawner  | Broadcast | - Field Guide Cards   |
   |   (Tigers, Lions, etc)|           | - LAN IP Discovery &  |           | - Zoological Database |
   | - Articulated Strides |           |   Console ASCII QR    |           +-----------------------+
   | - Holographic QR Beams|           +-----------------------+
   | - Biometric Dissolve  |
   +-----------------------+
```

---

## 🐾 Wild Species Roster

All creatures in this sanctuary are **exclusively real wild animals**, complete with authentic zoological classifications, scientific nomenclature, biomes, speeds, weights, and conservation statuses:

### 👑 Apex Sovereigns (Rare Spawns)
1. **Royal Bengal Tiger** (*Panthera tigris tigris*) — Endangered • 65 km/h • 230 kg • Sundarbans Mangroves
2. **African Lion** (*Panthera leo*) — Vulnerable • 80 km/h • 210 kg • Sub-Saharan Savannah
3. **Snow Leopard** (*Panthera uncia*) — Vulnerable • 64 km/h • 55 kg • Himalayan High Crags
4. **Alpha Timber Wolf** (*Canis lupus*) — Least Concern • 60 km/h • 58 kg • Boreal Taiga
5. **Black Panther** (*Panthera onca*) — Near Threatened • 70 km/h • 100 kg • Amazon Rainforest

### 🌿 Majestic Giants & Rare Wildlife
6. **African Bush Elephant** (*Loxodonta africana*) — Endangered • 40 km/h • 6,000 kg • African Woodlands
7. **Grizzly Bear** (*Ursus arctos horribilis*) — Least Concern • 56 km/h • 380 kg • Alpine Valleys
8. **Majestic Red Deer Stag** (*Cervus elaphus*) — Least Concern • 72 km/h • 240 kg • Highland Woods
9. **Nile Crocodile** (*Crocodylus niloticus*) — Least Concern • 30 km/h • 750 kg • Freshwater Basins

### ⚡ Wild Safari & Forest Species
10. **African Cheetah** (*Acinonyx jubatus*) — Vulnerable • 112 km/h • 52 kg • Open Plains
11. **Plains Zebra** (*Equus quagga*) — Near Threatened • 68 km/h • 320 kg • Savannah Grasslands
12. **Golden Eagle** (*Aquila chrysaetos*) — Least Concern • 240 km/h dive • 5.5 kg • Mountain Cliffs

---

## 📁 Project Structure

```
d:/3D Web Page/
├── vercel.json                    # Unified Vercel production routing configuration
├── build-vercel.js                # Cross-platform production build & bundle merge script
├── backend/                       # Node.js + Socket.io Server
│   ├── src/
│   │   ├── server.js              # Express + Socket.io HTTP/WS server & LAN IP discovery
│   │   ├── gameState.js           # Authoritative state engine with atomic telemetry locks
│   │   └── wildlifeData.js        # Comprehensive wildlife biological catalog & metrics
│   └── test-installation.js       # Automated test suite (race condition & socket tests)
├── main-screen/                   # Big Screen Display (React Three Fiber)
│   ├── src/
│   │   ├── App.jsx                # R3F Canvas, Postprocessing Bloom & HUD integration
│   │   ├── components/
│   │   │   ├── ForestEnvironment.jsx  # Undulating terrain, reflective river, branching trees & flora
│   │   │   ├── Animal3DModels.jsx     # Articulated anatomical 3D models with quadruped walk cycles
│   │   │   ├── WildlifeEntity.jsx     # Master entity orchestrator (models, AI, telemetry)
│   │   │   ├── WildlifeManager.jsx    # Population manager & lifecycle orchestrator
│   │   │   ├── DynamicQRCode.jsx      # 3D billboarded tracking QR beacon with telemetry reticle
│   │   │   ├── DissolveEffect.jsx     # 2,200-particle upward bio-vortex return beam
│   │   │   ├── LegendaryAura.jsx      # Sacred geometry radiant aura & bloom for Apex beasts
│   │   │   ├── LegendaryBanner.jsx    # Cinematic screen announcement banner for Apex beasts
│   │   │   └── HUDOverlay.jsx         # Status, audio toggle, fullscreen & mobile pairing QR
│   │   ├── hooks/
│   │   │   ├── useSocket.js           # Real-time WebSocket & BroadcastChannel synchronization
│   │   │   └── useRoamingAI.js        # Smooth wandering steering behavior & eagle soaring
│   │   └── utils/
│   │       ├── animalTextures.js      # Procedural PBR canvas textures (stripes, rosettes, fur)
│   │       ├── audio.js               # Procedural Web Audio synthesizer (100% offline resilient)
│   │       └── wildlifeCatalog.js     # Autonomous catalog for cloud & standalone deployments
└── mobile-scanner/                # Mobile Web App for Field Rangers
    ├── src/
    │   ├── App.jsx                # Ranger state, Field Guide drawer, and scanner viewport
    │   ├── components/
    │   │   ├── ScannerView.jsx        # html5-qrcode camera stream with animated laser viewfinder
    │   │   ├── WildlifeFieldCardModal.jsx # Biometric lock-on, confetti, and complete zoological field card
    │   │   ├── WildlifeFieldGuideDrawer.jsx # Expedition Journal storing documented wildlife with filters
    │   │   └── TrainerHeader.jsx      # Ranger status chip & Field Guide counter
    │   ├── hooks/
    │   │   └── useMobileSocket.js     # Mobile socket & BroadcastChannel client with auto-fallback
    │   └── utils/
    │       ├── hapticsAndAudio.js     # Vibration triggers & Web Audio predator soundscapes
    │       └── wildlifeCatalog.js     # Client catalog & lookup engine
```

---

## 🚀 Local Installation Quickstart

### 1. Launch with One Click
Double-click `start_installation.bat` in the project root!

Or run manually:

**Terminal 1 — Backend Server:**
```bash
cd backend
npm run start
```

**Terminal 2 — Main Screen Display:**
```bash
cd main-screen
npm run dev
```

**Terminal 3 — Mobile Field Scanner:**
```bash
cd mobile-scanner
npm run dev
```

### 2. Connect Mobile Phones on Local Wi-Fi
1. Connect all phones to the same Wi-Fi network as the host computer.
2. Aim the phone camera at the QR code displayed in the bottom-right of the Main Screen.
3. Open the Mobile Field Scanner, point at any roaming wild animal's holographic QR beacon, and tap to document!
