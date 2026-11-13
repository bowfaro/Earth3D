"use client";

import React from "react";

export type ViewMode = "core" | "tectonics";

interface ViewTabsProps {
  currentMode: ViewMode;
  onSelectMode: (mode: ViewMode) => void;
}

export function ViewTabs({ currentMode, onSelectMode }: ViewTabsProps) {
  return (
    <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
      <button
        type="button"
        onClick={() => onSelectMode("core")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
          currentMode === "core"
            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-950/40"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
        }`}
        aria-selected={currentMode === "core"}
        role="tab"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse" />
        Bên trong Trái Đất (3D Core)
      </button>

      <button
        type="button"
        onClick={() => onSelectMode("tectonics")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
          currentMode === "tectonics"
            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/40"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
        }`}
        aria-selected={currentMode === "tectonics"}
        role="tab"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-300" />
        Mảng kiến tạo & Động đất (3D Globe)
      </button>
    </div>
  );
}
