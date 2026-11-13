"use client";

import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { generatePlatesCanvasTexture, latLonToVector3 } from "@/lib/geo";
import { Earthquake } from "@/lib/usgs";
import { BoundaryLayer } from "./BoundaryLayer";
import { QuakeLayer } from "./QuakeLayer";
import { CountryData } from "./CountryInfo";
import countriesRaw from "@/data/countries.json";

const COUNTRIES = countriesRaw as CountryData[];

interface PlateGlobeProps {
  showPlates: boolean;
  showBoundaries: boolean;
  showQuakes: boolean;
  showLabels: boolean;
  showCountries?: boolean;
  selectedCountry?: CountryData | null;
  onSelectCountry?: (country: CountryData | null) => void;
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

// Highlighted geological hotspots & countries for student instant orientation
const QUICK_HOTSPOTS = [
  { id: "ring-of-fire", name: "Vành đai lửa Thái Bình Dương", icon: "🌋", lat: 15, lon: 155, desc: "Tập trung 90% động đất" },
  { id: "mid-atlantic", name: "Sống núi giữa Đại Tây Dương", icon: "🌊", lat: 2, lon: -28, desc: "Ranh giới phân kỳ tách giãn" },
  { id: "himalaya", name: "Dãy Himalaya (Va chạm lục địa)", icon: "⛰️", lat: 29, lon: 86, desc: "Va chạm Ấn - Á" },
  { id: "san-andreas", name: "Đứt gãy San Andreas", icon: "⚡", lat: 36, lon: -120, desc: "Trượt ngang trượt bằng" },
  { id: "vn", name: "Việt Nam", icon: "🇻🇳", lat: 16, lon: 108, desc: "Nội mảng Âu - Á" },
  { id: "jp", name: "Nhật Bản", icon: "🇯🇵", lat: 36, lon: 138, desc: "Giao 4 mảng hút chìm" },
  { id: "id", name: "Indonesia", icon: "🇮🇩", lat: -2, lon: 115, desc: "Hút chìm Sunda" },
  { id: "is", name: "Iceland", icon: "🇮🇸", lat: 65, lon: -18, desc: "Sống núi trồi lên cạn" },
  { id: "cl", name: "Chile", icon: "🇨🇱", lat: -33, lon: -71, desc: "Hút chìm mảng Nazca" },
];

// Internal camera animator component using ref
function SmoothCameraRig({
  targetPosRef,
  controlsRef,
}: {
  targetPosRef: React.RefObject<THREE.Vector3 | null>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  useFrame(() => {
    if (!targetPosRef.current || !controlsRef.current) return;
    const cam = controlsRef.current.object;
    cam.position.lerp(targetPosRef.current, 0.08);
    controlsRef.current.update();

    if (cam.position.distanceTo(targetPosRef.current) < 0.03) {
      targetPosRef.current = null;
    }
  });

  return null;
}

export function PlateGlobe({
  showPlates,
  showBoundaries,
  showQuakes,
  showLabels,
  showCountries = true,
  selectedCountry,
  onSelectCountry,
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
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const targetCameraPosRef = useRef<THREE.Vector3 | null>(null);
  const prevTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Load NASA photorealistic texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load("/textures/earth_atmos_2048.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setEarthBaseTexture(tex);
    });
  }, []);

  // Load GeoJSON files from public/data
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

  // Generate canvas texture for plates & coastlines with disposal cleanup
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

    if (prevTextureRef.current) {
      prevTextureRef.current.dispose();
    }
    prevTextureRef.current = texture;

    return texture;
  }, [platesGeo, coastGeo, showPlates]);

  // Jump camera to hotspot or country
  const jumpToLocation = useCallback(
    (lat: number, lon: number, distance = 4.3, hotspotId?: string) => {
      setAutoRotate(false);
      if (hotspotId) setActiveHotspot(hotspotId);
      targetCameraPosRef.current = latLonToVector3(lat, lon, distance);
    },
    []
  );

  const jumpToCountry = useCallback(
    (country: CountryData) => {
      if (onSelectCountry) onSelectCountry(country);
      jumpToLocation(country.lat, country.lon, 4.3, country.id);
    },
    [onSelectCountry, jumpToLocation]
  );

  // When selectedCountry changes from outside, aim camera
  useEffect(() => {
    if (selectedCountry) {
      jumpToLocation(selectedCountry.lat, selectedCountry.lon, 4.3, selectedCountry.id);
    }
  }, [selectedCountry, jumpToLocation]);

  // Handle on-screen zoom
  const handleZoom = (delta: number) => {
    if (!controlsRef.current) return;
    const cam = controlsRef.current.object;
    const dir = new THREE.Vector3().copy(cam.position).normalize();
    const newDist = THREE.MathUtils.clamp(
      cam.position.length() + delta,
      2.5,
      8.0
    );
    cam.position.copy(dir.multiplyScalar(newDist));
    controlsRef.current.update();
  };

  // Reset view to initial angle
  const handleResetView = () => {
    setAutoRotate(false);
    setActiveHotspot(null);
    targetCameraPosRef.current = new THREE.Vector3(0, 1.2, 4.4);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Quick Jump Geological Hotspots Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
        <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1 pr-1">
          <span>🎯</span> Điểm nóng địa chất:
        </span>
        {QUICK_HOTSPOTS.map((item) => {
          const isSelected = activeHotspot === item.id;
          const countryObj = COUNTRIES.find((c) => c.id === item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (countryObj) {
                  jumpToCountry(countryObj);
                } else {
                  jumpToLocation(item.lat, item.lon, 4.4, item.id);
                }
              }}
              title={item.desc}
              className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold shadow-md shadow-cyan-500/20"
                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3D Canvas Box */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] max-h-[640px] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl flex items-center justify-center select-none">
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

            {/* Smooth Camera Animator Rig */}
            <SmoothCameraRig
              targetPosRef={targetCameraPosRef}
              controlsRef={controlsRef}
            />

            {/* Controls */}
            <OrbitControls
              ref={controlsRef}
              autoRotate={autoRotate}
              autoRotateSpeed={0.6}
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

            {/* Major Plates Floating Labels */}
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

            {/* Country Names On The Globe */}
            {showCountries &&
              COUNTRIES.map((country) => {
                const pos = latLonToVector3(country.lat, country.lon, 2.045);
                const isSelected = selectedCountry?.id === country.id;
                return (
                  <group key={country.id} position={[pos.x, pos.y, pos.z]}>
                    <Html
                      center
                      distanceFactor={7}
                      occlude
                      className="select-none"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpToCountry(country);
                        }}
                        className={`group flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-medium shadow-md transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? "bg-emerald-600 text-white border-white scale-110 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/40"
                            : "bg-slate-950/85 hover:bg-emerald-950/90 border-slate-700/80 hover:border-emerald-400 text-slate-200 hover:text-white"
                        }`}
                        title={`${country.name} - Bấm để xem thông tin địa chất`}
                      >
                        <span className="text-xs leading-none">{country.flag}</span>
                        <span className="leading-tight">{country.name}</span>
                      </button>
                    </Html>
                  </group>
                );
              })}
          </Canvas>
        )}

        {/* On-screen Easy Navigation Toolbar (Top Right) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-xl">
            <button
              type="button"
              onClick={() => handleZoom(-0.6)}
              className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
              title="Phóng to gần quả cầu"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.6)}
              className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
              title="Thu nhỏ nhìn xa hơn"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-2 h-7 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                autoRotate
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
              title="Bật/Tắt tự động xoay quả cầu"
            >
              <span>{autoRotate ? "⏸ Dừng" : "🔄 Xoay"}</span>
            </button>
            <button
              type="button"
              onClick={handleResetView}
              className="px-2 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="Đặt lại vị trí góc nhìn ban đầu"
            >
              <span>↺</span> Ban đầu
            </button>
          </div>
        </div>

        {/* Helper hint overlay */}
        <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800/80 text-[11px] text-slate-300 pointer-events-none flex items-center gap-2 shadow-lg">
          <span>👆 Kéo để xoay 360°</span>
          <span className="text-slate-600">•</span>
          <span>🔍 Phóng to / Thu nhỏ</span>
          <span className="text-slate-600">•</span>
          <span>Bấm vào điểm động đất để xem chi tiết</span>
        </div>
      </div>
    </div>
  );
}
