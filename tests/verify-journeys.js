// ==============================================================================
// GROWWISE PLATFORM - END-TO-END JOURNEY & SECURITY VERIFICATION
// Verifies Complete User Journey, Admin Journey, and Security Isolation
// ==============================================================================

const assert = require('assert');
const { MockDataStore } = require('../packages/shared/dist/mock-store');
const { calculateAgeAtDate, evaluateAssessment } = require('../packages/shared/dist/scoring');

async function verifyFullSystem() {
  console.log('================================================================');
  console.log('   GROWWISE FULL END-TO-END SYSTEM VERIFICATION');
  console.log('================================================================\n');

  const store = new MockDataStore();
  let step = 1;

  function reportStep(title) {
    console.log(`[STEP ${step++}] ${title}`);
  }

  // --- JOURNEY 1: USER JOURNEY ---
  console.log('>>> TESTING JOURNEY 1: USER JOURNEY (PARENT & TEACHER) <<<');

  reportStep('ผู้ปกครองเข้าสู่ระบบ');
  const loginRes = await store.login('dao.jaidee@gmail.com');
  assert.strictEqual(loginRes.user.role, 'parent');
  console.log(`  -> ผู้ปกครองยืนยันตัวตนสำเร็จ: ${loginRes.user.full_name}`);

  reportStep('เพิ่มข้อมูลเด็กใหม่ และคำนวณอายุ ณ วันที่ประเมิน');
  const newChild = await store.createChild({
    first_name: 'นเรศ',
    last_name: 'สุขใจ',
    nickname: 'น้องนนท์',
    birth_date: '2018-05-20',
    gender: 'male',
    school_name: 'โรงเรียนอนุบาลสาธิต',
    grade_level: 'ป.3',
  }, loginRes.user.id);
  assert.ok(newChild.id);
  const evalDate = '2026-11-08';
  const ageAtEval = calculateAgeAtDate(newChild.birth_date, evalDate);
  assert.strictEqual(ageAtEval.years, 8);
  assert.strictEqual(ageAtEval.months, 5);
  console.log(`  -> เพิ่มเด็กสำเร็จ: ${newChild.first_name} (อายุ ณ วันประเมิน: ${ageAtEval.displayText})`);

  reportStep('ผูกสิทธิ์การสังเกตการณ์ให้คุณครูประจำชั้น (Kru Nipa)');
  const grant = await store.grantTeacherAccess(newChild.id, 'usr_teacher_nipa', loginRes.user.id);
  assert.strictEqual(grant.status, 'active');
  console.log(`  -> ผูกสิทธิ์สำเร็จ: Grant ID ${grant.id}`);

  reportStep('คุณครูเข้าสู่ระบบและเห็นเด็กที่ได้รับสิทธิ์');
  const teacherChildren = await store.getChildrenForUser('usr_teacher_nipa', 'teacher');
  const hasChild = teacherChildren.some(c => c.id === newChild.id);
  assert.strictEqual(hasChild, true);
  console.log(`  -> คุณครูเห็นเด็กในความดูแล ${teacherChildren.length} คน (รวมน้องนนท์)`);

  reportStep('คุณครูดึงแบบประเมิน KUS-SI 1 (ADHD) และบันทึกร่างคำตอบ (Save Draft)');
  const kus1Version = await store.getAssessmentVersion('kus-si-1-adhd', 1);
  assert.ok(kus1Version);
  const draft = await store.saveDraftResponse({
    assessment_version_id: kus1Version.id,
    child_id: newChild.id,
    respondent_id: 'usr_teacher_nipa',
    respondent_role: 'teacher',
    raw_answers: { adhd_1: 2, adhd_2: 3, adhd_3: 1 },
  });
  assert.strictEqual(draft.status, 'draft');
  console.log(`  -> บันทึกร่างคำตอบสำเร็จ: ID ${draft.id}`);

  reportStep('คุณครูตอบครบ 30 ข้อ และส่งแบบประเมิน (Submit Assessment)');
  const completeAnswers = {};
  for (let i = 1; i <= 30; i++) {
    completeAnswers[`adhd_${i}`] = (i % 4); // ค่าคะแนน 0, 1, 2, 3
  }
  const submitRes = await store.submitResponse({
    assessment_version_id: kus1Version.id,
    child_id: newChild.id,
    respondent_id: 'usr_teacher_nipa',
    respondent_role: 'teacher',
    assessment_date: evalDate,
    calculated_age_years: ageAtEval.years,
    calculated_age_months: ageAtEval.months,
    calculated_age_display: ageAtEval.displayText,
    raw_answers: completeAnswers,
    privacy_consent_accepted: true,
    privacy_consent_version: '1.0-TH-2026',
  });
  assert.strictEqual(submitRes.response.status, 'submitted');
  assert.ok(submitRes.result.total_raw_score > 0);
  assert.strictEqual(submitRes.result.overall_status_label, 'รอผู้เชี่ยวชาญตรวจและแปลผล');
  assert.strictEqual(submitRes.result.mandatory_disclaimer, 'ผลนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัย');
  assert.strictEqual(submitRes.result.domain_results[0].t_score, null);
  console.log(`  -> ส่งแบบประเมินสำเร็จ! คะแนนดิบรวม: ${submitRes.result.total_raw_score} / 90 (T-Score: null / Protected)`);

  reportStep('ผู้ปกครองเปิดดูประวัติย้อนหลังของเด็ก (History)');
  const history = await store.getHistoryForChild(newChild.id, loginRes.user.id);
  assert.strictEqual(history.length, 1);
  console.log(`  -> ผู้ปกครองเห็นผลประเมินย้อนหลัง 1 รายการตรงกัน\n`);

  // --- JOURNEY 2: ADMIN JOURNEY ---
  console.log('>>> TESTING JOURNEY 2: ADMIN JOURNEY & VERSIONING <<<');

  reportStep('Admin ตรวจสอบ Dashboard สถิติทางการแพทย์');
  const statsUsers = await store.getAllUsersAdmin();
  const allResults = await store.getAllResultsAdmin();
  assert.ok(statsUsers.length >= 5);
  assert.ok(allResults.length >= 1);
  console.log(`  -> แดชบอร์ดมีผู้ใช้ ${statsUsers.length} คน และผลประเมิน ${allResults.length} เคส`);

  reportStep('Admin สร้างแบบประเมินใหม่ในสถานะร่าง (Draft Custom Assessment)');
  const { assessment: customAsm, version: customVer } = await store.saveAssessmentDraft(
    {
      code: 'TEST-DEV-1',
      title: 'แบบประเมินพัฒนาการด้านการเคลื่อนไหว',
      description: 'ประเมินกล้ามเนื้อมัดใหญ่',
      min_age_months: 36,
      max_age_months: 72,
      target_roles: ['parent', 'teacher'],
    },
    {
      version_number: 1,
      schema_definition: { scale: [], sections: [], items: [] },
      rules_definition: { scoring_method: 'domain_sum', missing_item_handling: 'error', domains: [], has_validated_t_scores: false },
    },
    'usr_admin'
  );
  assert.strictEqual(customAsm.status, 'draft');
  console.log(`  -> สร้างร่างแบบประเมินสำเร็จ: ${customAsm.code} (Status: ${customAsm.status})`);

  reportStep('User Web App ต้องยังไม่เห็นแบบประเมินที่อยู่ในสถานะ Draft');
  const userPublishedBefore = await store.getPublishedAssessments();
  assert.strictEqual(userPublishedBefore.some(a => a.code === 'TEST-DEV-1'), false);
  console.log(`  -> ปลอดภัย: User Web App ไม่เห็นแบบประเมินที่ยังไม่ Publish`);

  reportStep('Admin ดำเนินการเผยแพร่แบบประเมิน (Publish Version 1)');
  const pubVer = await store.publishAssessmentVersion(customAsm.id, 1, 'usr_admin');
  assert.ok(pubVer.published_at);
  const userPublishedAfter = await store.getPublishedAssessments();
  assert.strictEqual(userPublishedAfter.some(a => a.code === 'TEST-DEV-1'), true);
  console.log(`  -> เผยแพร่สำเร็จ! User Web App มองเห็นแบบประเมินใหม่ทันที\n`);

  // --- JOURNEY 3: SECURITY & DATA PRIVACY ---
  console.log('>>> TESTING JOURNEY 3: SECURITY & ACCESS CONTROL ISOLATION <<<');

  reportStep('Zero-Trust Test: ผู้ปกครองอื่นไม่สามารถเข้าถึงข้อมูลของน้องนนท์ได้');
  const unauthorizedAccess = await store.getChildById(newChild.id, 'usr_stranger_parent');
  assert.strictEqual(unauthorizedAccess, null);
  console.log(`  -> ยืนยันความปลอดภัย: ระบบปฏิเสธการเข้าถึงข้อมูลเด็กข้ามบัญชี 100%`);

  reportStep('Audit Trail Test: ตรวจสอบบันทึกการกระทำความปลอดภัย');
  const auditLogs = await store.getAuditLogsAdmin(10);
  assert.ok(auditLogs.length > 0);
  console.log(`  -> มีการบันทึก Audit Logs อย่างละเอียด: ${auditLogs[0].action} โดย ${auditLogs[0].user_name}`);

  console.log('\n================================================================');
  console.log('   ALL E2E JOURNEYS & SECURITY CHECKS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

verifyFullSystem().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
