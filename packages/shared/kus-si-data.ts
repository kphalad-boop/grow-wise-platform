// ==============================================================================
// GROWWISE PLATFORM - KUS-SI RATING SCALES DEFINITIONS (5 SETS COMPLETE)
// อ้างอิง: แบบคัดกรองพฤติกรรมเด็ก KUS-SI (โรงพยาบาลราชานุกูล กรมสุขภาพจิต)
// PDF: https://th.rajanukul.go.th/_admin/file-download/D0000065.pdf
// ==============================================================================

import { Assessment, AssessmentItem, AssessmentVersion, QuestionOption } from './types';

// สเกลการให้คะแนน KUS-SI มาตรฐาน 0 - 3
export const KUS_SI_SCALE: QuestionOption[] = [
  { value: 0, label: '0 = ไม่พบพฤติกรรมนี้เลย', score: 0 },
  { value: 1, label: '1 = พบพฤติกรรมนี้เล็กน้อย / นานๆ ครั้ง', score: 1 },
  { value: 2, label: '2 = พบพฤติกรรมนี้ค่อนข้างบ่อย / สัปดาห์ละ 2-3 ครั้ง', score: 2 },
  { value: 3, label: '3 = พบพฤติกรรมนี้บ่อยมาก / เป็นประจำเกือบทุกวัน', score: 3 },
];

// ------------------------------------------------------------------------------
// ชุดที่ 1: KUS-SI 1 - แบบประเมินพฤติกรรมสมาธิสั้น (ADHD Rating Scale)
// รวม 30 ข้อ: ด้านซน/วู่วาม (15 ข้อ) + ด้านขาดสมาธิ (15 ข้อ)
// ------------------------------------------------------------------------------
export const KUS_SI_1_ASSESSMENT: Assessment = {
  id: 'kus-si-1-adhd',
  code: 'KUS-SI-1',
  title: 'KUS-SI 1: แบบประเมินพฤติกรรมสมาธิสั้น (ADHD)',
  description: 'แบบประเมินและคัดกรองพฤติกรรมความซน วู่วาม อยู่ไม่นิ่ง และพฤติกรรมขาดสมาธิในชั้นเรียน สำหรับคุณครูประจำชั้นหรือครูผู้สอน',
  purpose: 'คัดกรองพฤติกรรมเสี่ยงภาวะสมาธิสั้นในโรงเรียน เพื่อส่งต่อผู้เชี่ยวชาญตรวจวินิจฉัยทางการแพทย์',
  estimated_time_minutes: 10,
  min_age_months: 60, // 5 ปีขึ้นไป (ระดับชั้นอนุบาล 3 - มัธยม)
  max_age_months: 216, // 18 ปี
  target_roles: ['teacher', 'specialist'],
  status: 'published',
  current_version: 1,
  created_at: '2026-11-01T00:00:00.000Z',
  updated_at: '2026-11-01T00:00:00.000Z',
};

const KUS_SI_1_ITEMS: AssessmentItem[] = [
  // ด้านที่ 1: ซน วู่วาม และอยู่ไม่นิ่ง (15 ข้อ)
  { id: 'adhd_1', section_id: 'hyperactive_impulsive', number: 1, text: 'ยุกยิก มือเท้าขยับไปมา นั่งบิดตัวไปมาบนเก้าอี้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_2', section_id: 'hyperactive_impulsive', number: 2, text: 'ลุกออกจากที่นั่งในห้องเรียนโดยไม่ได้รับอนุญาตหรือในเวลาที่ต้องนั่ง', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_3', section_id: 'hyperactive_impulsive', number: 3, text: 'วิ่งหรือปีนป่ายในห้องเรียนหรือในสถานที่ไม่เหมาะสม', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_4', section_id: 'hyperactive_impulsive', number: 4, text: 'ทำกิจกรรมเงียบๆ ไม่ค่อยได้ มักมีเสียงดังรบกวนผู้อื่น', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_5', section_id: 'hyperactive_impulsive', number: 5, text: 'เคลื่อนไหวตลอดเวลา เหมือนติดเครื่องยนต์ วิ่งวุ่น', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_6', section_id: 'hyperactive_impulsive', number: 6, text: 'พูดมาก พูดจ้อ พูดไม่หยุดในเวลาที่ไม่สมควร', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_7', section_id: 'hyperactive_impulsive', number: 7, text: 'โพล่งคำตอบออกมาก่อนที่ครูจะถามจบประโยค', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_8', section_id: 'hyperactive_impulsive', number: 8, text: 'รอคอยไม่เป็น เช่น รอเข้าแถว หรือรอตามลำดับไม่ได้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_9', section_id: 'hyperactive_impulsive', number: 9, text: 'พูดแทรก หรือขัดจังหวะการสนทนาของครูหรือเพื่อน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_10', section_id: 'hyperactive_impulsive', number: 10, text: 'เล่นแรง เล่นแผลงๆ กับเพื่อนโดยไม่ระวังความปลอดภัย', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_11', section_id: 'hyperactive_impulsive', number: 11, text: 'ใจร้อน เอาแต่ใจตัวเองเมื่อไม่ได้สิ่งที่ต้องการในทันที', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_12', section_id: 'hyperactive_impulsive', number: 12, text: 'ชอบแหย่ ก่อกวน หรือแกล้งเพื่อนในห้องเรียน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_13', section_id: 'hyperactive_impulsive', number: 13, text: 'หยิบจับสิ่งของของคนอื่นมาเล่นโดยไม่ขออนุญาต', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_14', section_id: 'hyperactive_impulsive', number: 14, text: 'มักทำข้าวของตกหล่นหรือชนโต๊ะเก้าอี้ขณะเดิน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_15', section_id: 'hyperactive_impulsive', number: 15, text: 'มีปฏิกิริยาตอบสนองทางอารมณ์เร็ว โกรธง่าย วู่วาม', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },

  // ด้านที่ 2: ขาดสมาธิ (15 ข้อ)
  { id: 'adhd_16', section_id: 'inattentive', number: 16, text: 'ไม่ละเอียดรอบคอบ สะเพร่า ทำงานตกๆ หล่นๆ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_17', section_id: 'inattentive', number: 17, text: 'วอกแวกง่าย สิ่งเร้าภายนอกเล็กน้อยก็เบี่ยงเบนความสนใจได้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_18', section_id: 'inattentive', number: 18, text: 'เหม่อลอย เหมือนไม่ได้ฟังเวลาที่ครูกำลังพูดด้วยตัวต่อตัว', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_19', section_id: 'inattentive', number: 19, text: 'ทำงานไม่เสร็จตามกำหนดหรือทำไม่ครบตามขั้นตอน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_20', section_id: 'inattentive', number: 20, text: 'จัดระบบงานหรือเตรียมอุปกรณ์การเรียนไม่เป็นระเบียบ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_21', section_id: 'inattentive', number: 21, text: 'หลีกเลี่ยงหรือไม่ชอบงานที่ต้องใช้ความพยายามต่อเนื่อง เช่น การบ้าน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_22', section_id: 'inattentive', number: 22, text: 'ทำของหายบ่อยๆ เช่น ดินสอ ยางลบ สมุดการบ้าน หนังสือ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_23', section_id: 'inattentive', number: 23, text: 'ขี้ลืมในกิจวัตรประจำวัน เช่น ลืมส่งงาน ลืมอุปกรณ์', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_24', section_id: 'inattentive', number: 24, text: 'สมาธิสั้นเมื่อเทียบกับเพื่อนในวัยเดียวกัน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_25', section_id: 'inattentive', number: 25, text: 'เปลี่ยนกิจกรรมไปมาบ่อย ไม่ทำอะไรอย่างใดอย่างหนึ่งนานๆ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_26', section_id: 'inattentive', number: 26, text: 'ต้องมีคนคอยเตือนหรือกระตุ้นให้ทำงานอยู่ตลอดเวลา', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_27', section_id: 'inattentive', number: 27, text: 'อ่านหนังสือข้ามบรรทัดหรือเขียนสะกดคำตกหล่นบ่อยเพราะขาดความใส่ใจ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_28', section_id: 'inattentive', number: 28, text: 'จับใจความคำสั่งที่ครูบอกหลายขั้นตอนไม่ได้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_29', section_id: 'inattentive', number: 29, text: 'เริ่มทำงานช้า ลีลา หรือผัดวันประกันพรุ่ง', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'adhd_30', section_id: 'inattentive', number: 30, text: 'ดูเหมือนไม่มีพลังในการทำงานที่ไม่สนใจ แต่จะจดจ่อได้ดีกับสิ่งที่ชอบเฉพาะตัว', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
];

export const KUS_SI_1_VERSION: AssessmentVersion = {
  id: 'kus-si-1-v1',
  assessment_id: 'kus-si-1-adhd',
  version_number: 1,
  reviewer_name: 'นพ. ผู้เชี่ยวชาญด้านจิตเวชเด็กและวัยรุ่น (ตัวอย่างทดสอบ)',
  reviewer_role: 'Child Psychiatrist',
  published_by: 'admin',
  published_at: '2026-11-01T00:00:00.000Z',
  changelog: 'นำเข้าโครงสร้าง 30 ข้อตามแบบคัดกรอง KUS-SI สถาบันราชานุกูล',
  is_prototype_sample: true,
  schema_definition: {
    scale: KUS_SI_SCALE,
    sections: [
      {
        id: 'hyperactive_impulsive',
        title: 'หมวดที่ 1: พฤติกรรมซน วู่วาม และอยู่ไม่นิ่ง (15 ข้อ)',
        description: 'สังเกตพฤติกรรมการเคลื่อนไหว ความอดทนรอคอย และการควบคุมตนเองในห้องเรียน',
        order: 1,
        item_ids: KUS_SI_1_ITEMS.slice(0, 15).map((i) => i.id),
      },
      {
        id: 'inattentive',
        title: 'หมวดที่ 2: พฤติกรรมขาดสมาธิ (15 ข้อ)',
        description: 'สังเกตการตั้งใจฟัง ความรอบคอบในการทำงาน และการจัดระเบียบอุปกรณ์',
        order: 2,
        item_ids: KUS_SI_1_ITEMS.slice(15).map((i) => i.id),
      },
    ],
    items: KUS_SI_1_ITEMS,
  },
  rules_definition: {
    scoring_method: 'domain_sum',
    missing_item_handling: 'error',
    has_validated_t_scores: false, // บังคับ Guardrail: รอเอกสารแปลง T-Score ที่สมบูรณ์
    notes: 'คะแนนดิบรายด้านสูงสุด 45 คะแนน และรวม 90 คะแนน ไม่สามารถนำคะแนนดิบไปเทียบเกณฑ์ T-Score โดยไม่มีตารางมาตรฐาน',
    domains: [
      {
        domain_id: 'hyperactive_impulsive',
        title_th: 'ด้านซน วู่วาม และอยู่ไม่นิ่ง',
        item_ids: KUS_SI_1_ITEMS.slice(0, 15).map((i) => i.id),
        max_possible_raw_score: 45,
      },
      {
        domain_id: 'inattentive',
        title_th: 'ด้านขาดสมาธิ',
        item_ids: KUS_SI_1_ITEMS.slice(15).map((i) => i.id),
        max_possible_raw_score: 45,
      },
    ],
  },
};

// ------------------------------------------------------------------------------
// ชุดที่ 2: KUS-SI 2 - แบบประเมินภาวะบกพร่องทางการเรียนรู้ ด้านการอ่าน (LD Reading)
// รวม 20 ข้อ
// ------------------------------------------------------------------------------
export const KUS_SI_2_ASSESSMENT: Assessment = {
  id: 'kus-si-2-reading',
  code: 'KUS-SI-2',
  title: 'KUS-SI 2: แบบประเมินภาวะบกพร่องทางการเรียนรู้ ด้านการอ่าน (LD Reading)',
  description: 'แบบประเมินทักษะและความยากลำบากในการอ่านออกเสียง การแจกลูกสะกดคำ และการจับใจความ สำหรับคุณครู',
  purpose: 'คัดกรองความเสี่ยงภาวะบกพร่องทางการเรียนรู้ด้านการอ่านในชั้นเรียน',
  estimated_time_minutes: 8,
  min_age_months: 72, // 6 ปีขึ้นไป (ประถมศึกษาปีที่ 1 ขึ้นไป)
  max_age_months: 216,
  target_roles: ['teacher', 'specialist'],
  status: 'published',
  current_version: 1,
  created_at: '2026-11-01T00:00:00.000Z',
  updated_at: '2026-11-01T00:00:00.000Z',
};

const KUS_SI_2_ITEMS: AssessmentItem[] = [
  { id: 'ldr_1', section_id: 'reading_basic', number: 1, text: 'จำพยัญชนะ สระ หรือวรรณยุกต์ไทยไม่ได้ตามระดับชั้น', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_2', section_id: 'reading_basic', number: 2, text: 'สับสนพยัญชนะที่รูปคล้ายกัน เช่น ด-ต, บ-ป, ภ-ถ, ข-ช', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_3', section_id: 'reading_basic', number: 3, text: 'ออกเสียงพยัญชนะหรือสระไม่ถูกต้อง', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_4', section_id: 'reading_basic', number: 4, text: 'แจกลูกสะกดคำคำง่ายๆ ไม่ได้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_5', section_id: 'reading_basic', number: 5, text: 'อ่านออกเสียงช้า ตะกุกตะกัก ไม่คล่องตามวัย', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_6', section_id: 'reading_basic', number: 6, text: 'อ่านเพิ่มคำ ตกคำ หรือข้ามคำในประโยค', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_7', section_id: 'reading_basic', number: 7, text: 'อ่านข้ามบรรทัด หรือต้องใช้นิ้วชี้ตามตัวหนังสือตลอดเวลา', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_8', section_id: 'reading_basic', number: 8, text: 'เดาคำอ่านจากภาพประกอบหรือตัวอักษรตัวแรก', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_9', section_id: 'reading_basic', number: 9, text: 'สับสนการผันเสียงวรรณยุกต์ เอก โท ตรี จัตวา', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_10', section_id: 'reading_basic', number: 10, text: 'อ่านคำควบกล้ำหรืออักษรนำไม่ได้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_11', section_id: 'reading_comprehension', number: 11, text: 'อ่านจบแล้วบอกใจความสำคัญหรือเรื่องย่อไม่ได้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_12', section_id: 'reading_comprehension', number: 12, text: 'ตอบคำถามจากเรื่องสั้นๆ ที่อ่านไม่ได้ ทั้งที่ฟังคนอื่นเล่าแล้วเข้าใจ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_13', section_id: 'reading_comprehension', number: 13, text: 'ไม่เข้าใจความหมายของคำศัพท์ที่พบบ่อยในบทเรียน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_14', section_id: 'reading_comprehension', number: 14, text: 'อ่านโจทย์ปัญหาไม่เข้าใจ แต่สามารถคิดคำนวณได้เมื่อครูอ่านให้ฟัง', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_15', section_id: 'reading_comprehension', number: 15, text: 'ไม่เข้าใจข้อความหรือป้ายคำสั่งที่เป็นตัวหนังสือ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_16', section_id: 'reading_attitude', number: 16, text: 'ปฏิเสธหรือหลีกเลี่ยงกิจกรรมที่ต้องอ่านหนังสือ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_17', section_id: 'reading_attitude', number: 17, text: 'บ่นปวดหัว ปวดตา หรือเหนื่อยล้าเร็วเวลาอ่านหนังสือ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_18', section_id: 'reading_attitude', number: 18, text: 'ขาดความมั่นใจ กลัวการถูกเรียกให้อ่านหนังสือหน้าชั้นเรียน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_19', section_id: 'reading_attitude', number: 19, text: 'ใช้เวลาอ่านหนังสือนานกว่าเพื่อนรุ่นเดียวกันมาก', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldr_20', section_id: 'reading_attitude', number: 20, text: 'ความสามารถด้านการอ่านต่ำกว่าระดับสติปัญญาอย่างเห็นได้ชัด', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
];

export const KUS_SI_2_VERSION: AssessmentVersion = {
  id: 'kus-si-2-v1',
  assessment_id: 'kus-si-2-reading',
  version_number: 1,
  reviewer_name: 'ศ.ดร. ด้านจิตวิทยาและการศึกษาพิเศษ (ตัวอย่างทดสอบ)',
  reviewer_role: 'Educational Psychologist',
  published_by: 'admin',
  published_at: '2026-11-01T00:00:00.000Z',
  changelog: 'นำเข้าแบบคัดกรอง KUS-SI 2 ด้านการอ่าน 20 ข้อ',
  is_prototype_sample: true,
  schema_definition: {
    scale: KUS_SI_SCALE,
    sections: [
      { id: 'reading_basic', title: 'ทักษะการอ่านคำและการสะกดคำ (ข้อ 1-10)', order: 1, item_ids: KUS_SI_2_ITEMS.slice(0, 10).map((i) => i.id) },
      { id: 'reading_comprehension', title: 'การอ่านจับใจความและความเข้าใจ (ข้อ 11-15)', order: 2, item_ids: KUS_SI_2_ITEMS.slice(10, 15).map((i) => i.id) },
      { id: 'reading_attitude', title: 'พฤติกรรมและปฏิกิริยาต่อการอ่าน (ข้อ 16-20)', order: 3, item_ids: KUS_SI_2_ITEMS.slice(15).map((i) => i.id) },
    ],
    items: KUS_SI_2_ITEMS,
  },
  rules_definition: {
    scoring_method: 'domain_sum',
    missing_item_handling: 'error',
    has_validated_t_scores: false,
    domains: [
      { domain_id: 'reading_overall', title_th: 'ผลรวมด้านการอ่าน (LD Reading)', item_ids: KUS_SI_2_ITEMS.map((i) => i.id), max_possible_raw_score: 60 },
    ],
  },
};

// ------------------------------------------------------------------------------
// ชุดที่ 3: KUS-SI 3 - แบบประเมินภาวะบกพร่องทางการเรียนรู้ ด้านการเขียน (LD Writing)
// รวม 20 ข้อ
// ------------------------------------------------------------------------------
export const KUS_SI_3_ASSESSMENT: Assessment = {
  id: 'kus-si-3-writing',
  code: 'KUS-SI-3',
  title: 'KUS-SI 3: แบบประเมินภาวะบกพร่องทางการเรียนรู้ ด้านการเขียน (LD Writing)',
  description: 'แบบประเมินทักษะการเขียนพยัญชนะ การสะกดคำ การคัดลอก และการเขียนสื่อความ สำหรับคุณครู',
  purpose: 'คัดกรองความเสี่ยงภาวะบกพร่องทางการเรียนรู้ด้านการเขียนในโรงเรียน',
  estimated_time_minutes: 8,
  min_age_months: 72,
  max_age_months: 216,
  target_roles: ['teacher', 'specialist'],
  status: 'published',
  current_version: 1,
  created_at: '2026-11-01T00:00:00.000Z',
  updated_at: '2026-11-01T00:00:00.000Z',
};

const KUS_SI_3_ITEMS: AssessmentItem[] = [
  { id: 'ldw_1', section_id: 'writing_motor', number: 1, text: 'จับดินสอเกร็ง ผิดท่า หรือออกแรงกดมากจนกระดาษขาดหรือรอยจางมาก', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_2', section_id: 'writing_motor', number: 2, text: 'เขียนตัวหนังสือกลับด้าน เช่น เขียน ด เป็น ค หรือตัวเลข 3 กลับหลัง', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_3', section_id: 'writing_motor', number: 3, text: 'เขียนตัวหนังสือขนาดไม่สม่ำเสมอ ใหญ่บ้างเล็กบ้าง ลอยไม่ติดเส้น', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_4', section_id: 'writing_motor', number: 4, text: 'เว้นวรรคตอนไม่ถูกต้อง ติดกันเป็นพืด หรือเว้นวรรคกลางคำ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_5', section_id: 'writing_motor', number: 5, text: 'คัดลอกข้อความจากกระดานดำลงสมุดช้ามาก หรือคัดลอกผิดบ่อย', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_6', section_id: 'writing_spelling', number: 6, text: 'เขียนสะกดคำผิดบ่อย แม้แต่คำง่ายๆ ที่ใช้เป็นประจำ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_7', section_id: 'writing_spelling', number: 7, text: 'เขียนพยัญชนะ สระ หรือวรรณยุกต์ตกหล่นในคำ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_8', section_id: 'writing_spelling', number: 8, text: 'วางตำแหน่งสระหรือวรรณยุกต์ผิดที่ เช่น สระอี วางผิดพยัญชนะ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_9', section_id: 'writing_spelling', number: 9, text: 'เขียนสลับตัวอักษรหน้าหลัง เช่น เขียน "กะลา" เป็น "ลากะ"', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_10', section_id: 'writing_spelling', number: 10, text: 'สับสนตัวสะกดในมาตราต่างๆ เช่น แม่กด แม่กบ แม่กน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_11', section_id: 'writing_composition', number: 11, text: 'เขียนประโยคสื่อความหมายไม่รู้เรื่อง เรียงลำดับคำผิด', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_12', section_id: 'writing_composition', number: 12, text: 'เขียนบรรยายภาพหรือเขียนเรียงความสั้นๆ ไม่ได้ตามระดับชั้น', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_13', section_id: 'writing_composition', number: 13, text: 'คิดคำตอบในใจได้และตอบปากเปล่าได้ดี แต่ไม่สามารถเขียนออกมาได้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_14', section_id: 'writing_composition', number: 14, text: 'ใช้คำศัพท์ซ้ำๆ ไม่หลากหลายในการเขียน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_15', section_id: 'writing_composition', number: 15, text: 'เขียนงานไม่เสร็จตามเวลาที่กำหนดในชั่วโมงเรียน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_16', section_id: 'writing_attitude', number: 16, text: 'เบื่อหน่าย บ่นเมื่อยมือ และต่อต้านการเขียนหนังสือ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_17', section_id: 'writing_attitude', number: 17, text: 'ลบแล้วลบอีกจนสมุดเปื่อยหรือสกปรก', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_18', section_id: 'writing_attitude', number: 18, text: 'ไม่กล้าส่งสมุดงานให้ครูตรวจเพราะอายลายมือ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_19', section_id: 'writing_attitude', number: 19, text: 'มักลืมเขียนชื่อตนเองหรือลืมเขียนหัวข้อบนสมุด', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldw_20', section_id: 'writing_attitude', number: 20, text: 'ความสามารถด้านการเขียนต่ำกว่าระดับสติปัญญาอย่างเห็นได้ชัด', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
];

export const KUS_SI_3_VERSION: AssessmentVersion = {
  id: 'kus-si-3-v1',
  assessment_id: 'kus-si-3-writing',
  version_number: 1,
  reviewer_name: 'ศ.ดร. ด้านจิตวิทยาและการศึกษาพิเศษ (ตัวอย่างทดสอบ)',
  reviewer_role: 'Educational Psychologist',
  published_by: 'admin',
  published_at: '2026-11-01T00:00:00.000Z',
  changelog: 'นำเข้าแบบคัดกรอง KUS-SI 3 ด้านการเขียน 20 ข้อ',
  is_prototype_sample: true,
  schema_definition: {
    scale: KUS_SI_SCALE,
    sections: [
      { id: 'writing_motor', title: 'กล้ามเนื้อมือและการควบคุมเส้นอักษร (ข้อ 1-5)', order: 1, item_ids: KUS_SI_3_ITEMS.slice(0, 5).map((i) => i.id) },
      { id: 'writing_spelling', title: 'การสะกดคำและการจัดวางตัวอักษร (ข้อ 6-10)', order: 2, item_ids: KUS_SI_3_ITEMS.slice(5, 10).map((i) => i.id) },
      { id: 'writing_composition', title: 'การเขียนสื่อความและเรียบเรียง (ข้อ 11-15)', order: 3, item_ids: KUS_SI_3_ITEMS.slice(10, 15).map((i) => i.id) },
      { id: 'writing_attitude', title: 'พฤติกรรมและความเร็วในการเขียน (ข้อ 16-20)', order: 4, item_ids: KUS_SI_3_ITEMS.slice(15).map((i) => i.id) },
    ],
    items: KUS_SI_3_ITEMS,
  },
  rules_definition: {
    scoring_method: 'domain_sum',
    missing_item_handling: 'error',
    has_validated_t_scores: false,
    domains: [
      { domain_id: 'writing_overall', title_th: 'ผลรวมด้านการเขียน (LD Writing)', item_ids: KUS_SI_3_ITEMS.map((i) => i.id), max_possible_raw_score: 60 },
    ],
  },
};

// ------------------------------------------------------------------------------
// ชุดที่ 4: KUS-SI 4 - แบบประเมินภาวะบกพร่องทางการเรียนรู้ ด้านคณิตศาสตร์ (LD Math)
// รวม 20 ข้อ
// ------------------------------------------------------------------------------
export const KUS_SI_4_ASSESSMENT: Assessment = {
  id: 'kus-si-4-math',
  code: 'KUS-SI-4',
  title: 'KUS-SI 4: แบบประเมินภาวะบกพร่องทางการเรียนรู้ ด้านการคิดคำนวณ (LD Math)',
  description: 'แบบประเมินมโนทัศน์เรื่องจำนวน การจำสัญลักษณ์ทางคณิตศาสตร์ และการแก้โจทย์ปัญหา สำหรับคุณครู',
  purpose: 'คัดกรองความเสี่ยงภาวะบกพร่องทางการเรียนรู้ด้านคณิตศาสตร์ในโรงเรียน',
  estimated_time_minutes: 8,
  min_age_months: 72,
  max_age_months: 216,
  target_roles: ['teacher', 'specialist'],
  status: 'published',
  current_version: 1,
  created_at: '2026-11-01T00:00:00.000Z',
  updated_at: '2026-11-01T00:00:00.000Z',
};

const KUS_SI_4_ITEMS: AssessmentItem[] = [
  { id: 'ldm_1', section_id: 'math_concept', number: 1, text: 'ไม่เข้าใจมโนทัศน์เรื่องจำนวน เช่น มากกว่า น้อยกว่า เท่ากัน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_2', section_id: 'math_concept', number: 2, text: 'นับจำนวนสิ่งของไม่ตรงกับจำนวนจริง (นับข้ามหรือนับซ้ำ)', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_3', section_id: 'math_concept', number: 3, text: 'สับสนตัวเลขที่คล้ายกัน เช่น 6-9, 2-5 หรือเขียนตัวเลขกลับด้าน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_4', section_id: 'math_concept', number: 4, text: 'สับสนสัญลักษณ์เครื่องหมาย เช่น + กับ × หรือ - กับ ÷', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_5', section_id: 'math_concept', number: 5, text: 'ไม่เข้าใจค่าประจำหลัก เช่น หลักหน่วย หลักสิบ หลักร้อย', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_6', section_id: 'math_operation', number: 6, text: 'ยังคงต้องใช้นิ้วมือนับคำนวณบวกเลขง่ายๆ ทั้งที่เพื่อนเลิกใช้แล้ว', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_7', section_id: 'math_operation', number: 7, text: 'ท่องสูตรคูณแม่พื้นฐานไม่ได้ หรือจำแล้วลืมง่าย', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_8', section_id: 'math_operation', number: 8, text: 'ตั้งหลักตัวเลขไม่ตรงกันในการคำนวณแนวตั้ง ทำให้คำนวณผิด', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_9', section_id: 'math_operation', number: 9, text: 'ลืมตัวทดในการบวก หรือลืมตัวยืมในการลบ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_10', section_id: 'math_operation', number: 10, text: 'สับสนขั้นตอนการคูณหรือการหารยาว', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_11', section_id: 'math_problem', number: 11, text: 'วิเคราะห์โจทย์ปัญหาไม่ได้ว่าต้องใช้วิธีใดในการหาคำตอบ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_12', section_id: 'math_problem', number: 12, text: 'ไม่สามารถเปลี่ยนโจทย์ภาษาเป็นประโยคสัญลักษณ์ได้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_13', section_id: 'math_problem', number: 13, text: 'สับสนเรื่องหน่วยวัด เช่น เซนติเมตร-เมตร กิโลกรัม-กรัม', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_14', section_id: 'math_problem', number: 14, text: 'ดูเวลาบนนาฬิกาแบบเข็มไม่เป็น หรือคำนวณระยะเวลาไม่ถูก', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_15', section_id: 'math_problem', number: 15, text: 'นับเงิน ทอนเงิน หรือใช้เงินซื้อของในชีวิตประจำวันไม่คล่อง', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_16', section_id: 'math_attitude', number: 16, text: 'กลัว วิตกกังวล หรือต่อต้านวิชาคณิตศาสตร์', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_17', section_id: 'math_attitude', number: 17, text: 'ทำแบบฝึกหัดคณิตศาสตร์ช้ากว่าเพื่อนมาก', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_18', section_id: 'math_attitude', number: 18, text: 'เดาคำตอบโดยไม่คิดคำนวณเพื่อให้งานเสร็จไปที', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_19', section_id: 'math_attitude', number: 19, text: 'ไม่สามารถตรวจทานความสมเหตุสมผลของคำตอบได้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'ldm_20', section_id: 'math_attitude', number: 20, text: 'ผลสัมฤทธิ์วิชาคณิตศาสตร์ต่ำกว่าระดับสติปัญญาอย่างชัดเจน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
];

export const KUS_SI_4_VERSION: AssessmentVersion = {
  id: 'kus-si-4-v1',
  assessment_id: 'kus-si-4-math',
  version_number: 1,
  reviewer_name: 'ศ.ดร. ด้านจิตวิทยาและการศึกษาพิเศษ (ตัวอย่างทดสอบ)',
  reviewer_role: 'Educational Psychologist',
  published_by: 'admin',
  published_at: '2026-11-01T00:00:00.000Z',
  changelog: 'นำเข้าแบบคัดกรอง KUS-SI 4 ด้านคณิตศาสตร์ 20 ข้อ',
  is_prototype_sample: true,
  schema_definition: {
    scale: KUS_SI_SCALE,
    sections: [
      { id: 'math_concept', title: 'มโนทัศน์และสัญลักษณ์ทางคณิตศาสตร์ (ข้อ 1-5)', order: 1, item_ids: KUS_SI_4_ITEMS.slice(0, 5).map((i) => i.id) },
      { id: 'math_operation', title: 'ทักษะการคำนวณและการทดเลข (ข้อ 6-10)', order: 2, item_ids: KUS_SI_4_ITEMS.slice(5, 10).map((i) => i.id) },
      { id: 'math_problem', title: 'การแก้โจทย์ปัญหาและการประยุกต์ (ข้อ 11-15)', order: 3, item_ids: KUS_SI_4_ITEMS.slice(10, 15).map((i) => i.id) },
      { id: 'math_attitude', title: 'ทัศนคติและความแม่นยำ (ข้อ 16-20)', order: 4, item_ids: KUS_SI_4_ITEMS.slice(15).map((i) => i.id) },
    ],
    items: KUS_SI_4_ITEMS,
  },
  rules_definition: {
    scoring_method: 'domain_sum',
    missing_item_handling: 'error',
    has_validated_t_scores: false,
    domains: [
      { domain_id: 'math_overall', title_th: 'ผลรวมด้านการคิดคำนวณ (LD Math)', item_ids: KUS_SI_4_ITEMS.map((i) => i.id), max_possible_raw_score: 60 },
    ],
  },
};

// ------------------------------------------------------------------------------
// ชุดที่ 5: KUS-SI 5 - แบบประเมินกลุ่มอาการออทิซึม (Autism / PDDs)
// รวม 40 ข้อ (แบ่งเป็นด้านปฏิสัมพันธ์ทางสังคม การสื่อสาร และพฤติกรรมทำซ้ำๆ)
// ------------------------------------------------------------------------------
export const KUS_SI_5_ASSESSMENT: Assessment = {
  id: 'kus-si-5-autism',
  code: 'KUS-SI-5',
  title: 'KUS-SI 5: แบบประเมินกลุ่มอาการออทิซึม (Autism/PDDs)',
  description: 'แบบประเมินคัดกรองพฤติกรรมด้านปฏิสัมพันธ์ทางสังคม การสื่อสารภาษา และพฤติกรรมความสนใจเฉพาะเจาะจงหรือทำซ้ำๆ สำหรับคุณครูและผู้เชี่ยวชาญ',
  purpose: 'คัดกรองความเสี่ยงกลุ่มอาการออทิซึมสเปกตรัมในสถานศึกษา',
  estimated_time_minutes: 15,
  min_age_months: 36, // 3 ปีขึ้นไป
  max_age_months: 216,
  target_roles: ['teacher', 'specialist'],
  status: 'published',
  current_version: 1,
  created_at: '2026-11-01T00:00:00.000Z',
  updated_at: '2026-11-01T00:00:00.000Z',
};

const KUS_SI_5_ITEMS: AssessmentItem[] = [
  // องค์ประกอบย่อยที่ 1: ปฏิสัมพันธ์ทางสังคม (Social Interaction - 15 ข้อ)
  { id: 'aut_1', section_id: 'social', number: 1, text: 'ไม่สบตาหรือสบตาน้อยมากเวลาพูดคุยกับผู้อื่น', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_2', section_id: 'social', number: 2, text: 'ไม่แสดงสีหน้าหรือท่าทางตอบสนองอารมณ์ของคนรอบข้าง (หน้าเฉยเมย)', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_3', section_id: 'social', number: 3, text: 'ชอบแยกตัวอยู่ตามลำพัง ไม่สนใจเข้าร่วมกิจกรรมกลุ่มกับเพื่อน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_4', section_id: 'social', number: 4, text: 'ไม่แบ่งปันความสนใจ ไม่ชี้ชวนให้ผู้อื่นดูสิ่งที่ตนเองสนใจ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_5', section_id: 'social', number: 5, text: 'ไม่ตอบสนองเมื่อมีคนเรียกชื่อตนเอง (เหมือนไม่ได้ยิน)', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_6', section_id: 'social', number: 6, text: 'ไม่เข้าใจความรู้สึกของผู้อื่น เช่น ไม่ปลอบเพื่อนเมื่อเพื่อนร้องไห้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_7', section_id: 'social', number: 7, text: 'ไม่ยิ้มตอบ หรือไม่แสดงความดีใจเมื่อได้รับคำชม', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_8', section_id: 'social', number: 8, text: 'เข้าหาผู้อื่นอย่างไม่เหมาะสม เช่น เดินชน กอดคนแปลกหน้า หรือดึงผม', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_9', section_id: 'social', number: 9, text: 'เล่นสมมุติ หรือเล่นตามบทบาทกับเพื่อนไม่เป็น', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_10', section_id: 'social', number: 10, text: 'ไม่มีเพื่อนสนิทในชั้นเรียน หรือไม่รู้วิธีผูกมิตรกับเพื่อน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_11', section_id: 'social', number: 11, text: 'ไม่เล่นส่งของหรือเล่นผลัดเปลี่ยนรอบกับผู้อื่น', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_12', section_id: 'social', number: 12, text: 'ดึงมือผู้ใหญ่ไปจับสิ่งของที่ตนต้องการแทนการบอกหรือชี้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_13', section_id: 'social', number: 13, text: 'ไม่เข้าใจกติกาทางสังคม เช่น ไม่ต่อคิว หรือเดินผ่านหน้าผู้ใหญ่โดยไม่สนใจ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_14', section_id: 'social', number: 14, text: 'ไม่แสดงความกังวลหรือความผูกพันเมื่อต้องพลัดพรากจากคนคุ้นเคย', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_15', section_id: 'social', number: 15, text: 'ไม่ลอกเลียนแบบท่าทางหรือคำพูดของผู้ใหญ่ในการเรียนรู้เบื้องต้น', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },

  // องค์ประกอบย่อยที่ 2: การสื่อสารภาษา (Communication - 13 ข้อ)
  { id: 'aut_16', section_id: 'communication', number: 16, text: 'พัฒนาการด้านภาษาล่าช้า ไม่พูดคำที่มีความหมายตามเกณฑ์อายุ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_17', section_id: 'communication', number: 17, text: 'พูดทวนคำพูดของคนอื่นทันที (Echolalia) โดยไม่เข้าใจความหมาย', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_18', section_id: 'communication', number: 18, text: 'พูดประโยคที่จำมาจากทีวี เพลง หรือโฆษณาซ้ำๆ ไม่ตรงบริบท', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_19', section_id: 'communication', number: 19, text: 'สับสนคำสรรพนาม เช่น เรียกตนเองว่า "เธอ" เรียกผู้อื่นว่า "ฉัน"', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_20', section_id: 'communication', number: 20, text: 'น้ำเสียงการพูดราบเรียบเหมือนหุ่นยนต์ หรือสูงๆ ต่ำๆ ผิดปกติ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_21', section_id: 'communication', number: 21, text: 'พูดเรื่องที่ตนเองสนใจซ้ำซากโดยไม่ฟังว่าคู่สนทนาต้องการฟังหรือไม่', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_22', section_id: 'communication', number: 22, text: 'ไม่เข้าใจมุกตลก คำประชดประชัน หรือสำนวนเปรียบเทียบ (แปลความหมายตรงตัว)', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_23', section_id: 'communication', number: 23, text: 'ไม่สามารถเริ่มต้นหรือรักษาบทสนทนาโต้ตอบไปมา 2 ฝั่งได้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_24', section_id: 'communication', number: 24, text: 'ไม่ใช้ภาษากายประกอบการพูด เช่น ชี้ พยักหน้า หรือส่ายหน้า', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_25', section_id: 'communication', number: 25, text: 'ส่งเสียงแปลกๆ ในลำคอโดยไม่มีจุดประสงค์เพื่อการสื่อสาร', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_26', section_id: 'communication', number: 26, text: 'สร้างคำศัพท์ขึ้นมาเองที่ผู้อื่นไม่เข้าใจความหมาย', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_27', section_id: 'communication', number: 27, text: 'พูดคนเดียวเป็นเวลานานโดยไม่มีคนอื่นอยู่ด้วย', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_28', section_id: 'communication', number: 28, text: 'ไม่เข้าใจคำสั่งที่ยาวหรือซับซ้อน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },

  // องค์ประกอบย่อยที่ 3: พฤติกรรมซ้ำๆ และความยึดติด (Repetitive Behaviors - 12 ข้อ)
  { id: 'aut_29', section_id: 'repetitive', number: 29, text: 'สะบัดมือ โบกมือ หมุนตัว หรือโยกตัวไปมาซ้ำๆ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_30', section_id: 'repetitive', number: 30, text: 'เดินเขย่งปลายเท้าเป็นประจำ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_31', section_id: 'repetitive', number: 31, text: 'ชอบหมุนล้อรถ หมุนพัดลม หรือมองของที่กำลังหมุนอยู่นานๆ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_32', section_id: 'repetitive', number: 32, text: 'ชอบจัดของเล่นเรียงเป็นแถวยาว หากใครมาแตะหรือเปลี่ยนที่จะหงุดหงิดมาก', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_33', section_id: 'repetitive', number: 33, text: 'ยึดติดกับกิจวัตรเดิมๆ หากมีการเปลี่ยนแปลงลำดับเวลาหรือเส้นทางจะอาละวาด', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_34', section_id: 'repetitive', number: 34, text: 'สนใจสิ่งของเฉพาะส่วนมากกว่าภาพรวม เช่น จ้องส่องไฟ ส่องพื้นผิว หรือดมสิ่งของ', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_35', section_id: 'repetitive', number: 35, text: 'มีความสนใจเฉพาะเรื่องใดเรื่องหนึ่งอย่างฝังใจ เช่น ตารางเดินรถ ตัวเลข ไดโนเสาร์', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_36', section_id: 'repetitive', number: 36, text: 'ไวต่อเสียง แสง หรือกลิ่นบางอย่างมากจนต้องเอามือปิดหูหรือกรีดร้อง', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_37', section_id: 'repetitive', number: 37, text: 'ไม่ทนต่อเนื้อสัมผัสบางชนิด เช่น ป้ายคอเสื้อ หรือปฏิเสธอาหารบางสีหรือเนื้อสัมผัส', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_38', section_id: 'repetitive', number: 38, text: 'มีพฤติกรรมทำร้ายตนเองเมื่อโกรธหรือไม่พอใจ เช่น โขกศีรษะ กัดมือตนเอง', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_39', section_id: 'repetitive', number: 39, text: 'หัวเราะหรือร้องไห้โดยไม่มีสาเหตุที่เข้าใจได้', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
  { id: 'aut_40', section_id: 'repetitive', number: 40, text: 'ไม่รับรู้ถึงอันตรายในชีวิตประจำวัน เช่น ความสูง หรือรถวิ่งบนถนน', question_type: 'rating_scale', is_required: true, options: KUS_SI_SCALE, min_score: 0, max_score: 3 },
];

export const KUS_SI_5_VERSION: AssessmentVersion = {
  id: 'kus-si-5-v1',
  assessment_id: 'kus-si-5-autism',
  version_number: 1,
  reviewer_name: 'นพ. จิตแพทย์เด็กและวัยรุ่น (ตัวอย่างทดสอบ)',
  reviewer_role: 'Child Psychiatrist',
  published_by: 'admin',
  published_at: '2026-11-01T00:00:00.000Z',
  changelog: 'นำเข้าแบบคัดกรอง KUS-SI 5 กลุ่มอาการออทิซึม 40 ข้อ',
  is_prototype_sample: true,
  schema_definition: {
    scale: KUS_SI_SCALE,
    sections: [
      { id: 'social', title: '1. ปฏิสัมพันธ์ทางสังคม (Social Interaction - 15 ข้อ)', order: 1, item_ids: KUS_SI_5_ITEMS.slice(0, 15).map((i) => i.id) },
      { id: 'communication', title: '2. การสื่อสารภาษา (Communication - 13 ข้อ)', order: 2, item_ids: KUS_SI_5_ITEMS.slice(15, 28).map((i) => i.id) },
      { id: 'repetitive', title: '3. พฤติกรรมซ้ำๆ และความยึดติด (Repetitive Behaviors - 12 ข้อ)', order: 3, item_ids: KUS_SI_5_ITEMS.slice(28).map((i) => i.id) },
    ],
    items: KUS_SI_5_ITEMS,
  },
  rules_definition: {
    scoring_method: 'domain_sum',
    missing_item_handling: 'error',
    has_validated_t_scores: false,
    domains: [
      { domain_id: 'social', title_th: 'ด้านปฏิสัมพันธ์ทางสังคม', item_ids: KUS_SI_5_ITEMS.slice(0, 15).map((i) => i.id), max_possible_raw_score: 45 },
      { domain_id: 'communication', title_th: 'ด้านการสื่อสารภาษา', item_ids: KUS_SI_5_ITEMS.slice(15, 28).map((i) => i.id), max_possible_raw_score: 39 },
      { domain_id: 'repetitive', title_th: 'ด้านพฤติกรรมซ้ำๆ และความยึดติด', item_ids: KUS_SI_5_ITEMS.slice(28).map((i) => i.id), max_possible_raw_score: 36 },
    ],
  },
};

// รวมชุดข้อมูลแบบประเมินตั้งต้น
export const ALL_INITIAL_ASSESSMENTS = [
  KUS_SI_1_ASSESSMENT,
  KUS_SI_2_ASSESSMENT,
  KUS_SI_3_ASSESSMENT,
  KUS_SI_4_ASSESSMENT,
  KUS_SI_5_ASSESSMENT,
];

export const ALL_INITIAL_VERSIONS = [
  KUS_SI_1_VERSION,
  KUS_SI_2_VERSION,
  KUS_SI_3_VERSION,
  KUS_SI_4_VERSION,
  KUS_SI_5_VERSION,
];
