const express = require("express");
const { param } = require("express-validator");
const { getMyNotifications, markAsRead } = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");
const { validateRequest } = require("../middlewares/errorMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getMyNotifications);

router.patch(
  "/:notificationId/read",
  [param("notificationId").isMongoId()],
  validateRequest,
  markAsRead
);

module.exports = router;
