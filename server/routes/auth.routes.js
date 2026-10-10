/**
 * NoticeNexus — Authentication Routes
 * Mounted on /api/auth
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { loginLimiter } = require('../middleware/rateLimiter');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/login', loginLimiter, authController.login);
router.get('/me', verifyToken, authController.getMe);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
