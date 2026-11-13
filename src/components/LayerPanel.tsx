"use client";

import React from "react";
import { LayerData } from "./LayerCard";

interface LayerPanelProps {
  layers: LayerData[];
  selectedLayerId: string | null;
  onSelectLayer: (layer: LayerData) => void;
  onResetView: () => void;
  isolateMode: boolean;
  onToggleIsolate: () => void;
}

const LAYER_ACCENT_COLORS: Record<string, { dot: string; border: string }> = {
  crust: { dot: "bg-blue-400", border: "border-blue-500/40" },
  "upper-mantle": { dot: "bg-amber-500", border: "border-amber-500/40" },
  "lower-mantle": { dot: "bg-rose-600", border: "border-rose-600/40" },
  "outer-core": { dot: "bg-orange-500", border: "border-orange-500/40" },
  "inner-core": { dot: "bg-yellow-300", border: "border-yellow-300/40" },
};

export function LayerPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onResetView,
  isolateMode,
  onToggleIsolate,
}: LayerPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md p-4 shadow-xl shadow-black/40">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>🔬</span> Các Tầng Cấu Trúc
          </h3>
          <p className="text-[11px] text-slate-400">Từ bề mặt sâu dần đến tâm Trái Đất</p>
        </div>

        <button
          type="button"
          onClick={onResetView}
          className="px-2.5 py-1 text-xs rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          title="Đưa góc quay về toàn cảnh"
        >
          <span>↺</span> Xem toàn bộ
        </button>
      </div>

      {/* Layer list */}
      <div className="flex flex-col gap-2">
        {layers.map((l, index) => {
          const isSelected = selectedLayerId === l.id;
          const colors = LAYER_ACCENT_COLORS[l.id] || { dot: "bg-slate-400", border: "border-slate-700" };

          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onSelectLayer(l)}
              className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                isSelected
                  ? `bg-slate-800/90 ${colors.border} ring-1 ring-amber-400/50 text-white shadow-lg`
                  : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                    isSelected
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {index + 1}
                </span>

                <div>
                  <div className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span>{l.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-normal">
                      ({l.englishName})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {l.depthFromKm} – {l.depthToKm.toLocaleString()} km
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-300 font-mono block">
                  {l.state}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Dày ~{l.thicknessKm.toLocaleString()} km
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Controls: Isolate mode toggle */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isolateMode}
            onChange={onToggleIsolate}
            className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/40 bg-slate-900 cursor-pointer"
          />
          <span className="text-slate-300">Chỉ hiển thị tầng đang chọn (Ẩn tầng khác)</span>
        </label>
      </div>
    </div>
  );
}
