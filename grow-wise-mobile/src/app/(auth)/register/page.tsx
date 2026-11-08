'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { TopBar } from '@/components/layout/TopBar';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/types/database.types';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [role, setRole] = useState<'parent' | 'teacher'>('parent');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
            phone_number: phone || null,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setErrorMessage('เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileContainer showBottomNavPadding={false} className="bg-white">
      <TopBar showBack title="สมัครสมาชิก" subtitle="Grow Wise" />

      <div className="flex-1 px-6 pt-4 pb-8 flex flex-col justify-between">
        <div>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-800">สร้างบัญชีผู้ใช้ใหม่</h2>
            <p className="text-xs text-slate-500 mt-1">
              ร่วมเป็นส่วนหนึ่งในการดูแลและเข้าใจพัฒนาการของเด็กไปด้วยกัน
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Role Selection Segmented Control */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              บทบาทของคุณ
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setRole('parent')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'parent'
                    ? 'bg-[#6950A1] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ผู้ปกครอง (Parent)
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'teacher'
                    ? 'bg-[#6950A1] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                คุณครู (Teacher)
              </button>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ - นามสกุล
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="สมศรี ใจดี"
                className="w-full h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#6950A1] focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อีเมล
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="somsri@example.com"
                className="w-full h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#6950A1] focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ (ไม่บังคับ)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812345678"
                className="w-full h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#6950A1] focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#6950A1] focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-[#6950A1] hover:bg-[#58418a] active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-purple-900/10 flex items-center justify-center transition-all disabled:opacity-60 mt-4"
            >
              {isLoading ? 'กำลังสร้างบัญชี...' : 'ยืนยันการสมัครสมาชิก'}
            </button>
          </form>
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-slate-500">
            มีบัญชีผู้ใช้อยู่แล้ว?{' '}
            <Link href="/login" className="text-[#6950A1] font-bold hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </MobileContainer>
  );
}
