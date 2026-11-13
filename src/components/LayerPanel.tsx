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

const LAYER_SUBTITLES: Record<string, string> = {
  crust: "Lớp đất đá mỏng bề mặt nơi chúng ta sinh sống",
  "upper-mantle": "Đá nóng dẻo quánh, nơi các mảng kiến tạo trôi dạt",
  "lower-mantle": "Tầng đá rắn dày nhất, nhiệt độ hàng nghìn độ C",
  "outer-core": "Sắt lỏng sôi sục, tạo nên từ trường bảo vệ Trái Đất",
  "inner-core": "Quả cầu sắt rắn rực sáng ở tâm, nóng như Mặt Trời",
};

const LAYER_ACCENT_COLORS: Record<string, { dot: string; border: string; badge: string }> = {
  crust: { dot: "bg-blue-400", border: "border-blue-500/40", badge: "bg-blue-500/10 text-blue-300" },
  "upper-mantle": { dot: "bg-amber-500", border: "border-amber-500/40", badge: "bg-amber-500/10 text-amber-300" },
  "lower-mantle": { dot: "bg-rose-600", border: "border-rose-600/40", badge: "bg-rose-500/10 text-rose-300" },
  "outer-core": { dot: "bg-orange-500", border: "border-orange-500/40", badge: "bg-orange-500/10 text-orange-300" },
  "inner-core": { dot: "bg-yellow-300", border: "border-yellow-300/40", badge: "bg-yellow-500/10 text-yellow-300" },
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
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 shadow-xl shadow-black/40">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>🌍</span> 5 Tầng Ruột Trái Đất
          </h3>
          <p className="text-[11px] text-slate-400">
            Bấm chọn để ngắm nhìn từng tầng từ bề mặt vào đến tâm
          </p>
        </div>

        <button
          type="button"
          onClick={onResetView}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm font-medium"
          title="Đặt lại góc nhìn toàn cảnh"
        >
          <span>↺</span> Toàn cảnh
        </button>
      </div>

      {/* Layer list */}
      <div className="flex flex-col gap-2">
        {layers.map((l, index) => {
          const isSelected = selectedLayerId === l.id;
          const colors = LAYER_ACCENT_COLORS[l.id] || {
            dot: "bg-slate-400",
            border: "border-slate-700",
            badge: "bg-slate-800 text-slate-300",
          };
          const subtitle = LAYER_SUBTITLES[l.id] || l.description;

          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onSelectLayer(l)}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                isSelected
                  ? `bg-slate-800/95 ${colors.border} ring-2 ring-amber-400/50 text-white shadow-lg shadow-black/30 scale-[1.01]`
                  : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                      : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {index + 1}
                </span>

                <div>
                  <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                    <span>{l.name}</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({l.englishName})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                    {subtitle}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border border-slate-700/50 block mb-0.5 ${colors.badge}`}>
                  {l.state.split(" ")[0]}
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
            className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500/40 bg-slate-900 cursor-pointer"
          />
          <span className="text-slate-300 font-medium">
            Chỉ hiện một tầng đang chọn (Tạm giấu các tầng khác)
          </span>
        </label>
      </div>
    </div>
  );
}
