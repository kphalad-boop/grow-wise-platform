'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { AssessmentRunner } from '@/components/assessment/AssessmentRunner';
import { createClient } from '@/lib/supabase/client';
import { calculateAssessment } from '@/lib/scoring/engine';
import {
  AssessmentSchemaDefinition,
  AssessmentRulesDefinition,
  SubmissionAnswers,
  RespondentRole,
} from '@/types/database.types';

export default function AssessmentRunPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const code = (params.code as string)?.toUpperCase();
  const role = (searchParams.get('role') as RespondentRole) || 'parent';
  const ageMonths = Number(searchParams.get('ageMonths')) || 72;
  const childIdParam = searchParams.get('childId');
  const isGuestParam = searchParams.get('isGuest') === 'true';

  const [assessment, setAssessment] = useState<any>(null);
  const [versionData, setVersionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadAssessment() {
      setIsLoading(true);

      const { data: assess } = await supabase
        .from('assessments')
        .select('*')
        .eq('code', code)
        .eq('status', 'published')
        .single();

      if (assess) {
        setAssessment(assess);
        const { data: ver } = await supabase
          .from('assessment_versions')
          .select('*')
          .eq('assessment_id', assess.id)
          .eq('version_number', assess.current_version)
          .single();

        if (ver) {
          setVersionData(ver);
        }
      }
      setIsLoading(false);
    }

    loadAssessment();
  }, [code]);

  const handleComplete = async (answers: SubmissionAnswers) => {
    if (!assessment || !versionData) return;
    setIsSubmitting(true);

    const schema = versionData.schema_definition as AssessmentSchemaDefinition;
    const rules = versionData.rules_definition as AssessmentRulesDefinition;

    // 1. Calculate Scores and Interpretations
    const { scores, interpretation } = calculateAssessment(
      code,
      answers,
      role,
      ageMonths,
      schema,
      rules
    );

    // 2. Handle Guest Flow vs Authenticated Flow
    if (isGuestParam || childIdParam === 'guest') {
      // Guest: Store in sessionStorage ONLY, NO insert to DB!
      const guestResultPayload = {
        assessmentCode: code,
        assessmentTitle: assessment.title,
        scores,
        interpretation,
        isGuest: true,
        createdAt: new Date().toISOString(),
      };

      sessionStorage.setItem('guest_assessment_result', JSON.stringify(guestResultPayload));
      router.push(`/assessments/${code}/result?mode=guest`);
      return;
    }

    // Authenticated Flow: Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: submission, error } = await supabase
        .from('submissions')
        .insert({
          child_id: childIdParam,
          respondent_id: user ? user.id : null,
          respondent_role: role,
          assessment_id: assessment.id,
          version_number: versionData.version_number,
          answers,
          calculated_scores: scores,
          interpretation_result: interpretation,
          is_guest: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Clear draft
      sessionStorage.removeItem(`draft_${code}_${childIdParam}`);
      router.push(`/assessments/${code}/result?submissionId=${submission.id}`);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการบันทึกผล: ${err.message || 'กรุณาลองใหม่อีกครั้ง'}`);
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (answers: SubmissionAnswers) => {
    // Authenticated users can store partial answers locally or server-side
    sessionStorage.setItem(`draft_${code}_${childIdParam}`, JSON.stringify(answers));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-sm">
        กำลังโหลดชุดข้อคำถาม...
      </div>
    );
  }

  if (!assessment || !versionData) {
    return (
      <div className="flex-1 p-6 text-center">
        <TopBar showBack title="ไม่พบแบบประเมิน" />
        <p className="text-sm text-slate-500 mt-8">ไม่พบข้อมูลแบบประเมิน</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        showBack
        title={assessment.code}
        subtitle="ตอบตามพฤติกรรมจริงของเด็ก"
      />

      {isSubmitting ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 border-4 border-[#6950A1] border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="font-bold text-slate-800 text-sm">กำลังประมวลผลคะแนน...</h3>
          <p className="text-xs text-slate-500 mt-1">กรุณารอสักครู่ ระบบกำลังจัดทำรายงานผลการคัดกรอง</p>
        </div>
      ) : (
        <AssessmentRunner
          assessmentCode={code}
          assessmentTitle={assessment.title}
          schema={versionData.schema_definition}
          rules={versionData.rules_definition}
          childAgeMonths={ageMonths}
          isGuest={isGuestParam}
          childId={childIdParam}
          onComplete={handleComplete}
          onSaveDraft={handleSaveDraft}
        />
      )}
    </div>
  );
}
