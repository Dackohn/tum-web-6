export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

let _onUnauthorized = null;

/** Called by apiAdapter when any request returns 401. */
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
    return res.json(); // { username, role, permissions }
  } catch {
    return null;
  }
}

/** Log in with a username and role — server sets an httpOnly cookie. */
export async function login(username, role) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, role }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json(); // { username, role, permissions, expires_in }
}

/** Clear the session cookie. */
export async function logout() {
  await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
