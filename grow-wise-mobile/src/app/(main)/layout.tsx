import React from 'react';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { BottomNav } from '@/components/layout/BottomNav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileContainer showBottomNavPadding={true}>
      <main className="flex-1 flex flex-col">{children}</main>
      <BottomNav />
    </MobileContainer>
  );
}
