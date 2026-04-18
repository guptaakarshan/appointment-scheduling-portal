const express = require("express");
const { body, param } = require("express-validator");
const {
  getAllUsers,
  getAllDoctors,
  updateDoctorApproval,
  getAllAppointments,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { validateRequest } = require("../middlewares/errorMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.get("/doctors", getAllDoctors);
router.get("/appointments", getAllAppointments);

router.patch(
  "/doctors/:doctorId/approval",
  [param("doctorId").isMongoId(), body("isApproved").isBoolean()],
  validateRequest,
  updateDoctorApproval
);

module.exports = router;
