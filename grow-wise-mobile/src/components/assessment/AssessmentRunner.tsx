'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AssessmentSchemaDefinition,
  AssessmentRulesDefinition,
  SubmissionAnswers,
  AssessmentSection,
  AssessmentItem,
} from '@/types/database.types';

interface AssessmentRunnerProps {
  assessmentCode: string;
  assessmentTitle: string;
  schema: AssessmentSchemaDefinition;
  rules: AssessmentRulesDefinition;
  childAgeMonths?: number;
  isGuest?: boolean;
  childId?: string | null;
  onComplete: (answers: SubmissionAnswers) => void;
  onSaveDraft?: (answers: SubmissionAnswers) => Promise<void>;
}

export function AssessmentRunner({
  assessmentCode,
  assessmentTitle,
  schema,
  rules,
  childAgeMonths = 72,
  isGuest = false,
  childId = null,
  onComplete,
  onSaveDraft,
}: AssessmentRunnerProps) {
  const router = useRouter();

  // Filter sections and items based on condition (e.g. min_age_months: 72)
  const applicableSections = useMemo(() => {
    return schema.sections.filter((sec) => {
      if (sec.conditions?.min_age_months && childAgeMonths < sec.conditions.min_age_months) {
        return false;
      }
      return true;
    });
  }, [schema.sections, childAgeMonths]);

  // Current active section index
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const currentSection: AssessmentSection | undefined = applicableSections[currentSectionIndex];

  // Store answers in state: { [itemId]: score }
  const [answers, setAnswers] = useState<SubmissionAnswers>(() => {
    // Attempt to restore cached draft from sessionStorage for guest / active session
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(`draft_${assessmentCode}_${childId || 'guest'}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }
    return {};
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftToast, setDraftToast] = useState<string | null>(null);

  // Map items lookup
  const itemsMap = useMemo(() => {
    const map = new Map<string, AssessmentItem>();
    schema.items.forEach((item) => map.set(item.id, item));
    return map;
  }, [schema.items]);

  // Items for the current section
  const currentItems = useMemo(() => {
    if (!currentSection) return [];
    return currentSection.item_ids
      .map((id) => itemsMap.get(id))
      .filter((item): item is AssessmentItem => Boolean(item));
  }, [currentSection, itemsMap]);

  // Calculate overall progress across all applicable items
  const allApplicableItemIds = useMemo(() => {
    return applicableSections.flatMap((s) => s.item_ids);
  }, [applicableSections]);

  const answeredCount = useMemo(() => {
    return allApplicableItemIds.filter((id) => typeof answers[id] === 'number').length;
  }, [allApplicableItemIds, answers]);

  const progressPercent = Math.round((answeredCount / (allApplicableItemIds.length || 1)) * 100);

  // Handle single question selection
  const handleSelectOption = (itemId: string, value: number) => {
    setAnswers((prev) => {
      const updated = { ...prev, [itemId]: value };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`draft_${assessmentCode}_${childId || 'guest'}`, JSON.stringify(updated));
      }
      return updated;
    });
    setValidationError(null);
  };

  // Validate current section before moving forward
  const validateCurrentSection = (): boolean => {
    if (!currentSection) return true;
    const unanswered = currentSection.item_ids.filter((id) => typeof answers[id] !== 'number');
    if (unanswered.length > 0) {
      setValidationError(`กรุณาตอบคำถามให้ครบทุกข้อในหมวดนี้ (ยังเหลืออีก ${unanswered.length} ข้อ)`);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentSection()) return;

    if (currentSectionIndex < applicableSections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final submission check
      const remainingTotal = allApplicableItemIds.filter((id) => typeof answers[id] !== 'number');
      if (remainingTotal.length > 0) {
        setValidationError(`มีคำถามที่ยังไม่ได้ตอบทั้งหมด ${remainingTotal.length} ข้อ`);
        return;
      }
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    setValidationError(null);
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = async () => {
    if (isGuest) {
      setDraftToast('โหมด Guest ไม่สามารถบันทึกร่างลงระบบได้ ข้อมูลจะคงอยู่ในเบราว์เซอร์นี้จนกว่าจะปิดหน้าต่าง');
      setTimeout(() => setDraftToast(null), 4000);
      return;
    }

    if (onSaveDraft) {
      setIsSavingDraft(true);
      try {
        await onSaveDraft(answers);
        setDraftToast('บันทึกร่างเรียบร้อยแล้ว');
      } catch {
        setDraftToast('เกิดข้อผิดพลาดในการบันทึกร่าง');
      } finally {
        setIsSavingDraft(false);
        setTimeout(() => setDraftToast(null), 3000);
      }
    }
  };

  if (!currentSection) {
    return <div className="p-6 text-center text-slate-500">ไม่พบคำถามสำหรับเกณฑ์อายุนี้</div>;
  }

  return (
    <div className="flex flex-col flex-1 pb-10">
      {/* Top Floating Progress Bar */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
          <span className="text-[#6950A1]">
            หมวดที่ {currentSectionIndex + 1} จาก {applicableSections.length}
          </span>
          <span>
            {answeredCount}/{allApplicableItemIds.length} ข้อ ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8672B2] to-[#6950A1] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Toast Notification */}
      {draftToast && (
        <div className="fixed top-28 left-4 right-4 z-50 max-w-sm mx-auto bg-slate-800 text-white text-xs px-4 py-3 rounded-2xl shadow-xl animate-in fade-in flex items-center justify-between">
          <span>{draftToast}</span>
          <button onClick={() => setDraftToast(null)} className="ml-2 text-slate-400">✕</button>
        </div>
      )}

      {/* Section Header Card */}
      <div className="px-4 pt-5 pb-3">
        <div className="bg-gradient-to-br from-[#F4F1FA] to-white p-4 rounded-3xl border border-purple-100/80 shadow-sm">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#6950A1] bg-purple-100/60 px-2.5 py-1 rounded-full">
            {assessmentCode}
          </span>
          <h2 className="text-lg font-bold text-slate-800 mt-2 mb-1">
            {currentSection.title}
          </h2>
          {currentSection.description && (
            <p className="text-xs text-slate-500 leading-relaxed">
              {currentSection.description}
            </p>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="px-4 space-y-4 my-2">
        {currentItems.map((item, idx) => {
          const isAnswered = typeof answers[item.id] === 'number';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-3xl bg-white border transition-all ${
                isAnswered
                  ? 'border-purple-200/90 shadow-sm'
                  : 'border-slate-200/70 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-2.5 mb-3.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6950A1] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {item.number}
                </span>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                  {item.text}
                </p>
              </div>

              {/* Options Pills / Radio Grid */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {schema.scale.map((opt) => {
                  const isSelected = answers[item.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectOption(item.id, opt.value)}
                      className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-2xl text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#6950A1] text-white shadow-md shadow-purple-900/10 font-bold'
                          : 'bg-slate-50/90 text-slate-700 hover:bg-slate-100 border border-slate-100'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center border text-[11px] ${
                          isSelected
                            ? 'bg-white text-[#6950A1] border-white'
                            : 'border-slate-300 text-slate-400'
                        }`}
                      >
                        {opt.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="mx-4 my-2 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs">
          <svg className="w-5 h-5 flex-shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">{validationError}</span>
        </div>
      )}

      {/* Navigation & Action Bottom Bar */}
      <div className="px-4 mt-6 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {currentSectionIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 min-h-[50px] rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              ก่อนหน้า
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 min-h-[50px] rounded-2xl bg-[#6950A1] hover:bg-[#58418a] active:scale-95 text-white font-semibold text-sm shadow-md shadow-purple-900/10 transition-all flex items-center justify-center gap-1.5"
          >
            {currentSectionIndex < applicableSections.length - 1 ? (
              <>
                ถัดไป
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              'ส่งแบบประเมิน'
            )}
          </button>
        </div>

        {/* Save Draft Action */}
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSavingDraft}
          className="w-full py-2.5 text-xs font-semibold text-[#8672B2] hover:text-[#6950A1] transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          {isSavingDraft ? 'กำลังบันทึกร่าง...' : 'บันทึกร่าง'}
        </button>
      </div>
    </div>
  );
}
