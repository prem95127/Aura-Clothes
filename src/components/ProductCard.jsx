import { useState, useRef, useEffect } from "react";
import { CATEGORY_CONFIG, SIZE_LISTS, COLOR_HEX } from "../data/products.js";
import { useCart } from "../context/CartContext.jsx";
import SafeImg from "./SafeImg.jsx";

export default function ProductCard({ item }) {
  const { addToCart } = useCart();
  const config = CATEGORY_CONFIG[item.category];
  const sizes = SIZE_LISTS[config.sizes];
  const sizeLabel = config.sizes === "bottom" ? "Waist size" : "Size";

  const [size, setSize] = useState("");
  const [color, setColor] = useState(config.colors[0]);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleAdd = () => {
    if (!size) {
      setError("Please select a size.");
      return;
    }
    setError("");
    addToCart(item.id, size, color);

    // brief confirmation on the button
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="product-card-wrapper">
      <div className="product-card" data-id={item.id}>
        <div className="product-badge">{item.category}</div>
        <div className="product-tilt-effect">
          <div className="product-image">
            <SafeImg src={item.img_path} alt={item.title} loading="lazy" />
          </div>
        </div>

        <div className="product-info">
          <div className="product-category">Menswear</div>
          <h2 className="product-title">{item.title}</h2>
          <div className="product-description"><p>{config.text}</p></div>

          <div className="option-group">
            <div className="option-label">{sizeLabel}</div>
            <div className="size-options" role="radiogroup" aria-label={sizeLabel}>
              {sizes.map((s) => (
                <label className="chip" key={s}>
                  <input
                    type="radio"
                    name={`size-${item.id}`}
                    value={s}
                    checked={size === s}
                    onChange={() => { setSize(s); setError(""); }}
                  />
                  <span className="chip-size">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="option-group">
            <div className="option-label">Color</div>
            <div className="color-options" role="radiogroup" aria-label="Color">
              {config.colors.map((c) => (
                <label className="chip" title={c} key={c}>
                  <input
                    type="radio"
                    name={`color-${item.id}`}
                    value={c}
                    checked={color === c}
                    onChange={() => setColor(c)}
                    aria-label={c}
                  />
                  <span className="chip-color" style={{ background: COLOR_HEX[c] }}></span>
                </label>
              ))}
            </div>
          </div>
          <div className="card-error" role="alert">{error}</div>

          <div className="product-features">
            <span className="feature">7-day return policy</span>
            <span className="feature">Made in India</span>
          </div>

          <div className="product-bottom">
            <div className="product-price"><span className="price-now">₹{item.price}</span></div>
            <button type="button" className="button-text" onClick={handleAdd}>
              <span>{added ? "Added!" : "Add to Cart"}</span>
              <svg className="button-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </button>
          </div>

          <div className="product-meta">
            <div className="product-rating"><span className="rating-count">{item.reviews}</span></div>
            <div className="product-stock">In Stock</div>
          </div>
        </div>
      </div>
    </div>
  );
}
