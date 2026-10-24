/**
 * FixTrack QR - Automated API Integration Test Suite
 * Tests Auth, Locations, Complaint Submission, and Admin Workflow.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting FixTrack QR Integration Smoke Tests...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('Health check endpoint returns online', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'online') throw new Error('Status not online');
  });

  // 2. Student Login
  let studentToken = '';
  await test('Student login with default seed credentials', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@campus.edu', password: 'student123' }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Login failed');
    studentToken = data.data.token;
    if (!studentToken) throw new Error('No token returned');
  });

  // 3. Admin Login
  let adminToken = '';
  await test('Admin login with default seed credentials', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campus.edu', password: 'admin123' }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Login failed');
    adminToken = data.data.token;
    if (data.data.role !== 'admin') throw new Error('Role is not admin');
  });

  // 4. Fetch Locations
  let sampleLocation = null;
  await test('Public GET /locations returns campus rooms', async () => {
    const res = await fetch(`${BASE_URL}/locations`);
    const data = await res.json();
    if (!res.ok || !data.success || data.data.length === 0) throw new Error('No locations found');
    sampleLocation = data.data[0];
  });

  // 5. Lookup Location by QR Code
  await test(`Lookup location by QR code (${sampleLocation?.qrCodeId})`, async () => {
    if (!sampleLocation) throw new Error('No sample location');
    const res = await fetch(`${BASE_URL}/locations/code/${sampleLocation.qrCodeId}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error('Location lookup failed');
  });

  // 6. Submit Complaint as Student
  let createdComplaintId = '';
  await test('Student submits a new maintenance complaint', async () => {
    const res = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Automated Test: Flickering LED Tube',
        description: 'Third row tube light blinks continuously during test execution.',
        category: 'Electrical',
        priority: 'Low',
        locationId: sampleLocation._id,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Complaint submission failed');
    createdComplaintId = data.data._id;
  });

  // 7. Admin updates complaint status to "In Progress"
  await test('Admin updates complaint status and adds remarks', async () => {
    if (!createdComplaintId) throw new Error('No complaint ID');
    const res = await fetch(`${BASE_URL}/complaints/${createdComplaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'In Progress',
        adminRemarks: 'Assigned to campus electrician team for ballast check.',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success || data.data.status !== 'In Progress') {
      throw new Error(data.message || 'Status update failed');
    }
  });

  // 8. Admin fetches dashboard stats
  await test('Admin fetches stats summary with category aggregations', async () => {
    const res = await fetch(`${BASE_URL}/complaints/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.data.totals) throw new Error('Stats retrieval failed');
  });

  console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests();
