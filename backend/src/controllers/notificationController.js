const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json({ notifications });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.notificationId,
    user: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  notification.isRead = true;
  await notification.save();

  return res.status(200).json({ message: "Notification marked as read", notification });
});

module.exports = { getMyNotifications, markAsRead };
