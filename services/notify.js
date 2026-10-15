// Sends the customer an email when their order changes status.
// Email is optional: it turns on only when SMTP_USER and SMTP_PASS exist in .env.
// A failed message never stops an order, it is only logged (and shown on the admin page).

import nodemailer from "nodemailer";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { buildBillPdf, billFileName } from "./bill.js";

/* ---------- settings ---------- */

const STORE = "Aura & Clothes";

// Which statuses send a message (change NOTIFY_STATUSES in .env)
function statuses() {
  const raw = process.env.NOTIFY_STATUSES || "Placed,Shipped,Delivered,Cancelled";
  return new Set(raw.split(",").map((s) => s.trim()).filter(Boolean));
}

const shortId = (id) => `#${String(id).slice(-6).toUpperCase()}`;
const money = (n) => `Rs. ${Number(n).toFixed(2)}`;
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- message text ---------- */

const MESSAGES = {
  Placed: {
    subject: (id) => `We received your order ${id}`,
    headline: "Thank you for your order!",
    line: "We have received your order. Our team will confirm it shortly.",
  },
  Confirmed: {
    subject: (id) => `Your order ${id} is confirmed`,
    headline: "Your order is confirmed",
    line: "We are getting your order ready.",
  },
  Shipped: {
    subject: (id) => `Your order ${id} is on its way`,
    headline: "Your order has been shipped",
    line: "Your order is on its way to you.",
  },
  Delivered: {
    subject: (id) => `Your order ${id} was delivered`,
    headline: "Your order was delivered",
    line: "Your order has been delivered successfully. Your bill is attached to this email, and you can print it. We hope you love it!",
  },
  Cancelled: {
    subject: (id) => `Your order ${id} was cancelled`,
    headline: "Your order was cancelled",
    line: "Your order has been cancelled. If you did not ask for this, please contact us.",
  }
};

function buildEmail(order, status) {
  const msg = MESSAGES[status];
  const id = shortId(order._id);
  const name = order.delivery?.name || order.customer?.name || "there";
  const items = order.items || [];
  const d = order.delivery || {};

  const text = [
    `Hi ${name},`,
    "",
    msg.headline,
    msg.line,
    "",
    `Order: ${id}`,
    ...items.map((i) => `- ${i.title} (${i.size}, ${i.color}) x ${i.quantity}  ${money(i.price * i.quantity)}`),
    `Total: ${money(order.total)}`,
    `Payment: ${order.paymentMethod} - ${order.paymentStatus}`,
    "",
    `Delivery address: ${d.name}, ${d.address}, ${d.city} - ${d.pincode}`,
    "",
    `Thank you for shopping with ${STORE}.`
  ].join("\n");

  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${esc(i.title)} (${esc(i.size)}, ${esc(i.color)}) &times; ${esc(i.quantity)}</td>` +
        `<td style="padding:6px 0;text-align:right">${money(i.price * i.quantity)}</td></tr>`
    )
    .join("");

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#18181b">
    <div style="background:#000;color:#d4af37;padding:18px;text-align:center;font-size:20px;letter-spacing:1px">${esc(STORE)}</div>
    <div style="padding:20px;border:1px solid #e4e4e7;border-top:0">
      <h2 style="margin:0 0 6px">${esc(msg.headline)}</h2>
      <p style="margin:0 0 16px;color:#52525b">Hi ${esc(name)}, ${esc(msg.line)}</p>
      <p style="margin:0 0 8px"><strong>Order ${esc(id)}</strong></p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
        <tr><td style="padding-top:10px;border-top:1px solid #e4e4e7"><strong>Total</strong></td>
            <td style="padding-top:10px;border-top:1px solid #e4e4e7;text-align:right"><strong>${money(order.total)}</strong></td></tr>
      </table>
      <p style="font-size:14px;color:#52525b;margin:16px 0 0">
        Payment: ${esc(order.paymentMethod)} - ${esc(order.paymentStatus)}<br>
        Delivery address: ${esc(d.name)}, ${esc(d.address)}, ${esc(d.city)} - ${esc(d.pincode)}
      </p>
    </div>
  </div>`;

  return { subject: `${STORE}: ${msg.subject(id)}`, text, html };
}

/* ---------- email (Nodemailer, works with a free Gmail app password) ---------- */

let transporter; // undefined = not created yet, null = email is off

function getTransporter() {
  if (transporter !== undefined) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    transporter = null;
    return null;
  }
  const port = Number(process.env.SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000,
    socketTimeout: 15000
  });
  return transporter;
}

// Uses MAIL_FROM, unless it is empty or still the example text from .env.example
function fromAddress() {
  const from = (process.env.MAIL_FROM || "").trim();
  if (!from || /your-gmail|yourname@|example\.com/i.test(from)) return `${STORE} <${process.env.SMTP_USER}>`;
  return from;
}

async function sendEmail(order, status) {
  const t = getTransporter();
  if (!t) return null; // null = email is off
  const to = order.notifyEmail || order.customer?.email;
  if (!to) throw new Error("This order has no customer email address.");
  const { subject, text, html } = buildEmail(order, status);

  // the Delivered email carries the bill as a PDF the customer can print
  const attachments = [];
  if (status === "Delivered") {
    try {
      attachments.push({ filename: billFileName(order), content: buildBillPdf(order), contentType: "application/pdf" });
    } catch (err) {
      console.error(`Could not create the bill for ${shortId(order._id)}:`, err.message);
    }
  }

  await t.sendMail({ from: fromAddress(), to, subject, text, html, attachments });
  console.log(`Email sent to ${to} for ${shortId(order._id)} (${status})`);
  return to; // the address, so it can be saved in the order's log
}

// Used by the "Test email" button on the admin page. Throws the real error if sending fails.
export async function sendTestEmail(to) {
  const t = getTransporter();
  if (!t) throw new Error("Email is OFF. Set SMTP_USER and SMTP_PASS in .env and restart the server.");
  const info = await t.sendMail({
    from: fromAddress(),
    to,
    subject: `${STORE}: test email`,
    text: `This is a test email from the ${STORE} admin page. If you can read it, order emails will work.`
  });
  const accepted = (info.accepted || []).length;
  if (!accepted) throw new Error(`The mail server did not accept ${to}.`);
  return true;
}

/* ---------- public functions ---------- */

// Call this after an order is placed or its status changes. It never throws.
export async function notifyCustomer(order, status) {
  try {
    if (!MESSAGES[status] || !statuses().has(status)) return;

    // orders made before the customer details were saved on the order: use the user's account
    if (!order.notifyEmail && !order.customer?.email && order.user) {
      const user = await User.findById(order.user).select("name email");
      if (user) {
        const plain = typeof order.toObject === "function" ? order.toObject() : order;
        order = { ...plain, customer: { name: user.name, email: user.email } };
      }
    }

    const entries = [];
    const attempt = async (channel, send) => {
      try {
        const sent = await send(order, status);
        if (sent) entries.push({ status, channel, ok: true, to: typeof sent === "string" ? sent : undefined, at: new Date() });
      } catch (err) {
        console.error(`${channel} notification failed for ${shortId(order._id)}:`, err.message);
        entries.push({
          status, channel, ok: false, to: order.notifyEmail || order.customer?.email,
          error: String(err.message).slice(0, 200), at: new Date()
        });
      }
    };

    await attempt("Email", sendEmail);

    if (entries.length > 0) {
      await Order.updateOne({ _id: order._id }, { $push: { notifyLog: { $each: entries } } });
    }
  } catch (err) {
    console.error("Notification error:", err.message);
  }
}

// One line for the server console at startup
export async function describeNotifications() {
  const t = getTransporter();
  let email = "OFF (set SMTP_USER and SMTP_PASS to turn on)";
  if (t) {
    try {
      await t.verify();
      email = `ON (${process.env.SMTP_USER})`;
    } catch (err) {
      email = `ERROR - ${err.message}`;
    }
  }
  return `Notifications -> email: ${email} | sent for: ${[...statuses()].join(", ")}`;
}
