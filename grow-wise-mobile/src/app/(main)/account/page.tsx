'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { createClient } from '@/lib/supabase/client';

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState<string>('');
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsGuest(true);
        setIsLoading(false);
        return;
      }

      setEmail(user.email || '');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
      setIsLoading(false);
    }

    loadProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/welcome');
    router.refresh();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'parent': return 'ผู้ปกครอง (Parent)';
      case 'teacher': return 'คุณครู (Teacher)';
      case 'specialist': return 'ผู้เชี่ยวชาญ (Specialist)';
      case 'admin': return 'ผู้ดูแลระบบ (Admin)';
      case 'super_admin': return 'Super Admin';
      default: return role;
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="บัญชีผู้ใช้งาน" subtitle="Grow Wise" />

      <div className="p-4 space-y-4 pb-12">
        {isGuest ? (
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-card text-center">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-[#6950A1] flex items-center justify-center mx-auto mb-3 font-bold text-xl">
              ?
            </div>
            <h3 className="font-bold text-slate-800 text-base">โหมดผู้เยี่ยมชม (Guest)</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              เข้าสู่ระบบเพื่อบันทึกข้อมูลเด็ก จัดการสิทธิ์การเข้าถึง และดูประวัติการประเมิน
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full py-3 rounded-2xl bg-[#6950A1] text-white text-xs font-semibold shadow-md"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="w-full py-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                สมัครสมาชิก
              </Link>
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">กำลังโหลดข้อมูลบัญชี...</div>
        ) : (
          <>
            {/* User Info Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-card flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#6950A1] text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-purple-900/10">
                {profile?.full_name ? profile.full_name[0] : 'U'}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  {profile?.full_name || 'สมาชิก Grow Wise'}
                </h3>
                <p className="text-xs text-slate-400">{email}</p>
                <span className="inline-block mt-1 text-[11px] font-bold text-[#6950A1] bg-purple-50 px-2.5 py-0.5 rounded-full">
                  {getRoleLabel(profile?.role || 'parent')}
                </span>
              </div>
            </div>

            {/* Account Navigation Links */}
            <div className="rounded-3xl bg-white border border-slate-100 shadow-card divide-y divide-slate-50 overflow-hidden">
              <Link
                href="/children"
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">👶</span>
                  <span className="text-xs font-bold text-slate-700">จัดการข้อมูลเด็ก</span>
                </div>
                <span className="text-slate-400 text-sm">➔</span>
              </Link>

              <Link
                href="/history"
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📋</span>
                  <span className="text-xs font-bold text-slate-700">ประวัติการทำแบบประเมิน</span>
                </div>
                <span className="text-slate-400 text-sm">➔</span>
              </Link>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-semibold text-xs transition-all"
            >
              ออกจากระบบ
            </button>
          </>
        )}

        <div className="text-center pt-6 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-500">Grow Wise Platform v1.0.0</p>
          <p className="mt-0.5">เติบโตอย่างเข้าใจ ในทุกก้าว</p>
        </div>
      </div>
    </div>
  );
}
