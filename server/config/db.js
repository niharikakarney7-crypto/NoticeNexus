/**
 * NoticeNexus — MySQL Database Connection Pool
 * Uses mysql2/promise for connection pooling and parameterized query security.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'noticenexus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00'
});

/**
 * Diagnostic helper: Verifies MySQL database connection and returns server version.
 */
async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result, VERSION() AS mysql_version');
    return {
      connected: true,
      version: rows[0].mysql_version
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

module.exports = {
  pool,
  testConnection
};
