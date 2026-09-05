import { useBoutique } from '../context/BoutiqueContext';

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    cartCount,
    cartTotal,
    closeCart,
    updateCartQty,
    openCheckoutModal,
    orderCartOnWhatsApp,
  } = useBoutique();

  return (
    <div className={`cart-drawer-backdrop${cartOpen ? ' active' : ''}`} id="cartDrawerBackdrop" onClick={closeCart}>
      <div className="cart-drawer-container" id="cartDrawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-top-bar">
          <div className="drawer-header-text">
            <span className="drawer-title-gold">YOUR SHOPPING BAG</span>
            <span className="drawer-item-subtitle" id="cartDrawerSubtitle">
              {cartCount} Handcrafted Piece{cartCount !== 1 ? 's' : ''}
            </span>
          </div>
          <button className="drawer-close-btn" onClick={closeCart}>✕</button>
        </div>

        <div className="cart-items-scroll-area" id="cartItemsContainer">
          {!cart.length ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 18, fontFamily: 'var(--font-display)' }}>Your shopping bag is empty.</p>
              <button className="gold-luxury-btn" onClick={closeCart} style={{ marginTop: 16 }}>
                EXPLORE WEAVES ›
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-drawer-item" key={`${item.id}-${item.size}`}>
                <img src={item.image_url} alt={item.name} />
                <div>
                  <div className="cart-item-title">{item.name}</div>
                  <span className="cart-item-size-badge">Size: {item.size}</span>
                  <div style={{ fontWeight: 700, color: 'var(--gold-400)', fontSize: 14 }}>
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="cart-qty-stepper">
                  <button onClick={() => updateCartQty(item.id, item.size, -1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateCartQty(item.id, item.size, 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-drawer-footer" id="cartDrawerFooter">
          <div className="cart-summary-line">
            <span>Subtotal</span>
            <span className="cart-total-amount" id="cartSubtotalAmount">
              ₹{cartTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="cart-summary-sub">
            <span>Shipping & Taxes</span>
            <span className="free-shipping-tag">FREE (Pan India)</span>
          </div>
          <div className="cart-checkout-actions">
            <button className="gold-luxury-btn btn-full" onClick={openCheckoutModal}>
              PROCEED TO CHECKOUT ›
            </button>
            <button className="outline-gold-btn btn-full" onClick={orderCartOnWhatsApp}>
              ORDER VIA WHATSAPP 💬
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
