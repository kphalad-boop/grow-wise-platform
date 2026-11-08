'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { ScoreChart } from '@/components/assessment/ScoreChart';
import { createClient } from '@/lib/supabase/client';
import { CalculatedScores, InterpretationResult } from '@/types/database.types';

export default function AssessmentResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const code = (params.code as string)?.toUpperCase();
  const submissionId = searchParams.get('submissionId');
  const isGuestMode = searchParams.get('mode') === 'guest';

  const [scores, setScores] = useState<CalculatedScores | null>(null);
  const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null);
  const [assessmentTitle, setAssessmentTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      setIsLoading(true);

      if (isGuestMode) {
        // Read guest result from session storage
        const cached = sessionStorage.getItem('guest_assessment_result');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setScores(parsed.scores);
            setInterpretation(parsed.interpretation);
            setAssessmentTitle(parsed.assessmentTitle || code);
          } catch {}
        }
        setIsLoading(false);
        return;
      }

      if (submissionId) {
        // Fetch from Supabase (Protected by RLS: user can only fetch their own/granted children)
        const { data, error } = await supabase
          .from('submissions')
          .select('*, assessments(title)')
          .eq('id', submissionId)
          .single();

        if (data) {
          setScores(data.calculated_scores as CalculatedScores);
          setInterpretation(data.interpretation_result as InterpretationResult);
          setAssessmentTitle((data.assessments as any)?.title || code);
        }
      }

      setIsLoading(false);
    }

    loadResult();
  }, [submissionId, isGuestMode, code]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-sm">
        กำลังประมวลผลลัพธ์...
      </div>
    );
  }

  if (!scores || !interpretation) {
    return (
      <div className="flex-1 p-6 text-center">
        <TopBar showBack title="ไม่พบผลประเมิน" />
        <p className="text-sm text-slate-500 mt-8">ไม่พบข้อมูลผลการประเมินหรือหน้าต่างถูกปิดไปแล้ว</p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-2.5 rounded-2xl bg-[#6950A1] text-white text-xs font-semibold"
        >
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  const hasHighRiskFlags = interpretation.flags.some((f) => f.level === 'high');

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="ผลการคัดกรอง" subtitle={assessmentTitle} />

      <div className="p-4 space-y-4 pb-12">
        {/* Guest Warning Banner if in Guest Mode */}
        {isGuestMode && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
            <strong>คำเตือนโหมด Guest:</strong> ผลการประเมินนี้จะหายไปทันทีเมื่อปิดหรือรีเฟรชหน้าต่างนี้ หากต้องการบันทึกประวัติไว้ โปรด{' '}
            <Link href="/register" className="font-bold text-[#6950A1] underline">
              สมัครสมาชิก
            </Link>
          </div>
        )}

        {/* ⚠️ MANDATORY PROMINENT DISCLAIMER (ข้อความบังคับแสดงอย่างเด่นชัด) */}
        <div className="p-4 rounded-3xl bg-amber-500 text-white shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-extrabold tracking-tight">
              ผลนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัย
            </h3>
          </div>
          <p className="text-[11px] text-amber-50 font-medium leading-relaxed">
            {interpretation.disclaimer}
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6950A1] bg-purple-50 px-2.5 py-1 rounded-full uppercase">
              ภาพรวมผลการประเมิน
            </span>
            <span className="text-xs text-slate-400 font-medium">
              คะแนนรวม: <strong className="text-slate-800">{scores.total_score}</strong> / {scores.max_possible_score}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-800 mt-2 mb-1">
            {interpretation.summary}
          </h3>

          {/* Flags Alert Pills */}
          {interpretation.flags.length > 0 && (
            <div className="mt-3 space-y-2">
              {interpretation.flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-800 leading-snug flex items-start gap-2"
                >
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>{flag.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visual Charts Component */}
        <div>
          <h3 className="font-bold text-sm text-slate-800 px-1 mb-1">
            รายละเอียดคะแนนรายด้าน
          </h3>
          <ScoreChart scores={scores} assessmentCode={code} />
        </div>

        {/* Recommended Actions */}
        {interpretation.recommended_actions.length > 0 && (
          <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-card">
            <h3 className="text-xs font-bold text-[#6950A1] mb-2.5 flex items-center gap-1.5">
              <span>💡</span> ข้อแนะนำและแนวทางช่วยเหลือเบื้องต้น
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              {interpretation.recommended_actions.map((action, idx) => (
                <li key={idx} className="pl-1">{action}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/assessments"
            className="w-full min-h-[50px] rounded-2xl bg-[#6950A1] hover:bg-[#58418a] active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-purple-900/10 flex items-center justify-center transition-all"
          >
            ทำแบบประเมินอื่นต่อ
          </Link>

          <Link
            href="/"
            className="w-full min-h-[50px] rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-semibold text-sm flex items-center justify-center transition-all"
          >
            กลับสู่หน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
