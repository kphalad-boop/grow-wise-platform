const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('Testing User CRUD Endpoints on Port 3001...');
  
  // 1. Get all users
  const get1 = await request({ host: '127.0.0.1', port: 3001, path: '/api/admin/users', method: 'GET' });
  console.log('Initial user count:', get1.body.users.length);

  // 2. Create user
  const post1 = await request(
    { host: '127.0.0.1', port: 3001, path: '/api/admin/users', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    {
      full_name: 'คุณครู วาสนา นันทนา',
      email: 'kru.wassana@school.ac.th',
      role: 'teacher',
      organization: 'โรงเรียนอนุบาลพัฒนา',
      phone_number: '089-111-2233'
    }
  );
  console.log('Create User status:', post1.status, 'User ID:', post1.body.user.id, 'Role:', post1.body.user.role);
  const createdId = post1.body.user.id;

  // 3. Update user
  const update1 = await request(
    { host: '127.0.0.1', port: 3001, path: '/api/admin/users/' + createdId + '/update', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    {
      full_name: 'คุณครู วาสนา นันทนา (ครูชำนาญการพิเศษ)',
      email: 'kru.wassana@school.ac.th',
      role: 'teacher',
      organization: 'โรงเรียนอนุบาลพัฒนา เขต 1',
      phone_number: '089-111-2233'
    }
  );
  console.log('Update User status:', update1.status, 'New Name:', update1.body.user.full_name);

  // 4. Delete user
  const del1 = await request(
    { host: '127.0.0.1', port: 3001, path: '/api/admin/users/' + createdId + '/delete', method: 'POST' }
  );
  console.log('Delete User status:', del1.status, 'Deleted ID:', del1.body.deleted_id);

  // 5. Final count
  const get2 = await request({ host: '127.0.0.1', port: 3001, path: '/api/admin/users', method: 'GET' });
  console.log('Final user count:', get2.body.users.length);

  if (get1.body.users.length === get2.body.users.length) {
    console.log('ALL USER CRUD API TESTS PASSED SUCCESSFULLY!');
  } else {
    throw new Error('User count mismatch!');
  }
}

run().catch(err => { console.error(err); process.exit(1); });
