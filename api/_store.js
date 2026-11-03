import { del, list, put } from '@vercel/blob';
import seed from './_seed.js';

// Authoritative documents use random-suffix pathnames (unguessable, never CDN-stale).
// The catalogue is also mirrored to a fixed public path so storefront reads avoid list() calls.
const DOC_PREFIX = { catalog: 'data/catalog', private: 'data/private' };
const PUBLIC_CATALOG = 'public/catalog.json';
const KEEP_VERSIONS = 3;
const MEMO_TTL_MS = 15000;

let memo = { at: 0, data: null };

function seedCatalog() {
  return structuredClone(seed);
}

function emptyPrivate() {
  return { orders: [], admin: { username: 'admin', passwordHash: '' } };
}

export function storageReady() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function blobBaseUrl() {
  if (process.env.BLOB_BASE_URL) return process.env.BLOB_BASE_URL.replace(/\/+$/, '');
  const parts = String(process.env.BLOB_READ_WRITE_TOKEN || '').split('_');
  return parts.length >= 5 ? `https://${parts[3].toLowerCase()}.public.blob.vercel-storage.com` : '';
}

async function versions(name) {
  const { blobs } = await list({ prefix: DOC_PREFIX[name], limit: 100 });
  return (blobs || []).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

export async function readDoc(name) {
  const fallback = name === 'catalog' ? seedCatalog() : emptyPrivate();
  if (!storageReady()) return fallback;
  const blobs = await versions(name);
  if (!blobs.length) return fallback;
  const res = await fetch(blobs[0].url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not read store data.');
  return res.json();
}

export async function writeDoc(name, data) {
  if (!storageReady()) throw new Error('Storage is not connected. Add a Vercel Blob store to this project.');
  const body = JSON.stringify({ ...data, updatedAt: new Date().toISOString() });
  await put(`${DOC_PREFIX[name]}.json`, body, {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'application/json',
  });
  if (name === 'catalog') {
    await put(PUBLIC_CATALOG, body, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: 'application/json',
    });
    memo = { at: Date.now(), data: JSON.parse(body) };
  }
  const old = (await versions(name)).slice(KEEP_VERSIONS);
  if (old.length) await del(old.map((b) => b.url)).catch(() => {});
  return JSON.parse(body);
}

export async function readPublicCatalog() {
  if (memo.data && Date.now() - memo.at < MEMO_TTL_MS) return memo.data;
  let data = null;
  const base = blobBaseUrl();
  if (base) {
    try {
      const res = await fetch(`${base}/${PUBLIC_CATALOG}`, { cache: 'no-store' });
      if (res.ok) data = await res.json();
    } catch {
      /* fall back below */
    }
  }
  if (!data && storageReady()) data = await readDoc('catalog').catch(() => null);
  if (!data) data = seedCatalog();
  memo = { at: Date.now(), data };
  return data;
}

export function nextId(items) {
  return (items || []).reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}
