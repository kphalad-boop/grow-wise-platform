'use client';

import React from 'react';
import { CalculatedScores } from '@/types/database.types';

interface ScoreChartProps {
  scores: CalculatedScores;
  assessmentCode: string;
}

export function ScoreChart({ scores, assessmentCode }: ScoreChartProps) {
  const sections = Object.values(scores.sections || {});

  return (
    <div className="space-y-3.5 my-4">
      {sections.map((sec) => {
        const percent = Math.min(
          100,
          Math.round((sec.raw_score / (sec.max_score || 1)) * 100)
        );
        const isElevated = sec.is_elevated;

        return (
          <div
            key={sec.section_id}
            className={`p-4 rounded-3xl bg-white border transition-all ${
              isElevated
                ? 'border-rose-200 shadow-sm bg-gradient-to-r from-rose-50/20 to-white'
                : 'border-slate-100 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                {sec.title}
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isElevated
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {isElevated ? 'พบข้อสังเกต' : 'ปกติ'}
              </span>
            </div>

            {/* Score Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isElevated
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                    : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-medium">
              <span>คะแนนดิบ: <strong className="text-slate-700">{sec.raw_score}</strong> / {sec.max_score}</span>
              <span>คะแนนเฉลี่ย: <strong className="text-slate-700">{sec.mean_score}</strong></span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
