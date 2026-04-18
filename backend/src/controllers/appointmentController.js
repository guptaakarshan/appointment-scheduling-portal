const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { createNotification } = require("../services/notificationService");

const isSlotInAvailability = (availability, date, slot) => {
  const day = new Date(date).getDay();
  const dayBlock = availability.find((a) => a.dayOfWeek === day);
  return Boolean(dayBlock && dayBlock.slots.includes(slot));
};

const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, timeSlot, reason } = req.body;

  const doctor = await User.findOne({ _id: doctorId, role: "doctor", isApproved: true });
  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found or not approved" });
  }

  const profile = await DoctorProfile.findOne({ doctor: doctorId });
  if (!profile) {
    return res.status(404).json({ message: "Doctor profile not found" });
  }

  if (!isSlotInAvailability(profile.availability, date, timeSlot)) {
    return res.status(400).json({ message: "Selected slot is not in doctor's availability" });
  }

  try {
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      timeSlot,
      reason: reason || "",
      status: "pending",
      updatedAtStatus: new Date(),
    });

    await createNotification({
      userId: doctorId,
      title: "New appointment request",
      message: `New appointment request for ${date} at ${timeSlot}.`,
      type: "booking",
    });

    return res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: "Invalid appointment data" });
    }

    if (error.code === 11000) {
      return res.status(409).json({ message: "This slot is already booked" });
    }

    throw error;
  }
});

const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate("doctor", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({ appointments });
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findOne({ _id: appointmentId, patient: req.user._id }).populate(
    "doctor",
    "name"
  );
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  if (["completed", "cancelled"].includes(appointment.status)) {
    return res.status(400).json({ message: `Cannot cancel an appointment with status ${appointment.status}` });
  }

  appointment.status = "cancelled";
  appointment.updatedAtStatus = new Date();
  await appointment.save();

  await createNotification({
    userId: appointment.doctor._id,
    title: "Appointment cancelled",
    message: `An appointment on ${appointment.date} at ${appointment.timeSlot} was cancelled by patient.`,
    type: "status",
  });

  return res.status(200).json({ message: "Appointment cancelled", appointment });
});

const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { date, timeSlot } = req.body;

  const appointment = await Appointment.findOne({ _id: appointmentId, patient: req.user._id });
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  if (["completed", "cancelled"].includes(appointment.status)) {
    return res.status(400).json({ message: `Cannot reschedule an appointment with status ${appointment.status}` });
  }

  const profile = await DoctorProfile.findOne({ doctor: appointment.doctor });
  if (!profile) {
    return res.status(404).json({ message: "Doctor profile not found" });
  }

  if (!isSlotInAvailability(profile.availability, date, timeSlot)) {
    return res.status(400).json({ message: "Selected slot is not in doctor's availability" });
  }

  const conflict = await Appointment.findOne({
    doctor: appointment.doctor,
    date,
    timeSlot,
    _id: { $ne: appointment._id },
    status: { $in: ["pending", "confirmed"] },
  });

  if (conflict) {
    return res.status(409).json({ message: "This new slot is already booked" });
  }

  appointment.date = date;
  appointment.timeSlot = timeSlot;
  appointment.status = "pending";
  appointment.updatedAtStatus = new Date();
  await appointment.save();

  await createNotification({
    userId: appointment.doctor,
    title: "Appointment rescheduled",
    message: `Appointment was rescheduled to ${date} at ${timeSlot}. Please review it.`,
    type: "status",
  });

  return res.status(200).json({ message: "Appointment rescheduled", appointment });
});

module.exports = {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  rescheduleAppointment,
};
