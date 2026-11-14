"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

interface BoundaryFeature {
  properties: {
    boundaryType: "divergent" | "convergent" | "transform";
    plateBound: string;
    stepClass: string;
  };
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}

interface BoundariesGeoJson {
  type: string;
  features: BoundaryFeature[];
}

interface BoundaryLayerProps {
  boundariesData: BoundariesGeoJson | null;
  visible: boolean;
  radius?: number;
}

const DEG2RAD = Math.PI / 180;

export function BoundaryLayer({
  boundariesData,
  visible,
  radius = 2.012,
}: BoundaryLayerProps) {
  // Separate geometries for each boundary type (optimized with zero Vector3 allocations)
  const { divergentGeo, convergentGeo, transformGeo } = useMemo(() => {
    if (!boundariesData?.features) {
      return {
        divergentGeo: null,
        convergentGeo: null,
        transformGeo: null,
      };
    }

    const divPos: number[] = [];
    const convPos: number[] = [];
    const transPos: number[] = [];

    boundariesData.features.forEach((feature) => {
      const coords = feature.geometry?.coordinates;
      if (!coords || coords.length < 2) return;

      const type = feature.properties?.boundaryType;
      const targetPos =
        type === "divergent"
          ? divPos
          : type === "convergent"
          ? convPos
          : transPos;

      for (let i = 0; i < coords.length - 1; i++) {
        const [lon1, lat1] = coords[i];
        const [lon2, lat2] = coords[i + 1];

        // Avoid wraparound lines across date line (> 180 deg)
        if (Math.abs(lon1 - lon2) > 180) continue;

        const phi1 = (90 - lat1) * DEG2RAD;
        const theta1 = (lon1 + 180) * DEG2RAD;
        const sinPhi1 = Math.sin(phi1);
        const x1 = -(radius * sinPhi1 * Math.cos(theta1));
        const z1 = radius * sinPhi1 * Math.sin(theta1);
        const y1 = radius * Math.cos(phi1);

        const phi2 = (90 - lat2) * DEG2RAD;
        const theta2 = (lon2 + 180) * DEG2RAD;
        const sinPhi2 = Math.sin(phi2);
        const x2 = -(radius * sinPhi2 * Math.cos(theta2));
        const z2 = radius * sinPhi2 * Math.sin(theta2);
        const y2 = radius * Math.cos(phi2);

        targetPos.push(x1, y1, z1, x2, y2, z2);
      }
    });

    const createBuffer = (pos: number[]) => {
      if (pos.length === 0) return null;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      return geo;
    };

    return {
      divergentGeo: createBuffer(divPos),
      convergentGeo: createBuffer(convPos),
      transformGeo: createBuffer(transPos),
    };
  }, [boundariesData, radius]);

  if (!visible) return null;

  return (
    <group name="plate-boundaries">
      {/* Divergent Boundaries (Oceanic Ridge / Continental Rift) - Cyan */}
      {divergentGeo && (
        <lineSegments geometry={divergentGeo}>
          <lineBasicMaterial color="#38bdf8" linewidth={2} />
        </lineSegments>
      )}

      {/* Convergent Boundaries (Subduction / Continental Collision) - Rose Red */}
      {convergentGeo && (
        <lineSegments geometry={convergentGeo}>
          <lineBasicMaterial color="#f43f5e" linewidth={2} />
        </lineSegments>
      )}

      {/* Transform Fault Boundaries - Amber Yellow */}
      {transformGeo && (
        <lineSegments geometry={transformGeo}>
          <lineBasicMaterial color="#facc15" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
}
