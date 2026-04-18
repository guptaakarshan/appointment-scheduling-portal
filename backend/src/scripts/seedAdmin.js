const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const run = async () => {
  await connectDB();

  const name = process.env.ADMIN_NAME || "Portal Admin";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this script.");
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  await User.create({
    name,
    email,
    password,
    role: "admin",
    isApproved: true,
  });

  console.log("Admin user created successfully:", email);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
