import { useBoutique } from '../context/BoutiqueContext';

export default function Categories() {
  const { categories, filterCategory } = useBoutique();

  const onSelect = (cat) => {
    filterCategory(cat);
    document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section-container" id="categories">
      <div className="section-title-block">
        <h2 className="section-heading">SHOP BY CATEGORY</h2>
        <div className="section-decorative-divider">◆ ─── ❖ ─── ◆</div>
        <p className="section-subheading">Handcrafted heirloom weaves, bridal masterworks, and festive couture.</p>
      </div>

      <div className="category-cards-grid">
        {categories.map((cat) => (
          <div key={cat.id} className="category-card" onClick={() => onSelect(cat.slug)}>
            <div className="category-img-holder">
              <img src={cat.image_url} alt={`${cat.title} Collection`} loading="lazy" />
              <div className="category-overlay-gradient" />
            </div>
            <div className="category-content-tag">
              <h3>{cat.title}</h3>
              <span className="category-cta-link">{cat.cta}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
