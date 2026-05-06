import { API_BASE, ensureLoggedIn, resetLogin } from './authClient.js';

async function request(method, path, body) {
  await ensureLoggedIn();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  if (res.status === 401) {
    // Cookie expired — re-login and retry once
    resetLogin();
    await ensureLoggedIn();
    const retry = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!retry.ok) throw new Error(`API ${method} ${path} → ${retry.status}`);
    return retry.status === 204 ? null : retry.json();
  }
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`);
  return res.json();
}

async function fetchAll(path) {
  const first = await request('GET', `${path}?limit=200&offset=0`);
  const items = [...first.items];
  let offset = items.length;
  while (offset < first.total) {
    const page = await request('GET', `${path}?limit=200&offset=${offset}`);
    items.push(...page.items);
    offset += page.items.length;
  }
  return items;
}

function createApiStore(path) {
  return {
    async getAll() {
      return fetchAll(path);
    },

    async create(item) {
      return request('POST', path, item);
    },

    async update(id, changes) {
      const current = await request('GET', `${path}/${id}`);
      return request('PUT', `${path}/${id}`, { ...current, ...changes });
    },

    async remove(id) {
      return request('DELETE', `${path}/${id}`);
    },

    async replace(items) {
      const existing = await fetchAll(path);
      await Promise.all(existing.map(e => request('DELETE', `${path}/${e.id}`)));
      return Promise.all(items.map(item => request('POST', path, item)));
    },
  };
}

export const resourceAdapter = createApiStore('/resources');
export const folderAdapter   = createApiStore('/folders');
