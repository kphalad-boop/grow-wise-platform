const assert = require('assert');
const { MockDataStore } = require('../packages/shared/dist/mock-store');
const { evaluateAssessment } = require('../packages/shared/dist/scoring');

async function run() {
  console.log('=== TESTING CRITERIA CUT-OFF MODES (TOTAL VS DOMAIN VS BOTH) ===\n');

  const store = new MockDataStore();
  const operator = store.profiles[0];

  // 1. Get assessment version for KUS-SI 1
  const version = await store.getAssessmentVersion('kus-si-1-adhd');
  assert.ok(version, 'Version must exist');
  assert.strictEqual(version.rules_definition.domains.length, 2, 'KUS-SI 1 has 2 domains');

  console.log('[PASS] 1. Retrieved KUS-SI 1 version with 2 domains:');
  version.rules_definition.domains.forEach(d => console.log(`       - ${d.title_th} (max: ${d.max_possible_raw_score})`));

  // 2. Update Assessment Criteria with Cut-off Mode "both" (Overall + Per-Domain)
  const updatedRules = {
    cutoff_mode: 'both',
    total_cutoffs: [
      { min_score: 0, max_score: 25, result_level: 'normal', title_th: 'ปกติ/สมวัย', description_th: 'ไม่พบความเสี่ยง' },
      { min_score: 26, max_score: 45, result_level: 'borderline', title_th: 'เฝ้าระวัง', description_th: 'ควรสังเกตพฤติกรรม' },
      { min_score: 46, max_score: 90, result_level: 'clinical_alert', title_th: 'เสี่ยงสูง', description_th: 'ส่งต่อแพทย์วินิจฉัย ADHD' }
    ],
    domains: version.rules_definition.domains.map((d, i) => ({
      ...d,
      cutoffs: [
        { min_score: 0, max_score: 12, result_level: 'normal', title_th: 'ปกติ' },
        { min_score: 13, max_score: 22, result_level: 'borderline', title_th: 'เฝ้าระวัง' },
        { min_score: 23, max_score: 45, result_level: 'clinical_alert', title_th: 'เสี่ยงสูง' }
      ],
      clinical_advice: `คำแนะนำเฉพาะด้านที่ ${i + 1}: เฝ้าระวังพฤติกรรมในห้องเรียน`
    })),
    notes: 'ส่งต่อกุมารแพทย์ หรือจิตแพทย์เด็กเพื่อตรวจวินิจฉัย ADHD'
  };

  const updatedVersion = await store.updateAssessmentRules('kus-si-1-adhd', updatedRules, operator.id);
  assert.strictEqual(updatedVersion.rules_definition.cutoff_mode, 'both');
  assert.strictEqual(updatedVersion.rules_definition.domains[0].cutoffs.length, 3);
  assert.strictEqual(updatedVersion.rules_definition.domains[1].cutoffs.length, 3);
  console.log('[PASS] 2. Successfully updated and persisted cutoff_mode: both & per-domain cutoffs');

  // 3. Test Evaluation Scoring with Domain Cut-offs
  // Domain 1: 25 points (> 23 -> high risk / rose)
  // Domain 2: 10 points (<= 12 -> normal / emerald)
  const mockAnswers = {};
  version.schema_definition.items.slice(0, 10).forEach(item => {
    mockAnswers[item.id] = 2.5; // sum ~25 for domain 1
  });
  version.schema_definition.items.slice(15, 20).forEach(item => {
    mockAnswers[item.id] = 2.0; // sum ~10 for domain 2
  });

  const mockResponse = {
    id: 'test_resp_001',
    assessment_version_id: version.id,
    child_id: 'child_test',
    raw_answers: mockAnswers
  };

  const result = evaluateAssessment(mockResponse, updatedVersion, 'KUS-SI-1', 'แบบประเมินพฤติกรรมสมาธิสั้น');
  console.log('[PASS] 3. Scoring Engine evaluation:');
  console.log(`       - Total Score: ${result.total_raw_score} / ${result.max_possible_raw_score}`);
  console.log(`       - Domain 1 Result: ${result.domain_results[0].title_th}: score=${result.domain_results[0].raw_score}, status=${result.domain_results[0].status_badge}, color=${result.domain_results[0].color_code}`);
  console.log(`       - Domain 2 Result: ${result.domain_results[1].title_th}: score=${result.domain_results[1].raw_score}, status=${result.domain_results[1].status_badge}, color=${result.domain_results[1].color_code}`);
  console.log(`       - Has Clinical Alert: ${result.has_clinical_alert}`);

  assert.strictEqual(result.domain_results[0].status_badge, 'เสี่ยงสูง');
  assert.strictEqual(result.domain_results[0].color_code, 'rose');
  assert.strictEqual(result.domain_results[1].status_badge, 'ปกติ');
  assert.strictEqual(result.domain_results[1].color_code, 'emerald');
  assert.strictEqual(result.has_clinical_alert, true);

  // 4. Test Audit Log
  const logs = await store.getAuditLogsAdmin(5);
  const rulesLog = logs.find(l => l.action === 'ASSESSMENT_RULES_UPDATED');
  assert.ok(rulesLog, 'Audit log must record ASSESSMENT_RULES_UPDATED');
  console.log('[PASS] 4. Audit Log logged ASSESSMENT_RULES_UPDATED');

  console.log('\n=== ALL CRITERIA & CUT-OFFS UNIT TESTS PASSED (100%) ===');
}

run().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
