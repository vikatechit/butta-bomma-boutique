import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { handleUpload } from '@vercel/blob/client';
import { nextId, readDoc, readPublicCatalog, storageReady, writeDoc } from './_store.js';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  createHash('sha256').update(`bb-admin:${process.env.BLOB_READ_WRITE_TOKEN || 'local-dev'}`).digest('hex');

const UPLOAD_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic', 'image/heif',
  'video/mp4', 'video/quicktime', 'video/webm',
];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const now = () => new Date().toISOString();
const dayOf = (iso) => String(iso || '').slice(0, 10);
const isSet = (v) => v !== undefined && v !== null && v !== '';

function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function bearer(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function requireAdmin(req) {
  if (!bearer(req)) throw new HttpError(401, 'Access denied. No authorization token provided.');
  const admin = verifyToken(bearer(req));
  if (!admin) throw new HttpError(403, 'Invalid or expired session token. Please log in again.');
  return admin;
}

async function catalogFor(req) {
  return verifyToken(bearer(req)) ? readDoc('catalog') : readPublicCatalog();
}

function passwordMatches(password, admin) {
  if (admin?.passwordHash) return bcrypt.compareSync(String(password), admin.passwordHash);
  return String(password) === String(process.env.ADMIN_PASSWORD || '1234');
}

function cleanSizes(sizes) {
  if (Array.isArray(sizes) && sizes.length) return sizes;
  if (isSet(sizes)) return [String(sizes)];
  return ['Standard'];
}

const byOrder = (a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || a.id - b.id;

// ---------------------------------------------------------------------------

const routes = [];
const route = (method, pattern, fn) => {
  const keys = [];
  const regex = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)'))}$`);
  routes.push({ method, regex, keys, fn });
};

route('GET', 'health', async () => ({ status: 'ok', storage: storageReady() ? 'vercel-blob' : 'seed-only', time: now() }));

// Auth
route('POST', 'auth/login', async (req) => {
  const { username, password } = req.body || {};
  if (!username || !password) throw new HttpError(400, 'Username and passcode are required.');
  const { admin } = await readDoc('private');
  const expectedUser = admin?.username || 'admin';
  if (username !== expectedUser || !passwordMatches(password, admin)) {
    throw new HttpError(401, 'Invalid username or passcode.');
  }
  const token = jwt.sign({ username: expectedUser, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  return { message: 'Welcome to Butta Bomma Control Room.', token, admin: { username: expectedUser, role: 'admin' } };
});

route('GET', 'auth/verify', async (req) => ({ admin: requireAdmin(req) }));

route('POST', 'auth/change-password', async (req) => {
  requireAdmin(req);
  const { currentPassword, newPassword, newUsername } = req.body || {};
  if (!currentPassword || !newPassword) throw new HttpError(400, 'Current passcode and new passcode are required.');
  if (String(newPassword).length < 4) throw new HttpError(400, 'Use at least 4 characters for the new passcode.');
  const priv = await readDoc('private');
  if (!passwordMatches(currentPassword, priv.admin)) throw new HttpError(400, 'Current passcode is incorrect.');
  priv.admin = {
    username: newUsername?.trim() || priv.admin?.username || 'admin',
    passwordHash: bcrypt.hashSync(String(newPassword), 10),
  };
  await writeDoc('private', priv);
  return { message: 'Admin credentials updated successfully.' };
});

// Settings
route('GET', 'settings', async (req) => ({ settings: (await catalogFor(req)).settings || {} }));

route('PUT', 'admin/settings', async (req) => {
  requireAdmin(req);
  const catalog = await readDoc('catalog');
  const body = req.body || {};
  const next = { ...catalog.settings };
  for (const key of ['whatsapp_number', 'razorpay_payment_link', 'upi_id', 'logo_url']) {
    if (isSet(body[key])) next[key] = body[key];
  }
  for (const key of ['cod_enabled', 'upi_enabled']) {
    if (body[key] !== undefined) next[key] = body[key] ? 1 : 0;
  }
  catalog.settings = next;
  await writeDoc('catalog', catalog);
  return { message: 'Store settings updated successfully.', settings: next };
});

// Products
route('GET', 'products', async (req) => {
  const products = ((await catalogFor(req)).products || [])
    .filter((p) => p.active !== 0)
    .map((p) => ({ ...p, sizes: cleanSizes(p.sizes) }))
    .sort((a, b) => b.id - a.id);
  return { products };
});

route('POST', 'products', async (req) => {
  requireAdmin(req);
  const b = req.body || {};
  if (!b.name || b.price === undefined || !b.image_url) {
    throw new HttpError(400, 'Product name, price, and image are required.');
  }
  const catalog = await readDoc('catalog');
  const product = {
    id: nextId(catalog.products),
    name: b.name,
    category: b.category || 'sarees',
    price: Number(b.price),
    original_price: isSet(b.original_price) ? Number(b.original_price) : null,
    stock: parseInt(b.stock, 10) || 0,
    badge: b.badge || 'NEW',
    sizes: cleanSizes(b.sizes),
    fabric: b.fabric || '',
    description: b.description || '',
    image_url: b.image_url,
    active: 1,
    created_at: now(),
    updated_at: now(),
  };
  catalog.products = [product, ...(catalog.products || [])];
  await writeDoc('catalog', catalog);
  return { message: 'Product published to catalog.', product };
});

route('PUT', 'products/:id', async (req, { id }) => {
  requireAdmin(req);
  const b = req.body || {};
  const catalog = await readDoc('catalog');
  const product = catalog.products.find((p) => String(p.id) === id);
  if (!product) throw new HttpError(404, 'Product not found.');
  for (const key of ['name', 'category', 'badge', 'fabric', 'description', 'image_url']) {
    if (isSet(b[key])) product[key] = b[key];
  }
  if (isSet(b.price)) product.price = Number(b.price);
  if (b.original_price !== undefined) product.original_price = isSet(b.original_price) ? Number(b.original_price) : null;
  if (isSet(b.stock)) product.stock = Math.max(0, parseInt(b.stock, 10) || 0);
  if (isSet(b.sizes)) product.sizes = cleanSizes(b.sizes);
  product.updated_at = now();
  await writeDoc('catalog', catalog);
  return { message: 'Product updated successfully.', product };
});

route('PATCH', 'products/:id/stock', async (req, { id }) => {
  requireAdmin(req);
  const { stock, delta } = req.body || {};
  const catalog = await readDoc('catalog');
  const product = catalog.products.find((p) => String(p.id) === id);
  if (!product) throw new HttpError(404, 'Product not found.');
  if (stock !== undefined) product.stock = Math.max(0, parseInt(stock, 10) || 0);
  else if (delta !== undefined) product.stock = Math.max(0, (Number(product.stock) || 0) + (parseInt(delta, 10) || 0));
  product.updated_at = now();
  await writeDoc('catalog', catalog);
  return { stock: product.stock };
});

route('DELETE', 'products/:id', async (req, { id }) => {
  requireAdmin(req);
  const catalog = await readDoc('catalog');
  catalog.products = catalog.products.filter((p) => String(p.id) !== id);
  await writeDoc('catalog', catalog);
  return { message: 'Product deleted permanently.' };
});

// Categories
route('GET', 'categories', async (req) => ({
  categories: ((await catalogFor(req)).categories || []).filter((c) => c.active !== 0).sort(byOrder),
}));

route('PUT', 'categories/:id', async (req, { id }) => {
  requireAdmin(req);
  const b = req.body || {};
  const catalog = await readDoc('catalog');
  const category = catalog.categories.find((c) => String(c.id) === id);
  if (!category) throw new HttpError(404, 'Category not found.');
  for (const key of ['image_url', 'title', 'cta']) if (isSet(b[key])) category[key] = b[key];
  if (isSet(b.sort_order)) category.sort_order = parseInt(b.sort_order, 10) || 0;
  category.updated_at = now();
  await writeDoc('catalog', catalog);
  return { message: 'Category updated successfully.', category };
});

// Hero slides
route('GET', 'hero-slides', async (req) => ({
  slides: ((await catalogFor(req)).heroSlides || []).filter((s) => s.active !== 0).sort(byOrder),
}));

route('POST', 'hero-slides', async (req) => {
  requireAdmin(req);
  const { image_url, label, link, sort_order } = req.body || {};
  if (!image_url || !label) throw new HttpError(400, 'Hero slide image and label are required.');
  const catalog = await readDoc('catalog');
  const slide = {
    id: nextId(catalog.heroSlides),
    image_url,
    label,
    link: link || '/categories',
    sort_order: parseInt(sort_order, 10) || 0,
    active: 1,
    created_at: now(),
  };
  catalog.heroSlides = [...(catalog.heroSlides || []), slide];
  await writeDoc('catalog', catalog);
  return { message: 'Hero slide added successfully.', slide };
});

route('PUT', 'hero-slides/:id', async (req, { id }) => {
  requireAdmin(req);
  const b = req.body || {};
  const catalog = await readDoc('catalog');
  const slide = catalog.heroSlides.find((s) => String(s.id) === id);
  if (!slide) throw new HttpError(404, 'Hero slide not found.');
  for (const key of ['image_url', 'label', 'link']) if (isSet(b[key])) slide[key] = b[key];
  if (isSet(b.sort_order)) slide.sort_order = parseInt(b.sort_order, 10) || 0;
  slide.updated_at = now();
  await writeDoc('catalog', catalog);
  return { message: 'Hero slide updated successfully.', slide };
});

route('DELETE', 'hero-slides/:id', async (req, { id }) => {
  requireAdmin(req);
  const catalog = await readDoc('catalog');
  if ((catalog.heroSlides || []).length <= 1) throw new HttpError(400, 'You must keep at least 1 hero slide.');
  catalog.heroSlides = catalog.heroSlides.filter((s) => String(s.id) !== id);
  await writeDoc('catalog', catalog);
  return { message: 'Hero slide deleted.' };
});

// Reviews
route('GET', 'reviews', async (req) => ({
  reviews: ((await catalogFor(req)).reviews || []).filter((r) => r.approved !== 0).sort((a, b) => b.id - a.id),
}));

route('POST', 'reviews', async (req) => {
  const { name, city, rating, outfit, comment, media_url, is_video } = req.body || {};
  if (!name || !city || !rating || !outfit || !comment) {
    throw new HttpError(400, 'Please fill in all required review fields.');
  }
  const catalog = await readDoc('catalog');
  const review = {
    id: nextId(catalog.reviews),
    name: String(name).slice(0, 80),
    city: String(city).slice(0, 80),
    rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
    outfit: String(outfit).slice(0, 120),
    comment: String(comment).slice(0, 1500),
    media_url: String(media_url || '').startsWith('https://') ? media_url : null,
    is_video: is_video ? 1 : 0,
    approved: 1,
    created_at: now(),
  };
  catalog.reviews = [review, ...(catalog.reviews || [])];
  await writeDoc('catalog', catalog);
  return { message: 'Thank you! Your review has been added to our client diaries.', review };
});

route('DELETE', 'reviews/:id', async (req, { id }) => {
  requireAdmin(req);
  const catalog = await readDoc('catalog');
  catalog.reviews = catalog.reviews.filter((r) => String(r.id) !== id);
  await writeDoc('catalog', catalog);
  return { message: 'Review deleted successfully.' };
});

// Orders
route('POST', 'orders', async (req) => {
  const { customer_name, mobile, address, city, pincode, payment_method, notes, items } = req.body || {};
  if (!customer_name || !mobile || !address || !city || !pincode || !Array.isArray(items) || !items.length) {
    throw new HttpError(400, 'Customer details and items are required.');
  }
  const cleanMobile = String(mobile).replace(/\D/g, '');
  if (cleanMobile.length !== 10) throw new HttpError(400, 'Please provide a valid 10-digit mobile number.');

  const catalog = await readDoc('catalog');
  let total = 0;
  const validated = items.map((item) => {
    const product = catalog.products.find((p) => String(p.id) === String(item.id) && p.active !== 0);
    if (!product) throw new HttpError(400, `Product ID #${item.id} is no longer available.`);
    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    if ((Number(product.stock) || 0) < qty) {
      throw new HttpError(400, `Insufficient stock for "${product.name}". Only ${product.stock} available.`);
    }
    product.stock = Number(product.stock) - qty;
    total += Number(product.price) * qty;
    return { id: product.id, name: product.name, price: product.price, size: item.size || 'Standard', qty };
  });

  const isCod = String(payment_method || '').includes('COD');
  const priv = await readDoc('private');
  const order = {
    id: nextId(priv.orders),
    order_number: `BB${Date.now().toString().slice(-6)}`,
    customer_name: String(customer_name).slice(0, 120),
    mobile: cleanMobile,
    address: String(address).slice(0, 400),
    city: String(city).slice(0, 120),
    pincode: String(pincode).slice(0, 10),
    payment_method: payment_method || 'Cash On Delivery (COD)',
    payment_status: isCod ? 'COD' : 'Pending',
    order_status: 'Pending',
    total_amount: total,
    cod_advance: isCod ? Math.min(500, Math.round(total * 0.15)) : 0,
    notes: String(notes || '').slice(0, 500),
    items: validated,
    created_at: now(),
    updated_at: now(),
  };
  await writeDoc('catalog', catalog);
  priv.orders = [order, ...(priv.orders || [])];
  await writeDoc('private', priv);
  return { message: 'Order created successfully.', order };
});

route('POST', 'orders/lookup', async (req) => {
  const cleanMobile = String(req.body?.mobile || '').replace(/\D/g, '');
  if (cleanMobile.length !== 10) throw new HttpError(400, 'Please enter a valid 10-digit mobile number.');
  const { orders } = await readDoc('private');
  return { orders: (orders || []).filter((o) => o.mobile === cleanMobile) };
});

route('GET', 'admin/orders', async (req) => {
  requireAdmin(req);
  const { orders } = await readDoc('private');
  return { orders: [...(orders || [])].sort((a, b) => b.id - a.id) };
});

async function patchOrder(id, patch) {
  const priv = await readDoc('private');
  const order = (priv.orders || []).find((o) => String(o.id) === id);
  if (!order) throw new HttpError(404, 'Order not found.');
  Object.assign(order, patch, { updated_at: now() });
  await writeDoc('private', priv);
  return { order };
}

route('PATCH', 'admin/orders/:id/status', async (req, { id }) => {
  requireAdmin(req);
  const { order_status, payment_status } = req.body || {};
  const patch = {};
  if (isSet(order_status)) patch.order_status = order_status;
  if (isSet(payment_status)) patch.payment_status = payment_status;
  return patchOrder(id, patch);
});

route('PATCH', 'admin/orders/:id/cod-advance', async (req, { id }) => {
  requireAdmin(req);
  return patchOrder(id, { cod_advance: Number(req.body?.cod_advance) || 0 });
});

route('DELETE', 'admin/orders/:id', async (req, { id }) => {
  requireAdmin(req);
  const priv = await readDoc('private');
  priv.orders = (priv.orders || []).filter((o) => String(o.id) !== id);
  await writeDoc('private', priv);
  return { message: 'Order deleted permanently.' };
});

// Analytics
route('GET', 'admin/analytics', async (req) => {
  requireAdmin(req);
  const [{ orders = [] }, catalog] = await Promise.all([readDoc('private'), readDoc('catalog')]);
  const products = (catalog.products || []).filter((p) => p.active !== 0);
  const sum = (list) => list.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
  const today = dayOf(now());
  const todays = orders.filter((o) => dayOf(o.created_at) === today);

  const weeklyChart = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => dayOf(o.created_at) === date);
    weeklyChart.push({
      date,
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      revenue: sum(dayOrders),
      orders: dayOrders.length,
    });
  }

  const monthlyChart = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const month = d.toISOString().slice(0, 7);
    const monthOrders = orders.filter((o) => String(o.created_at || '').slice(0, 7) === month);
    monthlyChart.push({
      month,
      label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      revenue: sum(monthOrders),
      orders: monthOrders.length,
    });
  }

  const totalRevenue = sum(orders);
  return {
    summary: {
      totalRevenue,
      todaySales: sum(todays),
      todayOrders: todays.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.order_status === 'Pending').length,
      confirmedOrders: orders.filter((o) => o.order_status === 'Confirmed').length,
      averageOrderValue: orders.length ? Math.round(totalRevenue / orders.length) : 0,
      totalStock: products.reduce((s, p) => s + (Number(p.stock) || 0), 0),
      activeProducts: products.length,
      lowStockProducts: products.filter((p) => p.stock > 0 && p.stock <= 2).length,
      outOfStockProducts: products.filter((p) => Number(p.stock) === 0).length,
    },
    weeklyChart,
    monthlyChart,
  };
});

// Direct-to-Blob uploads: admins upload anywhere; shoppers may only upload review media.
route('POST', 'upload', async (req, _params, res) => {
  const result = await handleUpload({
    body: req.body,
    request: req,
    onBeforeGenerateToken: async (pathname, clientPayload) => {
      if (!pathname.startsWith('reviews/') && !verifyToken(clientPayload)) {
        throw new Error('Unauthorized upload.');
      }
      return {
        allowedContentTypes: UPLOAD_TYPES,
        maximumSizeInBytes: 50 * 1024 * 1024,
        addRandomSuffix: true,
      };
    },
    onUploadCompleted: async () => {},
  });
  res.status(200).json(result);
  return undefined;
});

// ---------------------------------------------------------------------------

function resolvePath(req) {
  const url = new URL(req.url, 'http://localhost');
  const fromQuery = url.searchParams.get('path');
  const fromPath = url.pathname.replace(/^\/api\/?/, '');
  const raw = fromPath && fromPath !== 'router' ? fromPath : fromQuery || '';
  return raw.replace(/^\/+|\/+$/g, '');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const path = resolvePath(req);
  const method = req.method === 'HEAD' ? 'GET' : req.method;

  for (const r of routes) {
    if (r.method !== method) continue;
    const match = r.regex.exec(path);
    if (!match) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]));
    try {
      const data = await r.fn(req, params, res);
      if (data !== undefined) res.status(200).json({ success: true, ...data });
    } catch (err) {
      const status = err.status || (/unauthori[sz]ed/i.test(err.message) ? 401 : 500);
      res.status(status).json({ success: false, error: err.message || 'Server error.' });
    }
    return;
  }
  res.status(404).json({ success: false, error: `No API route for ${method} /api/${path}` });
}
