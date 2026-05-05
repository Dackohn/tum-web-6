const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const VALID_ROLES = ['VISITOR', 'WRITER', 'ADMIN'];

function resolveRole() {
  const param = new URLSearchParams(window.location.search).get('role');
  if (param && VALID_ROLES.includes(param.toUpperCase())) return param.toUpperCase();
  return 'ADMIN';
}

let _token = null;
let _refreshTimer = null;

async function fetchToken() {
  const res = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: resolveRole() }),
  });
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  const data = await res.json();
  _token = data.access_token;
  clearTimeout(_refreshTimer);
  _refreshTimer = setTimeout(fetchToken, (data.expires_in - 5) * 1000);
  return _token;
}

export async function getToken() {
  if (!_token) await fetchToken();
  return _token;
}
