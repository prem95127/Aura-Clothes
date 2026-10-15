// Builds the customer's bill as a PDF (no extra package needed).
// Used by the "Delivered" email, which attaches the bill.

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 40;

// character widths of the standard Helvetica fonts for characters 32..126 (used to align and fit text)
const HELV = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const BOLD = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];

const GOLD = [0.83, 0.69, 0.22];
const DARK = [0.09, 0.09, 0.11];
const GREY = [0.38, 0.38, 0.42];
const WHITE = [1, 1, 1];

const METHOD = { upi: "UPI", card: "Card", cod: "Cash on delivery" };
const shortId = (id) => String(id).slice(-6).toUpperCase();
const money = (n) => `Rs. ${Number(n || 0).toFixed(2)}`;

function widthOf(str, size, bold) {
  const table = bold ? BOLD : HELV;
  let w = 0;
  for (const ch of str) {
    const c = ch.charCodeAt(0);
    w += c >= 32 && c <= 126 ? table[c - 32] : 556;
  }
  return (w * size) / 1000;
}

// the standard PDF fonts only know Latin letters, so anything else becomes "?"
function clean(value) {
  return String(value ?? "")
    .replace(/\u20B9/g, "Rs. ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

function esc(str) {
  let out = "";
  for (const ch of str) {
    const c = ch.charCodeAt(0);
    if (ch === "\\" || ch === "(" || ch === ")") out += "\\" + ch;
    else if (c > 126) out += "\\" + c.toString(8).padStart(3, "0");
    else out += ch;
  }
  return out;
}

function fit(value, size, bold, maxW) {
  let s = clean(value);
  if (widthOf(s, size, bold) <= maxW) return s;
  while (s.length > 1 && widthOf(`${s}...`, size, bold) > maxW) s = s.slice(0, -1);
  return `${s}...`;
}

function wrap(value, size, bold, maxW) {
  const words = clean(value).split(" ").filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (widthOf(test, size, bold) <= maxW || !line) line = test;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

class Page {
  constructor() {
    this.ops = [];
  }
  text(value, x, y, { size = 10, bold = false, align = "left", width = 0, color = DARK } = {}) {
    const s = clean(value);
    const w = widthOf(s, size, bold);
    let px = x;
    if (align === "right") px = x + width - w;
    else if (align === "center") px = x + (width - w) / 2;
    this.ops.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${color.join(" ")} rg ${px.toFixed(2)} ${y.toFixed(2)} Td (${esc(s)}) Tj ET`);
  }
  line(x1, y1, x2, y2, width = 0.5, color = [0.85, 0.85, 0.87]) {
    this.ops.push(`${color.join(" ")} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  }
  rect(x, y, w, h, color) {
    this.ops.push(`${color.join(" ")} rg ${x} ${y} ${w} ${h} re f`);
  }
}

const fmtDate = (d) =>
  new Date(d || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const billFileName = (order) => `Bill-${shortId(order._id)}.pdf`;

export function buildBillPdf(order) {
  const pages = [];
  const items = order.items || [];
  const d = order.delivery || {};
  const email = order.notifyEmail || order.customer?.email || "";
  const contentW = PAGE_W - 2 * MARGIN;

  // columns of the items table
  const COL = {
    item: { x: 40, w: 185 },
    size: { x: 232, w: 45 },
    color: { x: 282, w: 70 },
    qty: { x: 358, w: 30 },
    price: { x: 393, w: 70 },
    amount: { x: 470, w: 85 }
  };

  const tableHeader = (page, y) => {
    page.rect(MARGIN, y - 6, contentW, 22, [0.95, 0.95, 0.96]);
    const h = { size: 9, bold: true, color: GREY };
    page.text("ITEM", COL.item.x + 4, y, h);
    page.text("SIZE", COL.size.x, y, h);
    page.text("COLOR", COL.color.x, y, h);
    page.text("QTY", COL.qty.x, y, { ...h, align: "right", width: COL.qty.w });
    page.text("PRICE", COL.price.x, y, { ...h, align: "right", width: COL.price.w });
    page.text("AMOUNT", COL.amount.x, y, { ...h, align: "right", width: COL.amount.w });
  };

  /* ----- first page: header band ----- */
  let page = new Page();
  pages.push(page);
  page.rect(0, PAGE_H - 90, PAGE_W, 90, [0, 0, 0]);
  page.text("Aura & Clothes", MARGIN, PAGE_H - 52, { size: 24, bold: true, color: GOLD });
  page.text("Look . Feel . Royal", MARGIN, PAGE_H - 70, { size: 9, color: [0.7, 0.62, 0.35] });
  page.text("BILL / INVOICE", MARGIN, PAGE_H - 48, { size: 14, bold: true, color: WHITE, align: "right", width: contentW });

  /* ----- billed to / bill details ----- */
  let y = PAGE_H - 125;
  page.text("BILLED TO", MARGIN, y, { size: 8, bold: true, color: GREY });
  page.text("BILL DETAILS", 340, y, { size: 8, bold: true, color: GREY });

  let ly = y - 16;
  page.text(d.name || order.customer?.name || "Customer", MARGIN, ly, { size: 12, bold: true });
  ly -= 15;
  if (email) { page.text(email, MARGIN, ly, { size: 9.5 }); ly -= 13; }
  if (d.phone) { page.text(`Mobile: ${d.phone}`, MARGIN, ly, { size: 9.5 }); ly -= 13; }
  const address = `${d.address || ""}, ${d.city || ""} - ${d.pincode || ""}`;
  for (const line of wrap(address, 9.5, false, 270)) {
    page.text(line, MARGIN, ly, { size: 9.5 });
    ly -= 13;
  }

  const rows = [
    ["Bill no", `#${shortId(order._id)}`],
    ["Order date", fmtDate(order.createdAt)],
    ["Status", order.status || "Placed"],
    ["Payment", `${METHOD[order.paymentMethod] || order.paymentMethod || ""}`],
    ["Payment status", order.paymentStatus || ""]
  ];
  if (order.status === "Delivered") rows.splice(3, 0, ["Delivered on", fmtDate(order.updatedAt)]);
  let ry = y - 16;
  for (const [label, value] of rows) {
    page.text(label, 340, ry, { size: 9.5, color: GREY });
    page.text(value, 420, ry, { size: 9.5, bold: true, align: "right", width: 135 });
    ry -= 15;
  }

  y = Math.min(ly, ry) - 22;

  /* ----- items table ----- */
  tableHeader(page, y);
  y -= 24;

  for (const item of items) {
    if (y < 150) {
      page = new Page();
      pages.push(page);
      y = PAGE_H - 60;
      tableHeader(page, y);
      y -= 24;
    }
    const amount = Number(item.price) * Number(item.quantity);
    const t = { size: 9.5 };
    page.text(fit(item.title, 9.5, false, COL.item.w - 8), COL.item.x + 4, y, t);
    page.text(fit(item.size, 9.5, false, COL.size.w), COL.size.x, y, t);
    page.text(fit(item.color, 9.5, false, COL.color.w), COL.color.x, y, t);
    page.text(String(item.quantity), COL.qty.x, y, { ...t, align: "right", width: COL.qty.w });
    page.text(money(item.price), COL.price.x, y, { ...t, align: "right", width: COL.price.w });
    page.text(money(amount), COL.amount.x, y, { ...t, align: "right", width: COL.amount.w });
    page.line(MARGIN, y - 8, PAGE_W - MARGIN, y - 8);
    y -= 22;
  }

  /* ----- total ----- */
  if (y < 130) {
    page = new Page();
    pages.push(page);
    y = PAGE_H - 70;
  }
  y -= 6;
  page.rect(330, y - 10, PAGE_W - MARGIN - 330, 30, [0, 0, 0]);
  page.text("TOTAL", 340, y, { size: 11, bold: true, color: GOLD });
  page.text(money(order.total), 340, y, { size: 13, bold: true, color: WHITE, align: "right", width: PAGE_W - MARGIN - 340 - 10 });

  y -= 50;
  page.text("Thank you for shopping with Aura & Clothes!", MARGIN, y, { size: 11, bold: true });
  page.text("This is a computer-generated bill and does not need a signature.", MARGIN, y - 15, { size: 8.5, color: GREY });

  pages.forEach((p, i) => {
    p.text(`Page ${i + 1} of ${pages.length}`, MARGIN, 24, { size: 8, color: GREY, align: "center", width: contentW });
  });

  /* ----- assemble the PDF file ----- */
  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pages.map((_, i) => `${5 + i * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
  pages.forEach((p, i) => {
    const pageNo = 5 + i * 2;
    const contentNo = 6 + i * 2;
    const stream = p.ops.join("\n");
    objects[pageNo] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentNo} 0 R >>`;
    objects[contentNo] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let out = "%PDF-1.4\n";
  const offsets = [];
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = out.length;
    out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = out.length;
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i++) out += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  return Buffer.from(out, "latin1");
}
