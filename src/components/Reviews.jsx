import { useBoutique } from '../context/BoutiqueContext';

export default function Reviews() {
  const { reviews, activeReviewIndex, triggerStackNext, openModal } = useBoutique();
  const total = reviews.length;

  return (
    <section className="section-container reviews-section" id="reviews-section">
      <div className="section-title-block">
        <h2 className="section-heading">CLIENT DIARIES & REVIEWS</h2>
        <div className="section-decorative-divider">◆ ─── ❖ ─── ◆</div>
        <p className="section-subheading">
          Loved by our royal patrons across the globe. Click or swipe the stack cards to explore client reviews & video
          stories!
        </p>
      </div>

      <div className="review-stack-section-layout">
        <div className="review-summary-sidebar">
          <div className="review-summary-card">
            <span className="sidebar-crest-icon">
              <svg viewBox="0 0 24 24" width="34" height="34" fill="url(#goldCrownGrad)">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
              </svg>
            </span>
            <div className="big-rating-number">4.9</div>
            <div className="star-rating-display">★★★★★</div>
            <p className="sidebar-rating-desc" id="reviewCountHighlight">
              Over {450 + reviews.length}+ verified royal patrons adore Butta Bomma handcrafted couture.
            </p>

            <div className="rating-bar-breakdown">
              <div className="rating-bar-line">
                <span>5 Star</span>
                <div className="bar-fill-track">
                  <div className="bar-fill-progress" style={{ width: '94%' }} />
                </div>
                <span>94%</span>
              </div>
              <div className="rating-bar-line">
                <span>4 Star</span>
                <div className="bar-fill-track">
                  <div className="bar-fill-progress" style={{ width: '6%' }} />
                </div>
                <span>6%</span>
              </div>
            </div>

            <button
              className="gold-luxury-btn btn-full"
              onClick={() => openModal('writeReviewModal')}
              style={{ marginTop: 20 }}
            >
              WRITE A REVIEW / SHARE LOOK ›
            </button>
          </div>
        </div>

        <div className="review-stack-interactive-wrapper">
          <div className="stack-instruction-hint">
            <span>
              <strong>Click / Drag Top Card</strong> to send to back and see next review
            </span>
            <div className="stack-nav-buttons">
              <button className="stack-nav-btn" onClick={triggerStackNext} title="Next Review">
                Next Card ➔
              </button>
            </div>
          </div>

          <div className="stack-container" id="reviewStackRoot">
            {reviews.map((rev, index) => {
              const offset = (index - activeReviewIndex + total) % total;
              const isTop = offset === 0;
              return (
                <div
                  key={rev.id}
                  className="card-rotate"
                  data-index={index}
                  onClick={isTop ? triggerStackNext : undefined}
                  style={{
                    zIndex: total - offset,
                    transform: `translate3d(0px, ${offset * 12}px, -${offset * 35}px) scale(${1 - offset * 0.04})`,
                    opacity: offset > 3 ? 0 : 1,
                    pointerEvents: isTop ? 'auto' : 'none',
                  }}
                >
                  <div className="card">
                    <div className="stack-review-card-inner">
                      <div className="stack-media-col">
                        {rev.media_url ? (
                          rev.is_video ? (
                            <video src={rev.media_url} autoPlay loop muted playsInline />
                          ) : (
                            <img src={rev.media_url} alt={rev.outfit} />
                          )
                        ) : (
                          <img src="/hero-bg.jpg" alt="Butta Bomma Patron" />
                        )}
                        <span className="stack-media-overlay-tag">VERIFIED PURCHASE</span>
                      </div>
                      <div className="stack-content-col">
                        <div>
                          <div className="stack-review-top">
                            <span className="review-stars">
                              {'★'.repeat(rev.rating)}
                              {'☆'.repeat(5 - rev.rating)}
                            </span>
                            <span className="review-verified-badge">✓ Verified Patron</span>
                          </div>
                          <div className="review-outfit-tag">Piece: {rev.outfit}</div>
                          <p className="review-text-content">&ldquo;{rev.comment}&rdquo;</p>
                        </div>
                        <div className="stack-author-footer">
                          <div className="author-avatar">{rev.name?.charAt(0)}</div>
                          <div>
                            <div className="author-name">{rev.name}</div>
                            <div className="author-city">{rev.city}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
