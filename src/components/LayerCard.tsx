"use client";

import React from "react";
import { ViewMode } from "./ViewTabs";

export interface LayerData {
  id: string;
  name: string;
  englishName: string;
  depthFromKm: number;
  depthToKm: number;
  thicknessKm: number;
  state: string;
  temperatureC: string;
  composition: string;
  description: string;
  nodeNames: string[];
  hasTectonicsLink?: boolean;
  source: string;
}

interface LayerCardProps {
  layer: LayerData | null;
  onNavigateToTectonics?: (mode: ViewMode) => void;
}

export function LayerCard({ layer, onNavigateToTectonics }: LayerCardProps) {
  if (!layer) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md text-slate-400 text-center flex flex-col items-center justify-center min-h-[300px]">
        <span className="text-3xl mb-2">🔍</span>
        <p className="font-medium text-slate-300">Chọn một lớp để xem chi tiết</p>
        <p className="text-xs text-slate-500 mt-1">
          Bấm vào danh sách các tầng Trái Đất bên cạnh để điều khiển góc nhìn 3D.
        </p>
      </div>
    );
  }

  const stateColors: Record<string, string> = {
    Rắn: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    "Rắn và dẻo (Quyển mềm)": "bg-amber-500/10 text-amber-400 border-amber-500/30",
    "Rắn (dưới áp lực cực lớn)": "bg-orange-500/10 text-orange-400 border-orange-500/30",
    Lỏng: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-5 flex flex-col gap-4 shadow-xl shadow-black/40">
      <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">{layer.name}</h2>
            <span className="text-xs text-slate-400 font-mono italic">({layer.englishName})</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Độ sâu: <strong className="text-amber-400 font-mono">{layer.depthFromKm} – {layer.depthToKm.toLocaleString()} km</strong> (Dày ~{layer.thicknessKm.toLocaleString()} km)
          </p>
        </div>

        <span
          className={`text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap ${
            stateColors[layer.state] || "bg-slate-800 text-slate-300 border-slate-700"
          }`}
        >
          {layer.state}
        </span>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-slate-400 block mb-1">Nhiệt độ ước tính</span>
          <span className="text-rose-400 font-semibold font-mono text-sm">{layer.temperatureC}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-slate-400 block mb-1">Thành phần chủ yếu</span>
          <span className="text-slate-200 line-clamp-2">{layer.composition}</span>
        </div>
      </div>

      {/* Description */}
      <div className="text-xs leading-relaxed text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
        <p>{layer.description}</p>
      </div>

      {/* Cross link to Tectonics if applicable */}
      {layer.hasTectonicsLink && onNavigateToTectonics && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-transparent border border-cyan-800/50 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-xs text-cyan-200 text-center sm:text-left">
            <span className="font-semibold text-cyan-300 block">Liên hệ Thạch quyển & Kiến tạo mảng:</span>
            Lớp này cấu thành các mảng thạch quyển trôi dạt trên bề mặt Trái Đất.
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTectonics("tectonics")}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium whitespace-nowrap transition-colors shadow-sm cursor-pointer"
          >
            Xem Địa Cầu Mảng 🌐
          </button>
        </div>
      )}

      {/* Citation */}
      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 flex items-center justify-between">
        <span>Nguồn tham khảo: {layer.source}</span>
      </div>
    </div>
  );
}
