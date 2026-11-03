import { useState } from 'react';
import Seo from '../components/Seo';
import { BRAND, waLink } from '../data/brand';
import { useStore } from '../context/Store';

export default function Contact() {
  const { storeSettings } = useStore();
  const wa = storeSettings.whatsapp_number || BRAND.whatsapp;
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [notice, setNotice] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const text = `Hello Butta Bomma,\n${form.name}\n${form.phone}\n\n${form.message}`;
    window.open(waLink(text, wa), '_blank', 'noopener,noreferrer');
    setNotice('WhatsApp is opening so you can send your message to our styling team.');
    setForm({ name: '', phone: '', message: '' });
  };

  return (
    <section className="section-container page-pad">
      <Seo title="Contact | Butta Bomma Collections" description="WhatsApp, call or email Butta Bomma Collections. Free Pan-India delivery." />
      <div className="section-title-block">
        <h2 className="section-heading">CONTACT THE BOUTIQUE</h2>
        <div className="section-decorative-divider">◆ ─── ❖ ─── ◆</div>
        <p className="section-subheading">Sizing help, custom stitching or order support — we reply on WhatsApp.</p>
      </div>
      <div className="rks-split">
        <div className="rks-panel">
          <article className="rks-address-card">
            <strong>{BRAND.name}</strong>
            <p>{BRAND.delivery}</p>
          </article>
          <p><strong>WhatsApp / Call:</strong> <a href={`tel:${BRAND.phone}`}>{BRAND.whatsappDisplay}</a></p>
          <p><strong>Email:</strong> <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
          <p><strong>Instagram:</strong> <a href={BRAND.instagram} target="_blank" rel="noreferrer">{BRAND.instagramHandle}</a></p>
          <a className="gold-luxury-btn" style={{ marginTop: 16 }} href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
            CHAT ON WHATSAPP ›
          </a>
        </div>
        <form className="luxury-form" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="contactName">Name *</label>
            <input id="contactName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label htmlFor="contactPhone">WhatsApp mobile *</label>
            <input
              id="contactPhone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              inputMode="tel"
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactMessage">Message *</label>
            <textarea
              id="contactMessage"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>
          {notice ? <p className="rks-ok">{notice}</p> : null}
          <button type="submit" className="gold-luxury-btn btn-full">SEND ON WHATSAPP ›</button>
        </form>
      </div>
    </section>
  );
}
