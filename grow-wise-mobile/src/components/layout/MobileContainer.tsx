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
    <div className="min-h-screen bg-slate-100 flex justify-center items-start sm:py-6">
      {/* Mobile viewport frame: centered max-w-md on desktop, full width on mobile */}
      <div
        className={`w-full max-w-md bg-white min-h-screen sm:min-h-[844px] sm:rounded-[2.5rem] sm:shadow-2xl sm:border sm:border-slate-200/80 overflow-x-hidden flex flex-col relative ${
          showBottomNavPadding ? 'pb-24' : ''
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
