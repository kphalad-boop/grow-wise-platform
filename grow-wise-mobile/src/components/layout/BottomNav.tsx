'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'หน้าแรก',
      href: '/',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${active ? 'text-[#6950A1]' : 'text-slate-400'}`}
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={active ? 1.5 : 2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: 'แบบประเมิน',
      href: '/assessments',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${active ? 'text-[#6950A1]' : 'text-slate-400'}`}
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={active ? 1.5 : 2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      label: 'ประวัติ',
      href: '/history',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${active ? 'text-[#6950A1]' : 'text-slate-400'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: 'บัญชี',
      href: '/account',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 transition-colors ${active ? 'text-[#6950A1]' : 'text-slate-400'}`}
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={active ? 1.5 : 2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-lg border-t border-slate-100 shadow-nav px-3 py-2 pointer-events-auto sm:rounded-b-[2.5rem]">
        <div className="grid grid-cols-4 items-center">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 active:scale-95 min-h-[50px] ${
                  isActive ? 'bg-purple-50/80' : 'hover:bg-slate-50'
                }`}
              >
                {item.icon(isActive)}
                <span
                  className={`text-[11px] font-medium mt-1 tracking-tight ${
                    isActive ? 'text-[#6950A1] font-bold' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
