import { useBoutique } from '../context/BoutiqueContext';

export default function Footer() {
  const { openModal, storeSettings } = useBoutique();
  const logo = storeSettings.logo_url || '/logo.png';
  const wa = storeSettings.whatsapp_number || '917382891980';

  return (
    <footer className="main-footer" id="contact">
      <div className="footer-top-grid">
        <div className="footer-col brand-col">
          <div className="footer-brand-header">
            <img src={logo} alt="Butta Bomma Collections" className="footer-logo-img" />
          </div>
          <p className="footer-tagline">Premium handcrafted ethnic wear store for every celebration.</p>

          <div className="official-insta-wrapper">
            <a
              href="https://www.instagram.com/shirae_boutique?igsi=NWw0d2ZxdnhpdTQ3"
              target="_blank"
              rel="noreferrer"
              className="insta-luxury-badge"
              title="Follow us on Instagram @shirae_boutique"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>@shirae_boutique</span>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">QUICK LINKS</h4>
          <ul className="footer-nav-list">
            <li><a href="#home">Home</a></li>
            <li><a href="#categories">Shop Collection</a></li>
            <li><a href="#new-arrivals">New Arrivals</a></li>
            <li><a href="#customization">Customization</a></li>
            <li><a href="#reviews-section">Client Reviews</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">CUSTOMER SERVICE</h4>
          <ul className="footer-nav-list">
            <li><a href="/about-us.html" target="_blank" rel="noopener noreferrer">About Us</a></li>
            <li><a href="/shipping-policy.html" target="_blank" rel="noopener noreferrer">Shipping Policy</a></li>
            <li><a href="/return-exchange.html" target="_blank" rel="noopener noreferrer">Return & Exchange</a></li>
            <li><a href="/terms-conditions.html" target="_blank" rel="noopener noreferrer">Terms & Conditions</a></li>
            <li><a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
            <li><a href="/faqs.html" target="_blank" rel="noopener noreferrer">FAQ&apos;s</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">CONTACT US</h4>
          <div className="footer-contact-details">
            <div className="contact-row">
              <span className="contact-icon">📞</span>
              <a href="tel:+917382891980">+91 73828 91980</a>
            </div>
            <div className="contact-row">
              <span className="contact-icon">✉️</span>
              <a href="mailto:buttabommaonline@gmail.com">buttabommaonline@gmail.com</a>
            </div>
            <div className="contact-row">
              <span className="contact-icon">📍</span>
              <span>India • Pan-India Free Delivery</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-payment-section">
        <div className="payment-badges-row">
          <a
            href={`https://wa.me/${wa}?text=Hello%20Butta%20Bomma%2C%20I%20would%20like%20to%20pay%20via%20UPI%20(GPay%20%2F%20PhonePe%20%2F%20Paytm).`}
            target="_blank"
            rel="noreferrer"
            className="payment-pill-link"
            title="Pay via UPI on WhatsApp"
          >
            UPI (GPay / PhonePe / Paytm)
          </a>
          <a
            href={`https://wa.me/${wa}?text=Hello%20Butta%20Bomma%2C%20I%20would%20like%20to%20place%20an%20order%20via%20Cash%20On%20Delivery%20(COD).`}
            target="_blank"
            rel="noreferrer"
            className="payment-pill-link"
            title="Cash On Delivery on WhatsApp"
          >
            Cash On Delivery (COD)
          </a>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <div className="copyright-text">
            © 2026 Butta Bomma Collections. All Rights Reserved.{' '}
            <span
              className="secret-admin-trigger"
              onClick={() => openModal('adminLoginModal')}
              title="Atelier Portal"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openModal('adminLoginModal')}
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="#d4af37"
                style={{ display: 'inline-block', verticalAlign: 'middle' }}
              >
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
              </svg>
            </span>
          </div>

          <div className="developer-credit-box">
            <span>Developed by <strong>Vikatech</strong></span>
            <span className="dev-divider">•</span>
            <a href="mailto:vikatechit@gmail.com" className="dev-mail">Mail: vikatechit@gmail.com</a>
            <span className="dev-divider">•</span>
            <a
              href="https://www.instagram.com/vikatechit?igsi=cWdsaHhxd3Bjc2xj"
              target="_blank"
              rel="noreferrer"
              className="dev-insta-link"
              title="Follow Vikatech on Instagram"
              aria-label="Vikatech Instagram"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
