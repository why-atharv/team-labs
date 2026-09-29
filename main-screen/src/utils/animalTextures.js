/**
 * Procedural PBR Canvas Texture Generator for Realistic 3D Wild Animals
 * teamLab Wildlife Living Sanctuary
 * Generates high-definition coat patterns (stripes, rosettes, fur grain, wrinkles, feathers)
 * with diffuse and bump map details for photorealistic Three.js materials.
 */

import * as THREE from 'three';

const textureCache = new Map();

/**
 * Creates or retrieves a procedural texture for an animal archetype.
 */
export function getAnimalTexture(archetype, baseColor, secondaryColor, accentColor) {
  const cacheKey = `${archetype}_${baseColor}_${secondaryColor}_${accentColor}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  switch (archetype) {
    case 'tiger':
      renderTigerTexture(ctx, baseColor, secondaryColor, accentColor);
      break;
    case 'lion':
      renderLionTexture(ctx, baseColor, secondaryColor, accentColor);
      break;
    case 'snow_leopard':
    case 'cheetah':
      renderSpottedCatTexture(ctx, archetype, baseColor, secondaryColor, accentColor);
      break;
    case 'panther':
      renderPantherTexture(ctx, baseColor, secondaryColor, accentColor);
      break;
    case 'wolf':
      renderWolfTexture(ctx, baseColor, secondaryColor, accentColor);
      break;
    case 'elephant':
      renderElephantTexture(ctx, baseColor, secondaryColor);
      break;
    case 'bear':
      renderBearTexture(ctx, baseColor, secondaryColor);
      break;
    case 'stag':
      renderStagTexture(ctx, baseColor, secondaryColor, accentColor);
      break;
    case 'zebra':
      renderZebraTexture(ctx, baseColor, secondaryColor);
      break;
    case 'eagle':
      renderEagleTexture(ctx, baseColor, secondaryColor, accentColor);
      break;
    case 'crocodile':
      renderCrocodileTexture(ctx, baseColor, secondaryColor, accentColor);
      break;
    default:
      renderFurGrainTexture(ctx, baseColor, secondaryColor);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Procedural Tiger Fur Texture: Warm orange base, white belly gradient, undulating dark stripes
 */
function renderTigerTexture(ctx, baseColor, stripeColor, bellyColor) {
  // 1. Base coat with gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#ea580c');
  grad.addColorStop(0.5, baseColor || '#f97316');
  grad.addColorStop(0.85, '#ffedd5');
  grad.addColorStop(1.0, bellyColor || '#ffffff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // 2. Micro fur noise
  addFurGrainNoise(ctx, 0.08);

  // 3. Realistic tiger stripes with organic variation
  ctx.fillStyle = stripeColor || '#18181b';
  for (let x = 20; x < 500; x += 36) {
    ctx.beginPath();
    const width = 10 + Math.sin(x) * 4;
    const startY = 10 + (Math.sin(x * 0.2) * 20);
    const endY = 400 + (Math.cos(x * 0.1) * 30);

    ctx.moveTo(x - width / 2, startY);
    ctx.bezierCurveTo(
      x + 18, startY + 120,
      x - 14, startY + 240,
      x - width / 4, endY
    );
    ctx.bezierCurveTo(
      x + 8, startY + 240,
      x + width + 12, startY + 120,
      x + width / 2, startY
    );
    ctx.closePath();
    ctx.fill();

    // Occasional branching stripe tip
    if (x % 72 === 0) {
      ctx.beginPath();
      ctx.moveTo(x, startY + 180);
      ctx.quadraticCurveTo(x + 24, startY + 220, x + 35, startY + 260);
      ctx.quadraticCurveTo(x + 20, startY + 220, x + 4, startY + 180);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/**
 * Procedural Lion Fur Texture: Golden tawny base with soft muscle gradients and fur fiber
 */
function renderLionTexture(ctx, baseColor, secondaryColor, accentColor) {
  const grad = ctx.createRadialGradient(256, 200, 40, 256, 256, 320);
  grad.addColorStop(0, baseColor || '#d97706');
  grad.addColorStop(0.7, '#b45309');
  grad.addColorStop(1.0, '#78350f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  addFurGrainNoise(ctx, 0.12);

  // Soft directional brush strokes simulating fur flow
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.18)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 12, y + 16 + Math.random() * 10);
    ctx.stroke();
  }
}

/**
 * Procedural Snow Leopard / Cheetah Rosettes & Spots
 */
function renderSpottedCatTexture(ctx, archetype, baseColor, spotColor, bellyColor) {
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, baseColor || '#cbd5e1');
  grad.addColorStop(0.65, baseColor || '#94a3b8');
  grad.addColorStop(1.0, bellyColor || '#f8fafc');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  addFurGrainNoise(ctx, 0.08);

  const isRosette = archetype === 'snow_leopard';

  if (isRosette) {
    // Snow leopard: Large rosettes with dark outer ring and tawny center
    for (let i = 0; i < 75; i++) {
      const cx = (i * 67) % 490 + 15;
      const cy = (Math.floor(i / 7) * 55) % 490 + 15;
      const radius = 12 + Math.random() * 8;

      // Dark spot cluster forming a rosette
      ctx.fillStyle = spotColor || '#334155';
      const petals = 4 + Math.floor(Math.random() * 3);
      for (let p = 0; p < petals; p++) {
        const angle = (p / petals) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.ellipse(px, py, 4 + Math.random() * 3, 3 + Math.random() * 3, angle, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    // Cheetah: Solid crisp dark spots
    ctx.fillStyle = spotColor || '#18181b';
    for (let i = 0; i < 180; i++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 512;
      const r = 3 + Math.random() * 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Procedural Black Panther: Midnight black with subtle velvet sheen and ghost rosettes
 */
function renderPantherTexture(ctx, baseColor, secondaryColor) {
  ctx.fillStyle = baseColor || '#121214';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle dark emerald/onyx highlights
  const grad = ctx.createRadialGradient(256, 200, 30, 256, 256, 300);
  grad.addColorStop(0, '#1c1917');
  grad.addColorStop(0.6, '#0f172a');
  grad.addColorStop(1.0, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  addFurGrainNoise(ctx, 0.05);

  // Faint ghost rosettes (visible under direct glancing light)
  ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
  for (let i = 0; i < 50; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    ctx.beginPath();
    ctx.arc(cx, cy, 8 + Math.random() * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Procedural Timber Wolf Texture: Salt-and-pepper gray, charcoal mantle, cream throat
 */
function renderWolfTexture(ctx, baseColor, secondaryColor, accentColor) {
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, secondaryColor || '#1e293b'); // Dark dorsal ridge
  grad.addColorStop(0.4, baseColor || '#64748b');      // Slate body
  grad.addColorStop(0.8, '#cbd5e1');
  grad.addColorStop(1.0, accentColor || '#f8fafc');   // Cream underbelly
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  addFurGrainNoise(ctx, 0.16);

  // Dense guard hairs
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 8, y + 14 + Math.random() * 12);
    ctx.stroke();
  }
}

/**
 * Procedural Elephant Skin: Slate gray leather with criss-crossing wrinkled creases
 */
function renderElephantTexture(ctx, baseColor, secondaryColor) {
  ctx.fillStyle = baseColor || '#64748b';
  ctx.fillRect(0, 0, 512, 512);

  // Micro leather noise
  addFurGrainNoise(ctx, 0.18);

  // Criss-crossing skin wrinkles
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 70; i++) {
    ctx.beginPath();
    const y = Math.random() * 512;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + (Math.random() - 0.5) * 30, 340, y + (Math.random() - 0.5) * 30, 512, y);
    ctx.stroke();
  }
  for (let i = 0; i < 50; i++) {
    ctx.beginPath();
    const x = Math.random() * 512;
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + (Math.random() - 0.5) * 20, 170, x + (Math.random() - 0.5) * 20, 340, x, 512);
    ctx.stroke();
  }
}

/**
 * Procedural Grizzly Bear Texture: Deep shaggy brown with grizzled golden tips
 */
function renderBearTexture(ctx, baseColor, secondaryColor) {
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#451a03');
  grad.addColorStop(0.5, baseColor || '#78350f');
  grad.addColorStop(1.0, '#291002');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  addFurGrainNoise(ctx, 0.2);

  // Grizzled golden guard hair tips
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 450; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 10, y + 16 + Math.random() * 12);
    ctx.stroke();
  }
}

/**
 * Procedural Red Deer Stag: Warm chestnut coat with soft flank mottling
 */
function renderStagTexture(ctx, baseColor, secondaryColor, accentColor) {
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#78350f');
  grad.addColorStop(0.5, baseColor || '#b45309');
  grad.addColorStop(0.85, '#d97706');
  grad.addColorStop(1.0, '#fef3c7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  addFurGrainNoise(ctx, 0.1);

  // Subtle pale spots on flank
  ctx.fillStyle = 'rgba(254, 243, 199, 0.25)';
  for (let i = 0; i < 45; i++) {
    const x = 80 + Math.random() * 350;
    const y = 140 + Math.random() * 220;
    ctx.beginPath();
    ctx.arc(x, y, 4 + Math.random() * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Procedural Zebra Stripes: High-contrast authentic alternating bold stripes
 */
function renderZebraTexture(ctx, baseColor, stripeColor) {
  ctx.fillStyle = baseColor || '#f8fafc';
  ctx.fillRect(0, 0, 512, 512);

  addFurGrainNoise(ctx, 0.05);

  ctx.fillStyle = stripeColor || '#09090b';
  for (let x = 15; x < 500; x += 32) {
    ctx.beginPath();
    const width = 12 + Math.sin(x * 0.3) * 5;
    ctx.moveTo(x - width / 2, 0);
    ctx.bezierCurveTo(
      x + 22, 170,
      x - 18, 340,
      x + (Math.sin(x) * 15), 512
    );
    ctx.lineTo(x + width, 512);
    ctx.bezierCurveTo(
      x + width - 18, 340,
      x + width + 22, 170,
      x + width / 2, 0
    );
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Procedural Golden Eagle Plumage: Feathers with interlocking barbule texture
 */
function renderEagleTexture(ctx, baseColor, secondaryColor, accentColor) {
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#451a03');
  grad.addColorStop(0.6, baseColor || '#713f12');
  grad.addColorStop(1.0, secondaryColor || '#ca8a04');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  addFurGrainNoise(ctx, 0.12);

  // Layered shingled feather pattern
  ctx.fillStyle = 'rgba(202, 138, 4, 0.2)';
  for (let y = 10; y < 500; y += 22) {
    for (let x = 10; x < 500; x += 28) {
      const offsetX = (y % 44 === 0) ? 14 : 0;
      ctx.beginPath();
      ctx.arc(x + offsetX, y, 10, 0, Math.PI);
      ctx.fill();
    }
  }
}

/**
 * Procedural Crocodile Armored Scutes: Keeled dorsal scales
 */
function renderCrocodileTexture(ctx, baseColor, secondaryColor, accentColor) {
  ctx.fillStyle = baseColor || '#365314';
  ctx.fillRect(0, 0, 512, 512);

  addFurGrainNoise(ctx, 0.15);

  // Armored scute grid
  ctx.strokeStyle = 'rgba(20, 35, 3, 0.6)';
  ctx.fillStyle = 'rgba(77, 124, 15, 0.3)';
  ctx.lineWidth = 2;

  const tileSize = 24;
  for (let y = 0; y < 512; y += tileSize) {
    for (let x = 0; x < 512; x += tileSize) {
      ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      // Central raised ridge
      ctx.beginPath();
      ctx.moveTo(x + tileSize / 2, y + 3);
      ctx.lineTo(x + tileSize / 2, y + tileSize - 3);
      ctx.stroke();
    }
  }
}

/**
 * Generic fur noise helper
 */
function addFurGrainNoise(ctx, opacity = 0.1) {
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const noise = (Math.random() - 0.5) * 255 * opacity;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);
}

function renderFurGrainTexture(ctx, baseColor, secondaryColor) {
  ctx.fillStyle = baseColor || '#64748b';
  ctx.fillRect(0, 0, 512, 512);
  addFurGrainNoise(ctx, 0.15);
}
