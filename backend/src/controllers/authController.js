const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isApproved: user.isApproved,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, specialization, bio, experienceYears } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const allowedRole = ["patient", "doctor"].includes(role) ? role : "patient";

  const user = await User.create({
    name,
    email,
    password,
    role: allowedRole,
  });

  if (allowedRole === "doctor") {
    await DoctorProfile.create({
      doctor: user._id,
      specialization: specialization || "General",
      bio: bio || "",
      experienceYears: experienceYears || 0,
      availability: [],
    });
  }

  const token = generateToken(user._id, user.role);

  return res.status(201).json({
    message: "Registration successful",
    token,
    user: sanitizeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.role === "doctor" && !user.isApproved) {
    return res.status(403).json({ message: "Doctor account is waiting for admin approval" });
  }

  const token = generateToken(user._id, user.role);

  return res.status(200).json({
    message: "Login successful",
    token,
    user: sanitizeUser(user),
  });
});

const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json({ user: sanitizeUser(req.user) });
});

module.exports = { register, login, getMe };
