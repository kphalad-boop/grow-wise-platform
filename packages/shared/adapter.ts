// ==============================================================================
// GROWWISE PLATFORM - DATA ADAPTER INTERFACE (REPOSITORY PATTERN)
// Abstract interface to decouple UI from Database (Supabase, Firebase, Mock)
// ==============================================================================

import {
  Assessment,
  AssessmentResponse,
  AssessmentResult,
  AssessmentVersion,
  AuditLog,
  Child,
  ChildAccessGrant,
  Profile,
  RespondentRole,
  UserRole,
} from './types';

export interface IDataAdapter {
  // 1. Authentication & Profiles
  getCurrentUser(): Promise<Profile | null>;
  login(email: string, password?: string): Promise<{ user: Profile; token?: string }>;
  register(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>, password?: string): Promise<Profile>;
  logout(): Promise<void>;
  switchSimulatedRole?(role: UserRole): Promise<Profile>; // For Prototype demonstration
  getProfileById(userId: string): Promise<Profile | null>;
  getAllUsersAdmin(): Promise<Profile[]>;
  requestPasswordReset(email: string): Promise<{ success: boolean; message: string }>;
  updateUserRoleAdmin(targetUserId: string, newRole: UserRole, operatorId: string): Promise<Profile>;

  // 2. Children Management (Access Control Enforced)
  getChildrenForUser(userId: string, role: UserRole): Promise<Child[]>;
  getChildById(childId: string, requestingUserId: string): Promise<Child | null>;
  createChild(childData: Omit<Child, 'id' | 'created_at' | 'updated_at'>, createdByUserId: string): Promise<Child>;
  updateChild(childId: string, updates: Partial<Child>, requestingUserId: string): Promise<Child>;
  deleteChild(childId: string, requestingUserId: string): Promise<boolean>;

  // 3. Child Access Grants (Teacher - Child Relationship)
  getGrantsForChild(childId: string, requestingUserId: string): Promise<ChildAccessGrant[]>;
  grantTeacherAccess(childId: string, teacherId: string, grantedByUserId: string): Promise<ChildAccessGrant>;
  revokeAccess(grantId: string, requestingUserId: string): Promise<boolean>;

  // 4. Assessments & Versioning
  getPublishedAssessments(userRole?: RespondentRole, childAgeMonths?: number): Promise<Assessment[]>;
  getAssessmentById(assessmentId: string): Promise<Assessment | null>;
  getAssessmentVersion(assessmentId: string, versionNumber?: number): Promise<AssessmentVersion | null>;
  getAllAssessmentsAdmin(): Promise<Assessment[]>;
  getAllVersionsForAssessmentAdmin(assessmentId: string): Promise<AssessmentVersion[]>;
  saveAssessmentDraft(
    assessment: Partial<Assessment>,
    version: Partial<AssessmentVersion>,
    operatorId: string
  ): Promise<{ assessment: Assessment; version: AssessmentVersion }>;
  publishAssessmentVersion(assessmentId: string, versionNumber: number, operatorId: string): Promise<AssessmentVersion>;
  archiveAssessment(assessmentId: string, operatorId: string): Promise<Assessment>;

  // 5. Responses & Scoring
  saveDraftResponse(response: Partial<AssessmentResponse>): Promise<AssessmentResponse>;
  submitResponse(
    response: Omit<AssessmentResponse, 'id' | 'status' | 'created_at' | 'updated_at' | 'submitted_at'>
  ): Promise<{ response: AssessmentResponse; result: AssessmentResult }>;
  getResponseById(responseId: string, requestingUserId: string): Promise<AssessmentResponse | null>;
  getResultByResponseId(responseId: string, requestingUserId: string): Promise<AssessmentResult | null>;
  getHistoryForChild(childId: string, requestingUserId: string): Promise<Array<{ response: AssessmentResponse; result: AssessmentResult }>>;
  getAllResultsAdmin(): Promise<Array<{ response: AssessmentResponse; result: AssessmentResult; child: Child }>>;

  // 6. Security Audit Logs
  logAuditAction(
    action: AuditLog['action'],
    targetResource: string,
    details: Record<string, any>,
    operator: { id: string; name: string; role: UserRole }
  ): Promise<void>;
  getAuditLogsAdmin(limit?: number): Promise<AuditLog[]>;
}
