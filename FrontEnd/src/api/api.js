const API_BASE = process.env.REACT_APP_API_BASE_URL;

async function apiFetch(path, method = 'GET', body = null, addAuth = true) {
  const headers = {};
  if (addAuth) {
    const token = localStorage.getItem('jwtToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let reqBody;
  if (body) {
    if (body instanceof FormData) {
      reqBody = body;
    } else {
      headers['Content-Type'] = 'application/json';
      reqBody = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    ...(reqBody && { body: reqBody }),
  });
  // Read response body once to handle empty/non-JSON responses safely
  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || res.statusText || 'Request failed');
  }

  // No content (e.g., 200 with empty body or 204)
  if (!text) return null;

  // Try JSON first, then fall back to plain text
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default apiFetch;
