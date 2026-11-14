"use client";

import React, { useState } from "react";
import { FeedPeriod, FeedMagnitude } from "@/lib/usgs";
import { MajorPlate, MAJOR_PLATES } from "@/lib/plates";

interface ControlsPanelProps {
  showPlates: boolean;
  onTogglePlates: (show: boolean) => void;
  showBoundaries: boolean;
  onToggleBoundaries: (show: boolean) => void;
  showQuakes: boolean;
  onToggleQuakes: (show: boolean) => void;
  showLabels: boolean;
  onToggleLabels: (show: boolean) => void;
  showCountries: boolean;
  onToggleCountries: (show: boolean) => void;
  period: FeedPeriod;
  onChangePeriod: (period: FeedPeriod) => void;
  magnitude: FeedMagnitude;
  onChangeMagnitude: (mag: FeedMagnitude) => void;
  depthFilter: "all" | "shallow" | "intermediate" | "deep";
  onChangeDepthFilter: (filter: "all" | "shallow" | "intermediate" | "deep") => void;
  quakeCount: number;
  isFallback: boolean;
  onSelectBoundaryType?: (typeId: string) => void;
  selectedPlate?: MajorPlate | null;
  onSelectPlate?: (plate: MajorPlate | null) => void;
}

export function ControlsPanel({
  showPlates,
  onTogglePlates,
  showBoundaries,
  onToggleBoundaries,
  showQuakes,
  onToggleQuakes,
  showLabels,
  onToggleLabels,
  showCountries,
  onToggleCountries,
  period,
  onChangePeriod,
  magnitude,
  onChangeMagnitude,
  depthFilter,
  onChangeDepthFilter,
  quakeCount,
  isFallback,
  onSelectBoundaryType,
  selectedPlate,
  onSelectPlate,
}: ControlsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);

  // Quick comparison presets for students
  const setComparisonPreset = (mode: "both" | "quakesOnly" | "boundariesOnly") => {
    if (mode === "both") {
      onToggleQuakes(true);
      onToggleBoundaries(true);
    } else if (mode === "quakesOnly") {
      onToggleQuakes(true);
      onToggleBoundaries(false);
    } else {
      onToggleQuakes(false);
      onToggleBoundaries(true);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 text-xs shadow-xl shadow-black/40">
      {/* 1. Header & One-Click Scientific Comparison Strip */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <span>🗺️</span> Bật / Tắt Lớp Bản Đồ
            </h3>
            <p className="text-[11px] text-slate-400">
              Đối chiếu vị trí động đất với ranh giới các mảng
            </p>
          </div>
          {isFallback && (
            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Bản lưu ngoại tuyến
            </span>
          )}
        </div>

        {/* Quick Comparison Buttons for Guided Learning */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            type="button"
            onClick={() => setComparisonPreset("both")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition-all cursor-pointer ${
              showQuakes && showBoundaries
                ? "bg-cyan-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Hiện cả động đất và ranh giới để so sánh tương quan"
          >
            🌐 Đối chiếu cả 2
          </button>
          <button
            type="button"
            onClick={() => setComparisonPreset("quakesOnly")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition-all cursor-pointer ${
              showQuakes && !showBoundaries
                ? "bg-amber-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Chỉ hiện điểm động đất"
          >
            🔴 Chỉ động đất
          </button>
          <button
            type="button"
            onClick={() => setComparisonPreset("boundariesOnly")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition-all cursor-pointer ${
              !showQuakes && showBoundaries
                ? "bg-rose-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Chỉ hiện đường ranh giới các mảng"
          >
            ⚡ Chỉ ranh giới
          </button>
        </div>

        {/* Individual Layer Toggle Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Countries toggle */}
          <button
            type="button"
            onClick={() => onToggleCountries(!showCountries)}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer select-none ${
              showCountries
                ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-200 shadow-sm"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Bật/Tắt hiển thị vị trí các quốc gia và cờ trên quả cầu 3D"
          >
            <span className="text-lg">🚩</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold block text-xs">Quốc Gia</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    showCountries ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                  }`}
                />
              </div>
              <span className="text-[10px] opacity-75">
                {showCountries
                  ? selectedPlate
                    ? "Hiện theo mảng"
                    : "Đang hiện cờ"
                  : "Đang tắt"}
              </span>
            </div>
          </button>

          {/* Earthquakes toggle */}
          <button
            type="button"
            onClick={() => onToggleQuakes(!showQuakes)}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer select-none ${
              showQuakes
                ? "bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-sm"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-lg">🔴</span>
            <div>
              <span className="font-semibold block text-xs">Động Đất ({quakeCount})</span>
              <span className="text-[10px] opacity-75">
                {showQuakes ? "Dữ liệu USGS" : "Đang tắt"}
              </span>
            </div>
          </button>

          {/* Plate boundaries toggle */}
          <button
            type="button"
            onClick={() => onToggleBoundaries(!showBoundaries)}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer select-none ${
              showBoundaries
                ? "bg-rose-500/15 border-rose-500/50 text-rose-200 shadow-sm"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-lg">⚡</span>
            <div>
              <span className="font-semibold block text-xs">Đường Ranh Giới</span>
              <span className="text-[10px] opacity-75">
                {showBoundaries ? "3 loại ranh giới" : "Đang tắt"}
              </span>
            </div>
          </button>

          {/* Major plates names toggle */}
          <button
            type="button"
            onClick={() => onToggleLabels(!showLabels)}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer select-none ${
              showLabels
                ? "bg-blue-500/15 border-blue-500/50 text-blue-200 shadow-sm"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-lg">🏷️</span>
            <div>
              <span className="font-semibold block text-xs">Tên Mảng</span>
              <span className="text-[10px] opacity-75">
                {showLabels ? "Thái Bình Dương, Âu-Á" : "Đang tắt"}
              </span>
            </div>
          </button>

          {/* Plate Colors toggle */}
          <button
            type="button"
            onClick={() => onTogglePlates(!showPlates)}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer select-none col-span-2 ${
              showPlates
                ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-sm"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-lg">🎨</span>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <span className="font-semibold block text-xs">Tô Màu Đa Giác Các Mảng (Thạch quyển)</span>
                <span className="text-[10px] opacity-75">
                  Phân biệt các mảng kiến tạo trôi dạt
                </span>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-200">
                {showPlates ? "Đang bật" : "Đang tắt"}
              </span>
            </div>
          </button>
        </div>

        {/* Quick Tectonic Plate Explorer (Click plate to show countries) */}
        <div className="pt-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-cyan-300 font-semibold flex items-center gap-1">
              <span>🎯</span> Chọn mảng để xem quốc gia:
            </span>
            {selectedPlate && (
              <button
                type="button"
                onClick={() => onSelectPlate?.(null)}
                className="text-slate-400 hover:text-white underline cursor-pointer text-[10px]"
              >
                Bỏ chọn ✕
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {MAJOR_PLATES.map((p) => {
              const isSelected = selectedPlate?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onSelectPlate?.(null);
                    } else {
                      onSelectPlate?.(p);
                    }
                  }}
                  className={`px-2 py-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 font-bold border-white ring-2 ring-cyan-300 shadow-md shadow-cyan-500/20"
                      : "bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
                  }`}
                  title={`${p.name} (${p.en}) - Bấm để hiện các quốc gia`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="truncate">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Earthquake Filters */}
      {showQuakes && (
        <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>📊</span> Lọc Dữ Liệu Động Đất
            </h4>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              {showAdvanced ? "Thu gọn ▴" : "Mở rộng ▾"}
            </button>
          </div>

          {/* Time & Magnitude Selectors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Khoảng thời gian:</span>
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => onChangePeriod("week")}
                  className={`flex-1 py-1 text-center rounded-md font-medium text-xs transition-colors cursor-pointer ${
                    period === "week" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  7 ngày
                </button>
                <button
                  type="button"
                  onClick={() => onChangePeriod("day")}
                  className={`flex-1 py-1 text-center rounded-md font-medium text-xs transition-colors cursor-pointer ${
                    period === "day" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  24 giờ
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Độ lớn tối thiểu:</span>
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => onChangeMagnitude("4.5")}
                  className={`flex-1 py-1 text-center rounded-md font-medium text-xs transition-colors cursor-pointer ${
                    magnitude === "4.5" ? "bg-rose-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                  title="Chỉ hiện động đất mạnh (M 4.5+)"
                >
                  M 4.5+
                </button>
                <button
                  type="button"
                  onClick={() => onChangeMagnitude("2.5")}
                  className={`flex-1 py-1 text-center rounded-md font-medium text-xs transition-colors cursor-pointer ${
                    magnitude === "2.5" ? "bg-amber-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                  title="Hiện từ rung chấn vừa M 2.5+"
                >
                  M 2.5+
                </button>
              </div>
            </div>
          </div>

          {/* Depth Filter Tabs */}
          {showAdvanced && (
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5 animate-in fade-in duration-150">
              <span className="text-[11px] text-slate-300 font-medium">Lọc theo tầng độ sâu chấn tiêu:</span>
              <div className="grid grid-cols-4 gap-1 text-[11px]">
                {(
                  [
                    { id: "all", label: "Tất cả" },
                    { id: "shallow", label: "🟡 Nông" },
                    { id: "intermediate", label: "🟠 Vừa" },
                    { id: "deep", label: "🟣 Sâu" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChangeDepthFilter(tab.id)}
                    className={`py-1.5 rounded-md transition-colors cursor-pointer text-center font-medium ${
                      depthFilter === tab.id
                        ? "bg-cyan-600 text-white font-bold shadow-sm"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Legend with Depth & Mechanism */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Màu sắc theo độ sâu chấn tiêu:
            </span>
            <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                <span>Nông (&lt;70 km)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]" />
                <span>Vừa (70–300 km)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
                <span>Sâu (&gt;300 km)</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic mt-0.5">
              💡 Chấm to hơn tương ứng với động đất có năng lượng giải phóng (độ lớn M) lớn hơn.
            </p>
          </div>
        </div>
      )}

      {/* 3. Boundary Type Guide Quick Access */}
      {showBoundaries && (
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
            3 Loại Ranh Giới Mảng Kiến Tạo
          </h4>
          <div className="flex flex-col gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => onSelectBoundaryType?.("convergent")}
              className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 flex items-center justify-between transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                <div>
                  <span className="font-semibold text-slate-200 group-hover:text-white block">
                    Hội tụ (Hút chìm / Va chạm)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Động đất mạnh ở mọi độ sâu, sóng thần
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-rose-400 font-mono">Xem sơ đồ ➔</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectBoundaryType?.("divergent")}
              className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 flex items-center justify-between transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                <div>
                  <span className="font-semibold text-slate-200 group-hover:text-white block">
                    Phân kỳ (Tách giãn đáy đại dương)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Đá manti trồi lên, động đất nông
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">Xem sơ đồ ➔</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectBoundaryType?.("transform")}
              className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 flex items-center justify-between transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                <div>
                  <span className="font-semibold text-slate-200 group-hover:text-white block">
                    Trượt ngang (Trượt bằng / Đứt gãy)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Mảng trượt cọ xát, động đất cạn
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">Xem sơ đồ ➔</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
