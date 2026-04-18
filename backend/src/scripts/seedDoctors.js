const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");

dotenv.config();

const sampleDoctors = [
  {
    name: "Dr. Aisha Khan",
    email: "aisha.khan@example.com",
    password: "Doctor@123",
    specialization: "Cardiology",
    bio: "Heart specialist focused on preventive care, diagnostics, and long-term patient support.",
    experienceYears: 12,
    availability: [
      { dayOfWeek: 1, slots: ["09:00-09:30", "09:30-10:00", "10:30-11:00"] },
      { dayOfWeek: 3, slots: ["11:00-11:30", "11:30-12:00", "02:00-02:30"] },
      { dayOfWeek: 5, slots: ["10:00-10:30", "10:30-11:00", "03:00-03:30"] },
    ],
  },
  {
    name: "Dr. Rahul Mehta",
    email: "rahul.mehta@example.com",
    password: "Doctor@123",
    specialization: "Dermatology",
    bio: "Dermatologist handling skin health, hair concerns, and allergy-related consultations.",
    experienceYears: 8,
    availability: [
      { dayOfWeek: 0, slots: ["10:00-10:30", "10:30-11:00"] },
      { dayOfWeek: 2, slots: ["01:00-01:30", "01:30-02:00", "02:30-03:00"] },
      { dayOfWeek: 4, slots: ["09:00-09:30", "09:30-10:00", "04:00-04:30"] },
    ],
  },
  {
    name: "Dr. Neha Verma",
    email: "neha.verma@example.com",
    password: "Doctor@123",
    specialization: "Pediatrics",
    bio: "Pediatrician providing care for infants, children, and adolescent health needs.",
    experienceYears: 10,
    availability: [
      { dayOfWeek: 1, slots: ["11:00-11:30", "11:30-12:00"] },
      { dayOfWeek: 2, slots: ["09:00-09:30", "10:00-10:30", "10:30-11:00"] },
      { dayOfWeek: 6, slots: ["12:00-12:30", "12:30-01:00", "01:00-01:30"] },
    ],
  },
  {
    name: "Dr. Imran Ali",
    email: "imran.ali@example.com",
    password: "Doctor@123",
    specialization: "Orthopedics",
    bio: "Orthopedic surgeon and consultant for bone, joint, and sports injury care.",
    experienceYears: 14,
    availability: [
      { dayOfWeek: 1, slots: ["02:00-02:30", "02:30-03:00"] },
      { dayOfWeek: 3, slots: ["09:00-09:30", "09:30-10:00", "10:00-10:30"] },
      { dayOfWeek: 5, slots: ["01:00-01:30", "01:30-02:00", "02:00-02:30"] },
    ],
  },
  {
    name: "Dr. Sara Joseph",
    email: "sara.joseph@example.com",
    password: "Doctor@123",
    specialization: "Gynecology",
    bio: "Women’s health specialist for routine checkups, pregnancy care, and preventive screenings.",
    experienceYears: 11,
    availability: [
      { dayOfWeek: 0, slots: ["09:30-10:00", "10:00-10:30"] },
      { dayOfWeek: 2, slots: ["11:00-11:30", "11:30-12:00", "12:00-12:30"] },
      { dayOfWeek: 4, slots: ["03:00-03:30", "03:30-04:00", "04:00-04:30"] },
    ],
  },
];

const upsertDoctor = async (doctorData) => {
  let user = await User.findOne({ email: doctorData.email });

  if (user) {
    user.name = doctorData.name;
    user.password = doctorData.password;
    user.role = "doctor";
    user.isApproved = true;
    await user.save();
  } else {
    user = await User.create({
      name: doctorData.name,
      email: doctorData.email,
      password: doctorData.password,
      role: "doctor",
      isApproved: true,
    });
  }

  await DoctorProfile.findOneAndUpdate(
    { doctor: user._id },
    {
      doctor: user._id,
      specialization: doctorData.specialization,
      bio: doctorData.bio,
      experienceYears: doctorData.experienceYears,
      availability: doctorData.availability,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const run = async () => {
  await connectDB();

  for (const doctor of sampleDoctors) {
    await upsertDoctor(doctor);
    console.log(`Seeded: ${doctor.name}`);
  }

  console.log(`Finished seeding ${sampleDoctors.length} doctors.`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
