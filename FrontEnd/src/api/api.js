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
  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) {
      console.error("Session expired or invalid. Redirecting to login.");
      
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userRole'); 
      
      window.location.replace('/login');
      
      return Promise.reject(new Error("Session expired. Please log in again."));
    }
    throw new Error(text || res.statusText || 'Request failed');
  }

  if (!text) return null;
  
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default apiFetch;
