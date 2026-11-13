"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import { generatePlatesCanvasTexture, latLonToVector3 } from "@/lib/geo";
import { Earthquake } from "@/lib/usgs";
import { BoundaryLayer } from "./BoundaryLayer";
import { QuakeLayer } from "./QuakeLayer";

interface PlateGlobeProps {
  showPlates: boolean;
  showBoundaries: boolean;
  showQuakes: boolean;
  showLabels: boolean;
  earthquakes: Earthquake[];
  onSelectQuake?: (quake: Earthquake) => void;
}

// Major tectonic plates centers for student labels
const MAJOR_PLATES = [
  { name: "Thái Bình Dương", en: "Pacific Plate", lat: 0, lon: -160 },
  { name: "Âu - Á", en: "Eurasian Plate", lat: 50, lon: 75 },
  { name: "Bắc Mỹ", en: "North American", lat: 48, lon: -100 },
  { name: "Nam Mỹ", en: "South American", lat: -18, lon: -60 },
  { name: "Châu Phi", en: "African Plate", lat: 5, lon: 22 },
  { name: "Ấn - Úc", en: "Indo-Australian", lat: -15, lon: 105 },
  { name: "Nam Cực", en: "Antarctic Plate", lat: -78, lon: 0 },
  { name: "Nazca", en: "Nazca Plate", lat: -18, lon: -95 },
  { name: "Philippine", en: "Philippine", lat: 18, lon: 132 },
  { name: "Ả Rập", en: "Arabian Plate", lat: 24, lon: 45 },
];

export function PlateGlobe({
  showPlates,
  showBoundaries,
  showQuakes,
  showLabels,
  earthquakes,
  onSelectQuake,
}: PlateGlobeProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [platesGeo, setPlatesGeo] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [coastGeo, setCoastGeo] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [boundariesGeo, setBoundariesGeo] = useState<any>(null);
  const [earthBaseTexture, setEarthBaseTexture] = useState<THREE.Texture | null>(null);
  const [loading, setLoading] = useState(true);

  // Load NASA photorealistic texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load("/textures/earth_atmos_2048.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setEarthBaseTexture(tex);
    });
  }, []);

  // Load geojson files from public/data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [pRes, cRes, bRes] = await Promise.all([
          fetch("/data/pb2002_plates.json"),
          fetch("/data/ne_110m_coastline.json"),
          fetch("/data/pb2002_boundaries.json"),
        ]);
        if (pRes.ok && cRes.ok && bRes.ok) {
          const [pData, cData, bData] = await Promise.all([
            pRes.json(),
            cRes.json(),
            bRes.json(),
          ]);
          if (isMounted) {
            setPlatesGeo(pData);
            setCoastGeo(cData);
            setBoundariesGeo(bData);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Failed to load map data:", err);
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Generate canvas texture for plates & coastlines
  const plateOverlayTexture = useMemo(() => {
    if (!platesGeo || !coastGeo) return null;
    const canvas = generatePlatesCanvasTexture(
      showPlates ? platesGeo : { type: "FeatureCollection", features: [] },
      coastGeo,
      2048,
      1024
    );
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [platesGeo, coastGeo, showPlates]);

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-[16/10] max-h-[640px] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl flex items-center justify-center">
      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-300">Đang chuẩn bị địa cầu 3D...</p>
        </div>
      ) : (
        <Canvas
          camera={{ position: [0, 1.2, 4.4], fov: 45 }}
          className="w-full h-full"
        >
          {/* Deep Space Background Stars */}
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

          {/* Lighting */}
          <ambientLight intensity={1.1} />
          <directionalLight position={[8, 5, 6]} intensity={1.8} />
          <directionalLight position={[-8, -4, -6]} intensity={0.5} color="#38bdf8" />

          {/* Controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={2.4}
            maxDistance={8.5}
            rotateSpeed={0.8}
          />

          {/* Realistic Base Earth Sphere */}
          <mesh name="earth-globe-base">
            <sphereGeometry args={[2.0, 64, 64]} />
            <meshStandardMaterial
              map={earthBaseTexture || undefined}
              color={earthBaseTexture ? "#ffffff" : "#0f172a"}
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>

          {/* Tectonic Plates Overlay Shell */}
          {plateOverlayTexture && showPlates && (
            <mesh name="earth-plates-overlay">
              <sphereGeometry args={[2.004, 64, 64]} />
              <meshStandardMaterial
                map={plateOverlayTexture}
                transparent
                opacity={0.7}
                roughness={0.4}
              />
            </mesh>
          )}

          {/* Atmospheric Glow Rim */}
          <mesh scale={[1.025, 1.025, 1.025]}>
            <sphereGeometry args={[2.0, 32, 32]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.18}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>

          {/* Plate Boundaries Layer (3 distinct colors) */}
          <BoundaryLayer
            boundariesData={boundariesGeo}
            visible={showBoundaries}
            radius={2.012}
          />

          {/* Earthquakes Layer (InstancedMesh, colored by depth, sized by mag) */}
          <QuakeLayer
            earthquakes={earthquakes}
            visible={showQuakes}
            onSelectQuake={onSelectQuake}
            radius={2.025}
          />

          {/* Major Plates Sleek Floating Labels */}
          {showLabels &&
            MAJOR_PLATES.map((p) => {
              const pos = latLonToVector3(p.lat, p.lon, 2.05);
              return (
                <group key={p.en} position={[pos.x, pos.y, pos.z]}>
                  <Html
                    center
                    distanceFactor={8}
                    occlude
                    className="pointer-events-none select-none"
                  >
                    <div className="px-2 py-0.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-center whitespace-nowrap shadow-xl">
                      <span className="block text-[10px] font-bold text-white tracking-tight">
                        {p.name}
                      </span>
                      <span className="block text-[8px] text-cyan-300 font-mono">
                        {p.en}
                      </span>
                    </div>
                  </Html>
                </group>
              );
            })}
        </Canvas>
      )}

      {/* Helper hint overlay */}
      <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-[11px] text-slate-300 pointer-events-none flex items-center gap-2 shadow-lg">
        <span>🖱️ Kéo để xoay 360°</span>
        <span className="text-slate-600">•</span>
        <span>Cuộn để phóng to</span>
        <span className="text-slate-600">•</span>
        <span>Bấm vào chấm để xem trận động đất</span>
      </div>
    </div>
  );
}
