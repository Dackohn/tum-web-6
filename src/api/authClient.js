export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

let _onUnauthorized = null;

export function setUnauthorizedHandler(fn) {
  _onUnauthorized = fn;
}

export function notifyUnauthorized() {
  _onUnauthorized?.();
}

/** Check if there's a valid session cookie. Returns user info or null. */
export async function checkSession() {
  try {
    const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
    if (!res.ok) return null;
    return res.json(); // { username, role, permissions, app_version, issued_at, expires_at }
  } catch {
    return null;
  }
}

/** Log in with username + password — server sets an httpOnly cookie and returns user info. */
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 401) throw new Error('Invalid username or password.');
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json(); // { username, role, permissions, expires_in, app_version }
}

/** Clear the session cookie. */
export async function logout() {
  await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
