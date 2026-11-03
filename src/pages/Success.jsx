import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { useStore } from '../context/Store';
import { money } from '../data/brand';

export default function Success() {
  const { lastCreatedOrder, sendWhatsAppReceipt } = useStore();
  const stored = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('bb_last_order') || 'null');
    } catch {
      return null;
    }
  }, []);
  const order = lastCreatedOrder || stored;

  return (
    <section className="section-container page-pad text-center">
      <Seo title="Order Placed | Butta Bomma Collections" description="Your Butta Bomma order has been placed." noindex />
      <div className="success-crest-icon">👑</div>
      <h2 className="success-title">Order Placed Successfully!</h2>
      {order ? (
        <div className="order-receipt-box" style={{ maxWidth: 460, margin: '16px auto' }}>
          <p><strong>Order ID:</strong> #{order.order_number}</p>
          <p><strong>Patron:</strong> {order.customer_name}</p>
          <p><strong>WhatsApp:</strong> +91 {order.mobile}</p>
          <p><strong>Delivery:</strong> {order.city} - {order.pincode}</p>
          <p><strong>Total:</strong> {money(order.total_amount)}</p>
          <p><strong>Payment Method:</strong> {order.payment_method}</p>
          {order.cod_advance ? (
            <p style={{ color: '#fef08a' }}><strong>COD Advance Token:</strong> {money(order.cod_advance)}</p>
          ) : null}
        </div>
      ) : (
        <p className="success-note">We could not find a recent order in this browser. Use Track Order with your mobile number.</p>
      )}
      <p className="success-note" style={{ maxWidth: 520, margin: '12px auto 0' }}>
        Your order has been recorded in our boutique system. Tap Confirm on WhatsApp so our styling specialist can confirm
        sizing and share courier tracking.
      </p>
      <div className="modal-actions-row">
        {order ? (
          <button type="button" className="gold-luxury-btn" onClick={() => sendWhatsAppReceipt(order)}>
            CONFIRM ON WHATSAPP
          </button>
        ) : null}
        <Link className="outline-gold-btn" to="/shop">CONTINUE SHOPPING</Link>
      </div>
    </section>
  );
}
