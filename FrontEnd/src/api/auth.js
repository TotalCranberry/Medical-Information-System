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
  return apiFetch('/auth/google', 'POST', { token: idToken });
}

export async function changePassword(data) {
  return apiFetch('/profile/change-password', 'PUT', data, true);
}

export async function updateProfile(data) {
  return apiFetch('/profile/update', 'PUT', data, true);
}
