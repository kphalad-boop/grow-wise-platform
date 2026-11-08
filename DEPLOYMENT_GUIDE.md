# คู่มือการเผยแพร่และติดตั้งบน Vercel (Deployment Guide)
**แพลตฟอร์ม GrowWise — เติบโตอย่างเข้าใจ ในทุกก้าว**

---

## 1. การแยก 2 เว็บแอปพลิเคชันบน Vercel (Dual-Project Architecture)

ตามข้อกำหนดใน Master Prompt:
> **"ทั้งสองส่วนต้องมี URL แยกกันชัดเจน แต่ใช้ระบบบัญชี ฐานข้อมูลเด็ก แบบประเมิน เกณฑ์ และผลประเมินชุดเดียวกัน"**

แนะนำให้สร้าง **2 Projects แยกกันบน Vercel** ภายใต้ Git Repository เดียวกัน (Monorepo):

```
┌───────────────────────────────────────┐    ┌───────────────────────────────────────┐
│        Vercel Project 1: User         │    │        Vercel Project 2: Admin        │
│   Domain: user.growwise.app / .vercel │    │   Domain: admin.growwise.app / .vercel│
│   Root Directory: apps/user-web       │    │   Root Directory: apps/admin-web      │
└───────────────────┬───────────────────┘    └───────────────────┬───────────────────┘
                    │                                            │
                    └─────────────────────┬──────────────────────┘
                                          ▼
                       ┌─────────────────────────────────────┐
                       │   Shared Backend & Database Layer   │
                       │   (Supabase PostgreSQL หรือ Firebase)│
                       └─────────────────────────────────────┘
```

---

## 2. ขั้นตอนการตั้งค่า Vercel ทีละโปรเจกต์ (Step-by-Step)

### โปรเจกต์ที่ 1: GrowWise User Web App (สำหรับผู้ปกครองและคุณครู)
1. เข้าสู่ [Vercel Dashboard](https://vercel.com) และกด **Add New... → Project**
2. เลือก Git Repository ของ GrowWise
3. ในส่วน **Project Settings**:
   - **Project Name:** `growwise-user-app`
   - **Framework Preset:** `Other` (หรือ Static HTML)
   - **Root Directory:** คลิก Edit และเลือก `apps/user-web`
4. ในส่วน **Environment Variables** เพิ่มตัวแปร:
   - `NEXT_PUBLIC_APP_ENV`: `production`
   - `NEXT_PUBLIC_API_URL`: URL ของ Backend หรือ API Gateway
   - *(เมื่อเลือก Supabase)*:
     - `NEXT_PUBLIC_SUPABASE_URL`: `https://[PROJECT_ID].supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `[PUBLIC_ANON_KEY]`
5. กด **Deploy** และตั้งค่า Custom Domain เช่น `user.growwise.app`

---

### โปรเจกต์ที่ 2: GrowWise Admin (สำหรับแพทย์และผู้ดูแลระบบ)
1. ใน Vercel Dashboard กด **Add New... → Project**
2. เลือก Repository เดียวกันอีกครั้ง
3. ในส่วน **Project Settings**:
   - **Project Name:** `growwise-admin-portal`
   - **Root Directory:** คลิก Edit และเลือก `apps/admin-web`
4. ในส่วน **Environment Variables** เพิ่มตัวแปร:
   - `NEXT_PUBLIC_APP_ENV`: `production`
   - `ADMIN_ACCESS_RESTRICTED`: `true`
   - *(เมื่อเลือก Supabase)*:
     - `NEXT_PUBLIC_SUPABASE_URL`: `https://[PROJECT_ID].supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `[PUBLIC_ANON_KEY]`
     - `SUPABASE_SERVICE_ROLE_KEY`: `[SERVICE_ROLE_KEY_SECRET]` *(สำหรับ Serverless Functions เท่านั้น ห้ามส่งไป Browser)*
5. กด **Deploy** และตั้งค่า Custom Domain เช่น `admin.growwise.app`

---

## 3. รายการ Environment Variables ทั้งหมด (แยกตามสภาพแวดล้อม)

| ตัวแปร (Variable Name) | คำอธิบาย | Development (Local) | Production (Vercel) | ฝั่งที่เข้าถึงได้ |
|---|---|---|---|---|
| `USER_PORT` | พอร์ต User Web App | `3000` | - | Server-only |
| `ADMIN_PORT` | พอร์ต Admin Web App | `3001` | - | Server-only |
| `DATA_BACKEND` | ตัวเลือกฐานข้อมูล (`mock`/`supabase`/`firebase`) | `mock` | `supabase` หรือ `firebase` | Server-only |
| `NEXT_PUBLIC_SUPABASE_URL` | Endpoint ของ Supabase | - | `https://xxxx.supabase.co` | Browser & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anonymous API Key | - | `eyJhbGci...` | Browser & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Private Service Role Key | - | `eyJhbGci...` | **Server-only (Secret)** |
| `FIREBASE_PROJECT_ID` | Project ID ของ Google Firebase | - | `grow-wise-platform` | Browser & Server |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK Service Account Email | - | `firebase-adminsdk@...` | **Server-only (Secret)** |
| `FIREBASE_PRIVATE_KEY` | Admin SDK Private Key | - | `"-----BEGIN..."` | **Server-only (Secret)** |

> [!CAUTION]
> **กฎความปลอดภัยเคร่งครัด (Cybersecurity Rules):**
> 1. ห้ามใส่ Secret Keys (`SUPABASE_SERVICE_ROLE_KEY`, `FIREBASE_PRIVATE_KEY`) ในโค้ดหน้าบ้านเด็ดขาด
> 2. รหัสผ่าน `admin0100` มีไว้เพื่อการทดสอบในเครื่องเท่านั้น ห้ามตั้งรหัสนี้บน Production โดยเด็ดขาด

---

## 4. ขั้นตอนการตั้งค่าฐานข้อมูลจริงเมื่อเลือกผู้ให้บริการ

### หากเลือก Supabase:
1. สร้างโปรเจกต์ใหม่ใน [Supabase Dashboard](https://supabase.com)
2. ไปที่ **SQL Editor** และคัดลอกคำสั่งจากไฟล์:
   ```
   packages/shared/supabase_schema.sql
   ```
3. กด **Run** เพื่อสร้างตารางทั้งหมด, Custom Types, และนโยบาย **Row-Level Security (RLS)**
4. ไปที่ **Project Settings → API** และคัดลอก `URL` และ `anon key` ไปใส่ใน Vercel Environment Variables

### หากเลือก Firebase:
1. สร้างโปรเจกต์ใน [Firebase Console](https://console.firebase.google.com)
2. เปิดใช้งาน **Firestore Database** และ **Authentication** (เปิด Email/Password และ Google Sign-In)
3. ไปที่แท็บ **Rules** ของ Firestore และวางเนื้อหาจาก:
   ```
   packages/shared/firebase_rules.json
   ```
4. กด **Publish** เพื่อเปิดใช้งาน Security Rules แบบปฏิเสธโดยค่าเริ่มต้น (Deny-by-default)
