'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { createClient } from '@/lib/supabase/client';

export default function AssessmentsCatalogPage() {
  const supabase = createClient();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | 'parent' | 'teacher'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAssessments() {
      setIsLoading(true);
      const { data } = await supabase
        .from('assessments')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: true });

      if (data) {
        setAssessments(data);
      }
      setIsLoading(false);
    }

    loadAssessments();
  }, []);

  const filtered = assessments.filter((a) => {
    if (roleFilter === 'all') return true;
    return a.target_roles?.includes(roleFilter);
  });

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="แบบประเมิน" subtitle="คัดกรองพัฒนาการและพฤติกรรม" />

      <div className="p-4 space-y-4 pb-12">
        {/* Role Filter Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setRoleFilter('all')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              roleFilter === 'all'
                ? 'bg-[#6950A1] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setRoleFilter('parent')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              roleFilter === 'parent'
                ? 'bg-[#6950A1] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สำหรับผู้ปกครอง
          </button>
          <button
            onClick={() => setRoleFilter('teacher')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              roleFilter === 'teacher'
                ? 'bg-[#6950A1] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สำหรับคุณครู
          </button>
        </div>

        {/* Assessments List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">กำลังโหลดแบบประเมิน...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">ไม่พบแบบประเมินในหมวดนี้</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/assessments/${item.code}`}
                className="block p-5 rounded-3xl bg-white border border-slate-100 hover:border-purple-200 shadow-card transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold tracking-wider text-[#6950A1] bg-purple-50 px-2 py-0.5 rounded-md uppercase">
                      {item.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 mt-1.5 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-[#F4F1FA] text-[#6950A1] flex items-center justify-center flex-shrink-0 ml-3">
                    ➔
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
                  <span>ช่วงอายุ: {Math.floor((item.min_age_months || 0) / 12)} - {Math.floor((item.max_age_months || 216) / 12)} ปี</span>
                  <span>•</span>
                  <span>เวอร์ชัน {item.current_version}.0</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
