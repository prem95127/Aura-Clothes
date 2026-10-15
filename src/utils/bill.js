// Printable bill for the admin page ("Print bill" button). It looks like the PDF attached to the Delivered email.
import { formatPrice } from "./format.js";

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const METHOD = { upi: "UPI", card: "Card", cod: "Cash on delivery" };
const shortId = (id) => `#${String(id).slice(-6).toUpperCase()}`;
const fmtDate = (d) =>
  new Date(d || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function billHtml(order) {
  const d = order.delivery || {};
  const email = order.notifyEmail || order.customer?.email || "";
  const items = order.items || [];

  const rows = items
    .map(
      (i) => `<tr>
        <td>${esc(i.title)}</td><td>${esc(i.size)}</td><td>${esc(i.color)}</td>
        <td class="r">${esc(i.quantity)}</td>
        <td class="r">${formatPrice(i.price)}</td>
        <td class="r">${formatPrice(i.price * i.quantity)}</td>
      </tr>`
    )
    .join("");

  const details = [
    ["Bill no", shortId(order._id)],
    ["Order date", fmtDate(order.createdAt)],
    ["Status", order.status || "Placed"],
    ...(order.status === "Delivered" ? [["Delivered on", fmtDate(order.updatedAt)]] : []),
    ["Payment", METHOD[order.paymentMethod] || order.paymentMethod || ""],
    ["Payment status", order.paymentStatus || ""]
  ]
    .map(([k, v]) => `<div class="kv"><span>${esc(k)}</span><b>${esc(v)}</b></div>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Bill ${esc(shortId(order._id))} - Aura &amp; Clothes</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #18181b; font-size: 13px;
         -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { max-width: 760px; margin: 0 auto; }
  .head { background: #000; color: #fff; padding: 22px 26px; display: flex; justify-content: space-between; align-items: center; }
  .head h1 { margin: 0; color: #d4af37; font-size: 28px; }
  .head small { color: #b8a15a; }
  .head h2 { margin: 0; font-size: 16px; letter-spacing: 1px; }
  .info { display: flex; justify-content: space-between; gap: 24px; padding: 22px 4px; }
  .info h3 { margin: 0 0 6px; font-size: 10px; letter-spacing: 1px; color: #62626b; }
  .info p { margin: 2px 0; }
  .kv { display: flex; justify-content: space-between; gap: 24px; margin: 2px 0; min-width: 240px; }
  .kv span { color: #62626b; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f2f2f4; text-align: left; font-size: 10px; letter-spacing: 1px; color: #62626b; padding: 8px; }
  td { padding: 8px; border-bottom: 1px solid #e4e4e7; }
  .r { text-align: right; }
  .total { margin: 14px 0 0 auto; width: 300px; background: #000; color: #fff; padding: 10px 14px;
           display: flex; justify-content: space-between; align-items: center; }
  .total span { color: #d4af37; font-weight: bold; }
  .total b { font-size: 18px; }
  .thanks { margin-top: 28px; font-weight: bold; }
  .note { color: #62626b; font-size: 11px; margin-top: 4px; }
  .actions { text-align: center; padding: 14px; }
  .actions button { padding: 8px 18px; font-size: 14px; cursor: pointer; }
  @media print { .actions { display: none; } }
</style></head>
<body onload="setTimeout(function () { window.print(); }, 300)">
  <div class="actions"><button type="button" onclick="window.print()">Print</button></div>
  <div class="sheet">
    <div class="head">
      <div><h1>Aura &amp; Clothes</h1><small>Look &middot; Feel &middot; Royal</small></div>
      <h2>BILL / INVOICE</h2>
    </div>
    <div class="info">
      <div>
        <h3>BILLED TO</h3>
        <p><b>${esc(d.name || order.customer?.name || "Customer")}</b></p>
        ${email ? `<p>${esc(email)}</p>` : ""}
        ${d.phone ? `<p>Mobile: ${esc(d.phone)}</p>` : ""}
        <p>${esc(d.address)}, ${esc(d.city)} - ${esc(d.pincode)}</p>
      </div>
      <div><h3>BILL DETAILS</h3>${details}</div>
    </div>
    <table>
      <thead><tr><th>ITEM</th><th>SIZE</th><th>COLOR</th><th class="r">QTY</th><th class="r">PRICE</th><th class="r">AMOUNT</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="total"><span>TOTAL</span><b>${formatPrice(order.total || 0)}</b></div>
    <p class="thanks">Thank you for shopping with Aura &amp; Clothes!</p>
    <p class="note">This is a computer-generated bill and does not need a signature.</p>
  </div>
</body></html>`;
}

// Opens the bill in a new tab and starts printing. Returns false if the browser blocked the new tab.
export function printBill(order) {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(billHtml(order));
  w.document.close();
  return true;
}
