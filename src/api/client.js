const API_BASE = '';

export function getAdminToken() {
  return sessionStorage.getItem('bb_admin_token') || localStorage.getItem('bb_admin_token');
}

export function setAdminToken(token) {
  sessionStorage.setItem('bb_admin_token', token);
}

export function clearAdminToken() {
  sessionStorage.removeItem('bb_admin_token');
  localStorage.removeItem('bb_admin_token');
}

function authHeaders(auth = false) {
  const headers = {};
  if (auth) {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok && data.error) {
    const err = new Error(data.error);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(true),
  });
  return parseJson(res);
}

export async function apiPost(path, body, { auth = false } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(auth),
    },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function apiPut(path, body, { auth = false } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(auth),
    },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function apiPatch(path, body, { auth = false } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(auth),
    },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function apiDelete(path, { auth = false } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: authHeaders(auth),
  });
  return parseJson(res);
}

/** Upload straight to Vercel Blob. Only the `reviews` folder is open to shoppers. */
export async function uploadFile(file, folder = 'media') {
  const safeName = String(file.name || 'upload').replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-60);
  try {
    const { upload } = await import('@vercel/blob/client');
    const blob = await upload(`${folder}/${safeName}`, file, {
      access: 'public',
      handleUploadUrl: `${API_BASE}/api/upload`,
      clientPayload: getAdminToken() || '',
    });
    return { success: true, url: blob.url };
  } catch (err) {
    return { success: false, error: err.message || 'Upload failed.' };
  }
}
