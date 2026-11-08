-- ==============================================================================
-- GROW WISE PLATFORM (PHASE 1) - MIGRATION SCRIPT
-- Supabase PostgreSQL Schema, Security Definer Functions, Triggers & RLS
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES / ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('parent', 'teacher', 'specialist', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE relationship_type AS ENUM ('parent', 'guardian', 'teacher');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE grant_status AS ENUM ('active', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assessment_status AS ENUM ('draft', 'review', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE respondent_role AS ENUM ('parent', 'teacher', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. CORE TABLES

-- Table 1: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'parent',
    full_name TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 2: children
CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nickname TEXT,
    birth_date DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unspecified')),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 3: child_access_grants
CREATE TABLE IF NOT EXISTS public.child_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship_type relationship_type NOT NULL,
    status grant_status NOT NULL DEFAULT 'active',
    granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    CONSTRAINT uq_child_user_grant UNIQUE (child_id, user_id)
);

-- Table 4: assessments
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    min_age_months INT,
    max_age_months INT,
    target_roles TEXT[] NOT NULL DEFAULT '{}',
    status assessment_status NOT NULL DEFAULT 'draft',
    current_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 5: assessment_versions
CREATE TABLE IF NOT EXISTS public.assessment_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    schema_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    rules_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_assessment_version UNIQUE (assessment_id, version_number)
);

-- Table 6: submissions
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
    respondent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    respondent_role respondent_role NOT NULL DEFAULT 'parent',
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE RESTRICT,
    version_number INT NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    calculated_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    interpretation_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_guest BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 7: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_children_created_by ON public.children(created_by);
CREATE INDEX IF NOT EXISTS idx_children_birth_date ON public.children(birth_date);
CREATE INDEX IF NOT EXISTS idx_grants_user_status ON public.child_access_grants(user_id, status);
CREATE INDEX IF NOT EXISTS idx_grants_child_status ON public.child_access_grants(child_id, status);
CREATE INDEX IF NOT EXISTS idx_assessments_code ON public.assessments(code);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessment_versions_lookup ON public.assessment_versions(assessment_id, version_number);
CREATE INDEX IF NOT EXISTS idx_submissions_child ON public.submissions(child_id);
CREATE INDEX IF NOT EXISTS idx_submissions_respondent ON public.submissions(respondent_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assessment ON public.submissions(assessment_id, version_number);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_name, entity_id);

-- 5. SECURITY DEFINER HELPER FUNCTIONS (Avoid RLS recursion and elevate privileged checks)

-- Check if a user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id AND role IN ('admin', 'super_admin')
    );
$$;

-- Check if user has active grant to access a child
CREATE OR REPLACE FUNCTION public.has_child_access(p_child_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (
        p_child_id IS NOT NULL AND p_user_id IS NOT NULL AND (
            -- Admins always have access
            public.is_admin_or_super(p_user_id)
            OR
            -- Active grant exists
            EXISTS (
                SELECT 1 FROM public.child_access_grants
                WHERE child_id = p_child_id
                  AND user_id = p_user_id
                  AND status = 'active'
            )
        )
    );
$$;

-- 6. TRIGGERS

-- Trigger: Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_children_updated_at ON public.children;
CREATE TRIGGER trg_children_updated_at
BEFORE UPDATE ON public.children
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_assessments_updated_at ON public.assessments;
CREATE TRIGGER trg_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Trigger: Automatically create public.profiles upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role user_role := 'parent';
BEGIN
    -- Extract role from metadata if specified, default to parent
    IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
        BEGIN
            v_role := (NEW.raw_user_meta_data->>'role')::user_role;
        EXCEPTION WHEN invalid_text_representation THEN
            v_role := 'parent';
        END;
    END IF;

    INSERT INTO public.profiles (id, role, full_name, phone_number)
    VALUES (
        NEW.id,
        v_role,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'สมาชิกใหม่'),
        NEW.raw_user_meta_data->>'phone_number'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Automatically grant active access to child creator
CREATE OR REPLACE FUNCTION public.handle_new_child_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_creator_role user_role;
    v_rel relationship_type := 'parent';
BEGIN
    SELECT role INTO v_creator_role FROM public.profiles WHERE id = NEW.created_by;
    
    IF v_creator_role = 'teacher' THEN
        v_rel := 'teacher';
    ELSE
        v_rel := 'parent';
    END IF;

    INSERT INTO public.child_access_grants (
        child_id,
        user_id,
        relationship_type,
        status,
        granted_at,
        granted_by
    ) VALUES (
        NEW.id,
        NEW.created_by,
        v_rel,
        'active',
        timezone('utc'::text, now()),
        NEW.created_by
    ) ON CONFLICT (child_id, user_id) DO UPDATE SET status = 'active';

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_child_created ON public.children;
CREATE TRIGGER trg_on_child_created
AFTER INSERT ON public.children
FOR EACH ROW EXECUTE FUNCTION public.handle_new_child_created();

-- Trigger: Enforce Immutability of Published Assessment Versions
CREATE OR REPLACE FUNCTION public.prevent_published_version_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.published_at IS NOT NULL THEN
        RAISE EXCEPTION 'Assessment version % is published and immutable.', OLD.version_number;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_published_version_mutation ON public.assessment_versions;
CREATE TRIGGER trg_prevent_published_version_mutation
BEFORE UPDATE OR DELETE ON public.assessment_versions
FOR EACH ROW EXECUTE FUNCTION public.prevent_published_version_mutation();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- RLS: PROFILES
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid() OR public.is_admin_or_super(auth.uid()))
    WITH CHECK (id = auth.uid() OR public.is_admin_or_super(auth.uid()));

-- -----------------------------------------------------------------------------
-- RLS: CHILDREN
-- Only users with active grant in child_access_grants or Admins can access
-- -----------------------------------------------------------------------------
CREATE POLICY "Users with active grant can view child"
    ON public.children FOR SELECT
    TO authenticated
    USING (public.has_child_access(id, auth.uid()));

CREATE POLICY "Authenticated users can create child record"
    ON public.children FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authorized users can update child record"
    ON public.children FOR UPDATE
    TO authenticated
    USING (public.has_child_access(id, auth.uid()))
    WITH CHECK (public.has_child_access(id, auth.uid()));

CREATE POLICY "Admins or creators can delete child"
    ON public.children FOR DELETE
    TO authenticated
    USING (created_by = auth.uid() OR public.is_admin_or_super(auth.uid()));

-- -----------------------------------------------------------------------------
-- RLS: CHILD_ACCESS_GRANTS
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view grants related to their children or assigned to them"
    ON public.child_access_grants FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() 
        OR public.has_child_access(child_id, auth.uid())
        OR public.is_admin_or_super(auth.uid())
    );

CREATE POLICY "Child creator or Admin can grant access"
    ON public.child_access_grants FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin_or_super(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.children
            WHERE id = child_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Child creator or Admin can update or revoke grants"
    ON public.child_access_grants FOR UPDATE
    TO authenticated
    USING (
        public.is_admin_or_super(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.children
            WHERE id = child_id AND created_by = auth.uid()
        )
    )
    WITH CHECK (
        public.is_admin_or_super(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.children
            WHERE id = child_id AND created_by = auth.uid()
        )
    );

-- -----------------------------------------------------------------------------
-- RLS: ASSESSMENTS
-- Anyone (including anon) can view published assessments. Admins can view/edit all.
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view published assessments"
    ON public.assessments FOR SELECT
    TO anon, authenticated
    USING (status = 'published' OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins manage assessments"
    ON public.assessments FOR ALL
    TO authenticated
    USING (public.is_admin_or_super(auth.uid()))
    WITH CHECK (public.is_admin_or_super(auth.uid()));

-- -----------------------------------------------------------------------------
-- RLS: ASSESSMENT_VERSIONS
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view published assessment versions"
    ON public.assessment_versions FOR SELECT
    TO anon, authenticated
    USING (published_at IS NOT NULL OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins manage assessment versions"
    ON public.assessment_versions FOR ALL
    TO authenticated
    USING (public.is_admin_or_super(auth.uid()))
    WITH CHECK (public.is_admin_or_super(auth.uid()));

-- -----------------------------------------------------------------------------
-- RLS: SUBMISSIONS
-- Secure result views: Users can ONLY see submissions of children they have access to.
-- Prevents URL ID manipulation / cross-tenant inspection.
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view submissions of granted children or their own"
    ON public.submissions FOR SELECT
    TO authenticated
    USING (
        public.is_admin_or_super(auth.uid())
        OR (child_id IS NOT NULL AND public.has_child_access(child_id, auth.uid()))
        OR (respondent_id = auth.uid())
    );

CREATE POLICY "Authenticated users can submit assessments"
    ON public.submissions FOR INSERT
    TO authenticated
    WITH CHECK (
        respondent_id = auth.uid()
        AND (child_id IS NULL OR public.has_child_access(child_id, auth.uid()))
    );

-- -----------------------------------------------------------------------------
-- RLS: AUDIT_LOGS
-- Restricted to system & Admins
-- -----------------------------------------------------------------------------
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Authenticated users can insert audit logs"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (actor_id = auth.uid());
