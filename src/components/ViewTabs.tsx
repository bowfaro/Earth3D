"use client";

import React from "react";

export type ViewMode = "core" | "tectonics";

interface ViewTabsProps {
  currentMode: ViewMode;
  onSelectMode: (mode: ViewMode) => void;
}

export function ViewTabs({ currentMode, onSelectMode }: ViewTabsProps) {
  return (
    <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner w-full sm:w-auto">
      <button
        type="button"
        onClick={() => onSelectMode("core")}
        className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          currentMode === "core"
            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-950/40"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
        }`}
        aria-selected={currentMode === "core"}
        role="tab"
      >
        <span>🌋</span>
        <span>1. Lõi Trái Đất</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectMode("tectonics")}
        className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          currentMode === "tectonics"
            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/40"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
        }`}
        aria-selected={currentMode === "tectonics"}
        role="tab"
      >
        <span>🌐</span>
        <span>2. Động Đất & Mảng</span>
      </button>
    </div>
  );
}
