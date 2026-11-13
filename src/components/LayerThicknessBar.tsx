"use client";

import React from "react";
import { LayerData } from "./LayerCard";

interface LayerThicknessBarProps {
  layers: LayerData[];
  selectedLayerId: string | null;
  onSelectLayer: (layer: LayerData) => void;
}

export function LayerThicknessBar({
  layers,
  selectedLayerId,
  onSelectLayer,
}: LayerThicknessBarProps) {
  const totalDepth = 6371;

  const layerColors: Record<string, { bg: string; hover: string; border: string }> = {
    crust: {
      bg: "bg-amber-600",
      hover: "hover:bg-amber-500",
      border: "border-amber-400",
    },
    "upper-mantle": {
      bg: "bg-orange-600",
      hover: "hover:bg-orange-500",
      border: "border-orange-400",
    },
    "lower-mantle": {
      bg: "bg-rose-700",
      hover: "hover:bg-rose-600",
      border: "border-rose-400",
    },
    "outer-core": {
      bg: "bg-amber-500",
      hover: "hover:bg-amber-400",
      border: "border-yellow-300",
    },
    "inner-core": {
      bg: "bg-yellow-200",
      hover: "hover:bg-white",
      border: "border-white",
    },
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 sm:p-5 flex flex-col gap-3 shadow-xl shadow-black/30">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>📏</span> Tỉ Lệ Độ Dày Các Lớp (Bán kính 6.371 km)
          </h3>
          <p className="text-xs text-slate-400">
            Hãy chú ý lớp Vỏ mỏng như vỏ quả táo so với toàn bộ phần còn lại!
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">Tâm Trái Đất: 6.371 km</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-8 rounded-xl bg-slate-950 p-1 border border-slate-800 flex overflow-hidden gap-0.5">
        {layers.map((layer) => {
          const pct = Math.max((layer.thicknessKm / totalDepth) * 100, 2); // min 2% so crust is clickable
          const isSelected = selectedLayerId === layer.id;
          const colors = layerColors[layer.id] || {
            bg: "bg-slate-600",
            hover: "hover:bg-slate-500",
            border: "border-slate-400",
          };

          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onSelectLayer(layer)}
              style={{ width: `${pct}%` }}
              title={`${layer.name}: ~${layer.thicknessKm.toLocaleString()} km (${Math.round((layer.thicknessKm / totalDepth) * 100)}%)`}
              className={`h-full transition-all relative group cursor-pointer ${colors.bg} ${colors.hover} ${
                isSelected ? `ring-2 ring-white scale-y-110 z-10 rounded-sm` : "opacity-85 hover:opacity-100"
              }`}
            >
              <span className="sr-only">{layer.name}</span>
            </button>
          );
        })}
      </div>

      {/* Legend below bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
        {layers.map((layer) => {
          const isSelected = selectedLayerId === layer.id;
          const colors = layerColors[layer.id] || {
            bg: "bg-slate-600",
            border: "border-slate-400",
          };
          const pct = Math.round((layer.thicknessKm / totalDepth) * 100);

          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onSelectLayer(layer)}
              className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                isSelected ? "bg-slate-800 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colors.bg}`} />
              <div className="truncate">
                <div className="truncate text-[11px] sm:text-xs">{layer.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">~{pct}% ({layer.thicknessKm} km)</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
