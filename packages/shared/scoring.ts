// ==============================================================================
// GROWWISE PLATFORM - SCORING ENGINE & AGE CALCULATOR
// Clinical guardrails, raw scores, missing items handling, domain aggregation
// ==============================================================================

import {
  AssessmentItem,
  AssessmentResponse,
  AssessmentResult,
  AssessmentVersion,
  DomainResult,
  RulesDefinition,
} from './types';

export interface CalculatedAge {
  years: number;
  months: number;
  totalMonths: number;
  displayText: string;
}

/**
 * คำนวณอายุของเด็ก ณ วันที่ประเมิน (ไม่ใช่วันที่ปัจจุบัน)
 * @param birthDateStr วันเกิด รูปแบบ YYYY-MM-DD
 * @param assessmentDateStr วันที่ทำแบบประเมิน รูปแบบ YYYY-MM-DD
 */
export function calculateAgeAtDate(birthDateStr: string, assessmentDateStr: string): CalculatedAge {
  const birth = new Date(birthDateStr);
  const evalDate = new Date(assessmentDateStr);

  if (isNaN(birth.getTime()) || isNaN(evalDate.getTime())) {
    return { years: 0, months: 0, totalMonths: 0, displayText: 'ไม่ระบุวันเกิด' };
  }

  let years = evalDate.getFullYear() - birth.getFullYear();
  let months = evalDate.getMonth() - birth.getMonth();
  let days = evalDate.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return { years: 0, months: 0, totalMonths: 0, displayText: '0 ปี 0 เดือน' };
  }

  const totalMonths = years * 12 + months;
  return {
    years,
    months,
    totalMonths,
    displayText: `${years} ปี ${months} เดือน`,
  };
}

/**
 * ประมวลผลและคำนวณคะแนนตามกฎของเครื่องมือ
 */
export function evaluateAssessment(
  response: AssessmentResponse,
  version: AssessmentVersion,
  assessmentCode: string,
  assessmentTitle: string
): AssessmentResult {
  const schema = version.schema_definition;
  const rules = version.rules_definition;
  const answers = response.raw_answers || {};

  // สร้าง map ของคำถามเพื่อให้ lookup ได้รวดเร็ว
  const itemMap = new Map<string, AssessmentItem>();
  for (const item of schema.items) {
    itemMap.set(item.id, item);
  }

  let totalRawScore = 0;
  let maxPossibleRawScore = 0;
  const domainResults: DomainResult[] = [];

  // คำนวณคะแนนแยกตาม Domain
  for (const domain of rules.domains) {
    let domainScore = 0;
    let domainMaxScore = 0;
    let missingCount = 0;

    for (const itemId of domain.item_ids) {
      const item = itemMap.get(itemId);
      if (!item) continue;

      const maxScoreForItem = item.max_score ?? 3;
      domainMaxScore += maxScoreForItem;

      const rawVal = answers[itemId];
      if (rawVal === undefined || rawVal === null || rawVal === '') {
        missingCount++;
        continue;
      }

      let numericVal = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal);
      if (isNaN(numericVal)) numericVal = 0;

      // จัดการการกลับทิศคะแนน (Reverse scored)
      if (item.reverse_scored) {
        numericVal = maxScoreForItem - numericVal;
      }

      domainScore += numericVal;
    }

    // จัดการคำถามที่ไม่ได้ตอบ (Missing item handling)
    if (missingCount > 0 && rules.missing_item_handling === 'error') {
      // แจ้งเตือนข้อที่ขาด
    }

    totalRawScore += domainScore;
    maxPossibleRawScore += domainMaxScore;

    // ตรวจสอบ Guardrail สำหรับ T-Score
    let tScore: number | null = null;
    let statusBadge = 'รอผู้เชี่ยวชาญตรวจและแปลผล';
    let colorCode: DomainResult['color_code'] = 'purple';
    const recommendations: string[] = [];

    if (rules.has_validated_t_scores && domain.cutoffs && domain.cutoffs.length > 0) {
      // มีเกณฑ์ที่ผ่านการตรวจสอบแล้ว
      const matchedCutoff = domain.cutoffs.find(
        (c) => domainScore >= c.min_score && domainScore <= c.max_score
      );
      if (matchedCutoff) {
        statusBadge = matchedCutoff.title_th;
        recommendations.push(...matchedCutoff.recommendations);
        if (matchedCutoff.result_level === 'clinical_alert' || matchedCutoff.result_level === 'at_risk') {
          colorCode = 'red';
        } else if (matchedCutoff.result_level === 'borderline') {
          colorCode = 'amber';
        } else {
          colorCode = 'green';
        }
      }
    } else {
      // บังคับ Guardrail: แสดงคะแนนดิบและส่งต่อผู้เชี่ยวชาญ
      statusBadge = 'รอผู้เชี่ยวชาญตรวจและแปลผล';
      colorCode = 'purple';
      recommendations.push('ผลคะแนนดิบได้รับการบันทึกเรียบร้อยแล้ว แนะนำให้ปรึกษาครูหรือผู้เชี่ยวชาญด้านพัฒนาการเพื่อประเมินร่วมกับบริบทพฤติกรรม');
    }

    domainResults.push({
      domain_id: domain.domain_id,
      title_th: domain.title_th,
      raw_score: domainScore,
      max_score: domainMaxScore,
      t_score: tScore,
      status_badge: statusBadge,
      color_code: colorCode,
      recommendations,
    });
  }

  return {
    id: `res-${response.id}-${Date.now()}`,
    response_id: response.id,
    assessment_code: assessmentCode,
    assessment_title: assessmentTitle,
    version_number: version.version_number,
    total_raw_score: totalRawScore,
    max_possible_raw_score: maxPossibleRawScore,
    domain_results: domainResults,
    overall_status: 'pending_specialist_review',
    overall_status_label: 'รอผู้เชี่ยวชาญตรวจและแปลผล',
    has_clinical_alert: false,
    is_prototype_sample: version.is_prototype_sample ?? true,
    mandatory_disclaimer: 'ผลนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัย',
    calculated_at: new Date().toISOString(),
  };
}
