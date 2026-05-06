export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

let _onUnauthorized = null;

export function setUnauthorizedHandler(fn) { _onUnauthorized = fn; }
export function notifyUnauthorized()       { _onUnauthorized?.(); }

export async function checkSession() {
  try {
    const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 401) throw new Error('Invalid username or password.');
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json();
}

export async function registerAdmin(username, password) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 409) throw new Error(`Username "${username}" is already taken.`);
  if (!res.ok) throw new Error(`Registration failed: ${res.status}`);
  return res.json();
}

export async function logout() {
  await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
}

// ── Workspace member management (ADMIN only) ─────────────────────────────────

export async function addMember(username, password, role) {
  const res = await fetch(`${API_BASE}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, role }),
  });
  if (res.status === 409) throw new Error(`Username "${username}" is already taken.`);
  if (!res.ok) throw new Error(`Failed to add member: ${res.status}`);
  return res.json();
}

export async function listMembers() {
  const res = await fetch(`${API_BASE}/members`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load members: ${res.status}`);
  return res.json();
}

export async function deleteMember(username) {
  const res = await fetch(`${API_BASE}/members/${encodeURIComponent(username)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status === 400) throw new Error("You can't remove yourself.");
  if (!res.ok) throw new Error(`Remove failed: ${res.status}`);
}
