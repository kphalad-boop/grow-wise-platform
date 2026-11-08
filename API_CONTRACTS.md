# GrowWise Platform — API Contracts & Integration Guide

เอกสารนี้ระบุรายละเอียดสัญญาการเชื่อมต่อ (API Contracts) ระหว่าง **GrowWise User Web App** (พอร์ต 3000), **GrowWise Admin** (พอร์ต 3001) และ **Data Abstraction Layer**

---

## 1. ข้อมูลพื้นฐาน (Base URL & Headers)

- **User Web API:** `http://localhost:3000/api`
- **Admin Web API:** `http://localhost:3001/api`
- **Content-Type:** `application/json; charset=utf-8`
- **Authorization:** `Bearer <JWT_TOKEN>` (ในโหมด Prototype จำลอง session อัตโนมัติ)

---

## 2. กลุ่ม API ระบบยืนยันตัวตน (Authentication & Profiles)

### 2.1 `GET /api/auth/current-user`
ดึงข้อมูลโปรไฟล์ของผู้ใช้ปัจจุบัน
- **Response `200 OK`:**
```json
{
  "user": {
    "id": "usr_parent_dao",
    "role": "parent",
    "full_name": "คุณแม่ ดาวเรือง ใจดี",
    "email": "dao.jaidee@gmail.com",
    "phone_number": "085-555-1234",
    "organization": null,
    "created_at": "2026-11-01T00:00:00Z",
    "updated_at": "2026-11-01T00:00:00Z"
  }
}
```

### 2.2 `POST /api/auth/switch-role` *(เฉพาะโหมด Prototype)*
จำลองการสลับบทบาทผู้ใช้เพื่อการทดสอบ UI และสิทธิ์
- **Request Body:**
```json
{
  "role": "teacher" // "parent" | "teacher" | "specialist" | "admin" | "super_admin" | "guest"
}
```
- **Response `200 OK`:**
```json
{
  "user": { "id": "usr_teacher_nipa", "role": "teacher", "full_name": "ครู นิภา วงศ์สว่าง" },
  "message": "สลับบทบาทเป็น teacher เรียบร้อยแล้ว"
}
```

### 2.3 `POST /api/auth/login`
เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
- **Request Body:**
```json
{
  "email": "dao.jaidee@gmail.com",
  "password": "••••••••"
}
```
- **Response `200 OK`:**
```json
{
  "user": { "id": "usr_parent_dao", "role": "parent", "full_name": "คุณแม่ ดาวเรือง ใจดี" },
  "token": "mock-jwt-usr_parent_dao"
}
```

### 2.4 `POST /api/auth/reset-password`
ขอลิงก์สำหรับรีเซ็ตรหัสผ่านแบบใช้ครั้งเดียว
- **Request Body:**
```json
{
  "email": "dao.jaidee@gmail.com"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "ลิงก์ตั้งรหัสผ่านใหม่แบบใช้ครั้งเดียวถูกสร้างและส่งไปยัง dao.jaidee@gmail.com แล้ว (อายุ 15 นาที)"
}
```

---

## 3. กลุ่ม API จัดการข้อมูลเด็กและสิทธิ์ (Children & Access Grants)

### 3.1 `GET /api/children`
ดึงรายชื่อเด็กที่ผู้ใช้ปัจจุบันมีสิทธิ์เข้าถึง (Parent เห็นเด็กของตนเอง, Teacher เห็นเด็กที่ได้รับอนุญาต)
- **Response `200 OK`:**
```json
{
  "children": [
    {
      "id": "child_phum",
      "first_name": "ภูมิภัทร",
      "last_name": "ใจดี",
      "nickname": "น้องภูมิ",
      "birth_date": "2019-08-15",
      "gender": "male",
      "school_name": "โรงเรียนสาธิตพัฒนาการ",
      "grade_level": "ประถมศึกษาปีที่ 2",
      "created_by": "usr_parent_dao"
    }
  ]
}
```

### 3.2 `POST /api/children`
เพิ่มข้อมูลเด็กใหม่ในความดูแล
- **Request Body:**
```json
{
  "first_name": "ภูมิภัทร",
  "last_name": "ใจดี",
  "nickname": "น้องภูมิ",
  "gender": "male",
  "birth_date": "2019-08-15",
  "school_name": "โรงเรียนสาธิตพัฒนาการ",
  "grade_level": "ประถมศึกษาปีที่ 2"
}
```
- **Response `201 Created`:**
```json
{
  "child": { "id": "child_1731050000", "first_name": "ภูมิภัทร", "last_name": "ใจดี" }
}
```

### 3.3 `DELETE /api/grants/:id`
เพิกถอนสิทธิ์คุณครูจากการเข้าถึงข้อมูลของเด็ก
- **Response `200 OK`:**
```json
{ "success": true }
```

---

## 4. กลุ่ม API แบบประเมิน (Assessments & Versions)

### 4.1 `GET /api/assessments`
ดึงรายการแบบประเมินที่อยู่ในสถานะ **`published`** (รองรับ query `?role=teacher&age=86`)
- **Response `200 OK`:**
```json
{
  "assessments": [
    {
      "id": "kus-si-1-adhd",
      "code": "KUS-SI-1",
      "title": "KUS-SI 1: แบบประเมินพฤติกรรมสมาธิสั้น (ADHD)",
      "estimated_time_minutes": 10,
      "min_age_months": 60,
      "max_age_months": 216,
      "target_roles": ["teacher", "specialist"],
      "status": "published",
      "current_version": 1
    }
  ]
}
```

### 4.2 `GET /api/assessments/:id/version`
ดึงโครงสร้างคำถามและตัวเลือก (Schema Definition) และสูตรประเมิน (Rules Definition) ของเวอร์ชันปัจจุบัน
- **Response `200 OK`:**
```json
{
  "version": {
    "id": "kus-si-1-v1",
    "assessment_id": "kus-si-1-adhd",
    "version_number": 1,
    "schema_definition": {
      "scale": [{ "value": 0, "label": "0 = ไม่พบพฤติกรรมนี้เลย" }],
      "sections": [{ "id": "hyperactive", "title": "หมวดที่ 1: ซน วู่วาม (15 ข้อ)" }],
      "items": [{ "id": "adhd_1", "number": 1, "text": "ยุกยิก มือเท้าขยับไปมา..." }]
    },
    "rules_definition": {
      "has_validated_t_scores": false,
      "domains": [{ "domain_id": "hyperactive", "max_possible_raw_score": 45 }]
    }
  }
}
```

---

## 5. กลุ่ม API การตอบแบบประเมินและผลลัพธ์ (Responses & Scoring)

### 5.1 `POST /api/responses/draft`
บันทึกร่างคำตอบระหว่างทำแบบประเมิน (Save Draft)
- **Request Body:**
```json
{
  "assessment_version_id": "kus-si-1-v1",
  "child_id": "child_phum",
  "raw_answers": { "adhd_1": 2, "adhd_2": 3 }
}
```

### 5.2 `POST /api/responses/submit`
ส่งคำตอบเพื่อประมวลผลคะแนนตามเกณฑ์และ Clinical Guardrails
- **Request Body:**
```json
{
  "assessment_version_id": "kus-si-1-v1",
  "child_id": "child_phum",
  "respondent_id": "usr_teacher_nipa",
  "respondent_role": "teacher",
  "assessment_date": "2026-11-08",
  "calculated_age_years": 7,
  "calculated_age_months": 2,
  "calculated_age_display": "7 ปี 2 เดือน",
  "raw_answers": { "adhd_1": 2, "adhd_2": 3, "adhd_3": 1, ... },
  "privacy_consent_accepted": true,
  "privacy_consent_version": "1.0-TH-2026"
}
```
- **Response `201 Created`:**
```json
{
  "response": { "id": "resp_1731050000", "status": "submitted" },
  "result": {
    "assessment_code": "KUS-SI-1",
    "assessment_title": "KUS-SI 1: แบบประเมินพฤติกรรมสมาธิสั้น (ADHD)",
    "total_raw_score": 58,
    "max_possible_raw_score": 90,
    "overall_status_label": "รอผู้เชี่ยวชาญตรวจและแปลผล",
    "mandatory_disclaimer": "ผลนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัย",
    "domain_results": [
      {
        "domain_id": "hyperactive",
        "title_th": "ด้านซน วู่วาม และอยู่ไม่นิ่ง",
        "raw_score": 28,
        "max_score": 45,
        "t_score": null,
        "status_badge": "รอผู้เชี่ยวชาญตรวจและแปลผล"
      }
    ]
  }
}
```

---

## 6. กลุ่ม API ฝั่ง Admin (Medical Analytics & Governance)

### 6.1 `GET /api/admin/stats`
สรุปตัวชี้วัดแดชบอร์ด
- **Response `200 OK`:**
```json
{
  "totalUsers": 5,
  "totalChildren": 2,
  "publishedAssessments": 5,
  "totalAssessmentsTaken": 1,
  "pendingSpecialistReview": 1
}
```

### 6.2 `POST /api/admin/assessments/publish`
เผยแพร่แบบประเมินเวอร์ชันใหม่ (พร้อมบันทึก Audit Log)
- **Request Body:**
```json
{
  "assessment_id": "kus-si-1-adhd",
  "version_number": 1
}
```

### 6.3 `GET /api/admin/audit-logs`
ดึงบันทึกความปลอดภัย 50 รายการล่าสุด
- **Response `200 OK`:**
```json
{
  "logs": [
    {
      "id": "log_1731050000",
      "user_name": "Super Administrator",
      "user_role": "super_admin",
      "action": "ASSESSMENT_PUBLISHED",
      "target_resource": "KUS-SI-1",
      "ip_address": "127.0.0.1",
      "created_at": "2026-11-08T12:00:00Z"
    }
  ]
}
```
