"use client";

import React, { useState } from "react";
import boundaryTypesData from "@/data/boundary-types.json";
import { ViewMode } from "../ViewTabs";

interface BoundaryType {
  id: string;
  name: string;
  englishName: string;
  symbol: string;
  color: string;
  strokePattern: string;
  summary: string;
  mechanism: string;
  earthquakeFeatures: string;
  examples: string;
  source: string;
}

interface BoundaryExplainerProps {
  selectedType?: string | null;
  onSelectType?: (typeId: string) => void;
  onSwitchToCore?: (mode: ViewMode) => void;
}

export function BoundaryExplainer({
  selectedType,
  onSelectType,
  onSwitchToCore,
}: BoundaryExplainerProps) {
  const [activeId, setActiveId] = useState<string>(selectedType || "convergent");

  const currentType =
    (boundaryTypesData as BoundaryType[]).find((b) => b.id === (selectedType || activeId)) ||
    (boundaryTypesData[0] as BoundaryType);

  const handleTypeClick = (id: string) => {
    setActiveId(id);
    if (onSelectType) onSelectType(id);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>🔬</span> Cơ Chế Sinh Động Đất Tại Các Ranh Giới
          </h3>
          <p className="text-xs text-slate-400">
            Khám phá cách chuyển động mảng tạo nên đứt gãy và giải phóng sóng địa chấn
          </p>
        </div>

        {/* Tab buttons for 3 boundary types */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(boundaryTypesData as BoundaryType[]).map((b) => {
            const isCurrent = b.id === currentType.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleTypeClick(b.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span style={{ color: b.color }}>{b.symbol}</span>
                <span className="hidden sm:inline">{b.name.split(" ")[2]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2D Interactive SVG Diagram of the selected boundary type */}
      <div className="w-full h-44 rounded-xl bg-slate-950 border border-slate-800/80 p-2 flex items-center justify-center relative overflow-hidden">
        {currentType.id === "divergent" && (
          <svg viewBox="0 0 400 160" className="w-full h-full max-w-md">
            {/* Mantle Upwelling Magma */}
            <defs>
              <linearGradient id="magmaGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            {/* Asthenosphere background */}
            <rect x="0" y="80" width="400" height="80" fill="#1e1b4b" opacity="0.6" />
            <text x="200" y="145" textAnchor="middle" fill="#94a3b8" fontSize="10">Quyển mềm (Asthenosphere) - Manti trên</text>

            {/* Rising Magma arrow */}
            <path d="M 190 125 L 200 70 L 210 125 Z" fill="url(#magmaGrad)" />
            <circle cx="200" cy="70" r="16" fill="#f59e0b" opacity="0.4" className="animate-ping" />

            {/* Left Plate moving Left */}
            <rect x="20" y="45" width="165" height="35" rx="3" fill="#334155" stroke="#38bdf8" strokeWidth="2" />
            <text x="95" y="66" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">Mảng A ⇦</text>

            {/* Right Plate moving Right */}
            <rect x="215" y="45" width="165" height="35" rx="3" fill="#334155" stroke="#38bdf8" strokeWidth="2" />
            <text x="305" y="66" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">⇨ Mảng B</text>

            {/* Ocean water */}
            <rect x="0" y="15" width="400" height="30" fill="#0284c7" opacity="0.25" />
            <text x="200" y="32" textAnchor="middle" fill="#38bdf8" fontSize="10">Đại dương & Vỏ mới tạo ra</text>

            {/* Shallow quake epicenters */}
            <circle cx="185" cy="50" r="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
            <circle cx="215" cy="52" r="3.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
            <text x="200" y="95" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">Động đất nông (&lt; 30 km)</text>
          </svg>
        )}

        {currentType.id === "convergent" && (
          <svg viewBox="0 0 400 160" className="w-full h-full max-w-md">
            {/* Continental Plate on Right */}
            <path d="M 230 40 L 380 40 L 380 120 L 230 120 Z" fill="#475569" stroke="#f43f5e" strokeWidth="2" />
            <text x="305" y="65" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">Vỏ Lục Địa (nhẹ hơn)</text>
            <text x="305" y="85" textAnchor="middle" fill="#cbd5e1" fontSize="9">Dãy núi uốn nếp &amp; Núi lửa</text>

            {/* Ocean Plate subducting on Left */}
            <path d="M 20 55 L 210 55 L 280 145 L 245 155 L 180 80 L 20 80 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="100" y="72" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">Mảng Đại Dương ⇨</text>

            {/* Ocean Trench */}
            <text x="210" y="30" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">Rãnh biển (Hút chìm)</text>

            {/* Wadati-Benioff Zone Quakes */}
            <circle cx="205" cy="62" r="4" fill="#fbbf24" />
            <circle cx="230" cy="85" r="4.5" fill="#f97316" />
            <circle cx="255" cy="115" r="5" fill="#ef4444" />
            <circle cx="270" cy="140" r="5" fill="#9333ea" />
            <text x="310" y="145" textAnchor="middle" fill="#e2e8f0" fontSize="9">Động đất sâu (&gt; 300km) ↘</text>
          </svg>
        )}

        {currentType.id === "transform" && (
          <svg viewBox="0 0 400 160" className="w-full h-full max-w-md">
            {/* Top Plate moving Left */}
            <rect x="40" y="25" width="320" height="45" fill="#334155" stroke="#facc15" strokeWidth="2" strokeDasharray="4 2" />
            <text x="200" y="52" textAnchor="middle" fill="#fef08a" fontSize="12" fontWeight="bold">⇦ Mảng trượt sang trái</text>

            {/* Fault Line */}
            <line x1="40" y1="75" x2="360" y2="75" stroke="#ef4444" strokeWidth="3" />
            <text x="200" y="90" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="bold">Đường đứt gãy trượt ngang (Ma sát lớn)</text>

            {/* Bottom Plate moving Right */}
            <rect x="40" y="95" width="320" height="45" fill="#334155" stroke="#facc15" strokeWidth="2" strokeDasharray="4 2" />
            <text x="200" y="122" textAnchor="middle" fill="#fef08a" fontSize="12" fontWeight="bold">Mảng trượt sang phải ⇨</text>

            {/* Stuck point & snap */}
            <circle cx="150" cy="75" r="6" fill="#facc15" className="animate-ping" />
            <circle cx="150" cy="75" r="5" fill="#ef4444" />
            <circle cx="260" cy="75" r="4" fill="#fbbf24" />
          </svg>
        )}
      </div>

      {/* Explanatory text */}
      <div className="flex flex-col gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentType.color }}
          />
          <h4 className="font-bold text-white text-sm">
            {currentType.name} ({currentType.englishName})
          </h4>
        </div>

        <p className="text-slate-300 leading-relaxed">{currentType.mechanism}</p>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col gap-1.5">
          <div className="text-amber-300 font-semibold flex items-center gap-1.5">
            <span>⚡</span> Đặc điểm động đất:
          </div>
          <p className="text-slate-300 leading-relaxed">
            {currentType.earthquakeFeatures}
          </p>
        </div>

        <div className="text-[11px] text-slate-400">
          <strong>Ví dụ thực tế:</strong> {currentType.examples}
        </div>
      </div>

      {/* Scientific mechanism box: Elastic Rebound Theory */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex flex-col gap-1.5">
        <strong className="text-cyan-300 flex items-center gap-1.5">
          <span>🧠</span> Vì sao động đất xảy ra? (Thuyết phục hồi đàn hồi - Reid 1910)
        </strong>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Các mảng kiến tạo dịch chuyển rất chậm (chỉ từ 1 đến 10 cm mỗi năm - tương đương tốc độ mọc của móng tay). Tại các mép ranh giới gồ ghề, ma sát khổng lồ giữ chặt chúng lại khiến các khối đá bị nén ép và tích tụ thế năng đàn hồi qua hàng thế kỷ. Khi ứng suất vượt quá độ bền cắt của đá, nó đứt gãy dữ dội trong tích tắc và giải phóng năng lượng thành các đợt <strong>sóng địa chấn (seismic waves)</strong> rung chuyển mặt đất.
        </p>
      </div>

      {/* Cross link back to Earth Core */}
      {onSwitchToCore && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-transparent border border-amber-800/40 flex items-center justify-between gap-3">
          <div className="text-xs text-amber-200">
            <span className="font-semibold block text-amber-300">
              Mảng kiến tạo nằm ở tầng nào của Trái Đất?
            </span>
            Chính là Thạch quyển (Lithosphere) trôi trên Manti trên!
          </div>
          <button
            type="button"
            onClick={() => onSwitchToCore("core")}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs whitespace-nowrap cursor-pointer transition-colors shadow-sm"
          >
            Xem Lớp Manti 3D ➔
          </button>
        </div>
      )}
    </div>
  );
}
