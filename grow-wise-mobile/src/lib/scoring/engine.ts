import {
  AssessmentSchemaDefinition,
  AssessmentRulesDefinition,
  CalculatedScores,
  InterpretationResult,
  SubmissionAnswers,
  SnapRulesDefinition,
  SensoryRulesDefinition,
  RespondentRole,
} from '@/types/database.types';

const MANDATORY_DISCLAIMER = 'ผลการประเมินนี้เป็นเพียงการคัดกรองพฤติกรรมและพัฒนาการเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์ หากท่านมีความกังวลใจหรือผลคะแนนบ่งชี้ถึงความเสี่ยง ควรปรึกษากุมารแพทย์พัฒนาการเด็กหรือผู้เชี่ยวชาญเพื่อรับการประเมินอย่างละเอียด';

/**
 * Scoring Engine for SNAP-IV 26 Items
 */
export function calculateSnapIV(
  answers: SubmissionAnswers,
  respondentRole: RespondentRole,
  schema: AssessmentSchemaDefinition,
  rules: AssessmentRulesDefinition
): { scores: CalculatedScores; interpretation: InterpretationResult } {
  const snapRules = rules as SnapRulesDefinition;
  const roleKey = respondentRole === 'teacher' ? 'teacher' : 'parent';
  const cutoffs = snapRules.cutoffs?.[roleKey] || snapRules.cutoffs?.parent;

  let totalScore = 0;
  let maxPossibleScore = 0;
  const sectionsRecord: CalculatedScores['sections'] = {};
  const flags: InterpretationResult['flags'] = [];
  const recommendedActions: string[] = [];

  for (const section of schema.sections) {
    let sectionRaw = 0;
    let answeredCount = 0;

    for (const itemId of section.item_ids) {
      if (typeof answers[itemId] === 'number') {
        sectionRaw += answers[itemId];
        answeredCount++;
      }
    }

    const itemCount = section.item_ids.length;
    const maxSection = itemCount * 3; // Scale 0-3
    const meanScore = itemCount > 0 ? Number((sectionRaw / itemCount).toFixed(2)) : 0;

    totalScore += sectionRaw;
    maxPossibleScore += maxSection;

    const cutoffInfo = cutoffs?.[section.id];
    const isElevated = cutoffInfo ? meanScore >= cutoffInfo.cutoff_mean : false;

    sectionsRecord[section.id] = {
      section_id: section.id,
      title: section.title,
      raw_score: sectionRaw,
      max_score: maxSection,
      mean_score: meanScore,
      is_elevated: isElevated,
    };

    if (isElevated && cutoffInfo) {
      flags.push({
        code: section.id,
        level: 'high',
        message: `คะแนนด้าน "${section.title}" เฉลี่ย ${meanScore} (จุดตัดเกณฑ์ ${cutoffInfo.cutoff_mean}) บ่งชี้ความเสี่ยงสูงกว่าเด็กในวัยเดียวกัน`,
      });
    }
  }

  if (flags.length > 0) {
    recommendedActions.push('ควรนำผลคัดกรองนี้ไปปรึกษากุมารแพทย์ด้านพัฒนาการและพฤติกรรมเด็กหรือจิตแพทย์เด็ก');
    recommendedActions.push('สังเกตและบันทึกพฤติกรรมของเด็กเพิ่มเติมในสถานการณ์ต่างๆ (ที่บ้านและโรงเรียน)');
  } else {
    recommendedActions.push('พฤติกรรมอยู่ในเกณฑ์ปกติทั่วไป ส่งเสริมการเรียนรู้และการปรับตัวตามวัยอย่างต่อเนื่อง');
  }

  const summary = flags.length > 0
    ? `พบสัญญาณพฤติกรรมที่มีคะแนนสูงกว่าเกณฑ์จุดตัด ${flags.length} ด้าน ซึ่งอาจส่งผลต่อการเรียนหรือการใช้ชีวิตประจำวัน`
    : 'ผลการคัดกรองเบื้องต้นอยู่ในเกณฑ์ปกติ ไม่พบข้อบ่งชี้ความเสี่ยงที่เด่นชัด';

  return {
    scores: {
      total_score: totalScore,
      max_possible_score: maxPossibleScore,
      sections: sectionsRecord,
    },
    interpretation: {
      summary,
      flags,
      recommended_actions: recommendedActions,
      disclaimer: MANDATORY_DISCLAIMER,
    },
  };
}

/**
 * Scoring Engine for Sensory Processing (Checklist)
 */
export function calculateSensory(
  answers: SubmissionAnswers,
  childAgeMonths: number,
  schema: AssessmentSchemaDefinition,
  rules: AssessmentRulesDefinition
): { scores: CalculatedScores; interpretation: InterpretationResult } {
  let totalScore = 0;
  let maxPossibleScore = 0;
  const sectionsRecord: CalculatedScores['sections'] = {};
  const flags: InterpretationResult['flags'] = [];
  const recommendedActions: string[] = [];

  for (const section of schema.sections) {
    // Check conditional logic e.g., min_age_months = 72
    if (section.conditions?.min_age_months && childAgeMonths < section.conditions.min_age_months) {
      continue; // Skip section for children under 6 years
    }

    let sectionRaw = 0;
    let actualItemsInCalc = 0;

    for (const itemId of section.item_ids) {
      if (typeof answers[itemId] === 'number') {
        sectionRaw += answers[itemId];
        actualItemsInCalc++;
      }
    }

    const maxSection = actualItemsInCalc * 4; // Scale 0-4
    const meanScore = actualItemsInCalc > 0 ? Number((sectionRaw / actualItemsInCalc).toFixed(2)) : 0;
    
    // Threshold: if average item score >= 2.2 (often or always), consider elevated difference
    const isElevated = meanScore >= 2.2;

    totalScore += sectionRaw;
    maxPossibleScore += maxSection;

    sectionsRecord[section.id] = {
      section_id: section.id,
      title: section.title,
      raw_score: sectionRaw,
      max_score: maxSection,
      mean_score: meanScore,
      is_elevated: isElevated,
    };

    if (isElevated) {
      flags.push({
        code: section.id,
        level: meanScore >= 2.8 ? 'high' : 'moderate',
        message: `มีข้อบ่งชี้ความแตกต่างใน "${section.title}" (คะแนนเฉลี่ย ${meanScore})`,
      });
    }
  }

  if (flags.length > 0) {
    recommendedActions.push('แนะนำให้ปรึกษานักกิจกรรมบำบัด (Occupational Therapist) เพื่อประเมิน Sensory Profile เชิงลึก');
    recommendedActions.push('จัดสภาพแวดล้อมที่บ้านหรือห้องเรียนให้ลดสิ่งเร้าที่น้องมีความไวเป็นพิเศษ');
  } else {
    recommendedActions.push('ระบบการประมวลความรู้สึกอยู่ในเกณฑ์ปกติ สนับสนุนกิจกรรมการเคลื่อนไหวและการเล่นกลางแจ้งสม่ำเสมอ');
  }

  const summary = flags.length > 0
    ? `พบสัญญาณความแตกต่างของการประมวลความรู้สึก ${flags.length} ระบบประสาทสัมผัส`
    : 'การตอบสนองต่อระบบประสาทรับความรู้สึกโดยรวมอยู่ในเกณฑ์ปกติ';

  return {
    scores: {
      total_score: totalScore,
      max_possible_score: maxPossibleScore,
      sections: sectionsRecord,
    },
    interpretation: {
      summary,
      flags,
      recommended_actions: recommendedActions,
      disclaimer: MANDATORY_DISCLAIMER,
    },
  };
}

/**
 * Universal Unified Calculation Entry Point
 */
export function calculateAssessment(
  assessmentCode: string,
  answers: SubmissionAnswers,
  respondentRole: RespondentRole = 'parent',
  childAgeMonths: number = 72,
  schema: AssessmentSchemaDefinition,
  rules: AssessmentRulesDefinition
): { scores: CalculatedScores; interpretation: InterpretationResult } {
  if (assessmentCode === 'SNAP-IV') {
    return calculateSnapIV(answers, respondentRole, schema, rules);
  }
  if (assessmentCode === 'SENSORY') {
    return calculateSensory(answers, childAgeMonths, schema, rules);
  }

  // Fallback generic calculation
  let totalScore = 0;
  for (const val of Object.values(answers)) {
    totalScore += val;
  }
  return {
    scores: {
      total_score: totalScore,
      max_possible_score: Object.keys(answers).length * 3,
      sections: {},
    },
    interpretation: {
      summary: 'การประเมินเสร็จสมบูรณ์',
      flags: [],
      recommended_actions: [],
      disclaimer: MANDATORY_DISCLAIMER,
    },
  };
}
