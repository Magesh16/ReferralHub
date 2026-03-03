const Notification = require('../models/Notification');
const { successResponse, errorResponse, buildPagination } = require('../utils/helpers');

/**
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = { user: req.user._id };

    if (unreadOnly === 'true') query.isRead = false;

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, totalDocs, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    const pagination = buildPagination(Number(page), Number(limit), totalDocs);

    return successResponse(res, { notifications, unreadCount, pagination }, 'Notifications fetched');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    return successResponse(res, notification, 'Marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
