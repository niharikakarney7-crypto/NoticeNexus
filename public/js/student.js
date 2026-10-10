/**
 * NoticeNexus — Student Dashboard Interactive Client
 * Handles real-time search, category filtering, saving notices, reminders, and Text-to-Speech.
 */

// Initial development sample dataset for Phase 2 visual verification
// (In Phase 5, this will be dynamically loaded via fetch('/api/notices') from MySQL)
const SAMPLE_NOTICES = [
  {
    id: 1,
    title: "Odd Semester End-Examinations Schedule (Regular & Supplementary)",
    category: "Examinations",
    department: "Examination Cell",
    academic_year: "All Years",
    published_at: "2026-10-08",
    deadline: "2026-10-25",
    content_snippet: "Detailed timetable for the upcoming semester end examinations has been released. Hall tickets will be issued starting October 20th. Fee payment deadline is strictly October 25th.",
    source_url: "https://example.edu/exam-cell/notifications/circular-842.pdf",
    source_title: "Circular Ref: EC/2026/842",
    audience: "B.Tech & M.Tech Students (All Branches)",
    required_documents: "Fee receipt, College ID card, Previous marks memo",
    action_items: "Download schedule PDF, verify exam dates, and pay exam fee before deadline.",
    telugu_title: "విద్యా సంవత్సరం చివరి పరీక్షల సమయ పట్టిక విడుదల (రెగ్యులర్ & సప్లిమెంటరీ)",
    telugu_summary: "పరీక్షల టైమ్‌టేబుల్ విడుదల చేయబడింది. పరీక్ష రుసుము చెల్లించడానికి చివరి తేదీ అక్టోబర్ 25."
  },
  {
    id: 2,
    title: "Post-Matric National Scholarship Application Window Open",
    category: "Scholarships",
    department: "Scholarship Division",
    academic_year: "All Years",
    published_at: "2026-10-05",
    deadline: "2026-11-15",
    content_snippet: "Eligible students belonging to SC/ST/OBC/EWS categories can submit their fresh and renewal scholarship applications through the National Scholarship Portal (NSP). Mandatory physical verification at Administrative Block Room 102.",
    source_url: "https://scholarships.gov.in/portal/circular-nsp-2026.pdf",
    source_title: "Ministry Notification Ref: SCH/NSP/2026",
    audience: "All eligible students (Income < 2.5 LPA)",
    required_documents: "Income certificate, Caste certificate, Bank passbook, Aadhaar card, Bonafide certificate",
    action_items: "Apply on NSP portal, print application, and submit physical documents to Room 102.",
    telugu_title: "పోస్ట్-మెట్రిక్ జాతీయ స్కాలర్‌షిప్ దరఖాస్తులు ప్రారంభం",
    telugu_summary: "అర్హులైన విద్యార్థులు స్కాలర్‌షిప్ పోర్టల్‌లో దరఖాస్తు చేసుకోవచ్చు. దరఖాస్తుల ధృవీకరణ కోసం గది 102 ను సంప్రదించండి."
  },
  {
    id: 3,
    title: "Major Project Synopsis Submission Deadline for Final Year CSE Students",
    category: "Academics",
    department: "Computer Science & Engineering",
    academic_year: "4th Year",
    published_at: "2026-10-09",
    deadline: "2026-10-18",
    content_snippet: "All final year B.Tech CSE teams must submit their approved project proposal synopsis duly signed by their respective project guides. Submissions to be uploaded on the CSE Department portal.",
    source_url: "https://example.edu/cse/projects/synopsis-guidelines.pdf",
    source_title: "CSE Department Circular #44",
    audience: "Final Year B.Tech CSE Students",
    required_documents: "IEEE format synopsis (max 3 pages), Guide endorsement form",
    action_items: "Finalize team of 3-4, get guide approval signature, and upload PDF before Oct 18.",
    telugu_title: "ఫైనల్ ఇయర్ సీఎస్ఈ ప్రాజెక్ట్ సినాప్సిస్ సమర్పణ గడువు",
    telugu_summary: "చివరి సంవత్సరం విద్యార్థులు తమ ప్రాజెక్ట్ గైడ్ సంతకంతో సినాప్సిస్ అక్టోబర్ 18 లోపు సమర్పించాలి."
  },
  {
    id: 4,
    title: "Campus Recruitment Drive: TechCorp Solutions On-Campus Selection",
    category: "Placements",
    department: "Training & Placement",
    academic_year: "4th Year",
    published_at: "2026-10-07",
    deadline: "2026-10-15",
    content_snippet: "TechCorp Solutions will conduct an on-campus placement drive for Software Engineer roles. Eligibility criteria: Minimum 65% aggregate or 7.0 CGPA with no active backlogs.",
    source_url: "https://example.edu/tpo/techcorp-jd.pdf",
    source_title: "TPO Circular 2026/T-12",
    audience: "B.Tech 4th Year (CSE, ECE, IT)",
    required_documents: "Updated Resume (2 copies), College ID, Formal attire",
    action_items: "Register on TPO portal link before October 15, 5:00 PM.",
    telugu_title: "టెక్‌కార్ప్ సొల్యూషన్స్ క్యాంపస్ ప్లేస్‌మెంట్ డ్రైవ్",
    telugu_summary: "నాలుగో సంవత్సరం విద్యార్థులకు సాఫ్ట్‌వేర్ ఇంజనీర్ ఉద్యోగాల కోసం రిక్రూట్‌మెంట్. అక్టోబర్ 15 లోపు నమోదు చేసుకోండి."
  }
];

// App State
let currentNotices = [...SAMPLE_NOTICES];
let activeCategory = "ALL";
let savedNoticeIds = new Set();
let reminders = [
  { id: 1, text: "Check CSE project synopsis guidelines", completed: false },
  { id: 2, text: "Verify scholarship income certificate validity", completed: true }
];

// DOM Elements
const noticeFeedContainer = document.getElementById("notice-feed-container");
const noticeCountEl = document.getElementById("notice-count");
const searchInput = document.getElementById("search-input");
const categoryPills = document.querySelectorAll(".category-pill");
const filterDepartment = document.getElementById("filter-department");
const filterYear = document.getElementById("filter-year");
const filterSort = document.getElementById("filter-sort");
const resetFiltersBtn = document.getElementById("reset-filters-btn");
const currentDateDisplay = document.getElementById("current-date-display");
const deadlinesListContainer = document.getElementById("deadlines-list-container");
const deadlineBadgeCount = document.getElementById("deadline-badge-count");
const addReminderForm = document.getElementById("add-reminder-form");
const reminderInput = document.getElementById("reminder-input");
const remindersListContainer = document.getElementById("reminders-list-container");
const savedCountEl = document.getElementById("saved-count");
const navSavedBtn = document.getElementById("nav-saved-btn");
const ttsGlobalBar = document.getElementById("tts-global-bar");
const ttsStopBtn = document.getElementById("tts-stop-btn");

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
  // Set current date in banner
  const today = new Date();
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  currentDateDisplay.textContent = today.toLocaleDateString('en-US', options);

  // Load saved notices from localStorage (interface preference only)
  try {
    const cachedSaved = JSON.parse(localStorage.getItem("noticenexus_saved_ids") || "[]");
    savedNoticeIds = new Set(cachedSaved);
  } catch (e) {
    savedNoticeIds = new Set();
  }
  updateSavedCountUI();

  // Render initial components
  renderNotices();
  renderDeadlines();
  renderReminders();

  // Event Listeners
  searchInput.addEventListener("input", applyFilters);
  filterDepartment.addEventListener("change", applyFilters);
  filterYear.addEventListener("change", applyFilters);
  filterSort.addEventListener("change", applyFilters);
  resetFiltersBtn.addEventListener("click", resetFilters);

  categoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
      categoryPills.forEach(p => {
        p.classList.remove("active");
        p.setAttribute("aria-selected", "false");
      });
      pill.classList.add("active");
      pill.setAttribute("aria-selected", "true");
      activeCategory = pill.dataset.category;
      applyFilters();
    });
  });

  // Saved notices toggle filter
  let showingSavedOnly = false;
  navSavedBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showingSavedOnly = !showingSavedOnly;
    if (showingSavedOnly) {
      navSavedBtn.classList.add("active");
      renderNotices(SAMPLE_NOTICES.filter(n => savedNoticeIds.has(n.id)));
    } else {
      navSavedBtn.classList.remove("active");
      applyFilters();
    }
  });

  // Reminders Form
  addReminderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = reminderInput.value.trim();
    if (text) {
      reminders.push({ id: Date.now(), text, completed: false });
      reminderInput.value = "";
      renderReminders();
    }
  });

  // Global TTS Stop
  ttsStopBtn.addEventListener("click", () => {
    window.speechSynthesis.cancel();
    ttsGlobalBar.style.display = "none";
  });
});

/**
 * Filter and Sort logic
 */
function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const dept = filterDepartment.value;
  const year = filterYear.value;
  const sort = filterSort.value;

  let filtered = SAMPLE_NOTICES.filter(notice => {
    // Search query matches title or content
    const matchesQuery = !query || 
      notice.title.toLowerCase().includes(query) ||
      notice.content_snippet.toLowerCase().includes(query) ||
      notice.department.toLowerCase().includes(query);

    // Category matches
    const matchesCategory = activeCategory === "ALL" || notice.category === activeCategory;

    // Department matches
    const matchesDept = !dept || notice.department === dept;

    // Academic Year matches
    const matchesYear = !year || notice.academic_year === year || notice.academic_year === "All Years";

    return matchesQuery && matchesCategory && matchesDept && matchesYear;
  });

  // Sort
  if (sort === "newest") {
    filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  } else if (sort === "deadline") {
    filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  } else if (sort === "title") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  renderNotices(filtered);
}

function resetFilters() {
  searchInput.value = "";
  filterDepartment.value = "";
  filterYear.value = "";
  filterSort.value = "newest";
  activeCategory = "ALL";
  categoryPills.forEach(p => {
    p.classList.remove("active");
    p.setAttribute("aria-selected", "false");
  });
  categoryPills[0].classList.add("active");
  categoryPills[0].setAttribute("aria-selected", "true");
  applyFilters();
}

/**
 * Render Notice Feed Cards
 */
function renderNotices(noticesToRender = SAMPLE_NOTICES) {
  noticeCountEl.textContent = noticesToRender.length;

  if (noticesToRender.length === 0) {
    noticeFeedContainer.innerHTML = `
      <div class="card" style="text-align: center; padding: var(--space-2xl) var(--space-lg);">
        <h3 style="color: var(--color-navy); margin-bottom: var(--space-xs);">No notices found</h3>
        <p style="color: var(--text-muted); margin-bottom: var(--space-md);">
          No official announcements match your active search and filter criteria.
        </p>
        <button class="btn btn-outline-plum btn-sm" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  noticeFeedContainer.innerHTML = noticesToRender.map(notice => {
    const isSaved = savedNoticeIds.has(notice.id);
    const categoryBadgeClass = getCategoryBadgeClass(notice.category);

    return `
      <article class="notice-card" data-notice-id="${notice.id}">
        <!-- Meta Top -->
        <div class="notice-meta-top">
          <div class="notice-badges">
            <span class="badge badge-verified">✓ Official Verified</span>
            <span class="badge ${categoryBadgeClass}">${escapeHtml(notice.category)}</span>
            <span class="badge" style="background:#F1F2F4; color:var(--color-navy);">${escapeHtml(notice.academic_year)}</span>
          </div>
          <div class="notice-date">
            Published: <strong>${formatDate(notice.published_at)}</strong>
          </div>
        </div>

        <!-- Title -->
        <h3 class="notice-title">
          <a href="notice.html?id=${notice.id}">${escapeHtml(notice.title)}</a>
        </h3>

        <!-- Content Snippet -->
        <p class="notice-snippet">${escapeHtml(notice.content_snippet)}</p>

        <!-- Notice-to-Action Mini Assistant Breakdown -->
        <div class="action-assistant">
          <div class="action-assistant-title">
            <span>🎯 Notice-to-Action Summary</span>
          </div>
          <div class="action-grid">
            <div class="action-field">
              <span class="action-label">Target Audience</span>
              <span class="action-value">${escapeHtml(notice.audience || "All Students")}</span>
            </div>
            <div class="action-field">
              <span class="action-label">Submission Deadline</span>
              <span class="action-value" style="color: var(--status-deadline);">
                ${notice.deadline ? formatDate(notice.deadline) : "Not specified in this notice"}
              </span>
            </div>
            <div class="action-field">
              <span class="action-label">Required Documents</span>
              <span class="action-value">${escapeHtml(notice.required_documents || "Not specified in this notice")}</span>
            </div>
            <div class="action-field">
              <span class="action-label">Next Action</span>
              <span class="action-value">${escapeHtml(notice.action_items || "Review official source")}</span>
            </div>
          </div>
        </div>

        <!-- Footer / Action Row -->
        <div class="notice-footer">
          <div class="notice-dept">
            🏛️ ${escapeHtml(notice.department)}
          </div>
          <div class="notice-actions">
            <!-- Text-to-Speech Button -->
            <button 
              type="button" 
              class="btn btn-outline btn-sm tts-listen-btn" 
              onclick="speakNotice(${notice.id})" 
              aria-label="Listen to notice audio"
            >
              🔊 Listen
            </button>

            <!-- Save Bookmark Button -->
            <button 
              type="button" 
              class="btn ${isSaved ? 'btn-secondary' : 'btn-outline'} btn-sm save-notice-btn" 
              onclick="toggleSaveNotice(${notice.id})"
              aria-label="${isSaved ? 'Remove from saved' : 'Save notice'}"
            >
              ${isSaved ? '★ Saved' : '☆ Save'}
            </button>

            <!-- Full Details Link -->
            <a href="notice.html?id=${notice.id}" class="btn btn-primary btn-sm">
              View Full Notice →
            </a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/**
 * Render Deadlines in the Sidebar
 */
function renderDeadlines() {
  const noticesWithDeadlines = SAMPLE_NOTICES
    .filter(n => n.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  deadlineBadgeCount.textContent = noticesWithDeadlines.length;

  if (noticesWithDeadlines.length === 0) {
    deadlinesListContainer.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No upcoming deadlines.</p>`;
    return;
  }

  deadlinesListContainer.innerHTML = noticesWithDeadlines.map(n => {
    const dateObj = new Date(n.deadline);
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const day = dateObj.getDate();

    return `
      <div class="deadline-item">
        <div class="deadline-calendar-box" aria-hidden="true">
          <div class="month">${month}</div>
          <div class="day">${day}</div>
        </div>
        <div class="deadline-content">
          <div class="deadline-title">
            <a href="notice.html?id=${n.id}">${escapeHtml(n.title)}</a>
          </div>
          <div class="deadline-meta">
            Due by ${formatDate(n.deadline)} · ${escapeHtml(n.department)}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * Render Student Reminders in the Sidebar
 */
function renderReminders() {
  if (reminders.length === 0) {
    remindersListContainer.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No reminders set.</p>`;
    return;
  }

  remindersListContainer.innerHTML = reminders.map(r => `
    <div class="reminder-item">
      <input 
        type="checkbox" 
        class="reminder-checkbox" 
        ${r.completed ? 'checked' : ''} 
        onchange="toggleReminder(${r.id})"
        aria-label="Mark reminder as completed"
      >
      <span class="reminder-text ${r.completed ? 'completed' : ''}">
        ${escapeHtml(r.text)}
      </span>
      <button 
        type="button" 
        class="reminder-delete-btn" 
        onclick="deleteReminder(${r.id})"
        aria-label="Delete reminder"
      >
        ✕
      </button>
    </div>
  `).join("");
}

function toggleReminder(id) {
  const item = reminders.find(r => r.id === id);
  if (item) {
    item.completed = !item.completed;
    renderReminders();
  }
}

function deleteReminder(id) {
  reminders = reminders.filter(r => r.id !== id);
  renderReminders();
}

/**
 * Save / Bookmark Notice Handler
 */
function toggleSaveNotice(id) {
  if (savedNoticeIds.has(id)) {
    savedNoticeIds.delete(id);
  } else {
    savedNoticeIds.add(id);
  }
  localStorage.setItem("noticenexus_saved_ids", JSON.stringify([...savedNoticeIds]));
  updateSavedCountUI();
  applyFilters();
}

function updateSavedCountUI() {
  savedCountEl.textContent = savedNoticeIds.size;
}

/**
 * Text-to-Speech (TTS) Browser SpeechSynthesis
 */
function speakNotice(id) {
  const notice = SAMPLE_NOTICES.find(n => n.id === id);
  if (!notice) return;

  if (!('speechSynthesis' in window)) {
    alert("Text-to-speech is not supported in your browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const speechText = `Official Notice: ${notice.title}. Published by ${notice.department}. Details: ${notice.content_snippet}. Notice to action summary: Target audience is ${notice.audience}. Deadline is ${notice.deadline || 'not specified'}. Required documents: ${notice.required_documents || 'not specified'}.`;

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    ttsGlobalBar.style.display = "inline-flex";
  };

  utterance.onend = () => {
    ttsGlobalBar.style.display = "none";
  };

  utterance.onerror = () => {
    ttsGlobalBar.style.display = "none";
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Helper: Category badge styling
 */
function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Examinations': return 'badge-exam';
    case 'Scholarships': return 'badge-scholarship';
    case 'Administration': return 'badge-admin';
    default: return 'badge-exam';
  }
}

/**
 * Helper: Date formatter (e.g., Oct 8, 2026)
 */
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Helper: Escape HTML to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
