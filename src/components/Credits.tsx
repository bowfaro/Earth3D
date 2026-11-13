import React from "react";

export function Credits() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-4 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div className="flex flex-col gap-1">
          <p className="text-slate-300 font-medium">
            Dự án giáo dục STEM - Khám phá cấu trúc Trái Đất & Động lực học mảng kiến tạo
          </p>
          <p className="text-slate-400">
            Dành cho học sinh và người học đam mê khoa học Trái Đất.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-1 text-slate-400">
          <span>
            3D Model:{" "}
            <a
              href="https://sketchfab.com/3d-models/earth-core-7bb72849e81f4bfab1a77a059fb422b3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors font-medium"
            >
              Earth Core by saVRee on Sketchfab
            </a>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            Mảng kiến tạo:{" "}
            <a
              href="https://doi.org/10.1029/2001GC000252"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
            >
              PB2002 (Peter Bird / Nordpil)
            </a>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            Động đất:{" "}
            <a
              href="https://earthquake.usgs.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
            >
              USGS Earthquake Hazards Program
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
