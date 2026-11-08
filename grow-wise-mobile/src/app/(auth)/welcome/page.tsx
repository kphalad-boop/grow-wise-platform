'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { GuestNoticeModal } from '@/components/modals/GuestNoticeModal';

export default function WelcomePage() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [showGuestNotice, setShowGuestNotice] = useState(false);

  const slides = [
    {
      title: 'เติบโตอย่างเข้าใจ ในทุกก้าว',
      subtitle: 'เครื่องมือประเมินพัฒนาการและพฤติกรรมเด็กตามเกณฑ์มาตรฐานทางการแพทย์',
      icon: (
        <svg className="w-16 h-16 text-[#6950A1]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'คัดกรองพฤติกรรม SNAP-IV',
      subtitle: 'คัดกรองภาวะสมาธิสั้น ซนอยู่ไม่นิ่ง และพฤติกรรมดื้อต่อต้านอย่างแม่นยำ',
      icon: (
        <svg className="w-16 h-16 text-[#6950A1]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'สำรวจ Sensory Processing',
      subtitle: 'ทำความเข้าใจระบบประสาทรับความรู้สึกทั้ง 7 ด้าน เพื่อส่งเสริมศักยภาพของน้อง',
      icon: (
        <svg className="w-16 h-16 text-[#6950A1]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  const handleConfirmGuest = () => {
    setShowGuestNotice(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gw_guest_mode', 'true');
    }
    router.push('/assessments');
  };

  return (
    <MobileContainer showBottomNavPadding={false} className="justify-between p-6 bg-gradient-to-b from-white via-[#F4F1FA] to-white">
      {/* Brand Header */}
      <div className="pt-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#6950A1] to-[#8672B2] flex items-center justify-center shadow-lg shadow-purple-900/15 mb-4">
          <span className="text-white font-extrabold text-3xl tracking-tighter">GW</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#6950A1] tracking-tight">
          Grow Wise
        </h1>
        <p className="text-xs font-semibold text-slate-500 tracking-wide mt-1">
          เติบโตอย่างเข้าใจ ในทุกก้าว
        </p>
      </div>

      {/* Onboarding Carousel Slide */}
      <div className="my-auto py-6 flex flex-col items-center text-center px-2">
        <div className="w-28 h-28 rounded-full bg-white shadow-soft flex items-center justify-center mb-6 border border-purple-50">
          {slides[activeSlide].icon}
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {slides[activeSlide].title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
          {slides[activeSlide].subtitle}
        </p>

        {/* Carousel Indicators */}
        <div className="flex gap-2 mt-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeSlide === idx ? 'w-6 bg-[#6950A1]' : 'w-2 bg-slate-200'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3 pb-6">
        <Link
          href="/login"
          className="w-full min-h-[52px] rounded-2xl bg-[#6950A1] hover:bg-[#58418a] active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-purple-900/10 flex items-center justify-center transition-all"
        >
          เข้าสู่ระบบ
        </Link>

        <Link
          href="/register"
          className="w-full min-h-[52px] rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.98] text-[#6950A1] font-semibold text-sm border-2 border-purple-100 flex items-center justify-center transition-all"
        >
          สมัครสมาชิกใหม่
        </Link>

        <button
          onClick={() => setShowGuestNotice(true)}
          className="w-full py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors text-center"
        >
          ใช้งานโดยไม่สมัครสมาชิก (Guest Mode)
        </button>
      </div>

      {/* Guest Notice Modal */}
      <GuestNoticeModal
        isOpen={showGuestNotice}
        onClose={() => setShowGuestNotice(false)}
        onConfirm={handleConfirmGuest}
      />
    </MobileContainer>
  );
}
