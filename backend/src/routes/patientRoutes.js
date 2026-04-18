const express = require("express");
const { query, param } = require("express-validator");
const { searchDoctors, listPublicDoctors, getDoctorProfile } = require("../controllers/patientController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { validateRequest } = require("../middlewares/errorMiddleware");

const router = express.Router();

router.get(
  "/public/doctors",
  [query("specialization").optional().isString()],
  validateRequest,
  listPublicDoctors
);

router.get(
  "/doctors",
  protect,
  authorize("patient"),
  [query("specialization").optional().isString()],
  validateRequest,
  searchDoctors
);

router.get(
  "/doctors/:doctorId",
  protect,
  authorize("patient"),
  [param("doctorId").isMongoId().withMessage("Valid doctorId is required")],
  validateRequest,
  getDoctorProfile
);

module.exports = router;
