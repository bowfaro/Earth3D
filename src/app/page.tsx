"use client";

import React, { useState } from "react";
import { ViewTabs, ViewMode } from "@/components/ViewTabs";
import { Credits } from "@/components/Credits";

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("core");

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100">
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20 font-bold text-white text-lg">
              🌍
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Địa Cầu 3D <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">STEM Edu</span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Khám phá cấu trúc bên trong & động lực học mảng kiến tạo
              </p>
            </div>
          </div>

          <ViewTabs currentMode={viewMode} onSelectMode={setViewMode} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-6">
        <div className="text-xs text-slate-400">
          Chế độ hiện tại: <span className="font-semibold text-slate-200">{viewMode === "core" ? "Bên trong Trái Đất (Earth Core)" : "Mảng kiến tạo & Động đất"}</span>
        </div>

        {/* Placeholder container for Phase 2 layout check */}
        <div className="w-full h-[600px] rounded-2xl border border-slate-800 bg-slate-900/40 flex items-center justify-center text-slate-500">
          Vùng hiển thị 3D Viewer (sẽ được tích hợp trong Phase 3 & 5)
        </div>
      </main>

      {/* Footer */}
      <Credits />
    </div>
  );
}
