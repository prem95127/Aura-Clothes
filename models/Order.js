import mongoose from "mongoose";

export const STATUSES = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // copy of the customer's details at order time, so the admin page can show them directly
    customer: { name: String, email: String },
    // the email address the customer typed at checkout: order emails and the bill are sent here
    notifyEmail: { type: String, lowercase: true, trim: true },
    items: [
      { productId: Number, title: String, size: String, color: String, price: Number, quantity: Number }
    ],
    total: Number,
    paymentMethod: String,
    paymentStatus: String,
    delivery: { name: String, phone: String, address: String, city: String, pincode: String },
    status: { type: String, enum: STATUSES, default: "Placed" },
    // record of the emails sent to the customer (shown on the admin page)
    notifyLog: [
      { status: String, channel: String, ok: Boolean, to: String, error: String, at: { type: Date, default: Date.now } }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
