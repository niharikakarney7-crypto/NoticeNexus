/**
 * NoticeNexus — Express Application Setup
 * Unified Server: Serves frontend pages and REST API from the exact same host & port.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Frontend Assets (CSS, JS, Images, Icons)
const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory));

// ============================================================================
// Single Unified Application: Clean Frontend Page Routes
// Supports direct URL visits and page reloads seamlessly
// ============================================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'index.html'));
});

app.get('/student', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'student.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'admin.html'));
});

app.get(['/notice', '/notice/:id'], (req, res) => {
  res.sendFile(path.join(publicDirectory, 'notice.html'));
});

// ============================================================================
// REST API Health-Check & Diagnostic Endpoint
// ============================================================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'NoticeNexus API and Unified Server are operational',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Centralized 404 Handler for Unrecognized API Routes
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `API endpoint '${req.originalUrl}' does not exist.`
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
