/**
 * NoticeNexus — Reminders & Saved Notices Routes
 * Mounted on /api/reminders
 * All endpoints require student authentication (JWT Bearer token).
 */

const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminder.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Protect all reminder & saved notice routes with authentication
router.use(verifyToken);

// Saved Notices (Bookmarks)
router.get('/saved', reminderController.getSavedNotices);
router.get('/saved/ids', reminderController.getSavedNoticeIds);
router.post('/saved/:noticeId', reminderController.saveNotice);
router.delete('/saved/:noticeId', reminderController.unsaveNotice);

// Student Reminders
router.get('/', reminderController.getReminders);
router.post('/', reminderController.createReminder);
router.patch('/:id', reminderController.toggleReminder);
router.delete('/:id', reminderController.deleteReminder);

module.exports = router;
