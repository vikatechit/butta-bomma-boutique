import { useBoutique } from '../context/BoutiqueContext';

export default function MobileDrawer() {
  const { mobileDrawerOpen, setMobileDrawerOpen, storeSettings } = useBoutique();
  const logo = storeSettings.logo_url || '/logo.png';

  const close = () => setMobileDrawerOpen(false);

  return (
    <div className={`mobile-drawer${mobileDrawerOpen ? ' active' : ''}`} id="mobileDrawer">
      <div className="drawer-header">
        <img src={logo} alt="Butta Bomma Collections" style={{ height: 55, objectFit: 'contain' }} />
        <button className="drawer-close" id="drawerClose" onClick={close}>✕</button>
      </div>
      <div className="drawer-links">
        <a href="#home" onClick={close}>Home</a>
        <a href="#categories" onClick={close}>Shop By Category</a>
        <a href="#new-arrivals" onClick={close}>New Arrivals</a>
        <a href="#customization" onClick={close}>Customization</a>
        <a href="#reviews-section" onClick={close}>Client Reviews</a>
        <a href="#story" onClick={close}>Our Heritage</a>
        <a href="#contact" onClick={close}>Contact</a>
      </div>
    </div>
  );
}
