// ==============================================================================
// GROWWISE PLATFORM - ROBUST MOCK DATA STORE (LOCAL & IN-MEMORY)
// Provides full standalone functionality with access controls and seed data
// ==============================================================================

import { IDataAdapter } from './adapter';
import { ALL_INITIAL_ASSESSMENTS, ALL_INITIAL_VERSIONS } from './kus-si-data';
import { calculateAgeAtDate, evaluateAssessment } from './scoring';
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

export class MockDataStore implements IDataAdapter {
  private profiles: Profile[] = [];
  private children: Child[] = [];
  private grants: ChildAccessGrant[] = [];
  private assessments: Assessment[] = [];
  private versions: AssessmentVersion[] = [];
  private responses: AssessmentResponse[] = [];
  private results: AssessmentResult[] = [];
  private auditLogs: AuditLog[] = [];

  private currentUserId: string = ''; // ค่าเริ่มต้น: ยังไม่เข้าระบบ (Unauthenticated)

  constructor() {
    this.initSeedData();
    if (this.profiles.length > 0) {
      this.currentUserId = this.profiles[0].id;
    }
  }

  private initSeedData() {
    // 1. Initial Profiles
    this.profiles = [
      {
        id: 'usr_super_admin',
        role: 'super_admin',
        full_name: 'Super Administrator',
        email: 'admin@growwise.internal',
        phone_number: '081-000-0001',
        organization: 'GrowWise System Core',
        created_at: '2026-11-01T00:00:00Z',
        updated_at: '2026-11-01T00:00:00Z',
      },
      {
        id: 'usr_admin',
        role: 'admin',
        full_name: 'คุณพัชรา วิศวกรระบบ (Admin)',
        email: 'patchara@growwise.local',
        phone_number: '081-111-2222',
        organization: 'สำนักงานพัฒนาระบบสุขภาพ',
        created_at: '2026-11-01T00:00:00Z',
        updated_at: '2026-11-01T00:00:00Z',
      },
      {
        id: 'usr_dr_somchai',
        role: 'specialist',
        full_name: 'นพ. สมชาย เกียรติวิทยา (จิตแพทย์เด็ก)',
        email: 'somchai.md@hospital.local',
        phone_number: '082-345-6789',
        organization: 'สถาบันพัฒนาการเด็ก',
        created_at: '2026-11-01T00:00:00Z',
        updated_at: '2026-11-01T00:00:00Z',
      },
      {
        id: 'usr_teacher_nipa',
        role: 'teacher',
        full_name: 'ครู นิภา วงศ์สว่าง (ครูประจำชั้น ป.2)',
        email: 'kru.nipa@school.ac.th',
        phone_number: '089-876-5432',
        organization: 'โรงเรียนสาธิตพัฒนาการ',
        created_at: '2026-11-01T00:00:00Z',
        updated_at: '2026-11-01T00:00:00Z',
      },
      {
        id: 'usr_parent_dao',
        role: 'parent',
        full_name: 'คุณแม่ ดาวเรือง ใจดี (ผู้ปกครอง)',
        email: 'dao.jaidee@gmail.com',
        phone_number: '085-555-1234',
        created_at: '2026-11-01T00:00:00Z',
        updated_at: '2026-11-01T00:00:00Z',
      },
    ];

    // Clean Production State (No Test/Mock Children or Sample Results)
    this.children = [];
    this.grants = [];
    this.responses = [];
    this.results = [];

    // Official Clinical Screening Instruments (5 Verified KUS-SI Scales)
    this.assessments = [...ALL_INITIAL_ASSESSMENTS];
    this.versions = [...ALL_INITIAL_VERSIONS];

    // Clean Production Audit Logs
    this.auditLogs = [
      {
        id: 'log_init_system',
        user_id: 'usr_super_admin',
        user_name: 'Super Administrator',
        user_role: 'super_admin',
        action: 'SYSTEM_INITIALIZED',
        target_resource: 'KUS-SI Rating Scales (1-5)',
        details: { version: 1, note: 'เริ่มต้นระบบพร้อมชุดแบบคัดกรองมาตรฐาน 5 ชุดสำหรับใช้งานจริง' },
        ip_address: '127.0.0.1',
        created_at: '2026-11-01T00:00:00Z',
      },
    ];
  }

  // --- Auth & Profiles ---
  async getCurrentUser(): Promise<Profile | null> {
    if (!this.currentUserId) return this.profiles[0] || null;
    const user = this.profiles.find((p) => p.id === this.currentUserId);
    return user || this.profiles[0] || null;
  }

  async switchSimulatedRole(role: UserRole): Promise<Profile> {
    const user = this.profiles.find((p) => p.role === role);
    if (user) {
      this.currentUserId = user.id;
      return user;
    }
    return this.profiles[0];
  }

  async login(email: string, password?: string): Promise<{ user: Profile; token?: string }> {
    // Special check for super admin prototype account
    if (email === 'admin' || email === 'admin@growwise.internal') {
      const adminUser = this.profiles.find((p) => p.role === 'super_admin');
      if (adminUser) {
        this.currentUserId = adminUser.id;
        return { user: adminUser, token: 'mock-jwt-super-admin' };
      }
    }

    const user = this.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.currentUserId = user.id;
      return { user, token: `mock-jwt-${user.id}` };
    }

    // Prototype fallback: create session for valid email
    const newProfile: Profile = {
      id: `usr_${Date.now()}`,
      role: 'parent',
      full_name: email.split('@')[0],
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.profiles.push(newProfile);
    this.currentUserId = newProfile.id;
    return { user: newProfile, token: `mock-jwt-${newProfile.id}` };
  }

  async register(profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile> {
    const newProfile: Profile = {
      ...profileData,
      id: `usr_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.profiles.push(newProfile);
    this.currentUserId = newProfile.id;
    return newProfile;
  }

  async logout(): Promise<void> {
    this.currentUserId = '';
  }

  async getProfileById(userId: string): Promise<Profile | null> {
    return this.profiles.find((p) => p.id === userId) || null;
  }

  async getAllUsersAdmin(): Promise<Profile[]> {
    return [...this.profiles];
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: `ลิงก์ตั้งรหัสผ่านใหม่แบบใช้ครั้งเดียวถูกสร้างและส่งไปยัง ${email} แล้ว (อายุ 15 นาที)`,
    };
  }

  async updateUserRoleAdmin(targetUserId: string, newRole: UserRole, operatorId: string): Promise<Profile> {
    const user = this.profiles.find((p) => p.id === targetUserId);
    if (!user) throw new Error('User not found');
    const oldRole = user.role;
    user.role = newRole;
    user.updated_at = new Date().toISOString();

    const operator = this.profiles.find((p) => p.id === operatorId) || { full_name: 'Admin', role: 'admin' as UserRole };
    await this.logAuditAction(
      'ROLE_CHANGE',
      targetUserId,
      { old_role: oldRole, new_role: newRole },
      { id: operatorId, name: operator.full_name, role: operator.role }
    );
    return user;
  }

  async createUserAdmin(
    userData: { full_name: string; email: string; role: UserRole; organization?: string; phone_number?: string },
    operatorId: string
  ): Promise<Profile> {
    const existing = this.profiles.find((p) => p.email.toLowerCase() === userData.email.toLowerCase().trim());
    if (existing) {
      throw new Error(`อีเมล ${userData.email} มีอยู่ในระบบแล้ว`);
    }
    const newProfile: Profile = {
      id: `usr_${Date.now()}`,
      full_name: userData.full_name.trim(),
      email: userData.email.trim().toLowerCase(),
      role: userData.role,
      organization: (userData.organization || '').trim(),
      phone_number: (userData.phone_number || '').trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.profiles.push(newProfile);

    const operator = this.profiles.find((p) => p.id === operatorId) || { full_name: 'Admin', role: 'admin' as UserRole };
    await this.logAuditAction(
      'USER_CREATED',
      newProfile.id,
      { email: newProfile.email, role: newProfile.role, full_name: newProfile.full_name, organization: newProfile.organization },
      { id: operatorId, name: operator.full_name, role: operator.role }
    );
    return newProfile;
  }

  async updateUserAdmin(
    targetUserId: string,
    updateData: Partial<Profile>,
    operatorId: string
  ): Promise<Profile> {
    const user = this.profiles.find((p) => p.id === targetUserId);
    if (!user) throw new Error('User not found');

    if (updateData.email && updateData.email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const existing = this.profiles.find(
        (p) => p.email.toLowerCase() === updateData.email!.toLowerCase().trim() && p.id !== targetUserId
      );
      if (existing) {
        throw new Error(`อีเมล ${updateData.email} ถูกใช้งานโดยบัญชีอื่นแล้ว`);
      }
    }

    const previousData = { ...user };
    Object.assign(user, updateData, { updated_at: new Date().toISOString() });

    const operator = this.profiles.find((p) => p.id === operatorId) || { full_name: 'Admin', role: 'admin' as UserRole };
    await this.logAuditAction(
      'USER_UPDATED',
      targetUserId,
      { changes: Object.keys(updateData), previous: previousData, updated: user },
      { id: operatorId, name: operator.full_name, role: operator.role }
    );
    return user;
  }

  async deleteUserAdmin(targetUserId: string, operatorId: string): Promise<{ success: boolean; deleted_id: string }> {
    const index = this.profiles.findIndex((p) => p.id === targetUserId);
    if (index === -1) throw new Error('User not found');
    const targetUser = this.profiles[index];

    if (targetUser.role === 'super_admin') {
      const superAdminCount = this.profiles.filter((p) => p.role === 'super_admin').length;
      if (superAdminCount <= 1) {
        throw new Error('ไม่สามารถลบบัญชี Super Administrator บัญชีสุดท้ายของระบบได้');
      }
    }

    const [deleted] = this.profiles.splice(index, 1);

    const operator = this.profiles.find((p) => p.id === operatorId) || { full_name: 'Admin', role: 'admin' as UserRole };
    await this.logAuditAction(
      'USER_DELETED',
      targetUserId,
      { email: deleted.email, full_name: deleted.full_name, role: deleted.role },
      { id: operatorId, name: operator.full_name, role: operator.role }
    );
    return { success: true, deleted_id: targetUserId };
  }

  // --- Children Management ---
  async getChildrenForUser(userId: string, role: UserRole): Promise<Child[]> {
    if (role === 'super_admin' || role === 'admin' || role === 'specialist') {
      return [...this.children];
    }
    if (role === 'teacher') {
      // Find children granted to this teacher
      const activeGrants = this.grants.filter((g) => g.user_id === userId && g.status === 'active');
      const grantedChildIds = new Set(activeGrants.map((g) => g.child_id));
      return this.children.filter((c) => grantedChildIds.has(c.id));
    }
    // Parent sees only created children
    return this.children.filter((c) => c.created_by === userId);
  }

  async getChildById(childId: string, requestingUserId: string): Promise<Child | null> {
    const child = this.children.find((c) => c.id === childId);
    if (!child) return null;

    const user = this.profiles.find((p) => p.id === requestingUserId);
    if (!user) return null;

    if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'specialist') {
      return child;
    }
    if (child.created_by === requestingUserId) {
      return child;
    }
    const hasGrant = this.grants.some(
      (g) => g.child_id === childId && g.user_id === requestingUserId && g.status === 'active'
    );
    if (hasGrant) {
      return child;
    }
    return null; // Deny access
  }

  async createChild(childData: Omit<Child, 'id' | 'created_at' | 'updated_at'>, createdByUserId: string): Promise<Child> {
    const newChild: Child = {
      ...childData,
      id: `child_${Date.now()}`,
      created_by: createdByUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.children.push(newChild);
    return newChild;
  }

  async updateChild(childId: string, updates: Partial<Child>, requestingUserId: string): Promise<Child> {
    const child = await this.getChildById(childId, requestingUserId);
    if (!child) throw new Error('Unauthorized or child not found');

    Object.assign(child, updates, { updated_at: new Date().toISOString() });
    return child;
  }

  async deleteChild(childId: string, requestingUserId: string): Promise<boolean> {
    const child = await this.getChildById(childId, requestingUserId);
    if (!child) return false;
    this.children = this.children.filter((c) => c.id !== childId);
    return true;
  }

  // --- Child Grants ---
  async getGrantsForChild(childId: string, requestingUserId: string): Promise<ChildAccessGrant[]> {
    return this.grants.filter((g) => g.child_id === childId);
  }

  async grantTeacherAccess(childId: string, teacherId: string, grantedByUserId: string): Promise<ChildAccessGrant> {
    const existing = this.grants.find((g) => g.child_id === childId && g.user_id === teacherId);
    if (existing) {
      existing.status = 'active';
      return existing;
    }
    const newGrant: ChildAccessGrant = {
      id: `grant_${Date.now()}`,
      child_id: childId,
      user_id: teacherId,
      relationship_type: 'teacher',
      status: 'active',
      granted_by: grantedByUserId,
      granted_at: new Date().toISOString(),
    };
    this.grants.push(newGrant);
    return newGrant;
  }

  async revokeAccess(grantId: string, requestingUserId: string): Promise<boolean> {
    const grant = this.grants.find((g) => g.id === grantId);
    if (!grant) return false;
    grant.status = 'revoked';
    grant.revoked_at = new Date().toISOString();
    return true;
  }

  // --- Assessments & Versions ---
  async getPublishedAssessments(userRole?: RespondentRole, childAgeMonths?: number): Promise<Assessment[]> {
    return this.assessments.filter((a) => {
      if (a.status !== 'published') return false;
      if (userRole && !a.target_roles.includes(userRole)) {
        // Strict role check
        return false;
      }
      if (childAgeMonths !== undefined) {
        if (childAgeMonths < a.min_age_months || childAgeMonths > a.max_age_months) {
          return false;
        }
      }
      return true;
    });
  }

  async getAssessmentById(assessmentId: string): Promise<Assessment | null> {
    return this.assessments.find((a) => a.id === assessmentId || a.code === assessmentId) || null;
  }

  async getAssessmentVersion(assessmentId: string, versionNumber?: number): Promise<AssessmentVersion | null> {
    const matching = this.versions.filter((v) => v.assessment_id === assessmentId);
    if (matching.length === 0) return null;
    if (versionNumber) {
      return matching.find((v) => v.version_number === versionNumber) || null;
    }
    // Return latest version
    return matching.sort((a, b) => b.version_number - a.version_number)[0];
  }

  async getAllAssessmentsAdmin(): Promise<Assessment[]> {
    return [...this.assessments];
  }

  async getAllVersionsForAssessmentAdmin(assessmentId: string): Promise<AssessmentVersion[]> {
    return this.versions.filter((v) => v.assessment_id === assessmentId);
  }

  async saveAssessmentDraft(
    assessmentData: Partial<Assessment>,
    versionData: Partial<AssessmentVersion>,
    operatorId: string
  ): Promise<{ assessment: Assessment; version: AssessmentVersion }> {
    let assessment = this.assessments.find((a) => a.id === assessmentData.id);
    if (!assessment) {
      assessment = {
        id: assessmentData.id || `asm_${Date.now()}`,
        code: assessmentData.code || `CUSTOM-${Date.now()}`,
        title: assessmentData.title || 'แบบประเมินใหม่',
        description: assessmentData.description || '',
        purpose: assessmentData.purpose || '',
        estimated_time_minutes: assessmentData.estimated_time_minutes || 10,
        min_age_months: assessmentData.min_age_months || 0,
        max_age_months: assessmentData.max_age_months || 216,
        target_roles: assessmentData.target_roles || ['parent', 'teacher'],
        status: 'draft',
        current_version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.assessments.push(assessment);
    } else {
      Object.assign(assessment, assessmentData, { updated_at: new Date().toISOString() });
    }

    let version = this.versions.find((v) => v.id === versionData.id);
    if (!version) {
      version = {
        id: versionData.id || `ver_${Date.now()}`,
        assessment_id: assessment.id,
        version_number: assessment.current_version,
        schema_definition: versionData.schema_definition || { scale: [], sections: [], items: [] },
        rules_definition: versionData.rules_definition || {
          scoring_method: 'domain_sum',
          missing_item_handling: 'error',
          domains: [],
          has_validated_t_scores: false,
        },
        reviewer_name: versionData.reviewer_name,
        reviewer_role: versionData.reviewer_role,
        is_prototype_sample: true,
      };
      this.versions.push(version);
    } else {
      Object.assign(version, versionData);
    }

    return { assessment, version };
  }

  async publishAssessmentVersion(
    assessmentId: string,
    versionNumber: number,
    operatorId: string
  ): Promise<AssessmentVersion> {
    const assessment = this.assessments.find((a) => a.id === assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    const version = this.versions.find((v) => v.assessment_id === assessmentId && v.version_number === versionNumber);
    if (!version) throw new Error('Version not found');

    version.published_at = new Date().toISOString();
    version.published_by = operatorId;
    assessment.status = 'published';
    assessment.current_version = versionNumber;
    assessment.updated_at = new Date().toISOString();

    const operator = this.profiles.find((p) => p.id === operatorId) || { full_name: 'Admin', role: 'admin' as UserRole };
    await this.logAuditAction(
      'ASSESSMENT_PUBLISHED',
      assessment.code,
      { version: versionNumber },
      { id: operatorId, name: operator.full_name, role: operator.role }
    );

    return version;
  }

  async archiveAssessment(assessmentId: string, operatorId: string): Promise<Assessment> {
    const assessment = this.assessments.find((a) => a.id === assessmentId);
    if (!assessment) throw new Error('Assessment not found');
    assessment.status = 'archived';
    assessment.updated_at = new Date().toISOString();
    return assessment;
  }

  async updateAssessment(
    assessmentId: string,
    data: Partial<Assessment>,
    operatorId: string
  ): Promise<Assessment> {
    const assessment = this.assessments.find((a) => a.id === assessmentId);
    if (!assessment) throw new Error('Assessment not found');
    Object.assign(assessment, data, { updated_at: new Date().toISOString() });

    const operator = this.profiles.find((p) => p.id === operatorId) || { full_name: 'Admin', role: 'admin' as UserRole };
    await this.logAuditAction(
      'ASSESSMENT_UPDATED',
      assessment.code,
      { changes: Object.keys(data), updated_data: data },
      { id: operatorId, name: operator.full_name, role: operator.role }
    );
    return assessment;
  }

  async deleteAssessment(
    assessmentId: string,
    operatorId: string
  ): Promise<{ success: boolean; deleted_id: string; code: string }> {
    const index = this.assessments.findIndex((a) => a.id === assessmentId);
    if (index === -1) throw new Error('Assessment not found');
    const [deleted] = this.assessments.splice(index, 1);
    this.versions = this.versions.filter((v) => v.assessment_id !== assessmentId);

    const operator = this.profiles.find((p) => p.id === operatorId) || { full_name: 'Admin', role: 'admin' as UserRole };
    await this.logAuditAction(
      'ASSESSMENT_DELETED',
      deleted.code,
      { title: deleted.title },
      { id: operatorId, name: operator.full_name, role: operator.role }
    );
    return { success: true, deleted_id: assessmentId, code: deleted.code };
  }

  async updateAssessmentRules(
    assessmentId: string,
    rulesData: Partial<RulesDefinition>,
    operatorId: string
  ): Promise<AssessmentVersion> {
    const assessment = this.assessments.find((a) => a.id === assessmentId);
    if (!assessment) throw new Error('Assessment not found');
    const version = this.versions.find((v) => v.assessment_id === assessmentId && v.version_number === assessment.current_version);
    if (!version) throw new Error('Version not found');

    version.rules_definition = {
      ...version.rules_definition,
      ...rulesData,
    };
    assessment.updated_at = new Date().toISOString();

    const operator = this.profiles.find((p) => p.id === operatorId) || { full_name: 'Admin', role: 'admin' as UserRole };
    await this.logAuditAction(
      'ASSESSMENT_RULES_UPDATED',
      assessment.code,
      { scoring_method: version.rules_definition.scoring_method, total_cutoffs: version.rules_definition.total_cutoffs },
      { id: operatorId, name: operator.full_name, role: operator.role }
    );
    return version;
  }

  // --- Responses & Scoring ---
  async saveDraftResponse(response: Partial<AssessmentResponse>): Promise<AssessmentResponse> {
    let existing = this.responses.find((r) => r.id === response.id);
    if (existing) {
      Object.assign(existing, response, { updated_at: new Date().toISOString() });
      return existing;
    }
    const newResp: AssessmentResponse = {
      id: response.id || `resp_${Date.now()}`,
      assessment_version_id: response.assessment_version_id!,
      child_id: response.child_id!,
      respondent_id: response.respondent_id || this.currentUserId,
      respondent_role: response.respondent_role || 'parent',
      assessment_date: response.assessment_date || new Date().toISOString().split('T')[0],
      calculated_age_years: response.calculated_age_years || 0,
      calculated_age_months: response.calculated_age_months || 0,
      calculated_age_display: response.calculated_age_display || '',
      raw_answers: response.raw_answers || {},
      status: 'draft',
      privacy_consent_accepted: response.privacy_consent_accepted ?? true,
      privacy_consent_version: response.privacy_consent_version || '1.0-TH-2026',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.responses.push(newResp);
    return newResp;
  }

  async submitResponse(
    responseInput: Omit<AssessmentResponse, 'id' | 'status' | 'created_at' | 'updated_at' | 'submitted_at'>
  ): Promise<{ response: AssessmentResponse; result: AssessmentResult }> {
    const version = this.versions.find((v) => v.id === responseInput.assessment_version_id);
    if (!version) throw new Error('Assessment version not found');

    const assessment = this.assessments.find((a) => a.id === version.assessment_id);
    if (!assessment) throw new Error('Assessment not found');

    const newResponse: AssessmentResponse = {
      ...responseInput,
      id: `resp_${Date.now()}`,
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
    };
    this.responses.push(newResponse);

    const calculatedResult = evaluateAssessment(
      newResponse,
      version,
      assessment.code,
      assessment.title
    );
    this.results.push(calculatedResult);

    const operator = this.profiles.find((p) => p.id === newResponse.respondent_id) || { full_name: 'User', role: 'parent' as UserRole };
    await this.logAuditAction(
      'RESPONSE_SUBMITTED',
      newResponse.id,
      { assessment_code: assessment.code, child_id: newResponse.child_id },
      { id: newResponse.respondent_id, name: operator.full_name, role: operator.role }
    );

    return { response: newResponse, result: calculatedResult };
  }

  async getResponseById(responseId: string, requestingUserId: string): Promise<AssessmentResponse | null> {
    return this.responses.find((r) => r.id === responseId) || null;
  }

  async getResultByResponseId(responseId: string, requestingUserId: string): Promise<AssessmentResult | null> {
    return this.results.find((r) => r.response_id === responseId) || null;
  }

  async getHistoryForChild(
    childId: string,
    requestingUserId: string
  ): Promise<Array<{ response: AssessmentResponse; result: AssessmentResult }>> {
    const matchingResponses = this.responses.filter((r) => r.child_id === childId && r.status === 'submitted');
    return matchingResponses.map((response) => {
      const result = this.results.find((res) => res.response_id === response.id)!;
      return { response, result };
    });
  }

  async getAllResultsAdmin(): Promise<Array<{ response: AssessmentResponse; result: AssessmentResult; child: Child }>> {
    const list: Array<{ response: AssessmentResponse; result: AssessmentResult; child: Child }> = [];
    for (const res of this.results) {
      const resp = this.responses.find((r) => r.id === res.response_id);
      if (!resp) continue;
      const child = this.children.find((c) => c.id === resp.child_id);
      if (!child) continue;
      list.push({ response: resp, result: res, child });
    }
    return list;
  }

  // --- Audit Logs ---
  async logAuditAction(
    action: AuditLog['action'],
    targetResource: string,
    details: Record<string, any>,
    operator: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      user_id: operator.id,
      user_name: operator.name,
      user_role: operator.role,
      action,
      target_resource: targetResource,
      details,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
  }

  async getAuditLogsAdmin(limit = 100): Promise<AuditLog[]> {
    return this.auditLogs.slice(0, limit);
  }
}

// Singleton instance for in-app data sharing across components
export const sharedDataStore = new MockDataStore();
