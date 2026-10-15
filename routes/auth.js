import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// the token carries the role, so the server can tell customers and admins apart
const sign = (user, expiresIn = "7d") =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn });

const publicUser = (user) => ({ name: user.name, email: user.email, role: user.role });

// Customer sign up (always creates a "customer")
router.post("/signup", async (req, res, next) => {
  try {
    const { name = "", email = "", password = "" } = req.body;
    if (name.trim().length < 2 || !EMAIL.test(email) ||
        password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ message: "Please check your details." });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: "An account with this email already exists. Try signing in." });
    }
    const user = await User.create({
      name: name.trim(),
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "customer"
    });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// Customer login
router.post("/login", async (req, res, next) => {
  try {
    const { email = "", password = "" } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) return res.status(401).json({ message: "Incorrect email or password." });
    if (user.role !== "customer") {
      return res.status(403).json({ message: "This is an admin account. Please use the admin login page." });
    }
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// Admin login (customers cannot use it)
router.post("/admin-login", async (req, res, next) => {
  try {
    const { email = "", password = "" } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    const ok = user && user.role === "admin" && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) return res.status(401).json({ message: "Incorrect admin email or password." });
    res.json({ token: sign(user, "12h"), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;
