'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { createClient } from '@/lib/supabase/client';
import { calculateChildAge } from '@/lib/utils/age';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  birth_date: string;
  gender: string | null;
  created_at: string;
}

export default function ChildrenPage() {
  const supabase = createClient();
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unspecified'>('unspecified');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchChildren = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setChildren(data as unknown as Child[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg('กรุณาเข้าสู่ระบบก่อนเพิ่มข้อมูลเด็ก');
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from('children')
      .insert({
        first_name: firstName,
        last_name: lastName,
        nickname: nickname || null,
        birth_date: birthDate,
        gender,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      setErrorMsg(error.message);
    } else {
      setShowAddModal(false);
      setFirstName('');
      setLastName('');
      setNickname('');
      setBirthDate('');
      fetchChildren();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        showBack
        title="จัดการข้อมูลเด็ก"
        subtitle="Grow Wise"
        rightAction={
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold text-white bg-[#6950A1] hover:bg-[#58418a] px-3.5 py-1.5 rounded-full transition-all"
          >
            + เพิ่มเด็ก
          </button>
        }
      />

      <div className="p-4 space-y-3 pb-12">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">กำลังโหลดข้อมูลเด็ก...</div>
        ) : children.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-[#6950A1] flex items-center justify-center mx-auto mb-3">
              👶
            </div>
            <h3 className="font-bold text-slate-800 text-sm">ยังไม่มีข้อมูลเด็กในระบบ</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 max-w-xs mx-auto">
              เพิ่มข้อมูลของน้องเพื่อเริ่มต้นทำแบบประเมินและติดตามผลพัฒนาการ
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="py-2.5 px-5 rounded-2xl bg-[#6950A1] text-white text-xs font-semibold shadow-md"
            >
              + เพิ่มข้อมูลเด็กคนแรก
            </button>
          </div>
        ) : (
          children.map((child) => {
            const ageInfo = calculateChildAge(child.birth_date);
            return (
              <div
                key={child.id}
                className="p-4 rounded-3xl bg-white border border-slate-100 shadow-card flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4F1FA] text-[#6950A1] font-bold text-base flex items-center justify-center">
                    {child.nickname ? child.nickname[0] : child.first_name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      น้อง{child.nickname || child.first_name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {child.first_name} {child.last_name}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-[#8672B2] bg-purple-50 px-2 py-0.5 rounded-md">
                      อายุ {ageInfo.formattedText}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  <span>{new Date(child.birth_date).toLocaleDateString('th-TH')}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">เพิ่มข้อมูลเด็ก</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddChild} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อจริง *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="เช่น ด.ช. ธนกร"
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  นามสกุล *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="เช่น สิทธิโชค"
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อเล่น
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="เช่น น้องนนท์"
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วันเกิด *
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เพศ
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                >
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="unspecified">ไม่ระบุ</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-11 rounded-2xl bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-2xl bg-[#6950A1] text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
