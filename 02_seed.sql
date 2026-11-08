-- ==============================================================================
-- GROW WISE PLATFORM (PHASE 1) - SEED DATA SCRIPT
-- Assessments & Assessment Versions (SNAP-IV 26 items & Sensory Processing 75 items)
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- 1. SNAP-IV (Short Form 26 Questions)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    v_assessment_id UUID;
BEGIN
    -- Insert or update parent record in assessments
    INSERT INTO public.assessments (
        code,
        title,
        description,
        min_age_months,
        max_age_months,
        target_roles,
        status,
        current_version
    ) VALUES (
        'SNAP-IV',
        'แบบประเมินพฤติกรรม SNAP-IV (Short Form 26 ข้อ)',
        'แบบคัดกรองพฤติกรรมสมาธิสั้น (ADHD) และพฤติกรรมดื้อต่อต้าน (ODD) สำหรับผู้ปกครองและครู',
        48,  -- 4 years old
        216, -- 18 years old
        ARRAY['parent', 'teacher'],
        'published',
        1
    )
    ON CONFLICT (code) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = 'published',
        current_version = 1
    RETURNING id INTO v_assessment_id;

    -- Insert or update version 1.0
    INSERT INTO public.assessment_versions (
        assessment_id,
        version_number,
        published_at,
        schema_definition,
        rules_definition
    ) VALUES (
        v_assessment_id,
        1,
        timezone('utc'::text, now()),
        '{
            "scale": [
                {"value": 0, "label": "ไม่เลย (Not at all)"},
                {"value": 1, "label": "เล็กน้อย (Just a little)"},
                {"value": 2, "label": "ค่อนข้างมาก (Quite a bit)"},
                {"value": 3, "label": "มาก (Very much)"}
            ],
            "sections": [
                {
                    "id": "inattentive",
                    "title": "อาการขาดสมาธิ (Inattentive symptoms)",
                    "description": "ประเมินความสามารถในการจดจ่อ การตั้งสมาธิ และการจัดระเบียบ",
                    "item_ids": ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"]
                },
                {
                    "id": "hyperactivity_impulsivity",
                    "title": "อาการซน อยู่ไม่นิ่ง/หุนหันพลันแล่น (Hyperactivity/Impulsivity symptoms)",
                    "description": "ประเมินพฤติกรรมไม่อยู่นิ่ง การเคลื่อนไหวตลอดเวลา และความยากลำบากในการรอคอย",
                    "item_ids": ["q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18"]
                },
                {
                    "id": "oppositional_defiant",
                    "title": "อาการดื้อ / ต่อต้าน (Oppositional Defiant Disorder)",
                    "description": "ประเมินอารมณ์โกรธ หงุดหงิด และการท้าทายกฎเกณฑ์",
                    "item_ids": ["q19", "q20", "q21", "q22", "q23", "q24", "q25", "q26"]
                }
            ],
            "items": [
                {"id": "q1", "section_id": "inattentive", "number": 1, "text": "มักไม่สามารถจดจ่อกับรายละเอียด หรือทำผิดพลาดด้วยความสะเพร่าในการทำการบ้าน การทำงาน หรือกิจกรรมอื่นๆ"},
                {"id": "q2", "section_id": "inattentive", "number": 2, "text": "มักมีความยากลำบากในการตั้งสมาธิในการทำงานหรือการเล่น"},
                {"id": "q3", "section_id": "inattentive", "number": 3, "text": "ดูเหมือนไม่ฟังเวลาที่มีคนพูดด้วยโดยตรง"},
                {"id": "q4", "section_id": "inattentive", "number": 4, "text": "มักทำตามคำแนะนำไม่เสร็จสิ้น หรือทำงานที่ได้รับมอบหมายไม่สำเร็จ (มิใช่เกิดจากการต่อต้านหรือไม่เข้าใจ)"},
                {"id": "q5", "section_id": "inattentive", "number": 5, "text": "มักมีความยากลำบากในการจัดระเบียบงานและกิจกรรม"},
                {"id": "q6", "section_id": "inattentive", "number": 6, "text": "มักหลีกเลี่ยง ไม่ชอบ หรือลังเลที่จะทำงานที่ต้องใช้ความพยายามทางสมองอย่างต่อเนื่อง (เช่น การบ้าน)"},
                {"id": "q7", "section_id": "inattentive", "number": 7, "text": "มักทำของที่จำเป็นสำหรับงานหรือกิจกรรมหายบ่อยๆ (เช่น ของเล่น สมุดจด ดินสอ หรือหนังสือ)"},
                {"id": "q8", "section_id": "inattentive", "number": 8, "text": "มักวอกแวกง่ายจากสิ่งเร้าภายนอก"},
                {"id": "q9", "section_id": "inattentive", "number": 9, "text": "มักขี้ลืมในการทำกิจวัตรประจำวัน"},
                {"id": "q10", "section_id": "hyperactivity_impulsivity", "number": 10, "text": "มักยุกยิก ขยับมือหรือเท้าไปมา หรือนั่งบิดตัวบนเก้าอี้"},
                {"id": "q11", "section_id": "hyperactivity_impulsivity", "number": 11, "text": "มักลุกออกจากที่นั่งในห้องเรียนหรือในสถานการณ์ที่คาดหวังให้นั่งอยู่กับที่"},
                {"id": "q12", "section_id": "hyperactivity_impulsivity", "number": 12, "text": "มักวิ่งไปมาหรือปีนป่ายมากเกินควรในสถานการณ์ที่ไม่เหมาะสม"},
                {"id": "q13", "section_id": "hyperactivity_impulsivity", "number": 13, "text": "มักมีความยากลำบากในการเล่นหรือทำกิจกรรมสันทนาการอย่างเงียบสงบ"},
                {"id": "q14", "section_id": "hyperactivity_impulsivity", "number": 14, "text": "มักกระตือรือร้นเกินไป หรือทำตัวเหมือนติดเครื่องยนต์อยู่ตลอดเวลา"},
                {"id": "q15", "section_id": "hyperactivity_impulsivity", "number": 15, "text": "มักพูดมากเกินไป"},
                {"id": "q16", "section_id": "hyperactivity_impulsivity", "number": 16, "text": "มักโพล่งตอบคำถามออกมาก่อนที่ผู้ถามจะถามเสร็จ"},
                {"id": "q17", "section_id": "hyperactivity_impulsivity", "number": 17, "text": "มักมีความยากลำบากในการรอคอยตามลำดับหรือการเข้าคิว"},
                {"id": "q18", "section_id": "hyperactivity_impulsivity", "number": 18, "text": "มักขัดจังหวะหรือสอดแทรกผู้อื่น (เช่น พูดแทรก หรือสอดแทรกในการเล่นของคนอื่น)"},
                {"id": "q19", "section_id": "oppositional_defiant", "number": 19, "text": "มักอารมณ์เสียหรือหงุดหงิดง่าย"},
                {"id": "q20", "section_id": "oppositional_defiant", "number": 20, "text": "มักโต้เถียงกับผู้ใหญ่"},
                {"id": "q21", "section_id": "oppositional_defiant", "number": 21, "text": "มักท้าทายอย่างเปิดเผย หรือปฏิเสธไม่ยอมปฏิบัติตามคำขอหรือกฎเกณฑ์ของผู้ใหญ่"},
                {"id": "q22", "section_id": "oppositional_defiant", "number": 22, "text": "มักเจตนาทำสิ่งที่จะทำให้ผู้อื่นรำคาญ"},
                {"id": "q23", "section_id": "oppositional_defiant", "number": 23, "text": "มักกล่าวโทษผู้อื่นในความผิดพลาดหรือพฤติกรรมที่ไม่เหมาะสมของตนเอง"},
                {"id": "q24", "section_id": "oppositional_defiant", "number": 24, "text": "มักขี้รำคาญหรือถูกทำให้หงุดหงิดได้ง่ายโดยผู้อื่น"},
                {"id": "q25", "section_id": "oppositional_defiant", "number": 25, "text": "มักโกรธ เคียดแค้น และไม่พอใจ"},
                {"id": "q26", "section_id": "oppositional_defiant", "number": 26, "text": "มักมุ่งร้าย เจ้าคิดเจ้าแค้น หรือชอบแกล้งผู้อื่น"}
            ]
        }'::jsonb,
        '{
            "algorithm": "snap_iv_scoring",
            "calculation_formula": {
                "section_score": "SUM(item_scores)",
                "section_mean": "SUM(item_scores) / item_count",
                "total_score": "SUM(all_item_scores)"
            },
            "cutoffs": {
                "parent": {
                    "inattentive": {"cutoff_mean": 1.78, "cutoff_raw": 16, "label": "เสี่ยงต่อภาวะขาดสมาธิ (Inattention)"},
                    "hyperactivity_impulsivity": {"cutoff_mean": 1.44, "cutoff_raw": 13, "label": "เสี่ยงต่อภาวะซนอยู่ไม่นิ่ง/หุนหันพลันแล่น (Hyperactivity/Impulsivity)"},
                    "oppositional_defiant": {"cutoff_mean": 1.67, "cutoff_raw": 13.4, "label": "เสี่ยงต่อภาวะดื้อต่อต้าน (ODD)"}
                },
                "teacher": {
                    "inattentive": {"cutoff_mean": 2.56, "cutoff_raw": 23, "label": "เสี่ยงต่อภาวะขาดสมาธิ (Inattention)"},
                    "hyperactivity_impulsivity": {"cutoff_mean": 1.78, "cutoff_raw": 16, "label": "เสี่ยงต่อภาวะซนอยู่ไม่นิ่ง/หุนหันพลันแล่น (Hyperactivity/Impulsivity)"},
                    "oppositional_defiant": {"cutoff_mean": 1.63, "cutoff_raw": 13, "label": "เสี่ยงต่อภาวะดื้อต่อต้าน (ODD)"}
                }
            },
            "interpretation_guide": {
                "positive": "คะแนนเฉลี่ยรายด้านสูงกว่าเกณฑ์จุดตัด 5% สูงสุด บ่งชี้ว่าควรได้รับคำปรึกษาจากกุมารแพทย์พัฒนาการเด็กหรือจิตแพทย์เด็ก",
                "negative": "คะแนนอยู่ในเกณฑ์ปกติของพฤติกรรมเด็กตามวัย"
            }
        }'::jsonb
    )
    ON CONFLICT (assessment_id, version_number) DO UPDATE SET
        schema_definition = EXCLUDED.schema_definition,
        rules_definition = EXCLUDED.rules_definition,
        published_at = EXCLUDED.published_at;
END $$;


-- -----------------------------------------------------------------------------
-- 2. SENSORY PROCESSING (75 Questions across 7 Sections)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    v_assessment_id UUID;
BEGIN
    INSERT INTO public.assessments (
        code,
        title,
        description,
        min_age_months,
        max_age_months,
        target_roles,
        status,
        current_version
    ) VALUES (
        'SENSORY',
        'แบบประเมินการประมวลความรู้สึก (Sensory Processing Checklist)',
        'แบบคัดกรองการบูรณาการและการตอบสนองต่อระบบประสาทรับความรู้สึกทั้ง 7 ด้าน สำหรับเด็กและวัยรุ่น',
        36,  -- 3 years old
        180, -- 15 years old
        ARRAY['parent', 'teacher'],
        'published',
        1
    )
    ON CONFLICT (code) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = 'published',
        current_version = 1
    RETURNING id INTO v_assessment_id;

    INSERT INTO public.assessment_versions (
        assessment_id,
        version_number,
        published_at,
        schema_definition,
        rules_definition
    ) VALUES (
        v_assessment_id,
        1,
        timezone('utc'::text, now()),
        '{
            "scale": [
                {"value": 0, "label": "ไม่แสดงพฤติกรรมนั้นเลย"},
                {"value": 1, "label": "แสดงพฤติกรรมนั้นน้อยมาก"},
                {"value": 2, "label": "แสดงพฤติกรรมนั้นเป็นบางครั้ง"},
                {"value": 3, "label": "แสดงพฤติกรรมนั้นบ่อยๆ"},
                {"value": 4, "label": "แสดงพฤติกรรมนั้นเป็นประจำสม่ำเสมอ"}
            ],
            "sections": [
                {
                    "id": "visual",
                    "title": "ด้านการมองเห็น (Visual System)",
                    "description": "การตอบสนองต่อแสง สี และภาพแวดล้อม",
                    "item_ids": ["vis_1", "vis_2", "vis_3", "vis_4", "vis_5", "vis_6", "vis_7", "vis_8", "vis_9", "vis_10"]
                },
                {
                    "id": "auditory",
                    "title": "ด้านการได้ยิน (Auditory System)",
                    "description": "การตอบสนองต่อเสียงดัง ความถี่เสียง และเสียงบรรยากาศ",
                    "item_ids": ["aud_1", "aud_2", "aud_3", "aud_4", "aud_5", "aud_6", "aud_7", "aud_8", "aud_9", "aud_10"]
                },
                {
                    "id": "proprioceptive",
                    "title": "ด้านการเคลื่อนไหวและการทรงท่า (Proprioceptive System)",
                    "description": "การรับรู้ตำแหน่งของข้อต่อ กล้ามเนื้อ และการออกแรง",
                    "item_ids": ["pro_1", "pro_2", "pro_3", "pro_4", "pro_5", "pro_6", "pro_7", "pro_8", "pro_9", "pro_10", "pro_11", "pro_12"]
                },
                {
                    "id": "vestibular",
                    "title": "ด้านการรักษาสมดุลของร่างกาย (Vestibular System)",
                    "description": "การทรงตัว การหมุน ความเร็ว และแรงโน้มถ่วง",
                    "item_ids": ["ves_1", "ves_2", "ves_3", "ves_4", "ves_5", "ves_6", "ves_7", "ves_8", "ves_9", "ves_10", "ves_11", "ves_12", "ves_13", "ves_14"]
                },
                {
                    "id": "gustatory_olfactory",
                    "title": "ด้านการรับรสและกลิ่น (Gustatory/Olfactory System)",
                    "description": "ความไวต่อกลิ่นและรสชาติของอาหารหรือสิ่งของรอบตัว",
                    "item_ids": ["gus_1", "gus_2", "gus_3", "gus_4", "gus_5"]
                },
                {
                    "id": "tactile",
                    "title": "ด้านการตอบสนองต่อการถูกสัมผัส (Tactile System)",
                    "description": "ปฏิกิริยาต่อเนื้อผ้า ผิวสัมผัส อุณหภูมิ และความเปียกชื้น",
                    "item_ids": [
                        "tac_1", "tac_2", "tac_3", "tac_4", "tac_5", "tac_6", "tac_7", "tac_8", "tac_9", "tac_10",
                        "tac_11", "tac_12", "tac_13", "tac_14", "tac_15", "tac_16", "tac_17", "tac_18", "tac_19", "tac_20", "tac_21"
                    ]
                },
                {
                    "id": "special_elder",
                    "title": "หมวดพิเศษ (สำหรับเด็กอายุ 6 ขวบขึ้นไป)",
                    "description": "พฤติกรรมและการวางแผนการเคลื่อนไหวขั้นสูงเฉพาะเด็กวัยเรียน",
                    "item_ids": ["spe_1", "spe_2", "spe_3"],
                    "conditions": {
                        "min_age_months": 72
                    }
                }
            ],
            "items": [
                {"id": "vis_1", "section_id": "visual", "number": 1, "text": "ไวต่อแสงสว่าง จ้า หรือแสงแดด กะพริบตาหรือเอามือป้องตาบ่อยกว่าเด็กอื่น"},
                {"id": "vis_2", "section_id": "visual", "number": 2, "text": "ชอบมองวัตถุที่หมุนเป็นวงกลม หรือสิ่งของที่มีการเคลื่อนไหวซ้ำๆ นานเป็นพิเศษ"},
                {"id": "vis_3", "section_id": "visual", "number": 3, "text": "มองตามสิ่งของที่กำลังเคลื่อนที่ได้ยาก หรือกะระยะวัตถุคลาดเคลื่อน"},
                {"id": "vis_4", "section_id": "visual", "number": 4, "text": "ชอบเอาวัตถุมาส่องใกล้ดวงตา หรือจ้องมองไฟอย่างตั้งใจ"},
                {"id": "vis_5", "section_id": "visual", "number": 5, "text": "มักมองข้ามหรือหาสิ่งของที่วางอยู่ตรงหน้าท่ามกลางสิ่งของอื่นๆ ไม่เจอ"},
                {"id": "vis_6", "section_id": "visual", "number": 6, "text": "หลีกเลี่ยงการสบตาผู้อื่นในขณะสนทนาหรือมีปฏิสัมพันธ์"},
                {"id": "vis_7", "section_id": "visual", "number": 7, "text": "สับสนกับตัวอักษรหรือรูปทรงที่มีความคล้ายคลึงกันบ่อยครั้ง"},
                {"id": "vis_8", "section_id": "visual", "number": 8, "text": "ชอบเอามือปิดตา ขยี้ตา ทั้งๆ ที่ไม่มีสิ่งแปลกปลอมเข้าตา"},
                {"id": "vis_9", "section_id": "visual", "number": 9, "text": "วอกแวกง่ายกับสิ่งที่มองเห็นรอบห้อง เช่น โปสเตอร์ คนเดินผ่าน"},
                {"id": "vis_10", "section_id": "visual", "number": 10, "text": "มีความยากลำบากในการต่อจิ๊กซอว์ ร้อยลูกปัด หรืองานที่ต้องใช้สายตากับมือประสานกัน"},

                {"id": "aud_1", "section_id": "auditory", "number": 11, "text": "ตกใจ ร้องไห้ หรือเอามืออุดหูเมื่อได้ยินเสียงดัง เช่น เครื่องดูดฝุ่น ไดร์เป่าผม ฟ้าร้อง"},
                {"id": "aud_2", "section_id": "auditory", "number": 12, "text": "ดูเหมือนไม่ได้ยินเวลาเรียกชื่อ ทั้งที่มีผลตรวจการได้ยินปกติ"},
                {"id": "aud_3", "section_id": "auditory", "number": 13, "text": "ชอบทำเสียงแปลกๆ ในลำคอ ฮัมเพลง หรือเคาะสิ่งของให้เกิดเสียงซ้ำๆ"},
                {"id": "aud_4", "section_id": "auditory", "number": 14, "text": "มีความยากลำบากในการแยกแยะเสียงคำสั่งเมื่ออยู่ในที่ที่มีเสียงจอแจ"},
                {"id": "aud_5", "section_id": "auditory", "number": 15, "text": "ต้องการให้เปิดโทรทัศน์หรือเสียงเพลงดังกว่าคนทั่วไปในบ้าน"},
                {"id": "aud_6", "section_id": "auditory", "number": 16, "text": "บ่นหรือรำคาญเสียงหึ่งๆ เช่น เสียงแอร์ เสียงตู้เย็นที่คนอื่นแทบไม่สังเกต"},
                {"id": "aud_7", "section_id": "auditory", "number": 17, "text": "ไม่ตอบสนองต่อเสียงกระซิบหรือคำเตือนเบาๆ"},
                {"id": "aud_8", "section_id": "auditory", "number": 18, "text": "มีปัญหาในการจำหรือปฏิบัติตามคำสั่งทางวาจาเกินกว่า 1-2 ขั้นตอน"},
                {"id": "aud_9", "section_id": "auditory", "number": 19, "text": "หงุดหงิดหรือกระสับกระส่ายเมื่ออยู่ในห้างสรรพสินค้าหรือตลาดนัด"},
                {"id": "aud_10", "section_id": "auditory", "number": 20, "text": "ชอบฟังเสียงเดิมๆ ซ้ำแล้วซ้ำเล่า"},

                {"id": "pro_1", "section_id": "proprioceptive", "number": 21, "text": "ชอบกระโดด ชน กระแทกตัว หรือพุ่งเข้าหาเฟอร์นิเจอร์อย่างแรง"},
                {"id": "pro_2", "section_id": "proprioceptive", "number": 22, "text": "ออกแรงเขียนหนังสือแรงเกินไปจนดินสอหัก หรือกระดาษขาด"},
                {"id": "pro_3", "section_id": "proprioceptive", "number": 23, "text": "ออกแรงจับสิ่งของเบาเกินไปจนทำของตกหล่นบ่อยๆ"},
                {"id": "pro_4", "section_id": "proprioceptive", "number": 24, "text": "ชอบเคี้ยวหรือกัดสิ่งของ เสื้อผ้า แขนเสื้อ หรือของเล่น"},
                {"id": "pro_5", "section_id": "proprioceptive", "number": 25, "text": "ชอบกอดรัดผู้อื่นอย่างรุนแรงโดยไม่ได้ตั้งใจทำร้าย"},
                {"id": "pro_6", "section_id": "proprioceptive", "number": 26, "text": "ดูซุ่มซ่าม สะดุดขาตัวเองหรือสะดุดสิ่งของรอบตัวเป็นประจำ"},
                {"id": "pro_7", "section_id": "proprioceptive", "number": 27, "text": "ชอบทิ้งน้ำหนักตัวลงบนคนอื่น หรือพิงผนังเก้าอี้ตลอดเวลา"},
                {"id": "pro_8", "section_id": "proprioceptive", "number": 28, "text": "มีความยากลำบากในการกะแรงในการขว้างหรือส่งลูกบอล"},
                {"id": "pro_9", "section_id": "proprioceptive", "number": 29, "text": "ชอบเตะขา กระดิกเท้า หรือเคาะโต๊ะตลอดเวลาที่นั่งทำงาน"},
                {"id": "pro_10", "section_id": "proprioceptive", "number": 30, "text": "มีความยากลำบากในการติดกระดุม รูดซิป หรือผูกเชือกรองเท้า"},
                {"id": "pro_11", "section_id": "proprioceptive", "number": 31, "text": "ชอบแบกของหนักๆ หรือลากสิ่งของหนักๆ ไปรอบๆ"},
                {"id": "pro_12", "section_id": "proprioceptive", "number": 32, "text": "ชอบเดินลงส้นเท้าอย่างแรงจนเกิดเสียงดัง"},

                {"id": "ves_1", "section_id": "vestibular", "number": 33, "text": "กลัวความสูงอย่างมาก หลีกเลี่ยงเครื่องเล่นในสนาม เช่น บันไดลิง ชิงช้า"},
                {"id": "ves_2", "section_id": "vestibular", "number": 34, "text": "ชอบหมุนตัวเป็นวงกลมต่อเนื่องนานๆ โดยไม่มีอาการเวียนศีรษะ"},
                {"id": "ves_3", "section_id": "vestibular", "number": 35, "text": "กลัวการที่เท้าลอยพ้นพื้น หรือรู้สึกไม่มั่นคงเมื่อถูกอุ้มลอยขึ้น"},
                {"id": "ves_4", "section_id": "vestibular", "number": 36, "text": "เมารถ เมาเรือ หรือวิงเวียนง่ายมากเมื่อต้องเดินทาง"},
                {"id": "ves_5", "section_id": "vestibular", "number": 37, "text": "ชอบโยกตัวไปข้างหน้า-หลังซ้ำๆ เมื่อนั่งอยู่กับที่"},
                {"id": "ves_6", "section_id": "vestibular", "number": 38, "text": "ไม่ชอบหรือตื่นตระหนกเมื่อต้องเอนหลัง สระผม หรือหงายศีรษะ"},
                {"id": "ves_7", "section_id": "vestibular", "number": 39, "text": "ชอบท้าทายความเสี่ยง วิ่ง กระโดดจากที่สูงโดยไม่ตระหนักถึงอันตราย"},
                {"id": "ves_8", "section_id": "vestibular", "number": 40, "text": "ทรงตัวได้ไม่ดีบนขาข้างเดียว หรือเดินบนเส้นตรงลำบาก"},
                {"id": "ves_9", "section_id": "vestibular", "number": 41, "text": "ชอบนอนเอาหัวห้อยลงมาจากเตียงหรือโซฟา"},
                {"id": "ves_10", "section_id": "vestibular", "number": 42, "text": "หลีกเลี่ยงการก้มศีรษะลงหรือการตีลังกา"},
                {"id": "ves_11", "section_id": "vestibular", "number": 43, "text": "มักนั่งท่าตัวงอหรือหลังค่อมเมื่อนั่งเก้าอี้"},
                {"id": "ves_12", "section_id": "vestibular", "number": 44, "text": "ต้องเอามือจับราวบันไดแน่นทั้งสองข้างเวลาขึ้น-ลงบันได"},
                {"id": "ves_13", "section_id": "vestibular", "number": 45, "text": "ชอบกระโดดบนแทรมโพลีนหรือที่นอนนานเกิน 30 นาที"},
                {"id": "ves_14", "section_id": "vestibular", "number": 46, "text": "มีอาการกังวลเมื่อต้องเดินบนพื้นผิวที่ไม่เรียบ เช่น หญ้า หรือทางลาด"},

                {"id": "gus_1", "section_id": "gustatory_olfactory", "number": 47, "text": "เลือกกินอาหารมาก ปฏิเสธอาหารเนื้อสัมผัสหรือรสชาติใหม่ๆ"},
                {"id": "gus_2", "section_id": "gustatory_olfactory", "number": 48, "text": "ชอบดมสิ่งของที่ไม่ใช่อาหาร เช่น ของเล่น ดินสอ เสื้อผ้าผู้คน"},
                {"id": "gus_3", "section_id": "gustatory_olfactory", "number": 49, "text": "ไวต่อกลิ่นมาก มักบ่นว่าเหม็นกลิ่นน้ำหอมหรือกลิ่นอาหารที่คนอื่นไม่ได้กลิ่น"},
                {"id": "gus_4", "section_id": "gustatory_olfactory", "number": 50, "text": "ชอบเลีย ชิม หรือเอาสิ่งของที่ไม่ใช่อาหารเข้าปาก"},
                {"id": "gus_5", "section_id": "gustatory_olfactory", "number": 51, "text": "สำรอกหรืออาเจียนง่ายเมื่อสัมผัสกลิ่นหรือรสอาหารบางชนิด"},

                {"id": "tac_1", "section_id": "tactile", "number": 52, "text": "รังเกียจหรือทนไม่ได้ที่มือหรือใบหน้าเปื้อนโคลน แป้งโดว์ กาว หรือสี"},
                {"id": "tac_2", "section_id": "tactile", "number": 53, "text": "ไม่ชอบให้คนอื่นแตะเนื้อต้องตัว หรือสะดุ้งเมื่อถูกสัมผัสโดยไม่รู้ตัว"},
                {"id": "tac_3", "section_id": "tactile", "number": 54, "text": "บ่นหรือรำคาญป้ายยี่ห้อเสื้อผ้า ตะเข็บถุงเท้า หรือเนื้อผ้าบางประเภท"},
                {"id": "tac_4", "section_id": "tactile", "number": 55, "text": "ไม่ชอบการสระผม หวีผม ตัดผม หรือตัดเล็บ"},
                {"id": "tac_5", "section_id": "tactile", "number": 56, "text": "ไม่ชอบเดินเท้าเปล่าบนทราย หญ้า หรือพรม"},
                {"id": "tac_6", "section_id": "tactile", "number": 57, "text": "ชอบสัมผัสพื้นผิวแปลกๆ ลูบไล้ผ้าห่ม ตุ๊กตา หรือกำแพงตลอดเวลา"},
                {"id": "tac_7", "section_id": "tactile", "number": 58, "text": "ไม่รับรู้ถึงความเจ็บปวดเมื่อหกล้ม มีแผล หรือถูกกระแทก"},
                {"id": "tac_8", "section_id": "tactile", "number": 59, "text": "ไวต่อความเจ็บปวดมาก แม้โดนเพียงเบาๆ หรือมีรอยขีดข่วนเล็กน้อย"},
                {"id": "tac_9", "section_id": "tactile", "number": 60, "text": "ไม่ชอบอาบน้ำ หรือบ่นเรื่องอุณหภูมิน้ำอุ่น/เย็นเกินไปเสมอ"},
                {"id": "tac_10", "section_id": "tactile", "number": 61, "text": "ไม่ชอบแปรงฟัน หรือบ่นเจ็บเหงือกขณะแปรงฟัน"},
                {"id": "tac_11", "section_id": "tactile", "number": 62, "text": "ชอบดึง ดัน หรือสัมผัสเสื้อผ้าของตนเองหรือคนรอบข้าง"},
                {"id": "tac_12", "section_id": "tactile", "number": 63, "text": "ไม่รู้สึกว่าใบหน้าหรือรอบปากเปื้อนเศษอาหาร"},
                {"id": "tac_13", "section_id": "tactile", "number": 64, "text": "ชอบถอดเสื้อผ้า หรือปฏิเสธการสวมเสื้อแขนยาว/กางเกงขายาว"},
                {"id": "tac_14", "section_id": "tactile", "number": 65, "text": "ชอบสวมเสื้อผ้าหนาๆ หลายชั้นแม้ในวันที่อากาศร้อน"},
                {"id": "tac_15", "section_id": "tactile", "number": 66, "text": "หลีกเลี่ยงการสัมผัสสัตว์เลี้ยงหรือสัตว์ที่มีขน"},
                {"id": "tac_16", "section_id": "tactile", "number": 67, "text": "ชอบจับหรือเกาแผล เกาผิวหนังจนเป็นแผลเรื้อรัง"},
                {"id": "tac_17", "section_id": "tactile", "number": 68, "text": "ไม่รู้ตัวว่าจับสิ่งของร้อนหรือเย็นเกินไป"},
                {"id": "tac_18", "section_id": "tactile", "number": 69, "text": "ชอบซ่อนตัวในที่แคบๆ ผ้าห่มคลุม หรือซอกตู้"},
                {"id": "tac_19", "section_id": "tactile", "number": 70, "text": "รู้สึกหงุดหงิดเวลาลมพัดโดนผิวหนัง"},
                {"id": "tac_20", "section_id": "tactile", "number": 71, "text": "ไม่ชอบยืนต่อแถวชิดกับผู้อื่น เพราะกลัวคนอื่นมาแตะโดน"},
                {"id": "tac_21", "section_id": "tactile", "number": 72, "text": "ชอบขยำ บีบ หรือเล่นของเล่นที่มียางยืด นุ่มนิ่มเป็นเวลานาน"},

                {"id": "spe_1", "section_id": "special_elder", "number": 73, "text": "มีความยากลำบากในการวางแผนลำดับขั้นตอนกิจกรรมที่ซับซ้อน เช่น แต่งตัว จัดตารางสอน"},
                {"id": "spe_2", "section_id": "special_elder", "number": 74, "text": "รู้สึกเหนื่อยล้าหรือหมดแรงอย่างรวดเร็วหลังจากการทำกิจกรรมในห้องเรียน"},
                {"id": "spe_3", "section_id": "special_elder", "number": 75, "text": "ไม่สามารถปรับระดับความดังของเสียงตนเองให้เหมาะกับสถานการณ์ในโรงเรียน"}
            ]
        }'::jsonb,
        '{
            "algorithm": "sensory_profile_quadrant",
            "scoring_logic": {
                "section_total": "SUM(item_scores)",
                "conditional_logic": "Exclude special_elder if age_months < 72"
            },
            "quadrants": [
                {"code": "seeking", "name": "Sensory Seeking (แสวงหาการรับสัมผัส)", "description": "ชอบมอง หมุน ชน กอดรัด หรือส่งเสียงดัง"},
                {"code": "avoiding", "name": "Sensory Avoiding (หลีกเลี่ยงการรับสัมผัส)", "description": "อุดหู รังเกียจผิวสัมผัส กลัวความสูง ตกใจง่าย"},
                {"code": "sensitivity", "name": "Sensory Sensitivity (ไวต่อการกระตุ้น)", "description": "หงุดหงิด วอกแวก บ่นกลิ่น เสียง หรือแสง"},
                {"code": "low_registration", "name": "Low Registration (การรับรู้ต่ำ/เฉื่อย)", "description": "ไม่รู้เจ็บ ไม่รู้ตัวเมื่อเรียกชื่อ ซุ่มซ่าม ขี้ลืม"}
            ],
            "severity_bands": [
                {"level": "typical", "label": "การตอบสนองตามเกณฑ์ปกติ", "color": "#10B981"},
                {"level": "probable_difference", "label": "มีแนวโน้มความแตกต่างเล็กน้อยถึงปานกลาง", "color": "#F59E0B"},
                {"level": "definite_difference", "label": "มีความแตกต่างอย่างชัดเจน (ควรพบนักกิจกรรมบำบัด)", "color": "#EF4444"}
            ]
        }'::jsonb
    )
    ON CONFLICT (assessment_id, version_number) DO UPDATE SET
        schema_definition = EXCLUDED.schema_definition,
        rules_definition = EXCLUDED.rules_definition,
        published_at = EXCLUDED.published_at;
END $$;
