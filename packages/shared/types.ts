// ==============================================================================
// GROWWISE PLATFORM - SHARED DOMAIN TYPES
// Multi-role, Dual-app (User Web App & Admin Web App) Domain Models
// ==============================================================================

export type UserRole = 'super_admin' | 'admin' | 'specialist' | 'teacher' | 'parent';

export type RelationshipType = 'parent' | 'guardian' | 'teacher';

export type GrantStatus = 'active' | 'revoked';

export type AssessmentStatus = 'draft' | 'review' | 'published' | 'archived';

export type RespondentRole = 'parent' | 'teacher' | 'specialist' | 'guest';

export type QuestionType =
  | 'boolean'       // ใช่ / ไม่ใช่
  | 'single_choice' // เลือกข้อเดียว
  | 'multi_choice'  // หลายข้อ
  | 'frequency'     // ความถี่
  | 'rating_scale'  // ระดับคะแนน (เช่น 0-3)
  | 'number'        // ตัวเลข
  | 'text';         // ข้อความ

// 1. User Profile
export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  organization?: string; // โรงเรียน หรือ สถานพยาบาล
  created_at: string;
  updated_at: string;
}

// 2. Child Profile
export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  birth_date: string; // YYYY-MM-DD
  gender: 'male' | 'female' | 'other' | 'unspecified';
  national_id_last4?: string; // เก็บเท่าที่จำเป็น
  school_name?: string;
  grade_level?: string;
  created_by: string; // Profile ID
  created_at: string;
  updated_at: string;
}

// 3. Child Access Grant (Zero-trust authorization)
export interface ChildAccessGrant {
  id: string;
  child_id: string;
  user_id: string; // Teacher or secondary parent
  relationship_type: RelationshipType;
  status: GrantStatus;
  granted_by: string; // Primary parent who approved
  granted_at: string;
  revoked_at?: string;
}

// 4. Question Item
export interface QuestionOption {
  value: number | string;
  label: string;
  score?: number;
}

export interface QuestionCondition {
  depends_on_question_id: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'skip';
}

export interface AssessmentItem {
  id: string;
  section_id: string;
  number: number;
  text: string;
  description?: string;
  question_type: QuestionType;
  is_required: boolean;
  options?: QuestionOption[];
  min_score?: number;
  max_score?: number;
  step?: number;
  reverse_scored?: boolean; // การกลับทิศคะแนน
  condition?: QuestionCondition;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  item_ids: string[];
}

export interface ScoreCutoff {
  min_score: number;
  max_score: number;
  result_level: 'normal' | 'borderline' | 'at_risk' | 'clinical_alert';
  title_th: string;
  description_th: string;
  recommendations: string[];
}

export interface DomainRule {
  domain_id: string;
  title_th: string;
  item_ids: string[];
  max_possible_raw_score: number;
  cutoffs?: ScoreCutoff[]; // มีเมื่อเครื่องมือกำหนดและตรวจสอบแล้ว
}

export interface RulesDefinition {
  scoring_method: 'sum' | 'mean' | 'domain_sum' | 'custom_rules';
  missing_item_handling: 'error' | 'pro_rate' | 'manual_review';
  domains: DomainRule[];
  total_cutoffs?: ScoreCutoff[];
  has_validated_t_scores: boolean; // ถ้า false ห้ามแปลง T-Score โดยพลการ
  notes?: string;
}

export interface SchemaDefinition {
  scale: QuestionOption[];
  sections: AssessmentSection[];
  items: AssessmentItem[];
}

// 5. Assessment Header
export interface Assessment {
  id: string;
  code: string; // e.g. KUS-SI-1, KUS-SI-2
  title: string;
  description: string;
  purpose: string;
  estimated_time_minutes: number;
  min_age_months: number;
  max_age_months: number;
  target_roles: RespondentRole[]; // ผู้ที่มีสิทธิ์ตอบ เช่น ครู เท่านั้น
  status: AssessmentStatus;
  current_version: number;
  created_at: string;
  updated_at: string;
}

// 6. Assessment Version (Immutability guarantee)
export interface AssessmentVersion {
  id: string;
  assessment_id: string;
  version_number: number;
  schema_definition: SchemaDefinition;
  rules_definition: RulesDefinition;
  reviewer_name?: string;
  reviewer_role?: string;
  published_by?: string;
  published_at?: string;
  changelog?: string;
  is_prototype_sample?: boolean; // ป้าย "ตัวอย่างสำหรับทดสอบระบบ"
}

// 7. Assessment Response (Answer submission)
export interface AssessmentResponse {
  id: string;
  assessment_version_id: string;
  child_id: string;
  respondent_id: string; // User ID or 'guest'
  respondent_role: RespondentRole;
  assessment_date: string; // YYYY-MM-DD
  calculated_age_years: number;
  calculated_age_months: number;
  calculated_age_display: string; // e.g. "7 ปี 3 เดือน"
  raw_answers: Record<string, number | string | any>; // question_id -> answer
  status: 'draft' | 'submitted';
  privacy_consent_accepted: boolean;
  privacy_consent_version: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

// 8. Assessment Result (Calculated score & interpretation)
export interface DomainResult {
  domain_id: string;
  title_th: string;
  raw_score: number;
  max_score: number;
  t_score?: number | null; // null หากยังไม่มีตารางมาตรฐานที่ตรวจสอบแล้ว
  status_badge: string; // เช่น "รอผู้เชี่ยวชาญตรวจและแปลผล"
  color_code: 'purple' | 'green' | 'amber' | 'red' | 'gray';
  description?: string;
  recommendations: string[];
}

export interface AssessmentResult {
  id: string;
  response_id: string;
  assessment_code: string;
  assessment_title: string;
  version_number: number;
  total_raw_score: number;
  max_possible_raw_score: number;
  domain_results: DomainResult[];
  overall_status: 'pending_specialist_review' | 'normal' | 'borderline' | 'at_risk';
  overall_status_label: string; // e.g. "รอผู้เชี่ยวชาญตรวจและแปลผล"
  has_clinical_alert: boolean;
  is_prototype_sample: boolean;
  mandatory_disclaimer: string; // "ผลนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัย"
  calculated_at: string;
}

// 9. Audit Log
export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action:
    | 'USER_LOGIN'
    | 'ROLE_CHANGE'
    | 'PASSWORD_RESET_REQUEST'
    | 'CHILD_CREATED'
    | 'CHILD_GRANT_UPDATED'
    | 'ASSESSMENT_DRAFT_SAVED'
    | 'ASSESSMENT_PUBLISHED'
    | 'RESPONSE_SUBMITTED'
    | 'RESULT_VIEWED'
    | 'DATA_EXPORTED';
  target_resource: string;
  details: Record<string, any>;
  ip_address: string;
  created_at: string;
}
