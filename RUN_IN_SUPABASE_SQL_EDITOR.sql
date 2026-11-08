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

-- 6. SNAP-IV VERSION 1 (26 ITEMS & 3 CLINICAL DOMAINS)
INSERT INTO public.assessment_versions (
    assessment_id,
    version_number,
    published_at,
    schema_definition,
    rules_definition
) VALUES (
    'asm_snap_iv',
    1,
    timezone('utc'::text, now()),
    '{
        "scale": [
            {"value": 0, "label": "ไม่เลย"},
            {"value": 1, "label": "เล็กน้อย"},
            {"value": 2, "label": "ค่อนข้างมาก"},
            {"value": 3, "label": "มาก"}
        ],
        "sections": [
            {"id": "inattentive", "title": "ขาดสมาธิ (Inattention)", "order": 1, "item_ids": ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"]},
            {"id": "hyperactivity", "title": "ซน/วู่วาม (Hyperactive)", "order": 2, "item_ids": ["q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18"]},
            {"id": "oppositional", "title": "ดื้อ/ต่อต้าน (Oppositional)", "order": 3, "item_ids": ["q19", "q20", "q21", "q22", "q23", "q24", "q25", "q26"]}
        ],
        "items": [
            {"id": "q1", "section_id": "inattentive", "number": 1, "text": "มักไม่ละเอียดรอบคอบหรือสะเพร่าในการทำงานต่างๆ เช่น การบ้าน", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q2", "section_id": "inattentive", "number": 2, "text": "ทำอะไรนานๆ ไม่ได้", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q3", "section_id": "inattentive", "number": 3, "text": "ดูเหมือนไม่ค่อยฟังเวลาที่มีคนพูดด้วย", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q4", "section_id": "inattentive", "number": 4, "text": "มักทำการบ้านไม่เสร็จ หรือทำงานที่ได้รับมอบหมายไม่สำเร็จ", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q5", "section_id": "inattentive", "number": 5, "text": "จัดระเบียบงานและกิจกรรมต่างๆ ไม่เป็น", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q6", "section_id": "inattentive", "number": 6, "text": "มักหลีกเลี่ยงกิจกรรมที่ต้องใช้ความอดทนในการทำให้สำเร็จ", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q7", "section_id": "inattentive", "number": 7, "text": "ทำของหายบ่อยๆ (เช่น ของเล่น สมุดจดงาน เครื่องเขียน)", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q8", "section_id": "inattentive", "number": 8, "text": "วอกแวกง่าย", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q9", "section_id": "inattentive", "number": 9, "text": "ขี้ลืม", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q10", "section_id": "hyperactivity", "number": 10, "text": "มือเท้ายุกยิก นั่งบิดไปมา", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q11", "section_id": "hyperactivity", "number": 11, "text": "นั่งไม่ติดที่ ชอบลุกจากที่นั่งในชั้นเรียน หรือจากที่ที่ควรจะนั่งเรียบร้อย", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q12", "section_id": "hyperactivity", "number": 12, "text": "วิ่งหรือปีนป่ายมากเกินควรอย่างไม่รู้กาลเทศะ", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q13", "section_id": "hyperactivity", "number": 13, "text": "เล่นหรือทำกิจกรรมเงียบๆ ไม่เป็น", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q14", "section_id": "hyperactivity", "number": 14, "text": "พร้อมจะเคลื่อนไหวอยู่เสมอเหมือนติดเครื่องอยู่ตลอดเวลา", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q15", "section_id": "hyperactivity", "number": 15, "text": "พูดมาก", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q16", "section_id": "hyperactivity", "number": 16, "text": "มักโพล่งคำตอบออกมาก่อนจะฟังคำถามจบ", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q17", "section_id": "hyperactivity", "number": 17, "text": "ไม่ชอบรอคิว", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q18", "section_id": "hyperactivity", "number": 18, "text": "ชอบสอดแทรกผู้อื่น เช่น ชอบพูดแทรกขณะผู้ใหญ่กำลังสนทนากัน", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q19", "section_id": "oppositional", "number": 19, "text": "อารมณ์เสียง่าย", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q20", "section_id": "oppositional", "number": 20, "text": "ชอบโต้เถียงกับผู้ใหญ่", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q21", "section_id": "oppositional", "number": 21, "text": "ไม่ยอมทำตามสิ่งที่ผู้ใหญ่สั่งหรือวางกฎเกณฑ์ไว้", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q22", "section_id": "oppositional", "number": 22, "text": "จงใจก่อกวนผู้อื่น", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q23", "section_id": "oppositional", "number": 23, "text": "มักตำหนิผู้อื่นในสิ่งที่ตนเองทำผิด", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q24", "section_id": "oppositional", "number": 24, "text": "ขี้รำคาญ", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q25", "section_id": "oppositional", "number": 25, "text": "โกรธหรือบึ้งตึงเป็นประจำ", "question_type": "single_choice", "max_score": 3, "reverse_scored": false},
            {"id": "q26", "section_id": "oppositional", "number": 26, "text": "เจ้าคิดเจ้าแค้น", "question_type": "single_choice", "max_score": 3, "reverse_scored": false}
        ]
    }'::jsonb,
    '{
        "cutoff_mode": "domain",
        "scoring_method": "domain_sum",
        "domains": [
            {
                "domain_id": "inattentive",
                "title_th": "ขาดสมาธิ (Inattention)",
                "item_ids": ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"],
                "max_possible_raw_score": 27,
                "cutoffs": [
                    {"min_score": 0, "max_score": 15, "result_level": "normal", "title_th": "ปกติ", "description_th": "ไม่พบความเสี่ยง"},
                    {"min_score": 16, "max_score": 27, "result_level": "clinical_alert", "title_th": "มีความเสี่ยง", "description_th": "มีความเสี่ยงต่อภาวะขาดสมาธิ"}
                ]
            },
            {
                "domain_id": "hyperactivity",
                "title_th": "ซน/วู่วาม (Hyperactive)",
                "item_ids": ["q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18"],
                "max_possible_raw_score": 27,
                "cutoffs": [
                    {"min_score": 0, "max_score": 12, "result_level": "normal", "title_th": "ปกติ", "description_th": "ไม่พบความเสี่ยง"},
                    {"min_score": 13, "max_score": 27, "result_level": "clinical_alert", "title_th": "มีความเสี่ยง", "description_th": "มีความเสี่ยงต่อภาวะซน/วู่วาม"}
                ]
            },
            {
                "domain_id": "oppositional",
                "title_th": "ดื้อ/ต่อต้าน (Oppositional)",
                "item_ids": ["q19", "q20", "q21", "q22", "q23", "q24", "q25", "q26"],
                "max_possible_raw_score": 24,
                "cutoffs": [
                    {"min_score": 0, "max_score": 12, "result_level": "normal", "title_th": "ปกติ", "description_th": "ไม่พบความเสี่ยง"},
                    {"min_score": 13, "max_score": 24, "result_level": "clinical_alert", "title_th": "มีความเสี่ยง", "description_th": "มีความเสี่ยงต่อภาวะดื้อ/ต่อต้าน"}
                ]
            }
        ]
    }'::jsonb
) ON CONFLICT DO NOTHING;
