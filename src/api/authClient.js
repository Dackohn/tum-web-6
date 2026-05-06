export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const VALID_ROLES = ['VISITOR', 'WRITER', 'ADMIN'];

function getUsername() {
  let username = localStorage.getItem('devqueue:username');
  if (!username) {
    username = 'user_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('devqueue:username', username);
  }
  return username;
}

function getRole() {
  const param = new URLSearchParams(window.location.search).get('role');
  if (param && VALID_ROLES.includes(param.toUpperCase())) return param.toUpperCase();
  return 'ADMIN';
}

let _loggedIn = false;

export function resetLogin() {
  _loggedIn = false;
}

export async function ensureLoggedIn() {
  if (_loggedIn) return;
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username: getUsername(), role: getRole() }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  _loggedIn = true;
}
