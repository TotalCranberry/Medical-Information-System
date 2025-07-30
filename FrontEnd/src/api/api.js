const API_BASE = process.env.REACT_APP_API_BASE_URL;

async function apiFetch(path, method = 'GET', body = null, addAuth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (addAuth) {
    const token = localStorage.getItem('jwtToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return res.json();
}

export default apiFetch;
