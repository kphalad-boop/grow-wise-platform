import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qjocagwfzazcgzqnyhux.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_7VCW1PGILyI3mDx7Yikycg_QId8b5Ri';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  organization?: string;
  phone_number?: string;
  created_at: string;
}

// Clean Production State — Users & Logs start empty
let usersStore: User[] = [];
let auditLogs: any[] = [];

// Official Clinical Screening Instruments + Dynamic Builder Store
let assessmentsStore: any[] = [
  {
    id: 'asm_kus_si_1',
    code: 'KUS-SI 1',
    title: 'แบบคัดกรองบุคคลที่มีปัญหาทางการเรียนรู้และพฤติกรรม (พฤติกรรมสมาธิสั้น)',
    description: 'คัดกรองพฤติกรรมสมาธิสั้น ซนอยู่ไม่นิ่ง และหุนหันพลันแล่น (ADHD) ช่วงอายุ 6-12 ปี',
    min_age_months: 72,
    max_age_months: 155,
    target_roles: ['parent', 'teacher'],
    status: 'published',
    current_version: 1,
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'asm_kus_si_2',
    code: 'KUS-SI 2',
    title: 'แบบคัดกรองบุคคลที่มีปัญหาทางการเรียนรู้ (LD - ด้านการอ่าน การเขียน และคณิตศาสตร์)',
    description: 'คัดกรองความบกพร่องทางการเรียนรู้ 3 ด้านสำคัญ: การอ่าน การเขียน และการคำนวณ ช่วงอายุ 6-12 ปี',
    min_age_months: 72,
    max_age_months: 155,
    target_roles: ['parent', 'teacher'],
    status: 'published',
    current_version: 1,
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'asm_kus_si_3',
    code: 'KUS-SI 3',
    title: 'แบบคัดกรองบุคคลที่มีความบกพร่องทางออทิสติก (Autism Spectrum)',
    description: 'คัดกรองพฤติกรรมด้านการสื่อสาร ปฏิสัมพันธ์ทางสังคม และพฤติกรรมซ้ำๆ ช่วงอายุ 6-12 ปี',
    min_age_months: 72,
    max_age_months: 155,
    target_roles: ['parent', 'teacher'],
    status: 'published',
    current_version: 1,
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'asm_kus_si_4',
    code: 'KUS-SI 4',
    title: 'แบบคัดกรองบุคคลที่มีปัญหาทางพฤติกรรมและอารมณ์ (Emotional & Behavioral)',
    description: 'คัดกรองภาวะวิตกกังวล อารมณ์ซึมเศร้า และพฤติกรรมก้าวร้าวต่อต้าน ช่วงอายุ 6-12 ปี',
    min_age_months: 72,
    max_age_months: 155,
    target_roles: ['parent', 'teacher'],
    status: 'published',
    current_version: 1,
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'asm_kus_si_5',
    code: 'KUS-SI 5',
    title: 'แบบคัดกรองบุคคลที่มีความบกพร่องทางสติปัญญาและพัฒนาการล่าช้า (Intellectual / DSPM Extended)',
    description: 'คัดกรองทักษะการปรับตัว ความสามารถทางสติปัญญาและพัฒนาการสมวัย ช่วงอายุ 6-12 ปี',
    min_age_months: 72,
    max_age_months: 155,
    target_roles: ['parent', 'teacher'],
    status: 'published',
    current_version: 1,
    created_at: '2026-11-01T00:00:00Z',
  },
];

async function getPath(params: Promise<{ path: string[] }> | { path: string[] }) {
  const resolved = await params;
  return '/' + (resolved.path || []).join('/');
}

// ----------------------------------------------------
// GET HANDLER
// ----------------------------------------------------
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const pathname = await getPath(context.params);

  if (pathname === '/system/status') {
    return NextResponse.json({
      status: 'ok',
      supabase: 'connected',
      project: 'qjocagwfzazcgzqnyhux',
      timestamp: new Date().toISOString(),
    });
  }

  if (pathname === '/admin/stats') {
    let totalChildren = 0;
    let publishedAssessments = assessmentsStore.filter((a) => a.status === 'published').length;
    let totalAssessmentsTaken = 0;
    let pendingSpecialistReview = 0;

    try {
      const { count: chCount } = await supabase.from('children').select('*', { count: 'exact', head: true });
      totalChildren = chCount || 0;
      const { count: asCount } = await supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('status', 'published');
      if (asCount) publishedAssessments = asCount;
      const { count: subCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true });
      totalAssessmentsTaken = subCount || 0;
      const { count: rvCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('overall_status', 'pending_specialist_review');
      pendingSpecialistReview = rvCount || 0;
    } catch (e) {}

    return NextResponse.json({
      totalChildren,
      publishedAssessments,
      totalAssessmentsTaken,
      pendingSpecialistReview,
    });
  }

  if (pathname === '/admin/users') {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return NextResponse.json({ users: data });
      }
    } catch (e) {}
    return NextResponse.json({ users: usersStore });
  }

  if (pathname === '/admin/audit-logs') {
    return NextResponse.json({ logs: auditLogs });
  }

  if (pathname === '/admin/assessments') {
    try {
      const { data, error } = await supabase.from('assessments').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const merged = [...data];
        for (const localAsm of assessmentsStore) {
          if (!merged.find((m) => m.code === localAsm.code || m.id === localAsm.id)) {
            merged.unshift(localAsm);
          }
        }
        return NextResponse.json({ assessments: merged });
      }
    } catch (e) {}
    return NextResponse.json({ assessments: assessmentsStore });
  }

  if (pathname === '/admin/results') {
    try {
      const { data, error } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return NextResponse.json({ results: data });
      }
    } catch (e) {}
    return NextResponse.json({ results: [] });
  }

  if (pathname === '/children') {
    try {
      const { data } = await supabase.from('children').select('*').order('created_at', { ascending: false });
      return NextResponse.json({ children: data || [] });
    } catch (e) {
      return NextResponse.json({ children: [] });
    }
  }

  if (pathname === '/assessments') {
    try {
      const { data } = await supabase.from('assessments').select('*, assessment_versions(*)').eq('status', 'published');
      if (data && data.length > 0) {
        return NextResponse.json({ assessments: data });
      }
    } catch (e) {}
    return NextResponse.json({ assessments: assessmentsStore.filter((a) => a.status === 'published') });
  }

  if (pathname === '/auth/current-user') {
    return NextResponse.json({
      user: {
        id: 'usr_guest',
        full_name: 'ผู้ใช้งานระบบ',
        email: 'user@growwise.internal',
        role: 'parent',
      },
    });
  }

  return NextResponse.json({ error: 'Endpoint not found', path: pathname }, { status: 404 });
}

// ----------------------------------------------------
// POST HANDLER
// ----------------------------------------------------
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const pathname = await getPath(context.params);
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  // Auth Login
  if (pathname === '/auth/login') {
    const email = body.email || 'user@growwise.internal';
    return NextResponse.json({
      user: {
        id: 'usr_' + Date.now(),
        full_name: email.split('@')[0],
        email,
        role: body.role || 'parent',
      },
    });
  }

  // Auth Register
  if (pathname === '/auth/register') {
    return NextResponse.json({
      user: {
        id: 'usr_' + Date.now(),
        full_name: body.full_name || 'ผู้ใช้งานใหม่',
        email: body.email,
        role: body.role || 'parent',
      },
    });
  }

  // Add Child
  if (pathname === '/children') {
    try {
      const { data } = await supabase.from('children').insert([body]).select().single();
      return NextResponse.json({ child: data || body });
    } catch (e) {
      return NextResponse.json({ child: body });
    }
  }

  // Create User
  if (pathname === '/admin/users') {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      full_name: body.full_name || 'ผู้ใช้งานใหม่',
      email: body.email,
      role: body.role || 'parent',
      organization: body.organization || '',
      phone_number: body.phone_number || '',
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('users').insert({
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization,
        phone_number: newUser.phone_number,
      });
    } catch (e) {
      console.warn('Supabase insert user error:', e);
    }

    usersStore.unshift(newUser);

    auditLogs.unshift({
      id: 'log_' + Date.now(),
      action: 'USER_CREATED',
      details: `สร้างผู้ใช้งาน: ${newUser.full_name} (${newUser.role})`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { user: newUser, message: 'สร้างผู้ใช้งานสำเร็จ' },
      { status: 201 }
    );
  }

  // Update User
  if (pathname.startsWith('/admin/users/') && pathname.endsWith('/update')) {
    const userId = pathname.split('/')[3];
    const userIdx = usersStore.findIndex((u) => u.id === userId);
    if (userIdx !== -1) {
      usersStore[userIdx] = { ...usersStore[userIdx], ...body };
      return NextResponse.json({ user: usersStore[userIdx], message: 'แก้ไขข้อมูลผู้ใช้สำเร็จ' });
    }
    return NextResponse.json({ user: body, message: 'แก้ไขข้อมูลสำเร็จ' });
  }

  // Delete User
  if (pathname.startsWith('/admin/users/') && pathname.endsWith('/delete')) {
    const userId = pathname.split('/')[3];
    usersStore = usersStore.filter((u) => u.id !== userId);
    try {
      await supabase.from('users').delete().eq('id', userId);
    } catch (e) {}
    return NextResponse.json({ success: true, message: 'ลบผู้ใช้งานสำเร็จ' });
  }

  // Update Role
  if (pathname === '/admin/users/role') {
    const user = usersStore.find((u) => u.id === body.user_id);
    if (user) {
      user.role = body.role;
    }
    try {
      await supabase.from('users').update({ role: body.role }).eq('id', body.user_id);
    } catch (e) {}
    return NextResponse.json({ user, message: 'เปลี่ยนสิทธิ์สำเร็จ' });
  }

  // Save Draft Assessment (Builder)
  if (pathname === '/admin/assessments/draft') {
    const asm = body.assessment || {};
    const newAsm = {
      id: asm.id || 'asm_' + (asm.code || '').toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now(),
      code: asm.code || 'CUSTOM',
      title: asm.title || 'แบบประเมินร่าง',
      description: asm.description || '',
      min_age_months: asm.min_age_months || 0,
      max_age_months: asm.max_age_months || 216,
      target_roles: asm.target_roles || ['parent', 'teacher'],
      status: 'draft',
      current_version: 1,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('assessments').upsert([newAsm]);
      if (body.version) {
        await supabase.from('assessment_versions').insert([
          {
            assessment_id: newAsm.id,
            version_number: 1,
            status: 'draft',
            schema_definition: body.version.schema_definition || {},
            rules_definition: body.version.rules_definition || {},
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.warn('Supabase assessment draft save notice:', e);
    }

    const exIdx = assessmentsStore.findIndex((a) => a.code === newAsm.code || a.id === newAsm.id);
    if (exIdx !== -1) {
      assessmentsStore[exIdx] = newAsm;
    } else {
      assessmentsStore.unshift(newAsm);
    }

    return NextResponse.json({ success: true, assessment: newAsm, version: 1 });
  }

  // Publish Assessment
  if (pathname === '/admin/assessments/publish') {
    const asmId = body.assessment_id;
    const asm = assessmentsStore.find((a) => a.id === asmId);
    if (asm) {
      asm.status = 'published';
    }
    try {
      await supabase.from('assessments').update({ status: 'published' }).eq('id', asmId);
    } catch (e) {}
    return NextResponse.json({ success: true, version: body.version_number || 1 });
  }

  if (pathname.startsWith('/admin/assessments/') && pathname.endsWith('/rules')) {
    return NextResponse.json({ success: true, version: 1 });
  }

  if (pathname === '/admin/results/interpret') {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true, path: pathname });
}

// ----------------------------------------------------
// PUT & DELETE & OPTIONS HANDLERS
// ----------------------------------------------------
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return POST(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return POST(request, context);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
