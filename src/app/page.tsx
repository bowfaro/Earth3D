"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { ViewTabs, ViewMode } from "@/components/ViewTabs";
import { Credits } from "@/components/Credits";
import { EarthViewer } from "@/components/EarthViewer";
import { LayerPanel } from "@/components/LayerPanel";
import { LayerCard, LayerData } from "@/components/LayerCard";
import { LayerThicknessBar } from "@/components/LayerThicknessBar";
import { ControlsPanel } from "@/components/tectonics/ControlsPanel";
import { QuakeInfo } from "@/components/tectonics/QuakeInfo";
import { BoundaryExplainer } from "@/components/tectonics/BoundaryExplainer";
import { GuidedTour } from "@/components/tectonics/GuidedTour";
import { GeologyQuiz } from "@/components/GeologyQuiz";
import layersDataRaw from "@/data/layers.json";
import {
  Earthquake,
  FeedMagnitude,
  FeedPeriod,
  fetchUSGSEarthquakes,
} from "@/lib/usgs";

// Dynamically import PlateGlobe so Three.js / R3F only loads when needed
const PlateGlobe = dynamic(
  () => import("@/components/tectonics/PlateGlobe").then((m) => m.PlateGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[4/3] md:aspect-[16/10] max-h-[640px] rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Đang khởi tạo thư viện đồ họa 3D...</p>
      </div>
    ),
  }
);

const layersData = layersDataRaw as LayerData[];

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("core");

  // State for View 1 (Core)
  const [selectedLayer, setSelectedLayer] = useState<LayerData | null>(layersData[0]);
  const [isolateMode, setIsolateMode] = useState<boolean>(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // State for View 2 (Tectonics)
  const [showPlates, setShowPlates] = useState<boolean>(true);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [showQuakes, setShowQuakes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [period, setPeriod] = useState<FeedPeriod>("week");
  const [magnitude, setMagnitude] = useState<FeedMagnitude>("4.5");
  const [depthFilter, setDepthFilter] = useState<"all" | "shallow" | "intermediate" | "deep">("all");
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [selectedQuake, setSelectedQuake] = useState<Earthquake | null>(null);
  const [selectedBoundaryType, setSelectedBoundaryType] = useState<string>("convergent");
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch earthquakes when in tectonics mode or when filters change
  useEffect(() => {
    if (viewMode !== "tectonics") return;

    let isMounted = true;
    async function loadQuakes() {
      const res = await fetchUSGSEarthquakes(period, magnitude);
      if (isMounted) {
        setEarthquakes(res.earthquakes);
        setIsFallback(res.isFallback);
        setFetchError(res.error || null);
      }
    }
    loadQuakes();

    return () => {
      isMounted = false;
    };
  }, [viewMode, period, magnitude]);

  // Filter earthquakes by depth
  const filteredQuakes = useMemo(() => {
    if (depthFilter === "all") return earthquakes;
    return earthquakes.filter((q) => q.depthCategory === depthFilter);
  }, [earthquakes, depthFilter]);

  const handleSelectLayer = (layer: LayerData) => {
    setSelectedLayer(layer);
  };

  const handleResetCoreView = () => {
    setSelectedLayer(null);
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      {/* Top Header */}
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-8">
        {/* Fallback alert banner for USGS */}
        {viewMode === "tectonics" && isFallback && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
            <span>
              ⚠️ {fetchError || "Không thể kết nối đến máy chủ USGS trực tiếp. Đang hiển thị bản dữ liệu snapshot dự phòng."}
            </span>
            <span className="text-[11px] font-mono text-amber-400/80">Offline Mode</span>
          </div>
        )}

        {/* MODE 1: BÊN TRONG TRÁI ĐẤT */}
        {viewMode === "core" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 3D Viewer + Thickness Bar */}
              <div className="w-full lg:col-span-7 flex flex-col gap-4">
                <EarthViewer
                  selectedLayer={selectedLayer}
                  isolateMode={isolateMode}
                  resetTrigger={resetTrigger}
                  onSelectLayer={handleSelectLayer}
                  layers={layersData}
                />

                <LayerThicknessBar
                  layers={layersData}
                  selectedLayerId={selectedLayer?.id ?? null}
                  onSelectLayer={handleSelectLayer}
                />
              </div>

              {/* Right Column: Layer Panel + Detailed Card */}
              <div className="w-full lg:col-span-5 flex flex-col gap-5">
                <LayerPanel
                  layers={layersData}
                  selectedLayerId={selectedLayer?.id ?? null}
                  onSelectLayer={handleSelectLayer}
                  onResetView={handleResetCoreView}
                  isolateMode={isolateMode}
                  onToggleIsolate={() => setIsolateMode(!isolateMode)}
                />

                <LayerCard
                  layer={selectedLayer}
                  onNavigateToTectonics={setViewMode}
                />
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: MẢNG KIẾN TẠO & ĐỘNG ĐẤT */}
        {viewMode === "tectonics" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 3D Interactive Globe */}
              <div className="w-full lg:col-span-7 flex flex-col gap-4">
                <PlateGlobe
                  showPlates={showPlates}
                  showBoundaries={showBoundaries}
                  showQuakes={showQuakes}
                  showLabels={showLabels}
                  earthquakes={filteredQuakes}
                  onSelectQuake={setSelectedQuake}
                />

                {/* Earthquake popup if selected */}
                {selectedQuake && (
                  <QuakeInfo
                    quake={selectedQuake}
                    onClose={() => setSelectedQuake(null)}
                  />
                )}

                {/* Explainer for 3 boundary types */}
                <BoundaryExplainer
                  selectedType={selectedBoundaryType}
                  onSelectType={setSelectedBoundaryType}
                  onSwitchToCore={setViewMode}
                />
              </div>

              {/* Right Column: Controls Panel + Guided Tour */}
              <div className="w-full lg:col-span-5 flex flex-col gap-5">
                <ControlsPanel
                  showPlates={showPlates}
                  onTogglePlates={setShowPlates}
                  showBoundaries={showBoundaries}
                  onToggleBoundaries={setShowBoundaries}
                  showQuakes={showQuakes}
                  onToggleQuakes={setShowQuakes}
                  showLabels={showLabels}
                  onToggleLabels={setShowLabels}
                  period={period}
                  onChangePeriod={setPeriod}
                  magnitude={magnitude}
                  onChangeMagnitude={setMagnitude}
                  depthFilter={depthFilter}
                  onChangeDepthFilter={setDepthFilter}
                  quakeCount={filteredQuakes.length}
                  isFallback={isFallback}
                  onSelectBoundaryType={setSelectedBoundaryType}
                />

                <GuidedTour
                  onToggleQuakes={setShowQuakes}
                  onToggleBoundaries={setShowBoundaries}
                />
              </div>
            </div>
          </div>
        )}

        {/* Educational Quiz Section for Students */}
        <section className="w-full pt-4">
          <GeologyQuiz />
        </section>
      </main>

      {/* Footer */}
      <Credits />
    </div>
  );
}
