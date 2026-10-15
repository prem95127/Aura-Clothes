import Offcanvas from "react-bootstrap/Offcanvas";
import { useCart } from "../context/CartContext.jsx";
import { COLOR_HEX } from "../data/products.js";
import { formatPrice } from "../utils/format.js";
import SafeImg from "./SafeImg.jsx";

export default function CartDrawer({ show, onHide, onCheckout }) {
  const { cart, total, changeQuantity, removeFromCart } = useCart();

  return (
    <Offcanvas show={show} onHide={onHide} placement="start" scroll id="cartDrawer"
      aria-labelledby="cartDrawerLabel">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title id="cartDrawerLabel">Your cart</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="custom-scrollbar">
        <section className="cart">
          <h2>Shopping Cart</h2>
          <ul className="cart-items" id="cartItems">
            {cart.map((item) => (
              <li className="cart-item" key={item.key}>
                <div className="item-details">
                  <SafeImg src={item.img_path} alt={item.title} className="cart-item-image" />
                  <div className="item-info">
                    <span className="item-name">{item.title}</span>
                    <span className="item-meta">
                      Size {item.size} &middot;
                      <span className="dot" style={{ background: COLOR_HEX[item.color] || "#999" }}></span>
                      {item.color}
                    </span>
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button type="button" className="quantity-btn" aria-label="Decrease quantity"
                          onClick={() => changeQuantity(item.key, -1)}>-</button>
                        <span className="quantity">{item.quantity}</span>
                        <button type="button" className="quantity-btn" aria-label="Increase quantity"
                          onClick={() => changeQuantity(item.key, 1)}>+</button>
                      </div>
                      <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
                <button type="button" className="remove-item" onClick={() => removeFromCart(item.key)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="total" id="total">Total: {formatPrice(total)}</div>
          {cart.length === 0 && <p className="empty-cart" id="emptyCart">Your cart is empty.</p>}
        </section>

        <button type="button" id="checkoutBtn" className="btn btn-dark w-100 mt-3"
          disabled={cart.length === 0} onClick={onCheckout}>
          Proceed to checkout
        </button>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
