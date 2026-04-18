const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const Appointment = require("../models/Appointment");
const asyncHandler = require("../utils/asyncHandler");
const { createNotification } = require("../services/notificationService");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("name email role isApproved createdAt").sort({ createdAt: -1 });
  return res.status(200).json({ users });
});

const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({ role: "doctor" }).select("name email role isApproved createdAt");

  const profiles = await DoctorProfile.find({ doctor: { $in: doctors.map((d) => d._id) } }).lean();
  const byDoctorId = Object.fromEntries(profiles.map((p) => [String(p.doctor), p]));

  const result = doctors.map((doctor) => ({
    ...doctor.toObject(),
    specialization: byDoctorId[String(doctor._id)]?.specialization || "",
    experienceYears: byDoctorId[String(doctor._id)]?.experienceYears || 0,
  }));

  return res.status(200).json({ doctors: result });
});

const updateDoctorApproval = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { isApproved } = req.body;

  const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  doctor.isApproved = Boolean(isApproved);
  await doctor.save();

  await createNotification({
    userId: doctor._id,
    title: "Doctor approval update",
    message: doctor.isApproved
      ? "Your doctor profile has been approved by admin."
      : "Your doctor profile has been marked as not approved by admin.",
    type: "admin",
  });

  return res.status(200).json({ message: "Doctor approval updated", doctor });
});

const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate("patient", "name email")
    .populate("doctor", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({ appointments });
});

module.exports = {
  getAllUsers,
  getAllDoctors,
  updateDoctorApproval,
  getAllAppointments,
};
