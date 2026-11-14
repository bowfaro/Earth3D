"use client";

import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { generatePlatesCanvasTexture, latLonToVector3 } from "@/lib/geo";
import {
  MajorPlate,
  MAJOR_PLATES,
  findPlateByCoordinates,
  getCountriesForPlate,
} from "@/lib/plates";
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
  selectedPlate?: MajorPlate | null;
  onSelectPlate?: (plate: MajorPlate | null) => void;
  earthquakes: Earthquake[];
  onSelectQuake?: (quake: Earthquake) => void;
}

const MAJOR_PLATES_WITH_POS = MAJOR_PLATES.map((p) => ({
  ...p,
  pos: latLonToVector3(p.lat, p.lon, 2.05),
}));

const COUNTRIES_WITH_POS = COUNTRIES.map((c) => ({
  ...c,
  pos: latLonToVector3(c.lat, c.lon, 2.045),
}));

/**
 * High-performance 3D-to-2D overlay tracker.
 * Projects 3D sphere positions to 2D pixel coordinates and directly updates DOM CSS transforms
 * with zero React state re-renders and zero React 19 unmount crashes.
 */
function GlobeOverlayTracker({
  items,
  domMapRef,
}: {
  items: Array<{ id: string; pos: THREE.Vector3 }>;
  domMapRef: React.RefObject<Map<string, HTMLElement>>;
}) {
  const tempVec = useRef(new THREE.Vector3());

  useFrame(({ camera, size }) => {
    if (!domMapRef.current) return;
    const map = domMapRef.current;
    const v = tempVec.current;
    const camPos = camera.position;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const el = map.get(item.id);
      if (!el) continue;

      const pos = item.pos;
      // Horizon culling on sphere of radius ~ 2.05:
      // Point P is on the camera-facing hemisphere iff P · C > 4.2
      const dot = pos.x * camPos.x + pos.y * camPos.y + pos.z * camPos.z;
      if (dot <= 4.2) {
        if (el.style.display !== "none") el.style.display = "none";
        continue;
      }

      v.copy(pos).project(camera);
      // Cull if behind camera or outside clip space
      if (v.z > 1) {
        if (el.style.display !== "none") el.style.display = "none";
        continue;
      }

      // Normalized Device Coordinates [-1, 1] to screen pixels
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;

      // Ensure coordinates are within viewport bounds
      if (x < -100 || x > size.width + 100 || y < -50 || y > size.height + 50) {
        if (el.style.display !== "none") el.style.display = "none";
        continue;
      }

      if (el.style.display !== "block") el.style.display = "block";
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
  });

  return null;
}

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
  selectedPlate,
  onSelectPlate,
  earthquakes,
  onSelectQuake,
}: PlateGlobeProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [boundariesGeo, setBoundariesGeo] = useState<any>(null);
  const [earthBaseTexture, setEarthBaseTexture] = useState<THREE.Texture | null>(null);
  const [plateOverlayTexture, setPlateOverlayTexture] = useState<THREE.CanvasTexture | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const targetCameraPosRef = useRef<THREE.Vector3 | null>(null);
  const activeTextureRef = useRef<THREE.CanvasTexture | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const platesGeoDataRef = useRef<any>(null);

  // Set of country IDs that belong to the currently selected plate
  const selectedPlateCountryIds = useMemo(() => {
    if (!selectedPlate) return new Set<string>();
    const matched = getCountriesForPlate(selectedPlate, COUNTRIES);
    return new Set(matched.map((c) => c.id));
  }, [selectedPlate]);

  // Load NASA photorealistic texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load("/textures/earth_atmos_2048.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setEarthBaseTexture(tex);
    });
  }, []);

  // Load GeoJSON files from public/data & pre-generate plate texture once
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

          platesGeoDataRef.current = pData;

          // Generate plate texture once during data load
          const canvas = generatePlatesCanvasTexture(pData, cData, 2048, 1024);
          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.needsUpdate = true;
          activeTextureRef.current = texture;

          if (isMounted) {
            setPlateOverlayTexture(texture);
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
      if (activeTextureRef.current) {
        activeTextureRef.current.dispose();
      }
    };
  }, []);

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

  // Handle click on the 3D globe surface to detect clicked plate
  const handleGlobeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      e.stopPropagation();
      if (!e.point) return;
      const r = 2.0;
      const lat = 90 - Math.acos(Math.max(-1, Math.min(1, e.point.y / r))) * (180 / Math.PI);
      const lon = ((Math.atan2(e.point.z, -e.point.x) * (180 / Math.PI)) - 180 + 540) % 360 - 180;

      const matched = findPlateByCoordinates(lat, lon, platesGeoDataRef.current);
      if (matched) {
        if (onSelectPlate) onSelectPlate(matched);
        jumpToLocation(matched.lat, matched.lon, 4.3, matched.id);
      }
    },
    [onSelectPlate, jumpToLocation]
  );

  // When selectedCountry changes from outside, aim camera directly without triggering cascading state renders
  useEffect(() => {
    if (selectedCountry) {
      targetCameraPosRef.current = latLonToVector3(
        selectedCountry.lat,
        selectedCountry.lon,
        4.3
      );
    }
  }, [selectedCountry]);

  // When selectedPlate changes from outside, aim camera
  useEffect(() => {
    if (selectedPlate) {
      targetCameraPosRef.current = latLonToVector3(
        selectedPlate.lat,
        selectedPlate.lon,
        4.3
      );
    }
  }, [selectedPlate]);

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

  // Tab in unified top bar: plates or hotspots
  const [navTab, setNavTab] = useState<"plates" | "hotspots">("plates");

  // Which countries should be rendered on the 3D globe?
  // 1. If showCountries toggle is OFF, NEVER render any countries!
  // 2. If a plate is selected: ONLY render the countries that belong to this selected plate!
  //    (This gives a clean, uncluttered, focused view of the countries on that plate)
  // 3. If NO plate is selected: render countries ONLY when showCountries toggle is on!
  const visibleCountries = useMemo(() => {
    if (!showCountries) return [];
    if (selectedPlate) {
      return COUNTRIES_WITH_POS.filter((c) => selectedPlateCountryIds.has(c.id));
    }
    return COUNTRIES_WITH_POS;
  }, [showCountries, selectedPlate, selectedPlateCountryIds]);

  // Registry map of DOM button elements for direct GPU transforms
  const elementsMapRef = useRef<Map<string, HTMLElement>>(new Map());

  // Active items tracked in screen space (plates + countries)
  const activeTrackedItems = useMemo(() => {
    const list: Array<{ id: string; pos: THREE.Vector3 }> = [];
    if (showLabels) {
      for (const p of MAJOR_PLATES_WITH_POS) {
        list.push({ id: `plate-${p.id}`, pos: p.pos });
      }
    }
    for (const c of visibleCountries) {
      list.push({ id: `country-${c.id}`, pos: c.pos });
    }
    return list;
  }, [showLabels, visibleCountries]);

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 1. Unified Clean Navigation Strip (Switch between Plates & Hotspots without scrollbar clutter) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs shadow-md">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800/80 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setNavTab("plates")}
            className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer flex items-center gap-1 ${
              navTab === "plates"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🗺️</span> Mảng ({MAJOR_PLATES.length})
          </button>
          <button
            type="button"
            onClick={() => setNavTab("hotspots")}
            className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer flex items-center gap-1 ${
              navTab === "hotspots"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🎯</span> Điểm nóng ({QUICK_HOTSPOTS.length})
          </button>
        </div>

        {/* Quick Items Row */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 flex-1 pl-0 sm:pl-1">
          {navTab === "plates" ? (
            <>
              {MAJOR_PLATES.map((plate) => {
                const isSelected = selectedPlate?.id === plate.id;
                return (
                  <button
                    key={plate.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onSelectPlate?.(null);
                      } else {
                        onSelectPlate?.(plate);
                        jumpToLocation(plate.lat, plate.lon, 4.3, plate.id);
                      }
                    }}
                    className={`px-2 py-1 rounded-lg border whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-medium shrink-0 ${
                      isSelected
                        ? "bg-cyan-500 border-cyan-300 text-slate-950 font-bold shadow-md shadow-cyan-500/30 scale-105"
                        : "bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                    title={`${plate.name} (${plate.en}) - Bấm để xem các quốc gia thuộc mảng này`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: plate.color }} />
                    <span>{plate.name.replace("Mảng ", "")}</span>
                  </button>
                );
              })}
            </>
          ) : (
            <>
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
                    className={`px-2 py-1 rounded-lg border whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 text-[11px] shrink-0 ${
                      isSelected
                        ? "bg-amber-500 border-amber-300 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                        : "bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                    title={item.desc}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* 3D Canvas Box */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] max-h-[640px] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl flex items-center justify-center select-none cursor-grab active:cursor-grabbing">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-xs text-slate-300">Đang chuẩn bị địa cầu 3D...</p>
          </div>
        ) : (
          <Canvas
            camera={{ position: [0, 1.2, 4.4], fov: 45 }}
            gl={{ powerPreference: "high-performance", antialias: true, alpha: false }}
            dpr={[1, 1.5]}
            className="w-full h-full"
          >
            {/* Deep Space Background Stars */}
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />

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
            <mesh name="earth-globe-base" onClick={handleGlobeClick}>
              <sphereGeometry args={[2.0, 64, 64]} />
              <meshStandardMaterial
                map={earthBaseTexture || undefined}
                color={earthBaseTexture ? "#ffffff" : "#0f172a"}
                roughness={0.6}
                metalness={0.1}
              />
            </mesh>

            {/* Tectonic Plates Overlay Shell (Toggled via visible flag for zero-latency) */}
            {plateOverlayTexture && (
              <mesh name="earth-plates-overlay" visible={showPlates} onClick={handleGlobeClick}>
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

            {/* Synchronized 3D-to-2D Tracker for Screen-space HTML Badges */}
            <GlobeOverlayTracker
              items={activeTrackedItems}
              domMapRef={elementsMapRef}
            />
          </Canvas>
        )}

        {/* Synchronized 2D Screen-space Markers (Plates & Countries) */}
        {!loading && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {/* Major Plates Floating Badges */}
            {showLabels &&
              MAJOR_PLATES_WITH_POS.map((p) => {
                const isPlateSelected = selectedPlate?.id === p.id;
                return (
                  <button
                    key={p.id}
                    data-label-id={`plate-${p.id}`}
                    ref={(el) => {
                      if (el) elementsMapRef.current.set(`plate-${p.id}`, el);
                      else elementsMapRef.current.delete(`plate-${p.id}`);
                    }}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectPlate) onSelectPlate(p);
                      jumpToLocation(p.lat, p.lon, 4.3, p.id);
                    }}
                    style={{
                      display: "none",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      willChange: "transform",
                    }}
                    className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-lg transition-colors cursor-pointer whitespace-nowrap select-none ${
                      isPlateSelected
                        ? "bg-cyan-500 text-slate-950 border-white ring-2 ring-cyan-300 font-bold scale-110 shadow-cyan-500/50 z-30"
                        : "bg-slate-950/90 border-cyan-500/40 text-cyan-200 hover:bg-cyan-950 hover:border-cyan-400 hover:text-white z-10"
                    }`}
                    title={`${p.name} (${p.en}) - Bấm để hiện các quốc gia thuộc mảng`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.name}</span>
                  </button>
                );
              })}

            {/* Country Markers (with flag emoji & compact pill badge) */}
            {visibleCountries.map((country) => {
              const isMatchedToSelectedPlate = selectedPlateCountryIds.has(country.id);
              const isCountrySelected = selectedCountry?.id === country.id;

              return (
                <button
                  key={country.id}
                  data-label-id={`country-${country.id}`}
                  ref={(el) => {
                    if (el) elementsMapRef.current.set(`country-${country.id}`, el);
                    else elementsMapRef.current.delete(`country-${country.id}`);
                  }}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    jumpToCountry(country);
                  }}
                  style={{
                    display: "none",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    willChange: "transform",
                  }}
                  className={`pointer-events-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border shadow-md transition-colors cursor-pointer whitespace-nowrap select-none ${
                    isCountrySelected
                      ? "bg-emerald-500 text-white border-white scale-110 ring-2 ring-emerald-300 shadow-lg shadow-emerald-500/50 z-30"
                      : isMatchedToSelectedPlate
                      ? "bg-slate-950/95 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/60 shadow-emerald-500/30 scale-105 z-20"
                      : "bg-slate-950/90 border-slate-700/80 text-slate-200 hover:text-white hover:border-emerald-400 z-10"
                  }`}
                  title={`${country.name} (${country.englishName}) - Vị trí: ${country.plate} (Bấm để xem địa chất)`}
                >
                  <span className="text-xs shrink-0">{country.flag}</span>
                  <span>{country.name}</span>
                </button>
              );
            })}
          </div>
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
