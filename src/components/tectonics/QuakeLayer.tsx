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

      // Distinct scaling by magnitude: M4.5 = ~0.02, M6 = ~0.045, M7+ = ~0.075
      const baseScale = q.mag >= 7.0 ? 0.038 : q.mag >= 5.5 ? 0.026 : 0.018;
      const magFactor = Math.pow(1.28, Math.max(0, q.mag - 4));
      const scale = THREE.MathUtils.clamp(baseScale * magFactor, 0.014, 0.08);

      dummyMatrix.makeTranslation(pos.x, pos.y, pos.z);
      dummyMatrix.scale(new THREE.Vector3(scale, scale, scale));
      meshRef.current?.setMatrixAt(i, dummyMatrix);

      // Color by depth category:
      // Shallow (<70km): Amber / Gold (Vỏ & Thạch quyển trên)
      // Intermediate (70-300km): Vivid Crimson / Orange (Đới hút chìm)
      // Deep (>300km): Neon Violet / Purple (Manti sâu)
      if (q.depthCategory === "shallow") {
        dummyColor.set("#fbbf24");
      } else if (q.depthCategory === "intermediate") {
        dummyColor.set("#f97316");
      } else {
        dummyColor.set("#c084fc");
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
      key={`quakes-mesh-${validQuakes.length}`}
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
      <sphereGeometry args={[1, 14, 14]} />
      <meshStandardMaterial
        roughness={0.25}
        metalness={0.2}
        emissive="#1e1b4b"
        emissiveIntensity={0.4}
      />
    </instancedMesh>
  );
}
