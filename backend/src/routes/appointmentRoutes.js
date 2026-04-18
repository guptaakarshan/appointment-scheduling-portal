const express = require("express");
const { body, param } = require("express-validator");
const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  rescheduleAppointment,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { validateRequest } = require("../middlewares/errorMiddleware");

const router = express.Router();

router.use(protect, authorize("patient"));

router.post(
  "/",
  [
    body("doctorId").isMongoId().withMessage("doctorId is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("timeSlot").notEmpty().withMessage("timeSlot is required"),
    body("reason").optional().isString(),
  ],
  validateRequest,
  bookAppointment
);

router.get("/my", getMyAppointments);

router.patch(
  "/:appointmentId/cancel",
  [param("appointmentId").isMongoId()],
  validateRequest,
  cancelAppointment
);

router.patch(
  "/:appointmentId/reschedule",
  [
    param("appointmentId").isMongoId(),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("timeSlot").notEmpty().withMessage("timeSlot is required"),
  ],
  validateRequest,
  rescheduleAppointment
);

module.exports = router;
