import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../context/Store';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/categories', label: 'Shop By Category' },
  { to: '/shop', label: 'New Arrivals' },
  { to: '/customization', label: 'Customization' },
  { to: '/how', label: 'How To Order' },
  { to: '/reviews', label: 'Client Reviews' },
  { to: '/about', label: 'Our Heritage' },
  { to: '/contact', label: 'Contact' },
];

export default function MobileDrawer() {
  const { mobileDrawerOpen, setMobileDrawerOpen, storeSettings } = useStore();
  const logo = storeSettings.logo_url || '/logo.png';
  const close = () => setMobileDrawerOpen(false);

  useEffect(() => {
    document.body.style.overflow = mobileDrawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  return (
    <>
      <div
        className={`mobile-drawer-backdrop${mobileDrawerOpen ? ' active' : ''}`}
        onClick={close}
        aria-hidden={!mobileDrawerOpen}
      />
      <nav className={`mobile-drawer${mobileDrawerOpen ? ' active' : ''}`} id="mobileDrawer" aria-label="Mobile menu">
        <div className="drawer-header">
          <img src={logo} alt="Butta Bomma Collections" style={{ height: 55, objectFit: 'contain' }} />
          <button type="button" className="drawer-close" id="drawerClose" onClick={close} aria-label="Close menu">✕</button>
        </div>
        <div className="drawer-links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={close}>
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
