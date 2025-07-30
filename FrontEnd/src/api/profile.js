import apiFetch from './api';

export async function getProfile() {
  return apiFetch('/auth/profile', 'GET', null, true);
}

// Add more functions as needed (appointments, profile, etc.)
