/**
 * NoticeNexus — Database Initializer & Seeder
 * Reads schema.sql and seed.sql with strict UTF-8 encoding to preserve Telugu Unicode text.
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  console.log('Connecting to MySQL Server to initialize database with UTF-8...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    charset: 'utf8mb4',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });

  try {
    // 1. Run schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('✓ Database schema executed successfully.');

    // 2. Run seed.sql
    const seedSql = fs.readFileSync(path.join(__dirname, '../../database/seed.sql'), 'utf8');
    await connection.query(seedSql);
    console.log('✓ Development seed data inserted successfully with UTF-8 characters.');

    // 3. Verify Telugu characters in Notice #1
    const [rows] = await connection.query('SELECT id, title, telugu_title FROM noticenexus.notices WHERE id = 1');
    console.log('Verification check:');
    console.log('Title:', rows[0].title);
    console.log('Telugu Title:', rows[0].telugu_title);

  } catch (error) {
    console.error('Database initialization error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  initDatabase().then(() => {
    console.log('Done.');
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}

module.exports = { initDatabase };
