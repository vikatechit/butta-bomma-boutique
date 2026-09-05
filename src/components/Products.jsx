import { useBoutique } from '../context/BoutiqueContext';

const CATEGORY_PILLS = [
  { id: 'all', label: 'All Items' },
  { id: 'sarees', label: 'Sarees' },
  { id: 'lehengas', label: 'Lehengas' },
  { id: 'dresses', label: 'Dresses' },
  { id: 'kurtis', label: 'Kurtis' },
  { id: 'suits', label: 'Suits' },
  { id: 'accessories', label: 'Accessories' },
];

export default function Products() {
  const {
    filteredProducts,
    activeCategory,
    activePriceTier,
    priceTiers,
    filterStatusText,
    filterCategory,
    setPriceTier,
    resetFilters,
    openProductDetail,
    addToCartDirect,
  } = useBoutique();

  return (
    <section className="section-container" id="new-arrivals">
      <div className="section-title-block">
        <h2 className="section-heading">NEW ARRIVALS</h2>
        <div className="section-decorative-divider">◆ ─── ❖ ─── ◆</div>
        <p className="section-subheading">
          Fresh from our master weavers. Handpicked luxury pieces ready for immediate dispatch.
        </p>
      </div>

      <div className="filter-controls-bar">
        <div className="category-filter-pills" id="categoryFilterPills">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.id}
              className={`pill-btn${activeCategory === pill.id ? ' active' : ''}`}
              onClick={() => filterCategory(pill.id)}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="price-tier-row" id="priceTierRow">
          {priceTiers.map((t) => (
            <div
              key={t.id}
              className={`price-tier-btn${activePriceTier === t.id ? ' active' : ''}`}
              data-tier={t.id}
              onClick={() => setPriceTier(t.id)}
            >
              <strong>{t.title}</strong>
              <span>{t.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="active-filter-status" id="activeFilterStatus">
        <span id="filterStatusText">{filterStatusText}</span>
        <button className="reset-filter-btn" onClick={resetFilters}>Reset All Filters ✕</button>
      </div>

      <div className="products-luxury-grid" id="productsGrid">
        {!filteredProducts.length ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--gold-400)' }}>
            <p style={{ fontSize: 20, fontFamily: 'var(--font-display)' }}>No pieces found matching this filter.</p>
            <button className="outline-gold-btn" onClick={resetFilters} style={{ marginTop: 14 }}>
              View All Masterpieces
            </button>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isOutOfStock = p.stock <= 0;
            const isLowStock = p.stock > 0 && p.stock <= 2;
            const stockClass = isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : 'stock-in';
            const stockText = isOutOfStock
              ? '⚠️ Out of Stock'
              : isLowStock
                ? `⚠️ Only ${p.stock} left in atelier`
                : `✓ In Stock (${p.stock})`;

            return (
              <div className="product-luxury-card" data-id={p.id} key={p.id}>
                <div className={`product-badge-flag${isLowStock ? ' product-badge-low' : ''}`}>
                  {isLowStock ? 'FEW LEFT' : p.badge || 'NEW'}
                </div>

                <div className="product-img-wrapper" onClick={() => openProductDetail(p.id)}>
                  <img src={p.image_url} alt={p.name} loading="lazy" />
                  <div className="product-quickview-overlay">
                    <button className="quickview-btn">VIEW DETAILS ›</button>
                  </div>
                </div>

                <div className="product-details-body">
                  <span className="product-category-tag">{p.category}</span>
                  <h3
                    className="product-title"
                    onClick={() => openProductDetail(p.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {p.name}
                  </h3>

                  <div className="product-price-tag">
                    ₹{p.price.toLocaleString('en-IN')}
                    {p.original_price ? (
                      <span
                        style={{
                          fontSize: 14,
                          textDecoration: 'line-through',
                          color: 'var(--text-muted)',
                          marginLeft: 6,
                        }}
                      >
                        ₹{p.original_price.toLocaleString('en-IN')}
                      </span>
                    ) : null}
                  </div>

                  <div className={`product-stock-tag ${stockClass}`}>{stockText}</div>

                  <div className="product-card-actions">
                    <button
                      className="add-bag-btn"
                      onClick={() => addToCartDirect(p.id)}
                      disabled={isOutOfStock}
                    >
                      {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG +'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
