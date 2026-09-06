/**
 * BUTTA BOMMA COLLECTIONS - DATABASE LAYER
 * Built on Node.js built-in SQLite (DatabaseSync)
 * Permanent zero-config ACID-compliant SQL storage with WAL mode
 *
 * Optional DATA_DIR (e.g. /var/data on Render disk) keeps boutique.db
 * across redeploys. Defaults to this server folder locally.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DATA_DIR = process.env.DATA_DIR || __dirname;
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'boutique.db');
const BUNDLED_DB = path.join(__dirname, 'boutique.db');
if (
  !fs.existsSync(DB_PATH) &&
  fs.existsSync(BUNDLED_DB) &&
  path.resolve(DB_PATH) !== path.resolve(BUNDLED_DB)
) {
  fs.copyFileSync(BUNDLED_DB, DB_PATH);
  console.log('📦 Seeded boutique.db into DATA_DIR:', DATA_DIR);
}

const db = new DatabaseSync(DB_PATH);

// Enable WAL mode & foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      stock INTEGER NOT NULL DEFAULT 0,
      badge TEXT DEFAULT 'NEW',
      sizes TEXT DEFAULT '["Standard"]',
      fabric TEXT,
      description TEXT,
      image_url TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT NOT NULL,
      label TEXT NOT NULL,
      link TEXT DEFAULT '#categories',
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'Cash On Delivery (COD)',
      payment_status TEXT NOT NULL DEFAULT 'Pending',
      order_status TEXT NOT NULL DEFAULT 'Pending',
      total_amount REAL NOT NULL,
      cod_advance REAL DEFAULT 0,
      notes TEXT,
      items TEXT NOT NULL DEFAULT '[]',
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      rating INTEGER NOT NULL,
      outfit TEXT NOT NULL,
      comment TEXT NOT NULL,
      media_url TEXT,
      is_video INTEGER DEFAULT 0,
      approved INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      whatsapp_number TEXT NOT NULL DEFAULT '917382891980',
      razorpay_payment_link TEXT DEFAULT 'https://rzp.io/l/buttabomma',
      upi_id TEXT DEFAULT 'buttabomma@upi',
      cod_enabled INTEGER DEFAULT 1,
      upi_enabled INTEGER DEFAULT 1,
      logo_url TEXT DEFAULT 'logo.png',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      cta TEXT NOT NULL DEFAULT 'EXPLORE →',
      image_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin if not exists (username: admin, pin: 1234)
  const adminRow = db.prepare('SELECT count(*) as count FROM admins').get();
  if (!adminRow || adminRow.count === 0) {
    const defaultHash = bcrypt.hashSync('1234', 10);
    db.prepare('INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)').run('admin', defaultHash, 'admin');
    console.log('👑 Default admin initialized: user=admin, pin=1234');
  }

  // Seed store settings if not exists
  const settingsRow = db.prepare('SELECT count(*) as count FROM store_settings').get();
  if (!settingsRow || settingsRow.count === 0) {
    db.prepare(`
      INSERT INTO store_settings (id, whatsapp_number, razorpay_payment_link, upi_id, cod_enabled, upi_enabled, logo_url)
      VALUES (1, '917382891980', 'https://rzp.io/l/buttabomma', 'buttabomma@upi', 1, 1, 'logo.png')
    `).run();
    console.log('⚙️ Store settings initialized.');
  }

  // Seed shop-by-category cards if empty
  const catRow = db.prepare('SELECT count(*) as count FROM categories').get();
  if (!catRow || catRow.count === 0) {
    const defaultCategories = [
      {
        slug: 'sarees',
        title: 'SAREES',
        cta: 'EXPLORE WEAVES \u2192',
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
        sort_order: 1,
      },
      {
        slug: 'lehengas',
        title: 'LEHENGAS',
        cta: 'BRIDAL & FESTIVE \u2192',
        image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
        sort_order: 2,
      },
      {
        slug: 'dresses',
        title: 'DRESSES',
        cta: 'ROYAL SILHOUETTES \u2192',
        image_url: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800&auto=format&fit=crop&q=80',
        sort_order: 3,
      },
      {
        slug: 'kurtis',
        title: 'KURTIS',
        cta: 'EVERYDAY LUXURY \u2192',
        image_url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&auto=format&fit=crop&q=80',
        sort_order: 4,
      },
      {
        slug: 'suits',
        title: 'SUITS',
        cta: 'ANARKALIS & SETS \u2192',
        image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&auto=format&fit=crop&q=80',
        sort_order: 5,
      },
      {
        slug: 'accessories',
        title: 'ACCESSORIES',
        cta: 'ROYAL JEWELLERY \u2192',
        image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
        sort_order: 6,
      },
    ];
    const insertCat = db.prepare(
      'INSERT INTO categories (slug, title, cta, image_url, sort_order) VALUES (?, ?, ?, ?, ?)'
    );
    for (const c of defaultCategories) {
      insertCat.run(c.slug, c.title, c.cta, c.image_url, c.sort_order);
    }
    console.log('🗂️ Shop categories initialized.');
  }

  // Seed default hero slides if empty
  const heroRow = db.prepare('SELECT count(*) as count FROM hero_slides').get();
  if (!heroRow || heroRow.count === 0) {
    const defaultSlides = [
      { image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80", label: "Royal Kanjeevaram", link: "#categories", sort_order: 1 },
      { image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80", label: "Bridal Lehengas", link: "#categories", sort_order: 2 },
      { image_url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=900&auto=format&fit=crop&q=80", label: "Festive Anarkalis", link: "#categories", sort_order: 3 },
      { image_url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=900&auto=format&fit=crop&q=80", label: "Tissue & Zari Silk", link: "#categories", sort_order: 4 },
      { image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&auto=format&fit=crop&q=80", label: "Royal Jewellery", link: "#categories", sort_order: 5 }
    ];
    const insertSlide = db.prepare('INSERT INTO hero_slides (image_url, label, link, sort_order) VALUES (?, ?, ?, ?)');
    for (const s of defaultSlides) {
      insertSlide.run(s.image_url, s.label, s.link, s.sort_order);
    }
    console.log('🖼️ Hero slides initialized.');
  }

  // Seed default products if empty
  const prodRow = db.prepare('SELECT count(*) as count FROM products').get();
  if (!prodRow || prodRow.count === 0) {
    const defaultProducts = [
      {
        name: "Banarasi Silk Saree",
        category: "sarees",
        price: 4299,
        original_price: 6999,
        stock: 7,
        badge: "NEW",
        sizes: JSON.stringify(["Free Size (Unstitched Blouse)"]),
        fabric: "Pure Katan Silk with Gold Zari Border",
        description: "Handcrafted Banarasi silk saree adorned with intricate floral jaal and rich pallu. Comes with matching unstitched blouse piece.",
        image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80"
      },
      {
        name: "Designer Bridal Lehenga",
        category: "lehengas",
        price: 8999,
        original_price: 14999,
        stock: 4,
        badge: "NEW",
        sizes: JSON.stringify(["XS", "S", "M", "L", "XL", "Custom Fit"]),
        fabric: "Raw Silk & Velvet with Zardozi Work",
        description: "Regal crimson lehenga featuring hand-embossed zardozi, sequins, and stone embellishments with double dupatta styling.",
        image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
      },
      {
        name: "Kanjivaram Celebration Saree",
        category: "sarees",
        price: 5499,
        original_price: 8499,
        stock: 5,
        badge: "NEW",
        sizes: JSON.stringify(["Free Size (Unstitched Blouse)"]),
        fabric: "Pure Mulberry Silk & Heavy Gold Zari",
        description: "Authentic temple-border Kanjivaram weave in deep jewel tones, woven with genuine gold-plated silver zari thread.",
        image_url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
      },
      {
        name: "Embroidered Suit Set",
        category: "suits",
        price: 3299,
        original_price: 5299,
        stock: 6,
        badge: "NEW",
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        fabric: "Chanderi Silk with Organza Dupatta",
        description: "Pastel blush pink anarkali kurta paired with churidar pants and a scalloped floral organza dupatta with gota patti.",
        image_url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&auto=format&fit=crop&q=80"
      },
      {
        name: "Anarkali Festive Dress",
        category: "dresses",
        price: 2999,
        original_price: 4599,
        stock: 5,
        badge: "NEW",
        sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]),
        fabric: "Georgette with Mirror & Zari Work",
        description: "Floor-length emerald green festive gown featuring flared kalis, intricate bodice embroidery and matching chiffon dupatta.",
        image_url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800&auto=format&fit=crop&q=80"
      },
      {
        name: "Handcrafted Cotton Kurti",
        category: "kurtis",
        price: 899,
        original_price: 1499,
        stock: 12,
        badge: "NEW",
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL", "3XL"]),
        fabric: "100% Breathable Malmal Cotton",
        description: "Sunny mustard yellow straight-fit kurti with hand-block Kalamkari motifs, wooden buttons and side slits for daily elegance.",
        image_url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&auto=format&fit=crop&q=80"
      },
      {
        name: "Emerald Zari Handloom Saree",
        category: "sarees",
        price: 24999,
        original_price: 32000,
        stock: 2,
        badge: "HEIRLOOM",
        sizes: JSON.stringify(["Free Size (Unstitched Blouse)"]),
        fabric: "Heritage Kanchipuram Pure Silk",
        description: "Exquisite heirloom piece with grand korvai border and contrast brocade pallu. Only 2 weaves handcrafted.",
        image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80"
      },
      {
        name: "Royal Gold Tissue Organza Lehenga",
        category: "lehengas",
        price: 34999,
        original_price: 45000,
        stock: 3,
        badge: "EXCLUSIVE",
        sizes: JSON.stringify(["XS", "S", "M", "L", "Custom Fit"]),
        fabric: "Metallic Tissue Silk & Pure Organza",
        description: "Luminous gold tissue lehenga with artisanal pearl and cutdana hand-embroidery. A statement bridal masterpiece.",
        image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
      },
      {
        name: "Midnight Sapphire Pre-Stitched Saree",
        category: "sarees",
        price: 12999,
        original_price: 18000,
        stock: 4,
        badge: "TRENDING",
        sizes: JSON.stringify(["Ready to Wear (Waist 26-38)"]),
        fabric: "Fluid Satin Silk with Embroidered Belt",
        description: "Contemporary 1-minute pre-draped saree with crystal-embellished border and a designer stitched blouse.",
        image_url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
      },
      {
        name: "Kundan & Temple Bridal Necklace Set",
        category: "accessories",
        price: 6499,
        original_price: 9999,
        stock: 5,
        badge: "ROYAL",
        sizes: JSON.stringify(["Adjustable Dori"]),
        fabric: "24K Gold Micron Plated Brass & Hydro Stones",
        description: "Handcrafted royal choker set with uncut polki kundan, green enameling and matching jhumka earrings.",
        image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80"
      }
    ];

    const insertProd = db.prepare(`
      INSERT INTO products (name, category, price, original_price, stock, badge, sizes, fabric, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of defaultProducts) {
      insertProd.run(p.name, p.category, p.price, p.original_price, p.stock, p.badge, p.sizes, p.fabric, p.description, p.image_url);
    }
    console.log('🛍️ Products catalog initialized with 10 luxury pieces.');
  }

  // Seed default reviews if empty
  const revRow = db.prepare('SELECT count(*) as count FROM reviews').get();
  if (!revRow || revRow.count === 0) {
    const defaultReviews = [
      {
        name: "Dr. Ananya Varma",
        city: "Hyderabad",
        rating: 5,
        outfit: "Banarasi Silk Saree (Emerald)",
        comment: "The Kanjeevaram silk saree is breathtaking! The weight of the pure silk, the luster of the gold zari, and the custom blouse stitching were beyond perfection for my sister's reception.",
        media_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"
      },
      {
        name: "Meera Krishnan",
        city: "Bangalore",
        rating: 5,
        outfit: "Designer Bridal Lehenga",
        comment: "Ordered this for my wedding sangeet. The zardozi work is so intricate and the flare is majestic! The team helped me with blouse sizing over WhatsApp promptly.",
        media_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"
      },
      {
        name: "Pooja Deshmukh",
        city: "Mumbai",
        rating: 5,
        outfit: "Blush Pink Anarkali Suit Set",
        comment: "The organza dupatta with scalloped borders is pure poetry. Lightweight yet so luxurious for festive celebrations. Received countless compliments!",
        media_url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&auto=format&fit=crop&q=80"
      },
      {
        name: "Radhika Singhania",
        city: "Delhi",
        rating: 5,
        outfit: "Royal Gold Tissue Organza",
        comment: "The shimmer of the tissue silk under evening lighting made me feel like royalty! Uncompromised craftsmanship. Will order again!",
        media_url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&auto=format&fit=crop&q=80"
      }
    ];

    const insertRev = db.prepare(`
      INSERT INTO reviews (name, city, rating, outfit, comment, media_url, approved)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    for (const r of defaultReviews) {
      insertRev.run(r.name, r.city, r.rating, r.outfit, r.comment, r.media_url);
    }
    console.log('⭐ Client reviews initialized.');
  }
}

initDatabase();

module.exports = db;
