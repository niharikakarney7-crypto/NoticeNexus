-- ============================================================================
-- NoticeNexus — Development Seed Data
-- Database: noticenexus
-- All development notices have `is_development_sample = 1` for clear identification.
-- Passwords for sample accounts are:
--   Admin:   Admin@123
--   Staff:   Staff@123
--   Student: Student@123
-- ============================================================================

USE `noticenexus`;

-- 1. Insert Departments
INSERT INTO `departments` (`id`, `code`, `name`, `contact_email`) VALUES
  (1, 'EXAM_CELL', 'Examination Cell', 'exam.cell@college.edu'),
  (2, 'SCHOLARSHIP', 'Scholarship Division', 'scholarships@college.edu'),
  (3, 'CSE', 'Computer Science & Engineering', 'hod.cse@college.edu'),
  (4, 'ECE', 'Electronics & Communication', 'hod.ece@college.edu'),
  (5, 'TPO', 'Training & Placement Cell', 'placements@college.edu'),
  (6, 'ADMIN', 'Dean of Student Affairs', 'dean.students@college.edu')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 2. Insert Users (Bcrypt hashes generated with salt rounds 10)
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `department_id`, `academic_year`) VALUES
  -- Admin Account: Admin@123
  (1, 'admin', 'admin@noticenexus.edu', '$2b$10$yRZ9grv0jTYxSyEimaILc.8BzyU8kGiHASxLEahJmcHV3e.WdxYhC', 'Campus Chief Administrator', 'admin', 6, NULL),
  -- Staff Exam Cell: Staff@123
  (2, 'staff_exam', 'exam.officer@noticenexus.edu', '$2b$10$yRZ9grv0jTYxSyEimaILc.wKhcZ1XTPww4/sz5q.4jHJm4YTX0x5.', 'Dr. R. K. Sharma (Exam Controller)', 'staff', 1, NULL),
  -- Staff CSE: Staff@123
  (3, 'staff_cse', 'cse.coordinator@noticenexus.edu', '$2b$10$yRZ9grv0jTYxSyEimaILc.wKhcZ1XTPww4/sz5q.4jHJm4YTX0x5.', 'Prof. Ananya Rao (Project Coordinator)', 'staff', 3, NULL),
  -- Student Account: Student@123
  (4, 'student_demo', 'student@noticenexus.edu', '$2b$10$yRZ9grv0jTYxSyEimaILc.5uvyQzcKxC/tp03i/L/SJHkBLXgHyqm', 'Devasmitha Student', 'student', 3, '4th Year')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- 3. Insert Verified Sample Notices (all flagged is_development_sample = 1)
INSERT INTO `notices` (
  `id`, `title`, `category`, `department_id`, `academic_year`, `content`,
  `source_url`, `source_title`, `deadline`, `audience`, `required_documents`,
  `action_items`, `telugu_title`, `telugu_summary`, `status`, `author_id`,
  `published_at`, `is_development_sample`
) VALUES
  (
    1,
    'Odd Semester End-Examinations Schedule (Regular & Supplementary)',
    'Examinations',
    1,
    'All Years',
    'The Examination Cell hereby notifies that the Odd Semester End-Examinations (Regular & Supplementary) for B.Tech, M.Tech, and MBA programmes will commence from November 10th, 2026.\n\nStudents are instructed to register and pay the prescribed examination fees through the online ERP portal. Hall tickets will be downloadable from October 20th onwards upon clearing any outstanding department dues.\n\nStrict adherence to the schedule is mandatory. Late fee penalties will apply after October 25th, 2026.',
    'https://example.edu/exam-cell/notifications/circular-842.pdf',
    'Examination Cell Circular Ref: EC/2026/842',
    '2026-10-25',
    'B.Tech & M.Tech Students (All Branches)',
    'Fee payment receipt, College ID card, Previous semester marks memo',
    'Download schedule PDF, verify timetable, and pay fee online prior to October 25th deadline.',
    'విద్యా సంవత్సరం చివరి పరీక్షల సమయ పట్టిక విడుదల (రెగ్యులర్ & సప్లిమెంటరీ)',
    'బి.టెక్, ఎం.టెక్ విద్యార్థుల చివరి పరీక్షలు నవంబర్ 10 నుండి ప్రారంభమవుతాయి. పరీక్ష రుసుము చెల్లించడానికి చివరి తేదీ అక్టోబర్ 25, 2026. హాల్ టికెట్లు అక్టోబర్ 20 నుండి అందుబాటులో ఉంటాయి.',
    'published',
    2,
    '2026-10-08 10:00:00',
    1
  ),
  (
    2,
    'Post-Matric National Scholarship Application Window Open',
    'Scholarships',
    2,
    'All Years',
    'The Scholarship Division invites online applications from eligible students belonging to SC/ST/OBC/Minority/EWS communities for the academic year 2026–2027 under the Post-Matric National Scholarship Scheme.\n\nStudents must register on the National Scholarship Portal (NSP) and upload all necessary documents. Following online submission, a signed physical copy along with original documents must be submitted to Administrative Block Room 102 for institutional verification.',
    'https://scholarships.gov.in/portal/circular-nsp-2026.pdf',
    'Ministry Notification Ref: SCH/NSP/2026',
    '2026-11-15',
    'All eligible students with family annual income below 2.5 Lakhs',
    'Income certificate, Caste certificate, Bank passbook, Aadhaar card, Bonafide certificate',
    'Apply on NSP portal, print application, and submit physical documents to Room 102.',
    'పోస్ట్-మెట్రిక్ జాతీయ స్కాలర్‌షిప్ దరఖాస్తులు ప్రారంభం',
    'అర్హులైన విద్యార్థులు స్కాలర్‌షిప్ పోర్టల్‌లో దరఖాస్తు చేసుకోవచ్చు. దరఖాస్తుల ధృవీకరణ కోసం పరిపాలనా విభాగం గది 102 ను సంప్రదించండి. చివరి తేదీ నవంబర్ 15.',
    'published',
    1,
    '2026-10-05 09:30:00',
    1
  ),
  (
    3,
    'Major Project Synopsis Submission Deadline for Final Year CSE Students',
    'Academics',
    3,
    '4th Year',
    'Final Year B.Tech Computer Science and Engineering students are hereby informed that the submission window for Major Project Synopsis is now open.\n\nTeams of 3 to 4 students must choose a domain (AI/ML, Cloud Computing, Cyber Security, Web Systems), finalize problem statement with their allotted guide, and submit the 3-page IEEE format synopsis.',
    'https://example.edu/cse/projects/synopsis-guidelines.pdf',
    'Department Circular Ref: CSE/2026/PROJ-44',
    '2026-10-18',
    'Final Year B.Tech CSE Students',
    'IEEE format synopsis (max 3 pages), Guide endorsement form',
    'Finalize team of 3-4, obtain guide signature, and upload PDF to department portal before Oct 18.',
    'ఫైనల్ ఇయర్ సీఎస్ఈ ప్రాజెక్ట్ సినాప్సిస్ సమర్పణ గడువు',
    'చివరి సంవత్సరం కంప్యూటర్ సైన్స్ విద్యార్థులు తమ ప్రాజెక్ట్ సినాప్సిస్‌ను అక్టోబర్ 18 లోపు సమర్పించాలి.',
    'published',
    3,
    '2026-10-09 11:15:00',
    1
  ),
  (
    4,
    'Campus Recruitment Drive: TechCorp Solutions On-Campus Selection',
    'Placements',
    5,
    '4th Year',
    'TechCorp Solutions will visit our campus on October 22nd, 2026 for recruitment of Associate Software Engineers.\n\nEligibility: B.Tech (CSE, ECE, IT) with min 65% aggregate or 7.0 CGPA, no active backlogs. Selection rounds include Online Coding Test, Technical Interview, and HR Round.',
    'https://example.edu/tpo/techcorp-jd.pdf',
    'TPO Circular 2026/T-12',
    '2026-10-15',
    'B.Tech 4th Year (CSE, ECE, IT)',
    '2 copies of resume, College ID card, Formal attire',
    'Register on TPO portal link before October 15, 5:00 PM.',
    'టెక్‌కార్ప్ సొల్యూషన్స్ క్యాంపస్ ప్లేస్‌మెంట్ డ్రైవ్',
    'నాలుగో సంవత్సరం విద్యార్థులకు టెక్‌కార్ప్ సాఫ్ట్‌వేర్ ఉద్యోగాల కోసం రిక్రూట్‌మెంట్. అక్టోబర్ 15 లోపు రిజిస్ట్రేషన్ చేసుకోండి.',
    'published',
    1,
    '2026-10-07 14:00:00',
    1
  )
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 4. Insert Initial Student Reminders (Sample Student #4)
INSERT INTO `reminders` (`id`, `user_id`, `notice_id`, `title`, `due_date`, `is_completed`) VALUES
  (1, 4, 3, 'Submit CSE project synopsis with guide endorsement', '2026-10-18', 0),
  (2, 4, 1, 'Pay semester examination fee on ERP portal', '2026-10-25', 0),
  (3, 4, 2, 'Collect Bonafide certificate for scholarship', '2026-11-05', 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 5. Insert Initial Saved Notices (Sample Student #4)
INSERT INTO `saved_notices` (`user_id`, `notice_id`) VALUES
  (4, 1),
  (4, 3)
ON DUPLICATE KEY UPDATE `saved_at` = CURRENT_TIMESTAMP;
