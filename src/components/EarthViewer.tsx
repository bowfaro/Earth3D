"use client";

import React from "react";
import dynamic from "next/dynamic";

const EarthStructureViewer = dynamic(
  () => import("./core/EarthStructureViewer").then((m) => m.EarthStructureViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[4/3] md:aspect-[16/10] max-h-[640px] rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-xs text-slate-300">Đang khởi tạo đồ họa 3D Lõi Trái Đất...</p>
      </div>
    ),
  }
);

interface EarthViewerProps {
  onSwitchToTectonics?: () => void;
}

export function EarthViewer({ onSwitchToTectonics }: EarthViewerProps) {
  return <EarthStructureViewer onSwitchToTectonics={onSwitchToTectonics} />;
}
