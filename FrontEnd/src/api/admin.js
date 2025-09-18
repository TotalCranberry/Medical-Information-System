import apiFetch from './api';

export async function fetchUsers(status = null) {
  const path = status ? `/admin/users?status=${status}` : '/admin/users';
  return apiFetch(path, 'GET', null, true);
}

export async function approveUser(userId) {
  return apiFetch(`/admin/users/${userId}/approve`, 'PUT', null, true);
}

