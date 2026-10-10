/**
 * NoticeNexus — Notice Controller
 * Handles HTTP requests for notices, formats query parameters, and delegates to service layer.
 */

const noticeService = require('../services/notice.service');

/**
 * GET /api/notices
 * Fetch published notices with optional filtering, search, and sorting.
 */
async function getNotices(req, res, next) {
  try {
    const { search, category, department, academicYear, sortBy, page = 1, limit = 50 } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const notices = await noticeService.getPublishedNotices({
      search,
      category,
      department,
      academicYear,
      sortBy,
      limit: parseInt(limit, 10),
      offset
    });

    res.status(200).json({
      status: 'success',
      results: notices.length,
      data: {
        notices
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/notices/deadlines
 * Fetch upcoming deadlines for student dashboard.
 */
async function getDeadlines(req, res, next) {
  try {
    const limit = req.query.limit || 10;
    const deadlines = await noticeService.getUpcomingDeadlines(limit);

    res.status(200).json({
      status: 'success',
      results: deadlines.length,
      data: {
        deadlines
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/notices/departments
 * Fetch all academic and administrative departments.
 */
async function getDepartments(req, res, next) {
  try {
    const departments = await noticeService.getAllDepartments();

    res.status(200).json({
      status: 'success',
      results: departments.length,
      data: {
        departments
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/notices/:id
 * Fetch single notice details.
 */
async function getNotice(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid notice ID provided.'
      });
    }

    const notice = await noticeService.getNoticeById(id);
    if (!notice) {
      return res.status(404).json({
        status: 'error',
        message: `Notice with ID ${id} was not found.`
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        notice
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/notices/manage
 * Staff/Admin: Fetch all notices including drafts and archives
 */
async function getManagementNotices(req, res, next) {
  try {
    const { status, departmentId } = req.query;
    const notices = await noticeService.getAllNoticesForManagement({ status, departmentId });
    res.status(200).json({
      status: 'success',
      results: notices.length,
      data: { notices }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/notices
 * Staff/Admin: Create and publish or draft a new official notice
 */
async function createNotice(req, res, next) {
  try {
    const { title, category, department_id, content, source_url } = req.body;

    if (!title || !category || !department_id || !content || !source_url) {
      return res.status(400).json({
        status: 'error',
        message: 'Required fields missing: title, category, department_id, content, and source_url must be provided.'
      });
    }

    const noticeId = await noticeService.createNotice(req.body, req.user.id);
    const createdNotice = await noticeService.getNoticeById(noticeId);

    res.status(201).json({
      status: 'success',
      message: 'Official notice created successfully.',
      data: { notice: createdNotice }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/notices/:id
 * Staff/Admin: Edit notice details and maintain revision history
 */
async function updateNotice(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { change_summary } = req.body;

    const existing = await noticeService.getNoticeById(id);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: `Notice with ID ${id} was not found.`
      });
    }

    await noticeService.updateNotice(id, req.body, req.user.id, change_summary);
    const updated = await noticeService.getNoticeById(id);

    res.status(200).json({
      status: 'success',
      message: 'Notice updated and revision history recorded.',
      data: { notice: updated }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/notices/:id/status
 * Staff/Admin: Update publication status (draft -> published -> archived)
 */
async function changeNoticeStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: "Status must be 'draft', 'published', or 'archived'."
      });
    }

    await noticeService.updateNoticeStatus(id, status, req.user.id);

    res.status(200).json({
      status: 'success',
      message: `Notice status updated to '${status}'.`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/notices/:id
 * Admin Only: Remove notice
 */
async function removeNotice(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await noticeService.deleteNotice(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: `Notice with ID ${id} was not found.`
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Notice deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotices,
  getDeadlines,
  getDepartments,
  getNotice,
  getManagementNotices,
  createNotice,
  updateNotice,
  changeNoticeStatus,
  removeNotice
};

