"use client";

import React from "react";
import { FeedPeriod, FeedMagnitude } from "@/lib/usgs";

interface ControlsPanelProps {
  showPlates: boolean;
  onTogglePlates: (show: boolean) => void;
  showBoundaries: boolean;
  onToggleBoundaries: (show: boolean) => void;
  showQuakes: boolean;
  onToggleQuakes: (show: boolean) => void;
  showLabels: boolean;
  onToggleLabels: (show: boolean) => void;
  period: FeedPeriod;
  onChangePeriod: (period: FeedPeriod) => void;
  magnitude: FeedMagnitude;
  onChangeMagnitude: (mag: FeedMagnitude) => void;
  depthFilter: "all" | "shallow" | "intermediate" | "deep";
  onChangeDepthFilter: (filter: "all" | "shallow" | "intermediate" | "deep") => void;
  quakeCount: number;
  isFallback: boolean;
  onSelectBoundaryType?: (typeId: string) => void;
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
  period,
  onChangePeriod,
  magnitude,
  onChangeMagnitude,
  depthFilter,
  onChangeDepthFilter,
  quakeCount,
  isFallback,
  onSelectBoundaryType,
}: ControlsPanelProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/85 backdrop-blur-md p-4 text-xs shadow-xl shadow-black/40">
      {/* Layer Visibility Toggles */}
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
          <span>Lớp Bản Đồ</span>
          {isFallback && (
            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Snapshot offline
            </span>
          )}
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-800/40 select-none">
            <input
              type="checkbox"
              checked={showBoundaries}
              onChange={(e) => onToggleBoundaries(e.target.checked)}
              className="rounded border-slate-700 text-rose-500 focus:ring-rose-500 bg-slate-900"
            />
            <span className="font-medium text-slate-200">Ranh giới mảng</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-800/40 select-none">
            <input
              type="checkbox"
              checked={showQuakes}
              onChange={(e) => onToggleQuakes(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
            />
            <span className="font-medium text-slate-200">
              Động đất ({quakeCount})
            </span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-800/40 select-none">
            <input
              type="checkbox"
              checked={showPlates}
              onChange={(e) => onTogglePlates(e.target.checked)}
              className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
            />
            <span className="font-medium text-slate-200">Màu các mảng</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-800/40 select-none">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => onToggleLabels(e.target.checked)}
              className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-slate-900"
            />
            <span className="font-medium text-slate-200">Tên mảng lớn</span>
          </label>
        </div>
      </div>

      {/* Earthquake Filters */}
      {showQuakes && (
        <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
            Bộ Lọc Động Đất (USGS)
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Thời gian:</span>
              <select
                value={period}
                onChange={(e) => onChangePeriod(e.target.value as FeedPeriod)}
                aria-label="Chọn khoảng thời gian động đất"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="day">24 giờ qua</option>
                <option value="week">7 ngày qua (khuyên dùng)</option>
                <option value="month">30 ngày qua</option>
              </select>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Độ lớn tối thiểu:</span>
              <select
                value={magnitude}
                onChange={(e) => onChangeMagnitude(e.target.value as FeedMagnitude)}
                aria-label="Chọn độ lớn tối thiểu"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="4.5">M 4.5+ (mặc định)</option>
                <option value="2.5">M 2.5+</option>
                <option value="all">Tất cả độ lớn</option>
              </select>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Lọc theo độ sâu:</span>
            <div className="grid grid-cols-4 gap-1 text-[11px]">
              {(["all", "shallow", "intermediate", "deep"] as const).map((filter) => {
                const labels: Record<string, string> = {
                  all: "Tất cả",
                  shallow: "Nông",
                  intermediate: "Vừa",
                  deep: "Sâu",
                };
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => onChangeDepthFilter(filter)}
                    className={`py-1 rounded-md border text-center font-medium transition-colors cursor-pointer ${
                      depthFilter === filter
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {labels[filter]}
                  </button>
                );
              })}
            </div>
          </div>

          {quakeCount > 2000 && (
            <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              ⚠️ Số điểm đang lớn ({quakeCount} trận). Hãy tăng ngưỡng độ lớn lên M 4.5+ nếu thiết bị bị chậm.
            </p>
          )}
        </div>
      )}

      {/* Legend: Boundary Types & Earthquake Depths */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800">
        <h4 className="font-bold text-white text-xs uppercase tracking-wider">
          Chú Giải Khoa Học
        </h4>

        {/* Boundary Legend with distinct colors, symbols and patterns */}
        <div className="flex flex-col gap-1.5 text-[11px]">
          <span className="text-slate-400 font-medium">3 Loại Ranh Giới (bấm để xem sơ đồ):</span>

          <button
            type="button"
            onClick={() => onSelectBoundaryType?.("convergent")}
            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/50 hover:bg-slate-800 text-left transition-colors cursor-pointer border border-slate-800/60"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-rose-500 inline-block border-b-2 border-dashed border-rose-500" />
              <span className="text-rose-400 font-semibold">⇶ Hội tụ (Hút chìm)</span>
            </div>
            <span className="text-[10px] text-slate-400">Va chạm / Biển chìm</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectBoundaryType?.("divergent")}
            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/50 hover:bg-slate-800 text-left transition-colors cursor-pointer border border-slate-800/60"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-sky-400 inline-block" />
              <span className="text-sky-400 font-semibold">⇹ Phân kỳ (Tách giãn)</span>
            </div>
            <span className="text-[10px] text-slate-400">Sống núi đại dương</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectBoundaryType?.("transform")}
            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/50 hover:bg-slate-800 text-left transition-colors cursor-pointer border border-slate-800/60"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-yellow-400 inline-block border-b-2 border-dotted border-yellow-400" />
              <span className="text-yellow-400 font-semibold">⇅ Trượt ngang</span>
            </div>
            <span className="text-[10px] text-slate-400">Đứt gãy trượt</span>
          </button>
        </div>

        {/* Quake Depth Legend */}
        {showQuakes && (
          <div className="flex flex-col gap-1 pt-1 text-[11px]">
            <span className="text-slate-400 font-medium">Độ sâu chấn tiêu (Màu điểm):</span>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-center">
              <div className="p-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                ● 0 - 70 km (Nông)
              </div>
              <div className="p-1 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20 font-mono">
                ● 70 - 300 km (Vừa)
              </div>
              <div className="p-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                ● &gt; 300 km (Sâu)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
