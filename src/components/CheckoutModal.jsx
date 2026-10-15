import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";
import { api } from "../utils/api.js";

const PAYMENT_LABELS = { upi: "UPI", card: "Credit / Debit card", cod: "Cash on delivery" };

const EMPTY_FORM = {
  fullName: "", phone: "", notifyEmail: "", address: "", city: "", pincode: "",
  payment: "upi",
  upiId: "", cardNumber: "", cardExpiry: "", cardCvv: "", cardName: ""
};

function luhnValid(number) {
  let sum = 0;
  let double = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = Number(number[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

// Returns an object of { fieldName: message } for every invalid field
function validate(form) {
  const v = (name) => form[name].trim();
  const errors = {};

  if (v("fullName").length < 2) errors.fullName = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(v("phone"))) errors.phone = "Enter a valid 10-digit mobile number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("notifyEmail"))) errors.notifyEmail = "Enter the email address for order updates.";
  if (v("address").length < 8) errors.address = "Enter your full delivery address.";
  if (v("city").length < 2) errors.city = "Enter your city.";
  if (!/^\d{6}$/.test(v("pincode"))) errors.pincode = "Enter a valid 6-digit PIN code.";

  if (form.payment === "upi") {
    if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v("upiId"))) errors.upiId = "Enter a valid UPI ID, e.g. name@bank.";
  }

  if (form.payment === "card") {
    const number = v("cardNumber").replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(number) || !luhnValid(number)) errors.cardNumber = "Enter a valid card number.";

    const match = v("cardExpiry").match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
      errors.cardExpiry = "Enter expiry as MM/YY.";
    } else {
      const month = Number(match[1]);
      const year = 2000 + Number(match[2]);
      const now = new Date();
      const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
      if (month < 1 || month > 12) errors.cardExpiry = "Enter a valid month.";
      else if (expired) errors.cardExpiry = "This card has expired.";
    }

    if (!/^\d{3,4}$/.test(v("cardCvv"))) errors.cardCvv = "Enter the 3 or 4 digit CVV.";
    if (v("cardName").length < 2) errors.cardName = "Enter the name on the card.";
  }
  return errors;
}

function Field({ id, label, error, as: Tag = "input", ...props }) {
  return (
    <>
      <label htmlFor={id} className="form-label">{label}</label>
      <Tag id={id} name={id} className="form-control" aria-invalid={error ? "true" : "false"} {...props} />
      <div className="field-msg" id={`${id}-error`}>{error || ""}</div>
    </>
  );
}

export default function CheckoutModal({ show, onHide }) {
  const { user } = useAuth();
  const { cart, total, clearCart } = useCart();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null); // set once an order is placed
  // Each time the dialog opens: show the form again
  useEffect(() => {
    if (!show) return;
    setOrder(null);
    setErrors({});
    setMessage("");
  }, [show]);

  // Whenever a different customer signs in, fill in THEIR name and email
  // (so one customer's details are never reused for the next customer)
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, fullName: user.name, notifyEmail: user.email }));
  }, [user?.email, user?.name]);

  const set = (name) => (event) => setForm((f) => ({ ...f, [name]: event.target.value }));

  // Card fields are formatted as the user types
  const setCardNumber = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 19);
    setForm((f) => ({ ...f, cardNumber: digits.replace(/(.{4})/g, "$1 ").trim() }));
  };
  const setCardExpiry = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
    setForm((f) => ({ ...f, cardExpiry: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Please sign in to place your order.");
      return;
    }
    if (cart.length === 0) return;

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      const placed = await api("/orders", {
        method: "POST",
        body: {
          items: cart.map(({ id, title, size, color, price, quantity }) => ({
            productId: id, title, size, color, price, quantity
          })),
          paymentMethod: form.payment,
          notifyEmail: form.notifyEmail.trim().toLowerCase(),
          delivery: {
            name: form.fullName.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            pincode: form.pincode.trim()
          }
        }
      });
      // Card number, expiry, CVV and UPI ID are deliberately never sent or saved.

      setOrder({
        id: placed.id,
        total: placed.total,
        paymentMethod: PAYMENT_LABELS[form.payment],
        paymentStatus: placed.paymentStatus
      });
      clearCart();
      setForm({ ...EMPTY_FORM, fullName: user.name, notifyEmail: user.email });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const method = form.payment;

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable aria-labelledby="checkoutTitle">
      <Modal.Header closeButton>
        <Modal.Title as="h5" id="checkoutTitle">Checkout</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {order ? (
          <div id="orderSuccess" className="order-success">
            <h3>Order placed</h3>
            <p>Thank you for shopping with Aura &amp; Clothes.</p>
            <dl>
              <dt>Order ID</dt><dd>{order.id}</dd>
              <dt>Total</dt><dd>{formatPrice(order.total)}</dd>
              <dt>Payment</dt><dd>{order.paymentMethod} - {order.paymentStatus}</dd>
            </dl>
            <button type="button" className="btn btn-dark" onClick={onHide}>Continue shopping</button>
          </div>
        ) : (
          <div id="checkoutFormView">
            {!user && (
              <div id="signinNotice" className="notice">
                You need to be signed in to place an order.{" "}
                <Link to="/signin">Sign in</Link> or <Link to="/signup">create an account</Link>.
                Your cart is saved.
              </div>
            )}

            <form id="checkoutForm" onSubmit={handleSubmit} noValidate>
              <h3 className="checkout-heading">Order summary</h3>
              <ul id="checkoutSummary" className="checkout-summary">
                {cart.map((item) => (
                  <li key={item.key}>
                    {item.title} ({item.size}, {item.color}) x {item.quantity}
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="checkout-total">Total <strong id="checkoutTotal">{formatPrice(total)}</strong></div>

              <h3 className="checkout-heading">Delivery details</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <Field id="fullName" label="Full name" type="text" autoComplete="name"
                    value={form.fullName} onChange={set("fullName")} error={errors.fullName} />
                </div>
                <div className="col-md-6">
                  <Field id="phone" label="Mobile number" type="tel" inputMode="numeric" maxLength={10}
                    autoComplete="tel-national" value={form.phone} onChange={set("phone")} error={errors.phone} />
                </div>
                <div className="col-12">
                  <Field id="notifyEmail" label="Email for order updates" type="email" autoComplete="email"
                    value={form.notifyEmail} onChange={set("notifyEmail")} error={errors.notifyEmail} />
                </div>
                <div className="col-12">
                  <Field id="address" label="Address" as="textarea" rows={2} autoComplete="street-address"
                    value={form.address} onChange={set("address")} error={errors.address} />
                </div>
                <div className="col-md-6">
                  <Field id="city" label="City" type="text" autoComplete="address-level2"
                    value={form.city} onChange={set("city")} error={errors.city} />
                </div>
                <div className="col-md-6">
                  <Field id="pincode" label="PIN code" type="text" inputMode="numeric" maxLength={6}
                    autoComplete="postal-code" value={form.pincode} onChange={set("pincode")} error={errors.pincode} />
                </div>
              </div>

              <h3 className="checkout-heading">Payment method</h3>
              <div className="pay-options" role="radiogroup" aria-label="Payment method">
                {[
                  ["upi", "UPI", "Google Pay, PhonePe, Paytm and more"],
                  ["card", "Credit / Debit card", "Visa, Mastercard, RuPay"],
                  ["cod", "Cash on delivery", "Pay when your order arrives"]
                ].map(([value, title, hint]) => (
                  <label className="pay-option" key={value}>
                    <input type="radio" name="payment" value={value} checked={method === value}
                      onChange={set("payment")} />
                    <span><strong>{title}</strong><small>{hint}</small></span>
                  </label>
                ))}
              </div>

              {method === "upi" && (
                <div className="pay-panel">
                  <Field id="upiId" label="UPI ID" type="text" placeholder="name@bank" autoComplete="off"
                    value={form.upiId} onChange={set("upiId")} error={errors.upiId} />
                </div>
              )}

              {method === "card" && (
                <div className="pay-panel">
                  <div className="row g-3">
                    <div className="col-12">
                      <Field id="cardNumber" label="Card number" type="text" inputMode="numeric"
                        autoComplete="cc-number" placeholder="1234 5678 9012 3456"
                        value={form.cardNumber} onChange={setCardNumber} error={errors.cardNumber} />
                    </div>
                    <div className="col-6">
                      <Field id="cardExpiry" label="Expiry (MM/YY)" type="text" inputMode="numeric"
                        autoComplete="cc-exp" placeholder="MM/YY"
                        value={form.cardExpiry} onChange={setCardExpiry} error={errors.cardExpiry} />
                    </div>
                    <div className="col-6">
                      <Field id="cardCvv" label="CVV" type="password" inputMode="numeric" maxLength={4}
                        autoComplete="cc-csc" value={form.cardCvv} onChange={set("cardCvv")} error={errors.cardCvv} />
                    </div>
                    <div className="col-12">
                      <Field id="cardName" label="Name on card" type="text" autoComplete="cc-name"
                        value={form.cardName} onChange={set("cardName")} error={errors.cardName} />
                    </div>
                  </div>
                </div>
              )}

              <p className="demo-note">Demo checkout: no real payment is taken and card details are never saved.</p>
              <div id="checkoutMessage" className="field-msg" role="alert">{message}</div>
              <button type="submit" id="placeOrderBtn" className="btn btn-dark w-100" disabled={busy}>
                {busy ? (method === "cod" ? "Placing order..." : "Processing payment...") : "Place order"}
              </button>
            </form>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
