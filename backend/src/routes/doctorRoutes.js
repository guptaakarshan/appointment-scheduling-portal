const express = require("express");
const { body, param, query } = require("express-validator");
const {
  setAvailability,
  getMyAppointments,
  updateAppointmentStatus,
  getDailySchedule,
} = require("../controllers/doctorController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { validateRequest } = require("../middlewares/errorMiddleware");

const router = express.Router();

router.use(protect, authorize("doctor"));

router.put(
  "/availability",
  [
    body("availability").isArray().withMessage("availability must be an array"),
    body("availability.*.dayOfWeek").isInt({ min: 0, max: 6 }).withMessage("dayOfWeek must be 0-6"),
    body("availability.*.slots").isArray().withMessage("slots must be an array of time strings"),
  ],
  validateRequest,
  setAvailability
);

router.get(
  "/appointments",
  [query("date").optional().isISO8601().withMessage("date must be ISO format")],
  validateRequest,
  getMyAppointments
);

router.patch(
  "/appointments/:appointmentId/status",
  [
    param("appointmentId").isMongoId(),
    body("status").isIn(["confirmed", "rejected", "completed"]),
  ],
  validateRequest,
  updateAppointmentStatus
);

router.get(
  "/schedule",
  [query("date").isISO8601().withMessage("date query is required in YYYY-MM-DD")],
  validateRequest,
  getDailySchedule
);

module.exports = router;
