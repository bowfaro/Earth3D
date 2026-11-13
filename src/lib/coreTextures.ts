/**
 * High-definition Procedural & PBR Textures for Earth's Interior Layers
 */

import * as THREE from "three";
import { geoEquirectangular, geoPath } from "d3-geo";
import coastlineData from "../../public/data/ne_110m_coastline.json";

/**
 * Generate a procedural high-res Earth Surface Texture with authentic continent shapes
 */
export function createEarthSurfaceTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, "#081d38");
  oceanGrad.addColorStop(0.3, "#0d2b4f");
  oceanGrad.addColorStop(0.5, "#103663");
  oceanGrad.addColorStop(0.7, "#0d2b4f");
  oceanGrad.addColorStop(1, "#081d38");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Setup equirectangular projection
  const projection = geoEquirectangular()
    .scale(width / (2 * Math.PI))
    .translate([width / 2, height / 2]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathGenerator = geoPath(projection, ctx as any);

  // 2. Draw authentic continent landmasses from Natural Earth 110m
  if (coastlineData?.features) {
    // Fill land with lush satellite terrain tone
    ctx.fillStyle = "#2d5a27";
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 1.0;

    coastlineData.features.forEach((feature) => {
      ctx.beginPath();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pathGenerator(feature as any);
      ctx.fill();
      ctx.stroke();
    });
  }

  // 3. Polar Ice Caps
  ctx.fillStyle = "#e0f2fe";
  ctx.fillRect(0, 0, width, 55); // North Pole Arctic
  ctx.fillRect(0, height - 75, width, 75); // Antarctica

  // 4. Atmospheric cloud streaks
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  for (let i = 0; i < 20; i++) {
    const y = 100 + i * 45;
    ctx.beginPath();
    ctx.ellipse(
      (250 + i * 160) % width,
      y,
      140 + (i % 5) * 30,
      16 + (i % 3) * 6,
      0.15,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Mantle Rock Texture with Convective Heat Veins & Mineral Flecks
 */
export function createDetailedMantleTexture(isUpper: boolean): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Base background
  ctx.fillStyle = isUpper ? "#3a2e1e" : "#2a0a0a";
  ctx.fillRect(0, 0, 1024, 1024);

  // Gradient heat wash
  const grad = ctx.createRadialGradient(512, 512, 50, 512, 512, 512);
  grad.addColorStop(0, isUpper ? "#92400e" : "#7f1d1d");
  grad.addColorStop(1, isUpper ? "#292524" : "#1a0505");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Convective lava fissures
  for (let i = 0; i < 45; i++) {
    ctx.strokeStyle = isUpper ? "#d97706" : "#ef4444";
    ctx.lineWidth = 2 + Math.random() * 6;
    ctx.globalAlpha = 0.2 + Math.random() * 0.4;
    ctx.beginPath();
    let x = Math.random() * 1024;
    let y = Math.random() * 1024;
    ctx.moveTo(x, y);
    for (let s = 0; s < 6; s++) {
      x += (Math.random() - 0.5) * 160;
      y += (Math.random() - 0.5) * 160;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Mineral crystals (Olivine green for upper mantle, bridgmanite for lower mantle)
  ctx.fillStyle = isUpper ? "#65a30d" : "#f97316";
  ctx.globalAlpha = 0.35;
  for (let j = 0; j < 600; j++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1024;
    const rr = 1 + Math.random() * 3.5;
    ctx.beginPath();
    ctx.arc(rx, ry, rr, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1.0;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Procedural Molten Liquid Outer Core Texture (Swirling liquid iron-nickel)
 */
export function createDetailedOuterCoreTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Molten metal base
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, "#c2410c");
  grad.addColorStop(0.25, "#f59e0b");
  grad.addColorStop(0.5, "#d97706");
  grad.addColorStop(0.75, "#b45309");
  grad.addColorStop(1, "#ea580c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Turbulent convective dynamo currents
  for (let i = 0; i < 35; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#fef08a" : "#7c2d12";
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(
      (i * 110) % 1024,
      (i * 85) % 1024,
      120 + Math.random() * 80,
      40 + Math.random() * 30,
      Math.random() * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.globalAlpha = 1.0;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Procedural Solid Inner Core Texture (Incandescent crystalline iron-nickel)
 */
export function createDetailedInnerCoreTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Brilliant golden-white core gradient
  const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.2, "#fef9c3");
  grad.addColorStop(0.5, "#fde047");
  grad.addColorStop(0.85, "#eab308");
  grad.addColorStop(1, "#ca8a04");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Geometric lattice lines representing solid hexagonal iron crystal structure
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 512; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 64, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i, 512);
    ctx.lineTo(i + 64, 0);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * High-precision Cross-Section Face Texture
 * Shows depth in km, temperature, and layer boundaries on the cut slice
 */
export function createCutawayFaceTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.48;

  // Exact radii corresponding to 6,371 km Earth radius
  const rCrust = maxR;
  const rUpperMantle = ((6371 - 35) / 6371) * maxR;
  const rLowerMantle = ((6371 - 660) / 6371) * maxR;
  const rOuterCore = ((6371 - 2890) / 6371) * maxR;
  const rInnerCore = (1221 / 6371) * maxR;

  // Background deep space
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, size, size);

  function drawAnnulus(rOuter: number, rInner: number, fillGrad: string[]) {
    if (!ctx) return;
    const g = ctx.createRadialGradient(cx, cy, rInner, cx, cy, rOuter);
    g.addColorStop(0, fillGrad[0]);
    g.addColorStop(1, fillGrad[1]);
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.arc(cx, cy, rInner, Math.PI * 2, 0, true);
    ctx.fillStyle = g;
    ctx.fill();

    // Distinct boundary line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw concentric rings from outside in:
  drawAnnulus(rCrust, rUpperMantle, ["#78350f", "#451a03"]); // Crust
  drawAnnulus(rUpperMantle, rLowerMantle, ["#9a3412", "#7c2d12"]); // Upper Mantle
  drawAnnulus(rLowerMantle, rOuterCore, ["#dc2626", "#991b1b"]); // Lower Mantle
  drawAnnulus(rOuterCore, rInnerCore, ["#f59e0b", "#ea580c"]); // Outer Core

  // Inner Core solid disc
  const innerG = ctx.createRadialGradient(cx, cy, 0, cx, cy, rInnerCore);
  innerG.addColorStop(0, "#ffffff");
  innerG.addColorStop(0.7, "#facc15");
  innerG.addColorStop(1, "#eab308");
  ctx.beginPath();
  ctx.arc(cx, cy, rInnerCore, 0, Math.PI * 2);
  ctx.fillStyle = innerG;
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Scientific depth and temperature markings along horizontal radius
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const labels = [
    { r: (rCrust + rUpperMantle) / 2, name: "Vỏ (0-35km)", temp: "15-400°C" },
    { r: (rUpperMantle + rLowerMantle) / 2, name: "Manti trên (35-660km)", temp: "500-900°C" },
    { r: (rLowerMantle + rOuterCore) / 2, name: "Manti dưới (660-2.890km)", temp: "1.000-3.700°C" },
    { r: (rOuterCore + rInnerCore) / 2, name: "Lõi ngoài (2.890-5.150km)", temp: "4.000-5.000°C" },
    { r: 0, name: "Lõi trong (5.150-6.371km)", temp: "5.500-6.000°C" },
  ];

  labels.forEach((item) => {
    if (item.r === 0) {
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(item.name, cx - 85, cy - 8);
      ctx.font = "bold 11px monospace";
      ctx.fillText(item.temp, cx - 45, cy + 10);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`• ${item.name}`, cx + item.r - 20, cy - 8);
      ctx.fillStyle = "#fef08a";
      ctx.font = "11px monospace";
      ctx.fillText(`  ${item.temp}`, cx + item.r - 10, cy + 8);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
