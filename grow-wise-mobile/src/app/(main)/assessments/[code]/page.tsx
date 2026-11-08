'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { createClient } from '@/lib/supabase/client';
import { calculateChildAge, ChildAge } from '@/lib/utils/age';
import { GuestNoticeModal } from '@/components/modals/GuestNoticeModal';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  birth_date: string;
}

export default function AssessmentPreStartPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const code = (params.code as string)?.toUpperCase();

  const [assessment, setAssessment] = useState<any>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [guestAgeYears, setGuestAgeYears] = useState<number>(6);
  const [guestAgeMonths, setGuestAgeMonths] = useState<number>(0);
  const [respondentRole, setRespondentRole] = useState<'parent' | 'teacher'>('parent');
  const [isConsentGiven, setIsConsentGiven] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showGuestNotice, setShowGuestNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      // 1. Fetch Assessment definition
      const { data: assessData } = await supabase
        .from('assessments')
        .select('*, assessment_versions(*)')
        .eq('code', code)
        .eq('status', 'published')
        .single();

      if (assessData) {
        setAssessment(assessData);
      }

      // 2. Fetch User & Children
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsGuest(true);
      } else {
        const { data: childData } = await supabase
          .from('children')
          .select('*')
          .order('created_at', { ascending: false });

        if (childData && childData.length > 0) {
          setChildren(childData);
          setSelectedChildId(childData[0].id);
        }
      }
      setIsLoading(false);
    }

    loadData();
  }, [code]);

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const selectedChildAge = selectedChild ? calculateChildAge(selectedChild.birth_date) : null;

  const handleStart = () => {
    if (!isConsentGiven) return;

    if (isGuest) {
      setShowGuestNotice(true);
      return;
    }

    proceedToRun();
  };

  const proceedToRun = () => {
    const ageMonths = isGuest
      ? guestAgeYears * 12 + guestAgeMonths
      : (selectedChildAge?.totalMonths || 72);

    const query = new URLSearchParams({
      role: respondentRole,
      ageMonths: String(ageMonths),
      childId: selectedChildId || 'guest',
      isGuest: String(isGuest),
    });

    router.push(`/assessments/${code}/run?${query.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-sm">
        กำลังโหลดข้อมูลแบบประเมิน...
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex-1 p-6 text-center">
        <TopBar showBack title="ไม่พบแบบประเมิน" />
        <p className="text-sm text-slate-500 mt-8">ไม่พบรหัสแบบประเมิน {code} ที่เผยแพร่แล้ว</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar showBack title={assessment.code} subtitle="เตรียมความพร้อมก่อนเริ่ม" />

      <div className="p-4 space-y-4 pb-12">
        {/* Assessment Overview Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-card">
          <span className="text-[10px] font-bold text-[#6950A1] bg-purple-50 px-2.5 py-1 rounded-full uppercase">
            {assessment.code} • เวอร์ชัน 1.0
          </span>
          <h2 className="text-lg font-bold text-slate-800 mt-2 mb-1">
            {assessment.title}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {assessment.description}
          </p>
        </div>

        {/* Respondent Role Selector */}
        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-card">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            คุณตอบแบบประเมินนี้ในบทบาทใด?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRespondentRole('parent')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                respondentRole === 'parent'
                  ? 'bg-[#6950A1] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ผู้ปกครอง / ผู้ดูแล
            </button>
            <button
              type="button"
              onClick={() => setRespondentRole('teacher')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                respondentRole === 'teacher'
                  ? 'bg-[#6950A1] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              คุณครูประจำชั้น
            </button>
          </div>
        </div>

        {/* Child Selection (or Guest Age Input) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-card">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            ข้อมูลเด็กที่จะรับการประเมิน
          </label>

          {!isGuest && children.length > 0 ? (
            <div className="space-y-2">
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full h-12 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#6950A1]"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    น้อง{c.nickname || c.first_name} ({c.first_name} {c.last_name})
                  </option>
                ))}
              </select>

              {selectedChildAge && (
                <p className="text-[11px] text-[#6950A1] font-semibold px-1">
                  คำนวณอายุอัตโนมัติ: {selectedChildAge.formattedText} ({selectedChildAge.totalMonths} เดือน)
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500">
                {isGuest
                  ? 'โหมด Guest: กรุณาระบุอายุของน้องเพื่อใช้คำนวณเกณฑ์จุดตัด'
                  : 'ยังไม่มีข้อมูลเด็กในระบบ กรุณาระบุอายุของน้อง'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-600 font-medium block mb-1">ปี (ขวบ)</span>
                  <input
                    type="number"
                    min={2}
                    max={18}
                    value={guestAgeYears}
                    onChange={(e) => setGuestAgeYears(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-600 font-medium block mb-1">เดือน</span>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={guestAgeMonths}
                    onChange={(e) => setGuestAgeMonths(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions & Consent Box */}
        <div className="p-4 rounded-3xl bg-purple-50/70 border border-purple-100">
          <h4 className="text-xs font-bold text-[#6950A1] mb-2 flex items-center gap-1.5">
            <span>ℹ️</span> คำแนะนำในการตอบแบบประเมิน
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed mb-4">
            <li>โปรดตอบตามพฤติกรรมจริงของเด็กในช่วง 6 เดือนที่ผ่านมา</li>
            <li>ตอบข้อคำถามตามความรู้สึกแรก ไม่จำเป็นต้องใช้เวลากับข้อใดข้อหนึ่งนานเกินไป</li>
            <li>ผลการประเมินจะสรุปคะแนนแยกตามระบบและให้คำแนะนำเบื้องต้นทันที</li>
          </ul>

          <label className="flex items-start gap-2.5 pt-2 border-t border-purple-200/50 cursor-pointer">
            <input
              type="checkbox"
              checked={isConsentGiven}
              onChange={(e) => setIsConsentGiven(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#6950A1] focus:ring-[#6950A1]"
            />
            <span className="text-[11px] text-slate-700 font-semibold leading-tight">
              ข้าพเจ้าเข้าใจว่าการประเมินนี้เป็นการคัดกรองเบื้องต้นเพื่อความเข้าใจพัฒนาการเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์
            </span>
          </label>
        </div>

        {/* Start Button */}
        <button
          type="button"
          onClick={handleStart}
          disabled={!isConsentGiven}
          className="w-full min-h-[52px] rounded-2xl bg-[#6950A1] hover:bg-[#58418a] active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-purple-900/10 flex items-center justify-center transition-all disabled:opacity-40"
        >
          เริ่มทำแบบประเมิน
        </button>
      </div>

      <GuestNoticeModal
        isOpen={showGuestNotice}
        onClose={() => setShowGuestNotice(false)}
        onConfirm={() => {
          setShowGuestNotice(false);
          proceedToRun();
        }}
      />
    </div>
  );
}
