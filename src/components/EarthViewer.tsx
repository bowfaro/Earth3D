"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSketchfab } from "@/hooks/useSketchfab";
import { DEFAULT_CAMERA, LAYER_NODE_MAP } from "@/lib/sketchfab";
import { LayerData } from "./LayerCard";

interface EarthViewerProps {
  selectedLayer: LayerData | null;
  isolateMode: boolean;
  resetTrigger: number;
}

export function EarthViewer({
  selectedLayer,
  isolateMode,
  resetTrigger,
}: EarthViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const { api, isReady, isLoading, error, reload } = useSketchfab(iframeRef, userLoaded);

  // Lazy loading observer
  useEffect(() => {
    if (userLoaded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setUserLoaded(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [userLoaded]);

  // Handle Layer Selection and Camera Movement / Node Hiding
  useEffect(() => {
    if (!api || !isReady) return;

    if (!selectedLayer) {
      // Restore all nodes
      Object.values(LAYER_NODE_MAP).forEach((config) => {
        config.nodeIds.forEach((nodeId) => {
          api.show(nodeId);
        });
      });
      return;
    }

    const config = LAYER_NODE_MAP[selectedLayer.id];
    if (config) {
      // Camera lookAt
      api.setCameraLookAt(
        config.camera.position,
        config.camera.target,
        config.camera.duration || 1.2
      );

      // Node isolation logic if enabled
      if (isolateMode) {
        Object.entries(LAYER_NODE_MAP).forEach(([id, c]) => {
          if (id === selectedLayer.id) {
            c.nodeIds.forEach((nid) => api.show(nid));
          } else {
            c.nodeIds.forEach((nid) => api.hide(nid));
          }
        });
      } else {
        // Show all
        Object.values(LAYER_NODE_MAP).forEach((c) => {
          c.nodeIds.forEach((nid) => api.show(nid));
        });
      }
    }
  }, [api, isReady, selectedLayer, isolateMode]);

  // Handle Reset View
  useEffect(() => {
    if (!api || !isReady || resetTrigger === 0) return;

    // Reset camera
    api.setCameraLookAt(
      DEFAULT_CAMERA.position,
      DEFAULT_CAMERA.target,
      DEFAULT_CAMERA.duration
    );

    // Show all nodes
    Object.values(LAYER_NODE_MAP).forEach((config) => {
      config.nodeIds.forEach((nodeId) => {
        api.show(nodeId);
      });
    });
  }, [api, isReady, resetTrigger]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] md:aspect-[16/10] max-h-[640px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center"
    >
      {/* 3D Iframe */}
      <iframe
        ref={iframeRef}
        id="sketchfab-frame"
        title="Earth Core 3D Model by saVRee"
        className="w-full h-full border-0 absolute inset-0 z-10"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />

      {/* Manual load banner if not loaded yet */}
      {!userLoaded && (
        <div className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mb-4 animate-bounce">
            🌏
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Mô hình 3D Lõi Trái Đất (Earth Core)
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Mô hình trực quan hoá cấu trúc phân lớp từ Vỏ đến Lõi Trái Đất.
          </p>
          <button
            type="button"
            onClick={() => setUserLoaded(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-orange-950/50 transition-all cursor-pointer"
          >
            Tải Mô Hình 3D Ngay
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {userLoaded && isLoading && (
        <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-300">
            Đang tải dữ liệu 3D từ Sketchfab...
          </p>
          <span className="text-[11px] text-slate-400">
            Mô hình Earth Core bản quyền bởi saVRee
          </span>
        </div>
      )}

      {/* Error state fallback */}
      {error && (
        <div className="absolute inset-0 z-30 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-xl">
            ⚠️
          </div>
          <h4 className="text-sm font-bold text-white">Không thể kết nối đến Sketchfab</h4>
          <p className="text-xs text-slate-400 max-w-md">
            Trình duyệt hoặc mạng chặn nhúng 3D. Vui lòng kiểm tra kết nối Internet.
          </p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={reload}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors"
            >
              Thử lại
            </button>
            <a
              href="https://sketchfab.com/3d-models/earth-core-7bb72849e81f4bfab1a77a059fb422b3"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs transition-colors"
            >
              Mở trực tiếp trên Sketchfab ↗
            </a>
          </div>
        </div>
      )}

      {/* Viewer controls overlay hint */}
      {isReady && (
        <div className="absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-md bg-slate-950/70 backdrop-blur-md border border-slate-800/80 text-[11px] text-slate-400 pointer-events-none flex items-center gap-1.5">
          <span>🖱️ Kéo để xoay | Cuộn để phóng to</span>
        </div>
      )}
    </div>
  );
}
