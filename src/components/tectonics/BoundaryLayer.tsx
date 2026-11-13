"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { latLonToVector3 } from "@/lib/geo";

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

export function BoundaryLayer({
  boundariesData,
  visible,
  radius = 2.012,
}: BoundaryLayerProps) {
  // Separate geometries for each boundary type
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

        const v1 = latLonToVector3(lat1, lon1, radius);
        const v2 = latLonToVector3(lat2, lon2, radius);

        targetPos.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
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
