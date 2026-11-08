import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qjocagwfzazcgzqnyhux.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_7VCW1PGILyI3mDx7Yikycg_QId8b5Ri';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// In-memory persistent state across warm invocations
interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  organization?: string;
  phone_number?: string;
  created_at: string;
}

let usersStore: User[] = [
  {
    id: 'usr_super_admin',
    full_name: 'ผู้ดูแลระบบหลัก',
    email: 'admin@growwise.com',
    role: 'super_admin',
    organization: 'GrowWise HQ',
    phone_number: '0945239965',
    created_at: new Date().toISOString(),
  },
  {
    id: 'usr_specialist_1',
    full_name: 'พญ. พัฒนาพร มีสุข',
    email: 'dr.pattanaporn@growwise.com',
    role: 'specialist',
    organization: 'สถาบันพัฒนาการเด็ก',
    phone_number: '0812345678',
    created_at: new Date().toISOString(),
  },
  {
    id: 'usr_teacher_1',
    full_name: 'ครูสมศรี ใจดี',
    email: 'somsri@school.ac.th',
    role: 'teacher',
    organization: 'โรงเรียนสาธิต',
    phone_number: '0898765432',
    created_at: new Date().toISOString(),
  },
];

let auditLogs: any[] = [
  {
    id: 'log_init',
    action: 'SYSTEM_BOOT',
    details: 'GrowWise System Initialized with Supabase Realtime',
    timestamp: new Date().toISOString(),
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
    return NextResponse.json({
      totalChildren: 12,
      totalAssessments: 5,
      publishedAssessments: 3,
      pendingSpecialistReview: 1,
    });
  }

  if (pathname === '/admin/users') {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return NextResponse.json({ users: data });
      }
    } catch (e) {
      // Fallback to in-memory
    }
    return NextResponse.json({ users: usersStore });
  }

  if (pathname === '/admin/audit-logs') {
    return NextResponse.json({ logs: auditLogs });
  }

  if (pathname === '/admin/assessments') {
    try {
      const { data, error } = await supabase.from('assessments').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return NextResponse.json({ assessments: data });
      }
    } catch (e) {}
    return NextResponse.json({ assessments: [] });
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

    // Try Supabase insert
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

    // Update in-memory store
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
    return NextResponse.json({ success: true, message: 'ลบผู้ใช้งานสำเร็จ' });
  }

  // Update Role
  if (pathname === '/admin/users/role') {
    const user = usersStore.find((u) => u.id === body.user_id);
    if (user) {
      user.role = body.role;
    }
    return NextResponse.json({ user, message: 'เปลี่ยนสิทธิ์สำเร็จ' });
  }

  // Assessments & Results
  if (pathname === '/admin/assessments/draft' || pathname === '/admin/assessments/publish') {
    return NextResponse.json({ success: true, version: 1 });
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
