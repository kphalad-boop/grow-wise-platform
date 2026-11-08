-- ==============================================================================
-- GROWWISE PLATFORM - COMPLETE SUPABASE DATABASE SETUP & REALTIME SYNC
-- Run this script in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Project: https://supabase.com/dashboard/project/qjocagwfzazcgzqnyhux/sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CORE TABLES

-- Table 1: users / profiles
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'parent',
    organization TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 2: children
CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nickname TEXT,
    birth_date DATE NOT NULL,
    gender TEXT DEFAULT 'unspecified',
    school_name TEXT,
    grade_level TEXT,
    special_needs_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 3: assessments
CREATE TABLE IF NOT EXISTS public.assessments (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    min_age_months INTEGER NOT NULL DEFAULT 0,
    max_age_months INTEGER NOT NULL DEFAULT 216,
    target_roles TEXT[] NOT NULL DEFAULT ARRAY['parent', 'teacher'],
    status TEXT NOT NULL DEFAULT 'published',
    current_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 4: assessment_versions
CREATE TABLE IF NOT EXISTS public.assessment_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id TEXT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'published',
    schema_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    rules_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(assessment_id, version_number)
);

-- Table 5: submissions / results
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id TEXT,
    assessment_version_id UUID,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    respondent_id TEXT,
    respondent_role TEXT NOT NULL DEFAULT 'parent',
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    calculated_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    interpretation_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    overall_status TEXT NOT NULL DEFAULT 'normal',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 6: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    user_name TEXT,
    user_role TEXT,
    target_resource TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS) WITH OPEN POLICIES FOR REALTIME SYNC
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public access users" ON public.users;
    CREATE POLICY "Public access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access children" ON public.children;
    CREATE POLICY "Public access children" ON public.children FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access assessments" ON public.assessments;
    CREATE POLICY "Public access assessments" ON public.assessments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access assessment_versions" ON public.assessment_versions;
    CREATE POLICY "Public access assessment_versions" ON public.assessment_versions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access submissions" ON public.submissions;
    CREATE POLICY "Public access submissions" ON public.submissions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access audit_logs" ON public.audit_logs;
    CREATE POLICY "Public access audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN others THEN null;
END $$;

-- 4. ENABLE REALTIME REPLICATION (CROSS-DEVICE BROADCAST & SYNC)
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.children;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assessments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_versions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
EXCEPTION WHEN others THEN null;
END $$;

-- 5. INITIAL STANDARD MEDICAL SCREENING INSTRUMENTS (KUS-SI 1-5 & SNAP-IV)
INSERT INTO public.assessments (id, code, title, description, min_age_months, max_age_months, target_roles, status, current_version)
VALUES
    ('asm_kus_si_1', 'KUS-SI 1', 'แบบคัดกรองบุคคลที่มีปัญหาทางการเรียนรู้และพฤติกรรม (พฤติกรรมสมาธิสั้น)', 'คัดกรองพฤติกรรมสมาธิสั้น ซนอยู่ไม่นิ่ง และหุนหันพลันแล่น (ADHD) ช่วงอายุ 6-12 ปี', 72, 155, ARRAY['parent', 'teacher'], 'published', 1),
    ('asm_kus_si_2', 'KUS-SI 2', 'แบบคัดกรองบุคคลที่มีปัญหาทางการเรียนรู้ (LD - ด้านการอ่าน การเขียน และคณิตศาสตร์)', 'คัดกรองความบกพร่องทางการเรียนรู้ 3 ด้านสำคัญ: การอ่าน การเขียน และการคำนวณ ช่วงอายุ 6-12 ปี', 72, 155, ARRAY['parent', 'teacher'], 'published', 1),
    ('asm_kus_si_3', 'KUS-SI 3', 'แบบคัดกรองบุคคลที่มีความบกพร่องทางออทิสติก (Autism Spectrum)', 'คัดกรองพฤติกรรมด้านการสื่อสาร ปฏิสัมพันธ์ทางสังคม และพฤติกรรมซ้ำๆ ช่วงอายุ 6-12 ปี', 72, 155, ARRAY['parent', 'teacher'], 'published', 1),
    ('asm_kus_si_4', 'KUS-SI 4', 'แบบคัดกรองบุคคลที่มีปัญหาทางพฤติกรรมและอารมณ์ (Emotional & Behavioral)', 'คัดกรองภาวะวิตกกังวล อารมณ์ซึมเศร้า และพฤติกรรมก้าวร้าวต่อต้าน ช่วงอายุ 6-12 ปี', 72, 155, ARRAY['parent', 'teacher'], 'published', 1),
    ('asm_kus_si_5', 'KUS-SI 5', 'แบบคัดกรองบุคคลที่มีความบกพร่องทางสติปัญญาและพัฒนาการล่าช้า (Intellectual / DSPM Extended)', 'คัดกรองทักษะการปรับตัว ความสามารถทางสติปัญญาและพัฒนาการสมวัย ช่วงอายุ 6-12 ปี', 72, 155, ARRAY['parent', 'teacher'], 'published', 1),
    ('asm_snap_iv', 'SNAP-IV', 'แบบประเมินพฤติกรรมสมาธิสั้น SNAP-IV (26 ข้อ)', 'แบบประเมินมาตรฐานพฤติกรรมสมาธิสั้น ซนอยู่ไม่นิ่ง และพฤติกรรมดื้อต่อต้าน', 60, 216, ARRAY['parent', 'teacher', 'specialist'], 'published', 1)
ON CONFLICT (code) DO NOTHING;
