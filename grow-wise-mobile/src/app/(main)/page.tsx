'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { createClient } from '@/lib/supabase/client';
import { calculateChildAge, ChildAge } from '@/lib/utils/age';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  birth_date: string;
  gender: string | null;
}

export default function HomePage() {
  const supabase = createClient();
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [childAge, setChildAge] = useState<ChildAge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsGuest(true);
        setIsLoading(false);
        return;
      }

      // Fetch accessible children (RLS automatically filters by child_access_grants)
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && (data as any[]).length > 0) {
        const list = data as unknown as Child[];
        setChildren(list);
        setActiveChild(list[0]);
        setChildAge(calculateChildAge(list[0].birth_date));
      }
      setIsLoading(false);
    }

    loadData();
  }, []);

  const handleSelectChild = (child: Child) => {
    setActiveChild(child);
    setChildAge(calculateChildAge(child.birth_date));
  };

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Grow Wise"
        subtitle="เติบโตอย่างเข้าใจ ในทุกก้าว"
        rightAction={
          !isGuest ? (
            <Link
              href="/children"
              className="text-xs font-semibold text-[#6950A1] bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
            >
              + จัดการเด็ก
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold text-white bg-[#6950A1] px-3.5 py-1.5 rounded-full hover:bg-[#58418a] transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          )
        }
      />

      <div className="p-4 space-y-4">
        {/* Guest Mode Notice Banner */}
        {isGuest && (
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>โหมด Guest (ไม่บันทึกข้อมูล)</span>
            </div>
            <Link href="/login" className="font-bold text-[#6950A1] hover:underline">
              เข้าสู่ระบบ ➔
            </Link>
          </div>
        )}

        {/* Active Child Profile Card (For Logged-in Users) */}
        {!isGuest && activeChild && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#6950A1] to-[#8672B2] text-white shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg text-white">
                  {activeChild.nickname ? activeChild.nickname[0] : activeChild.first_name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    น้อง{activeChild.nickname || activeChild.first_name}
                  </h3>
                  <p className="text-xs text-purple-100 mt-0.5">
                    {activeChild.first_name} {activeChild.last_name}
                  </p>
                </div>
              </div>

              {childAge && (
                <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl text-right">
                  <span className="text-[10px] text-purple-100 block">อายุปัจจุบัน</span>
                  <span className="text-xs font-bold">{childAge.formattedText}</span>
                </div>
              )}
            </div>

            {/* Child Switcher Chips */}
            {children.length > 1 && (
              <div className="flex gap-2 pt-2 border-t border-white/10 overflow-x-auto no-scrollbar">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleSelectChild(child)}
                    className={`text-xs px-2.5 py-1 rounded-xl transition-all ${
                      activeChild.id === child.id
                        ? 'bg-white text-[#6950A1] font-bold shadow-sm'
                        : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                  >
                    น้อง{child.nickname || child.first_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty Child State (Logged-in but no children added) */}
        {!isGuest && !activeChild && !isLoading && (
          <div className="p-5 rounded-3xl bg-white border border-purple-100 text-center shadow-card">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#6950A1] flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h4 className="font-bold text-slate-800 text-sm">ยังไม่มีข้อมูลเด็กในระบบ</h4>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              เพิ่มข้อมูลน้องเพื่อเริ่มทำแบบประเมินและติดตามพัฒนาการตามเกณฑ์อายุ
            </p>
            <Link
              href="/children"
              className="inline-flex py-2 px-4 rounded-xl bg-[#6950A1] text-white text-xs font-semibold shadow-sm hover:bg-[#58418a]"
            >
              + เพิ่มโปรไฟล์เด็ก
            </Link>
          </div>
        )}

        {/* Featured Assessments Section */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-bold text-sm text-slate-800">แบบประเมินแนะนำ</h3>
            <Link href="/assessments" className="text-xs text-[#6950A1] font-semibold hover:underline">
              ดูทั้งหมด ➔
            </Link>
          </div>

          <div className="space-y-3">
            {/* SNAP-IV Card */}
            <Link
              href="/assessments/SNAP-IV"
              className="block p-4 rounded-3xl bg-white border border-slate-100 hover:border-purple-200 shadow-card transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-[#6950A1] bg-purple-50 px-2 py-0.5 rounded-md uppercase">
                    SNAP-IV (Short Form)
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mt-1.5">
                    แบบคัดกรองพฤติกรรมสมาธิสั้น (26 ข้อ)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    ประเมินอาการขาดสมาธิ พฤติกรรมซนอยู่ไม่นิ่ง และพฤติกรรมดื้อต่อต้าน
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#F4F1FA] text-[#6950A1] flex items-center justify-center flex-shrink-0 ml-3">
                  ➔
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
                <span>⏱ ~5-10 นาที</span>
                <span>•</span>
                <span>ผู้ปกครองและครู</span>
                <span>•</span>
                <span>อายุ 4-18 ปี</span>
              </div>
            </Link>

            {/* Sensory Processing Card */}
            <Link
              href="/assessments/SENSORY"
              className="block p-4 rounded-3xl bg-white border border-slate-100 hover:border-purple-200 shadow-card transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-[#6950A1] bg-purple-50 px-2 py-0.5 rounded-md uppercase">
                    Sensory Processing
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mt-1.5">
                    แบบประเมินการประมวลความรู้สึก (7 ด้าน)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    สำรวจการตอบสนองต่อแสง เสียง สัมผัส การเคลื่อนไหว และการทรงตัว
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#F4F1FA] text-[#6950A1] flex items-center justify-center flex-shrink-0 ml-3">
                  ➔
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
                <span>⏱ ~15-20 นาที</span>
                <span>•</span>
                <span>ผู้ปกครองและครู</span>
                <span>•</span>
                <span>อายุ 3-15 ปี</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Grow Wise Mission Quote */}
        <div className="p-4 rounded-3xl bg-purple-50/50 border border-purple-100/50 text-center">
          <p className="text-xs italic text-slate-600 font-medium">
            &ldquo;เข้าใจก่อนแก้ไข ส่งเสริมตรงจุด พัฒนาการของลูกก้าวหน้าได้ทุกวัน&rdquo;
          </p>
          <span className="text-[10px] text-[#6950A1] font-bold block mt-1">
            — Grow Wise Platform
          </span>
        </div>
      </div>
    </div>
  );
}
