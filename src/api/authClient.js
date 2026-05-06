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

// ── User management (ADMIN only) ────────────────────────────────────────────

export async function registerUser(username, password, role) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, role }),
  });
  if (res.status === 409) throw new Error(`User '${username}' already exists.`);
  if (res.status === 403) throw new Error('Admin access required.');
  if (!res.ok) throw new Error(`Registration failed: ${res.status}`);
  return res.json();
}

export async function listUsers() {
  const res = await fetch(`${API_BASE}/users`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load users: ${res.status}`);
  return res.json();
}

export async function deleteUser(username) {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status === 400) throw new Error("You can't delete your own account.");
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}
