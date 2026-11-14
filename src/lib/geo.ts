/**
 * Geographic 3D and Projection Utilities
 */

import * as THREE from "three";
import { geoEquirectangular, geoPath } from "d3-geo";

/**
 * Convert Latitude and Longitude to 3D Cartesian Coordinates on a Sphere
 * @param lat Latitude (-90 to +90)
 * @param lon Longitude (-180 to +180)
 * @param radius Sphere radius
 */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Fast version that writes directly to an existing target Vector3 without heap allocations
 */
export function latLonToVector3Fast(
  lat: number,
  lon: number,
  radius: number,
  target: THREE.Vector3
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  target.x = -(radius * Math.sin(phi) * Math.cos(theta));
  target.z = radius * Math.sin(phi) * Math.sin(theta);
  target.y = radius * Math.cos(phi);

  return target;
}

// Distinct palette for major and minor tectonic plates
const PLATE_PALETTE = [
  "#264653", "#2a9d8f", "#e76f51", "#f4a261", "#457b9d",
  "#1d3557", "#8338ec", "#3a86ff", "#06d6a0", "#118ab2",
  "#073b4c", "#e63946", "#588157", "#344e41", "#606c38",
  "#283618", "#dda15e", "#bc6c25", "#6d597a", "#b56576",
  "#e56b6f", "#eaac8b", "#3d5a80", "#98c1d9", "#e0fbfc",
  "#ee6c4d", "#293241", "#52b788", "#74c69d", "#95d5b2",
];

interface GeoPolygonFeature {
  type: string;
  properties?: {
    PlateName?: string;
    Code?: string;
  };
  geometry: unknown;
}

interface GeoJsonCollection {
  type: string;
  features: GeoPolygonFeature[];
}

/**
 * Generate an equirectangular Canvas texture showing tectonic plates and continent outlines
 */
export function generatePlatesCanvasTexture(
  platesGeoJson: GeoJsonCollection,
  coastlineGeoJson?: GeoJsonCollection,
  width: number = 2048,
  height: number = 1024
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Background deep ocean
  ctx.fillStyle = "#091220";
  ctx.fillRect(0, 0, width, height);

  // Setup equirectangular projection
  const projection = geoEquirectangular()
    .scale(width / (2 * Math.PI))
    .translate([width / 2, height / 2]);

  // Use any because d3-geo types expect GeoPermissibleObjects which varies with complex GeoJSON
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathGenerator = geoPath(projection, ctx as any);

  // 1. Draw Plates
  if (platesGeoJson?.features) {
    platesGeoJson.features.forEach((feature, idx) => {
      const color = PLATE_PALETTE[idx % PLATE_PALETTE.length];
      ctx.beginPath();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pathGenerator(feature as any);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.55;
      ctx.fill();

      // Plate borders subtle outline
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  // 2. Draw Coastlines (continents for student orientation)
  if (coastlineGeoJson?.features) {
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.2;

    coastlineGeoJson.features.forEach((feature) => {
      ctx.beginPath();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pathGenerator(feature as any);
      ctx.stroke();
    });
  }

  ctx.globalAlpha = 1.0;
  return canvas;
}
