import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { apiGet } from '../../api/client';
import { useBoutique } from '../../context/BoutiqueContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartScaleOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#f5f5f0', font: { family: 'Montserrat' } } },
  },
  scales: {
    x: { ticks: { color: '#a3b8b0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#a3b8b0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
  },
};

function OverviewTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiGet('/api/admin/analytics', { auth: true });
        if (!res.success) {
          setError('Access denied or session expired. Please re-login.');
        } else {
          setData(res);
        }
      } catch (err) {
        setError('Error loading charts: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40, color: 'var(--gold-400)' }}>Loading sales analytics...</div>;
  }
  if (error) return <div style={{ color: '#ef4444' }}>{error}</div>;
  if (!data) return null;

  const s = data.summary;
  const weeklyData = {
    labels: data.weeklyChart.map((d) => d.label),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: data.weeklyChart.map((d) => d.revenue),
        backgroundColor: 'rgba(212, 175, 55, 0.75)',
        borderColor: '#d4af37',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };
  const monthlyData = {
    labels: data.monthlyChart.map((d) => d.label),
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: data.monthlyChart.map((d) => d.revenue),
        borderColor: '#f6e399',
        backgroundColor: 'rgba(246, 227, 153, 0.15)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
      },
    ],
  };

  return (
    <>
      <div className="sales-filters-bar">
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-400)', marginRight: 6 }}>PERIOD:</span>
        {['Last 7 Days', '30 Days', 'This Month', '3 Months', '6 Months', '12 Months'].map((label, i) => (
          <button key={label} className={`filter-chip-btn${i === 0 ? ' active' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="admin-metrics-summary-grid">
        <div className="admin-stat-card">
          <span>Total Revenue</span>
          <b>₹{s.totalRevenue.toLocaleString('en-IN')}</b>
        </div>
        <div className="admin-stat-card">
          <span>Today&apos;s Sales</span>
          <b>
            ₹{s.todaySales.toLocaleString('en-IN')} ({s.todayOrders} orders)
          </b>
        </div>
        <div className="admin-stat-card">
          <span>Total Orders</span>
          <b>{s.totalOrders}</b>
        </div>
        <div className="admin-stat-card">
          <span>Pending Orders</span>
          <b style={{ color: '#facc15' }}>{s.pendingOrders}</b>
        </div>
        <div className="admin-stat-card">
          <span>Confirmed Orders</span>
          <b style={{ color: '#86efac' }}>{s.confirmedOrders}</b>
        </div>
        <div className="admin-stat-card">
          <span>Avg Order Value (AOV)</span>
          <b>₹{s.averageOrderValue.toLocaleString('en-IN')}</b>
        </div>
        <div className="admin-stat-card">
          <span>Active Products</span>
          <b>{s.activeProducts}</b>
        </div>
        <div className="admin-stat-card">
          <span>Total Atelier Stock</span>
          <b>{s.totalStock} Units</b>
        </div>
        <div className="admin-stat-card">
          <span>Low Stock Items (&lt;=2)</span>
          <b style={{ color: '#f87171' }}>{s.lowStockProducts}</b>
        </div>
        <div className="admin-stat-card">
          <span>Out of Stock</span>
          <b style={{ color: '#ef4444' }}>{s.outOfStockProducts}</b>
        </div>
      </div>

      <div className="admin-charts-grid">
        <div className="chart-card-box">
          <div className="chart-header-row">
            <span className="chart-title">Weekly Sales Trend (INR)</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last 7 Days</span>
          </div>
          <div className="chart-canvas-holder">
            <Bar data={weeklyData} options={chartScaleOpts} />
          </div>
        </div>
        <div className="chart-card-box">
          <div className="chart-header-row">
            <span className="chart-title">Monthly Performance (Last 12 Months)</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Annual Performance</span>
          </div>
          <div className="chart-canvas-holder">
            <Line data={monthlyData} options={chartScaleOpts} />
          </div>
        </div>
      </div>
    </>
  );
}

function HeroTab() {
  const { heroSlides, openAddHeroModal, openEditHeroModal, deleteHeroSlide } = useBoutique();

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-400)' }}>
            Manage Hero Showcase Accordion Slides
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Upload model photos, change labels, or reorder the homepage accordion gallery.
          </p>
        </div>
        <button className="gold-luxury-btn" onClick={openAddHeroModal}>
          + Add New Slide
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Preview</th>
            <th>Label / Title</th>
            <th>Link Target</th>
            <th>Sort Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {heroSlides.map((s) => (
            <tr key={s.id}>
              <td>
                <img
                  src={s.image_url}
                  alt={s.label}
                  style={{
                    width: 70,
                    height: 50,
                    objectFit: 'cover',
                    borderRadius: 4,
                    border: '1px solid var(--border-gold)',
                  }}
                />
              </td>
              <td>
                <strong style={{ color: '#fff', fontSize: 14 }}>{s.label}</strong>
              </td>
              <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.link || '#categories'}</td>
              <td>
                <strong style={{ color: 'var(--gold-400)' }}>{s.sort_order || 0}</strong>
              </td>
              <td>
                <button
                  className="gold-luxury-btn"
                  style={{ padding: '4px 10px', fontSize: 11, marginRight: 6 }}
                  onClick={() => openEditHeroModal(s.id)}
                >
                  Edit
                </button>
                <button
                  className="outline-gold-btn"
                  style={{ padding: '4px 8px', fontSize: 11 }}
                  onClick={() => deleteHeroSlide(s.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function CategoriesTab() {
  const { categories, updateCategory, uploadFile } = useBoutique();
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    const next = {};
    categories.forEach((c) => {
      next[c.id] = {
        title: c.title,
        cta: c.cta,
        image_url: c.image_url,
        sort_order: c.sort_order ?? 0,
      };
    });
    setDrafts(next);
  }, [categories]);

  const setField = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleUpload = async (id, file) => {
    if (!file) return;
    setUploadingId(id);
    try {
      const data = await uploadFile(file);
      if (data.success) {
        setField(id, 'image_url', data.url);
      } else {
        alert(data.error || 'Upload failed.');
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleSave = async (id) => {
    const draft = drafts[id];
    if (!draft?.image_url) {
      alert('Category image is required.');
      return;
    }
    setSavingId(id);
    const ok = await updateCategory(id, {
      title: draft.title?.trim(),
      cta: draft.cta?.trim(),
      image_url: draft.image_url.trim(),
      sort_order: draft.sort_order,
    });
    setSavingId(null);
    if (ok) alert('Category updated — Shop By Category image refreshed.');
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-400)' }}>
          Shop By Category Cards
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          Upload or paste a new image for each category tile on the homepage. Title and CTA text can also be edited.
        </p>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Preview</th>
            <th>Category / Slug</th>
            <th>Title &amp; CTA</th>
            <th>Image</th>
            <th>Sort</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => {
            const draft = drafts[c.id] || {};
            return (
              <tr key={c.id}>
                <td>
                  <img
                    src={draft.image_url || c.image_url}
                    alt={c.title}
                    style={{
                      width: 72,
                      height: 90,
                      objectFit: 'cover',
                      borderRadius: 4,
                      border: '1px solid var(--border-gold)',
                    }}
                  />
                </td>
                <td>
                  <strong style={{ color: '#fff' }}>{c.slug}</strong>
                </td>
                <td>
                  <input
                    type="text"
                    value={draft.title || ''}
                    onChange={(e) => setField(c.id, 'title', e.target.value)}
                    style={{
                      width: '100%',
                      marginBottom: 6,
                      background: 'var(--forest-900)',
                      color: '#fff',
                      border: '1px solid var(--border-gold)',
                      padding: '6px 8px',
                      fontSize: 12,
                    }}
                    placeholder="Title e.g. SAREES"
                  />
                  <input
                    type="text"
                    value={draft.cta || ''}
                    onChange={(e) => setField(c.id, 'cta', e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--forest-900)',
                      color: '#fff',
                      border: '1px solid var(--border-gold)',
                      padding: '6px 8px',
                      fontSize: 12,
                    }}
                    placeholder="CTA e.g. EXPLORE WEAVES →"
                  />
                </td>
                <td style={{ minWidth: 200 }}>
                  <input
                    type="text"
                    value={draft.image_url || ''}
                    onChange={(e) => setField(c.id, 'image_url', e.target.value)}
                    placeholder="Image URL or upload below"
                    style={{
                      width: '100%',
                      marginBottom: 6,
                      background: 'var(--forest-900)',
                      color: '#fff',
                      border: '1px solid var(--border-gold)',
                      padding: '6px 8px',
                      fontSize: 11,
                    }}
                  />
                  <label className="outline-gold-btn" style={{ padding: '4px 8px', fontSize: 11, cursor: 'pointer', display: 'inline-block' }}>
                    {uploadingId === c.id ? 'Uploading…' : '📸 Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={uploadingId === c.id}
                      onChange={(e) => handleUpload(c.id, e.target.files?.[0])}
                    />
                  </label>
                </td>
                <td>
                  <input
                    type="number"
                    value={draft.sort_order ?? 0}
                    onChange={(e) => setField(c.id, 'sort_order', e.target.value)}
                    style={{
                      width: 56,
                      background: 'var(--forest-900)',
                      color: '#fff',
                      border: '1px solid var(--border-gold)',
                      padding: '6px 8px',
                      fontSize: 12,
                    }}
                  />
                </td>
                <td>
                  <button
                    className="gold-luxury-btn"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    disabled={savingId === c.id}
                    onClick={() => handleSave(c.id)}
                  >
                    {savingId === c.id ? 'Saving…' : 'Save'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function InventoryTab() {
  const { products, adjustProductStock, setProductStock, deleteProduct, switchAdminTab } = useBoutique();

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-400)' }}>
          Product Catalog & Stock Management
        </h3>
        <button className="gold-luxury-btn" onClick={() => switchAdminTab('add-product')}>
          + Add New Product
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price (₹)</th>
            <th>Stock Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <img
                  src={p.image_url}
                  alt={p.name}
                  style={{
                    width: 50,
                    height: 60,
                    objectFit: 'cover',
                    borderRadius: 3,
                    border: '1px solid var(--border-gold)',
                  }}
                />
              </td>
              <td>
                <strong>{p.name}</strong>
                <br />
                <small style={{ color: 'var(--text-muted)' }}>{p.fabric || ''}</small>
              </td>
              <td>
                <span className="product-category-tag">{p.category}</span>
              </td>
              <td>₹{p.price.toLocaleString('en-IN')}</td>
              <td>
                <div className="table-stepper">
                  <button onClick={() => adjustProductStock(p.id, -1)}>−</button>
                  <input
                    type="number"
                    defaultValue={p.stock}
                    key={`stock-${p.id}-${p.stock}`}
                    onBlur={(e) => setProductStock(p.id, e.target.value)}
                  />
                  <button onClick={() => adjustProductStock(p.id, 1)}>+</button>
                </div>
              </td>
              <td>
                <button
                  className="outline-gold-btn"
                  style={{ padding: '4px 8px', fontSize: 11 }}
                  onClick={() => deleteProduct(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function AddProductTab() {
  const { handleAdminAddProduct, uploadFile } = useBoutique();
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');

  return (
    <>
      <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-400)', marginBottom: 16 }}>
        Add New Handcrafted Piece
      </h3>
      <form
        className="luxury-form"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          handleAdminAddProduct({
            name: fd.get('name').toString().trim(),
            category: fd.get('category').toString(),
            price: fd.get('price'),
            original_price: fd.get('original_price') || null,
            stock: fd.get('stock'),
            badge: fd.get('badge').toString().trim(),
            fabric: fd.get('fabric').toString().trim(),
            description: fd.get('description').toString().trim(),
            image_url: imageUrl || fd.get('image_url')?.toString().trim(),
          });
        }}
      >
        <div className="form-row-2">
          <div className="form-group">
            <label>Product Name *</label>
            <input type="text" name="name" required placeholder="e.g. Royal Korvai Pure Silk Saree" />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select name="category" required defaultValue="sarees">
              <option value="sarees">Sarees</option>
              <option value="lehengas">Lehengas</option>
              <option value="dresses">Dresses</option>
              <option value="kurtis">Kurtis</option>
              <option value="suits">Suits</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Selling Price (₹) *</label>
            <input type="number" name="price" required placeholder="e.g. 5499" />
          </div>
          <div className="form-group">
            <label>Original Price (MRP Strike-through) (₹)</label>
            <input type="number" name="original_price" placeholder="e.g. 8999" />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Initial Stock Quantity *</label>
            <input type="number" name="stock" required defaultValue={5} />
          </div>
          <div className="form-group">
            <label>Badge Tag</label>
            <input type="text" name="badge" defaultValue="NEW" placeholder="NEW, HEIRLOOM, EXCLUSIVE" />
          </div>
        </div>

        <div className="form-group">
          <label>Fabric & Weave Type</label>
          <input type="text" name="fabric" placeholder="e.g. Pure Mulberry Silk with Gold Zari Border" />
        </div>

        <div className="form-group">
          <label>Description & Styling Notes</label>
          <textarea name="description" rows={2} placeholder="Handcrafted with pure silk threads..." />
        </div>

        <div className="form-group">
          <label>Product Image (File Upload or Image URL) *</label>
          <div
            className="image-upload-dropzone"
            onClick={() => document.getElementById('newProdFileInput')?.click()}
          >
            <input
              type="file"
              id="newProdFileInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const data = await uploadFile(file);
                  if (data.success) {
                    setImageUrl(data.url);
                    setPreview(data.url);
                  } else {
                    alert('Upload failed: ' + data.error);
                  }
                } catch (err) {
                  alert('Upload error: ' + err.message);
                }
              }}
            />
            <span style={{ fontSize: 13, color: 'var(--gold-400)' }}>📸 Click to Upload Image from Computer</span>
            {preview ? (
              <div id="newProdImgPreview" className="preview-thumb-box" style={{ display: 'block' }}>
                <img src={preview} alt="product" />{' '}
                <span style={{ color: '#86efac', fontSize: 12 }}>✓ Uploaded</span>
              </div>
            ) : null}
          </div>
          <input
            type="text"
            name="image_url"
            placeholder="Or enter direct Image URL"
            style={{ marginTop: 8 }}
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setPreview(e.target.value);
            }}
          />
        </div>

        <button type="submit" className="gold-luxury-btn btn-full" style={{ marginTop: 10 }}>
          PUBLISH TO STOREFRONT ›
        </button>
      </form>
    </>
  );
}

function OrdersTab({ onPendingCount }) {
  const { updateOrderStatus, deleteAdminOrder } = useBoutique();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/admin/orders', { auth: true });
      if (!data.success) {
        setError('Session expired.');
        return;
      }
      setOrders(data.orders || []);
      const pending = (data.orders || []).filter((o) => o.order_status === 'Pending').length;
      onPendingCount?.(pending);
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40, color: 'var(--gold-400)' }}>Loading orders archive...</div>;
  }
  if (error) return <div style={{ color: '#ef4444' }}>{error}</div>;
  if (!orders.length) {
    return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No orders recorded yet.</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-400)' }}>
          Orders Management ({orders.length} Total)
        </h3>
        <button className="outline-gold-btn" onClick={() => window.open('/api/admin/orders', '_blank')}>
          📥 Export Orders CSV
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Patron / Contact</th>
            <th>Items</th>
            <th>Total (₹)</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <strong>#{o.order_number}</strong>
                <br />
                <small style={{ color: 'var(--text-muted)' }}>
                  {new Date(o.created_at).toLocaleDateString('en-IN')}
                </small>
              </td>
              <td>
                <strong>{o.customer_name}</strong>
                <br />
                <a href={`https://wa.me/91${o.mobile}`} target="_blank" rel="noreferrer" style={{ color: '#86efac' }}>
                  📱 +91 {o.mobile}
                </a>
                <br />
                <small style={{ color: 'var(--text-muted)' }}>
                  {o.city} - {o.pincode}
                </small>
              </td>
              <td style={{ fontSize: 12 }}>
                {(o.items || []).map((i, idx) => (
                  <div key={idx}>
                    • {i.name} (x{i.qty}, {i.size})
                  </div>
                ))}
              </td>
              <td>
                <strong>₹{o.total_amount.toLocaleString('en-IN')}</strong>
              </td>
              <td>
                <select
                  defaultValue={o.order_status}
                  onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                  style={{
                    background: 'var(--forest-900)',
                    color: '#fff',
                    border: '1px solid var(--border-gold)',
                    padding: 4,
                    fontSize: 11,
                  }}
                >
                  {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <span style={{ fontSize: 11, color: 'var(--gold-400)' }}>{o.payment_method}</span>
              </td>
              <td>
                <button
                  className="outline-gold-btn"
                  style={{ padding: '4px 8px', fontSize: 11 }}
                  onClick={async () => {
                    const ok = await deleteAdminOrder(o.id, o.order_number);
                    if (ok) loadOrders();
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function ReviewsTab() {
  const { reviews, deleteReviewItem } = useBoutique();

  return (
    <>
      <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-400)', marginBottom: 16 }}>
        Client Reviews Moderation
      </h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Media</th>
            <th>Patron Name</th>
            <th>City</th>
            <th>Rating</th>
            <th>Outfit</th>
            <th>Feedback</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id}>
              <td>
                {r.media_url ? (
                  <img
                    src={r.media_url}
                    alt=""
                    style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: 3 }}
                  />
                ) : (
                  '—'
                )}
              </td>
              <td>
                <strong>{r.name}</strong>
              </td>
              <td>{r.city}</td>
              <td style={{ color: '#facc15' }}>{'★'.repeat(r.rating)}</td>
              <td>{r.outfit}</td>
              <td style={{ fontSize: 12, maxWidth: 260 }}>{r.comment}</td>
              <td>
                <button
                  className="outline-gold-btn"
                  style={{ padding: '4px 8px', fontSize: 11 }}
                  onClick={() => deleteReviewItem(r.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function PaymentsTab() {
  const { storeSettings, handleSavePaymentSettings } = useBoutique();

  return (
    <>
      <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-400)', marginBottom: 16 }}>
        Payment Gateways & Store Configuration
      </h3>
      <form
        className="luxury-form"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          handleSavePaymentSettings({
            razorpay_payment_link: fd.get('razorpay_payment_link').toString().trim(),
            upi_id: fd.get('upi_id').toString().trim(),
            whatsapp_number: fd.get('whatsapp_number').toString().trim(),
            upi_enabled: fd.get('upi_enabled') === '1',
            cod_enabled: fd.get('cod_enabled') === '1',
          });
        }}
      >
        <div className="form-group">
          <label>Razorpay Public Payment Link (https://rzp.io/...)</label>
          <input
            type="url"
            name="razorpay_payment_link"
            defaultValue={storeSettings.razorpay_payment_link || ''}
            placeholder="https://rzp.io/l/your-link"
          />
        </div>

        <div className="form-group">
          <label>Merchant UPI ID (for Direct Payments & COD Tokens)</label>
          <input
            type="text"
            name="upi_id"
            defaultValue={storeSettings.upi_id || ''}
            placeholder="e.g. buttabomma@okhdfcbank"
          />
        </div>

        <div className="form-group">
          <label>WhatsApp Support & Order Dispatch Number</label>
          <input
            type="text"
            name="whatsapp_number"
            defaultValue={storeSettings.whatsapp_number || '917382891980'}
            placeholder="917382891980"
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Enable UPI Payments</label>
            <select name="upi_enabled" defaultValue={storeSettings.upi_enabled ? '1' : '0'}>
              <option value="1">Enabled (Active)</option>
              <option value="0">Disabled</option>
            </select>
          </div>
          <div className="form-group">
            <label>Enable Cash On Delivery (COD)</label>
            <select name="cod_enabled" defaultValue={storeSettings.cod_enabled ? '1' : '0'}>
              <option value="1">Enabled (Active)</option>
              <option value="0">Disabled</option>
            </select>
          </div>
        </div>

        <button type="submit" className="gold-luxury-btn btn-full" style={{ marginTop: 10 }}>
          SAVE PAYMENT SETTINGS ›
        </button>
      </form>
    </>
  );
}

function SecurityTab() {
  const { handleChangePassword } = useBoutique();

  return (
    <>
      <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-400)', marginBottom: 16 }}>
        Admin Passcode & Security Credentials
      </h3>
      <form
        className="luxury-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const ok = await handleChangePassword(
            fd.get('currentPassword').toString(),
            fd.get('newPassword').toString(),
            fd.get('confirmPassword').toString()
          );
          if (ok) e.target.reset();
        }}
      >
        <div className="form-group">
          <label>Current Passcode *</label>
          <input type="password" name="currentPassword" required placeholder="Enter current passcode" />
        </div>
        <div className="form-group">
          <label>New Passcode *</label>
          <input type="password" name="newPassword" required placeholder="Enter new passcode" />
        </div>
        <div className="form-group">
          <label>Confirm New Passcode *</label>
          <input type="password" name="confirmPassword" required placeholder="Confirm new passcode" />
        </div>
        <button type="submit" className="gold-luxury-btn btn-full" style={{ marginTop: 10 }}>
          UPDATE PASSCODE ›
        </button>
      </form>
    </>
  );
}

const TABS = [
  { id: 'overview', label: '📊 Sales Analytics' },
  { id: 'hero', label: '🖼️ Hero Accordion' },
  { id: 'categories', label: '🗂️ Shop Categories' },
  { id: 'inventory', label: '📦 Stock & Pricing' },
  { id: 'add-product', label: '➕ Add Product' },
  { id: 'orders', label: '🧾 Orders' },
  { id: 'reviews', label: '⭐ Reviews' },
  { id: 'payments', label: '💳 Payment Settings' },
  { id: 'security', label: '🔐 Security' },
];

export default function AdminDashboard() {
  const { modals, currentAdminTab, switchAdminTab, logoutAdmin, storeSettings } = useBoutique();
  const [pendingCount, setPendingCount] = useState(0);
  const logo = storeSettings.logo_url || '/logo.png';

  if (!modals.adminDashboardModal) return null;

  return (
    <div className="modal-overlay active" id="adminDashboardModal">
      <div className="modal-card modal-xl admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-topbar">
          <div className="admin-title-badge">
            <img src={logo} alt="Logo" style={{ height: 48, objectFit: 'contain' }} />
            <div>
              <h3>BUTTA BOMMA COLLECTIONS — ATELIER CONTROL ROOM</h3>
              <span className="admin-role-tag">STORE MANAGER LIVE MODE</span>
            </div>
          </div>
          <div className="admin-topbar-actions">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`admin-nav-tab${currentAdminTab === tab.id ? ' active' : ''}`}
                onClick={() => switchAdminTab(tab.id)}
              >
                {tab.id === 'orders' ? (
                  <>
                    🧾 Orders (<span id="adminPendingCount">{pendingCount}</span>)
                  </>
                ) : (
                  tab.label
                )}
              </button>
            ))}
            <button className="admin-logout-btn" onClick={logoutAdmin}>
              Logout
            </button>
          </div>
        </div>

        <div className="admin-tab-content-area" id="adminTabContent">
          {currentAdminTab === 'overview' && <OverviewTab />}
          {currentAdminTab === 'hero' && <HeroTab />}
          {currentAdminTab === 'categories' && <CategoriesTab />}
          {currentAdminTab === 'inventory' && <InventoryTab />}
          {currentAdminTab === 'add-product' && <AddProductTab />}
          {currentAdminTab === 'orders' && <OrdersTab onPendingCount={setPendingCount} />}
          {currentAdminTab === 'reviews' && <ReviewsTab />}
          {currentAdminTab === 'payments' && <PaymentsTab />}
          {currentAdminTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}
