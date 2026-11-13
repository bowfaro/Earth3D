"use client";

import React from "react";
import { Earthquake } from "@/lib/usgs";

interface QuakeInfoProps {
  quake: Earthquake | null;
  onClose: () => void;
}

export function QuakeInfo({ quake, onClose }: QuakeInfoProps) {
  if (!quake) return null;

  const dateStr = new Date(quake.time).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const magColor =
    quake.mag >= 7.0
      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
      : quake.mag >= 5.5
      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-md p-4 text-xs flex flex-col gap-3 shadow-2xl shadow-black animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📍</span>
          <div>
            <h4 className="font-bold text-white text-sm leading-tight">
              {quake.place}
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">{dateStr}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          title="Đóng"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Độ lớn (Magnitude)</span>
          <span className={`inline-block px-2 py-0.5 mt-1 rounded-md font-mono font-bold text-sm border ${magColor}`}>
            M {quake.mag.toFixed(1)}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Độ sâu chấn tiêu</span>
          <span className="font-mono font-bold text-cyan-300 text-sm block mt-1">
            {quake.depthKm.toFixed(1)} km
          </span>
          <span className="text-[10px] text-slate-400">({quake.depthCategoryVi})</span>
        </div>
      </div>

      <div className="text-[11px] text-slate-300 flex items-center justify-between px-1">
        <span>Tọa độ địa lý:</span>
        <span className="font-mono text-slate-400">
          {quake.lat.toFixed(2)}°, {quake.lon.toFixed(2)}°
        </span>
      </div>

      {quake.tsunami > 0 && (
        <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-2 font-medium">
          <span>🌊</span> Cảnh báo có khả năng phát sinh sóng thần
        </div>
      )}

      {/* Socratic pedagogical prompt for students */}
      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
        <strong className="block text-amber-300 mb-0.5">💡 Câu hỏi quan sát:</strong>
        Điểm động đất này nằm gần loại ranh giới nào nhất trên quả cầu? Dựa vào độ sâu ({quake.depthKm.toFixed(0)} km), đây là đới hút chìm, tách giãn hay trượt ngang?
      </div>
    </div>
  );
}
