/**
 * NoticeNexus — Staff & Admin Dashboard Client
 * Verifies JWT session, manages department notices, handles publication workflows,
 * and maintains source-grounded circular creation.
 */

let currentUser = null;
let departmentsList = [];
let adminNotices = [];

// DOM Elements
const userProfileBar = document.getElementById("admin-user-bar");
const logoutBtn = document.getElementById("admin-logout-btn");
const tableBody = document.getElementById("admin-table-body");
const statusFilter = document.getElementById("admin-filter-status");
const modal = document.getElementById("notice-modal");
const openModalBtn = document.getElementById("open-create-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const noticeForm = document.getElementById("notice-form");
const formDepartment = document.getElementById("form-department");
const submitDraftBtn = document.getElementById("submit-draft-btn");
const submitPublishBtn = document.getElementById("submit-publish-btn");

// Stats elements
const statPublished = document.getElementById("stat-published");
const statDrafts = document.getElementById("stat-drafts");
const statArchived = document.getElementById("stat-archived");
const statDeadlines = document.getElementById("stat-deadlines");

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Check Authentication & Verify Staff/Admin Role
  const isAuthorized = await verifySession();
  if (!isAuthorized) return;

  // 2. Load Departments
  await loadDepartments();

  // 3. Load Notices Table
  await loadNotices();

  // 4. Setup Event Listeners
  if (openModalBtn) openModalBtn.addEventListener("click", () => modal.style.display = "flex");
  if (closeModalBtn) closeModalBtn.addEventListener("click", () => modal.style.display = "none");
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", () => modal.style.display = "none");
  if (statusFilter) statusFilter.addEventListener("change", loadNotices);

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      API.clearToken();
      window.location.href = '/login';
    });
  }

  // Handle Form Submission
  let chosenStatus = 'published';
  if (submitDraftBtn) submitDraftBtn.addEventListener("click", () => chosenStatus = 'draft');
  if (submitPublishBtn) submitPublishBtn.addEventListener("click", () => chosenStatus = 'published');

  if (noticeForm) {
    noticeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleNoticeSubmit(chosenStatus);
    });
  }
});

/**
 * Verify JWT Session and Role
 */
async function verifySession() {
  const token = API.getToken();
  if (!token) {
    window.location.href = '/login';
    return false;
  }

  try {
    const res = await API.get('/auth/me');
    currentUser = res.data.user;

    // Strict Role Restriction: Students cannot access staff console
    if (currentUser.role !== 'staff' && currentUser.role !== 'admin') {
      alert("Access Denied: You must be an authorized staff member or administrator.");
      API.clearToken();
      window.location.href = '/login';
      return false;
    }

    if (userProfileBar) {
      userProfileBar.innerHTML = `
        <span>👤 <strong>${escapeHtml(currentUser.fullName)}</strong> (${escapeHtml(currentUser.role.toUpperCase())})</span>
      `;
    }
    return true;
  } catch (err) {
    console.error("Session verification failed:", err);
    API.clearToken();
    window.location.href = '/login';
    return false;
  }
}

/**
 * Load Departments for Modal Select
 */
async function loadDepartments() {
  try {
    const res = await API.get('/notices/departments');
    departmentsList = res.data.departments || [];
    if (formDepartment) {
      formDepartment.innerHTML = departmentsList.map(d => `
        <option value="${d.id}">${escapeHtml(d.name)} (${escapeHtml(d.code)})</option>
      `).join("");
    }
  } catch (err) {
    console.error("Failed to load departments:", err);
  }
}

/**
 * Load Notices for Staff Management Table
 */
async function loadNotices() {
  tableBody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: var(--space-xl); color: var(--text-muted);">
        Loading official announcements from MySQL...
      </td>
    </tr>
  `;

  try {
    const status = statusFilter ? statusFilter.value : 'ALL';
    const res = await API.get('/notices/manage', { status: status !== 'ALL' ? status : undefined });
    adminNotices = res.data.notices || [];

    updateStats(adminNotices);
    renderTable(adminNotices);
  } catch (err) {
    console.error("Failed to load management notices:", err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: var(--space-xl); color: var(--status-deadline);">
          Error loading notices: ${escapeHtml(err.message)}
        </td>
      </tr>
    `;
  }
}

/**
 * Update Quick Stats Bar
 */
function updateStats(notices) {
  let pub = 0, draft = 0, arch = 0, dead = 0;
  const now = new Date();

  notices.forEach(n => {
    if (n.status === 'published') pub++;
    else if (n.status === 'draft') draft++;
    else if (n.status === 'archived') arch++;

    if (n.deadline && new Date(n.deadline) >= now) dead++;
  });

  if (statPublished) statPublished.textContent = pub;
  if (statDrafts) statDrafts.textContent = draft;
  if (statArchived) statArchived.textContent = arch;
  if (statDeadlines) statDeadlines.textContent = dead;
}

/**
 * Render Management Table Rows
 */
function renderTable(notices) {
  if (notices.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: var(--space-xl); color: var(--text-muted);">
          No notices match the selected criteria.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = notices.map(n => {
    const statusBadgeClass = n.status === 'published' ? 'badge-verified' : (n.status === 'draft' ? 'badge-exam' : 'badge-admin');

    return `
      <tr>
        <td>
          <strong><a href="/notice/${n.id}" target="_blank" style="color:var(--color-navy);">${escapeHtml(n.title)}</a></strong>
          <div style="font-size:0.8rem; color:var(--text-muted);">
            🏛️ ${escapeHtml(n.department_name)} · By ${escapeHtml(n.author_name || 'Staff')}
          </div>
        </td>
        <td><span class="badge badge-exam">${escapeHtml(n.category)}</span></td>
        <td>${escapeHtml(n.academic_year || 'All Years')}</td>
        <td>
          <span class="badge ${statusBadgeClass}">
            ${escapeHtml(n.status.toUpperCase())}
          </span>
        </td>
        <td style="color:${n.deadline ? 'var(--status-deadline)' : 'inherit'}; font-weight:600;">
          ${n.deadline ? formatDate(n.deadline) : 'None'}
        </td>
        <td>${formatDate(n.published_at || n.created_at)}</td>
        <td style="text-align: right; white-space: nowrap;">
          ${n.status !== 'published' ? `
            <button class="btn btn-secondary btn-sm" onclick="setStatus(${n.id}, 'published')">Publish</button>
          ` : `
            <button class="btn btn-outline btn-sm" onclick="setStatus(${n.id}, 'archived')">Archive</button>
          `}
          ${currentUser && currentUser.role === 'admin' ? `
            <button class="btn btn-outline-plum btn-sm" onclick="deleteNotice(${n.id})">Delete</button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join("");
}

/**
 * Handle Notice Creation Form
 */
async function handleNoticeSubmit(status) {
  const payload = {
    title: document.getElementById("form-title").value.trim(),
    category: document.getElementById("form-category").value,
    department_id: parseInt(document.getElementById("form-department").value, 10),
    academic_year: document.getElementById("form-year").value,
    deadline: document.getElementById("form-deadline").value || null,
    content: document.getElementById("form-content").value.trim(),
    source_url: document.getElementById("form-source-url").value.trim(),
    source_title: document.getElementById("form-source-title").value.trim() || "Official Campus Circular",
    audience: document.getElementById("form-audience").value.trim() || "All Students",
    required_documents: document.getElementById("form-documents").value.trim() || "Not specified in this notice",
    action_items: document.getElementById("form-actions").value.trim() || "Review official circular",
    telugu_title: document.getElementById("form-telugu-title").value.trim() || null,
    telugu_summary: document.getElementById("form-telugu-summary").value.trim() || null,
    status
  };

  try {
    await API.post('/notices', payload);
    modal.style.display = "none";
    noticeForm.reset();
    await loadNotices();
    alert(`Notice successfully ${status === 'published' ? 'published' : 'saved as draft'}!`);
  } catch (err) {
    alert("Error creating notice: " + err.message);
  }
}

/**
 * Update Publication Status
 */
async function setStatus(id, newStatus) {
  if (!confirm(`Are you sure you want to change this notice status to '${newStatus}'?`)) return;

  try {
    await API.patch(`/notices/${id}/status`, { status: newStatus });
    await loadNotices();
  } catch (err) {
    alert("Error updating status: " + err.message);
  }
}

/**
 * Delete Notice (Admin)
 */
async function deleteNotice(id) {
  if (!confirm("Are you sure you want to permanently delete this notice? This action cannot be undone.")) return;

  try {
    await API.delete(`/notices/${id}`);
    await loadNotices();
  } catch (err) {
    alert("Error deleting notice: " + err.message);
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
