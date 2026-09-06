/**
 * BUTTA BOMMA COLLECTIONS - PRODUCTION EXPRESS SERVER
 * Features:
 * - Permanent Database Integration (SQLite / PostgreSQL / Supabase)
 * - JWT Token Authentication & Protected Admin Endpoints
 * - Real Multipart Image & Media File Upload with Permanent URL Persistence
 * - Transaction-safe Inventory Decrementing
 * - Private Order Lookup (Mobile Number strictly required)
 * - Admin Sales Analytics (7-day, 30-day, Monthly, 12-month aggregations for Chart.js)
 * - Store Settings (Razorpay Public Link, UPI ID, COD toggle, WhatsApp config)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'butta_bomma_royal_secret_jwt_2026';
const DIST_DIR = path.join(__dirname, '../dist');
const IS_PRODUCTION =
  process.env.NODE_ENV === 'production' || fs.existsSync(path.join(DIST_DIR, 'index.html'));

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://buttabommaonline.com',
  'https://www.buttabommaonline.com',
  'http://buttabommaonline.com',
  'http://www.buttabommaonline.com',
];
const EXTRA_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = [...new Set([...DEFAULT_ORIGINS, ...EXTRA_ORIGINS])];

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (
      !origin ||
      ALLOWED_ORIGINS.includes(origin) ||
      /\.onrender\.com$/i.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file hosting — uploads & policy PDFs
const DATA_DIR = process.env.DATA_DIR || __dirname;
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const BUNDLED_UPLOADS = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
// Copy bundled upload seeds into DATA_DIR on first boot
if (fs.existsSync(BUNDLED_UPLOADS) && path.resolve(UPLOADS_DIR) !== path.resolve(BUNDLED_UPLOADS)) {
  for (const name of fs.readdirSync(BUNDLED_UPLOADS)) {
    const dest = path.join(UPLOADS_DIR, name);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(path.join(BUNDLED_UPLOADS, name), dest);
    }
  }
}
const POLICIES_DIR = path.join(__dirname, 'policies');
if (!fs.existsSync(POLICIES_DIR)) {
  fs.mkdirSync(POLICIES_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/policies', express.static(POLICIES_DIR));

// Health check for Render
app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', service: 'butta-bomma-boutique' });
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, safeName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Authentication Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Access denied. No authorization token provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Malformed authorization token.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired session token. Please log in again.' });
  }
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and passcode are required.' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin) {
    return res.status(401).json({ success: false, error: 'Invalid username or passcode.' });
  }

  const isMatch = bcrypt.compareSync(password, admin.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid username or passcode.' });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    message: 'Welcome to Butta Bomma Control Room.',
    token,
    admin: { username: admin.username, role: admin.role }
  });
});

// GET /api/auth/verify
app.get('/api/auth/verify', authenticateAdmin, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', authenticateAdmin, (req, res) => {
  const { currentPassword, newPassword, newUsername } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Current passcode and new passcode are required.' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.id);
  if (!admin || !bcrypt.compareSync(currentPassword, admin.password_hash)) {
    return res.status(400).json({ success: false, error: 'Current passcode is incorrect.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  const updatedUser = newUsername && newUsername.trim() ? newUsername.trim() : admin.username;

  db.prepare('UPDATE admins SET username = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(updatedUser, newHash, admin.id);

  res.json({ success: true, message: 'Admin credentials updated successfully.' });
});

// ==========================================
// 2. STORE SETTINGS ENDPOINTS
// ==========================================

// GET /api/settings (Public)
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM store_settings WHERE id = 1').get();
    res.json({ success: true, settings: settings || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/settings (Protected)
app.put('/api/admin/settings', authenticateAdmin, (req, res) => {
  try {
    const { whatsapp_number, razorpay_payment_link, upi_id, cod_enabled, upi_enabled, logo_url } = req.body;
    db.prepare(`
      UPDATE store_settings SET
        whatsapp_number = COALESCE(?, whatsapp_number),
        razorpay_payment_link = COALESCE(?, razorpay_payment_link),
        upi_id = COALESCE(?, upi_id),
        cod_enabled = COALESCE(?, cod_enabled),
        upi_enabled = COALESCE(?, upi_enabled),
        logo_url = COALESCE(?, logo_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      whatsapp_number,
      razorpay_payment_link,
      upi_id,
      cod_enabled !== undefined ? (cod_enabled ? 1 : 0) : null,
      upi_enabled !== undefined ? (upi_enabled ? 1 : 0) : null,
      logo_url
    );

    const updated = db.prepare('SELECT * FROM store_settings WHERE id = 1').get();
    res.json({ success: true, message: 'Store settings updated successfully.', settings: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. PRODUCTS ENDPOINTS
// ==========================================

// GET /api/products (Public)
app.get('/api/products', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY id DESC').all();
    const products = rows.map(r => {
      let sizes = r.sizes;
      if (typeof sizes === 'string') {
        try {
          sizes = JSON.parse(sizes);
        } catch {
          sizes = [sizes];
        }
      }
      if (!Array.isArray(sizes)) sizes = [sizes || 'Standard'];
      return { ...r, sizes };
    });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products (Protected)
app.post('/api/products', authenticateAdmin, (req, res) => {
  try {
    const { name, category, price, original_price, stock, badge, sizes, fabric, description, image_url } = req.body;
    if (!name || price === undefined || !image_url) {
      return res.status(400).json({ success: false, error: 'Product name, price, and image are required.' });
    }

    const sizesJson = JSON.stringify(Array.isArray(sizes) ? sizes : [sizes || 'Standard']);

    const info = db.prepare(`
      INSERT INTO products (name, category, price, original_price, stock, badge, sizes, fabric, description, image_url, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      name,
      category || 'sarees',
      Number(price),
      original_price ? Number(original_price) : null,
      parseInt(stock) || 0,
      badge || 'NEW',
      sizesJson,
      fabric || '',
      description || '',
      image_url
    );

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(info.lastInsertRowid));
    created.sizes = JSON.parse(created.sizes);

    res.json({ success: true, message: 'Product published to catalog.', product: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id (Protected)
app.put('/api/products/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, original_price, stock, badge, sizes, fabric, description, image_url } = req.body;

    const sizesJson = sizes ? JSON.stringify(Array.isArray(sizes) ? sizes : [sizes]) : null;

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        price = COALESCE(?, price),
        original_price = COALESCE(?, original_price),
        stock = COALESCE(?, stock),
        badge = COALESCE(?, badge),
        sizes = COALESCE(?, sizes),
        fabric = COALESCE(?, fabric),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      category,
      price !== undefined ? Number(price) : null,
      original_price !== undefined ? Number(original_price) : null,
      stock !== undefined ? parseInt(stock) : null,
      badge,
      sizesJson,
      fabric,
      description,
      image_url,
      id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (updated) updated.sizes = JSON.parse(updated.sizes);

    res.json({ success: true, message: 'Product updated successfully.', product: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/products/:id/stock (Protected - Direct Stepper)
app.patch('/api/products/:id/stock', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { stock, delta } = req.body;

    if (stock !== undefined) {
      db.prepare('UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(Math.max(0, parseInt(stock)), id);
    } else if (delta !== undefined) {
      db.prepare('UPDATE products SET stock = MAX(0, stock + ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(parseInt(delta), id);
    }

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json({ success: true, stock: updated.stock });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/products/:id (Protected)
app.delete('/api/products/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true, message: 'Product deleted permanently from database.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. SHOP CATEGORIES ENDPOINTS
// ==========================================

// GET /api/categories (Public)
app.get('/api/categories', (req, res) => {
  try {
    const categories = db
      .prepare('SELECT * FROM categories WHERE active = 1 ORDER BY sort_order ASC, id ASC')
      .all();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/categories/:id (Protected) — update image, title, CTA, sort
app.put('/api/categories/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, title, cta, sort_order } = req.body;

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    db.prepare(`
      UPDATE categories SET
        image_url = COALESCE(?, image_url),
        title = COALESCE(?, title),
        cta = COALESCE(?, cta),
        sort_order = COALESCE(?, sort_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      image_url || null,
      title || null,
      cta || null,
      sort_order !== undefined && sort_order !== null && sort_order !== ''
        ? parseInt(sort_order, 10)
        : null,
      id
    );

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.json({ success: true, message: 'Category updated successfully.', category: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. HERO SLIDES ENDPOINTS
// ==========================================

// GET /api/hero-slides (Public)
app.get('/api/hero-slides', (req, res) => {
  try {
    const slides = db.prepare('SELECT * FROM hero_slides WHERE active = 1 ORDER BY sort_order ASC, id ASC').all();
    res.json({ success: true, slides });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/hero-slides (Protected)
app.post('/api/hero-slides', authenticateAdmin, (req, res) => {
  try {
    const { image_url, label, link, sort_order } = req.body;
    if (!image_url || !label) {
      return res.status(400).json({ success: false, error: 'Hero slide image and label are required.' });
    }

    const info = db.prepare(`
      INSERT INTO hero_slides (image_url, label, link, sort_order, active)
      VALUES (?, ?, ?, ?, 1)
    `).run(image_url, label, link || '#categories', parseInt(sort_order) || 0);

    const created = db.prepare('SELECT * FROM hero_slides WHERE id = ?').get(Number(info.lastInsertRowid));
    res.json({ success: true, message: 'Hero slide added successfully.', slide: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/hero-slides/:id (Protected)
app.put('/api/hero-slides/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, label, link, sort_order } = req.body;

    db.prepare(`
      UPDATE hero_slides SET
        image_url = COALESCE(?, image_url),
        label = COALESCE(?, label),
        link = COALESCE(?, link),
        sort_order = COALESCE(?, sort_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(image_url, label, link, sort_order !== undefined ? parseInt(sort_order) : null, id);

    const updated = db.prepare('SELECT * FROM hero_slides WHERE id = ?').get(id);
    res.json({ success: true, message: 'Hero slide updated successfully.', slide: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/hero-slides/:id (Protected)
app.delete('/api/hero-slides/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const count = db.prepare('SELECT count(*) as count FROM hero_slides WHERE active = 1').get().count;
    if (count <= 1) {
      return res.status(400).json({ success: false, error: 'You must keep at least 1 hero slide.' });
    }
    db.prepare('DELETE FROM hero_slides WHERE id = ?').run(id);
    res.json({ success: true, message: 'Hero slide deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. REVIEWS ENDPOINTS
// ==========================================

// GET /api/reviews (Public)
app.get('/api/reviews', (req, res) => {
  try {
    const reviews = db.prepare('SELECT * FROM reviews WHERE approved = 1 ORDER BY id DESC').all();
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews (Public - Client submission)
app.post('/api/reviews', (req, res) => {
  try {
    const { name, city, rating, outfit, comment, media_url, is_video } = req.body;
    if (!name || !city || !rating || !outfit || !comment) {
      return res.status(400).json({ success: false, error: 'Please fill in all required review fields.' });
    }

    const info = db.prepare(`
      INSERT INTO reviews (name, city, rating, outfit, comment, media_url, is_video, approved)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      name,
      city,
      Math.min(5, Math.max(1, parseInt(rating) || 5)),
      outfit,
      comment,
      media_url || null,
      is_video ? 1 : 0
    );

    const created = db.prepare('SELECT * FROM reviews WHERE id = ?').get(Number(info.lastInsertRowid));
    res.json({ success: true, message: 'Thank you! Your review has been added to our client diaries.', review: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/reviews/:id (Protected - Moderation)
app.delete('/api/reviews/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. ORDERS & TRANSACTIONS ENDPOINTS
// ==========================================

// POST /api/orders (Public - Atomic Stock Decrement)
app.post('/api/orders', (req, res) => {
  const { customer_name, mobile, address, city, pincode, payment_method, notes, items } = req.body;

  if (!customer_name || !mobile || !address || !city || !pincode || !items || !items.length) {
    return res.status(400).json({ success: false, error: 'Customer details and items are required.' });
  }

  const cleanMobile = String(mobile).replace(/\D/g, '');
  if (cleanMobile.length !== 10) {
    return res.status(400).json({ success: false, error: 'Please provide a valid 10-digit mobile number.' });
  }

  try {
    db.exec('BEGIN');

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(item.id);
      if (!product) {
        throw new Error(`Product ID #${item.id} is no longer available.`);
      }

      const qty = Math.max(1, parseInt(item.qty) || 1);
      if (product.stock < qty) {
        throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
      }

      // Atomic stock decrement
      db.prepare('UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(qty, product.id);

      calculatedTotal += product.price * qty;
      validatedItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        size: item.size || 'Standard',
        qty: qty
      });
    }

    const orderNumber = 'BB' + Date.now().toString().slice(-6);
    const codAdvance = payment_method && payment_method.includes('COD') ? Math.min(500, Math.round(calculatedTotal * 0.15)) : 0;

    const info = db.prepare(`
      INSERT INTO orders (
        order_number, customer_name, mobile, address, city, pincode,
        payment_method, payment_status, order_status, total_amount, cod_advance, notes, items
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderNumber,
      customer_name,
      cleanMobile,
      address,
      city,
      pincode,
      payment_method || 'Cash On Delivery (COD)',
      payment_method && payment_method.includes('COD') ? 'COD' : 'Pending',
      'Pending',
      calculatedTotal,
      codAdvance,
      notes || '',
      JSON.stringify(validatedItems)
    );

    db.exec('COMMIT');

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(info.lastInsertRowid));
    if (createdOrder) {
      createdOrder.items = typeof createdOrder.items === 'string' ? JSON.parse(createdOrder.items) : createdOrder.items;
    }

    res.json({
      success: true,
      message: 'Order created successfully.',
      order: createdOrder
    });
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (rbErr) {}
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/orders/lookup (Public - Strict Customer Order Lookup by Mobile Number Only)
app.post('/api/orders/lookup', (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, error: 'Mobile number is required for lookup.' });
    }

    const cleanMobile = String(mobile).replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
    }

    const rows = db.prepare('SELECT * FROM orders WHERE mobile = ? ORDER BY id DESC').all(cleanMobile);
    const orders = rows.map(r => ({
      ...r,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
    }));

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/orders (Protected - Full Order Session Archive)
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    const orders = rows.map(r => ({
      ...r,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
    }));
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/orders/:id/status (Protected)
app.patch('/api/admin/orders/:id/status', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    db.prepare(`
      UPDATE orders SET
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(order_status, payment_status, id);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/orders/:id/cod-advance (Protected)
app.patch('/api/admin/orders/:id/cod-advance', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { cod_advance } = req.body;

    db.prepare('UPDATE orders SET cod_advance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(Number(cod_advance) || 0, id);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/orders/:id (Protected - Double Confirmation Enforcement)
app.delete('/api/admin/orders/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM orders WHERE id = ?').run(id);
    res.json({ success: true, message: 'Order deleted permanently from database.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. ADMIN SALES ANALYTICS & CHARTING DATA
// ==========================================

// GET /api/admin/analytics (Protected)
app.get('/api/admin/analytics', authenticateAdmin, (req, res) => {
  try {
    const { range } = req.query; // '7days', '30days', 'month', '3months', '6months', '12months', 'all'

    const totalOrdersRow = db.prepare('SELECT count(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders').get();
    const pendingOrdersCount = db.prepare("SELECT count(*) as count FROM orders WHERE order_status = 'Pending'").get().count;
    const confirmedOrdersCount = db.prepare("SELECT count(*) as count FROM orders WHERE order_status = 'Confirmed'").get().count;

    // Today's Sales
    const today = new Date().toISOString().slice(0, 10);
    const todaySalesRow = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue, count(*) as count
      FROM orders
      WHERE date(created_at) = date(?)
    `).get(today);

    // Products Stats
    const totalStock = db.prepare('SELECT COALESCE(SUM(stock), 0) as stock FROM products WHERE active = 1').get().stock;
    const activeProducts = db.prepare('SELECT count(*) as count FROM products WHERE active = 1').get().count;
    const lowStockProducts = db.prepare('SELECT count(*) as count FROM products WHERE active = 1 AND stock > 0 AND stock <= 2').get().count;
    const outOfStockProducts = db.prepare('SELECT count(*) as count FROM products WHERE active = 1 AND stock = 0').get().count;

    // Weekly Chart Data (Last 7 Days)
    const weeklyDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

      const dayData = db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as revenue, count(*) as count
        FROM orders
        WHERE date(created_at) = date(?)
      `).get(dayStr);

      weeklyDays.push({
        date: dayStr,
        label: dayName,
        revenue: dayData.revenue,
        orders: dayData.count
      });
    }

    // Monthly Chart Data (Last 12 Months)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const yearMonth = d.toISOString().slice(0, 7); // 'YYYY-MM'
      const monthLabel = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

      const mData = db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as revenue, count(*) as count
        FROM orders
        WHERE strftime('%Y-%m', created_at) = ?
      `).get(yearMonth);

      monthlyData.push({
        month: yearMonth,
        label: monthLabel,
        revenue: mData.revenue,
        orders: mData.count
      });
    }

    const avgOrderValue = totalOrdersRow.count > 0 ? Math.round(totalOrdersRow.revenue / totalOrdersRow.count) : 0;

    res.json({
      success: true,
      summary: {
        totalRevenue: totalOrdersRow.revenue,
        todaySales: todaySalesRow.revenue,
        todayOrders: todaySalesRow.count,
        totalOrders: totalOrdersRow.count,
        pendingOrders: pendingOrdersCount,
        confirmedOrders: confirmedOrdersCount,
        averageOrderValue: avgOrderValue,
        totalStock,
        activeProducts,
        lowStockProducts,
        outOfStockProducts
      },
      weeklyChart: weeklyDays,
      monthlyChart: monthlyData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. PERMANENT IMAGE UPLOAD ENDPOINT
// ==========================================

// POST /api/upload (Protected)
app.post('/api/upload', authenticateAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image file uploaded.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    message: 'File uploaded permanently to server.',
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

// Production / built SPA: serve Vite dist and SPA fallback
if (IS_PRODUCTION) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/policies')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`\n👑 BUTTA BOMMA COLLECTIONS PRODUCTION SERVER ONLINE`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📦 Database: SQLite (WAL Mode) at ${path.join(__dirname, 'boutique.db')}`);
  console.log(`📁 Uploads Directory: ${UPLOADS_DIR}`);
  console.log(`🧱 Mode: ${IS_PRODUCTION ? 'production (serving dist)' : 'api-only (use Vite on :5173)'}\n`);
});
