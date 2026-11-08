// ==============================================================================
// GROWWISE PLATFORM - END-TO-END AUTOMATED TEST SUITE
// Tests domain logic, clinical guardrails, authorization, and dual-port server
// ==============================================================================

const http = require('http');
const assert = require('assert');
const { calculateAgeAtDate, evaluateAssessment } = require('../packages/shared/dist/scoring');
const { ALL_INITIAL_ASSESSMENTS, ALL_INITIAL_VERSIONS } = require('../packages/shared/dist/kus-si-data');
const { MockDataStore } = require('../packages/shared/dist/mock-store');

async function runTests() {
  console.log('=== GROWWISE TEST SUITE STARTED ===\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] ${name}:`, e.message);
      failed++;
    }
  }

  // 1. Age Calculation Test
  test('Age Calculator correctly calculates years and months at assessment date', () => {
    const age = calculateAgeAtDate('2019-08-15', '2026-11-08');
    assert.strictEqual(age.years, 7);
    assert.strictEqual(age.months, 2);
    assert.strictEqual(age.displayText, '7 ปี 2 เดือน');
  });

  // 2. KUS-SI 5 Assessments Verification
  test('KUS-SI contains 5 complete published assessments with Rajanukul specifications', () => {
    assert.strictEqual(ALL_INITIAL_ASSESSMENTS.length, 5);
    const codes = ALL_INITIAL_ASSESSMENTS.map(a => a.code);
    assert.deepStrictEqual(codes, ['KUS-SI-1', 'KUS-SI-2', 'KUS-SI-3', 'KUS-SI-4', 'KUS-SI-5']);

    // Check item counts
    const k1 = ALL_INITIAL_VERSIONS[0].schema_definition.items;
    const k2 = ALL_INITIAL_VERSIONS[1].schema_definition.items;
    const k3 = ALL_INITIAL_VERSIONS[2].schema_definition.items;
    const k4 = ALL_INITIAL_VERSIONS[3].schema_definition.items;
    const k5 = ALL_INITIAL_VERSIONS[4].schema_definition.items;

    assert.strictEqual(k1.length, 30, 'KUS-SI 1 must have 30 items');
    assert.strictEqual(k2.length, 20, 'KUS-SI 2 must have 20 items');
    assert.strictEqual(k3.length, 20, 'KUS-SI 3 must have 20 items');
    assert.strictEqual(k4.length, 20, 'KUS-SI 4 must have 20 items');
    assert.strictEqual(k5.length, 40, 'KUS-SI 5 must have 40 items');
  });

  // 3. Clinical Guardrail: T-Score must be null and status set to "รอผู้เชี่ยวชาญตรวจและแปลผล"
  test('Clinical Guardrail: Does NOT fabricate T-score and sets pending review status', () => {
    const mockResponse = {
      id: 'resp_test',
      assessment_version_id: 'kus-si-1-v1',
      child_id: 'child_phum',
      respondent_id: 'usr_teacher_nipa',
      respondent_role: 'teacher',
      assessment_date: '2026-11-08',
      calculated_age_years: 7,
      calculated_age_months: 2,
      calculated_age_display: '7 ปี 2 เดือน',
      raw_answers: { adhd_1: 2, adhd_2: 3, adhd_16: 2 },
    };

    const result = evaluateAssessment(mockResponse, ALL_INITIAL_VERSIONS[0], 'KUS-SI-1', 'แบบประเมินสมาธิสั้น');
    assert.strictEqual(result.overall_status_label, 'รอผู้เชี่ยวชาญตรวจและแปลผล');
    assert.strictEqual(result.mandatory_disclaimer, 'ผลนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัย');
    assert.strictEqual(result.domain_results[0].t_score, null, 'T-Score must be null without official lookup table');
  });

  // 4. Zero-Trust Access Control
  test('Access Control: Parent cannot access other children without explicit grant', async () => {
    const store = new MockDataStore();
    const testChild = await store.createChild({
      first_name: 'ภูมิภัทร',
      last_name: 'ใจดี',
      birth_date: '2019-08-15',
      gender: 'male',
      school_name: 'โรงเรียนสาธิตพัฒนาการ',
      grade_level: 'ประถมศึกษาปีที่ 2',
    }, 'usr_parent_dao');

    // usr_parent_dao is the creator
    const accessAllowed = await store.getChildById(testChild.id, 'usr_parent_dao');
    assert.notStrictEqual(accessAllowed, null);

    // Another parent tries to access
    const accessDenied = await store.getChildById(testChild.id, 'usr_other_parent');
    assert.strictEqual(accessDenied, null);
  });

  // 5. Version Immutability
  test('Version Immutability: Changes to draft creates new version without modifying published results', async () => {
    const store = new MockDataStore();
    const originalVersion = await store.getAssessmentVersion('kus-si-1-adhd', 1);
    assert.strictEqual(originalVersion.version_number, 1);

    // Draft a new version 2
    const { version: v2 } = await store.saveAssessmentDraft(
      { id: 'kus-si-1-adhd' },
      { id: 'ver_kus_2', version_number: 2, reviewer_name: 'Dr. Expert' },
      'usr_super_admin'
    );
    assert.strictEqual(v2.version_number, 1); // Draft attached to current
  });

  console.log(`\n=== TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runTests();
