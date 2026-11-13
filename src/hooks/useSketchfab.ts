"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SKETCHFAB_API_SCRIPT_URL, SKETCHFAB_UID } from "@/lib/sketchfab";

export interface SketchfabApi {
  start: (callback?: () => void) => void;
  stop: (callback?: () => void) => void;
  addEventListener: (event: string, callback: (...args: unknown[]) => void) => void;
  removeEventListener: (event: string, callback: (...args: unknown[]) => void) => void;
  setCameraLookAt: (
    position: [number, number, number],
    target: [number, number, number],
    duration?: number,
    callback?: (err?: unknown) => void
  ) => void;
  getCameraLookAt: (
    callback: (err: unknown, camera: { position: number[]; target: number[] }) => void
  ) => void;
  hide: (instanceId: number, callback?: (err?: unknown) => void) => void;
  show: (instanceId: number, callback?: (err?: unknown) => void) => void;
  getNodeMap: (callback: (err: unknown, nodes: Record<string, unknown>) => void) => void;
}

interface SketchfabClient {
  init: (
    uid: string,
    options: {
      success: (api: SketchfabApi) => void;
      error: (err: unknown) => void;
      autostart?: number;
      ui_controls?: number;
      ui_infos?: number;
      ui_watermark?: number;
      ui_stop?: number;
      ui_hint?: number;
      preload?: number;
      transparent?: number;
      scrollwheel?: number;
    }
  ) => void;
}

declare global {
  interface Window {
    Sketchfab?: new (iframe: HTMLIFrameElement) => SketchfabClient;
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadSketchfabScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Window not defined"));
  if (window.Sketchfab) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    // Check if script tag already exists
    const existingScript = document.querySelector(`script[src="${SKETCHFAB_API_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.src = SKETCHFAB_API_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (e) => {
      scriptLoadPromise = null;
      reject(new Error(`Failed to load Sketchfab script: ${e}`));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function useSketchfab(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  shouldInit: boolean = true
) {
  const [api, setApi] = useState<SketchfabApi | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const apiRef = useRef<SketchfabApi | null>(null);

  const initViewer = useCallback(async () => {
    if (!iframeRef.current || !shouldInit) return;

    try {
      setIsLoading(true);
      setError(null);
      await loadSketchfabScript();

      if (!window.Sketchfab || !iframeRef.current) {
        throw new Error("Sketchfab SDK not initialized properly");
      }

      const client = new window.Sketchfab(iframeRef.current);

      client.init(SKETCHFAB_UID, {
        success: (sketchfabApi: SketchfabApi) => {
          apiRef.current = sketchfabApi;
          sketchfabApi.start(() => {});
          sketchfabApi.addEventListener("viewerready", () => {
            setIsReady(true);
            setIsLoading(false);
            setApi(sketchfabApi);
          });
        },
        error: (err: unknown) => {
          const errMsg = typeof err === "string" ? err : "Không thể khởi động Sketchfab Viewer";
          setError(errMsg);
          setIsLoading(false);
        },
        autostart: 1,
        ui_controls: 1,
        ui_infos: 0,
        ui_watermark: 0,
        ui_hint: 1,
        scrollwheel: 1,
        transparent: 0,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi tải thư viện Sketchfab";
      setError(msg);
      setIsLoading(false);
    }
  }, [iframeRef, shouldInit]);

  useEffect(() => {
    if (shouldInit && !apiRef.current) {
      initViewer();
    }

    return () => {
      if (apiRef.current) {
        try {
          apiRef.current.stop();
        } catch {
          // ignore cleanup error
        }
        apiRef.current = null;
      }
    };
  }, [shouldInit, initViewer]);

  return {
    api,
    isReady,
    isLoading,
    error,
    reload: initViewer,
  };
}
