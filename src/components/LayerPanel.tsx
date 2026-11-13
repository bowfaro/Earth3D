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

export function LayerPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onResetView,
  isolateMode,
  onToggleIsolate,
}: LayerPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-4 shadow-xl shadow-black/40">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Các Lớp Trái Đất
          </h3>
          <p className="text-[11px] text-slate-400">Từ bề mặt sâu dần vào tâm</p>
        </div>

        <button
          type="button"
          onClick={onResetView}
          className="px-2.5 py-1 text-xs rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          title="Đưa góc quay về toàn cảnh"
        >
          <span>↺</span> Xem toàn bộ
        </button>
      </div>

      {/* Layer list */}
      <div className="flex flex-col gap-2">
        {layers.map((l, index) => {
          const isSelected = selectedLayerId === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onSelectLayer(l)}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                isSelected
                  ? "bg-amber-500/15 border-amber-500/60 text-white shadow-lg shadow-amber-950/20"
                  : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
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
                  <div className="font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                    {l.name}
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {l.depthFromKm} – {l.depthToKm.toLocaleString()} km
                  </div>
                </div>
              </div>

              <span className="text-xs text-slate-400 font-mono opacity-80 group-hover:text-amber-400 transition-colors">
                {l.state}
              </span>
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
          <span>Cô lập lớp khi chọn (Ẩn lớp khác)</span>
        </label>
      </div>
    </div>
  );
}
