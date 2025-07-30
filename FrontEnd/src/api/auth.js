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

// Add more functions as needed (appointments, profile, etc.)
