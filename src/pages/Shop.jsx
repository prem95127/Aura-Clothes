import { useState, useMemo } from "react";
import Header from "../components/Header.jsx";
import Slider from "../components/Slider.jsx";
import CategoryBar from "../components/CategoryBar.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import Footer from "../components/Footer.jsx";
import BackToTop from "../components/BackToTop.jsx";
import CartDrawer from "../components/CartDrawer.jsx";
import CheckoutModal from "../components/CheckoutModal.jsx";
import { products } from "../data/products.js";

export default function Shop() {
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const visible = useMemo(
    () => (category === "All" ? products : products.filter((p) => p.category === category)),
    [category]
  );

  const resultText =
    `${visible.length} ${visible.length === 1 ? "product" : "products"}` +
    (category === "All" ? "" : ` in ${category}`);

  const startCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header onOpenCart={() => setCartOpen(true)} />

      <main className="flex-grow-1">
        <section id="box">
          <div id="content" className="text-center py-3">
            <h3>Mask_Of_Kakashi_07</h3>
          </div>
        </section>

        <Slider />
        <CategoryBar active={category} onChange={setCategory} resultText={resultText} />
        <ProductGrid items={visible} />
      </main>

      <Footer />
      <BackToTop />

      <CartDrawer show={cartOpen} onHide={() => setCartOpen(false)} onCheckout={startCheckout} />
      <CheckoutModal show={checkoutOpen} onHide={() => setCheckoutOpen(false)} />
    </div>
  );
}
