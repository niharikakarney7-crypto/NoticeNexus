/**
 * NoticeNexus — Reminders & Saved Notices Service
 * Manages student deadline bookmarks and personalized study reminders in MySQL.
 */

const { pool } = require('../config/db');

/**
 * Get all notices saved by a student
 */
async function getSavedNotices(userId) {
  const query = `
    SELECT 
      n.id, n.title, n.category, n.academic_year, n.content,
      n.source_url, n.source_title, n.deadline, n.audience,
      n.required_documents, n.action_items, n.telugu_title, n.telugu_summary,
      n.status, n.published_at, n.is_development_sample,
      d.name AS department_name, d.code AS department_code,
      sn.saved_at
    FROM saved_notices sn
    JOIN notices n ON sn.notice_id = n.id
    JOIN departments d ON n.department_id = d.id
    WHERE sn.user_id = ? AND n.status = 'published'
    ORDER BY sn.saved_at DESC
  `;
  const [rows] = await pool.query(query, [userId]);
  return rows;
}

/**
 * Get array of notice IDs bookmarked by user (e.g. [1, 3])
 */
async function getSavedNoticeIds(userId) {
  const [rows] = await pool.query('SELECT notice_id FROM saved_notices WHERE user_id = ?', [userId]);
  return rows.map(r => r.notice_id);
}

/**
 * Save / Bookmark a notice for a student
 */
async function saveNotice(userId, noticeId) {
  const query = `
    INSERT INTO saved_notices (user_id, notice_id, saved_at)
    VALUES (?, ?, NOW())
    ON DUPLICATE KEY UPDATE saved_at = NOW()
  `;
  await pool.query(query, [userId, noticeId]);
  return true;
}

/**
 * Unsave / Remove bookmark for a student
 */
async function unsaveNotice(userId, noticeId) {
  const query = 'DELETE FROM saved_notices WHERE user_id = ? AND notice_id = ?';
  const [result] = await pool.query(query, [userId, noticeId]);
  return result.affectedRows > 0;
}

/**
 * Get all personal reminders for a student
 */
async function getUserReminders(userId) {
  const query = `
    SELECT 
      r.id, r.user_id, r.notice_id, r.title, r.due_date, r.is_completed,
      r.created_at, r.updated_at,
      n.title AS notice_title,
      CASE 
        WHEN r.due_date IS NOT NULL AND r.due_date < CURDATE() AND r.is_completed = 0 THEN 1 
        ELSE 0 
      END AS is_overdue
    FROM reminders r
    LEFT JOIN notices n ON r.notice_id = n.id
    WHERE r.user_id = ?
    ORDER BY r.is_completed ASC, 
             CASE WHEN r.due_date IS NULL THEN 1 ELSE 0 END, 
             r.due_date ASC, 
             r.created_at DESC
  `;
  const [rows] = await pool.query(query, [userId]);
  return rows;
}

/**
 * Create a new personal reminder for a student
 */
async function createReminder(userId, { title, due_date = null, notice_id = null }) {
  const query = `
    INSERT INTO reminders (user_id, notice_id, title, due_date, is_completed)
    VALUES (?, ?, ?, ?, 0)
  `;
  const [result] = await pool.query(query, [
    userId,
    notice_id || null,
    title.trim(),
    due_date || null
  ]);
  return result.insertId;
}

/**
 * Toggle reminder completed state
 */
async function toggleReminder(userId, reminderId, isCompleted) {
  const query = `
    UPDATE reminders 
    SET is_completed = ?, updated_at = NOW() 
    WHERE id = ? AND user_id = ?
  `;
  const [result] = await pool.query(query, [isCompleted ? 1 : 0, reminderId, userId]);
  return result.affectedRows > 0;
}

/**
 * Delete a student reminder
 */
async function deleteReminder(userId, reminderId) {
  const query = 'DELETE FROM reminders WHERE id = ? AND user_id = ?';
  const [result] = await pool.query(query, [reminderId, userId]);
  return result.affectedRows > 0;
}

module.exports = {
  getSavedNotices,
  getSavedNoticeIds,
  saveNotice,
  unsaveNotice,
  getUserReminders,
  createReminder,
  toggleReminder,
  deleteReminder
};
