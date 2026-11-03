import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/Store';

export default function Categories() {
  const { categories, filterCategory } = useStore();
  const navigate = useNavigate();

  return (
    <section className="section-container" id="categories">
      <div className="section-title-block">
        <h2 className="section-heading">SHOP BY CATEGORY</h2>
        <div className="section-decorative-divider">◆ ─── ❖ ─── ◆</div>
        <p className="section-subheading">Handcrafted heirloom weaves, bridal masterworks, and festive couture.</p>
      </div>
      <div className="category-cards-grid">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            className="category-card"
            onClick={() => {
              filterCategory(cat.slug);
              navigate(`/shop/${cat.slug}`);
            }}
          >
            <div className="category-img-holder">
              <img src={cat.image_url} alt={`${cat.title} Collection`} loading="lazy" />
              <div className="category-overlay-gradient" />
            </div>
            <div className="category-content-tag">
              <h3>{cat.title}</h3>
              <span className="category-cta-link">{cat.cta}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
