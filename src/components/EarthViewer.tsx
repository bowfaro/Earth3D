"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { LayerData } from "./LayerCard";

// Dynamic import with ssr: false to guarantee client-only WebGL initialization
const EarthCore3D = dynamic(
  () => import("./core/EarthCore3D").then((m) => m.EarthCore3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-xs text-slate-300">Đang khởi tạo đồ họa 3D Lõi Trái Đất...</p>
      </div>
    ),
  }
);

interface EarthViewerProps {
  selectedLayer: LayerData | null;
  isolateMode: boolean;
  resetTrigger: number;
  onSelectLayer?: (layer: LayerData) => void;
  layers?: LayerData[];
}

export function EarthViewer({
  selectedLayer,
  isolateMode,
  onSelectLayer,
  layers,
}: EarthViewerProps) {
  const [explosionFactor, setExplosionFactor] = useState<number>(0.0);
  const [cutawayMode, setCutawayMode] = useState<"cutaway" | "full">("cutaway");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<"default" | "cutaway" | "core" | "pole">("default");

  const handleLayerClick = (layerId: string) => {
    if (!onSelectLayer || !layers) return;
    const found = layers.find((l) => l.id === layerId);
    if (found) onSelectLayer(found);
  };

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-[16/10] max-h-[640px] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl flex items-center justify-center select-none">
      {/* 3D Canvas */}
      <EarthCore3D
        selectedLayerId={selectedLayer?.id ?? null}
        onSelectLayer={handleLayerClick}
        isolateMode={isolateMode}
        explosionFactor={explosionFactor}
        cutawayMode={cutawayMode}
        autoRotate={autoRotate}
        cameraPreset={cameraPreset}
      />

      {/* Top Left: Selected Layer Sci-Fi HUD Tag */}
      {selectedLayer && (
        <div className="absolute top-3 left-3 z-20 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {selectedLayer.name}
                <span className="text-[10px] text-slate-400 font-mono font-normal">
                  ({selectedLayer.englishName})
                </span>
              </div>
              <div className="text-[10px] text-amber-300 font-mono">
                {selectedLayer.depthFromKm} – {selectedLayer.depthToKm.toLocaleString()} km • {selectedLayer.state}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Right: Mode Switches & Camera Presets */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setCutawayMode("cutaway");
              setCameraPreset("cutaway");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              cutawayMode === "cutaway"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ✂️ Cắt 90°
          </button>
          <button
            type="button"
            onClick={() => {
              setCutawayMode("full");
              setCameraPreset("default");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              cutawayMode === "full"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🌐 Toàn Cầu
          </button>
        </div>

        {/* Camera Quick Presets */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800/70 text-[10px] text-slate-400 shadow-md">
          <button
            type="button"
            onClick={() => setCameraPreset("default")}
            className={`px-2 py-0.5 rounded-md hover:text-white transition-colors cursor-pointer ${
              cameraPreset === "default" ? "bg-slate-800 text-cyan-300 font-medium" : ""
            }`}
          >
            Toàn cảnh
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset("core")}
            className={`px-2 py-0.5 rounded-md hover:text-white transition-colors cursor-pointer ${
              cameraPreset === "core" ? "bg-slate-800 text-cyan-300 font-medium" : ""
            }`}
          >
            Gần Lõi
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset("pole")}
            className={`px-2 py-0.5 rounded-md hover:text-white transition-colors cursor-pointer ${
              cameraPreset === "pole" ? "bg-slate-800 text-cyan-300 font-medium" : ""
            }`}
          >
            Bắc Cực
          </button>
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              autoRotate ? "text-cyan-400 font-semibold" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {autoRotate ? "⏸ Quay" : "▶ Quay"}
          </button>
        </div>
      </div>

      {/* Bottom Floating Bar: Exploded Slider & Hint */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col sm:flex-row items-center justify-between gap-2.5 p-2.5 sm:px-4 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800/80 pointer-events-auto shadow-2xl">
        {/* Explosion slider */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="text-xs font-semibold text-amber-300 whitespace-nowrap flex items-center gap-1.5">
            <span>💥</span> Tách nổ các tầng:
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={explosionFactor}
            onChange={(e) => setExplosionFactor(parseFloat(e.target.value))}
            className="w-full sm:w-48 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            title="Kéo thanh trượt để tách rời từng lớp ruột Trái Đất"
          />
          <span className="text-[11px] font-mono font-bold text-amber-400 w-9 text-right">
            {Math.round(explosionFactor * 100)}%
          </span>
        </div>

        {/* User Interaction Helper Guide */}
        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>🖱️ Kéo xoay 360°</span>
          <span className="text-slate-600">•</span>
          <span>Cuộn phóng to</span>
          <span className="text-slate-600">•</span>
          <span>Bấm vào tầng để chọn</span>
        </div>
      </div>
    </div>
  );
}
