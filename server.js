// ==============================================================================
// GROWWISE PLATFORM - DUAL-PORT UNIFIED SERVER
// Hosts User Web App (Port 3000) & Admin Web App (Port 3001) with Shared Store
// ==============================================================================

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Load Shared Domain & Mock Data Store
// Import compiled or direct JS definitions
const { sharedDataStore } = require('./packages/shared/dist/mock-store');

const USER_PORT = process.env.USER_PORT || 3000;
const ADMIN_PORT = process.env.ADMIN_PORT || 3001;

// Helper to parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Send JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

// API Route Handler (Shared by both apps)
async function handleApiRequest(req, res, pathname, query) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return true;
  }

  // --- Auth APIs ---
  if (pathname === '/api/auth/current-user' && req.method === 'GET') {
    const user = await sharedDataStore.getCurrentUser();
    sendJson(res, 200, { user });
    return true;
  }

  if (pathname === '/api/auth/switch-role' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const user = await sharedDataStore.switchSimulatedRole(body.role);
    sendJson(res, 200, { user, message: `สลับบทบาทเป็น ${body.role} เรียบร้อยแล้ว` });
    return true;
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const result = await sharedDataStore.login(body.email, body.password);
    sendJson(res, 200, result);
    return true;
  }

  if (pathname === '/api/auth/register' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const user = await sharedDataStore.register(body);
    sendJson(res, 201, { user });
    return true;
  }

  if (pathname === '/api/auth/reset-password' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const result = await sharedDataStore.requestPasswordReset(body.email);
    sendJson(res, 200, result);
    return true;
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    await sharedDataStore.logout();
    sendJson(res, 200, { message: 'ออกจากระบบเรียบร้อยแล้ว' });
    return true;
  }

  // --- Children APIs ---
  if (pathname === '/api/children' && req.method === 'GET') {
    const currentUser = await sharedDataStore.getCurrentUser();
    if (!currentUser) {
      sendJson(res, 200, { children: [] });
      return true;
    }
    const children = await sharedDataStore.getChildrenForUser(currentUser.id, currentUser.role);
    sendJson(res, 200, { children });
    return true;
  }

  if (pathname === '/api/children' && req.method === 'POST') {
    const currentUser = await sharedDataStore.getCurrentUser();
    const body = await parseJsonBody(req);
    const child = await sharedDataStore.createChild(body, currentUser.id);
    await sharedDataStore.logAuditAction('CHILD_CREATED', child.id, { name: `${child.first_name} ${child.last_name}` }, currentUser);
    sendJson(res, 201, { child });
    return true;
  }

  if (pathname.startsWith('/api/children/') && req.method === 'GET') {
    const childId = pathname.split('/')[3];
    const currentUser = await sharedDataStore.getCurrentUser();
    const child = await sharedDataStore.getChildById(childId, currentUser.id);
    if (!child) return sendJson(res, 403, { error: 'ไม่มีสิทธิ์เข้าถึงข้อมูลเด็กนี้' });
    const grants = await sharedDataStore.getGrantsForChild(childId, currentUser.id);
    sendJson(res, 200, { child, grants });
    return true;
  }

  // --- Child Grants ---
  if (pathname === '/api/grants' && req.method === 'POST') {
    const currentUser = await sharedDataStore.getCurrentUser();
    const body = await parseJsonBody(req);
    const grant = await sharedDataStore.grantTeacherAccess(body.child_id, body.teacher_id, currentUser.id);
    sendJson(res, 201, { grant });
    return true;
  }

  if (pathname.startsWith('/api/grants/') && req.method === 'DELETE') {
    const grantId = pathname.split('/')[3];
    const currentUser = await sharedDataStore.getCurrentUser();
    const success = await sharedDataStore.revokeAccess(grantId, currentUser.id);
    sendJson(res, 200, { success });
    return true;
  }

  // --- Assessments APIs ---
  if (pathname === '/api/assessments' && req.method === 'GET') {
    const role = query.role;
    const ageMonths = query.age ? parseInt(query.age, 10) : undefined;
    const assessments = await sharedDataStore.getPublishedAssessments(role, ageMonths);
    sendJson(res, 200, { assessments });
    return true;
  }

  if (pathname === '/api/admin/assessments' && req.method === 'GET') {
    const assessments = await sharedDataStore.getAllAssessmentsAdmin();
    sendJson(res, 200, { assessments });
    return true;
  }

  if (pathname.startsWith('/api/assessments/') && pathname.endsWith('/version') && req.method === 'GET') {
    const assessmentId = pathname.split('/')[3];
    const version = await sharedDataStore.getAssessmentVersion(assessmentId);
    sendJson(res, 200, { version });
    return true;
  }

  if (pathname === '/api/admin/assessments/draft' && req.method === 'POST') {
    const currentUser = await sharedDataStore.getCurrentUser();
    const body = await parseJsonBody(req);
    const operatorId = currentUser ? currentUser.id : 'usr_super_admin';
    const result = await sharedDataStore.saveAssessmentDraft(body.assessment, body.version, operatorId);
    sendJson(res, 200, result);
    return true;
  }

  if (pathname === '/api/admin/assessments/publish' && req.method === 'POST') {
    const currentUser = await sharedDataStore.getCurrentUser();
    const body = await parseJsonBody(req);
    const version = await sharedDataStore.publishAssessmentVersion(body.assessment_id, body.version_number, currentUser ? currentUser.id : 'usr_super_admin');
    sendJson(res, 200, { version });
    return true;
  }

  // Update Assessment Info
  if (pathname.startsWith('/api/admin/assessments/') && (pathname.endsWith('/update') || req.method === 'PUT')) {
    const assessmentId = pathname.split('/')[4];
    const currentUser = await sharedDataStore.getCurrentUser();
    const body = await parseJsonBody(req);
    const updated = await sharedDataStore.updateAssessment(assessmentId, body, currentUser ? currentUser.id : 'usr_super_admin');
    sendJson(res, 200, { assessment: updated });
    return true;
  }

  // Delete Assessment
  if (pathname.startsWith('/api/admin/assessments/') && (pathname.endsWith('/delete') || req.method === 'DELETE')) {
    const assessmentId = pathname.split('/')[4];
    const currentUser = await sharedDataStore.getCurrentUser();
    const result = await sharedDataStore.deleteAssessment(assessmentId, currentUser ? currentUser.id : 'usr_super_admin');
    sendJson(res, 200, result);
    return true;
  }

  // Update Assessment Clinical Rules
  if (pathname.startsWith('/api/admin/assessments/') && pathname.endsWith('/rules') && (req.method === 'POST' || req.method === 'PUT')) {
    const assessmentId = pathname.split('/')[4];
    const currentUser = await sharedDataStore.getCurrentUser();
    const body = await parseJsonBody(req);
    const version = await sharedDataStore.updateAssessmentRules(assessmentId, body.rules, currentUser ? currentUser.id : 'usr_super_admin');
    sendJson(res, 200, { version });
    return true;
  }

  // --- Responses & Scoring APIs ---
  if (pathname === '/api/responses/draft' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const draft = await sharedDataStore.saveDraftResponse(body);
    sendJson(res, 200, { draft });
    return true;
  }

  if (pathname === '/api/responses/submit' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const result = await sharedDataStore.submitResponse(body);
    sendJson(res, 201, result);
    return true;
  }

  if (pathname.startsWith('/api/children/') && pathname.endsWith('/history') && req.method === 'GET') {
    const childId = pathname.split('/')[3];
    const currentUser = await sharedDataStore.getCurrentUser();
    const history = await sharedDataStore.getHistoryForChild(childId, currentUser.id);
    sendJson(res, 200, { history });
    return true;
  }

  if (pathname === '/api/admin/results' && req.method === 'GET') {
    const results = await sharedDataStore.getAllResultsAdmin();
    sendJson(res, 200, { results });
    return true;
  }

  if (pathname === '/api/admin/results/interpret' && req.method === 'POST') {
    const currentUser = await sharedDataStore.getCurrentUser();
    const body = await parseJsonBody(req);
    const updated = await sharedDataStore.updateResultInterpretationAdmin(
      body.result_id,
      body.status,
      body.status_label,
      body.notes || '',
      currentUser ? currentUser.id : 'usr_super_admin'
    );
    sendJson(res, 200, { result: updated });
    return true;
  }

  // --- Admin Stats & Audit APIs ---
  if (pathname === '/api/admin/stats' && req.method === 'GET') {
    const users = await sharedDataStore.getAllUsersAdmin();
    const children = await sharedDataStore.getChildrenForUser('all', 'super_admin');
    const assessments = await sharedDataStore.getAllAssessmentsAdmin();
    const results = await sharedDataStore.getAllResultsAdmin();
    sendJson(res, 200, {
      totalUsers: users.length,
      totalChildren: children.length,
      publishedAssessments: assessments.filter(a => a.status === 'published').length,
      totalAssessmentsTaken: results.length,
      pendingSpecialistReview: results.filter(r => r.result.overall_status === 'pending_specialist_review').length,
    });
    return true;
  }

  if (pathname === '/api/admin/users' && req.method === 'GET') {
    const users = await sharedDataStore.getAllUsersAdmin();
    sendJson(res, 200, { users });
    return true;
  }

  if (pathname === '/api/admin/users' && req.method === 'POST') {
    const currentUser = await sharedDataStore.getCurrentUser();
    const body = await parseJsonBody(req);
    try {
      const newUser = await sharedDataStore.createUserAdmin(body, currentUser ? currentUser.id : 'usr_super_admin');
      sendJson(res, 201, { user: newUser, message: 'สร้างผู้ใช้งานสำเร็จ' });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return true;
  }

  const userUpdateMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)(\/update)?$/);
  if (userUpdateMatch && (req.method === 'PUT' || (req.method === 'POST' && pathname.endsWith('/update')))) {
    const targetUserId = userUpdateMatch[1];
    const currentUser = await sharedDataStore.getCurrentUser();
    const body = await parseJsonBody(req);
    try {
      const updated = await sharedDataStore.updateUserAdmin(targetUserId, body, currentUser ? currentUser.id : 'usr_super_admin');
      sendJson(res, 200, { user: updated, message: 'แก้ไขข้อมูลผู้ใช้สำเร็จ' });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return true;
  }

  const userDeleteMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)(\/delete)?$/);
  if (userDeleteMatch && (req.method === 'DELETE' || (req.method === 'POST' && pathname.endsWith('/delete')))) {
    const targetUserId = userDeleteMatch[1];
    const currentUser = await sharedDataStore.getCurrentUser();
    try {
      const result = await sharedDataStore.deleteUserAdmin(targetUserId, currentUser ? currentUser.id : 'usr_super_admin');
      sendJson(res, 200, { ...result, message: 'ลบผู้ใช้งานสำเร็จ' });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return true;
  }

  if (pathname === '/api/admin/users/role' && req.method === 'POST') {
    const currentUser = await sharedDataStore.getCurrentUser();
    const body = await parseJsonBody(req);
    const updated = await sharedDataStore.updateUserRoleAdmin(body.user_id, body.role, currentUser ? currentUser.id : 'usr_super_admin');
    sendJson(res, 200, { user: updated });
    return true;
  }

  if (pathname === '/api/admin/audit-logs' && req.method === 'GET') {
    const logs = await sharedDataStore.getAuditLogsAdmin(50);
    sendJson(res, 200, { logs });
    return true;
  }

  return false;
}

// ------------------------------------------------------------------------------
// USER WEB APP HTTP SERVER (PORT 3000)
// ------------------------------------------------------------------------------
const userServer = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. Try API endpoints
  if (pathname.startsWith('/api/')) {
    try {
      const handled = await handleApiRequest(req, res, pathname, parsedUrl.query);
      if (handled) return;
    } catch (err) {
      console.error('[API Error: UserServer]', pathname, err);
      sendJson(res, 500, { error: err.message || 'Internal Server Error' });
      return;
    }
  }

  // 2. Serve User Web App HTML
  const userHtmlPath = path.join(__dirname, 'apps', 'user-web', 'index.html');
  if (fs.existsSync(userHtmlPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(userHtmlPath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('User Web App is building...');
  }
});

// ------------------------------------------------------------------------------
// ADMIN WEB APP HTTP SERVER (PORT 3001)
// ------------------------------------------------------------------------------
const adminServer = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. Try API endpoints
  if (pathname.startsWith('/api/')) {
    try {
      const handled = await handleApiRequest(req, res, pathname, parsedUrl.query);
      if (handled) return;
    } catch (err) {
      console.error('[API Error: AdminServer]', pathname, err);
      sendJson(res, 500, { error: err.message || 'Internal Server Error' });
      return;
    }
  }

  // 2. Serve Admin Web App HTML
  const adminHtmlPath = path.join(__dirname, 'apps', 'admin-web', 'index.html');
  if (fs.existsSync(adminHtmlPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(adminHtmlPath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Admin Web App is building...');
  }
});

// Start Servers
userServer.listen(USER_PORT, () => {
  console.log(`[GrowWise User Web App] running at: http://localhost:${USER_PORT}`);
});

adminServer.listen(ADMIN_PORT, () => {
  console.log(`[GrowWise Admin Web App] running at: http://localhost:${ADMIN_PORT}`);
});
