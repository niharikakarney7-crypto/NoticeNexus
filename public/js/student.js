/**
 * NoticeNexus — Student Dashboard Interactive Client
 * Connects directly to Express REST API and MySQL database.
 * Handles dynamic search, category filtering, saving notices to MySQL,
 * student study reminders in MySQL, and Text-to-Speech.
 */

// App State
let currentNotices = [];
let activeCategory = "ALL";
let savedNoticeIds = new Set();
let reminders = [];
let currentUser = null;

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
const welcomeHeading = document.getElementById("welcome-heading");

// Debounce timer for search
let searchDebounceTimer = null;

// Initialize on Load
document.addEventListener("DOMContentLoaded", async () => {
  // Set current date in banner
  const today = new Date();
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  currentDateDisplay.textContent = today.toLocaleDateString('en-US', options);

  // Check Student Session & User Profile
  await checkUserSession();

  // Load Saved Notices & Personal Reminders from MySQL
  await loadSavedNoticesFromAPI();
  await loadRemindersFromAPI();

  // Load Departments & Notices from MySQL
  await loadDepartmentsFromAPI();
  await fetchNoticesFromAPI();
  await fetchDeadlinesFromAPI();

  // Setup Event Listeners
  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(fetchNoticesFromAPI, 300);
  });

  filterDepartment.addEventListener("change", fetchNoticesFromAPI);
  filterYear.addEventListener("change", fetchNoticesFromAPI);
  filterSort.addEventListener("change", fetchNoticesFromAPI);
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
      fetchNoticesFromAPI();
    });
  });

  // Saved notices toggle filter (fetches from MySQL)
  let showingSavedOnly = false;
  navSavedBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    showingSavedOnly = !showingSavedOnly;

    if (showingSavedOnly) {
      navSavedBtn.classList.add("active");
      if (currentUser) {
        try {
          const res = await API.get('/reminders/saved');
          renderNotices(res.data.notices || []);
        } catch {
          const savedList = currentNotices.filter(n => savedNoticeIds.has(n.id));
          renderNotices(savedList);
        }
      } else {
        const savedList = currentNotices.filter(n => savedNoticeIds.has(n.id));
        renderNotices(savedList);
      }
    } else {
      navSavedBtn.classList.remove("active");
      renderNotices(currentNotices);
    }
  });

  // Reminders Form Submission (persists in MySQL)
  addReminderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = reminderInput.value.trim();
    if (!text) return;

    if (currentUser) {
      try {
        await API.post('/reminders', { title: text });
        reminderInput.value = "";
        await loadRemindersFromAPI();
      } catch (err) {
        alert("Error saving reminder: " + err.message);
      }
    } else {
      reminders.push({ id: Date.now(), title: text, is_completed: false });
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
 * Check if student is logged in
 */
async function checkUserSession() {
  const token = API.getToken();
  if (!token) return;

  try {
    const res = await API.get('/auth/me');
    currentUser = res.data.user;

    if (welcomeHeading) {
      welcomeHeading.innerHTML = `Welcome, <strong>${escapeHtml(currentUser.fullName)}</strong>`;
    }

    // Add logout link in top navbar actions if student
    const navActions = document.querySelector(".nav-actions");
    if (navActions && !document.getElementById("student-logout-btn")) {
      const logoutBtn = document.createElement("button");
      logoutBtn.id = "student-logout-btn";
      logoutBtn.className = "btn btn-outline btn-sm";
      logoutBtn.textContent = "Log Out";
      logoutBtn.onclick = () => {
        API.clearToken();
        window.location.reload();
      };
      navActions.appendChild(logoutBtn);
    }
  } catch {
    currentUser = null;
    API.clearToken();
  }
}

/**
 * Load saved bookmarks from MySQL (or fallback for guest)
 */
async function loadSavedNoticesFromAPI() {
  if (currentUser) {
    try {
      const res = await API.get('/reminders/saved/ids');
      savedNoticeIds = new Set(res.data.savedNoticeIds || []);
      updateSavedCountUI();
      return;
    } catch (e) {
      console.warn("Could not sync saved notices from API:", e);
    }
  }

  // Guest fallback
  try {
    const cachedSaved = JSON.parse(localStorage.getItem("noticenexus_saved_ids") || "[]");
    savedNoticeIds = new Set(cachedSaved);
  } catch {
    savedNoticeIds = new Set();
  }
  updateSavedCountUI();
}

/**
 * Load student reminders from MySQL
 */
async function loadRemindersFromAPI() {
  if (currentUser) {
    try {
      const res = await API.get('/reminders');
      reminders = res.data.reminders || [];
      renderReminders();
      return;
    } catch (e) {
      console.warn("Could not load reminders from API:", e);
    }
  }

  // Fallback initial sample reminders for unauthenticated guest
  reminders = [
    { id: 1, title: "Check CSE project synopsis guidelines", is_completed: false },
    { id: 2, title: "Verify scholarship income certificate validity", is_completed: true }
  ];
  renderReminders();
}

/**
 * Fetch Departments from MySQL via Express API
 */
async function loadDepartmentsFromAPI() {
  try {
    const res = await API.get('/notices/departments');
    if (res.data && res.data.departments) {
      const currentSelected = filterDepartment.value;
      filterDepartment.innerHTML = `<option value="">All Departments</option>` +
        res.data.departments.map(d => `<option value="${escapeHtml(d.name)}">${escapeHtml(d.name)}</option>`).join("");
      filterDepartment.value = currentSelected;
    }
  } catch (err) {
    console.error("Failed to load departments from API:", err);
  }
}

/**
 * Fetch Notices from MySQL via Express API
 */
async function fetchNoticesFromAPI() {
  noticeFeedContainer.innerHTML = `
    <div class="card" style="text-align: center; padding: var(--space-2xl) 0;">
      <p style="color: var(--text-muted);">Fetching official notices from campus database...</p>
    </div>
  `;

  try {
    const params = {
      search: searchInput.value.trim(),
      category: activeCategory !== "ALL" ? activeCategory : undefined,
      department: filterDepartment.value || undefined,
      academicYear: filterYear.value || undefined,
      sortBy: filterSort.value || 'newest'
    };

    const response = await API.get('/notices', params);
    currentNotices = response.data.notices || [];
    renderNotices(currentNotices);
  } catch (error) {
    console.error("API error loading notices:", error);
    noticeFeedContainer.innerHTML = `
      <div class="card" style="text-align: center; padding: var(--space-2xl) 0; border-color: var(--status-deadline);">
        <h3 style="color: var(--status-deadline); margin-bottom: var(--space-xs);">Unable to Load Notices</h3>
        <p style="color: var(--text-muted); margin-bottom: var(--space-md);">${escapeHtml(error.message)}</p>
        <button class="btn btn-outline btn-sm" onclick="fetchNoticesFromAPI()">Try Again</button>
      </div>
    `;
  }
}

/**
 * Fetch Upcoming Deadlines from MySQL via Express API
 */
async function fetchDeadlinesFromAPI() {
  try {
    const response = await API.get('/notices/deadlines', { limit: 10 });
    const deadlines = response.data.deadlines || [];
    deadlineBadgeCount.textContent = deadlines.length;

    if (deadlines.length === 0) {
      deadlinesListContainer.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No approaching deadlines.</p>`;
      return;
    }

    deadlinesListContainer.innerHTML = deadlines.map(n => {
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
              <a href="/notice/${n.id}">${escapeHtml(n.title)}</a>
            </div>
            <div class="deadline-meta">
              Due: ${formatDate(n.deadline)} · ${escapeHtml(n.department_name)}
            </div>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Failed to load deadlines:", err);
    deadlinesListContainer.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">Unable to load deadlines.</p>`;
  }
}

/**
 * Reset all active filters
 */
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
  fetchNoticesFromAPI();
}

/**
 * Render Notice Feed Cards
 */
function renderNotices(noticesToRender = currentNotices) {
  noticeCountEl.textContent = noticesToRender.length;

  if (noticesToRender.length === 0) {
    noticeFeedContainer.innerHTML = `
      <div class="card" style="text-align: center; padding: var(--space-2xl) var(--space-lg);">
        <h3 style="color: var(--color-navy); margin-bottom: var(--space-xs);">No notices found</h3>
        <p style="color: var(--text-muted); margin-bottom: var(--space-md);">
          No verified campus announcements match your active criteria in MySQL.
        </p>
        <button class="btn btn-outline-plum btn-sm" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  noticeFeedContainer.innerHTML = noticesToRender.map(notice => {
    const isSaved = savedNoticeIds.has(notice.id);
    const categoryBadgeClass = getCategoryBadgeClass(notice.category);
    const snippet = notice.content ? notice.content.substring(0, 180) + '...' : '';

    return `
      <article class="notice-card" data-notice-id="${notice.id}">
        <!-- Meta Top -->
        <div class="notice-meta-top">
          <div class="notice-badges">
            <span class="badge badge-verified">✓ Official Verified</span>
            <span class="badge ${categoryBadgeClass}">${escapeHtml(notice.category)}</span>
            <span class="badge" style="background:#F1F2F4; color:var(--color-navy);">${escapeHtml(notice.academic_year || 'All Years')}</span>
            ${notice.is_development_sample ? '<span class="badge" style="background:#FFF3CD; color:#856404;">Dev Sample</span>' : ''}
          </div>
          <div class="notice-date">
            Published: <strong>${formatDate(notice.published_at || notice.created_at)}</strong>
          </div>
        </div>

        <!-- Title -->
        <h3 class="notice-title">
          <a href="/notice/${notice.id}">${escapeHtml(notice.title)}</a>
        </h3>

        <!-- Content Snippet -->
        <p class="notice-snippet">${escapeHtml(snippet)}</p>

        <!-- Notice-to-Action Summary Breakdown -->
        <div class="action-assistant">
          <div class="action-assistant-title">
            <span>🎯 Notice-to-Action Summary</span>
          </div>
          <div class="action-grid">
            <div class="action-field">
              <span class="action-label">Target Audience</span>
              <span class="action-value">${escapeHtml(notice.audience || "Not specified in this notice")}</span>
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
            🏛️ ${escapeHtml(notice.department_name)}
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
            <a href="/notice/${notice.id}" class="btn btn-primary btn-sm">
              View Full Notice →
            </a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/**
 * Render Student Reminders
 */
function renderReminders() {
  if (reminders.length === 0) {
    remindersListContainer.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No reminders set.</p>`;
    return;
  }

  remindersListContainer.innerHTML = reminders.map(r => `
    <div class="reminder-item ${r.is_overdue ? 'overdue' : ''}">
      <input 
        type="checkbox" 
        class="reminder-checkbox" 
        ${r.is_completed ? 'checked' : ''} 
        onchange="toggleReminderState(${r.id}, this.checked)"
        aria-label="Mark reminder as completed"
      >
      <div style="flex: 1; margin-left: var(--space-sm);">
        <div class="reminder-text ${r.is_completed ? 'completed' : ''}">
          ${escapeHtml(r.title)}
        </div>
        ${r.due_date ? `<div style="font-size:0.75rem; color:${r.is_overdue ? 'var(--status-deadline)' : 'var(--text-muted)'};">${r.is_overdue ? '⚠️ Overdue: ' : 'Due: '}${formatDate(r.due_date)}</div>` : ''}
      </div>
      <button 
        type="button" 
        class="reminder-delete-btn" 
        onclick="removeReminder(${r.id})"
        aria-label="Delete reminder"
      >
        ✕
      </button>
    </div>
  `).join("");
}

async function toggleReminderState(id, isCompleted) {
  if (currentUser) {
    try {
      await API.patch(`/reminders/${id}`, { is_completed: isCompleted });
      await loadRemindersFromAPI();
    } catch (err) {
      alert("Error updating reminder: " + err.message);
    }
  } else {
    const item = reminders.find(r => r.id === id);
    if (item) {
      item.is_completed = isCompleted;
      renderReminders();
    }
  }
}

async function removeReminder(id) {
  if (currentUser) {
    try {
      await API.delete(`/reminders/${id}`);
      await loadRemindersFromAPI();
    } catch (err) {
      alert("Error deleting reminder: " + err.message);
    }
  } else {
    reminders = reminders.filter(r => r.id !== id);
    renderReminders();
  }
}

/**
 * Save / Bookmark Notice Handler (Persists in MySQL when logged in)
 */
async function toggleSaveNotice(id) {
  const willSave = !savedNoticeIds.has(id);

  if (currentUser) {
    try {
      if (willSave) {
        await API.post(`/reminders/saved/${id}`);
        savedNoticeIds.add(id);
      } else {
        await API.delete(`/reminders/saved/${id}`);
        savedNoticeIds.delete(id);
      }
      updateSavedCountUI();
      renderNotices(currentNotices);
    } catch (err) {
      alert("Error updating bookmark: " + err.message);
    }
  } else {
    // Guest local persistence
    if (willSave) {
      savedNoticeIds.add(id);
    } else {
      savedNoticeIds.delete(id);
    }
    localStorage.setItem("noticenexus_saved_ids", JSON.stringify([...savedNoticeIds]));
    updateSavedCountUI();
    renderNotices(currentNotices);
  }
}

function updateSavedCountUI() {
  savedCountEl.textContent = savedNoticeIds.size;
}

/**
 * Text-to-Speech (TTS) Browser SpeechSynthesis
 */
function speakNotice(id) {
  const notice = currentNotices.find(n => n.id === id);
  if (!notice) return;

  if (!('speechSynthesis' in window)) {
    alert("Text-to-speech is not supported in your browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const speechText = `Official Notice: ${notice.title}. Published by ${notice.department_name}. Details: ${notice.content}. Action summary: Target audience is ${notice.audience || 'All Students'}. Deadline is ${notice.deadline ? formatDate(notice.deadline) : 'not specified'}. Required documents: ${notice.required_documents || 'not specified'}.`;

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

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Examinations': return 'badge-exam';
    case 'Scholarships': return 'badge-scholarship';
    case 'Administration': return 'badge-admin';
    default: return 'badge-exam';
  }
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
