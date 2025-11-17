import apiFetch from './api';

export async function fetchUsers(status = null) {
  const path = status ? `/admin/users?status=${status}` : '/admin/users';
  return apiFetch(path, 'GET', null, true);
}

export async function approveUser(userId) {
  return apiFetch(`/admin/users/${userId}/approve`, 'PUT', null, true);
}

export async function fetchAuditLogs() {
  return apiFetch('/admin/audit-logs', 'GET', null, true);
}

export async function editUserProfile(userId, profileData) {
  return apiFetch(`/admin/users/${userId}/profile`, 'PUT', profileData, true);
}

export async function disableUser(userId) {
  return apiFetch(`/admin/users/${userId}/disable`, 'PUT', null, true);
}

export async function resetPassword(userId) {
  return apiFetch(`/admin/users/${userId}/reset-password`, 'PUT', null, true);
}

