import { Router } from "express";
import mongoose from "mongoose";
import { requireAdmin } from "../middleware/requireAuth.js";
import Order, { STATUSES } from "../models/Order.js";
import { notifyCustomer, sendTestEmail } from "../services/notify.js";

const router = Router();
router.use(requireAdmin);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Which status can follow which (the admin moves an order forward step by step)
const NEXT = {
  Placed: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: []
};

// All orders, newest first. The admin page asks for this every few seconds to spot new orders.
router.get("/orders", async (req, res, next) => {
  try {
    res.json(await Order.find().sort({ createdAt: -1 }).limit(300));
  } catch (err) {
    next(err);
  }
});

// Move an order to its next status
router.patch("/orders/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid order id." });
    if (!STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status." });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (!NEXT[order.status].includes(status)) {
      return res.status(409).json({ message: `An order that is ${order.status} cannot become ${status}.` });
    }
    order.status = status;
    await order.save();
    res.json(order);

    // tell the customer (by email) about the new status
    notifyCustomer(order, status);
  } catch (err) {
    next(err);
  }
});

// Sends a test email so the admin can see whether email really works (and why not)
router.post("/test-email", async (req, res) => {
  const to = String(req.body?.to || "").trim();
  if (!EMAIL.test(to)) return res.status(400).json({ message: "Enter a valid email address." });
  try {
    await sendTestEmail(to);
    res.json({ message: `Test email sent to ${to}. Check the inbox and the Spam folder.` });
  } catch (err) {
    console.error("Test email failed:", err.message);
    res.status(502).json({ message: `Email failed: ${err.message}` });
  }
});

export default router;
