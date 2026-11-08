'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export function TopBar({
  title = 'Grow Wise',
  subtitle = 'เติบโตอย่างเข้าใจ ในทุกก้าว',
  showBack = false,
  onBack,
  rightAction,
  transparent = false,
}: TopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-colors ${
        transparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              aria-label="ย้อนกลับ"
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-transform"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-[#6950A1]">
                {title}
              </span>
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {rightAction && <div className="flex items-center">{rightAction}</div>}
      </div>
    </header>
  );
}
