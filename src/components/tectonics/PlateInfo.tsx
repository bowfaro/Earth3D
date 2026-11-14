"use client";

import React, { useMemo } from "react";
import { MajorPlate, getCountriesForPlate } from "@/lib/plates";
import { CountryData } from "./CountryInfo";

interface PlateInfoProps {
  plate: MajorPlate | null;
  allCountries: CountryData[];
  selectedCountry: CountryData | null;
  onSelectCountry: (country: CountryData) => void;
  onClose: () => void;
}

export function PlateInfo({
  plate,
  allCountries,
  selectedCountry,
  onSelectCountry,
  onClose,
}: PlateInfoProps) {
  const matchedCountries = useMemo(() => {
    if (!plate) return [];
    return getCountriesForPlate(plate, allCountries);
  }, [plate, allCountries]);

  if (!plate) return null;

  return (
    <div className="rounded-2xl border border-cyan-500/50 bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl shadow-cyan-950/40 animate-in fade-in slide-in-from-top-3 duration-200">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg"
            style={{ backgroundColor: plate.color || "#0284c7" }}
          >
            🗺️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {plate.name}
              </h3>
              <span className="text-xs text-cyan-300 font-mono italic">
                ({plate.en})
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-200">
                {matchedCountries.length} quốc gia
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {plate.desc}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm shrink-0"
          title="Đóng thông tin mảng"
        >
          ✕
        </button>
      </div>

      {/* 2. Countries on this plate list */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
            <span>🚩</span> Quốc gia thuộc mảng này ({matchedCountries.length}):
          </span>
          <span className="text-[11px] text-slate-400 italic">
            Bấm vào quốc gia để bay đến & xem chi tiết
          </span>
        </div>

        {matchedCountries.length === 0 ? (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
            {plate.id === "antarctic"
              ? "Nam Cực là lục địa được bảo tồn theo Hiệp ước Nam Cực, không có quốc gia độc lập mà chỉ có các trạm nghiên cứu khoa học quốc tế (McMurdo, Vostok, Amundsen-Scott)."
              : "Mảng đại dương này không có vùng đất thuộc quốc gia có trong danh mục."}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {matchedCountries.map((c) => {
              const isSelected = selectedCountry?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCountry(c)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500 text-white border-white shadow-md shadow-emerald-500/30 scale-105"
                      : "bg-slate-950/80 hover:bg-emerald-950/80 border-slate-800 hover:border-emerald-500/60 text-slate-200 hover:text-white"
                  }`}
                  title={`${c.name} (${c.englishName}) - Vị trí: ${c.plate}`}
                >
                  <span className="text-sm leading-none">{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Pedagogical Note */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
        <span className="text-amber-400 text-sm">💡</span>
        <div>
          <b className="text-slate-100">Ghi chú địa chất học sinh:</b> Các quốc gia nằm sâu trong nội mảng (như Việt Nam, Brazil) có nền đá cổ rất ổn định và ít động đất lớn. Ngược lại, các quốc gia nằm sát rìa ranh giới mảng (như Nhật Bản, Indonesia, Philippines, Chile) chịu lực ép và ma sát liên tục, là những điểm nóng động đất và sóng thần dữ dội nhất Trái Đất.
        </div>
      </div>
    </div>
  );
}
