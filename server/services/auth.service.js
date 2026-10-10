/**
 * NoticeNexus — Authentication Service
 * Handles user credential verification with bcrypt and JWT token generation.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Authenticate user with username or email and password
 */
async function authenticateUser(identifier, password) {
  if (!identifier || !password) {
    throw new Error('Please provide both username/email and password.');
  }

  // Find user by either username or email
  const [rows] = await pool.query(`
    SELECT 
      u.id, u.username, u.email, u.password_hash, u.full_name, u.role, 
      u.department_id, u.academic_year,
      d.name AS department_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.username = ? OR u.email = ?
    LIMIT 1
  `, [identifier.trim(), identifier.trim()]);

  if (rows.length === 0) {
    const error = new Error('Invalid username or password.');
    error.status = 401;
    throw error;
  }

  const user = rows[0];

  // Verify bcrypt password hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid username or password.');
    error.status = 401;
    throw error;
  }

  // Generate cryptographically signed JWT token
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    department_id: user.department_id,
    full_name: user.full_name
  };

  const secret = process.env.JWT_SECRET || 'noticenexus_fallback_secret';
  const token = jwt.sign(payload, secret, { expiresIn: '24h' });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      departmentId: user.department_id,
      departmentName: user.department_name,
      academicYear: user.academic_year
    }
  };
}

/**
 * Retrieve user profile by user ID
 */
async function getUserById(userId) {
  const [rows] = await pool.query(`
    SELECT 
      u.id, u.username, u.email, u.full_name, u.role, 
      u.department_id, u.academic_year, u.created_at,
      d.name AS department_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.id = ?
    LIMIT 1
  `, [userId]);

  if (rows.length === 0) return null;
  return rows[0];
}

module.exports = {
  authenticateUser,
  getUserById
};
