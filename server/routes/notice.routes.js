/**
 * NoticeNexus — Notice Routes
 * REST API routes for retrieving published campus notices, deadlines, and departments.
 */

const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/notice.controller');

// Notice collection endpoints
router.get('/', noticeController.getNotices);
router.get('/deadlines', noticeController.getDeadlines);
router.get('/departments', noticeController.getDepartments);

// Single notice endpoint
router.get('/:id', noticeController.getNotice);

module.exports = router;
