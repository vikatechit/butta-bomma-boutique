export default function Benefits() {
  return (
    <section className="benefits-strip">
      <div className="benefits-container">
        <div className="benefit-item">
          <div className="benefit-icon-badge">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="benefit-text">
            <h4>PREMIUM QUALITY</h4>
            <span>Finest Handloom Fabrics</span>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon-badge">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
          </div>
          <div className="benefit-text">
            <h4>CUSTOM TAILORING</h4>
            <span>Made Just For You</span>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon-badge">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="benefit-text">
            <h4>SECURE PACKAGING</h4>
            <span>Delivered Safely</span>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon-badge">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className="benefit-text">
            <h4>FREE SHIPPING</h4>
            <span>Across India</span>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon-badge">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="benefit-text">
            <h4>EASY RETURNS</h4>
            <span>7-Day Exchange</span>
          </div>
        </div>
      </div>
    </section>
  );
}
