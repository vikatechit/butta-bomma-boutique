import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useBoutique } from '../context/BoutiqueContext';

export default function Hero() {
  const { heroSlides } = useBoutique();
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !heroSlides.length) return;

    const panels = Array.from(root.querySelectorAll('.ag-panel'));
    if (!panels.length) return;

    const expandPanel = (activePanel) => {
      panels.forEach((p) => {
        p.classList.remove('ag-panel--active');
        gsap.to(p, { flexGrow: 1, duration: 0.5, ease: 'power2.out' });
        const bar = p.querySelector('.ag-panel__bar');
        const text = p.querySelector('.ag-panel__text');
        const media = p.querySelector('.ag-panel__media');
        if (bar) gsap.to(bar, { opacity: 0, duration: 0.2 });
        if (text) gsap.to(text, { opacity: 0, duration: 0.2 });
        if (media) gsap.to(media, { '--ag-gray': 1, '--ag-dim': 0.35, duration: 0.4 });
      });

      activePanel.classList.add('ag-panel--active');
      gsap.to(activePanel, { flexGrow: 4, duration: 0.5, ease: 'power2.out' });
      const bar = activePanel.querySelector('.ag-panel__bar');
      const text = activePanel.querySelector('.ag-panel__text');
      const media = activePanel.querySelector('.ag-panel__media');
      if (bar) gsap.to(bar, { opacity: 1, duration: 0.3, delay: 0.1 });
      if (text) gsap.to(text, { opacity: 1, duration: 0.3, delay: 0.1 });
      if (media) gsap.to(media, { '--ag-gray': 0, '--ag-dim': 0, duration: 0.4 });
    };

    const cleanups = panels.map((panel) => {
      const onEnter = () => expandPanel(panel);
      const onClick = (e) => {
        if (!panel.classList.contains('ag-panel--active')) {
          e.preventDefault();
          expandPanel(panel);
        }
      };
      panel.addEventListener('mouseenter', onEnter);
      panel.addEventListener('click', onClick);
      return () => {
        panel.removeEventListener('mouseenter', onEnter);
        panel.removeEventListener('click', onClick);
      };
    });

    expandPanel(panels[0]);
    return () => cleanups.forEach((fn) => fn());
  }, [heroSlides]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section" id="home">
      <div className="hero-backdrop" />
      <div className="hero-backdrop-gradient" />

      <div className="hero-inner-container">
        <div className="hero-text-content">
          <div className="hero-ornament-top">
            <span className="ornament-line" />
            <span className="ornament-diamond">✦</span>
            <span className="ornament-line" />
          </div>

          <h1 className="hero-headline-single">
            BUTTA BOMMA<br />
            <span className="hero-gold-gradient-text">COLLECTIONS</span>
          </h1>

          <div className="hero-cta-group">
            <button className="gold-luxury-btn" onClick={() => scrollTo('categories')}>
              EXPLORE COLLECTION <span className="btn-arrow">›</span>
            </button>
            <button className="outline-gold-btn" onClick={() => scrollTo('customization')}>
              BESPOKE STITCHING
            </button>
          </div>
        </div>

        <div className="hero-gallery-wrapper">
          <div className="gallery-header-label">
            <span className="sparkle-gold-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#f6e399">
                <path d="M12 0l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 0z" />
              </svg>
            </span>
            <span>CURATED SHOWCASE <small>(Hover / Touch to Expand)</small></span>
          </div>

          <div
            id="heroAccordionRoot"
            className="accordion-gallery"
            role="list"
            aria-label="Featured Collection Gallery"
            ref={rootRef}
          >
            {heroSlides.map((slide, index) => (
              <a
                key={slide.id}
                href={slide.link || '#categories'}
                className={`ag-panel${index === 0 ? ' ag-panel--active' : ''}`}
                data-index={index}
                role="listitem"
              >
                <div className="ag-panel__frame">
                  <div className="ag-panel__media">
                    <img src={slide.image_url} alt={slide.label} loading="eager" />
                  </div>
                  <div className="ag-panel__overlay" />
                  <div className="ag-panel__label">
                    <div className="ag-panel__bar" />
                    <span className="ag-panel__text">{slide.label}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
