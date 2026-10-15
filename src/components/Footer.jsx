import { useState } from "react";

const NAV_LINKS = [
  ["Home", "#"], ["Products", "#container"], ["About us", "#"],
  ["Reviews", "#"], ["Offers", "#"], ["Blog", "#"]
];
const SUPPORT_LINKS = [
  "Help center", "FAQ", "Contact us", "Privacy policy", "Terms of use", "Accessibility"
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();
    // Demo only: connect this to your newsletter service
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-grid">

          <div className="footer-column">
            <h3>Aura &amp; Clothes</h3>
            <p>Thoughtfully made clothing and accessories, designed to be worn every day.</p>

            <div className="social-links">
              <a href="https://www.facebook.com/share/1EbqYXU87P/" className="social-link" aria-label="Facebook"
                target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-link" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="https://www.instagram.com/mask_of_kakashi_07?igsh=MTFwOG95dnNnOHhucg=="
                className="social-link" aria-label="Instagram" target="_blank"
                rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-link" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              <a href="#" className="social-link" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Navigation</h3>
            <ul className="footer-links">
              {NAV_LINKS.map(([label, href]) => (
                <li key={label}><a href={href}>{label}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h3>Support</h3>
            <ul className="footer-links">
              {SUPPORT_LINKS.map((label) => (
                <li key={label}><a href="#">{label}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h3>Contact</h3>

            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
                <span>Theni, Royappan Patty<br />Theni, Tamilnadu, 625526</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone-alt" aria-hidden="true"></i>
                <span>+91 709244****<br />Mon–Fri, 9am–6pm</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope" aria-hidden="true"></i>
                <span>prem95127@gmail.com<br /></span>
              </div>
            </div>

            <div className="newsletter">
              <p>Subscribe to our newsletter:</p>
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input type="email" className="newsletter-input" placeholder="Your email"
                  aria-label="Your email address" required value={email}
                  onChange={(e) => { setEmail(e.target.value); setSubscribed(false); }} />
                <button type="submit" className="newsletter-btn">Subscribe</button>
              </form>
              {subscribed && <p className="newsletter-msg" role="status">Thanks for subscribing.</p>}
            </div>
          </div>
        </div>

        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} Aura &amp; Clothes. All rights reserved. |{" "}
            <a href="#">Legal notice</a> | <a href="#">Cookie policy</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
