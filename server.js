import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import User from "./models/User.js";
import { describeNotifications } from "./services/notify.js";

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Missing MONGO_URI or JWT_SECRET. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Any unexpected error returns a clean JSON message
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error. Please try again." });
});

// Creates the admin account from .env, and keeps it in sync when you change .env
async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set in .env, so no admin account was created.");
    return;
  }
  if (password.length < 8) {
    console.warn("ADMIN_PASSWORD must be at least 8 characters, so the admin account was not changed.");
    return;
  }

  const admin = await User.findOne({ role: "admin" });

  // no admin yet: create one
  if (!admin) {
    if (await User.findOne({ email })) {
      console.warn(`${email} is already a customer account. Use a different ADMIN_EMAIL.`);
      return;
    }
    await User.create({
      name: "Admin",
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "admin"
    });
    console.log(`Admin account created for ${email}`);
    return;
  }

  // admin exists: update the email / password if .env now says something different
  if (await User.findOne({ email, _id: { $ne: admin._id } })) {
    console.warn(`${email} is already used by another account. Use a different ADMIN_EMAIL.`);
    return;
  }
  const samePassword = await bcrypt.compare(password, admin.passwordHash);
  if (admin.email !== email || !samePassword) {
    admin.email = email;
    admin.passwordHash = await bcrypt.hash(password, 10);
    await admin.save();
    console.log(`Admin login updated for ${email}`);
  }
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await ensureAdmin();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
    describeNotifications().then(console.log); // shows whether email is switched on
  })
  .catch((err) => {
    console.error("Startup failed:", err.message);
    process.exit(1);
  });
