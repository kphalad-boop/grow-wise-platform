const { MockDataStore } = require('../packages/shared/dist/mock-store');

async function testImportExportTypes() {
  console.log('=== TESTING MIXED ANSWER TYPES & ASSESSMENT CREATION ===');
  const store = new MockDataStore();

  const child = await store.createChild({
    first_name: 'กานต์',
    last_name: 'พัฒนา',
    birth_date: '2020-05-10',
    gender: 'female',
    special_notes: 'ทดสอบ 3 รูปแบบคำตอบ'
  }, 'parent0001');

  const customAssessment = {
    code: 'CUSTOM-DEV-3TYPES',
    title: 'แบบประเมินทดสอบ 3 รูปแบบคำตอบ',
    description: 'ทดสอบ rating_scale, boolean, single_choice',
    min_age_months: 36,
    max_age_months: 120,
    target_roles: ['parent', 'teacher'],
    status: 'draft'
  };

  const customVersion = {
    schema_definition: {
      sections: [
        { id: 'sec1', title: 'หมวดผสมผสาน', order: 1, item_ids: ['q1', 'q2', 'q3'] }
      ],
      items: [
        {
          id: 'q1',
          section_id: 'sec1',
          number: 1,
          text: 'เด็กสามารถนั่งนิ่งฟังนิทานได้ 10 นาที',
          question_type: 'rating_scale',
          scale_type: '0-3',
          options: [{ value: 0, label: 'ไม่พบ' }, { value: 1, label: 'เล็กน้อย' }, { value: 2, label: 'ปานกลาง' }, { value: 3, label: 'รุนแรง' }],
          max_score: 3,
          is_required: true
        },
        {
          id: 'q2',
          section_id: 'sec1',
          number: 2,
          text: 'เด็กสามารถแปรงฟันได้เอง',
          question_type: 'boolean',
          options: [{ value: 1, label: 'ใช่ (ผ่าน)' }, { value: 0, label: 'ไม่ใช่ (ไม่ผ่าน)' }],
          max_score: 1,
          is_required: true
        },
        {
          id: 'q3',
          section_id: 'sec1',
          number: 3,
          text: 'ระดับการเข้าสังคมกับเพื่อน',
          question_type: 'single_choice',
          options: [
            { value: 0, label: 'แยกตัวอยู่คนเดียว' },
            { value: 2, label: 'เล่นเป็นกลุ่มเล็กๆ' },
            { value: 4, label: 'เข้ากับทุกคนได้ดี' }
          ],
          max_score: 4,
          is_required: true
        }
      ]
    },
    rules_definition: {
      scoring_method: 'domain_sum',
      missing_item_handling: 'error',
      has_validated_t_scores: false,
      domains: [
        {
          domain_id: 'sec1',
          title_th: 'คะแนนรวมหมวดผสมผสาน',
          item_ids: ['q1', 'q2', 'q3'],
          max_possible_raw_score: 8
        }
      ]
    }
  };

  const created = await store.saveAssessmentDraft(customAssessment, customVersion, 'admin0100');
  console.log('[PASS] Draft Created with ID:', created.assessment.id, 'Code:', created.assessment.code);

  await store.publishAssessmentVersion(created.assessment.id, 1, 'admin0100');
  console.log('[PASS] Assessment published successfully');

  const responseData = {
    assessment_version_id: created.version.id,
    child_id: child.id,
    respondent_id: 'parent0001',
    respondent_role: 'parent',
    raw_answers: {
      q1: 2, // rating scale: 2
      q2: 1, // boolean: 1
      q3: 4  // single choice: 4
    }
  };

  const result = await store.submitResponse(responseData);
  console.log('[PASS] Submission Result Total Raw Score:', result.result.total_raw_score, '/', result.result.max_possible_raw_score);
  if (result.result.total_raw_score === 7 && result.result.max_possible_raw_score === 8) {
    console.log('[PASS] Score calculation for 3 question types verified 100% correct!');
  } else {
    throw new Error('Score calculation mismatch!');
  }
}

testImportExportTypes().catch(e => { console.error(e); process.exit(1); });
