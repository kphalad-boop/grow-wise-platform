/**
 * GROW WISE PLATFORM - DATABASE TYPES & DOMAIN INTERFACES
 * 
 * Auto-compatible with @supabase/supabase-js createClient<Database>()
 * Shared across both Next.js App Router repositories.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------
export type UserRole = 'parent' | 'teacher' | 'specialist' | 'admin' | 'super_admin';
export type RelationshipType = 'parent' | 'guardian' | 'teacher';
export type GrantStatus = 'active' | 'revoked';
export type AssessmentStatus = 'draft' | 'review' | 'published' | 'archived';
export type RespondentRole = 'parent' | 'teacher' | 'guest';

// -----------------------------------------------------------------------------
// DOMAIN MODELS: ASSESSMENTS SCHEMA DEFINITION (JSONB)
// -----------------------------------------------------------------------------
export interface ScaleOption {
  value: number;
  label: string;
}

export interface QuestionCondition {
  min_age_months?: number;
  max_age_months?: number;
  depends_on_item?: string;
  equals_value?: number;
}

export interface AssessmentItem {
  id: string; // e.g. "q1", "vis_1"
  section_id: string;
  number: number;
  text: string;
  condition?: QuestionCondition;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  item_ids: string[];
  conditions?: QuestionCondition;
}

export interface AssessmentSchemaDefinition {
  scale: ScaleOption[];
  sections: AssessmentSection[];
  items: AssessmentItem[];
}

// -----------------------------------------------------------------------------
// DOMAIN MODELS: RULES DEFINITION & CUTOFFS (JSONB)
// -----------------------------------------------------------------------------
export interface SnapCutoffItem {
  cutoff_mean: number;
  cutoff_raw: number;
  label: string;
}

export interface SnapRulesDefinition {
  algorithm: 'snap_iv_scoring';
  calculation_formula: {
    section_score: string;
    section_mean: string;
    total_score: string;
  };
  cutoffs: {
    parent: Record<string, SnapCutoffItem>;
    teacher: Record<string, SnapCutoffItem>;
  };
  interpretation_guide: {
    positive: string;
    negative: string;
  };
}

export interface SensoryQuadrant {
  code: string;
  name: string;
  description: string;
}

export interface SeverityBand {
  level: 'typical' | 'probable_difference' | 'definite_difference';
  label: string;
  color: string;
}

export interface SensoryRulesDefinition {
  algorithm: 'sensory_profile_quadrant';
  scoring_logic: {
    section_total: string;
    conditional_logic?: string;
  };
  quadrants: SensoryQuadrant[];
  severity_bands: SeverityBand[];
}

export type AssessmentRulesDefinition = SnapRulesDefinition | SensoryRulesDefinition | Record<string, Json>;

// -----------------------------------------------------------------------------
// DOMAIN MODELS: SUBMISSIONS PAYLOAD & CALCULATION (JSONB)
// -----------------------------------------------------------------------------
export type SubmissionAnswers = Record<string, number>; // item_id -> scale value

export interface SectionScoreSummary {
  section_id: string;
  title: string;
  raw_score: number;
  max_score: number;
  mean_score: number;
  is_elevated?: boolean;
}

export interface CalculatedScores {
  total_score: number;
  max_possible_score: number;
  sections: Record<string, SectionScoreSummary>;
  quadrant_scores?: Record<string, number>;
}

export interface InterpretationResult {
  summary: string;
  flags: Array<{
    code: string;
    level: 'normal' | 'moderate' | 'high';
    message: string;
  }>;
  recommended_actions: string[];
  disclaimer: string;
}

// -----------------------------------------------------------------------------
// SUPABASE CLIENT DATABASE SCHEMA INTERFACES
// -----------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedTable: "users";
            referencedSchema: "auth";
          }
        ];
      };

      children: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          nickname: string | null;
          birth_date: string;
          gender: 'male' | 'female' | 'other' | 'unspecified' | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          nickname?: string | null;
          birth_date: string;
          gender?: 'male' | 'female' | 'other' | 'unspecified' | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          nickname?: string | null;
          birth_date?: string;
          gender?: 'male' | 'female' | 'other' | 'unspecified' | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "children_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedTable: "profiles";
          }
        ];
      };

      child_access_grants: {
        Row: {
          id: string;
          child_id: string;
          user_id: string;
          relationship_type: RelationshipType;
          status: GrantStatus;
          granted_at: string;
          granted_by: string | null;
        };
        Insert: {
          id?: string;
          child_id: string;
          user_id: string;
          relationship_type: RelationshipType;
          status?: GrantStatus;
          granted_at?: string;
          granted_by?: string | null;
        };
        Update: {
          id?: string;
          child_id?: string;
          user_id?: string;
          relationship_type?: RelationshipType;
          status?: GrantStatus;
          granted_at?: string;
          granted_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "child_access_grants_child_id_fkey";
            columns: ["child_id"];
            referencedRelation: "children";
            referencedTable: "children";
          },
          {
            foreignKeyName: "child_access_grants_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedTable: "profiles";
          },
          {
            foreignKeyName: "child_access_grants_granted_by_fkey";
            columns: ["granted_by"];
            referencedRelation: "profiles";
            referencedTable: "profiles";
          }
        ];
      };

      assessments: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string | null;
          min_age_months: number | null;
          max_age_months: number | null;
          target_roles: string[];
          status: AssessmentStatus;
          current_version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description?: string | null;
          min_age_months?: number | null;
          max_age_months?: number | null;
          target_roles?: string[];
          status?: AssessmentStatus;
          current_version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          description?: string | null;
          min_age_months?: number | null;
          max_age_months?: number | null;
          target_roles?: string[];
          status?: AssessmentStatus;
          current_version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      assessment_versions: {
        Row: {
          id: string;
          assessment_id: string;
          version_number: number;
          schema_definition: AssessmentSchemaDefinition;
          rules_definition: AssessmentRulesDefinition;
          published_at: string | null;
          published_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          version_number: number;
          schema_definition?: AssessmentSchemaDefinition;
          rules_definition?: AssessmentRulesDefinition;
          published_at?: string | null;
          published_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          version_number?: number;
          schema_definition?: AssessmentSchemaDefinition;
          rules_definition?: AssessmentRulesDefinition;
          published_at?: string | null;
          published_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_versions_assessment_id_fkey";
            columns: ["assessment_id"];
            referencedRelation: "assessments";
            referencedTable: "assessments";
          },
          {
            foreignKeyName: "assessment_versions_published_by_fkey";
            columns: ["published_by"];
            referencedRelation: "profiles";
            referencedTable: "profiles";
          }
        ];
      };

      submissions: {
        Row: {
          id: string;
          child_id: string | null;
          respondent_id: string | null;
          respondent_role: RespondentRole;
          assessment_id: string;
          version_number: number;
          answers: SubmissionAnswers;
          calculated_scores: CalculatedScores;
          interpretation_result: InterpretationResult;
          is_guest: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id?: string | null;
          respondent_id?: string | null;
          respondent_role?: RespondentRole;
          assessment_id: string;
          version_number: number;
          answers?: SubmissionAnswers;
          calculated_scores?: CalculatedScores;
          interpretation_result?: InterpretationResult;
          is_guest?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string | null;
          respondent_id?: string | null;
          respondent_role?: RespondentRole;
          assessment_id?: string;
          version_number?: number;
          answers?: SubmissionAnswers;
          calculated_scores?: CalculatedScores;
          interpretation_result?: InterpretationResult;
          is_guest?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_child_id_fkey";
            columns: ["child_id"];
            referencedRelation: "children";
            referencedTable: "children";
          },
          {
            foreignKeyName: "submissions_respondent_id_fkey";
            columns: ["respondent_id"];
            referencedRelation: "profiles";
            referencedTable: "profiles";
          },
          {
            foreignKeyName: "submissions_assessment_id_fkey";
            columns: ["assessment_id"];
            referencedRelation: "assessments";
            referencedTable: "assessments";
          }
        ];
      };

      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_name: string;
          entity_id: string | null;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_name: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_name?: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            referencedRelation: "users";
            referencedTable: "users";
            referencedSchema: "auth";
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin_or_super: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      has_child_access: {
        Args: { p_child_id: string; p_user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      relationship_type: RelationshipType;
      grant_status: GrantStatus;
      assessment_status: AssessmentStatus;
      respondent_role: RespondentRole;
    };
  };
}
