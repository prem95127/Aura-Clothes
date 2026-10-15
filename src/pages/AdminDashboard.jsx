import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../utils/api.js";
import { formatPrice } from "../utils/format.js";
import { printBill } from "../utils/bill.js";

const POLL_MS = 5000; // the page asks the server for new orders every 5 seconds

const TABS = ["All", "Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];
const TAB_LABEL = {
  All: "All", Placed: "New", Confirmed: "Confirmed", Shipped: "Shipped",
  Delivered: "Delivered", Cancelled: "Cancelled"
};

// Buttons shown for each status (the server enforces the same order)
const ACTIONS = {
  Placed: [
    { to: "Confirmed", label: "Confirm order", kind: "primary" },
    { to: "Cancelled", label: "Cancel", kind: "danger" }
  ],
  Confirmed: [
    { to: "Shipped", label: "Mark as shipped", kind: "primary" },
    { to: "Cancelled", label: "Cancel", kind: "danger" }
  ],
  Shipped: [{ to: "Delivered", label: "Mark as delivered", kind: "primary" }],
  Delivered: [],
  Cancelled: []
};

const PAYMENT_LABEL = { upi: "UPI", card: "Card", cod: "Cash on delivery" };

const shortId = (id) => `#${String(id).slice(-6).toUpperCase()}`;

// A short beep when a new order arrives (browsers allow it after the admin has clicked once)
function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => ctx.close();
  } catch {
    /* sound is optional */
  }
}

export default function AdminDashboard() {
  const { admin, signOutAdmin } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("All");
  const [toasts, setToasts] = useState([]);
  const [freshIds, setFreshIds] = useState(() => new Set());
  const [sound, setSound] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const knownIds = useRef(null); // ids we have already seen (null until the first load)
  const soundRef = useRef(true);
  soundRef.current = sound;

  const load = useCallback(async () => {
    try {
      const list = await api("/admin/orders", { auth: "admin" });
      setError("");

      if (knownIds.current === null) {
        // first load: everything already there is not "new"
        knownIds.current = new Set(list.map((o) => o._id));
      } else {
        const fresh = list.filter((o) => !knownIds.current.has(o._id));
        if (fresh.length > 0) {
          fresh.forEach((o) => knownIds.current.add(o._id));
          setFreshIds((prev) => new Set([...prev, ...fresh.map((o) => o._id)]));

          const newToasts = fresh.map((o) => ({
            key: o._id,
            text: `New order ${shortId(o._id)} from ${o.customer?.name || o.delivery?.name || "a customer"} - ${formatPrice(o.total)}`
          }));
          setToasts((prev) => [...newToasts, ...prev].slice(0, 4));
          newToasts.forEach((t) => {
            setTimeout(() => setToasts((prev) => prev.filter((x) => x.key !== t.key)), 9000);
          });
          if (soundRef.current) beep();
        }
      }

      setOrders(list);
      setUpdatedAt(new Date());
      setLoading(false);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        signOutAdmin();
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(err.message);
      setLoading(false);
    }
  }, [signOutAdmin, navigate]);

  // Load now, then keep checking for new orders
  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const stats = useMemo(() => {
    const count = (status) => orders.filter((o) => o.status === status).length;
    return {
      total: orders.length,
      placed: count("Placed"),
      active: count("Confirmed") + count("Shipped"),
      delivered: count("Delivered"),
      revenue: orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0)
    };
  }, [orders]);

  // Show the number of new orders in the browser tab title
  useEffect(() => {
    document.title = stats.placed > 0 ? `(${stats.placed}) New orders | Admin` : "Orders | Admin";
    return () => { document.title = "Aura & Clothes"; };
  }, [stats.placed]);

  const visible = tab === "All" ? orders : orders.filter((o) => o.status === tab);
  const countFor = (name) => (name === "All" ? orders.length : orders.filter((o) => o.status === name).length);

  const updateStatus = async (order, to) => {
    if (to === "Cancelled" && !window.confirm(`Cancel order ${shortId(order._id)}?`)) return;
    setBusyId(order._id);
    setError("");
    try {
      const updated = await api(`/admin/orders/${order._id}/status`, {
        method: "PATCH",
        body: { status: to },
        auth: "admin"
      });
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      setFreshIds((prev) => {
        const next = new Set(prev);
        next.delete(order._id);
        return next;
      });
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        signOutAdmin();
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(err.message);
      load(); // the order may have changed, so refresh the list
    } finally {
      setBusyId("");
    }
  };

  // Sends a test email, so you can see if email works and the real reason when it does not
  const sendTestEmail = async () => {
    const to = window.prompt("Send a test email to which address?", admin?.email || "");
    if (!to) return;
    setError("");
    try {
      const result = await api("/admin/test-email", { method: "POST", body: { to: to.trim() }, auth: "admin" });
      const key = `test-${Date.now()}`;
      setToasts((prev) => [{ key, text: result.message }, ...prev].slice(0, 4));
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.key !== key)), 9000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrint = (order) => {
    if (!printBill(order)) setError("The browser blocked the bill. Allow pop-ups for this site, then click Print bill again.");
  };

  const handleSignOut = () => {
    signOutAdmin();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-brand">
          <img src="/image/logo.png" alt="" />
          <span>Aura &amp; <span>Clothes</span> <small>Admin</small></span>
        </div>
        <div className="admin-header-actions">
          <span className="admin-bell" title="New orders waiting">
            <i className="fa-solid fa-bell" aria-hidden="true"></i>
            {stats.placed > 0 && <span className="admin-bell-count">{stats.placed}</span>}
          </span>
          <Link to="/" className="admin-btn ghost">View store</Link>
          <button type="button" className="admin-btn ghost" onClick={handleSignOut}>Sign out</button>
        </div>
      </header>

      {/* Pop-up notifications for new orders */}
      <div className="admin-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div className="admin-toast" key={t.key}>
            <i className="fa-solid fa-bag-shopping" aria-hidden="true"></i>
            <span>{t.text}</span>
            <button type="button" aria-label="Dismiss"
              onClick={() => setToasts((prev) => prev.filter((x) => x.key !== t.key))}>&times;</button>
          </div>
        ))}
      </div>

      <main className="admin-main">
        <div className="admin-title-row">
          <div>
            <h1>Orders</h1>
            <p className="admin-sub">
              Signed in as {admin?.email}
              {updatedAt && <> &middot; updated {updatedAt.toLocaleTimeString()}</>}
            </p>
          </div>
          <div className="admin-title-actions">
            <label className="admin-switch">
              <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
              Sound alert
            </label>
            <button type="button" className="admin-btn" onClick={sendTestEmail}>Test email</button>
            <button type="button" className="admin-btn" onClick={load}>Refresh</button>
          </div>
        </div>

        {error && <div className="admin-error" role="alert">{error}</div>}

        <section className="admin-stats" aria-label="Summary">
          <div className="stat"><span>Total orders</span><strong>{stats.total}</strong></div>
          <div className="stat highlight"><span>New</span><strong>{stats.placed}</strong></div>
          <div className="stat"><span>In progress</span><strong>{stats.active}</strong></div>
          <div className="stat"><span>Delivered</span><strong>{stats.delivered}</strong></div>
          <div className="stat"><span>Revenue</span><strong>{formatPrice(stats.revenue)}</strong></div>
        </section>

        <nav className="admin-tabs" aria-label="Order status">
          {TABS.map((name) => (
            <button key={name} type="button" aria-pressed={tab === name} onClick={() => setTab(name)}>
              {TAB_LABEL[name]} <span>{countFor(name)}</span>
            </button>
          ))}
        </nav>

        {loading ? (
          <p className="admin-empty">Loading orders...</p>
        ) : visible.length === 0 ? (
          <p className="admin-empty">
            {orders.length === 0 ? "No orders yet. New orders will appear here automatically." : "No orders in this group."}
          </p>
        ) : (
          <ul className="order-list">
            {visible.map((o) => (
              <li key={o._id} className={`order-card${freshIds.has(o._id) ? " is-new" : ""}`}>
                <div className="order-top">
                  <div>
                    <strong className="order-id">{shortId(o._id)}</strong>
                    {freshIds.has(o._id) && <span className="new-pill">NEW</span>}
                    <div className="order-date">{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <span className={`status-badge status-${o.status}`}>{TAB_LABEL[o.status] || o.status}</span>
                </div>

                <div className="order-grid">
                  <div>
                    <h3>Customer</h3>
                    <p>{o.customer?.name || o.delivery?.name}</p>
                    <p className="muted">{o.customer?.email}</p>
                    <p className="muted">Order emails go to: <strong>{o.notifyEmail || o.customer?.email || "no email"}</strong></p>
                    <p className="muted">{o.delivery?.phone}</p>
                  </div>
                  <div>
                    <h3>Deliver to</h3>
                    <p>{o.delivery?.name}</p>
                    <p className="muted">
                      {o.delivery?.address}, {o.delivery?.city} - {o.delivery?.pincode}
                    </p>
                  </div>
                  <div>
                    <h3>Payment</h3>
                    <p>{PAYMENT_LABEL[o.paymentMethod] || o.paymentMethod}</p>
                    <p className="muted">{o.paymentStatus}</p>
                  </div>
                </div>

                <ul className="order-items">
                  {(o.items || []).map((item, i) => (
                    <li key={i}>
                      <span>{item.title} ({item.size}, {item.color}) &times; {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>

                {(o.notifyLog || []).length > 0 && (
                  <div className="notify-row">
                    <span>Customer notified:</span>
                    {o.notifyLog.slice(-6).map((n, i) => (
                      <span key={i} className={`notify-chip ${n.ok ? "ok" : "fail"}`} title={`${n.to ? "To: " + n.to + ". " : ""}${n.error || ""}`}>
                        {n.channel} &middot; {TAB_LABEL[n.status] || n.status} &middot; {n.ok ? "sent" : "failed"}
                      </span>
                    ))}
                  </div>
                )}

                <div className="order-bottom">
                  <div className="order-total">Total <strong>{formatPrice(o.total)}</strong></div>
                  <div className="order-actions">
                    {o.status !== "Cancelled" && (
                      <button type="button" className="admin-btn" onClick={() => handlePrint(o)}>Print bill</button>
                    )}
                    {(ACTIONS[o.status] || []).map((action) => (
                      <button
                        key={action.to}
                        type="button"
                        className={`admin-btn ${action.kind}`}
                        disabled={busyId === o._id}
                        onClick={() => updateStatus(o, action.to)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
