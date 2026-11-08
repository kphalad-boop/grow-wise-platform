'use client';

import React from 'react';
import Link from 'next/link';

interface GuestNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function GuestNoticeModal({
  isOpen,
  onClose,
  onConfirm,
}: GuestNoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4 ring-8 ring-amber-50/50">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          แจ้งเตือนการใช้งานโหมด Guest
        </h3>

        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 text-left mb-6">
          <p className="text-sm font-semibold text-amber-900 leading-relaxed text-center">
            &ldquo;การใช้งานโดยไม่สมัครสมาชิก ข้อมูลการประเมินจะไม่ถูกบันทึกในระบบ และผลการประเมินจะหายไปทันทีเมื่อปิดหน้าต่างนี้&rdquo;
          </p>
        </div>

        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          หากต้องการเก็บบันทึกประวัติพัฒนาการของน้อง เปรียบเทียบผลย้อนหลัง หรือแชร์ข้อมูลกับคุณครู แนะนำให้เข้าสู่ระบบก่อนทำแบบประเมิน
        </p>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#6950A1] hover:bg-[#58418a] active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-purple-900/10 transition-all"
          >
            รับทราบและเริ่มทำแบบประเมิน
          </button>

          <Link
            href="/login"
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-semibold text-sm text-center transition-all"
          >
            เข้าสู่ระบบ / สมัครสมาชิกก่อน
          </Link>

          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 mt-1 py-1"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
