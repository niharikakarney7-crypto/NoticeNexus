/**
 * NoticeNexus — Notice Detail View & Notice-to-Action Assistant
 * Handles URL parameter parsing, rendering official notice details,
 * source verification links, Telugu explanations, and SpeechSynthesis (TTS).
 */

const SAMPLE_NOTICES = [
  {
    id: 1,
    title: "Odd Semester End-Examinations Schedule (Regular & Supplementary)",
    category: "Examinations",
    department: "Examination Cell",
    academic_year: "All Years",
    published_at: "2026-10-08",
    updated_at: "2026-10-09",
    deadline: "2026-10-25",
    content: "The Examination Cell hereby notifies that the Odd Semester End-Examinations (Regular & Supplementary) for B.Tech, M.Tech, and MBA programmes will commence from November 10th, 2026.\n\nStudents are instructed to register and pay the prescribed examination fees through the online ERP portal. Hall tickets will be downloadable from October 20th onwards upon clearing any outstanding department dues.\n\nStrict adherence to the schedule is mandatory. Late fee penalties will apply after October 25th, 2026.",
    source_url: "https://example.edu/exam-cell/notifications/circular-842.pdf",
    source_title: "Examination Cell Circular Ref: EC/2026/842",
    audience: "B.Tech & M.Tech Students (All Branches)",
    required_documents: "Fee payment receipt, College ID card, Previous semester marks memo",
    action_items: "Download schedule PDF, verify timetable, and pay fee online prior to October 25th deadline.",
    telugu_title: "విద్యా సంవత్సరం చివరి పరీక్షల సమయ పట్టిక విడుదల (రెగ్యులర్ & సప్లిమెంటరీ)",
    telugu_summary: "బి.టెక్, ఎం.టెక్ విద్యార్థుల చివరి పరీక్షలు నవంబర్ 10 నుండి ప్రారంభమవుతాయి. పరీక్ష రుసుము చెల్లించడానికి చివరి తేదీ అక్టోబర్ 25, 2026. హాల్ టికెట్లు అక్టోబర్ 20 నుండి అందుబాటులో ఉంటాయి."
  },
  {
    id: 2,
    title: "Post-Matric National Scholarship Application Window Open",
    category: "Scholarships",
    department: "Scholarship Division",
    academic_year: "All Years",
    published_at: "2026-10-05",
    updated_at: "2026-10-06",
    deadline: "2026-11-15",
    content: "The Scholarship Division invites online applications from eligible students belonging to SC/ST/OBC/Minority/EWS communities for the academic year 2026–2027 under the Post-Matric National Scholarship Scheme.\n\nStudents must register on the National Scholarship Portal (NSP) and upload all necessary documents. Following online submission, a signed physical copy along with original documents must be submitted to Administrative Block Room 102 for institutional verification.",
    source_url: "https://scholarships.gov.in/portal/circular-nsp-2026.pdf",
    source_title: "Ministry Notification Ref: SCH/NSP/2026",
    audience: "All eligible students with family annual income below 2.5 Lakhs",
    required_documents: "Income certificate, Caste certificate, Bank passbook, Aadhaar card, Bonafide certificate",
    action_items: "Apply on NSP portal, print application, and submit physical documents to Room 102.",
    telugu_title: "పోస్ట్-మెట్రిక్ జాతీయ స్కాలర్‌షిప్ దరఖాస్తులు ప్రారంభం",
    telugu_summary: "అర్హులైన విద్యార్థులు స్కాలర్‌షిప్ పోర్టల్‌లో దరఖాస్తు చేసుకోవచ్చు. దరఖాస్తుల ధృవీకరణ కోసం పరిపాలనా విభాగం గది 102 ను సంప్రదించండి. చివరి తేదీ నవంబర్ 15."
  },
  {
    id: 3,
    title: "Major Project Synopsis Submission Deadline for Final Year CSE Students",
    category: "Academics",
    department: "Computer Science & Engineering",
    academic_year: "4th Year",
    published_at: "2026-10-09",
    updated_at: "2026-10-09",
    deadline: "2026-10-18",
    content: "Final Year B.Tech Computer Science and Engineering students are hereby informed that the submission window for Major Project Synopsis is now open.\n\nTeams of 3 to 4 students must choose a domain (AI/ML, Cloud Computing, Cyber Security, Web Systems), finalize problem statement with their allotted guide, and submit the 3-page IEEE format synopsis.",
    source_url: "https://example.edu/cse/projects/synopsis-guidelines.pdf",
    source_title: "Department Circular Ref: CSE/2026/PROJ-44",
    audience: "Final Year B.Tech CSE Students",
    required_documents: "IEEE format synopsis (max 3 pages), Guide endorsement form",
    action_items: "Finalize team of 3-4, obtain guide signature, and upload PDF to department portal before Oct 18.",
    telugu_title: "ఫైనల్ ఇయర్ సీఎస్ఈ ప్రాజెక్ట్ సినాప్సిస్ సమర్పణ గడువు",
    telugu_summary: "చివరి సంవత్సరం కంప్యూటర్ సైన్స్ విద్యార్థులు తమ ప్రాజెక్ట్ సినాప్సిస్‌ను అక్టోబర్ 18 లోపు సమర్పించాలి."
  },
  {
    id: 4,
    title: "Campus Recruitment Drive: TechCorp Solutions On-Campus Selection",
    category: "Placements",
    department: "Training & Placement",
    academic_year: "4th Year",
    published_at: "2026-10-07",
    updated_at: "2026-10-07",
    deadline: "2026-10-15",
    content: "TechCorp Solutions will visit our campus on October 22nd, 2026 for recruitment of Associate Software Engineers.\n\nEligibility: B.Tech (CSE, ECE, IT) with min 65% aggregate or 7.0 CGPA, no active backlogs. Selection rounds include Online Coding Test, Technical Interview, and HR Round.",
    source_url: "https://example.edu/tpo/techcorp-jd.pdf",
    source_title: "TPO Circular 2026/T-12",
    audience: "B.Tech 4th Year (CSE, ECE, IT)",
    required_documents: "2 copies of resume, College ID card, Formal attire",
    action_items: "Register on TPO portal link before October 15, 5:00 PM.",
    telugu_title: "టెక్‌కార్ప్ సొల్యూషన్స్ క్యాంపస్ ప్లేస్‌మెంట్ డ్రైవ్",
    telugu_summary: "నాలుగో సంవత్సరం విద్యార్థులకు టెక్‌కార్ప్ సాఫ్ట్‌వేర్ ఉద్యోగాల కోసం రిక్రూట్‌మెంట్. అక్టోబర్ 15 లోపు రిజిస్ట్రేషన్ చేసుకోండి."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const noticeId = parseInt(params.get("id"), 10) || 1;

  const notice = SAMPLE_NOTICES.find(n => n.id === noticeId) || SAMPLE_NOTICES[0];
  renderNoticeDetails(notice);
});

function renderNoticeDetails(notice) {
  // Document title
  document.title = `${notice.title} — NoticeNexus`;

  // Badges & Meta
  document.getElementById("detail-category").textContent = notice.category;
  document.getElementById("detail-year").textContent = notice.academic_year || "All Years";
  document.getElementById("detail-title").textContent = notice.title;
  document.getElementById("detail-department").textContent = notice.department;
  document.getElementById("detail-published-date").textContent = formatDate(notice.published_at);
  document.getElementById("detail-updated-date").textContent = formatDate(notice.updated_at || notice.published_at);

  // Notice-to-Action Breakdown (Strict Safeguard: "Not specified in this notice" if missing)
  document.getElementById("action-audience").textContent = notice.audience || "Not specified in this notice";
  document.getElementById("action-deadline").textContent = notice.deadline ? formatDate(notice.deadline) : "Not specified in this notice";
  document.getElementById("action-documents").textContent = notice.required_documents || "Not specified in this notice";
  document.getElementById("action-steps").textContent = notice.action_items || "Not specified in this notice";

  // Body content
  document.getElementById("detail-body").textContent = notice.content;

  // Source Verification Link
  const sourceTitleEl = document.getElementById("detail-source-title");
  const sourceLinkEl = document.getElementById("detail-source-link");
  if (notice.source_url) {
    sourceTitleEl.textContent = notice.source_title || notice.source_url;
    sourceLinkEl.href = notice.source_url;
  } else {
    sourceTitleEl.textContent = "Institutional Internal Notice (No external URL)";
    sourceLinkEl.style.display = "none";
  }

  // Telugu Accessibility Section
  const teluguContainer = document.getElementById("telugu-container");
  if (notice.telugu_title && notice.telugu_summary) {
    document.getElementById("detail-telugu-title").textContent = notice.telugu_title;
    document.getElementById("detail-telugu-summary").textContent = notice.telugu_summary;
    
    // Telugu TTS button
    const teluguTtsBtn = document.getElementById("telugu-tts-play");
    teluguTtsBtn.onclick = () => {
      speakText(`${notice.telugu_title}. ${notice.telugu_summary}`, 'te-IN');
    };
  } else {
    teluguContainer.style.display = "none";
  }

  // English TTS buttons
  const englishPlayBtn = document.getElementById("detail-tts-play");
  const englishStopBtn = document.getElementById("detail-tts-stop");

  const fullTextToRead = `Official Notice: ${notice.title}. Published by ${notice.department}. ${notice.content}. Action summary: Audience: ${notice.audience || 'Not specified'}. Deadline: ${notice.deadline ? formatDate(notice.deadline) : 'Not specified'}. Required documents: ${notice.required_documents || 'Not specified'}. Next action: ${notice.action_items || 'Not specified'}.`;

  englishPlayBtn.onclick = () => {
    speakText(fullTextToRead, 'en-US', () => {
      englishPlayBtn.style.display = "inline-flex";
      englishStopBtn.style.display = "none";
    });
    englishPlayBtn.style.display = "none";
    englishStopBtn.style.display = "inline-flex";
  };

  englishStopBtn.onclick = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    englishPlayBtn.style.display = "inline-flex";
    englishStopBtn.style.display = "none";
  };
}

function speakText(text, lang = 'en-US', onEndCallback = null) {
  if (!('speechSynthesis' in window)) {
    alert("Speech synthesis is not supported on this browser.");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;

  if (onEndCallback) {
    utterance.onend = onEndCallback;
    utterance.onerror = onEndCallback;
  }

  window.speechSynthesis.speak(utterance);
}

function formatDate(dateString) {
  if (!dateString) return "Not specified";
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
