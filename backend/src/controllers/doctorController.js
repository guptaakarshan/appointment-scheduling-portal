const DoctorProfile = require("../models/DoctorProfile");
const Appointment = require("../models/Appointment");
const asyncHandler = require("../utils/asyncHandler");
const { createNotification } = require("../services/notificationService");

const setAvailability = asyncHandler(async (req, res) => {
  const { availability } = req.body;

  const profile = await DoctorProfile.findOne({ doctor: req.user._id });
  if (!profile) {
    return res.status(404).json({ message: "Doctor profile not found" });
  }

  profile.availability = availability;
  await profile.save();

  return res
    .status(200)
    .json({
      message: "Availability updated",
      availability: profile.availability,
    });
});

const getMyAppointments = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const query = { doctor: req.user._id };
  if (date) {
    query.date = date;
  }

  const appointments = await Appointment.find(query)
    .populate("patient", "name email")
    .sort({ date: 1, timeSlot: 1 });

  return res.status(200).json({ appointments });
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  const validStatuses = ["confirmed", "rejected", "completed"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status update" });
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    doctor: req.user._id,
  }).populate("patient", "name email");
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  appointment.status = status;
  appointment.updatedAtStatus = new Date();
  await appointment.save();

  await createNotification({
    userId: appointment.patient._id,
    title: "Appointment status updated",
    message: `Your appointment on ${appointment.date} at ${appointment.timeSlot} is now ${status}.`,
    type: "status",
  });

  return res
    .status(200)
    .json({ message: "Appointment status updated", appointment });
});

const getDailySchedule = asyncHandler(async (req, res) => {
  const today = req.query.date;
  if (!today) {
    return res
      .status(400)
      .json({ message: "date query is required in YYYY-MM-DD format" });
  }

  const appointments = await Appointment.find({
    doctor: req.user._id,
    date: today,
  })
    .populate("patient", "name email")
    .sort({ timeSlot: 1 });

  return res.status(200).json({ date: today, appointments });
});

module.exports = {
  setAvailability,
  getMyAppointments,
  updateAppointmentStatus,
  getDailySchedule,
};
