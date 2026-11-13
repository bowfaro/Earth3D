"use client";

import React from "react";

export interface CountryData {
  id: string;
  name: string;
  englishName: string;
  flag: string;
  lat: number;
  lon: number;
  plate: string;
  seismicNote: string;
}

interface CountryInfoProps {
  country: CountryData | null;
  onClose: () => void;
}

export function CountryInfo({ country, onClose }: CountryInfoProps) {
  if (!country) return null;

  return (
    <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 flex flex-col gap-3 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl" role="img" aria-label={country.name}>
            {country.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {country.name}
              </h3>
              <span className="text-xs text-slate-400 font-mono italic">
                ({country.englishName})
              </span>
            </div>
            <p className="text-xs text-cyan-300 font-medium">
              Vị trí kiến tạo: <strong className="text-cyan-200">{country.plate}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
          title="Đóng thông tin quốc gia"
        >
          ✕
        </button>
      </div>

      {/* Seismic Explanation for Students */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
        <span className="text-amber-400 font-semibold block mb-1">
          📌 Tình hình động đất & mảng kiến tạo:
        </span>
        <p>{country.seismicNote}</p>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>
          Tọa độ: <code className="font-mono text-slate-300">{country.lat.toFixed(1)}°</code>,{" "}
          <code className="font-mono text-slate-300">{country.lon.toFixed(1)}°</code>
        </span>
        <span className="text-cyan-400 font-medium">
          Dữ liệu đối chiếu địa chất PB2002
        </span>
      </div>
    </div>
  );
}
