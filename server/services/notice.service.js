/**
 * NoticeNexus — Notice Service
 * Handles database operations for official campus announcements.
 * Parameterized queries protect against SQL injection.
 */

const { pool } = require('../config/db');

/**
 * Retrieve published notices with search, filtering, and sorting.
 */
async function getPublishedNotices({ search, category, department, academicYear, sortBy = 'newest', limit = 50, offset = 0 } = {}) {
  let query = `
    SELECT 
      n.id,
      n.title,
      n.category,
      n.academic_year,
      n.content,
      n.source_url,
      n.source_title,
      n.deadline,
      n.audience,
      n.required_documents,
      n.action_items,
      n.telugu_title,
      n.telugu_summary,
      n.status,
      n.published_at,
      n.is_development_sample,
      n.created_at,
      n.updated_at,
      d.id AS department_id,
      d.name AS department_name,
      d.code AS department_code,
      u.full_name AS author_name
    FROM notices n
    JOIN departments d ON n.department_id = d.id
    JOIN users u ON n.author_id = u.id
    WHERE n.status = 'published'
  `;

  const params = [];

  // Search keyword across title, content, or department name
  if (search && search.trim()) {
    query += ` AND (n.title LIKE ? OR n.content LIKE ? OR d.name LIKE ?)`;
    const searchParam = `%${search.trim()}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  // Category filter
  if (category && category !== 'ALL') {
    query += ` AND n.category = ?`;
    params.push(category);
  }

  // Department filter
  if (department && department.trim()) {
    query += ` AND (d.name = ? OR d.code = ?)`;
    params.push(department, department);
  }

  // Academic Year filter
  if (academicYear && academicYear !== 'ALL') {
    query += ` AND (n.academic_year = ? OR n.academic_year = 'All Years')`;
    params.push(academicYear);
  }

  // Sorting
  switch (sortBy) {
    case 'deadline':
      query += ` ORDER BY CASE WHEN n.deadline IS NULL THEN 1 ELSE 0 END, n.deadline ASC, n.published_at DESC`;
      break;
    case 'title':
      query += ` ORDER BY n.title ASC`;
      break;
    case 'newest':
    default:
      query += ` ORDER BY n.published_at DESC`;
      break;
  }

  // Pagination (limit and offset must be integers)
  query += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit, 10) || 50, parseInt(offset, 10) || 0);

  const [rows] = await pool.query(query, params);
  return rows;
}

/**
 * Retrieve single notice by ID with complete details and audit revisions.
 */
async function getNoticeById(id) {
  const query = `
    SELECT 
      n.id,
      n.title,
      n.category,
      n.academic_year,
      n.content,
      n.source_url,
      n.source_title,
      n.deadline,
      n.audience,
      n.required_documents,
      n.action_items,
      n.telugu_title,
      n.telugu_summary,
      n.status,
      n.published_at,
      n.is_development_sample,
      n.created_at,
      n.updated_at,
      d.id AS department_id,
      d.name AS department_name,
      d.code AS department_code,
      d.contact_email AS department_email,
      u.full_name AS author_name,
      u.email AS author_email
    FROM notices n
    JOIN departments d ON n.department_id = d.id
    JOIN users u ON n.author_id = u.id
    WHERE n.id = ?
  `;

  const [rows] = await pool.query(query, [id]);
  if (rows.length === 0) return null;

  const notice = rows[0];

  // Also fetch revision history if any exist
  const [revisions] = await pool.query(`
    SELECT r.id, r.change_summary, r.revised_at, u.full_name AS editor_name
    FROM notice_revisions r
    JOIN users u ON r.editor_id = u.id
    WHERE r.notice_id = ?
    ORDER BY r.revised_at DESC
  `, [id]);

  notice.revisions = revisions;
  return notice;
}

/**
 * Retrieve upcoming deadlines in chronological order.
 */
async function getUpcomingDeadlines(limit = 10) {
  const query = `
    SELECT 
      n.id,
      n.title,
      n.category,
      n.deadline,
      d.name AS department_name,
      DATEDIFF(n.deadline, CURDATE()) AS days_remaining
    FROM notices n
    JOIN departments d ON n.department_id = d.id
    WHERE n.status = 'published' 
      AND n.deadline IS NOT NULL 
      AND n.deadline >= CURDATE()
    ORDER BY n.deadline ASC
    LIMIT ?
  `;

  const [rows] = await pool.query(query, [parseInt(limit, 10) || 10]);
  return rows;
}

/**
 * Retrieve all registered departments.
 */
async function getAllDepartments() {
  const [rows] = await pool.query('SELECT id, code, name, contact_email FROM departments ORDER BY name ASC');
  return rows;
}

module.exports = {
  getPublishedNotices,
  getNoticeById,
  getUpcomingDeadlines,
  getAllDepartments
};
