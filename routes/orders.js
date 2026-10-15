import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { notifyCustomer } from "../services/notify.js";

const router = Router();
const METHODS = ["upi", "card", "cod"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A customer places an order. It is saved with status "Placed" and shows up on the admin page.
router.post("/", requireAuth, async (req, res, next) => {
  try {
    if (req.role !== "customer") {
      return res.status(403).json({ message: "Please sign in with a customer account to place an order." });
    }

    const { items, paymentMethod, delivery } = req.body;
    if (!Array.isArray(items) || items.length === 0 || items.length > 50 ||
        !delivery || !METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: "Your order is incomplete." });
    }

    const cleanItems = items.map((i) => ({
      productId: Number(i.productId),
      title: String(i.title || "").slice(0, 100),
      size: String(i.size || "").slice(0, 10),
      color: String(i.color || "").slice(0, 30),
      price: Number(i.price),
      quantity: Math.floor(Number(i.quantity))
    }));
    const bad = cleanItems.some(
      (i) => !(i.price >= 0) || !(i.quantity >= 1 && i.quantity <= 50) || !i.title
    );
    if (bad) return res.status(400).json({ message: "Your order has an invalid item." });

    // Total is worked out here, not trusted from the browser
    const total = cleanItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "Please sign in again." });

    // order emails go to the address typed at checkout (it is filled in with the account email)
    const typed = String(req.body.notifyEmail || "").trim().toLowerCase();
    if (typed && !EMAIL.test(typed)) {
      return res.status(400).json({ message: "Enter a valid email address for order updates." });
    }
    const notifyEmail = typed || user.email;

    const order = await Order.create({
      user: user._id,
      customer: { name: user.name, email: user.email },
      notifyEmail,
      items: cleanItems,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "Pay on delivery" : "Paid (demo)",
      delivery: {
        name: String(delivery.name || "").slice(0, 100),
        phone: String(delivery.phone || "").slice(0, 15),
        address: String(delivery.address || "").slice(0, 300),
        city: String(delivery.city || "").slice(0, 80),
        pincode: String(delivery.pincode || "").slice(0, 10)
      }
    });
    res.status(201).json({ id: order._id, total: order.total, paymentStatus: order.paymentStatus });

    // email to the customer; runs after the reply so the customer never waits for it
    notifyCustomer(order, "Placed");
  } catch (err) {
    next(err);
  }
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    res.json(await Order.find({ user: req.userId }).sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
});

export default router;
