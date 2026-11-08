import React from 'react';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  showBottomNavPadding?: boolean;
}

export function MobileContainer({
  children,
  className = '',
  showBottomNavPadding = true,
}: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-[#FAF9FD] w-full flex justify-center items-start">
      <div
        className={`w-full max-w-5xl bg-white min-h-screen overflow-x-hidden flex flex-col relative ${
          showBottomNavPadding ? 'pb-24' : ''
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
