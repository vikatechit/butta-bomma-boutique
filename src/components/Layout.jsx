import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/Store';
import Header from './Header';
import MobileDrawer from './MobileDrawer';
import Footer from './Footer';
import FloatingActions from './FloatingActions';
import CartDrawer from './CartDrawer';
import Modals from './Modals';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const { toast } = useStore();
  const isAdminPage = pathname === '/admin';

  useEffect(() => {
    const onAdminShortcut = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === '8' || e.key === '*' || e.code === 'Digit8' || e.code === 'Numpad8')) {
        e.preventDefault();
        e.stopPropagation();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', onAdminShortcut, true);
    return () => window.removeEventListener('keydown', onAdminShortcut, true);
  }, [navigate]);

  useEffect(() => {
    if (hash === '#admin') navigate('/admin', { replace: true });
  }, [hash, navigate]);

  return (
    <>
      {!isAdminPage ? (
        <div className="announcement-bar">
          <span className="announcement-full">
            Free Pan-India Delivery • UPI & Cash On Delivery • Custom stitching confirmed on WhatsApp
          </span>
          <span className="announcement-short">Free Pan-India Delivery • UPI & COD</span>
        </div>
      ) : null}
      <Header />
      <MobileDrawer />
      <main>{children}</main>
      {!isAdminPage ? <Footer /> : null}
      {!isAdminPage ? <FloatingActions /> : null}
      <CartDrawer />
      <Modals />
      {toast ? <div className="rks-toast">{toast}</div> : null}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="goldCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#996515" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}
