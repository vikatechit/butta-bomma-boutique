import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import { useStore } from '../context/Store';
import { money } from '../data/brand';

export default function Checkout() {
  const store = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'UPI / Online Transfer (GPay / PhonePe / Paytm / Razorpay)',
    notes: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!store.cart.length) return setError('Add at least one piece before checkout.');
    if (form.mobile.replace(/\D/g, '').length !== 10) return setError('Enter a valid 10-digit WhatsApp number.');
    if (form.pincode.replace(/\D/g, '').length !== 6) return setError('Enter a valid 6-digit pincode.');
    setBusy(true);
    const order = await store.handleCheckoutSubmit({
      ...form,
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      notes: form.notes.trim(),
    });
    setBusy(false);
    if (order) navigate('/success');
  };

  return (
    <section className="section-container page-pad">
      <Seo title="Checkout | Butta Bomma Collections" description="Enter delivery details and confirm your Butta Bomma order." noindex />
      <div className="section-title-block">
        <h2 className="section-heading">COMPLETE YOUR ROYAL ORDER</h2>
        <div className="section-decorative-divider">◆ ─── ❖ ─── ◆</div>
        <p className="section-subheading">Enter your delivery details. We will confirm your piece and dispatch immediately.</p>
      </div>
      {!store.cart.length ? (
        <div className="rks-panel text-center" style={{ maxWidth: 520, margin: '0 auto' }}>
          <p style={{ marginBottom: 16 }}>Your shopping bag is empty.</p>
          <Link className="gold-luxury-btn" to="/shop">BROWSE COLLECTIONS ›</Link>
        </div>
      ) : (
        <div className="rks-split">
          <div className="rks-panel">
            <p className="rks-kicker">Your Bag</p>
            {store.cart.map((item) => (
              <div className="mini-product" key={`${item.id}-${item.size}`}>
                <img src={item.image_url} alt={item.name} />
                <div>
                  <b>{item.name}</b>
                  <br />
                  <small>Size: {item.size}</small>
                  <br />
                  {money(item.price)} × {item.qty}
                </div>
              </div>
            ))}
            <div className="checkout-total-box">
              <div className="checkout-total-row">
                <span>Grand Total ({store.cartCount} items)</span>
                <span>{money(store.cartTotal)}</span>
              </div>
              <div className="checkout-total-note">✓ Free Pan-India Courier Included</div>
            </div>
          </div>
          <form className="luxury-form" onSubmit={submit}>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="custFullName">Full Name *</label>
                <input id="custFullName" value={form.name} onChange={set('name')} required placeholder="e.g. Ananya Sharma" />
              </div>
              <div className="form-group">
                <label htmlFor="custMobile">WhatsApp Mobile Number *</label>
                <input
                  id="custMobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.mobile}
                  onChange={set('mobile')}
                  required
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="custAddress">Delivery Address *</label>
              <textarea
                id="custAddress"
                rows={2}
                value={form.address}
                onChange={set('address')}
                required
                placeholder="House/Flat No, Apartment, Street name"
              />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="custCity">City / District *</label>
                <input id="custCity" value={form.city} onChange={set('city')} required placeholder="e.g. Hyderabad" />
              </div>
              <div className="form-group">
                <label htmlFor="custPincode">Pincode *</label>
                <input
                  id="custPincode"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.pincode}
                  onChange={set('pincode')}
                  required
                  placeholder="e.g. 500034"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="paymentMethodSelect">Payment Preference *</label>
              <select id="paymentMethodSelect" value={form.paymentMethod} onChange={set('paymentMethod')} required>
                <option value="UPI / Online Transfer (GPay / PhonePe / Paytm / Razorpay)">
                  UPI / Online Transfer (GPay / PhonePe / Razorpay)
                </option>
                <option value="Cash On Delivery (COD)">Cash On Delivery (COD)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="custNotes">Special Stitching / Blouse Measurements (Optional)</label>
              <input
                id="custNotes"
                value={form.notes}
                onChange={set('notes')}
                placeholder="e.g. Custom blouse bust 36, waist 30, fall-pico needed"
              />
            </div>
            {error ? <p className="rks-err">{error}</p> : null}
            <button type="submit" className="gold-luxury-btn btn-full" disabled={busy}>
              {busy ? 'PLACING ORDER…' : 'CONFIRM ORDER & PROCEED ›'}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
