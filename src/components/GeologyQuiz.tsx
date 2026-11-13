"use client";

import React, { useState } from "react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Các mảng kiến tạo trôi dạt trên bề mặt Trái Đất thuộc tầng cấu trúc nào?",
    options: [
      "Chỉ gồm lớp vỏ Trái Đất",
      "Thạch quyển (gồm vỏ và phần trên cùng của manti trên)",
      "Toàn bộ lớp manti dưới",
      "Lớp lõi ngoài nóng chảy",
    ],
    correctIndex: 1,
    explanation:
      "Chính xác! Thạch quyển (Lithosphere) dày khoảng 100-150 km gồm toàn bộ vỏ và phần trên cùng cứng của manti trên, trôi dạt trên quyển mềm (asthenosphere) có tính dẻo quánh.",
  },
  {
    id: 2,
    question: "Vì sao các trận động đất rất sâu (> 300 km) chỉ xuất hiện ở các ranh giới hội tụ?",
    options: [
      "Do magma từ lõi Trái Đất phun trào lên",
      "Do mảng đại dương lạnh bị hút chìm sâu vào lòng manti và tiếp tục nứt vỡ",
      "Do sóng thần ép mạnh xuống đáy biển",
      "Do hai mảng trượt ngang làm nứt lõi",
    ],
    correctIndex: 1,
    explanation:
      "Chính xác! Tại các đới hút chìm, tấm mảng đại dương lạnh và giòn cắm sâu hàng trăm km xuống manti nóng dẻo. Sự ma sát và đứt gãy dọc theo tấm chìm này (mặt Wadati-Benioff) sinh ra các trận động đất cực sâu.",
  },
  {
    id: 3,
    question: "Lõi ngoài của Trái Đất ở trạng thái nào và có vai trò quan trọng gì đối với sự sống?",
    options: [
      "Rắn, giúp giữ cố định trục quay Trái Đất",
      "Lỏng, chuyển động đối lưu của hợp kim sắt-niken tạo ra từ trường bảo vệ Trái Đất",
      "Khí, tạo ra áp suất khí quyển",
      "Dẻo, sinh ra các mảng kiến tạo",
    ],
    correctIndex: 1,
    explanation:
      "Chính xác! Lõi ngoài ở trạng thái lỏng ở nhiệt độ 4.000 - 5.000°C. Chuyển động đối lưu của sắt lỏng tạo nên hiệu ứng địa động lực học (geodynamo), sinh ra từ trường che chắn các hạt bức xạ vũ trụ nguy hiểm.",
  },
  {
    id: 4,
    question: "Sống núi giữa Đại Tây Dương (Mid-Atlantic Ridge) là ví dụ điển hình của loại ranh giới nào?",
    options: [
      "Ranh giới phân kỳ (hai mảng tách giãn ra)",
      "Ranh giới hội tụ hút chìm",
      "Ranh giới va chạm lục địa tạo núi",
      "Ranh giới trượt ngang",
    ],
    correctIndex: 0,
    explanation:
      "Chính xác! Tại sống núi giữa Đại Tây Dương, mảng Bắc Mỹ/Nam Mỹ tách xa mảng Âu-Á/Phi với tốc độ khoảng 2,5 cm/năm, vật chất từ manti dâng lên tạo nên đáy biển mới.",
  },
];

export function GeologyQuiz() {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (qId: number, optIndex: number) => {
    if (showResults) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) score += 1;
    });
    return score;
  };

  const handleReset = () => {
    setUserAnswers({});
    setShowResults(false);
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 flex flex-col gap-5 shadow-xl shadow-black/30">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🎯</span> Thử Thách Kiến Thức Địa Chất
          </h3>
          <p className="text-xs text-slate-400">
            Kiểm tra mức độ hiểu bài sau khi quan sát mô hình 3D và dữ liệu động đất
          </p>
        </div>

        {showResults && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Điểm số: {calculateScore()} / {QUIZ_QUESTIONS.length}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Làm lại
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUIZ_QUESTIONS.map((q, index) => {
          const selected = userAnswers[q.id];
          const isCorrect = selected === q.correctIndex;

          return (
            <div
              key={q.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-3 text-xs"
            >
              <h4 className="font-semibold text-slate-200 leading-snug">
                <span className="text-amber-400 font-mono mr-1.5">
                  Câu {index + 1}:
                </span>
                {q.question}
              </h4>

              <div className="flex flex-col gap-1.5">
                {q.options.map((opt, optIndex) => {
                  let optStyle =
                    "border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-800/60";

                  if (selected === optIndex) {
                    optStyle =
                      "border-amber-500/60 bg-amber-500/15 text-white font-medium";
                  }

                  if (showResults) {
                    if (optIndex === q.correctIndex) {
                      optStyle =
                        "border-emerald-500 bg-emerald-500/20 text-emerald-200 font-semibold";
                    } else if (selected === optIndex && !isCorrect) {
                      optStyle =
                        "border-rose-500 bg-rose-500/20 text-rose-200 line-through";
                    }
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={showResults}
                      onClick={() => handleSelectOption(q.id, optIndex)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer disabled:cursor-default flex items-start gap-2 ${optStyle}`}
                    >
                      <span className="font-mono text-slate-400 uppercase">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {showResults && (
                <div
                  className={`p-2.5 rounded-lg text-[11px] leading-relaxed border ${
                    isCorrect
                      ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-300"
                      : "bg-rose-950/30 border-rose-800/40 text-rose-300"
                  }`}
                >
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showResults && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setShowResults(true)}
            disabled={Object.keys(userAnswers).length === 0}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-xs shadow-lg shadow-orange-950/40 transition-all cursor-pointer"
          >
            Nộp bài &amp; Xem giải thích ➜
          </button>
        </div>
      )}
    </div>
  );
}
