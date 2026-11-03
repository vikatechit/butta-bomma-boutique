import { Link, useLocation } from 'react-router-dom';
import Seo from '../components/Seo';
import { BRAND } from '../data/brand';

const COPY = {
  '/privacy': {
    title: 'Privacy Policy',
    full: '/privacy-policy.html',
    body: [
      'We collect only your name, WhatsApp number, delivery address, sizes and optional measurements to fulfil your order and arrange courier dispatch.',
      'We never collect or store card numbers or banking passwords. UPI payments are processed through secure bank gateways.',
      'We do not sell or rent customer data. Delivery details are shared only with our courier partners (e.g. Blue Dart, Delhivery).',
      `To correct or delete your records, email ${BRAND.email} or WhatsApp ${BRAND.whatsappDisplay}.`,
    ],
  },
  '/terms': {
    title: 'Terms & Conditions',
    full: '/terms-conditions.html',
    body: [
      'By using this website, placing an order or messaging us on WhatsApp, you agree to these terms.',
      'Minor slubs, thread lustre variations and embroidery differences are natural hallmarks of handloom craft, not defects.',
      'Prices are in INR and include GST. Stock updates in real time; if a piece sells out, we offer an alternative or a full refund.',
      'We accept UPI (GPay, PhonePe, Paytm, BHIM) and Cash On Delivery. COD orders need a small advance token to dispatch.',
    ],
  },
  '/shipping': {
    title: 'Shipping & Delivery',
    full: '/shipping-policy.html',
    body: [
      'Free express shipping across India on every prepaid and Cash On Delivery order, with no hidden fees.',
      'In-stock pieces dispatch within 24–48 business hours. Custom-stitched pieces dispatch in 3–5 business days after measurements are confirmed.',
      'Metro cities: 2–4 business days. Rest of India: 4–6 business days.',
      'COD orders need an advance token (typically ₹500 or 15%) via UPI; the balance is paid to the courier on delivery. Tracking is sent on WhatsApp.',
    ],
  },
  '/refunds': {
    title: 'Return & Exchange',
    full: '/return-exchange.html',
    body: [
      'Exchanges or returns are accepted within 7 days of delivery for defects, transit damage or size discrepancies.',
      'Pieces must be unworn, unwashed and unaltered with tags and invoice. An unboxing video is required for damage or missing-item claims.',
      'Custom-stitched pieces receive complimentary alterations for a perfect fit instead of refunds.',
      `WhatsApp ${BRAND.whatsappDisplay} with your Order ID. Refunds reach your UPI / bank account within 3–5 business days after inspection.`,
    ],
  },
};

export default function LegalPage() {
  const { pathname } = useLocation();
  const page = COPY[pathname] || COPY['/privacy'];
  return (
    <section className="section-container page-pad">
      <Seo title={`${page.title} | Butta Bomma Collections`} description={page.body[0]} />
      <div className="section-title-block">
        <h2 className="section-heading">{page.title.toUpperCase()}</h2>
        <div className="section-decorative-divider">◆ ─── ❖ ─── ◆</div>
      </div>
      <div className="rks-panel" style={{ maxWidth: 760, margin: '0 auto' }}>
        {page.body.map((p) => (
          <p key={p} style={{ marginBottom: 14, lineHeight: 1.7 }}>{p}</p>
        ))}
        <p style={{ marginTop: 18 }}>
          <a href={page.full} target="_blank" rel="noopener noreferrer" className="outline-gold-btn">
            READ FULL POLICY ›
          </a>{' '}
          <Link to="/contact" className="outline-gold-btn">CONTACT US</Link>
        </p>
      </div>
    </section>
  );
}
