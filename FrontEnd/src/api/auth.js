import apiFetch from './api';

export async function loginUser(data) {
  return apiFetch('/auth/login', 'POST', data);
}

export async function registerUser(data) {
  return apiFetch('/auth/register', 'POST', data);
}

export async function getProfile() {
  return apiFetch('/auth/profile', 'GET', null, true);
}

// New function for Google authentication
export async function loginWithGoogle(idToken) {
  // We send the Google ID token to our backend
  return apiFetch('/auth/google', 'POST', { token: idToken });
}


// Add more functions as needed (appointments, profile, etc.)
