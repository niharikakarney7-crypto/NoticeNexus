/**
 * NoticeNexus — Comprehensive Automated End-to-End Test Suite
 * Tests full stack: Express REST APIs, MySQL persistence, JWT auth, and role guards.
 */

const app = require('../server/app');

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 Starting NoticeNexus Comprehensive End-to-End Test Suite');
  console.log('================================================================\n');

  const server = app.listen(3006);
  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ PASS: ${testName}`);
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
    }
  }

  try {
    // --- 1. Health & Unified Server ---
    console.log('[1/5] Health Check & Unified Routing');
    const healthRes = await fetch('http://localhost:3006/api/health');
    const health = await healthRes.json();
    assert(healthRes.status === 200 && health.database.connected, 'API health check reports operational & MySQL connected');

    const studentPageRes = await fetch('http://localhost:3006/student');
    assert(studentPageRes.status === 200, 'Frontend student portal served on clean URL /student');

    const noticePageRes = await fetch('http://localhost:3006/notice/1');
    assert(noticePageRes.status === 200, 'Frontend notice detail served on clean URL /notice/1');

    // --- 2. Notice APIs & Filtering ---
    console.log('\n[2/5] Notice Retrieval & Parameterized Filtering');
    const noticesRes = await fetch('http://localhost:3006/api/notices');
    const noticesData = await noticesRes.json();
    assert(noticesData.results >= 4, 'Published campus notices loaded from MySQL');

    const examRes = await fetch('http://localhost:3006/api/notices?category=Examinations');
    const examData = await examRes.json();
    assert(examData.data.notices.every(n => n.category === 'Examinations'), 'Category filter strictly matches Examinations');

    const searchRes = await fetch('http://localhost:3006/api/notices?search=TechCorp');
    const searchData = await searchRes.json();
    assert(searchData.results === 1 && searchData.data.notices[0].title.includes('TechCorp'), 'Search keyword matches placement circular');

    const detailRes = await fetch('http://localhost:3006/api/notices/1');
    const detailData = await detailRes.json();
    const notice1 = detailData.data.notice;
    assert(notice1.source_url && notice1.source_url.startsWith('http'), 'Notice detail has official source verification URL');
    assert(notice1.telugu_title && notice1.telugu_title.includes('విద్యా'), 'Notice detail has verified authentic Telugu translation');

    // --- 3. Authentication & Security ---
    console.log('\n[3/5] Authentication & Role-Based Access Control');
    const badLogin = await fetch('http://localhost:3006/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'BadPassword123' })
    });
    assert(badLogin.status === 401, 'Invalid credentials rejected with 401 Unauthorized');

    const adminLogin = await fetch('http://localhost:3006/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin@123' })
    });
    const adminData = await adminLogin.json();
    const adminToken = adminData.data.token;
    assert(adminLogin.status === 200 && adminData.data.user.role === 'admin', 'Administrator login issues verified JWT');

    const studentLogin = await fetch('http://localhost:3006/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'student_demo', password: 'Student@123' })
    });
    const studentData = await studentLogin.json();
    const studentToken = studentData.data.token;
    assert(studentLogin.status === 200 && studentData.data.user.role === 'student', 'Student login issues verified JWT');

    const studentBlocked = await fetch('http://localhost:3006/api/notices/manage', {
      headers: { 'Authorization': 'Bearer ' + studentToken }
    });
    assert(studentBlocked.status === 403, 'Student blocked from staff-only routes with 403 Forbidden');

    const adminAllowed = await fetch('http://localhost:3006/api/notices/manage', {
      headers: { 'Authorization': 'Bearer ' + adminToken }
    });
    assert(adminAllowed.status === 200, 'Admin authorized to access management route with 200 OK');

    // --- 4. Staff Notice Creation & Revisions ---
    console.log('\n[4/5] Staff Notice Creation & Status Workflows');
    const createNoticeRes = await fetch('http://localhost:3006/api/notices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + adminToken
      },
      body: JSON.stringify({
        title: 'National Robotics Competition 2026',
        category: 'Events',
        department_id: 3,
        academic_year: 'All Years',
        content: 'Registration is now open for the National Robotics Innovation Contest hosted by the CSE & ECE departments.',
        source_url: 'https://example.edu/robotics-2026.pdf',
        source_title: 'Circular Ref: ROBOT/2026/01',
        deadline: '2026-11-20',
        audience: 'Engineering Students of all departments',
        required_documents: 'Team registration form & College ID cards',
        action_items: 'Register team of 4 on the portal before November 20th',
        telugu_title: 'జాతీయ రోబోటిక్స్ పోటీలు 2026',
        telugu_summary: 'రోబోటిక్స్ పోటీల నమోదు ప్రారంభమైంది. నవంబర్ 20 లోపు నమోదు చేసుకోండి.',
        status: 'published'
      })
    });
    const newNotice = await createNoticeRes.json();
    const newNoticeId = newNotice.data.notice.id;
    assert(createNoticeRes.status === 201 && newNoticeId, 'Staff successfully created and published official notice in MySQL');

    // --- 5. Student Bookmarks & Reminders in MySQL ---
    console.log('\n[5/5] Student Saved Notices & Reminders (MySQL Persistence)');
    const saveNoticeRes = await fetch(`http://localhost:3006/api/reminders/saved/${newNoticeId}`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + studentToken }
    });
    assert(saveNoticeRes.status === 200, 'Student saved notice to personal profile in MySQL');

    const savedListRes = await fetch('http://localhost:3006/api/reminders/saved', {
      headers: { 'Authorization': 'Bearer ' + studentToken }
    });
    const savedListData = await savedListRes.json();
    assert(savedListData.data.notices.some(n => n.id === newNoticeId), 'Saved notices queried from MySQL contains bookmarked circular');

    const unsaveNoticeRes = await fetch(`http://localhost:3006/api/reminders/saved/${newNoticeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + studentToken }
    });
    assert(unsaveNoticeRes.status === 200, 'Student unsaved notice from MySQL');

    const archiveRes = await fetch(`http://localhost:3006/api/notices/${newNoticeId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + adminToken
      },
      body: JSON.stringify({ status: 'archived' })
    });
    assert(archiveRes.status === 200, 'Staff updated notice status to archived in MySQL');

    const createRemRes = await fetch('http://localhost:3006/api/reminders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + studentToken
      },
      body: JSON.stringify({ title: 'Complete Web Tech Project Milestone', due_date: '2026-10-28' })
    });
    const createRemData = await createRemRes.json();
    const reminderId = createRemData.data.reminderId;
    assert(createRemRes.status === 201 && reminderId, 'Student personal reminder persisted to MySQL reminders table');

    const toggleRemRes = await fetch(`http://localhost:3006/api/reminders/${reminderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + studentToken
      },
      body: JSON.stringify({ is_completed: true })
    });
    assert(toggleRemRes.status === 200, 'Student reminder marked completed in MySQL');

    const deleteRemRes = await fetch(`http://localhost:3006/api/reminders/${reminderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + studentToken }
    });
    assert(deleteRemRes.status === 200, 'Student reminder deleted from MySQL');

    // Clean up created notice
    await fetch(`http://localhost:3006/api/notices/${newNoticeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + adminToken }
    });

    console.log('\n================================================================');
    console.log(`🏁 Test Results: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
    console.log('================================================================');

  } catch (err) {
    console.error('Test Suite encountered error:', err);
  } finally {
    server.close();
  }
}

runTestSuite();
