// Sets (or creates) the admin login directly in the database and tells you exactly what happened.
//
//   npm run reset-admin                              uses ADMIN_EMAIL and ADMIN_PASSWORD from .env
//   npm run reset-admin -- you@gmail.com NewPass123  uses the email and password you type

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const [argEmail, argPassword] = process.argv.slice(2);
const email = (argEmail || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = argPassword || process.env.ADMIN_PASSWORD || "";

function fail(message) {
  console.error(`\nNot changed: ${message}\n`);
  process.exit(1);
}

async function main() {
  if (!process.env.MONGO_URI) fail("MONGO_URI is missing. Make sure the file is named .env and is inside aura-server.");
  if (!EMAIL.test(email)) fail(`"${email}" is not a valid email address. Check ADMIN_EMAIL in .env.`);
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    fail("the password needs at least 8 characters, with a letter and a number.");
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await User.findOne({ role: "admin" });
  const other = await User.findOne({ email, ...(admin ? { _id: { $ne: admin._id } } : {}) });
  if (other) fail(`${email} is already used by another ${other.role} account. Choose a different admin email.`);

  const passwordHash = await bcrypt.hash(password, 10);
  if (admin) {
    admin.email = email;
    admin.passwordHash = passwordHash;
    await admin.save();
    console.log("\nAdmin login UPDATED.");
  } else {
    await User.create({ name: "Admin", email, passwordHash, role: "admin" });
    console.log("\nAdmin account CREATED.");
  }
  console.log(`Admin email: ${email}`);
  console.log("Admin password: the one you just set");
  console.log("Log in at http://localhost:5173/admin/login\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\nFailed:", err.message, "\n");
  process.exit(1);
});
