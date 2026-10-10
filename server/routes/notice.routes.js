/**
 * NoticeNexus — Notice Routes
 * Public endpoints for browsing notices, and protected endpoints for staff/admin notice authoring.
 */

const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/notice.controller');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');

// Public endpoints
router.get('/', noticeController.getNotices);
router.get('/deadlines', noticeController.getDeadlines);
router.get('/departments', noticeController.getDepartments);

// Protected Staff & Admin management endpoints
router.get('/manage', verifyToken, requireRoles('staff', 'admin'), noticeController.getManagementNotices);
router.post('/', verifyToken, requireRoles('staff', 'admin'), noticeController.createNotice);
router.put('/:id', verifyToken, requireRoles('staff', 'admin'), noticeController.updateNotice);
router.patch('/:id/status', verifyToken, requireRoles('staff', 'admin'), noticeController.changeNoticeStatus);
router.delete('/:id', verifyToken, requireRoles('admin'), noticeController.removeNotice);

// Public single notice details
router.get('/:id', noticeController.getNotice);

module.exports = router;
