"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { ViewTabs, ViewMode } from "@/components/ViewTabs";
import { Credits } from "@/components/Credits";
import { EarthViewer } from "@/components/EarthViewer";
import { ControlsPanel } from "@/components/tectonics/ControlsPanel";
import { QuakeInfo } from "@/components/tectonics/QuakeInfo";
import { CountryInfo, CountryData } from "@/components/tectonics/CountryInfo";
import { PlateInfo } from "@/components/tectonics/PlateInfo";
import { MajorPlate } from "@/lib/plates";
import countriesRaw from "@/data/countries.json";
import { BoundaryExplainer } from "@/components/tectonics/BoundaryExplainer";
import { GuidedTour } from "@/components/tectonics/GuidedTour";
import { GeologyQuiz } from "@/components/GeologyQuiz";
import { EasyGuideModal } from "@/components/EasyGuideModal";
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

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("core");
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // State for View 2 (Tectonics & Earthquakes)
  const [showPlates, setShowPlates] = useState<boolean>(true);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [showQuakes, setShowQuakes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showCountries, setShowCountries] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [selectedPlate, setSelectedPlate] = useState<MajorPlate | null>(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      {/* Easy Guide Modal for non-tech users */}
      <EasyGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20 font-bold text-white text-xl">
                🌍
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Khám Phá Trái Đất 3D
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Cấu trúc lòng đất & Động lực học mảng kiến tạo
                </p>
              </div>
            </div>

            {/* Quick Guide Trigger Button (Mobile) */}
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="md:hidden px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>❓</span> Hướng dẫn
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <ViewTabs currentMode={viewMode} onSelectMode={setViewMode} />

            {/* Quick Guide Trigger Button (Desktop) */}
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="hidden md:flex px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Xem hướng dẫn sử dụng cách xoay và phóng to quả cầu"
            >
              <span>❓</span> Hướng dẫn nhanh
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-8">
        {/* Fallback alert banner for USGS */}
        {viewMode === "tectonics" && isFallback && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
            <span>
              ⚠️ {fetchError || "Không thể kết nối máy chủ USGS trực tiếp. Đang hiển thị bản dữ liệu snapshot dự phòng."}
            </span>
            <span className="text-[11px] font-mono text-amber-400/80">Chế độ ngoại tuyến</span>
          </div>
        )}

        {/* MODE 1: BÊN TRONG TRÁI ĐẤT (Sử dụng UI chuẩn từ Cấu tạo Trái Đất 3D.html) */}
        {viewMode === "core" && (
          <div className="flex flex-col gap-6">
            <EarthViewer onSwitchToTectonics={() => setViewMode("tectonics")} />

            {/* Tỉ lệ khoa học & Ghi chú mô hình */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col gap-2">
              <p>
                <b className="text-slate-200">Tỉ lệ kích thước:</b> Bán kính các ranh giới theo mô hình địa chấn chuẩn PREM (Preliminary Reference Earth Model): lõi trong 1.221 km, lõi ngoài tới 3.480 km, Trái Đất 6.371 km. Lớp vỏ lục địa trung bình dày ≈ 35 km (chỉ chiếm khoảng 0,55% bán kính), nên ở tỉ lệ thật vỏ trông như một nét mỏng viền ngoài. Bật công tắc <b>&ldquo;Phóng đại vỏ ×8&rdquo;</b> khi quan sát trên màn hình hoặc máy chiếu lớp học.
              </p>
              <p>
                <b className="text-slate-200">Dữ liệu địa lý:</b> Đường bờ biển lục địa trích từ Natural Earth (1:50 triệu). Số liệu nhiệt độ, độ sâu và thành phần vật chất đã được đối chiếu theo giáo trình Khoa học Trái Đất & USGS.
              </p>
            </div>
          </div>
        )}

        {/* MODE 2: MẢNG KIẾN TẠO & ĐỘNG ĐẤT */}
        {viewMode === "tectonics" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 3D Interactive Globe + Hotspots + Info Card */}
              <div className="w-full lg:col-span-7 flex flex-col gap-4">
                <PlateGlobe
                  showPlates={showPlates}
                  showBoundaries={showBoundaries}
                  showQuakes={showQuakes}
                  showLabels={showLabels}
                  showCountries={showCountries}
                  selectedCountry={selectedCountry}
                  onSelectCountry={(c) => {
                    setSelectedCountry(c);
                    setSelectedQuake(null);
                  }}
                  selectedPlate={selectedPlate}
                  onSelectPlate={(p) => {
                    setSelectedPlate(p);
                    setSelectedQuake(null);
                    if (p) setShowCountries(true);
                  }}
                  earthquakes={filteredQuakes}
                  onSelectQuake={(q) => {
                    setSelectedQuake(q);
                    setSelectedCountry(null);
                  }}
                />

                {/* Plate info card with countries list when a plate is clicked */}
                {selectedPlate && (
                  <PlateInfo
                    plate={selectedPlate}
                    allCountries={countriesRaw as CountryData[]}
                    selectedCountry={selectedCountry}
                    onSelectCountry={(c) => {
                      setSelectedCountry(c);
                      setSelectedQuake(null);
                    }}
                    onClose={() => setSelectedPlate(null)}
                  />
                )}

                {/* Country info popup if selected */}
                {selectedCountry && (
                  <CountryInfo
                    country={selectedCountry}
                    onClose={() => setSelectedCountry(null)}
                  />
                )}

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
                  showCountries={showCountries}
                  onToggleCountries={setShowCountries}
                  period={period}
                  onChangePeriod={setPeriod}
                  magnitude={magnitude}
                  onChangeMagnitude={setMagnitude}
                  depthFilter={depthFilter}
                  onChangeDepthFilter={setDepthFilter}
                  quakeCount={filteredQuakes.length}
                  isFallback={isFallback}
                  onSelectBoundaryType={setSelectedBoundaryType}
                  selectedPlate={selectedPlate}
                  onSelectPlate={(p) => {
                    setSelectedPlate(p);
                    if (p) setShowCountries(true);
                  }}
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
