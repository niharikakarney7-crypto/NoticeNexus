/**
 * NoticeNexus — Server Entry Point
 * Listens on unified port and handles lifecycle events.
 */

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🚀 NoticeNexus — Intelligent Campus Information Network`);
  console.log(`🌐 Unified Server listening on: http://localhost:${PORT}`);
  console.log(`📌 Landing Page:    http://localhost:${PORT}/`);
  console.log(`📌 Student Portal:  http://localhost:${PORT}/student`);
  console.log(`📌 Staff Login:     http://localhost:${PORT}/login`);
  console.log(`📌 Admin Console:   http://localhost:${PORT}/admin`);
  console.log(`📌 Notice Detail:   http://localhost:${PORT}/notice/1`);
  console.log(`🩺 Health Check:    http://localhost:${PORT}/api/health`);
  console.log('================================================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION]', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down NoticeNexus gracefully...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});
