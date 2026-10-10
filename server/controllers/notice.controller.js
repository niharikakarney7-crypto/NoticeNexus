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

module.exports = {
  getNotices,
  getDeadlines,
  getDepartments,
  getNotice
};
