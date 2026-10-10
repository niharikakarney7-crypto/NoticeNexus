/**
 * NoticeNexus — Reminders & Saved Notices Controller
 * Handles HTTP requests for student bookmarks and study reminders.
 */

const reminderService = require('../services/reminder.service');

// ============================================================================
// Saved Notices (Bookmarks) Handlers
// ============================================================================

async function getSavedNotices(req, res, next) {
  try {
    const notices = await reminderService.getSavedNotices(req.user.id);
    res.status(200).json({
      status: 'success',
      results: notices.length,
      data: { notices }
    });
  } catch (error) {
    next(error);
  }
}

async function getSavedNoticeIds(req, res, next) {
  try {
    const ids = await reminderService.getSavedNoticeIds(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { savedNoticeIds: ids }
    });
  } catch (error) {
    next(error);
  }
}

async function saveNotice(req, res, next) {
  try {
    const noticeId = parseInt(req.params.noticeId, 10);
    if (isNaN(noticeId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid notice ID.' });
    }

    await reminderService.saveNotice(req.user.id, noticeId);
    res.status(200).json({
      status: 'success',
      message: 'Notice bookmarked successfully.'
    });
  } catch (error) {
    next(error);
  }
}

async function unsaveNotice(req, res, next) {
  try {
    const noticeId = parseInt(req.params.noticeId, 10);
    if (isNaN(noticeId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid notice ID.' });
    }

    await reminderService.unsaveNotice(req.user.id, noticeId);
    res.status(200).json({
      status: 'success',
      message: 'Notice removed from saved bookmarks.'
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Student Reminders Handlers
// ============================================================================

async function getReminders(req, res, next) {
  try {
    const reminders = await reminderService.getUserReminders(req.user.id);
    res.status(200).json({
      status: 'success',
      results: reminders.length,
      data: { reminders }
    });
  } catch (error) {
    next(error);
  }
}

async function createReminder(req, res, next) {
  try {
    const { title, due_date, notice_id } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ status: 'error', message: 'Reminder title cannot be empty.' });
    }

    const insertId = await reminderService.createReminder(req.user.id, {
      title,
      due_date,
      notice_id
    });

    res.status(201).json({
      status: 'success',
      message: 'Reminder created successfully.',
      data: { reminderId: insertId }
    });
  } catch (error) {
    next(error);
  }
}

async function toggleReminder(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { is_completed } = req.body;

    await reminderService.toggleReminder(req.user.id, id, !!is_completed);
    res.status(200).json({
      status: 'success',
      message: 'Reminder updated.'
    });
  } catch (error) {
    next(error);
  }
}

async function deleteReminder(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await reminderService.deleteReminder(req.user.id, id);
    res.status(200).json({
      status: 'success',
      message: 'Reminder deleted.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSavedNotices,
  getSavedNoticeIds,
  saveNotice,
  unsaveNotice,
  getReminders,
  createReminder,
  toggleReminder,
  deleteReminder
};
