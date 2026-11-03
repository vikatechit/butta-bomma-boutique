export const BRAND = {
  name: 'Butta Bomma Collections',
  short: 'Butta Bomma',
  tagline: 'Royal Indian Ethnic Couture',
  siteUrl: 'https://buttabommaonline.com',
  whatsapp: '917382891980',
  whatsappDisplay: '+91 73828 91980',
  phone: '+917382891980',
  email: 'buttabommaonline@gmail.com',
  instagram: 'https://www.instagram.com/shirae_boutique?igsi=NWw0d2ZxdnhpdTQ3',
  instagramHandle: '@shirae_boutique',
  delivery: 'India • Pan-India Free Delivery',
  logo: '/logo.png',
};

const LEGACY_HASH_ROUTES = {
  '#home': '/',
  '#categories': '/categories',
  '#new-arrivals': '/shop',
  '#customization': '/customization',
  '#reviews-section': '/reviews',
  '#story': '/about',
  '#contact': '/contact',
};

/** Map links saved in the admin (old `#section` anchors or full paths) to a router path. */
export function toRoute(link, fallback = '/categories') {
  const v = String(link || '').trim();
  if (!v) return fallback;
  if (v.startsWith('#')) return LEGACY_HASH_ROUTES[v] || fallback;
  return v;
}

export function isExternal(link) {
  return /^https?:\/\//i.test(String(link || ''));
}

export function waLink(text, number = BRAND.whatsapp) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function money(n) {
  if (n == null || n === '' || Number.isNaN(Number(n))) return 'Price on request';
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
