import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Header({ onOpenCart }) {
  const { user, signOut } = useAuth();
  const { count } = useCart();

  return (
    <header className="site-header">
      <div className="container-xl d-flex align-items-center justify-content-between" style={{ height: 64 }}>
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <img src="/image/logo.png" alt="Aura & Clothes logo" className="brand-logo" />
          <span className="brand-name">Aura &amp; <span>Clothes</span></span>
        </Link>

        <div className="header-actions">
          <div id="authArea">
            {user ? (
              <>
                <span className="auth-user">Hi, {user.name.split(" ")[0]}</span>
                <button type="button" className="auth-link" onClick={signOut}>Sign out</button>
              </>
            ) : (
              <>
                <Link to="/signin" className="auth-link">Sign in</Link>
                <Link to="/signup" className="auth-link primary">Sign up</Link>
              </>
            )}
          </div>

          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            type="button"
            onClick={onOpenCart}
            aria-controls="cartDrawer"
          >
            <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i>
            <span>Cart</span>
            <span id="count" className="badge text-bg-dark">{count}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
