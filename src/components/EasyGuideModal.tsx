"use client";

import React from "react";

interface EasyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EasyGuideModal({ isOpen, onClose }: EasyGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-slate-100 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-lg transition-colors cursor-pointer"
          aria-label="Đóng hướng dẫn"
        >
          ✕
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-lg">
            💡
          </div>
          <div>
            <h2 id="guide-modal-title" className="text-lg font-bold text-white">
              Hướng Dẫn Sử Dụng Nhanh
            </h2>
            <p className="text-xs text-slate-400">
              Dành cho bạn mới dùng lần đầu - cực kỳ đơn giản!
            </p>
          </div>
        </div>

        {/* 3 Simple Visual Steps */}
        <div className="flex flex-col gap-3 py-1">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-2xl p-1 bg-amber-500/10 rounded-lg">👆</span>
            <div>
              <h3 className="font-semibold text-sm text-amber-300">
                1. Xoay ngắm quả cầu 360°
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Dùng ngón tay (trên điện thoại) hoặc giữ chuột trái kéo để xoay quả cầu theo mọi hướng bạn thích.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-2xl p-1 bg-cyan-500/10 rounded-lg">🔍</span>
            <div>
              <h3 className="font-semibold text-sm text-cyan-300">
                2. Phóng to và thu nhỏ
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Cuộn con lăn chuột, chụm 2 ngón tay, hoặc bấm trực tiếp nút{" "}
                <strong className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                  +
                </strong>{" "}
                và{" "}
                <strong className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                  -
                </strong>{" "}
                trên màn hình.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-2xl p-1 bg-emerald-500/10 rounded-lg">✨</span>
            <div>
              <h3 className="font-semibold text-sm text-emerald-300">
                3. Chạm vào để xem chi tiết
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Bấm vào một <strong>lớp Trái Đất</strong>, một <strong>chấm động đất</strong> hoặc <strong>tên một quốc gia</strong> để xem điều kỳ diệu đang diễn ra bên dưới!
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/20 cursor-pointer transition-all mt-1"
        >
          Tôi đã hiểu, bắt đầu khám phá ngay! 🚀
        </button>
      </div>
    </div>
  );
}
