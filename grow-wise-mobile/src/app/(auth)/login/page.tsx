'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { TopBar } from '@/components/layout/TopBar';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message === 'Invalid login credentials' 
          ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
          : error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
    } catch {
      setErrorMessage('ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
    }
  };

  return (
    <MobileContainer showBottomNavPadding={false} className="bg-white">
      <TopBar showBack title="เข้าสู่ระบบ" subtitle="Grow Wise" />

      <div className="flex-1 px-6 pt-6 pb-8 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">ยินดีต้อนรับกลับมา</h2>
            <p className="text-xs text-slate-500 mt-1">
              เข้าสู่ระบบเพื่อติดตามประวัติและพัฒนาการของน้องอย่างต่อเนื่อง
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                อีเมล
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#6950A1] focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                รหัสผ่าน
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#6950A1] focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-[#6950A1] hover:bg-[#58418a] active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-purple-900/10 flex items-center justify-center transition-all disabled:opacity-60 mt-2"
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400">หรือ</span>
            </div>
          </div>

          <Link
            href="/register"
            className="w-full h-12 rounded-2xl bg-white hover:bg-purple-50 active:scale-[0.98] border border-[#6950A1] text-[#6950A1] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            สมัครสมาชิกใหม่
          </Link>
        </div>

        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => alert('กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน หรือตรวจสอบอีเมลที่ใช้สมัคร')}
            className="text-xs text-[#6950A1] font-semibold hover:underline"
          >
            ลืมรหัสผ่าน?
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}
