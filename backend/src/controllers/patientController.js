const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const buildDoctorList = async (specialization = "") => {
  const filters = specialization
    ? { specialization: { $regex: specialization, $options: "i" } }
    : {};

  const doctors = await DoctorProfile.find(filters)
    .populate({
      path: "doctor",
      match: { role: "doctor", isApproved: true },
      select: "name email",
    })
    .lean();

  const cleaned = doctors
    .filter((d) => d.doctor)
    .map((d) => ({
      id: d._id,
      doctorId: d.doctor._id,
      name: d.doctor.name,
      email: d.doctor.email,
      specialization: d.specialization,
      bio: d.bio,
      experienceYears: d.experienceYears,
      availability: d.availability,
    }));

  return cleaned;
};

const searchDoctors = asyncHandler(async (req, res) => {
  const { specialization = "" } = req.query;
  const doctors = await buildDoctorList(specialization);

  return res.status(200).json({ doctors });
});

const listPublicDoctors = asyncHandler(async (req, res) => {
  const { specialization = "" } = req.query;
  const doctors = await buildDoctorList(specialization);

  return res.status(200).json({ doctors });
});

const getDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await User.findOne({ _id: req.params.doctorId, role: "doctor", isApproved: true }).select(
    "name email"
  );
  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  const profile = await DoctorProfile.findOne({ doctor: doctor._id });
  if (!profile) {
    return res.status(404).json({ message: "Doctor profile not found" });
  }

  return res.status(200).json({
    doctor: {
      doctorId: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialization: profile.specialization,
      bio: profile.bio,
      experienceYears: profile.experienceYears,
      availability: profile.availability,
    },
  });
});

module.exports = { searchDoctors, listPublicDoctors, getDoctorProfile };
