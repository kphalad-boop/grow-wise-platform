import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        growwise: {
          primary: '#6950A1',       // ม่วงเข้มหลัก
          secondary: '#8672B2',     // ม่วงอ่อน
          dark: '#4D3678',          // ม่วงโทนเข้มพิเศษ
          light: '#F4F1FA',         // พื้นหลังม่วงอ่อนนวล
          accent: '#A794D4',        // ไฮไลต์
          surface: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-sans-thai)', 'Noto Sans Thai', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(105, 80, 161, 0.08)',
        card: '0 2px 12px 0 rgba(0, 0, 0, 0.04)',
        nav: '0 -4px 16px -1px rgba(105, 80, 161, 0.06)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
