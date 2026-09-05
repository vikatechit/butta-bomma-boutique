import { useEffect, useRef, useState } from 'react';
import { normalizeSizes, useBoutique } from '../context/BoutiqueContext';

function ModalOverlay({ id, active, onClose, children, cardClass = 'modal-md' }) {
  if (!active) return null;
  return (
    <div className="modal-overlay active" id={id} onClick={onClose}>
      <div className={`modal-card ${cardClass}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function Modals() {
  const {
    modals,
    closeModal,
    selectedProduct,
    selectedModalSize,
    setSelectedModalSize,
    addToCartFromModal,
    openWhatsAppInquiry,
    cartCount,
    cartTotal,
    handleCheckoutSubmit,
    lastCreatedOrder,
    sendWhatsAppReceipt,
    lookupCustomerOrders,
    handleReviewSubmit,
    handleReviewMediaUpload,
    handleAdminLogin,
    editingHeroSlide,
    setEditingHeroSlide,
    handleHeroSlideSave,
    uploadFile,
  } = useBoutique();

  const [lookupMobile, setLookupMobile] = useState('');
  const [lookupOrders, setLookupOrders] = useState(null);
  const [reviewMedia, setReviewMedia] = useState({ url: '', isVideo: false, preview: '' });
  const [heroPreview, setHeroPreview] = useState('');
  const reviewFileRef = useRef(null);
  const heroFileRef = useRef(null);

  useEffect(() => {
    if (editingHeroSlide?.image_url) setHeroPreview(editingHeroSlide.image_url);
    else setHeroPreview('');
  }, [editingHeroSlide]);

  const product = selectedProduct;
  const sizes = product ? normalizeSizes(product.sizes) : ['Standard'];

  return (
    <>
      {/* Product Detail */}
      <ModalOverlay
        id="productDetailModal"
        active={modals.productDetailModal}
        onClose={() => closeModal('productDetailModal')}
        cardClass="modal-lg"
      >
        <button className="modal-close-icon" onClick={() => closeModal('productDetailModal')}>✕</button>
        {product ? (
          <div className="product-modal-body" id="productModalBody">
            <div className="product-modal-gallery">
              <img src={product.image_url} alt={product.name} />
            </div>
            <div className="product-modal-info">
              <span className="product-category-tag">{product.category}</span>
              <h2>{product.name}</h2>
              <div className="product-modal-price">
                ₹{product.price.toLocaleString('en-IN')}
                {product.original_price ? (
                  <span
                    style={{
                      fontSize: 16,
                      textDecoration: 'line-through',
                      color: 'var(--text-muted)',
                      marginLeft: 8,
                    }}
                  >
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                ) : null}
              </div>

              <div className="size-selection-header">SELECT FIT / STITCHING OPTION:</div>
              <div className="size-pill-selector" id="modalSizePills">
                {sizes.map((s) => (
                  <button
                    key={s}
                    className={`size-pill-option${selectedModalSize === s ? ' active' : ''}`}
                    onClick={() => setSelectedModalSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 14, color: 'var(--cream-200)', marginBottom: 16, lineHeight: 1.6 }}>
                {product.description ||
                  'Authentic handcrafted heirloom piece woven by master artisans with pure silk & zari.'}
              </p>

              <ul className="product-specs-list">
                <li>
                  <strong>Fabric:</strong> {product.fabric || 'Pure Handloom Silk'}
                </li>
                <li>
                  <strong>Stock Status:</strong>{' '}
                  {product.stock > 0
                    ? `In Stock (${product.stock} units ready to ship)`
                    : 'Out of Stock'}
                </li>
                <li>
                  <strong>Pan-India Delivery:</strong> Free express courier (2-4 business days)
                </li>
                <li>
                  <strong>Includes:</strong> Authenticity Tag & Luxury Gift Box
                </li>
              </ul>

              <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                <button
                  className="gold-luxury-btn btn-full"
                  onClick={addToCartFromModal}
                  disabled={product.stock <= 0}
                >
                  {product.stock <= 0 ? 'OUT OF STOCK' : 'ADD TO BAG +'}
                </button>
                <button
                  className="outline-gold-btn btn-full"
                  onClick={() =>
                    openWhatsAppInquiry(
                      `Hello Butta Bomma, I would like to inquire about ${product.name} (ID: #${product.id}, Price: ₹${product.price}).`
                    )
                  }
                >
                  INQUIRE / CUSTOM STITCH ON WHATSAPP 💬
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </ModalOverlay>

      {/* Checkout */}
      <ModalOverlay
        id="checkoutModal"
        active={modals.checkoutModal}
        onClose={() => closeModal('checkoutModal')}
      >
        <button className="modal-close-icon" onClick={() => closeModal('checkoutModal')}>✕</button>
        <div className="modal-header-banner">
          <h2>Complete Your Royal Order</h2>
          <p>Enter your delivery details. We will confirm your piece & dispatch immediately.</p>
        </div>
        <form
          className="luxury-form"
          id="checkoutForm"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            handleCheckoutSubmit({
              name: fd.get('name').toString().trim(),
              mobile: fd.get('mobile').toString().trim(),
              address: fd.get('address').toString().trim(),
              city: fd.get('city').toString().trim(),
              pincode: fd.get('pincode').toString().trim(),
              paymentMethod: fd.get('paymentMethod').toString(),
              notes: fd.get('notes').toString().trim(),
            });
          }}
        >
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="custFullName">Full Name *</label>
              <input type="text" id="custFullName" name="name" required placeholder="e.g. Ananya Sharma" />
            </div>
            <div className="form-group">
              <label htmlFor="custMobile">WhatsApp Mobile Number *</label>
              <input
                type="tel"
                id="custMobile"
                name="mobile"
                inputMode="numeric"
                maxLength={10}
                required
                placeholder="10-digit mobile number"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="custAddress">Delivery Address *</label>
            <textarea
              id="custAddress"
              name="address"
              rows={2}
              required
              placeholder="House/Flat No, Apartment, Street name"
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="custCity">City / District *</label>
              <input type="text" id="custCity" name="city" required placeholder="e.g. Hyderabad" />
            </div>
            <div className="form-group">
              <label htmlFor="custPincode">Pincode *</label>
              <input
                type="text"
                id="custPincode"
                name="pincode"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="e.g. 500034"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethodSelect">Payment Preference *</label>
            <select id="paymentMethodSelect" name="paymentMethod" required>
              <option value="UPI / Online Transfer (GPay / PhonePe / Paytm / Razorpay)">
                UPI / Online Transfer (GPay / PhonePe / Razorpay)
              </option>
              <option value="Cash On Delivery (COD)">Cash On Delivery (COD)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="custNotes">Special Stitching / Blouse Measurements (Optional)</label>
            <input
              type="text"
              id="custNotes"
              name="notes"
              placeholder="e.g. Custom blouse bust 36, waist 30, fall-pico needed"
            />
          </div>

          <div className="checkout-order-summary-box" id="checkoutSummaryBox">
            <div
              style={{
                background: 'rgba(8,52,39,0.5)',
                padding: 14,
                border: '1px solid var(--border-gold)',
                borderRadius: 4,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  color: 'var(--gold-400)',
                  fontSize: 16,
                }}
              >
                <span>Grand Total ({cartCount} items):</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ fontSize: 11, color: '#86efac', marginTop: 4 }}>✓ Free Pan-India Courier Included</div>
            </div>
          </div>

          <button type="submit" className="gold-luxury-btn btn-full">
            CONFIRM ORDER & PROCEED ›
          </button>
        </form>
      </ModalOverlay>

      {/* Review */}
      <ModalOverlay
        id="writeReviewModal"
        active={modals.writeReviewModal}
        onClose={() => closeModal('writeReviewModal')}
      >
        <button className="modal-close-icon" onClick={() => closeModal('writeReviewModal')}>✕</button>
        <div className="modal-header-banner">
          <h2>Share Your Look & Experience</h2>
          <p>Upload your photo or video wearing Butta Bomma and share your review.</p>
        </div>
        <form
          className="luxury-form"
          id="reviewSubmissionForm"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            await handleReviewSubmit({
              name: fd.get('name').toString().trim(),
              city: fd.get('city').toString().trim(),
              outfit: fd.get('outfit').toString().trim(),
              rating: parseInt(fd.get('rating'), 10) || 5,
              comment: fd.get('comment').toString().trim(),
              media_url: reviewMedia.url || null,
              is_video: reviewMedia.isVideo,
            });
            setReviewMedia({ url: '', isVideo: false, preview: '' });
            e.target.reset();
          }}
        >
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="reviewName">Your Name *</label>
              <input type="text" id="reviewName" name="name" required placeholder="e.g. Meera Reddy" />
            </div>
            <div className="form-group">
              <label htmlFor="reviewCity">City *</label>
              <input type="text" id="reviewCity" name="city" required placeholder="e.g. Hyderabad, Telangana" />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="reviewOutfit">Outfit Purchased *</label>
              <input
                type="text"
                id="reviewOutfit"
                name="outfit"
                required
                placeholder="e.g. Royal Kanjivaram Silk Saree"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reviewRating">Rating (Stars) *</label>
              <select id="reviewRating" name="rating" required defaultValue="5">
                <option value="5">★★★★★ (5 Stars - Exceptional)</option>
                <option value="4">★★★★☆ (4 Stars - Great)</option>
                <option value="3">★★★☆☆ (3 Stars - Good)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reviewComment">Your Feedback & Experience *</label>
            <textarea
              id="reviewComment"
              name="comment"
              rows={3}
              required
              placeholder="Tell us about the fabric quality, stitching, zari shine, and how you felt wearing it..."
            />
          </div>

          <div className="form-group">
            <label>Upload Your Photo or Video *</label>
            <div className="image-upload-dropzone" onClick={() => reviewFileRef.current?.click()}>
              <input
                type="file"
                id="reviewFileInput"
                ref={reviewFileRef}
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const result = await handleReviewMediaUpload(file);
                  if (result) {
                    setReviewMedia({
                      url: result.url,
                      isVideo: result.isVideo,
                      preview: result.url,
                    });
                  }
                }}
              />
              <span style={{ fontSize: 13, color: '#d4af37' }}>
                📸 Click to Upload Photo / Video from Your Device
              </span>
              {reviewMedia.preview ? (
                <div id="reviewMediaPreview" className="preview-thumb-box" style={{ display: 'block' }}>
                  <img
                    src={reviewMedia.preview}
                    alt="preview"
                    style={{
                      width: 70,
                      height: 70,
                      objectFit: 'cover',
                      border: '1px solid var(--gold-500)',
                      borderRadius: 4,
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <button type="submit" className="gold-luxury-btn btn-full" style={{ marginTop: 10 }}>
            PUBLISH REVIEW TO WEBSITE ›
          </button>
        </form>
      </ModalOverlay>

      {/* Order Success */}
      <ModalOverlay
        id="orderSuccessModal"
        active={modals.orderSuccessModal}
        onClose={() => closeModal('orderSuccessModal')}
        cardClass="modal-sm text-center"
      >
        <div className="success-crest-icon">👑</div>
        <h2 className="success-title">Order Placed Successfully!</h2>
        <div className="order-receipt-box" id="orderReceiptBox">
          {lastCreatedOrder ? (
            <div
              style={{
                background: 'var(--forest-800)',
                border: '1px solid var(--border-gold)',
                padding: 16,
                borderRadius: 4,
                margin: '16px 0',
                textAlign: 'left',
              }}
            >
              <p>
                <strong>Order ID:</strong> #{lastCreatedOrder.order_number}
              </p>
              <p>
                <strong>Patron:</strong> {lastCreatedOrder.customer_name}
              </p>
              <p>
                <strong>WhatsApp:</strong> +91 {lastCreatedOrder.mobile}
              </p>
              <p>
                <strong>Delivery:</strong> {lastCreatedOrder.city} - {lastCreatedOrder.pincode}
              </p>
              <p>
                <strong>Total:</strong> ₹{lastCreatedOrder.total_amount?.toLocaleString('en-IN')}
              </p>
              <p>
                <strong>Payment Method:</strong> {lastCreatedOrder.payment_method}
              </p>
              {lastCreatedOrder.cod_advance ? (
                <p style={{ color: '#fef08a' }}>
                  <strong>COD Advance Token:</strong> ₹{lastCreatedOrder.cod_advance}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        <p className="success-note">
          Your order has been recorded in our boutique system. Our styling specialist will reach out for any sizing
          preferences.
        </p>
        <div className="modal-actions-row">
          <button className="gold-luxury-btn" onClick={sendWhatsAppReceipt}>
            CONFIRM ON WHATSAPP
          </button>
          <button className="outline-gold-btn" onClick={() => closeModal('orderSuccessModal')}>
            CLOSE
          </button>
        </div>
      </ModalOverlay>

      {/* Account Lookup */}
      <ModalOverlay
        id="accountModal"
        active={modals.accountModal}
        onClose={() => closeModal('accountModal')}
        cardClass="modal-sm"
      >
        <button className="modal-close-icon" onClick={() => closeModal('accountModal')}>✕</button>
        <div className="modal-header-banner">
          <h2>Track Your Order</h2>
          <p>Enter your registered 10-digit mobile number to look up your order status.</p>
        </div>
        <div className="form-group" style={{ marginTop: 16 }}>
          <label htmlFor="lookupMobile">Mobile Number</label>
          <input
            type="tel"
            id="lookupMobile"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile number"
            value={lookupMobile}
            onChange={(e) => setLookupMobile(e.target.value)}
          />
        </div>
        <button
          className="gold-luxury-btn btn-full"
          style={{ marginTop: 12 }}
          onClick={async () => {
            const orders = await lookupCustomerOrders(lookupMobile);
            setLookupOrders(orders);
          }}
        >
          SEARCH ORDERS
        </button>
        {lookupOrders !== null ? (
          <div className="lookup-results-area" id="lookupResultsArea" style={{ display: 'block' }}>
            {!lookupOrders.length ? (
              <p style={{ color: 'var(--text-muted)', padding: '16px 0', fontSize: 13, textAlign: 'center' }}>
                No orders found for +91 {lookupMobile}. Please verify your number.
              </p>
            ) : (
              lookupOrders.map((o) => (
                <div
                  key={o.id}
                  style={{
                    background: 'var(--forest-800)',
                    border: '1px solid var(--border-gold)',
                    padding: 14,
                    borderRadius: 4,
                    marginTop: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--gold-400)' }}>
                    <span>#{o.order_number}</span>
                    <span style={{ color: '#86efac' }}>{o.order_status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--cream-200)', margin: '6px 0' }}>
                    Placed on:{' '}
                    {new Date(o.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    {(o.items || []).map((i, idx) => (
                      <div key={idx}>
                        • {i.name} (Qty: {i.qty})
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 'bold', color: 'var(--gold-300)' }}>
                    Total: ₹{o.total_amount.toLocaleString('en-IN')} ({o.payment_method})
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </ModalOverlay>

      {/* Admin Login */}
      <ModalOverlay
        id="adminLoginModal"
        active={modals.adminLoginModal}
        onClose={() => closeModal('adminLoginModal')}
        cardClass="modal-xs"
      >
        <button className="modal-close-icon" onClick={() => closeModal('adminLoginModal')}>✕</button>
        <div className="admin-login-header text-center">
          <span className="admin-shield-icon">🔐</span>
          <h2>Boutique Admin Portal</h2>
          <p>Private Atelier Management Login</p>
        </div>
        <form
          className="luxury-form"
          id="adminLoginForm"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            await handleAdminLogin(fd.get('username').toString().trim(), fd.get('password').toString());
          }}
        >
          <div className="form-group">
            <label htmlFor="adminUsername">Admin Username</label>
            <input type="text" id="adminUsername" name="username" defaultValue="admin" required />
          </div>
          <div className="form-group">
            <label htmlFor="adminPassword">Passcode / Password</label>
            <input type="password" id="adminPassword" name="password" placeholder="Enter admin password" required />
          </div>
          <button type="submit" className="gold-luxury-btn btn-full" style={{ marginTop: 12 }}>
            ENTER CONTROL ROOM ›
          </button>
        </form>
      </ModalOverlay>

      {/* Hero Slide Form */}
      <ModalOverlay
        id="heroSlideModal"
        active={modals.heroSlideModal}
        onClose={() => closeModal('heroSlideModal')}
        cardClass="modal-sm"
      >
        <button className="modal-close-icon" onClick={() => closeModal('heroSlideModal')}>✕</button>
        <div className="modal-header-banner">
          <h2 id="heroSlideModalTitle">
            {editingHeroSlide?.id ? `Edit Slide: ${editingHeroSlide.label}` : 'Add Hero Accordion Slide'}
          </h2>
          <p>Upload a high-resolution model/saree photo and set the slide label.</p>
        </div>
        <form
          className="luxury-form"
          id="heroSlideForm"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            await handleHeroSlideSave({
              editId: editingHeroSlide?.id || null,
              label: fd.get('label').toString().trim(),
              link: fd.get('link').toString().trim() || '#categories',
              sort_order: parseInt(fd.get('sort_order'), 10) || 0,
              image_url: fd.get('image_url').toString().trim(),
            });
          }}
        >
          <div className="form-group">
            <label htmlFor="heroSlideLabel">Slide Title / Label *</label>
            <input
              type="text"
              id="heroSlideLabel"
              name="label"
              required
              placeholder="e.g. Royal Kanjeevaram, Bridal Lehengas"
              defaultValue={editingHeroSlide?.label || ''}
              key={`label-${editingHeroSlide?.id || 'new'}`}
            />
          </div>

          <div className="form-group">
            <label htmlFor="heroSlideLink">Click Link Target</label>
            <input
              type="text"
              id="heroSlideLink"
              name="link"
              defaultValue={editingHeroSlide?.link || '#categories'}
              placeholder="e.g. #categories or #new-arrivals"
              key={`link-${editingHeroSlide?.id || 'new'}`}
            />
          </div>

          <div className="form-group">
            <label htmlFor="heroSlideSort">Display Sort Order (1, 2, 3...)</label>
            <input
              type="number"
              id="heroSlideSort"
              name="sort_order"
              min={0}
              defaultValue={editingHeroSlide?.sort_order ?? 1}
              key={`sort-${editingHeroSlide?.id || 'new'}`}
            />
          </div>

          <div className="form-group">
            <label>Slide Image (Upload File or Enter Image URL) *</label>
            <div className="image-upload-dropzone" onClick={() => heroFileRef.current?.click()}>
              <input
                type="file"
                id="heroSlideFileInput"
                ref={heroFileRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const data = await uploadFile(file);
                    if (data.success) {
                      setEditingHeroSlide((prev) => ({ ...(prev || {}), image_url: data.url }));
                      setHeroPreview(data.url);
                    } else {
                      alert('Upload failed: ' + data.error);
                    }
                  } catch (err) {
                    alert('Upload error: ' + err.message);
                  }
                }}
              />
              <span style={{ fontSize: 13, color: 'var(--gold-400)' }}>📸 Click to Upload Photo from Computer</span>
              {heroPreview ? (
                <div id="heroSlideImgPreview" className="preview-thumb-box" style={{ display: 'block' }}>
                  <img
                    src={heroPreview}
                    alt="slide"
                    style={{
                      width: 70,
                      height: 50,
                      objectFit: 'cover',
                      borderRadius: 4,
                      border: '1px solid var(--gold-500)',
                    }}
                  />
                </div>
              ) : null}
            </div>
            <input
              type="text"
              id="heroSlideImgUrl"
              name="image_url"
              required
              placeholder="Or paste direct image URL (https://...)"
              style={{ marginTop: 8 }}
              value={editingHeroSlide?.image_url || ''}
              onChange={(e) => {
                setEditingHeroSlide((prev) => ({ ...(prev || {}), image_url: e.target.value }));
                setHeroPreview(e.target.value);
              }}
            />
          </div>

          <button type="submit" className="gold-luxury-btn btn-full" style={{ marginTop: 12 }}>
            SAVE HERO SLIDE ›
          </button>
        </form>
      </ModalOverlay>
    </>
  );
}
