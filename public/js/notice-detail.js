/**
 * NoticeNexus — Notice Detail View & Notice-to-Action Assistant
 * Fetches notice directly from MySQL via Express API endpoint GET /api/notices/:id.
 * Renders verified source link, Notice-to-Action breakdown, Telugu explanation, and TTS.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  
  // Also support clean URL path /notice/123
  let noticeId = params.get("id");
  if (!noticeId) {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2 && pathParts[0] === "notice") {
      noticeId = pathParts[1];
    }
  }

  const id = parseInt(noticeId, 10) || 1;
  await loadNoticeDetails(id);
});

async function loadNoticeDetails(id) {
  try {
    const response = await API.get(`/notices/${id}`);
    const notice = response.data.notice;
    renderNoticeDetails(notice);
  } catch (error) {
    console.error("Error loading notice details:", error);
    document.getElementById("detail-title").textContent = "Notice Not Found";
    document.getElementById("detail-body").innerHTML = `
      <div style="background:#FDF1EE; padding:var(--space-md); border-radius:var(--radius-sm); color:var(--status-deadline);">
        <strong>Error:</strong> ${escapeHtml(error.message || "The requested notice could not be found.")}
      </div>
      <p style="margin-top:var(--space-md);"><a href="/student">← Return to Student Notice Board</a></p>
    `;
  }
}

function renderNoticeDetails(notice) {
  // Document title
  document.title = `${notice.title} — NoticeNexus`;

  // Badges & Meta
  document.getElementById("detail-category").textContent = notice.category;
  document.getElementById("detail-year").textContent = notice.academic_year || "All Years";
  document.getElementById("detail-title").textContent = notice.title;
  document.getElementById("detail-department").textContent = notice.department_name;
  document.getElementById("detail-published-date").textContent = formatDate(notice.published_at || notice.created_at);
  document.getElementById("detail-updated-date").textContent = formatDate(notice.updated_at || notice.published_at || notice.created_at);

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
    sourceLinkEl.style.display = "inline-flex";
  } else {
    sourceTitleEl.textContent = "Institutional Internal Notice (No external URL)";
    sourceLinkEl.style.display = "none";
  }

  // Telugu Accessibility Section
  const teluguContainer = document.getElementById("telugu-container");
  if (notice.telugu_title && notice.telugu_summary) {
    teluguContainer.style.display = "block";
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

  const fullTextToRead = `Official Notice: ${notice.title}. Published by ${notice.department_name}. ${notice.content}. Action summary: Audience: ${notice.audience || 'Not specified'}. Deadline: ${notice.deadline ? formatDate(notice.deadline) : 'Not specified'}. Required documents: ${notice.required_documents || 'Not specified'}. Next action: ${notice.action_items || 'Not specified'}.`;

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

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
