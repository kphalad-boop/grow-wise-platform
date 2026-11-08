-- ==============================================================================
-- GROWWISE PLATFORM - PRODUCTION SUPABASE POSTGRESQL SCHEMA WITH RLS
-- Security Definer Functions, Row-Level Security Policies, Child Authorization
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'specialist', 'teacher', 'parent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE relationship_type AS ENUM ('parent', 'guardian', 'teacher');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE grant_status AS ENUM ('active', 'revoked');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'parent',
    full_name TEXT NOT NULL,
    phone_number TEXT,
    organization TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CHILDREN TABLE
CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nickname TEXT,
    birth_date DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unspecified')),
    school_name TEXT,
    grade_level TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. CHILD ACCESS GRANTS (Zero-trust Relationship)
CREATE TABLE IF NOT EXISTS public.child_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship_type relationship_type NOT NULL,
    status grant_status NOT NULL DEFAULT 'active',
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    revoked_at TIMESTAMPTZ,
    CONSTRAINT uq_child_user UNIQUE (child_id, user_id)
);

-- 6. ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    purpose TEXT,
    min_age_months INT NOT NULL DEFAULT 0,
    max_age_months INT NOT NULL DEFAULT 216,
    target_roles TEXT[] NOT NULL DEFAULT '{"parent", "teacher"}',
    status TEXT NOT NULL DEFAULT 'draft',
    current_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. ASSESSMENT VERSIONS (Immutability guarantee)
CREATE TABLE IF NOT EXISTS public.assessment_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    schema_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    rules_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    reviewer_name TEXT,
    reviewer_role TEXT,
    published_by UUID REFERENCES public.profiles(id),
    published_at TIMESTAMPTZ,
    changelog TEXT,
    is_prototype_sample BOOLEAN DEFAULT false,
    CONSTRAINT uq_assessment_version UNIQUE (assessment_id, version_number)
);

-- 8. ASSESSMENT RESPONSES & RESULTS
CREATE TABLE IF NOT EXISTS public.assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_version_id UUID NOT NULL REFERENCES public.assessment_versions(id),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    respondent_id UUID NOT NULL REFERENCES public.profiles(id),
    respondent_role TEXT NOT NULL,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    calculated_age_years INT NOT NULL,
    calculated_age_months INT NOT NULL,
    calculated_age_display TEXT NOT NULL,
    raw_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'submitted',
    privacy_consent_accepted BOOLEAN NOT NULL DEFAULT true,
    privacy_consent_version TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL UNIQUE REFERENCES public.assessment_responses(id) ON DELETE CASCADE,
    total_raw_score INT NOT NULL,
    max_possible_raw_score INT NOT NULL,
    domain_results JSONB NOT NULL DEFAULT '[]'::jsonb,
    overall_status TEXT NOT NULL,
    overall_status_label TEXT NOT NULL,
    mandatory_disclaimer TEXT NOT NULL DEFAULT 'ผลนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัย',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_role user_role NOT NULL,
    action TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is staff (Admin, Super Admin, Specialist)
CREATE OR REPLACE FUNCTION public.is_staff(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role IN ('super_admin', 'admin', 'specialist')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users see own profile, staff sees all
CREATE POLICY "Users can view own profile or staff can view all"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_staff(auth.uid()));

-- Children: Parent sees created children; teacher sees granted children; staff sees all
CREATE POLICY "Children access policy"
    ON public.children FOR SELECT
    USING (
        auth.uid() = created_by
        OR public.is_staff(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.child_access_grants
            WHERE child_id = public.children.id AND user_id = auth.uid() AND status = 'active'
        )
    );

-- Assessments: Anyone authenticated can view published assessments; staff can view all
CREATE POLICY "Assessments view policy"
    ON public.assessments FOR SELECT
    USING (status = 'published' OR public.is_staff(auth.uid()));

-- Audit Logs: Only staff can view audit logs
CREATE POLICY "Staff only audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_staff(auth.uid()));

-- 9. ENABLE SUPABASE REALTIME REPLICATION (ALL DEVICES REAL-TIME SYNC)
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.children;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.child_access_grants;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assessments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_versions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_responses;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_results;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
EXCEPTION WHEN others THEN
    null;
END $$;
