import { useBoutique } from '../context/BoutiqueContext';

export default function Header() {
  const {
    cartCount,
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    openProductDetail,
    openCart,
    openModal,
    setMobileDrawerOpen,
    storeSettings,
    filterCategory,
  } = useBoutique();

  const logo = storeSettings.logo_url || '/logo.png';

  const shopCategory = (cat) => {
    filterCategory(cat);
    document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="main-header" id="mainHeader">
      <div className="header-container">
        <a href="#home" className="brand-logo-clean" aria-label="Butta Bomma Collections Home">
          <img src={logo} alt="Butta Bomma Collections" className="main-logo-image" />
        </a>

        <nav className="desktop-nav">
          <a href="#home" className="nav-link active">HOME</a>
          <div className="nav-dropdown-wrapper">
            <a href="#categories" className="nav-link">SHOP <span className="dropdown-arrow">▾</span></a>
            <div className="nav-dropdown-menu">
              <a href="#categories" onClick={() => shopCategory('sarees')}>Royal Sarees</a>
              <a href="#categories" onClick={() => shopCategory('lehengas')}>Bridal Lehengas</a>
              <a href="#categories" onClick={() => shopCategory('dresses')}>Festive Dresses</a>
              <a href="#categories" onClick={() => shopCategory('kurtis')}>Designer Kurtis</a>
              <a href="#categories" onClick={() => shopCategory('suits')}>Anarkali & Suits</a>
              <a href="#categories" onClick={() => shopCategory('accessories')}>Zari & Accessories</a>
            </div>
          </div>
          <a href="#new-arrivals" className="nav-link">NEW ARRIVALS</a>
          <a href="#customization" className="nav-link">CUSTOMIZATION</a>
          <a href="#reviews-section" className="nav-link">CLIENT REVIEWS</a>
          <a href="#story" className="nav-link">OUR HERITAGE</a>
          <a href="#contact" className="nav-link">CONTACT</a>
        </nav>

        <div className="header-action-group">
          <button
            className="action-icon-btn"
            id="searchToggleBtn"
            aria-label="Search Collection"
            title="Search Pieces"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button
            className="action-icon-btn"
            id="accountBtn"
            aria-label="Order Tracking & Account"
            title="Track Your Order"
            onClick={() => openModal('accountModal')}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
          <button className="cart-trigger-btn" id="cartTriggerBtn" aria-label="Shopping Bag" onClick={openCart}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="cart-badge-count" id="cartBadgeCount">{cartCount}</span>
          </button>
          <button
            className="mobile-menu-toggle"
            id="mobileMenuToggle"
            aria-label="Toggle Navigation"
            onClick={() => setMobileDrawerOpen(true)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`search-flyout-panel${searchOpen ? ' active' : ''}`} id="searchFlyout">
        <div className="search-flyout-inner">
          <div className="search-input-box">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="#d4af37" strokeWidth="2" fill="none">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              id="globalSearchInput"
              placeholder="Search silk sarees, bridal lehengas, anarkalis, kurtis..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery ? (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
            ) : null}
          </div>
          <div className="search-live-results" id="searchLiveResults">
            {!searchQuery.trim() ? (
              <div className="search-empty-state">Type a product name, fabric, or category...</div>
            ) : searchResults.length === 0 ? (
              <div className="search-empty-state">No matching couture pieces found for &quot;{searchQuery}&quot;.</div>
            ) : (
              searchResults.map((p) => (
                <div key={p.id} className="search-result-item" onClick={() => openProductDetail(p.id)}>
                  <img src={p.image_url} alt={p.name} />
                  <div className="search-result-info">
                    <h4>{p.name}</h4>
                    <span>₹{p.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
