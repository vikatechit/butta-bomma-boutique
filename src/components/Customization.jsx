import { useBoutique } from '../context/BoutiqueContext';

export default function Customization() {
  const { openWhatsAppInquiry } = useBoutique();

  return (
    <section className="customization-banner-section" id="customization">
      <div className="customization-banner-box">
        <div className="custom-side-decor left-custom-image">
          <img src="/custom-fabric-1.jpg" alt="Handcrafted Saree Drape" className="custom-side-img" />
          <span className="decor-caption">Authentic Weave</span>
        </div>

        <div className="custom-center-content">
          <span className="custom-eyebrow">CUSTOMIZATION</span>
          <h2 className="custom-title">Just For You</h2>
          <p className="custom-desc">
            Choose your fabric, style, color & design.<br />
            <strong>We stitch your dream outfit.</strong>
          </p>
          <button
            className="gold-luxury-btn custom-btn"
            onClick={() =>
              openWhatsAppInquiry(
                'Hello Butta Bomma, I want to inquire about custom tailoring and stitching a bespoke outfit.'
              )
            }
          >
            CUSTOMIZE NOW ›
          </button>
        </div>

        <div className="custom-side-decor right-custom-image">
          <img src="/custom-fabric-2.jpg" alt="Bespoke Yellow Saree" className="custom-side-img" />
          <span className="decor-caption">Bespoke Fitting</span>
        </div>
      </div>
    </section>
  );
}
