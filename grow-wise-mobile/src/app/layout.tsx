import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';
import './globals.css';

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-sans-thai',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Grow Wise — เติบโตอย่างเข้าใจ ในทุกก้าว',
  description: 'แพลตฟอร์มคัดกรองและประเมินพัฒนาการเด็ก เพื่อความเข้าใจและส่งเสริมศักยภาพอย่างตรงจุด',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Grow Wise',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={notoSansThai.variable}>
      <body className="font-sans antialiased text-slate-900 bg-slate-100 selection:bg-purple-100 selection:text-[#6950A1]">
        {children}
      </body>
    </html>
  );
}
