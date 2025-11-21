import apiFetch from './api';

export async function fetchUsers(status, role, searchTerm) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (role) params.append('role', role);
  if (searchTerm) params.append('searchTerm', searchTerm);
  
  const queryString = params.toString();
  const path = `/admin/users${queryString ? `?${queryString}` : ''}`;
  
  return apiFetch(path, 'GET', null, true);
}

export async function approveUser(userId) {
  return apiFetch(`/admin/users/${userId}/approve`, 'PUT', null, true);
}

export async function fetchAuditLogs(searchTerm, startDate, endDate) {
  const params = new URLSearchParams();
  if (searchTerm) params.append('searchTerm', searchTerm);
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());

  const queryString = params.toString();
  const path = `/admin/audit-logs${queryString ? `?${queryString}` : ''}`;

  return apiFetch(path, 'GET', null, true);
}

export async function reactivateUser(userId) {
  return apiFetch(`/admin/users/${userId}/reactivate`, 'PUT', null, true);
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

