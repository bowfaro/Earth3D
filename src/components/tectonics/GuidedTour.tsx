"use client";

import React, { useState } from "react";
import tourDataRaw from "@/data/guided-tour.json";

interface TourTask {
  id: number;
  title: string;
  prompt: string;
  hint: string;
  solution: string;
  actionTip: string;
}

const tourTasks = tourDataRaw as TourTask[];

interface GuidedTourProps {
  onToggleQuakes?: (show: boolean) => void;
  onToggleBoundaries?: (show: boolean) => void;
}

export function GuidedTour({ onToggleQuakes, onToggleBoundaries }: GuidedTourProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const currentTask = tourTasks[currentIndex];

  const handleNext = () => {
    if (currentIndex < tourTasks.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowHint(false);
      setShowSolution(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowHint(false);
      setShowSolution(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 flex flex-col gap-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧭</span>
          <div>
            <h3 className="text-sm font-bold text-white">
              Hành Trình Khám Phá Địa Cầu
            </h3>
            <p className="text-[11px] text-slate-400">
              Nhiệm vụ {currentIndex + 1} / {tourTasks.length} dành cho học sinh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs flex items-center justify-center cursor-pointer transition-colors"
          >
            ←
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === tourTasks.length - 1}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs flex items-center justify-center cursor-pointer transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Task Content */}
      <div className="flex flex-col gap-2.5 text-xs">
        <h4 className="font-semibold text-amber-300 text-sm">
          {currentTask.title}
        </h4>
        <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          {currentTask.prompt}
        </p>

        {/* Quick action buttons according to tasks */}
        {currentTask.id === 1 && (
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                if (onToggleQuakes) onToggleQuakes(true);
                if (onToggleBoundaries) onToggleBoundaries(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            >
              👁️ Chỉ hiện Động đất
            </button>
          </div>
        )}
        {currentTask.id === 2 && (
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                if (onToggleQuakes) onToggleQuakes(true);
                if (onToggleBoundaries) onToggleBoundaries(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white cursor-pointer"
            >
              🌐 Hiện cả Ranh giới & Động đất
            </button>
          </div>
        )}

        {/* Hint Accordion */}
        {showHint && (
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 text-blue-200 animate-in fade-in duration-150">
            <span className="font-semibold text-blue-300 block mb-0.5">💡 Gợi ý quan sát:</span>
            {currentTask.hint}
          </div>
        )}

        {/* Solution Accordion */}
        {showSolution && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 animate-in fade-in duration-150 flex flex-col gap-1.5">
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <span>✅</span> Đáp án & Giải thích khoa học:
            </span>
            <p className="leading-relaxed">{currentTask.solution}</p>
            <div className="text-[11px] text-emerald-300/80 pt-1 border-t border-emerald-800/40">
              📌 {currentTask.actionTip}
            </div>
          </div>
        )}

        {/* Hint & Solution Toggles */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
          >
            {showHint ? "Ẩn gợi ý" : "Xem gợi ý 💡"}
          </button>
          <button
            type="button"
            onClick={() => setShowSolution(!showSolution)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs transition-colors cursor-pointer"
          >
            {showSolution ? "Ẩn đáp án" : "Xem đáp án & kết luận 🔍"}
          </button>
        </div>
      </div>
    </div>
  );
}
