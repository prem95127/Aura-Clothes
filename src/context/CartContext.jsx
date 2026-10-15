import {
  createContext, useContext, useState, useEffect, useCallback, useMemo
} from "react";
import { products } from "../data/products.js";

const CART_KEY = "aat_cart";
const CartContext = createContext(null);

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  // Persist the cart; if storage is full or blocked the cart still works for this visit
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  const addToCart = useCallback((productId, size, color) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const key = `${productId}|${size}|${color}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) => (item.key === key ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          title: product.title,
          img_path: product.img_path,
          price: product.price,
          size,
          color,
          quantity: 1
        }
      ];
    });
  }, []);

  const removeFromCart = useCallback((key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const changeQuantity = useCallback((key, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.key === key ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const count = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const value = useMemo(
    () => ({ cart, total, count, addToCart, removeFromCart, changeQuantity, clearCart }),
    [cart, total, count, addToCart, removeFromCart, changeQuantity, clearCart]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
