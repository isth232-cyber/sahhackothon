const http = require('http');

const BASE = 'http://localhost:8082';

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 8082,
      path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function seed() {
  console.log('\n🌱 Starting SahAi Demo Data Seeder...\n');

  // 1. Login as teacher
  const tLogin = await req('POST', '/api/auth/login', { email: 'siva1@gmail.com', password: 'siva123' });
  const T = tLogin.data.token;
  const teacherId = tLogin.data.userId;
  console.log(`✅ Teacher logged in: ${tLogin.data.fullName}`);

  // 2. Create 2 more classrooms
  const c2 = await req('POST', '/api/classrooms', { name: 'Mathematics Grade 9', subject: 'Math', grade: '9', description: 'Advanced math' }, T);
  const c3 = await req('POST', '/api/classrooms', { name: 'Hindi Literature', subject: 'Hindi', grade: '8', description: 'Hindi class' }, T);
  console.log(`✅ Created classrooms: ${c2.data?.name}, ${c3.data?.name}`);

  // 3. Get classroom 1 (already exists: Science Grade 8)
  const classrooms = await req('GET', '/api/classrooms/my-classrooms', null, T);
  const c1 = classrooms.data.find(c => c.id === 1);
  const inviteCode = c1.inviteCode;
  console.log(`✅ Using classroom: ${c1.name} (invite: ${inviteCode})`);

  // 4. Register/login 5 students
  const students = [
    { fullName: 'Priya Kumar',   email: 'priya@test.com',   password: 'test123', languagePref: 'English' },
    { fullName: 'Rahul Singh',   email: 'rahul@test.com',   password: 'test123', languagePref: 'Hindi'   },
    { fullName: 'Ananya Sharma', email: 'ananya@test.com',  password: 'test123', languagePref: 'English' },
    { fullName: 'Arjun Patel',   email: 'arjun@test.com',   password: 'test123', languagePref: 'English' },
    { fullName: 'Kavya Reddy',   email: 'kavya@test.com',   password: 'test123', languagePref: 'Tamil'   },
  ];

  const studentTokens = [];
  const studentIds = [];
  for (const s of students) {
    let res = await req('POST', '/api/auth/login', { email: s.email, password: s.password });
    if (!res.success) {
      res = await req('POST', '/api/auth/register', { ...s, role: 'STUDENT' });
      // re-login to get fresh token
      res = await req('POST', '/api/auth/login', { email: s.email, password: s.password });
    }
    studentTokens.push(res.data.token);
    studentIds.push(res.data.userId);
    console.log(`✅ Student ready: ${res.data.fullName} (ID: ${res.data.userId})`);
  }

  // 5. Enroll all students in classroom 1 (fresh login each)
  for (let i = 0; i < students.length; i++) {
    const freshLogin = await req('POST', '/api/auth/login', { email: students[i].email, password: students[i].password });
    const freshToken = freshLogin.data.token;
    studentTokens[i] = freshToken;
    const join = await req('POST', `/api/classrooms/join?inviteCode=${inviteCode}`, null, freshToken);
    console.log(`✅ ${students[i].fullName} joined classroom: ${join.message}`);
  }

  // 6. Create lessons
  const lessons = [
    { title: 'Introduction to Physics', content: "Newton's laws of motion explain how objects move. The first law states that an object at rest stays at rest unless acted upon by an external force.", summary: 'Basic physics concepts', classroomId: 1, isPublished: true },
    { title: 'Chemical Reactions',      content: 'Types of chemical reactions include synthesis, decomposition, single replacement, double replacement, and combustion reactions.', summary: 'Chemistry basics', classroomId: 1, isPublished: true },
    { title: 'Cell Biology',            content: 'Cells are the basic units of life. Plant cells have cell walls and chloroplasts. Animal cells have centrioles and lysosomes.', summary: 'Biology fundamentals', classroomId: 1, isPublished: true },
    { title: 'Earth and Space',         content: 'The solar system consists of the Sun and eight planets. Earth orbits the Sun in approximately 365.25 days.', summary: 'Solar system basics', classroomId: 1, isPublished: false },
  ];
  for (const l of lessons) {
    await req('POST', '/api/lessons', l, T);
  }
  console.log(`✅ Created ${lessons.length} lessons`);

  // 7. Create and publish quiz
  const quiz = await req('POST', '/api/quizzes', {
    title: 'Physics Quiz 1', description: 'Test your basic physics knowledge',
    classroomId: 1, durationMinutes: 30,
    questions: [
      { questionText: "What is Newton's first law?", optionA: 'Force equals mass times acceleration', optionB: 'An object at rest stays at rest', optionC: 'Every action has a reaction', optionD: 'Energy is conserved', correctOption: 'optionB', points: 10, explanation: 'The law of inertia' },
      { questionText: 'What is the SI unit of force?', optionA: 'Joule', optionB: 'Watt', optionC: 'Newton', optionD: 'Pascal', correctOption: 'optionC', points: 10, explanation: 'Named after Isaac Newton' },
      { questionText: 'What is the speed of light?', optionA: '3x10^6 m/s', optionB: '3x10^8 m/s', optionC: '3x10^10 m/s', optionD: '3x10^4 m/s', correctOption: 'optionB', points: 10, explanation: 'Approximately 3×10^8 m/s in vacuum' },
    ],
  }, T);
  const quizId = quiz.data?.id;
  await req('PUT', `/api/quizzes/${quizId}/publish`, null, T);
  console.log(`✅ Created and published quiz: ${quiz.data?.title} (ID: ${quizId})`);

  // 8. Mark attendance for last 3 days
  const today = new Date();
  for (let d = 2; d >= 0; d--) {
    const dt = new Date(today); dt.setDate(today.getDate() - d);
    const dateStr = dt.toISOString().split('T')[0];
    const statuses = ['PRESENT', 'PRESENT', 'ABSENT', 'LATE', 'PRESENT'];
    const records = studentIds.map((id, i) => ({ studentId: id, status: d === 1 && i === 3 ? 'ABSENT' : statuses[i], remarks: '' }));
    await req('POST', '/api/attendance/mark', { classroomId: 1, date: dateStr, records }, T);
    console.log(`✅ Attendance marked for ${dateStr}`);
  }

  // 9. Track participation events
  const events = [
    { studentId: studentIds[0], type: 'QUESTION_ASKED',  desc: 'Asked about Newton laws' },
    { studentId: studentIds[0], type: 'LESSON_VIEW',     desc: 'Viewed Introduction to Physics' },
    { studentId: studentIds[0], type: 'QUIZ_ATTEMPT',    desc: 'Completed Physics Quiz 1' },
    { studentId: studentIds[1], type: 'QUESTION_ASKED',  desc: 'Asked about chemical bonds' },
    { studentId: studentIds[1], type: 'LESSON_VIEW',     desc: 'Viewed Chemical Reactions' },
    { studentId: studentIds[2], type: 'LESSON_VIEW',     desc: 'Viewed Cell Biology' },
    { studentId: studentIds[2], type: 'AI_INTERACTION',  desc: 'Used AI to simplify content' },
    { studentId: studentIds[2], type: 'QUIZ_ATTEMPT',    desc: 'Attempted quiz' },
    { studentId: studentIds[3], type: 'LESSON_VIEW',     desc: 'Viewed Earth and Space' },
    { studentId: studentIds[4], type: 'QUESTION_ASKED',  desc: 'Asked about solar system' },
    { studentId: studentIds[4], type: 'TRANSLATION',     desc: 'Translated lesson to Tamil' },
  ];
  for (const e of events) {
    await req('POST', `/api/participation/track?studentId=${e.studentId}&classroomId=1&eventType=${e.type}&description=${encodeURIComponent(e.desc)}`, null, T);
  }
  console.log(`✅ Tracked ${events.length} participation events`);

  // 10. Students attempt quiz — fetch question IDs first
  const quizDetail = await req('GET', `/api/quizzes/${quizId}`, null, T);
  const qs = quizDetail.data?.questions || [];
  const attemptAnswers = {};
  if (qs[0]) attemptAnswers[qs[0].id] = 'An object at rest stays at rest';
  if (qs[1]) attemptAnswers[qs[1].id] = 'Newton';
  if (qs[2]) attemptAnswers[qs[2].id] = '3x10^8 m/s';
  for (let i = 0; i < 3; i++) {
    const freshLogin = await req('POST', '/api/auth/login', { email: students[i].email, password: students[i].password });
    const freshToken = freshLogin.data.token;
    studentTokens[i] = freshToken;
    const attemptRes = await req('POST', '/api/quizzes/attempt', { quizId, answers: attemptAnswers }, freshToken);
    console.log(`✅ ${students[i].fullName} attempted quiz — score: ${attemptRes.data?.score}/${attemptRes.data?.totalMarks}`);
  }

  // 11. Generate AI recommendations
  const recs = await req('POST', `/api/ai/recommendations/generate/1`, null, T);
  console.log(`✅ Generated ${recs.data?.length || 0} AI recommendations`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Teacher:  siva1@gmail.com / siva123');
  console.log('Students: priya@test.com, rahul@test.com,');
  console.log('          ananya@test.com, arjun@test.com,');
  console.log('          kavya@test.com  (all: test123)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

seed().catch(console.error);
