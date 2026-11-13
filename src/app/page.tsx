"use client";

import React, { useState } from "react";
import { ViewTabs, ViewMode } from "@/components/ViewTabs";
import { Credits } from "@/components/Credits";
import { EarthViewer } from "@/components/EarthViewer";
import { LayerPanel } from "@/components/LayerPanel";
import { LayerCard, LayerData } from "@/components/LayerCard";
import { LayerThicknessBar } from "@/components/LayerThicknessBar";
import layersDataRaw from "@/data/layers.json";

const layersData = layersDataRaw as LayerData[];

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("core");
  const [selectedLayer, setSelectedLayer] = useState<LayerData | null>(layersData[0]);
  const [isolateMode, setIsolateMode] = useState<boolean>(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  const handleSelectLayer = (layer: LayerData) => {
    setSelectedLayer(layer);
  };

  const handleResetView = () => {
    setSelectedLayer(null);
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20 font-bold text-white text-lg">
              🌍
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Địa Cầu 3D{" "}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  STEM Edu
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Khám phá cấu trúc bên trong & động lực học mảng kiến tạo
              </p>
            </div>
          </div>

          <ViewTabs currentMode={viewMode} onSelectMode={setViewMode} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-6">
        {viewMode === "core" ? (
          <>
            {/* View 1: Inside the Earth */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
              {/* 3D Viewer Area (7 cols on large screens) */}
              <div className="w-full lg:col-span-7 flex flex-col gap-4">
                <EarthViewer
                  selectedLayer={selectedLayer}
                  isolateMode={isolateMode}
                  resetTrigger={resetTrigger}
                />

                {/* Layer Thickness Bar right under viewer */}
                <LayerThicknessBar
                  layers={layersData}
                  selectedLayerId={selectedLayer?.id ?? null}
                  onSelectLayer={handleSelectLayer}
                />
              </div>

              {/* Side Panels (5 cols on large screens) */}
              <div className="w-full lg:col-span-5 flex flex-col gap-5">
                <LayerPanel
                  layers={layersData}
                  selectedLayerId={selectedLayer?.id ?? null}
                  onSelectLayer={handleSelectLayer}
                  onResetView={handleResetView}
                  isolateMode={isolateMode}
                  onToggleIsolate={() => setIsolateMode(!isolateMode)}
                />

                <LayerCard
                  layer={selectedLayer}
                  onNavigateToTectonics={setViewMode}
                />
              </div>
            </div>
          </>
        ) : (
          /* View 2: Tectonics and Earthquakes (will be implemented in Phase 5) */
          <div className="w-full min-h-[500px] flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-3xl">
              🌐
            </div>
            <h2 className="text-xl font-bold text-white">
              Chế độ Mảng Kiến Tạo & Động Đất
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Địa cầu 3D với dữ liệu ranh giới mảng PB2002 và các trận động đất trực tiếp từ USGS. Sắp hiển thị ở Phase 5.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <Credits />
    </div>
  );
}
