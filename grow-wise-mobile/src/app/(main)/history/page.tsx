'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { createClient } from '@/lib/supabase/client';

export default function HistoryPage() {
  const supabase = createClient();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsGuest(true);
        setIsLoading(false);
        return;
      }

      // RLS ensures only accessible child submissions are returned
      const { data } = await supabase
        .from('submissions')
        .select('id, created_at, calculated_scores, interpretation_result, assessments(code, title), children(first_name, nickname)')
        .order('created_at', { ascending: false });

      if (data) {
        setSubmissions(data);
      }
      setIsLoading(false);
    }

    loadHistory();
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="ประวัติการประเมิน" subtitle="Grow Wise" />

      <div className="p-4 space-y-3 pb-12">
        {isGuest ? (
          <div className="p-6 text-center bg-white rounded-3xl border border-dashed border-amber-200">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              🔒
            </div>
            <h3 className="font-bold text-slate-800 text-sm">เข้าสู่ระบบเพื่อดูประวัติ</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 max-w-xs mx-auto">
              คุณกำลังอยู่ในโหมด Guest ข้อมูลประวัติการประเมินจะบันทึกเฉพาะเมื่อเข้าสู่ระบบเท่านั้น
            </p>
            <Link
              href="/login"
              className="inline-block py-2.5 px-6 rounded-2xl bg-[#6950A1] text-white text-xs font-semibold shadow-md"
            >
              เข้าสู่ระบบตอนนี้
            </Link>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">กำลังโหลดประวัติการประเมิน...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm">ยังไม่มีประวัติการส่งแบบประเมิน</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              เริ่มต้นประเมินเพื่อติดตามและบันทึกพัฒนาการของน้อง
            </p>
            <Link
              href="/assessments"
              className="inline-block py-2.5 px-5 rounded-2xl bg-[#6950A1] text-white text-xs font-semibold shadow-md"
            >
              เลือกแบบประเมิน
            </Link>
          </div>
        ) : (
          submissions.map((sub) => {
            const dateStr = new Date(sub.created_at).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const childName = sub.children?.nickname || sub.children?.first_name || 'ไม่ระบุชื่อเด็ก';

            return (
              <Link
                key={sub.id}
                href={`/assessments/${sub.assessments?.code}/result?submissionId=${sub.id}`}
                className="block p-4 rounded-3xl bg-white border border-slate-100 hover:border-purple-200 shadow-card transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#6950A1] bg-purple-50 px-2 py-0.5 rounded-md uppercase">
                      {sub.assessments?.code}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1">
                      น้อง{childName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {sub.assessments?.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 font-medium">{dateStr}</span>
                    <span className="block mt-1 text-xs font-bold text-[#6950A1]">
                      คะแนน {sub.calculated_scores?.total_score || 0}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
