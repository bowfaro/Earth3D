"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { Earthquake } from "@/lib/usgs";
import { latLonToVector3 } from "@/lib/geo";

interface QuakeLayerProps {
  earthquakes: Earthquake[];
  visible: boolean;
  onSelectQuake?: (quake: Earthquake) => void;
  radius?: number;
}

const dummyMatrix = new THREE.Matrix4();
const dummyColor = new THREE.Color();

export function QuakeLayer({
  earthquakes,
  visible,
  onSelectQuake,
  radius = 2.025,
}: QuakeLayerProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Filter valid earthquakes
  const validQuakes = useMemo(() => {
    return earthquakes.filter(
      (q) => !isNaN(q.lat) && !isNaN(q.lon) && q.mag >= 0
    );
  }, [earthquakes]);

  // Update instanced matrices and colors when quakes change
  useEffect(() => {
    if (!meshRef.current || validQuakes.length === 0) return;

    const count = validQuakes.length;
    meshRef.current.count = count;

    validQuakes.forEach((q, i) => {
      const pos = latLonToVector3(q.lat, q.lon, radius);

      // Scale by magnitude (e.g. mag 4.5 -> ~0.02, mag 7+ -> ~0.045)
      const scale = Math.max(0.012, 0.008 * Math.pow(1.3, q.mag - 3));

      dummyMatrix.makeTranslation(pos.x, pos.y, pos.z);
      // Scale uniformly
      dummyMatrix.scale(new THREE.Vector3(scale, scale, scale));
      meshRef.current?.setMatrixAt(i, dummyMatrix);

      // Color by depth category
      if (q.depthCategory === "shallow") {
        dummyColor.set("#fbbf24"); // Amber yellow
      } else if (q.depthCategory === "intermediate") {
        dummyColor.set("#f97316"); // Vivid orange
      } else {
        dummyColor.set("#c084fc"); // Purple / Violet
      }

      meshRef.current?.setColorAt(i, dummyColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [validQuakes, radius]);

  if (!visible || validQuakes.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, validQuakes.length]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick={(e: any) => {
        e.stopPropagation();
        if (typeof e.instanceId === "number" && validQuakes[e.instanceId]) {
          onSelectQuake?.(validQuakes[e.instanceId]);
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial
        roughness={0.3}
        metalness={0.2}
        emissive="#000000"
      />
    </instancedMesh>
  );
}
