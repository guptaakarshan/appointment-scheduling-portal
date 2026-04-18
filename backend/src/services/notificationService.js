const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendEmail } = require("./emailService");

const createNotification = async ({ userId, title, message, type = "status" }) => {
  await Notification.create({
    user: userId,
    title,
    message,
    type,
  });

  const user = await User.findById(userId);
  if (user?.email) {
    await sendEmail({ to: user.email, subject: title, text: message });
  }
};

module.exports = { createNotification };
