export default function Story() {
  return (
    <section className="section-container story-section" id="story">
      <div className="story-grid-layout">
        <div className="story-card atelier-card">
          <div className="card-icon-crest">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="url(#goldCrownGrad)">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
            </svg>
          </div>
          <h3>The Butta Bomma Heritage</h3>
          <p>
            Born out of a deep reverence for India&apos;s rich artisanal heritage, Butta Bomma weaves royal traditions into
            modern silhouettes. Every motif, zari brocade, and seam is crafted with uncompromising mastery.
          </p>
        </div>

        <div className="story-card dark-crest-card">
          <div className="card-icon-crest">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="url(#goldCrownGrad)">
              <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.5-6.2 4.5 2.3-7.3-6.1-4.5h7.6z" />
            </svg>
          </div>
          <h3>Bespoke Craftsmanship</h3>
          <p>
            We work directly with generational weavers across Kanchipuram, Banaras, Chanderi, and Surat, ensuring fair
            wages and authentic craft.
          </p>
        </div>

        <div className="story-card atelier-card">
          <div className="card-icon-crest">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="url(#goldCrownGrad)">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
            </svg>
          </div>
          <h3>Size & Fit Guarantee</h3>
          <p>
            From XS to 3XL and bespoke custom-stitched measurements, our master tailors ensure your outfit hugs your
            silhouette with comfort and grace.
          </p>
        </div>
      </div>
    </section>
  );
}
